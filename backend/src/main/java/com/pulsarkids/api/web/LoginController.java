package com.pulsarkids.api.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.pulsarkids.api.core.Auth0;
import com.pulsarkids.api.core.Auth;
import com.pulsarkids.api.core.Emails;
import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.core.Source;
import com.pulsarkids.api.data.entity.Parent;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.service.AccountService;
import com.pulsarkids.api.service.SchemaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Parent login → POST /api/auth/login
 *
 * **Auth0** (when configured, see `Auth0`) — body `{ idToken }`. The browser
 * signs in on Auth0 Universal Login and sends the ID token here; we verify it
 * and answer with our own session token. The account is still found by mailbox
 * (`email_key`), so parents who registered before Auth0 keep their children and
 * progress. The address must be VERIFIED by Auth0: the email is the account
 * identity, so an unverified one would let anybody sign up with someone else's
 * address and open their account. For the same reason a new address needs no
 * "create?" confirmation — a verified address cannot be a typo.
 *
 * **Email only** (the fallback while Auth0 is not configured; with Auth0 it
 * answers 403 `auth0_required`) — body `{ email, create? }`. No password
 * (POC). Signing in NEVER creates an account by itself: an unknown address
 * answers 404 `account_not_found` (with a `suggestion` when the domain looks
 * mistyped), and the account is only created when the client repeats the call
 * with `create: true` after the parent confirmed it. This is what stops a typo
 * from quietly producing a second, empty account.
 *
 * One mailbox = one account: `Name.Surname+x@googlemail.com` signs in to the
 * same account as `namesurname@gmail.com`.
 *
 * Both bodies may carry `source` — `{ source, medium?, campaign?, link? }`, the
 * labels of the link that brought the parent. It is saved only when this call
 * creates the account, and shown in the admin's «Джерела» page.
 *
 * An account the owner switched off answers 403 `account_disabled`.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(Routes.AUTH_LOGIN)
public class LoginController extends ApiController {
  private final AccountService accounts;
  private final SchemaService schema;

  @Override
  protected ApiError failure() {
    return ApiError.LOGIN_FAILED;
  }

  private static ResponseEntity<Object> session(Parent user, boolean created) {
    if (user.isDisabled()) throw new HttpError(ApiError.ACCOUNT_DISABLED);
    return ok(Fields.TOKEN, Auth.signToken(user.getId(), user.getEmail()), Fields.USER, Json.map(Fields.ID, user.getId(), Fields.EMAIL, user.getEmail()), Fields.CREATED, created);
  }

  @PostMapping
  public ResponseEntity<Object> login(@RequestBody(required = false) JsonNode body) {
    if (Auth0.enabled()) return auth0Login(body);

    String email = Json.text(Json.at(body, Fields.EMAIL));
    if (!Emails.isValid(email)) throw new HttpError(ApiError.INVALID_EMAIL);

    schema.ensure();
    Parent user = accounts.findParentByEmail(email);
    if (user != null) return session(user, false);

    JsonNode create = Json.at(body, Fields.CREATE);
    if (!(create.isBoolean() && create.booleanValue())) {
      String suggestion = Emails.suggest(email);
      throw new HttpError(ApiError.ACCOUNT_NOT_FOUND, Json.map(
          Fields.EMAIL, Emails.normalise(email),
          Fields.SUGGESTION, suggestion,
          // Lets the UI say "you probably meant X — that account exists".
          Fields.SUGGESTION_EXISTS, suggestion != null && accounts.findParentByEmail(suggestion) != null));
    }
    return session(accounts.createParent(email, Source.clean(Json.at(body, Fields.SOURCE))), true);
  }

  private ResponseEntity<Object> auth0Login(JsonNode body) {
    JsonNode idToken = Json.at(body, Fields.ID_TOKEN);
    // An address alone proves nothing once Auth0 is on.
    if (idToken.isMissingNode()) throw new HttpError(ApiError.AUTH0_REQUIRED);
    if (!idToken.isTextual() || idToken.textValue().isEmpty()) throw new HttpError(ApiError.MALFORMED_TOKEN);

    JsonNode claims;
    try {
      claims = Auth0.verifyIdToken(idToken.textValue());
    } catch (Exception err) {
      log.warn("[login] Auth0 token rejected: {}", err.getMessage());
      throw new HttpError(ApiError.INVALID_TOKEN);
    }

    String email = Json.text(claims.get(Fields.EMAIL));
    if (!Emails.isValid(email)) throw new HttpError(ApiError.EMAIL_MISSING);
    JsonNode verified = claims.get(Fields.EMAIL_VERIFIED);
    if (!(verified != null && verified.isBoolean() && verified.booleanValue())) {
      throw new HttpError(ApiError.EMAIL_NOT_VERIFIED, Json.map(Fields.EMAIL, email));
    }

    schema.ensure();
    Parent user = accounts.findParentByEmail(email);
    boolean created = user == null;
    if (created) user = accounts.createParent(email, Source.clean(Json.at(body, Fields.SOURCE)));
    return session(user, created);
  }
}
