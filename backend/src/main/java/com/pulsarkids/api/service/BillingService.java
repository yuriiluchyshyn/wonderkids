package com.pulsarkids.api.service;

import com.pulsarkids.api.core.Billing;
import com.pulsarkids.api.core.Catalog;
import com.pulsarkids.api.core.Env;
import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.core.Vars;
import com.pulsarkids.api.model.Fields;
import com.stripe.StripeClient;
import com.stripe.exception.StripeException;
import com.stripe.model.Account;
import com.stripe.model.Price;
import com.stripe.model.Product;
import com.stripe.model.checkout.Session;
import com.stripe.param.PriceListParams;
import com.stripe.param.ProductListParams;
import com.stripe.param.tax.RegistrationListParams;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * The way to Stripe (billing spec §6). One `StripeClient` per running
 * instance, made from `STRIPE_SECRET_KEY` when first needed; without the key
 * billing is simply off — nothing else of the API depends on it.
 *
 * The plans, their prices and what they include are Stripe's (`Catalog`); a
 * running instance reads them at most every five minutes, so an edit in the
 * Dashboard reaches the pages within that.
 */
@Slf4j
@Service
public class BillingService {
  private static final long CATALOG_TTL_MS = 5 * 60_000;
  private static final long PAGE = 100;

  /** Stripe's word for settings that are complete. */
  private static final String ACTIVE = "active";
  /** The language of the page the family paid on — the one its invoices are mailed in. */
  public static final String META_LANG = "lang";
  private static final SecureRandom RANDOM = new SecureRandom();

  private volatile Boolean taxReady;
  private volatile long taxReadyAt;
  private volatile StripeClient client;
  private volatile Catalog.View catalog;
  private volatile long catalogAt;

  /** Whether a key is set at all. */
  public boolean configured() {
    String key = Env.get(Vars.STRIPE_SECRET_KEY);
    return key != null && !key.isBlank();
  }

  /** The client, or null when no key is set. */
  public StripeClient client() {
    StripeClient made = client;
    if (made != null || !configured()) return made;
    synchronized (this) {
      if (client == null) client = new StripeClient(Env.get(Vars.STRIPE_SECRET_KEY).strip());
      return client;
    }
  }

  /** The plans as Stripe has them, at most five minutes old. Throws when Stripe cannot be read and nothing was read before. */
  public Catalog.View catalog() throws StripeException {
    Catalog.View kept = catalog;
    if (kept != null && System.currentTimeMillis() - catalogAt < CATALOG_TTL_MS) return kept;
    try {
      Catalog.View read = readCatalog();
      catalog = read;
      catalogAt = System.currentTimeMillis();
      return read;
    } catch (StripeException err) {
      // A stale catalogue is better than no prices at all.
      if (kept != null) {
        log.error("[billing] catalogue not refreshed, the old one stays: {}", err.getMessage());
        return kept;
      }
      throw err;
    }
  }

  /** The catalogue for a visitor from `country`: theirs is `region`. */
  public Map<String, Object> plansFor(String country) throws StripeException {
    Catalog.View view = catalog();
    Catalog.Region region = Catalog.regionFor(view.regions(), country);
    return Json.map(
        Fields.COUNTRY, country,
        Fields.REGION, region == null ? null : region.id(),
        Fields.REGIONS, view.regions().stream().map(Catalog::regionView).toList(),
        Fields.PLANS, view.plans());
  }

  private Catalog.View readCatalog() throws StripeException {
    List<Catalog.Product> products = new ArrayList<>();
    for (Product product : client().v1().products().list(ProductListParams.builder().setActive(true).setLimit(PAGE).build()).autoPagingIterable()) {
      List<String> marketing = product.getMarketingFeatures() == null ? List.of() : product.getMarketingFeatures().stream().map(Product.MarketingFeature::getName).toList();
      products.add(new Catalog.Product(product.getId(), product.getName(), Boolean.TRUE.equals(product.getActive()), product.getMetadata(), marketing));
    }
    List<Catalog.Price> prices = new ArrayList<>();
    for (Price price : client().v1().prices().list(PriceListParams.builder().setActive(true).setType(PriceListParams.Type.RECURRING).setLimit(PAGE).build()).autoPagingIterable()) {
      if (price.getUnitAmount() == null || price.getRecurring() == null) continue;
      prices.add(new Catalog.Price(price.getId(), price.getProduct(), price.getCurrency(), price.getRecurring().getInterval(), price.getUnitAmount(), Boolean.TRUE.equals(price.getActive()), price.getMetadata(), price.getTaxBehavior()));
    }
    return Catalog.build(products, prices);
  }

