package com.pulsarkids.api.core;

import com.fasterxml.jackson.databind.JsonNode;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.Device;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.model.LinkMode;
import com.pulsarkids.api.model.VisitVia;
import com.pulsarkids.api.model.Wire;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.DoubleSupplier;
import java.util.regex.Pattern;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * The owner's own links and the visits by them — the rules, with no database
 * and no request in them (tested in `MarketingTest`).
 *
 * A LINK is made in the admin panel and handed out: one per place it is put
 * (a profile, an ad, a flyer's QR code), so the visits can be told apart. It
 * is a code in the query string — `?l=insta-bio` — and leads either to the
 * public site or straight into the trial game:
 *
 *   site   https://pulsarkids.com/?l=<code>
 *   demo   https://play.pulsarkids.com/try?l=<code>
 *
 * A VISIT is one arrival: when, by which link, into which mode, from which
 * country. The trial game is counted with or without a link; the site only by
 * a link that exists (its plain page views are Vercel Analytics' business).
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Marketing {
  /** How long the trial game lasts when the owner has not said otherwise. */
  public static final int DEMO_MINUTES_DEFAULT = 5;
  public static final int DEMO_MINUTES_MIN = 1;
  public static final int DEMO_MINUTES_MAX = 60;

  /** One visitor may be counted this many times an hour; more is a robot or a reload loop. */
  public static final int MAX_VISITS_PER_HOUR = 30;

  private static final Pattern CODE = Pattern.compile("^[a-z0-9][a-z0-9_-]{1,39}$");
  private static final Pattern LANG = Pattern.compile("^[a-z]{2}$");
  private static final Pattern HOST = Pattern.compile("^[a-z0-9.-]{1,80}$");
  /** A game as the trial is asked for it: `geography:flags`. */
  private static final Pattern GAME = Pattern.compile("^[a-z][a-z0-9_]{0,29}:[a-z][a-z0-9_]{0,39}$");
  private static final Pattern TABLET = Pattern.compile("ipad|tablet|android(?!.*mobile)", Pattern.CASE_INSENSITIVE);
  private static final Pattern MOBILE = Pattern.compile("mobi|iphone|ipod|android", Pattern.CASE_INSENSITIVE);

  private static final Map<Character, String> LATIN = Map.ofEntries(
      Map.entry('а', Fields.A), Map.entry('б', Fields.B), Map.entry('в', Fields.V), Map.entry('г', Fields.H), Map.entry('ґ', Fields.G),
      Map.entry('д', Fields.D), Map.entry('е', Fields.E), Map.entry('є', Fields.YE), Map.entry('ж', Fields.ZH), Map.entry('з', Fields.Z),
      Map.entry('и', Fields.Y), Map.entry('і', Fields.I), Map.entry('ї', Fields.YI), Map.entry('й', Fields.Y), Map.entry('к', Fields.K),
      Map.entry('л', Fields.L), Map.entry('м', Fields.M), Map.entry('н', Fields.N), Map.entry('о', Fields.O), Map.entry('п', Fields.P),
      Map.entry('р', Fields.R), Map.entry('с', Fields.S), Map.entry('т', Fields.T), Map.entry('у', Fields.U), Map.entry('ф', Fields.F),
      Map.entry('х', Fields.KH), Map.entry('ц', Fields.TS), Map.entry('ч', Fields.CH), Map.entry('ш', Fields.SH), Map.entry('щ', Fields.SHCH),
      Map.entry('ь', ""), Map.entry('ю', Fields.YU), Map.entry('я', Fields.YA), Map.entry('ы', Fields.Y), Map.entry('э', Fields.E),
      Map.entry('ё', Fields.YO), Map.entry('ъ', ""));

  /** A whole number of minutes within the allowed range, or null. */
  public static Integer cleanDemoMinutes(JsonNode value) {
    if (!Json.present(value)) return null;
    double minutes = Json.number(value);
    if (minutes != Math.rint(minutes) || minutes < DEMO_MINUTES_MIN || minutes > DEMO_MINUTES_MAX) return null;
    return (int) minutes;
  }

  /** A link's code as it is written in an address, or null when it cannot be one. */
  public static String cleanCode(String value) {
    if (value == null) return null;
    String code = value.strip().toLowerCase();
    return CODE.matcher(code).matches() ? code : null;
  }

  /** A code made from a link's name («Інстаграм, біо» → `instahram-bio`); null when nothing usable is left. */
  public static String codeFromName(String name) {
    StringBuilder latin = new StringBuilder();
    for (char ch : (name == null ? "" : name).toLowerCase().toCharArray()) {
      String mapped = LATIN.get(ch);
      if (mapped != null) latin.append(mapped);
      else latin.append(ch);
    }
    String code = latin.toString().replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
    if (code.length() > 40) code = code.substring(0, 40);
    return cleanCode(code.replaceAll("-+$", ""));
  }

  /** A short code for a link whose name gives none. */
  public static String randomCode() {
    return randomCode(() -> ThreadLocalRandom.current().nextDouble());
  }

  public static String randomCode(DoubleSupplier random) {
    String letters = Fields.ABCDEFGHJKMNPQRSTUVWXYZ23456789;
    StringBuilder code = new StringBuilder();
    for (int i = 0; i < 7; i += 1) code.append(letters.charAt((int) Math.floor(random.getAsDouble() * letters.length())));
    return code.toString();
  }

  public record Link(String name, String code, LinkMode mode, String note) {}

  /** A cleaned link, or what is wrong with it. */
  public record LinkResult(Link link, ApiError error) {}

  private static String cut(String text, int max) {
    return text.length() > max ? text.substring(0, max) : text;
  }

  /** A new link as the admin panel sends it. */
  public static LinkResult cleanLink(JsonNode raw) {
    String rawName = Json.text(Json.at(raw, Fields.NAME));
    String name = rawName == null ? "" : cut(rawName.strip(), 80);
    if (name.isEmpty()) return new LinkResult(null, ApiError.INVALID_NAME);
    LinkMode mode = Wire.of(LinkMode.class, Json.at(raw, Fields.MODE));
    if (mode == null) return new LinkResult(null, ApiError.INVALID_MODE);
    String rawCode = Json.text(Json.at(raw, Fields.CODE));
    boolean typed = rawCode != null && !rawCode.strip().isEmpty();
    String code = typed ? cleanCode(rawCode) : codeFromName(name);
    if (!typed && code == null) code = randomCode();
    if (code == null) return new LinkResult(null, ApiError.INVALID_CODE);
    String rawNote = Json.text(Json.at(raw, Fields.NOTE));
    return new LinkResult(new Link(name, code, mode, rawNote == null ? "" : cut(rawNote.strip(), 300)), null);
  }

  /** Phone, tablet or computer — as far as the browser's name tells. */
  public static Device deviceOf(String userAgent) {
    String ua = userAgent == null ? "" : userAgent;
    if (TABLET.matcher(ua).find()) return Device.TABLET;
    if (MOBILE.matcher(ua).find()) return Device.MOBILE;
    return ua.isEmpty() ? null : Device.DESKTOP;
  }

  /** `game` — the game the trial was opened in (a game's page on the site leads straight into it); null — the hub. */
  public record Visit(String link, LinkMode mode, VisitVia via, String lang, String referrer, String game) {
    public Visit withLink(String code) {
      return new Visit(code, mode, via, lang, referrer, game);
    }
  }

  /** What a browser reports about an arrival, with everything odd dropped. */
  public static Visit cleanVisit(JsonNode raw) {
    JsonNode body = raw != null && raw.isObject() ? raw : Json.object();
    String rawLang = Json.text(body.get(Fields.LANG));
    String lang = rawLang == null ? "" : cut(rawLang.strip().toLowerCase(), 2);
    String rawReferrer = Json.text(body.get(Fields.REFERRER));
    String referrer = rawReferrer == null ? "" : rawReferrer.strip().toLowerCase();
    String rawGame = Json.text(body.get(Fields.GAME));
    String game = rawGame == null ? "" : rawGame.strip();
    return new Visit(
        cleanCode(Json.text(body.get(Fields.LINK))),
        Wire.of(LinkMode.class, body.get(Fields.MODE), LinkMode.DEMO),
        Wire.of(VisitVia.class, body.get(Fields.VIA), VisitVia.LINK),
        LANG.matcher(lang).matches() ? lang : null,
        HOST.matcher(referrer).matches() ? referrer : null,
        GAME.matcher(game).matches() ? game : null);
  }
}
