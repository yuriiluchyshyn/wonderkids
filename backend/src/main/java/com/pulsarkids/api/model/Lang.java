package com.pulsarkids.api.model;

import java.util.Locale;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * The languages the product speaks. A new language is a new constant here —
 * with its cloud voice — plus its `messages_<code>.properties`; the game has
 * its own list (`game/src/core/language`), and the two must name the same codes.
 */
@Getter
@RequiredArgsConstructor
public enum Lang implements Wire {
  UK("uk", "uk-UA-Chirp3-HD-Kore"),
  EN("en", "en-US-Wavenet-F"),
  PL("pl", "pl-PL-Wavenet-A");

  /** The language the product was written in: what a phrase is in when nothing says otherwise. */
  public static final Lang DEFAULT = UK;
  /** What a visitor is answered in when they ask for a language we do not speak. */
  public static final Lang FALLBACK = EN;

  /** ISO 639-1, as the clients and the database write it. */
  private final String code;
  /** The Google Cloud voice that reads this language — the only place a cloud voice is named. */
  private final String cloudVoice;

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
