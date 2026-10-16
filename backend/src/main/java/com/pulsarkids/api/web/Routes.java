package com.pulsarkids.api.web;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/** The addresses of the API. The clients know them by heart (`game/src/core/account/api/client.ts`), so one is never renamed — a new one is added. */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Routes {
  public static final String ADMIN_BILLING = "/api/admin/billing";
  public static final String ADMIN_SPEECH = "/api/admin/speech";
  public static final String ADMIN_USERS = "/api/admin/users";
  public static final String AUTH_CHILD_LOGIN = "/api/auth/child-login";
  public static final String AUTH_LOGIN = "/api/auth/login";
  public static final String BILLING_CHECKOUT = "/api/billing/checkout";
  public static final String BILLING_CHOOSE = "/api/billing/choose";
  public static final String BILLING_ME = "/api/billing/me";
  public static final String BILLING_PORTAL = "/api/billing/portal";
  public static final String BILLING_SUBSCRIPTION = "/api/billing/subscription";
  public static final String BILLING_PLANS = "/api/billing/plans";
  public static final String BILLING_WEBHOOK = "/api/billing/webhook";
  public static final String FEEDBACK = "/api/feedback";
  public static final String HEALTH = "/api/health";
  public static final String NICKNAME = "/api/nickname";
  public static final String STATE = "/api/state";
  public static final String TTS = "/api/tts";
  public static final String TRIAL = "/trial";
  public static final String V1_SESSION = "/api/v1/session";
  public static final String HEARTBEAT = "/heartbeat";
  public static final String RESET = "/reset";
  public static final String START = "/start";
}
