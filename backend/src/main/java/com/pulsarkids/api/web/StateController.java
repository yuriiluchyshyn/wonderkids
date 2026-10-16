package com.pulsarkids.api.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.pulsarkids.api.core.Auth;
import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.core.ScreenTime;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.service.AccountService;
import com.pulsarkids.api.service.MarketingService;
import com.pulsarkids.api.service.SchemaService;
import com.pulsarkids.api.service.SpeechService;
import com.pulsarkids.api.service.SubscriptionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Per-user save →  GET /api/state   (load; `state` is null when empty)
 *                  PUT /api/state   (replace with { state })
 *                  DELETE /api/state (the parent removes the whole account)
 * The first two answer 403 `account_disabled` for an account the owner switched off —
 * a session opened before that ends here.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(Routes.STATE)
public class StateController extends ApiController {
  private final AccountService accounts;
  private final SpeechService speech;
  private final MarketingService marketing;
  private final SchemaService schema;
  private final SubscriptionService subscriptions;

  @GetMapping
  public ResponseEntity<Object> load(HttpServletRequest request, @RequestParam(name = Fields.TZ_OFFSET_MIN, required = false) String tzOffsetMin) {
    Auth.User user = Requests.requireUser(request);
    schema.ensure();
    accounts.requireEnabled((int) user.id());
    accounts.markSeen((int) user.id());
    // `features` tells the client what the account has switched on — never
    // the credentials themselves — and whether the paid mode is on (off: the game shows nothing of paying).
    return ok(Fields.STATE, accounts.getState((int) user.id(), ScreenTime.clampTzOffset(Json.number(tzOffsetMin))),
        Fields.FEATURES, Json.map(Fields.CLOUD_TTS, speech.configOf((int) user.id()).enabled(), Fields.PAID, marketing.paidModeOn()),
        // The plan's room for children, and whether the children are paused for want of it.
        Fields.LIMITS, subscriptions.limitsOf((int) user.id()));
  }

  @PutMapping
  public ResponseEntity<Object> save(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
    Auth.User user = Requests.requireUser(request);
    JsonNode state = Json.at(body, Fields.STATE);
    if (!state.isObject()) throw new HttpError(ApiError.INVALID_STATE);
    schema.ensure();
    accounts.requireEnabled((int) user.id());
    // A child's session saves nothing while the children are paused (more of them than the plan has room for).
    if (user.childId() != null && subscriptions.overLimit((int) user.id())) throw new HttpError(ApiError.CHILDREN_BLOCKED);
    accounts.markSeen((int) user.id());
    return ok(Fields.OK, true, Fields.UPDATED_AT, accounts.saveState((int) user.id(), state, messages.lang()));
  }

  /**
   * A parent deletes their own account: the children's profiles, progress and
   * play time go with it (the tables cascade), at once and for good. It is the
   * right to erasure without writing a letter — the privacy policy on the site
   * promises it. A child's session cannot do this.
   */
  @DeleteMapping
  public ResponseEntity<Object> delete(HttpServletRequest request) {
    Auth.User user = Requests.requireUser(request);
    if (user.childId() != null) throw new HttpError(ApiError.PARENT_ONLY);
    schema.ensure();
    // No `requireEnabled`: an account the owner switched off is still its parent's to delete.
    accounts.deleteParent((int) user.id());
    return ok(Fields.OK, true);
  }
}
