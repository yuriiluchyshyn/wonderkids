package com.pulsarkids.api.model;

import java.util.List;
import java.util.Locale;
import lombok.Getter;

/**
 * The languages the product speaks. A new language is a new constant here —
 * with its cloud voice — plus its `messages_<code>.properties`; the game has
 * its own list (`game/src/core/language`), and the two must name the same codes.
 */
@Getter
public enum Lang implements Wire {
  UK("uk", "uk-UA-Chirp3-HD-Kore", "uk-UA"),
  EN("en", "en-US-Wavenet-F", "en-US", "en-GB"),
  PL("pl", "pl-PL-Wavenet-A", "pl-PL");

  /** The language the product was written in: what a phrase is in when nothing says otherwise. */
  public static final Lang DEFAULT = UK;
  /** What a visitor is answered in when they ask for a language we do not speak. */
  public static final Lang FALLBACK = EN;

  /** ISO 639-1, as the clients and the database write it. */
  private final String code;
  /** The Google Cloud voice that reads this language — the only place a cloud voice is named. */
  private final String cloudVoice;
  /** The Google locales whose voices the owner may choose for this language (`en-US`, `en-GB`). */
  private final List<String> cloudLocales;

  Lang(String code, String cloudVoice, String... cloudLocales) {
    this.code = code;
    this.cloudVoice = cloudVoice;
    this.cloudLocales = List.of(cloudLocales);
  }

  @Override
  public String wire() {
    return code;
  }

  public Locale locale() {
    return Locale.forLanguageTag(code);
  }

  /** The language of a locale (`pl-PL` → PL), or null when it is not one of ours. */
  public static Lang of(Locale locale) {
    return locale == null ? null : Wire.of(Lang.class, locale.getLanguage());
  }
}
