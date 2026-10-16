package com.pulsarkids.api.model;

/** How often a plan is paid for — Stripe's `recurring.interval` of a price. */
public enum BillingPeriod implements Wire {
  MONTH,
  YEAR;

  @Override
  public String wire() {
    return name().toLowerCase();
  }
}
