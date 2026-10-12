package com.pulsarkids.api.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.pulsarkids.api.core.Auth;
import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.core.ScreenTime;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.service.AccountService;
import com.pulsarkids.api.service.SchemaService;
import com.pulsarkids.api.service.SpeechService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Per-user save →  GET /api/state   (load; `state` is null when empty)
 *                  PUT /api/state   (replace with { state })
 * Both answer 403 `account_disabled` for an account the owner switched off —
 * a session opened before that ends here.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(Routes.STATE)
public class StateController extends ApiController {
  private final AccountService accounts;
  private final SpeechService speech;
  private final SchemaService schema;

  @GetMapping
  public ResponseEntity<Object> load(HttpServletRequest request, @RequestParam(name = Fields.TZ_OFFSET_MIN, required = false) String tzOffsetMin) {
    Auth.User user = Requests.requireUser(request);
    schema.ensure();
    accounts.requireEnabled((int) user.id());
    // `features` tells the client what the account has switched on — never
    // the credentials themselves.
    return ok(Fields.STATE, accounts.getState((int) user.id(), ScreenTime.clampTzOffset(Json.number(tzOffsetMin))), Fields.FEATURES, Json.map(Fields.CLOUD_TTS, speech.configOf((int) user.id()).enabled()));
  }

  @PutMapping
  public ResponseEntity<Object> save(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
    Auth.User user = Requests.requireUser(request);
    JsonNode state = Json.at(body, Fields.STATE);
    if (!state.isObject()) throw new HttpError(ApiError.INVALID_STATE);
    schema.ensure();
    accounts.requireEnabled((int) user.id());
    return ok(Fields.OK, true, Fields.UPDATED_AT, accounts.saveState((int) user.id(), state, messages.lang()));
  }
}
