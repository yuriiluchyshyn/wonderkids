package com.pulsarkids.api.model;

/** Where a gift of Family came from: the owner (admin panel), or a promotion code of a coupon free for ever. */
public enum GiftSource implements Wire {
  ADMIN,
  PROMO;

  @Override
  public String wire() {
    return name().toLowerCase();
  }
}
