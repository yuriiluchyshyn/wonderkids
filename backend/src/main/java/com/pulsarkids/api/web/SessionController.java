package com.pulsarkids.api.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.pulsarkids.api.core.Auth;
import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.core.ScreenTime;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.model.SessionEnd;
import com.pulsarkids.api.model.Wire;
import com.pulsarkids.api.service.SchemaService;
import com.pulsarkids.api.service.ScreenTimeService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Play time — the server, not the browser, owns the budget (PRD v4.0 §2.2).
 * Every call answers with what is left for that child profile
 * (`remaining_time_seconds`, … — see `ScreenTime.describe`).
 *
 * A child session can only ever touch its own profile (taken from the token).
 * A parent session names the child with `child_profile_id`.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(Routes.V1_SESSION)
public class SessionController extends ApiController {
  /** One of the pure functions of `ScreenTime`, given the moment, the child's time zone and the request's body. */
  private interface Transition {
    ScreenTime.State apply(ScreenTime.State state, ScreenTime.Limits limits, long now, int tz, JsonNode body);
  }

  private final ScreenTimeService screenTime;
  private final SchemaService schema;

  /** A play segment begins. Body: { tz_offset_min, child_profile_id? }. */
  @PostMapping(Routes.START)
  public ResponseEntity<Object> start(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
    return handle(request, body, false, (state, limits, now, tz, b) -> ScreenTime.startSession(state, limits, now, tz));
  }

  /**
   * Still playing (every 30 s). Body: { tz_offset_min, child_profile_id?, end? }
   * where `end` is 'pause' when the child leaves the game or 'depleted' once
   * the bedtime hand-off is done. The server banks the elapsed time.
   */
  @PutMapping(Routes.HEARTBEAT)
  public ResponseEntity<Object> heartbeat(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
    return handle(request, body, false, (state, limits, now, tz, b) -> {
      return ScreenTime.heartbeat(state, limits, now, tz, Wire.of(SessionEnd.class, Json.at(b, Fields.END)));
    });
  }

  /** Parent top-up: refills the tank and clears the cooldown. Parent sessions only — a child token is rejected. */
  @PostMapping(Routes.RESET)
  public ResponseEntity<Object> reset(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
    return handle(request, body, true, (state, limits, now, tz, b) -> ScreenTime.resetSession(now, tz));
  }

  private ResponseEntity<Object> handle(HttpServletRequest request, JsonNode body, boolean parentOnly, Transition transition) {
    Auth.User user = Requests.requireUser(request);
    if (parentOnly && user.childId() != null) throw new HttpError(ApiError.PARENT_ONLY);

    String childId = user.childId() != null ? user.childId() : Json.text(Json.at(body, Fields.CHILD_PROFILE_ID));
    if (childId == null || childId.isEmpty()) throw new HttpError(ApiError.INVALID_CHILD_PROFILE_ID);
    int tz = ScreenTime.clampTzOffset(Json.number(Json.at(body, Fields.TZ_OFFSET_MIN)));

    schema.ensure();
    long now = System.currentTimeMillis();
    ScreenTimeService.Tracked result = screenTime.track((int) user.id(), childId, (state, limits) -> transition.apply(state, limits, now, tz, body));
    if (result == null) throw new HttpError(ApiError.CHILD_NOT_FOUND);

    Map<String, Object> view = Json.map(Fields.CHILD_PROFILE_ID, childId);
    view.putAll(ScreenTime.describe(result.state(), result.limits(), now));
    return ok(view);
  }
}
