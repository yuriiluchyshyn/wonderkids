package com.pulsarkids.api.core;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/** The names of the environment variables the service reads (`Env`). `app/game/.env.example` explains each for a developer. */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Vars {
  /** The admin panel's shared key, at least 8 characters. */
  public static final String ADMIN_KEY = "ADMIN_KEY";
  /** Root domains whose pages may call the API with a session or the admin key. */
  public static final String CORS_ORIGINS = "CORS_ORIGINS";
  /** PostgreSQL, as its host hands the address out: postgres://user:password@host/db?sslmode=require. */
  public static final String DATABASE_URL = "DATABASE_URL";
  /** Connections an instance may hold (5). */
  public static final String DB_POOL_MAX = "DB_POOL_MAX";
  /** A developer's file of variables to read instead of .env.local. */
  public static final String ENV_FILE = "ENV_FILE";
  /** The sender of our mail, on a domain verified in Resend. */
  public static final String FEEDBACK_FROM = "FEEDBACK_FROM";
  /** The owner's mailbox, where letters from the site are forwarded. */
  public static final String FEEDBACK_TO = "FEEDBACK_TO";
  /** Another address for Google Speech (tests). */
  public static final String GOOGLE_TTS_ENDPOINT = "GOOGLE_TTS_ENDPOINT";
  /** Another address for Google's list of voices (tests). */
  public static final String GOOGLE_VOICES_ENDPOINT = "GOOGLE_VOICES_ENDPOINT";
  /** How long a session lasts: 30d (the default), 12h, 3600. */
  public static final String JWT_EXPIRES_IN = "JWT_EXPIRES_IN";
  /** Signs sessions and the tickets of letters and visits; by default also the key stored secrets are encrypted with. */
  public static final String JWT_SECRET = "JWT_SECRET";
  /** The language the owner reads forwarded letters in (uk). */
  public static final String OWNER_LANG = "OWNER_LANG";
  /** Where a forwarded letter says the owner answers. */
  public static final String PARENTS_URL = "PARENTS_URL";
  /** `true` forces TLS to the database. */
  public static final String PGSSL = "PGSSL";
  /** `true` accepts a certificate that cannot be checked. */
  public static final String PGSSL_INSECURE = "PGSSL_INSECURE";
  /** The port to listen on. */
  public static final String PORT = "PORT";
  /** Resend's key: without it no letter is mailed. */
  public static final String RESEND_API_KEY = "RESEND_API_KEY";
  /** Another address for Resend (tests). */
  public static final String RESEND_ENDPOINT = "RESEND_ENDPOINT";
  /** Encrypts stored Google keys; never changes once keys are saved. */
  public static final String SECRETS_KEY = "SECRETS_KEY";
  /** Set by Vercel: the service is deployed, not on a developer's machine. */
  public static final String VERCEL = "VERCEL";
  /** Auth0's client id — the same public value the game is built with. */
  public static final String VITE_AUTH0_CLIENT_ID = "VITE_AUTH0_CLIENT_ID";
  /** Auth0's domain — the same public value the game is built with. */
  public static final String VITE_AUTH0_DOMAIN = "VITE_AUTH0_DOMAIN";
}
