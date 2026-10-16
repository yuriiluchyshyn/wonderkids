package com.pulsarkids.api.model;

/**
 * What an account has now (`core/Plans.accessOf`): nothing chosen yet, the
 * free plan, Family paid (in trial or active), or Family as a gift.
 */
public enum Access implements Wire {
  NONE,
  FREE,
  FAMILY,
  GIFT;

  @Override
  public String wire() {
    return name().toLowerCase();
  }
}
