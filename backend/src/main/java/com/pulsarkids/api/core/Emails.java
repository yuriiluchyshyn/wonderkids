package com.pulsarkids.api.core;

import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Email identity rules. Parent login is by email, so two spellings of the same
 * mailbox must never become two accounts, and an obvious typo should be caught
 * before it silently creates a new, empty one. Pure functions — no I/O.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Emails {
  private static final String GMAIL = "@gmail.com";

  private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", Pattern.UNICODE_CHARACTER_CLASS);
  private static final Set<String> GMAIL_DOMAINS = Set.of("gmail.com", "googlemail.com");

  /** Common slips of well-known domains → what was meant. */
  private static final Map<String, String> DOMAIN_TYPOS = Map.ofEntries(
      Map.entry("gamil.com", "gmail.com"),
      Map.entry("gmial.com", "gmail.com"),
      Map.entry("gmai.com", "gmail.com"),
      Map.entry("gmal.com", "gmail.com"),
      Map.entry("gmail.co", "gmail.com"),
      Map.entry("gmail.con", "gmail.com"),
      Map.entry("gmail.cm", "gmail.com"),
      Map.entry("gmail.om", "gmail.com"),
      Map.entry("gmaill.com", "gmail.com"),
      Map.entry("gnail.com", "gmail.com"),
      Map.entry("gmail.comm", "gmail.com"),
      Map.entry("hotmial.com", "hotmail.com"),
      Map.entry("hotmai.com", "hotmail.com"),
      Map.entry("hotmail.con", "hotmail.com"),
      Map.entry("outlok.com", "outlook.com"),
      Map.entry("outlook.con", "outlook.com"),
      Map.entry("yaho.com", "yahoo.com"),
      Map.entry("yahooo.com", "yahoo.com"),
      Map.entry("yahoo.con", "yahoo.com"),
      Map.entry("ukr.ne", "ukr.net"),
      Map.entry("ukr.nte", "ukr.net"),
      Map.entry("urk.net", "ukr.net"),
      Map.entry("ukr.met", "ukr.net"),
      Map.entry("icloud.con", "icloud.com"),
      Map.entry("iclod.com", "icloud.com"),
      Map.entry("i.ua.", "i.ua"),
      Map.entry("meta.ua.", "meta.ua"));

  public static boolean isValid(String email) {
    return email != null && EMAIL.matcher(email.strip()).matches();
  }

  /** What we store and show: trimmed, lower-cased. */
  public static String normalise(String email) {
    return email == null ? "" : email.strip().toLowerCase();
  }

  /**
   * The mailbox an address really delivers to — the uniqueness key of an
   * account. Gmail ignores dots and anything after "+", and googlemail.com is
   * the same service, so `Yura.L+kids@GoogleMail.com` and `yural@gmail.com` are
   * ONE mailbox and must be one account. Other providers are left as typed.
   */
  public static String key(String email) {
    String normalised = normalise(email);
    int at = normalised.lastIndexOf('@');
    if (at < 0) return normalised;
    String local = normalised.substring(0, at);
    String domain = normalised.substring(at + 1);
    if (!GMAIL_DOMAINS.contains(domain)) return normalised;
    int plus = local.indexOf('+');
    return (plus < 0 ? local : local.substring(0, plus)).replace(".", "") + GMAIL;
  }

  /** The corrected address when the domain looks mistyped, else null. */
  public static String suggest(String email) {
    String normalised = normalise(email);
    int at = normalised.lastIndexOf('@');
    if (at < 0) return null;
    String fixed = DOMAIN_TYPOS.get(normalised.substring(at + 1));
    return fixed == null ? null : normalised.substring(0, at) + "@" + fixed;
  }
}
