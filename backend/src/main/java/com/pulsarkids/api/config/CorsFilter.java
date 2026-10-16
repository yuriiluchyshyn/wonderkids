package com.pulsarkids.api.config;

import com.pulsarkids.api.core.Env;
import com.pulsarkids.api.core.Vars;
import com.pulsarkids.api.web.Headers;
import com.pulsarkids.api.web.Routes;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * The API is an origin of its own (`api.pulsarkids.com`), so every page that
 * calls it does so across origins. Two circles:
 *
 *  - OUR OWN pages — the site, the portals of the game, a developer's machine —
 *    may send everything, the session token and the admin key included;
 *  - ANY page may use the PUBLIC endpoints (what is offered where, counting an
 *    arrival, sending a letter, the plans and their prices, beginning a checkout): no session, no cookie, and only
 *    `Content-Type` as a header — so the owner's side of those addresses stays
 *    out of reach of a foreign page, because `x-admin-key` is not a header it
 *    is allowed to send.
 *
 * `CORS_ORIGINS` (root domains, comma-separated) names our own; nothing is
 * decided by cookies anywhere, so there is nothing a foreign page could ride on.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsFilter extends OncePerRequestFilter {
  private static final String DEFAULT_ORIGINS = "pulsarkids.com,wonderkids.yluch.app";
  private static final Set<String> PUBLIC_PATHS = Set.of(Routes.HEALTH, Routes.FEEDBACK, Routes.BILLING_PLANS, Routes.BILLING_CHECKOUT);
  private static final String ANY_ORIGIN = "*";
  private static final String OUR_METHODS = "GET, POST, PUT, DELETE, OPTIONS";
  private static final String PUBLIC_METHODS = "GET, POST, PUT, OPTIONS";
  private static final String OUR_HEADERS = String.join(", ", HttpHeaders.CONTENT_TYPE, Headers.AUTHORIZATION, Headers.ADMIN_KEY);
  private static final String PUBLIC_HEADERS = HttpHeaders.CONTENT_TYPE;
  /** How long a browser may remember the answer to a preflight, in seconds (a day). */
  private static final String PREFLIGHT_MAX_AGE = "86400";
  private static final Pattern LOCAL_HOST =
      Pattern.compile("^(localhost$|127\\.|10\\.|192\\.168\\.|172\\.(1[6-9]|2\\d|3[01])\\.|\\[?::1\\]?$)|\\.local$");

  /** Is this origin one of our own pages? */
  static boolean isOurs(String origin) {
    String host;
    try {
      host = URI.create(origin).getHost();
    } catch (IllegalArgumentException err) {
      return false;
    }
    if (host == null) return false;
    host = host.toLowerCase();
    if (LOCAL_HOST.matcher(host).find()) return true;
    for (String root : Env.get(Vars.CORS_ORIGINS, DEFAULT_ORIGINS).split(",")) {
      String domain = root.strip().toLowerCase();
      if (!domain.isEmpty() && (host.equals(domain) || host.endsWith("." + domain))) return true;
    }
    return false;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
    String origin = request.getHeader(Headers.ORIGIN);
    boolean open = PUBLIC_PATHS.contains(request.getRequestURI());

    if (origin != null && isOurs(origin)) {
      response.setHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origin);
      response.setHeader(HttpHeaders.VARY, HttpHeaders.ORIGIN);
      response.setHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, OUR_METHODS);
      response.setHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, OUR_HEADERS);
      response.setHeader(HttpHeaders.ACCESS_CONTROL_MAX_AGE, PREFLIGHT_MAX_AGE);
    } else if (open) {
      response.setHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, ANY_ORIGIN);
      response.setHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, PUBLIC_METHODS);
      response.setHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, PUBLIC_HEADERS);
      response.setHeader(HttpHeaders.ACCESS_CONTROL_MAX_AGE, PREFLIGHT_MAX_AGE);
    }

    if (HttpMethod.OPTIONS.matches(request.getMethod())) {
      response.setStatus(HttpStatus.NO_CONTENT.value());
      return;
    }
    chain.doFilter(request, response);
  }
}
