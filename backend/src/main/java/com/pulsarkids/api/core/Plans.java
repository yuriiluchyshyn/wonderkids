package com.pulsarkids.api.core;

import com.pulsarkids.api.model.Access;
import com.pulsarkids.api.model.GiftSource;
import com.pulsarkids.api.model.PlanChoice;
import com.pulsarkids.api.model.Wire;
import java.math.BigDecimal;
import java.util.Set;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * The rules of an account's plan with no Stripe and no database in them.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Plans {
  /** Stripe's statuses under which a subscription gives Family: in trial, paid, or a payment being retried. */
  private static final Set<String> GIVING = Set.of("trialing", "active", "past_due");
  /** Stripe's word for a coupon that discounts every invoice, for ever. */
  private static final String FOREVER = "forever";
  private static final String GIFT_SEPARATOR = ":";
  /** From which sign-in on a parent with no plan must choose one. */
  public static final int ASK_FROM_LOGIN = 2;

  /** What an account has, from what it chose, its subscription's status and a gift. */
  public static Access accessOf(String plan, String status, String gift) {
    if (gift != null && !gift.isBlank()) return Access.GIFT;
    PlanChoice choice = Wire.of(PlanChoice.class, plan);
    if (choice == PlanChoice.PAID && status != null && GIVING.contains(status)) return Access.FAMILY;
    // A paid plan that ended (canceled, payment given up on) falls back to the free one; progress stays.
    if (choice != null) return Access.FREE;
    return Access.NONE;
  }

  /** Whether the parent must choose a plan before going on: the paid mode is on, nothing is chosen, and this is not their first sign-in. */
  public static boolean mustChoose(boolean paidMode, Access access, int logins) {
    return paidMode && access == Access.NONE && logins >= ASK_FROM_LOGIN;
  }

  /** A coupon that takes 100 % off for ever: Family for nothing — no payment form, no limits, until the code is taken back. */
  public static boolean freeForever(BigDecimal percentOff, String duration) {
    return percentOff != null && percentOff.compareTo(BigDecimal.valueOf(100)) == 0 && FOREVER.equals(duration);
  }

  /** A gift as it is kept: `admin`, or `promo:<promotion code id>`. */
  public static String gift(GiftSource source, String detail) {
    return detail == null ? source.wire() : source.wire() + GIFT_SEPARATOR + detail;
  }

  /** Where a kept gift came from. */
  public static GiftSource giftSource(String gift) {
    if (gift == null) return null;
    int at = gift.indexOf(GIFT_SEPARATOR);
    return Wire.of(GiftSource.class, at < 0 ? gift : gift.substring(0, at));
  }

  /** The promotion code's id of a gift that came with one, else null. */
  public static String giftCodeId(String gift) {
    if (gift == null) return null;
    int at = gift.indexOf(GIFT_SEPARATOR);
    return at < 0 ? null : gift.substring(at + 1);
  }
}
