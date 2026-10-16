package com.pulsarkids.api.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * A number a plan is described by, kept in the Stripe product's metadata
 * (`metadata.<key>`) and sent to the clients as `facts.<field>`: the pages
 * and the game read them, never a number of their own.
 */
@Getter
@RequiredArgsConstructor
public enum PlanFact implements Wire {
  /** The free plan's daily play time for the whole family, minutes. */
  DAILY_MINUTES("daily_minutes", "dailyMinutes"),
  /** Days a paid plan is tried before the first charge. */
  TRIAL_DAYS("trial_days", "trialDays"),
  /** Children a paid plan includes before a slot is added. */
  CHILDREN_INCLUDED("children_included", "childrenIncluded");

  /** Its key in Stripe's metadata. */
  private final String metadataKey;
  private final String wire;

  @Override
  public String wire() {
    return wire;
  }
}