  // ---------------------------------------------------------------------------
  // Checkout
  // ---------------------------------------------------------------------------

  /** How a checkout ended: Stripe's `status` (open, complete, expired) and the address the family gave. */
  public Map<String, Object> checkoutStatus(String sessionId) throws StripeException {
    Session session = client().v1().checkout().sessions().retrieve(sessionId);
    String email = session.getCustomerDetails() == null ? null : session.getCustomerDetails().getEmail();
    return Json.map(Fields.STATUS, session.getStatus(), Fields.EMAIL, email);
  }

  /** The publishable key the page initialises Stripe.js with — public by design. */
  public String publishableKey() {
    String key = Env.get(Vars.STRIPE_PUBLISHABLE_KEY);
    if (key == null || key.isBlank()) key = Env.get(Vars.VITE_STRIPE_PUBLISHABLE_KEY);
    return key == null ? null : key.strip();
  }

  /**
   * Whether Stripe Tax may be switched on: its settings are complete and the
   * account has at least one active registration. Read at most every five minutes.
   */
  public boolean taxReady() {
    Boolean kept = taxReady;
    if (kept != null && System.currentTimeMillis() - taxReadyAt < CATALOG_TTL_MS) return kept;
    boolean ready;
    try {
      ready = ACTIVE.equals(client().v1().tax().settings().retrieve().getStatus())
          && !client().v1().tax().registrations().list(RegistrationListParams.builder().setStatus(RegistrationListParams.Status.ACTIVE).setLimit(1L).build()).getData().isEmpty();
    } catch (StripeException err) {
      log.error("[billing] tax settings not read: {}", err.getMessage());
      ready = false;
    }
    taxReady = ready;
    taxReadyAt = System.currentTimeMillis();
    return ready;
  }

  /** Letters for the label of a checkout in Stripe's Dashboard. */
  static String randomLetters(int count) {
    StringBuilder out = new StringBuilder(count);
    for (int i = 0; i < count; i++) out.append((char) ('a' + RANDOM.nextInt(26)));
    return out.toString();
  }

  /**
   * What the admin panel shows of the connection: the mode, the account the
   * key opens, and how many plans and regions the catalogue has. Never the key.
   */
  public Map<String, Object> status() {
    if (!configured()) return Json.map(Fields.CONFIGURED, false);
    String mode = Billing.modeOf(Env.get(Vars.STRIPE_SECRET_KEY)).wire();
    try {
      Account account = client().v1().accounts().retrieveCurrent();
      String name = account.getSettings() != null && account.getSettings().getDashboard() != null ? account.getSettings().getDashboard().getDisplayName() : null;
      catalogAt = 0; // the owner asked: read Stripe anew
      Catalog.View view = catalog();
      return Json.map(
          Fields.CONFIGURED, true,
          Fields.OK, true,
          Fields.MODE, mode,
          Fields.ACCOUNT, Json.map(Fields.ID, account.getId(), Fields.NAME, name, Fields.COUNTRY, account.getCountry()),
          Fields.PLANS, view.plans().size(),
          Fields.REGIONS, view.regions().stream().map(Catalog.Region::id).toList());
    } catch (StripeException err) {
      log.error("[billing] Stripe not reached: {}", err.getMessage());
      return Json.map(Fields.CONFIGURED, true, Fields.OK, false, Fields.MODE, mode, Fields.DETAIL, err.getMessage());
    }
  }
}
