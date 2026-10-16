package com.pulsarkids.api.model;

/** What a parent chose: the free plan, or a paid one (paid through Stripe). */
public enum PlanChoice implements Wire {
  FREE,
  PAID;

  @Override
  public String wire() {
    return name().toLowerCase();
  }
}
