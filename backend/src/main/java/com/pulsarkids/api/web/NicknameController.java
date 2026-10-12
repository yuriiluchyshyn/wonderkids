package com.pulsarkids.api.web;

import com.pulsarkids.api.core.Auth;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.service.AccountService;
import com.pulsarkids.api.service.SchemaService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Child nickname availability → GET /api/nickname?nick=marko_speed
 * Returns `{ available }`, excluding the caller's own account so a parent can
 * keep their own child's nickname.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(Routes.NICKNAME)
public class NicknameController extends ApiController {
  private static final Pattern NICKNAME = Pattern.compile("^[a-z0-9_]{3,12}$");

  private final AccountService accounts;
  private final SchemaService schema;

  @Override
  protected ApiError failure() {
    return ApiError.CHECK_FAILED;
  }

  @GetMapping
  public ResponseEntity<Object> check(HttpServletRequest request, @RequestParam(name = Fields.NICK, required = false) String raw) {
    Auth.User user = Requests.requireUser(request);
    String nick = raw == null ? "" : raw.strip().toLowerCase();
    if (!NICKNAME.matcher(nick).matches()) throw new HttpError(ApiError.INVALID_NICKNAME);
    schema.ensure();
    return ok(Fields.AVAILABLE, accounts.isNicknameAvailable(nick, (int) user.id()));
  }
}
