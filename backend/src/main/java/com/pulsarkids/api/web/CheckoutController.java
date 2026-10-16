package com.pulsarkids.api.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.pulsarkids.api.config.CorsFilter;
import com.pulsarkids.api.core.Auth;
import com.pulsarkids.api.core.Catalog;
import com.pulsarkids.api.core.Env;
import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.core.Vars;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.BillingPeriod;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.model.Lang;
import com.pulsarkids.api.model.Wire;
import com.pulsarkids.api.service.BillingService;
import com.pulsarkids.api.service.MarketingService;
import com.pulsarkids.api.service.SubscriptionService;
import com.stripe.exception.StripeException;
import jakarta.servlet.http.HttpServletRequest;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Paying for Family — from the paywall of the parents' portal, a parent signed in:
 *
 *   POST /api/billing/checkout  { plan, period: "month"|"year", children, promo?, region?, lang? }
 *        → { sessionId, clientSecret, publishableKey }   Stripe's Checkout (`elements` mode): the page
 *          mounts the address and card fields and draws the summary itself
 *        → { gift: true }   a promotion code of a coupon 100 % off for ever: Family with no payment
 *   GET  /api/billing/checkout?session=cs_…  → { status, email }   how it ended
 *
 * The region is the visitor's country's (`x-vercel-ip-country`); `region` from
 * the page counts only where the country is not known. The prices are Stripe's,
 * found by the order (`Catalog.order`) — the page never names an amount. A code
 * Stripe does not have active is refused neutrally: 400 `offer_inactive`.
 * Off while the paid mode is off or Stripe has no key: 503 `billing_off`.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(Routes.BILLING_CHECKOUT)
public class CheckoutController extends ApiController {
  /** What a Checkout Session's id looks like. */
  private static final Pattern SESSION_ID = Pattern.compile("^cs_(test|live)_[A-Za-z0-9]{10,200}$");
  private static final String DEFAULT_PARENTS = "https://parents.pulsarkids.com";
  /** Where Stripe brings a parent back after a payment that had to leave the page (3-D Secure, a bank's app). */
  private static final String RETURN_PATH = "/parent?checkout={CHECKOUT_SESSION_ID}";

  private final BillingService billing;
  private final MarketingService marketing;
  private final SubscriptionService subscriptions;

  static Auth.User requireParent(HttpServletRequest request) {
    Auth.User user = Requests.requireUser(request);
    if (user.childId() != null) throw new HttpError(ApiError.PARENT_ONLY);
    return user;
  }

  private void requireOn() {
    if (!billing.configured() || !marketing.paidModeOn()) throw new HttpError(ApiError.BILLING_OFF);
  }

  /** Our own page the request came from (its origin), else the parents' portal. */
  static String parentsOrigin(HttpServletRequest request) {
    String origin = request.getHeader(Headers.ORIGIN);
    if (origin != null && CorsFilter.isOurs(origin)) return origin.replaceFirst("/+$", "");
    String own = Env.get(Vars.PARENTS_URL, "").strip().replaceFirst("/+$", "");
    return own.isEmpty() ? DEFAULT_PARENTS : own;
  }

  @PostMapping
  public ResponseEntity<Object> start(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
    Auth.User user = requireParent(request);
    requireOn();
    BillingPeriod period = Wire.of(BillingPeriod.class, Json.at(body, Fields.PERIOD));
    String planId = Json.text(Json.at(body, Fields.PLAN));
    JsonNode rawChildren = Json.at(body, Fields.CHILDREN);
    if (planId == null || period == null) throw new HttpError(ApiError.INVALID_PLAN);
    if (!Json.isInt(rawChildren)) throw new HttpError(ApiError.INVALID_CHILDREN);
    try {
      Catalog.View view = billing.catalog();
      Catalog.Region region = Catalog.regionFor(view.regions(), Requests.country(request));
      String regionId = region != null ? region.id() : Json.text(Json.at(body, Fields.REGION));
      if (regionId == null) regionId = view.regions().stream().filter(Catalog.Region::fallback).map(Catalog.Region::id).findFirst().orElse(null);
      Catalog.OrderResult result = Catalog.order(view, planId, regionId, period, (int) Json.intOf(rawChildren));
      if (result.refusal() == Catalog.Refusal.BAD_CHILDREN) throw new HttpError(ApiError.INVALID_CHILDREN);
      if (result.order() == null) throw new HttpError(ApiError.INVALID_PLAN);
      Lang lang = Wire.of(Lang.class, Json.at(body, Fields.LANG), messages.lang());
      SubscriptionService.Begun begun = subscriptions.checkout((int) user.id(), user.email(), result.order(), Json.text(Json.at(body, Fields.PROMO)), lang, parentsOrigin(request) + RETURN_PATH);
      if (begun.gift()) return fresh(Json.map(Fields.GIFT, true));
      return fresh(Json.map(Fields.SESSION_ID, begun.sessionId(), Fields.CLIENT_SECRET, begun.clientSecret(), Fields.PUBLISHABLE_KEY, billing.publishableKey()));
    } catch (StripeException err) {
      log.error("[billing] checkout not begun: {}", err.getMessage());
      throw new HttpError(ApiError.BILLING_UNREACHABLE);
    }
  }

  @GetMapping
  public ResponseEntity<Object> status(HttpServletRequest request, @RequestParam(name = Fields.SESSION, required = false) String sessionId) {
    requireParent(request);
    requireOn();
    if (sessionId == null || !SESSION_ID.matcher(sessionId).matches()) throw new HttpError(ApiError.INVALID_SESSION);
    try {
      return fresh(billing.checkoutStatus(sessionId));
    } catch (StripeException err) {
      log.error("[billing] checkout not read: {}", err.getMessage());
      throw new HttpError(ApiError.INVALID_SESSION);
    }
  }

  static ResponseEntity<Object> fresh(Object body) {
    return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(body);
  }
}
