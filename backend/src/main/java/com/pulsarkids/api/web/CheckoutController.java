package com.pulsarkids.api.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.pulsarkids.api.core.Catalog;
import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.BillingPeriod;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.model.Lang;
import com.pulsarkids.api.model.Wire;
import com.pulsarkids.api.service.BillingService;
import com.pulsarkids.api.service.MarketingService;
import com.stripe.exception.StripeException;
import jakarta.servlet.http.HttpServletRequest;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Paying for a plan — Stripe's embedded Checkout, shown in the site's window
 * of prices. Public, any origin may ask (only `Content-Type`, no session):
 *
 *   POST /api/billing/checkout  { plan, period: "month"|"year", children, region?, lang? }
 *        → { sessionId, clientSecret, publishableKey }
 *   GET  /api/billing/checkout?session=cs_…  → { status, email }   how it ended
 *
 * The region is the visitor's country's (`x-vercel-ip-country`); `region` from
 * the page counts only where the country is not known (off Vercel). The prices
 * are Stripe's, found by the order (`Catalog.order`) — the page names a plan,
 * a period and a number of children, never an amount. Off while the paid mode
 * is off or Stripe has no key: 503 `billing_off`.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(Routes.BILLING_CHECKOUT)
public class CheckoutController extends ApiController {
  /** What a Checkout Session's id looks like. */
  private static final Pattern SESSION_ID = Pattern.compile("^cs_(test|live)_[A-Za-z0-9]{10,200}$");

  private final BillingService billing;
  private final MarketingService marketing;

  private void requireOn() {
    if (!billing.configured() || !marketing.paidModeOn()) throw new HttpError(ApiError.BILLING_OFF);
  }

  @PostMapping
  public ResponseEntity<Object> start(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
    requireOn();
    BillingPeriod period = Wire.of(BillingPeriod.class, Json.at(body, Fields.PERIOD));
    String planId = Json.text(Json.at(body, Fields.PLAN));
    JsonNode rawChildren = Json.at(body, Fields.CHILDREN);
    if (planId == null || period == null) throw new HttpError(ApiError.INVALID_PLAN);
    if (!Json.isInt(rawChildren)) throw new HttpError(ApiError.INVALID_CHILDREN);
    try {
      Catalog.View view = billing.catalog();
      Catalog.Region region = Catalog.regionFor(view.regions(), Requests.country(request));
      String regionId = region != null ? region.id() : Json.text(Json.at(body, Fields.REGION));
      if (regionId == null) regionId = view.regions().stream().filter(Catalog.Region::fallback).map(Catalog.Region::id).findFirst().orElse(null);
      Catalog.OrderResult result = Catalog.order(view, planId, regionId, period, (int) Json.intOf(rawChildren));
      if (result.refusal() == Catalog.Refusal.BAD_CHILDREN) throw new HttpError(ApiError.INVALID_CHILDREN);
      if (result.order() == null) throw new HttpError(ApiError.INVALID_PLAN);
      // Checkout speaks the page's language when the page names it.
      Lang lang = Wire.of(Lang.class, Json.at(body, Fields.LANG), messages.lang());
      BillingService.Started started = billing.startCheckout(result.order(), lang);
      return fresh(Json.map(Fields.SESSION_ID, started.sessionId(), Fields.CLIENT_SECRET, started.clientSecret(), Fields.PUBLISHABLE_KEY, billing.publishableKey()));
    } catch (StripeException err) {
      log.error("[billing] checkout not begun: {}", err.getMessage());
      throw new HttpError(ApiError.BILLING_UNREACHABLE);
    }
  }

  @GetMapping
  public ResponseEntity<Object> status(@RequestParam(name = Fields.SESSION, required = false) String sessionId) {
    requireOn();
    if (sessionId == null || !SESSION_ID.matcher(sessionId).matches()) throw new HttpError(ApiError.INVALID_SESSION);
    try {
      return fresh(billing.checkoutStatus(sessionId));
    } catch (StripeException err) {
      log.error("[billing] checkout not read: {}", err.getMessage());
      throw new HttpError(ApiError.INVALID_SESSION);
    }
  }

  private static ResponseEntity<Object> fresh(Object body) {
    return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(body);
  }
}
