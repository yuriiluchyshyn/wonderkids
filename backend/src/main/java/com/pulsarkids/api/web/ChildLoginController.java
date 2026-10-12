package com.pulsarkids.api.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.pulsarkids.api.core.Auth;
import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.ChildLoginStatus;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.service.AccountService;
import com.pulsarkids.api.service.SchemaService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Child login → POST /api/auth/child-login
 *
 * Two ways in, both answering with a child token + childId:
 *
 *  - the child's own: body `{ identifier, pin }` — the unique nickname (or
 *    email) and the parent-set login code;
 *  - the parent's: a PARENT session token in `Authorization` and body
 *    `{ childId }` — the cabinet's «Відкрити гру» opens one of the account's
 *    own children without typing the nick and PIN. A child token cannot do
 *    this, and the child must belong to the account.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(Routes.AUTH_CHILD_LOGIN)
public class ChildLoginController extends ApiController {
  private final AccountService accounts;
  private final SchemaService schema;

  @Override
  protected ApiError failure() {
    return ApiError.LOGIN_FAILED;
  }

  private static ResponseEntity<Object> session(long parentId, String childId) {
    return ok(Fields.TOKEN, Auth.signChildToken(parentId, childId), Fields.CHILD_ID, childId, Fields.USER, Json.map(Fields.ID, parentId));
  }

  @PostMapping
  public ResponseEntity<Object> login(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
    JsonNode childId = Json.at(body, Fields.CHILD_ID);
    if (!childId.isMissingNode()) {
      Auth.User parent = Requests.user(request);
      if (parent == null || parent.childId() != null) throw new HttpError(ApiError.INVALID_TOKEN);
      if (!childId.isTextual() || childId.textValue().isEmpty()) throw new HttpError(ApiError.INVALID_CHILD_PROFILE_ID);
      schema.ensure();
      if (!accounts.ownsChild((int) parent.id(), childId.textValue())) throw new HttpError(ApiError.CHILD_NOT_FOUND);
      accounts.requireEnabled((int) parent.id());
      return session(parent.id(), childId.textValue());
    }

    String identifier = Json.text(Json.at(body, Fields.IDENTIFIER));
    String pin = Json.text(Json.at(body, Fields.PIN));
    if (identifier == null || identifier.strip().isEmpty() || pin == null) throw new HttpError(ApiError.INVALID_CREDENTIALS);

    schema.ensure();
    AccountService.ChildLogin found = accounts.resolveChildLogin(identifier, pin);
    // A child of an account the owner switched off does not get in either.
    if (found.status() == ChildLoginStatus.OK) accounts.requireEnabled(found.parentId());
    return switch (found.status()) {
      case OK -> session(found.parentId(), found.childId());
      case BAD_PIN -> throw new HttpError(ApiError.INVALID_PIN);
      case NOT_FOUND -> throw new HttpError(ApiError.CHILD_NOT_FOUND);
    };
  }
}
