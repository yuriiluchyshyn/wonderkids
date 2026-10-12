package com.pulsarkids.api.web;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/** The request headers the API reads beyond the standard ones. */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Headers {
  /** `Bearer <session token>`. */
  public static final String AUTHORIZATION = "Authorization";
  /** The owner's shared key (`Vars.ADMIN_KEY`). */
  public static final String ADMIN_KEY = "x-admin-key";
  public static final String ORIGIN = "Origin";
  public static final String USER_AGENT = "User-Agent";
  public static final String HOST = "Host";
  /** The visitor's address, as Vercel's edge saw it (the first of the list). */
  public static final String FORWARDED_FOR = "x-forwarded-for";
  /** The host the browser asked, when the request came through the game's `/api` rewrite. */
  public static final String FORWARDED_HOST = "x-forwarded-host";
  /** The visitor's country (ISO 3166-1 alpha-2), set by Vercel's edge. */
  public static final String COUNTRY = "x-vercel-ip-country";
}
