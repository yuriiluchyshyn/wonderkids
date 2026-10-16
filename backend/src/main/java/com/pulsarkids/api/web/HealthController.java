package com.pulsarkids.api.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.pulsarkids.api.core.Env;
import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.core.Marketing;
import com.pulsarkids.api.core.Secrets;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.model.LinkMode;
import com.pulsarkids.api.model.VisitEvent;
import com.pulsarkids.api.model.Wire;
import com.pulsarkids.api.service.MarketingService;
import com.pulsarkids.api.service.SchemaService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Liveness probe, what is offered to the visitor, and the public counting of
 * arrivals. Open to any origin: the public site asks here too.
 *
 *   GET  /api/health  → { ok, country, availability, features: { paid } }
 *   POST /api/health  { link?, mode, via?, lang?, referrer? }  an arrival by one of the
 *                     owner's links, or into the trial game → { ok, demoMinutes, visit?, token? }
 *   PUT  /api/health  { visit, token, event }                  how that trial game ended
 *
 * `country` (ISO 3166-1 alpha-2, or null off Vercel) is where the request came
 * from, as Vercel's edge saw it: the app offers the language of that country
 * to a visitor who has not chosen one. `availability` is what the owner offers
 * there (`Availability`) — never the rules themselves. `features.paid` says
 * whether the paid mode is on (the owner's switch in `/admin/settings`): off,
 * the site shows nothing of prices and the game nothing of paying.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(Routes.HEALTH)
public class HealthController extends ApiController {
  /** What a visit's ticket and a visitor's hash are made from. */
  private static final String TICKET = "visit:";
  private static final String VISITOR = ":visitor:";

  private final MarketingService marketing;
  private final SchemaService schema;

  /** Lets the browser that made a visit — and nobody else — say what became of it. */
  private static String visitToken(long id) {
    return Secrets.ticket(TICKET + id);
  }

  /** A visitor is kept only as a hash of the address — enough to count different people. */
  private static String visitorHash(HttpServletRequest request) {
    return Secrets.sha256Hex(Env.jwtSecret() + VISITOR + Requests.clientIp(request)).substring(0, 32);
  }

  private static ResponseEntity<Object> fresh(Object... pairs) {
    return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(Json.map(pairs));
  }

  @GetMapping
  public ResponseEntity<Object> health(HttpServletRequest request) {
    String country = Requests.country(request);
    return fresh(Fields.OK, true, Fields.COUNTRY, country, Fields.AVAILABILITY, marketing.availabilityOf(country),
        Fields.FEATURES, Json.map(Fields.PAID, marketing.paidModeOn()));
  }

  /**
   * The trial game is always counted (a link it does not know is dropped, the
   * visit stays); the site only by a link that exists. `visit` + `token` let the
   * same browser report later how the trial game ended.
   */
  @PostMapping
  public ResponseEntity<Object> visitArrives(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
    schema.ensure();
    Marketing.Visit visit = Marketing.cleanVisit(body);
    int minutes = marketing.demoMinutes();
    boolean known = visit.link() != null && marketing.linkExists(visit.link());
    if (!known) visit = visit.withLink(null);
    if (visit.mode() == LinkMode.SITE && !known) return fresh(Fields.OK, true, Fields.DEMO_MINUTES, minutes);

    String visitor = visitorHash(request);
    if (marketing.countRecentVisits(visitor) >= Marketing.MAX_VISITS_PER_HOUR) return fresh(Fields.OK, true, Fields.DEMO_MINUTES, minutes);

    long id = marketing.recordVisit(visit, Requests.country(request), Marketing.deviceOf(Requests.userAgent(request)), visitor);
    return fresh(Fields.OK, true, Fields.DEMO_MINUTES, minutes, Fields.VISIT, id, Fields.TOKEN, visitToken(id));
  }

  /** What became of a trial game: `expired` or `cta`. */
  @PutMapping
  public ResponseEntity<Object> visitGoesOn(@RequestBody(required = false) JsonNode body) {
    JsonNode visit = Json.at(body, Fields.VISIT);
    if (!Json.isInt(visit) || !Secrets.safeEqual(Json.text(Json.at(body, Fields.TOKEN)), visitToken(Json.intOf(visit)))) throw new HttpError(ApiError.INVALID_TICKET);
    VisitEvent event = Wire.of(VisitEvent.class, Json.at(body, Fields.EVENT));
    if (event == null) throw new HttpError(ApiError.INVALID_EVENT);
    schema.ensure();
    marketing.markVisit(Json.intOf(visit), event);
    return fresh(Fields.OK, true);
  }
}
