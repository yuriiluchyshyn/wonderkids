package com.pulsarkids.api.core;

import com.pulsarkids.api.model.BillingPeriod;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.model.Lang;
import com.pulsarkids.api.model.PlanFact;
import com.pulsarkids.api.model.PlanKind;
import com.pulsarkids.api.model.Wire;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * The plans of Pulsar Kids as Stripe keeps them, turned into what the site and
 * the game show. Stripe is the one place they are written — the owner edits a
 * plan, a price or a line of «what is included» in the Dashboard and the pages
 * follow. Nothing here calls Stripe: `BillingService` hands in the products and
 * prices it read.
 *
 * A product is ours when `metadata.app` is `pulsar-kids` and `metadata.kind` is a
 * `PlanKind`. Its metadata:
 *
 *   kind                 free | paid | extra_child
 *   order                where it stands among the plans (1, 2, …)
 *   plan                 extra_child only: the id of the paid plan it adds to
 *   name_<lang>          its name in a language (else the product's name)
 *   tagline_<lang>       who it is for, one line
 *   badge_<lang>         a mark over the card («For the whole family»), optional
 *   feature_<n>_<lang>   what it includes, line n = 1, 2, … (else the product's
 *                        marketing features, for a language with no lines of its own)
 *   daily_minutes, trial_days, children_included   its numbers (`PlanFact`)
 *
 * A price's metadata says whose it is:
 *
 *   region      its region's id (UA, PL, US, …) — one price per region and period
 *   countries   the countries (ISO alpha-2, comma-separated) that pay it
 *   fallback    true — the region of every country no region names
 *   langs       the site's languages whose page shows this region first (uk)
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Catalog {
  private static final String APP = "app";
  private static final String APP_VALUE = "pulsar-kids";
  private static final String KIND = "kind";
  private static final String ORDER = "order";
  private static final String PLAN = "plan";
  private static final String NAME = "name_";
  private static final String TAGLINE = "tagline_";
  private static final String BADGE = "badge_";
  private static final String FEATURE = "feature_";
  private static final String REGION = "region";
  private static final String COUNTRIES = "countries";
  private static final String FALLBACK = "fallback";
  private static final String LANGS = "langs";
  private static final String TRUE = "true";
  /** Stripe's word for a price the tax is added on top of. */
  private static final String EXCLUSIVE = "exclusive";
  private static final String LIST_SEPARATOR = ",";
  private static final String LANG_SEPARATOR = "_";
  private static final int MAX_FEATURES = 20;

  /** A Stripe product, as much of it as the catalogue reads. */
  public record Product(String id, String name, boolean active, Map<String, String> metadata, List<String> marketingFeatures) {}

  /** A Stripe price of a recurring plan. */
  public record Price(String id, String productId, String currency, String interval, long amount, boolean active, Map<String, String> metadata, String taxBehavior) {}

  /** A region whose prices a family pays. */
  public record Region(String id, String currency, List<String> countries, boolean fallback, List<String> langs) {}

  /** What the clients are sent: every region and every plan, in their order — and what it was made of, for an order. */
  public record View(List<Region> regions, List<Map<String, Object>> plans, List<Product> products, List<Price> prices) {}

  /** The most children one order may name; a family with more writes to the owner. */
  public static final int MAX_CHILDREN = 20;

  /** What a checkout charges: the plan's price, and as many extra-child slots as there are children beyond those included. */
  public record Order(String planId, String region, BillingPeriod period, int children, String planPriceId, String extraPriceId, int extraChildren, Integer trialDays) {}

  /** Why an order cannot be made. */
  public enum Refusal { NO_PLAN, NO_PRICE, BAD_CHILDREN }

  /** An order, or why there is none. */
  public record OrderResult(Order order, Refusal refusal) {}

  /**
   * The order for a paid plan in a region and period for `children` children —
   * from the prices Stripe has, never from what the client says they cost.
   */
  public static OrderResult order(View view, String planId, String regionId, BillingPeriod period, int children) {
    Product plan = view.products().stream().filter((p) -> p.id().equals(planId) && p.active() && isOurs(p) && kindOf(p) == PlanKind.PAID).findFirst().orElse(null);
    if (plan == null || period == null || regionId == null) return new OrderResult(null, Refusal.NO_PLAN);
    String region = regionId.toUpperCase(Locale.ROOT);
    Price price = priceFor(view.prices(), plan.id(), region, period);
    if (price == null) return new OrderResult(null, Refusal.NO_PRICE);
    Map<String, Object> facts = facts(plan);
    int included = facts.get(PlanFact.CHILDREN_INCLUDED.wire()) instanceof Integer n ? n : 1;
    if (children < included || children > MAX_CHILDREN) return new OrderResult(null, Refusal.BAD_CHILDREN);
    int extra = children - included;
    String extraPriceId = null;
    if (extra > 0) {
      Product slot = view.products().stream().filter((p) -> p.active() && isOurs(p) && kindOf(p) == PlanKind.EXTRA_CHILD && plan.id().equals(meta(p, PLAN))).findFirst().orElse(null);
      Price extraPrice = slot == null ? null : priceFor(view.prices(), slot.id(), region, period);
      if (extraPrice == null) return new OrderResult(null, Refusal.NO_PRICE);
      extraPriceId = extraPrice.id();
    }
    Integer trial = facts.get(PlanFact.TRIAL_DAYS.wire()) instanceof Integer days && days > 0 ? days : null;
    return new OrderResult(new Order(plan.id(), region, period, children, price.id(), extraPriceId, extra, trial), null);
  }

  /** A price of the catalogue by its Stripe id, or null. */
  public static Price priceById(View view, String priceId) {
    return view.prices().stream().filter((price) -> price.id().equals(priceId)).findFirst().orElse(null);
  }

  /** What a product of the catalogue is, or null for one that is not ours. */
  public static PlanKind kindOf(View view, String productId) {
    return view.products().stream().filter((p) -> p.id().equals(productId) && isOurs(p)).findFirst().map(Catalog::kindOf).orElse(null);
  }

  /** How many children a paid plan includes before a slot is added (1 when it does not say). */
  public static int childrenIncluded(View view, String planId) {
    Product plan = view.products().stream().filter((p) -> p.id().equals(planId)).findFirst().orElse(null);
    return plan != null && facts(plan).get(PlanFact.CHILDREN_INCLUDED.wire()) instanceof Integer n ? n : 1;
  }

  /** The minutes a day the free plan allows (its `daily_minutes`), or `fallback` when the catalogue does not say. */
  public static int dailyMinutes(View view, int fallback) {
    return view.products().stream()
        .filter((p) -> p.active() && isOurs(p) && kindOf(p) == PlanKind.FREE)
        .findFirst()
        .map((p) -> facts(p).get(PlanFact.DAILY_MINUTES.wire()) instanceof Integer n && n > 0 ? n : fallback)
        .orElse(fallback);
  }
  /** The region a price is of (its metadata), or null. */
  public static String regionOf(Price price) {
    String region = price.metadata() == null ? null : price.metadata().get(REGION);
    return region == null ? null : region.strip().toUpperCase(Locale.ROOT);
  }

  private static Price priceFor(List<Price> prices, String productId, String region, BillingPeriod period) {
    for (Price price : prices) {
      if (!price.active() || !productId.equals(price.productId()) || price.metadata() == null) continue;
      String own = price.metadata().get(REGION);
      if (own != null && own.strip().equalsIgnoreCase(region) && period == Wire.of(BillingPeriod.class, price.interval())) return price;
    }
    return null;
  }

  public static View build(List<Product> products, List<Price> prices) {
    Map<String, Region> regions = new TreeMap<>();
    List<Product> ours = products.stream().filter(Product::active).filter(Catalog::isOurs).sorted(Comparator.comparingInt(Catalog::order)).toList();

    List<Map<String, Object>> plans = new ArrayList<>();
    for (Product product : ours) {
      PlanKind kind = kindOf(product);
      if (kind == PlanKind.EXTRA_CHILD) continue;
      Map<String, Object> plan = Json.map(
          Fields.ID, product.id(),
          Fields.KIND, kind.wire(),
          Fields.NAME, perLang((lang) -> text(product, NAME, lang, product.name())),
          Fields.TAGLINE, perLang((lang) -> text(product, TAGLINE, lang, null)),
          Fields.BADGE, perLang((lang) -> text(product, BADGE, lang, null)),
          Fields.FEATURES, perLang((lang) -> features(product, lang)),
          Fields.FACTS, facts(product),
          Fields.PRICES, pricesOf(product.id(), prices, regions),
          Fields.EXTRA_CHILD, ours.stream()
              .filter((extra) -> kindOf(extra) == PlanKind.EXTRA_CHILD && product.id().equals(meta(extra, PLAN)))
              .findFirst()
              .map((extra) -> pricesOf(extra.id(), prices, regions))
              .orElse(List.of()));
      plans.add(plan);
    }
    return new View(List.copyOf(regions.values()), plans, List.copyOf(products), List.copyOf(prices));
  }

  /**
   * The region of a visitor from `country`: the one that names it, else the
   * fallback. Null when the country is not known (off Vercel) — the page then
   * shows its language's region.
   */
  public static Region regionFor(List<Region> regions, String country) {
    if (country == null || country.isBlank()) return null;
    String code = country.toUpperCase(Locale.ROOT);
    for (Region region : regions) if (region.countries().contains(code)) return region;
    return regions.stream().filter(Region::fallback).findFirst().orElse(null);
  }

  /** A region as the clients read it. */
  public static Map<String, Object> regionView(Region region) {
    return Json.map(Fields.ID, region.id(), Fields.CURRENCY, region.currency(), Fields.COUNTRIES, region.countries(), Fields.FALLBACK, region.fallback(), Fields.LANGS, region.langs());
  }

  private static boolean isOurs(Product product) {
    return APP_VALUE.equals(meta(product, APP)) && kindOf(product) != null;
  }

  private static PlanKind kindOf(Product product) {
    return Wire.of(PlanKind.class, meta(product, KIND));
  }

  private static int order(Product product) {
    try {
      return Integer.parseInt(meta(product, ORDER));
    } catch (NumberFormatException | NullPointerException err) {
      return Integer.MAX_VALUE;
    }
  }

  private static String meta(Product product, String key) {
    return product.metadata() == null ? null : product.metadata().get(key);
  }

  private static String text(Product product, String prefix, Lang lang, String fallback) {
    String own = meta(product, prefix + lang.wire());
    return own == null || own.isBlank() ? fallback : own.strip();
  }

  private static List<String> features(Product product, Lang lang) {
    List<String> lines = new ArrayList<>();
    for (int n = 1; n <= MAX_FEATURES; n++) {
      String line = meta(product, FEATURE + n + LANG_SEPARATOR + lang.wire());
      if (line != null && !line.isBlank()) lines.add(line.strip());
    }
    return lines.isEmpty() && product.marketingFeatures() != null ? product.marketingFeatures() : lines;
  }

  private static Map<String, Object> facts(Product product) {
    Map<String, Object> out = new LinkedHashMap<>();
    for (PlanFact fact : PlanFact.values()) {
      String raw = meta(product, fact.getMetadataKey());
      if (raw == null) continue;
      try {
        out.put(fact.wire(), Integer.parseInt(raw.strip()));
      } catch (NumberFormatException err) {
        /* not a number: left out */
      }
    }
    return out;
  }

  private static <T> Map<String, T> perLang(java.util.function.Function<Lang, T> of) {
    Map<String, T> out = new LinkedHashMap<>();
    for (Lang lang : Lang.values()) out.put(lang.wire(), of.apply(lang));
    return out;
  }

  /** A product's active prices with a region, each `{ region, period, amount, currency }`; their regions are noted on the way. */
  private static List<Map<String, Object>> pricesOf(String productId, List<Price> prices, Map<String, Region> regions) {
    List<Map<String, Object>> out = new ArrayList<>();
    for (Price price : prices) {
      if (!price.active() || !productId.equals(price.productId())) continue;
      BillingPeriod period = Wire.of(BillingPeriod.class, price.interval());
      String region = price.metadata() == null ? null : price.metadata().get(REGION);
      if (period == null || region == null || region.isBlank()) continue;
      String id = region.strip().toUpperCase(Locale.ROOT);
      String currency = price.currency().toUpperCase(Locale.ROOT);
      regions.putIfAbsent(id, new Region(id, currency, list(price.metadata().get(COUNTRIES), true), TRUE.equals(price.metadata().get(FALLBACK)), list(price.metadata().get(LANGS), false)));
      // Tax is in the price unless Stripe says it is added on top (the US: sales tax by state).
      out.add(Json.map(Fields.REGION, id, Fields.PERIOD, period.wire(), Fields.AMOUNT, price.amount(), Fields.CURRENCY, currency, Fields.TAX_INCLUDED, !EXCLUSIVE.equals(price.taxBehavior())));
    }
    return out;
  }

  private static List<String> list(String raw, boolean upper) {
    if (raw == null || raw.isBlank()) return List.of();
    return Arrays.stream(raw.split(LIST_SEPARATOR)).map(String::strip).filter((s) -> !s.isEmpty()).map((s) -> upper ? s.toUpperCase(Locale.ROOT) : s.toLowerCase(Locale.ROOT)).toList();
  }
}
