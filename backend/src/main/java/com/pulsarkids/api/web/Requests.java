package com.pulsarkids.api.web;

import com.pulsarkids.api.core.Auth;
import com.pulsarkids.api.core.Env;
import com.pulsarkids.api.core.Secrets;
import com.pulsarkids.api.core.Vars;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.Fields;
import jakarta.servlet.http.HttpServletRequest;
import java.util.regex.Pattern;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/** What the handlers read off a request beyond its body. */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Requests {
  private static final Pattern COUNTRY = Pattern.compile("^[A-Z]{2}$");
  /** Shorter keys are refused outright — too easy to guess. */
  private static final int MIN_ADMIN_KEY_LENGTH = 8;

  /** The signed-in user of a request (a parent's session or a child's), or null. */
  public static Auth.User user(HttpServletRequest request) {
    return Auth.userOf(request.getHeader(Headers.AUTHORIZATION));
  }

  /** The same, but a request without a valid session is answered 401 `invalid_token`. */
  public static Auth.User requireUser(HttpServletRequest request) {
    Auth.User user = user(request);
    if (user == null) throw new HttpError(ApiError.INVALID_TOKEN);
    return user;
  }

  /**
   * Admin access: a single shared ADMIN_KEY (env), sent as `x-admin-key`.
   * Deliberately separate from parent/child tokens — "being logged in as the
   * owner's email" must never grant admin rights. Answers 503 when no key is
   * configured and 401 when it is wrong.
   */
  public static void requireAdmin(HttpServletRequest request) {
    String configured = Env.get(Vars.ADMIN_KEY);
    if (configured == null || configured.length() < MIN_ADMIN_KEY_LENGTH) throw new HttpError(ApiError.ADMIN_NOT_CONFIGURED);
    if (!Secrets.safeEqual(request.getHeader(Headers.ADMIN_KEY), configured)) throw new HttpError(ApiError.INVALID_ADMIN_KEY);
  }

  /** Where the request came from, as Vercel's edge saw it — the first address of `x-forwarded-for`. */
  public static String clientIp(HttpServletRequest request) {
    String forwarded = request.getHeader(Headers.FORWARDED_FOR);
    String ip = forwarded == null ? "" : forwarded.split(",")[0].strip();
    return ip.isEmpty() ? Fields.LOCAL : ip;
  }

  /** The visitor's country (ISO 3166-1 alpha-2) as Vercel's edge saw it, or null off Vercel. */
  public static String country(HttpServletRequest request) {
    String header = request.getHeader(Headers.COUNTRY);
    String country = header == null ? "" : header.toUpperCase();
    return COUNTRY.matcher(country).matches() ? country : null;
  }

  public static String userAgent(HttpServletRequest request) {
    String agent = request.getHeader(Headers.USER_AGENT);
    return agent == null ? "" : agent;
  }

  /** The host the browser asked — the game's, when the request came through its `/api` rewrite. */
  public static String host(HttpServletRequest request) {
    String forwarded = request.getHeader(Headers.FORWARDED_HOST);
    String host = forwarded != null && !forwarded.isBlank() ? forwarded : request.getHeader(Headers.HOST);
    return host == null ? "" : host.strip().toLowerCase();
  }
}
