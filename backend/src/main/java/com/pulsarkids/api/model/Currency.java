package com.pulsarkids.api.model;

/**
 * The money a child's shop game may count in. A new currency is a new
 * constant here and its entry in `game/src/core/game/content/currency.ts`.
 */
public enum Currency implements Wire {
  UAH,
  EUR,
  USD,
  GBP,
  PLN;

  /** What a save without a (known) currency is kept with. */
  public static final Currency DEFAULT = UAH;

  /** ISO 4217. */
  @Override
  public String wire() {
    return name();
  }
}
