package com.pulsarkids.api.core;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.model.ItemScope;
import com.pulsarkids.api.model.ItemStatus;
import com.pulsarkids.api.model.Wire;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Predicate;
import java.util.function.UnaryOperator;
import java.util.regex.Pattern;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * What is offered where — the owner's rules, set on `/admin/settings/availability` and
 * kept as one setting (`wk_settings`, key `availability`). Pure: no database
 * and no request here (tested in `AvailabilityTest`).
 *
 *   regions    named groups of countries, to say «North America» once
 *   langRules  in these places only these languages are offered — on the site
 *              and in the game, each with a list of its own. The first rule
 *              that names the visitor's place decides; no rule — every language.
 *   items      a game (`game:<module>:<sub>`) or a whole galaxy (`galaxy:<id>`):
 *              its status everywhere (`on` / `soon` / `hidden`) and where it is
 *              there at all (`all`, `only` in the places listed, or everywhere
 *              `except` them).
 *
 * A place is a country (`US`, ISO 3166-1 alpha-2) or a region (`@north-america`).
 * A visitor whose country is not known is in no place: no language rule
 * applies to them, and what is offered `only` somewhere is not offered to them.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Availability {
  /** How a rule names a region among its places: `@north-america`. */
  private static final String REGION_MARK = "@";
  /** A key of `items` begins with what it is about: `galaxy:art`, `game:math:shop`. */
  private static final String GALAXY = "galaxy";

  private static final Pattern COUNTRY = Pattern.compile("^[A-Z]{2}$");
  private static final Pattern REGION_ID = Pattern.compile("^[a-z0-9][a-z0-9_-]{1,29}$");
  private static final Pattern LANG = Pattern.compile("^[a-z]{2}$");
  private static final Pattern ITEM = Pattern.compile("^(game:[\\w-]{1,40}:[\\w-]{1,60}|galaxy:[\\w-]{1,40})$");

  /** No rules at all. */
  public static ObjectNode empty() {
    ObjectNode config = Json.object();
    config.putArray(Fields.REGIONS);
    config.putArray(Fields.LANG_RULES);
    config.putObject(Fields.ITEMS);
    return config;
  }

  /** The strings of a list, each rewritten and kept when `keep` says so, without repeats, at most `max`. */
  private static ArrayNode strings(JsonNode raw, UnaryOperator<String> rewrite, Predicate<String> keep, int max) {
    ArrayNode out = Json.array();
    if (raw == null || !raw.isArray()) return out;
    Set<String> seen = new LinkedHashSet<>();
    for (JsonNode node : raw) {
      String value = rewrite.apply(node.asText().strip());
      if (keep.test(value)) seen.add(value);
    }
    seen.stream().limit(max).forEach(out::add);
    return out;
  }

  private static ArrayNode countries(JsonNode raw) {
    return strings(raw, String::toUpperCase, (code) -> COUNTRY.matcher(code).matches(), 250);
  }

  private static ArrayNode langs(JsonNode raw) {
    return strings(raw, String::toLowerCase, (code) -> LANG.matcher(code).matches(), 20);
  }

  /** Places as they are written in a rule: countries, and regions that exist. */
  private static ArrayNode places(JsonNode raw, Set<String> regionIds) {
    return strings(
        raw,
        (place) -> place.startsWith(REGION_MARK) ? place.toLowerCase() : place.toUpperCase(),
        (place) -> place.startsWith(REGION_MARK) ? regionIds.contains(place.substring(1)) : COUNTRY.matcher(place).matches(),
        300);
  }

  /** The rules as the admin panel sends them, with everything odd dropped. Never throws. */
  public static ObjectNode clean(JsonNode raw) {
    JsonNode source = raw != null && raw.isObject() ? raw : Json.object();
    ObjectNode out = Json.object();

    ArrayNode regions = out.putArray(Fields.REGIONS);
    Set<String> regionIds = new HashSet<>();
    JsonNode rawRegions = source.get(Fields.REGIONS);
    if (rawRegions != null && rawRegions.isArray()) {
      int taken = 0;
      for (JsonNode region : rawRegions) {
        if (++taken > 50) break;
        String rawId = Json.text(Json.at(region, Fields.ID));
        String rawName = Json.text(Json.at(region, Fields.NAME));
        String id = rawId == null ? "" : rawId.strip().toLowerCase();
        String name = rawName == null ? "" : rawName.strip();
        if (name.length() > 60) name = name.substring(0, 60);
        if (!REGION_ID.matcher(id).matches() || name.isEmpty() || regionIds.contains(id)) continue;
        regionIds.add(id);
        ObjectNode kept = regions.addObject();
        kept.put(Fields.ID, id);
        kept.put(Fields.NAME, name);
        kept.set(Fields.COUNTRIES, countries(Json.at(region, Fields.COUNTRIES)));
      }
    }

    ArrayNode langRules = out.putArray(Fields.LANG_RULES);
    JsonNode rawRules = source.get(Fields.LANG_RULES);
    if (rawRules != null && rawRules.isArray()) {
      int taken = 0;
      for (JsonNode rule : rawRules) {
        if (++taken > 50) break;
        ArrayNode where = places(Json.at(rule, Fields.WHERE), regionIds);
        ArrayNode site = langs(Json.at(rule, Fields.SITE));
        ArrayNode game = langs(Json.at(rule, Fields.GAME));
        // A rule that names no place, or leaves no language anywhere, says nothing.
        if (where.isEmpty() || (site.isEmpty() && game.isEmpty())) continue;
        ObjectNode kept = langRules.addObject();
        kept.set(Fields.WHERE, where);
        kept.set(Fields.SITE, site);
        kept.set(Fields.GAME, game);
      }
    }

    ObjectNode items = out.putObject(Fields.ITEMS);
    JsonNode rawItems = source.get(Fields.ITEMS);
    if (rawItems != null && rawItems.isObject()) {
      int taken = 0;
      for (Map.Entry<String, JsonNode> entry : rawItems.properties()) {
        if (++taken > 500) break;
        JsonNode item = entry.getValue();
        if (!ITEM.matcher(entry.getKey()).matches() || item == null || !item.isObject()) continue;
        ItemStatus status = Wire.of(ItemStatus.class, item.get(Fields.STATUS), ItemStatus.ON);
        ArrayNode where = places(item.get(Fields.WHERE), regionIds);
        // «Only» or «except» with no place listed is «everywhere».
        ItemScope scope = where.isEmpty() ? ItemScope.ALL : Wire.of(ItemScope.class, item.get(Fields.SCOPE), ItemScope.ALL);
        // What is as it would be without a rule is not written down.
        if (status == ItemStatus.ON && scope == ItemScope.ALL) continue;
        ObjectNode kept = items.putObject(entry.getKey());
        kept.put(Fields.STATUS, status.wire());
        kept.put(Fields.SCOPE, scope.wire());
        kept.set(Fields.WHERE, scope == ItemScope.ALL ? Json.array() : where);
      }
    }
    return out;
  }

  /** Is `country` one of these places? */
  private static boolean isIn(String country, JsonNode where, Map<String, List<String>> regions) {
    if (country == null || country.isEmpty()) return false;
    for (JsonNode node : where) {
      String place = node.asText();
      if (place.startsWith(REGION_MARK)) {
        List<String> countries = regions.get(place.substring(1));
        if (countries != null && countries.contains(country)) return true;
      } else if (place.equals(country)) {
        return true;
      }
    }
    return false;
  }

  private static List<String> list(JsonNode array) {
    List<String> out = new ArrayList<>();
    for (JsonNode node : array) out.add(node.asText());
    return out;
  }

  /**
   * The rules as they stand for a visitor from `country` — what the site and the
   * game are told (`GET /api/health`):
   *
   *   langs.site / langs.game   the languages offered, or null — all of them
   *   games / galaxies          the keys that are `hidden`, and those that are `soon`
   */
  public static Map<String, Object> forCountry(JsonNode config, String country) {
    Map<String, List<String>> regions = new HashMap<>();
    for (JsonNode region : config.get(Fields.REGIONS)) regions.put(region.get(Fields.ID).asText(), list(region.get(Fields.COUNTRIES)));

    List<String> site = null;
    List<String> game = null;
    for (JsonNode rule : config.get(Fields.LANG_RULES)) {
      if (!isIn(country, rule.get(Fields.WHERE), regions)) continue;
      if (!rule.get(Fields.SITE).isEmpty()) site = list(rule.get(Fields.SITE));
      if (!rule.get(Fields.GAME).isEmpty()) game = list(rule.get(Fields.GAME));
      break;
    }

    Map<ItemStatus, List<String>> games = new EnumMap<>(Map.of(ItemStatus.HIDDEN, new ArrayList<>(), ItemStatus.SOON, new ArrayList<>()));
    Map<ItemStatus, List<String>> galaxies = new EnumMap<>(Map.of(ItemStatus.HIDDEN, new ArrayList<>(), ItemStatus.SOON, new ArrayList<>()));
    for (Map.Entry<String, JsonNode> entry : config.get(Fields.ITEMS).properties()) {
      JsonNode item = entry.getValue();
      ItemScope scope = Wire.of(ItemScope.class, item.get(Fields.SCOPE), ItemScope.ALL);
      boolean inside = isIn(country, item.get(Fields.WHERE), regions);
      boolean here = scope == ItemScope.ALL || (scope == ItemScope.ONLY ? inside : !inside);
      ItemStatus status = Wire.of(ItemStatus.class, item.get(Fields.STATUS), ItemStatus.ON);
      ItemStatus state = here ? status : ItemStatus.HIDDEN;
      if (state == ItemStatus.ON) continue;
      int colon = entry.getKey().indexOf(':');
      String kind = entry.getKey().substring(0, colon);
      (kind.equals(GALAXY) ? galaxies : games).get(state).add(entry.getKey().substring(colon + 1));
    }

    return Json.map(
        Fields.LANGS, Json.map(Fields.SITE, site, Fields.GAME, game),
        Fields.GAMES, listed(games),
        Fields.GALAXIES, listed(galaxies));
  }

  /** `{ hidden: […], soon: […] }`. */
  private static Map<String, Object> listed(Map<ItemStatus, List<String>> keys) {
    return Json.map(ItemStatus.HIDDEN.wire(), keys.get(ItemStatus.HIDDEN), ItemStatus.SOON.wire(), keys.get(ItemStatus.SOON));
  }
}
