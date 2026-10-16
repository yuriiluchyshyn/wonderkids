package com.pulsarkids.api.model;

/** Which side of Stripe a key opens: the sandbox / test mode, or real money. */
public enum BillingMode implements Wire {
  TEST,
  LIVE;

  @Override
  public String wire() {
    return name().toLowerCase();
  }
}
