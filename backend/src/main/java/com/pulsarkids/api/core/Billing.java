package com.pulsarkids.api.core;

import com.pulsarkids.api.model.BillingMode;
import com.pulsarkids.api.model.Lang;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Currency;
import java.util.Locale;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/** Which side of Stripe a key opens. */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Billing {
  private static final String LIVE_MARK = "_live_";

  /** «599,00 UAH», «$59.99» — an amount in minor units as a reader of `lang` writes money. */
  public static String formatAmount(long minor, String currency, Lang lang) {
    Currency money = Currency.getInstance(currency.toUpperCase(Locale.ROOT));
    NumberFormat format = NumberFormat.getCurrencyInstance(Locale.forLanguageTag(lang.wire()));
    format.setCurrency(money);
    return format.format(BigDecimal.valueOf(minor, money.getDefaultFractionDigits())).replace('\u00a0', ' ').replace('\u202f', ' ');
  }

  /** `sk_live_…` / `rk_live_…` move real money; anything else is the sandbox. */
  public static BillingMode modeOf(String secretKey) {
    return secretKey != null && secretKey.contains(LIVE_MARK) ? BillingMode.LIVE : BillingMode.TEST;
  }
}
