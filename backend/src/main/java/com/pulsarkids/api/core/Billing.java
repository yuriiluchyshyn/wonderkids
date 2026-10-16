package com.pulsarkids.api.core;

import com.pulsarkids.api.model.BillingMode;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/** Which side of Stripe a key opens. */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Billing {
  private static final String LIVE_MARK = "_live_";

  /** `sk_live_…` / `rk_live_…` move real money; anything else is the sandbox. */
  public static BillingMode modeOf(String secretKey) {
    return secretKey != null && secretKey.contains(LIVE_MARK) ? BillingMode.LIVE : BillingMode.TEST;
  }
}
