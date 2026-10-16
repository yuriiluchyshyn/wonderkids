package com.pulsarkids.api.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.pulsarkids.api.core.Auth;
import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.BillingPeriod;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.model.PlanChoice;
import com.pulsarkids.api.model.Wire;
import com.pulsarkids.api.service.BillingService;
import com.pulsarkids.api.service.MarketingService;
import com.pulsarkids.api.service.SubscriptionService;
import com.stripe.exception.StripeException;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * The plan of the signed-in parent's account (the paywall and the cabinet):
 *
 *   GET  /api/billing/me             → { paidMode, access, mustChoose, plan, gift }
 *   POST /api/billing/choose         { plan: "free" }   the free plan
 *   PUT  /api/billing/subscription   { children?, period?, cancel? }   change the paid plan (Stripe prorates),
 *                                    or go to the free plan at the end of the paid period / keep Family
 *   POST /api/billing/children/preview  { add }
 *        → { add, children, childrenAfter, amount, currency, prorationDate, trialing, nextCharge }
 *          what adding `add` children costs NOW (Stripe's prorations, in minor units); nothing is charged
 *   POST /api/billing/children          { add, prorationDate, amount }   the parent approved the amount shown:
 *        Stripe charges it at once and the children are added → the state as `me` + { charged: { amount, currency } };
 *        409 `price_changed` when the amount is no longer that, 402 `payment_failed` when the card is declined
 *        (then nothing changes). A letter about it goes to the parent.
 *   GET  /api/billing/details        → { card: { brand, last4, expMonth, expYear } | null, invoices: [{ id, number, created, amount, currency, status, hostedUrl, pdfUrl }] }
 *                                    the card the subscription is paid with and the latest invoices (Stripe's)
 *   POST /api/billing/portal         { flow?: "card" } → { url }   Stripe's portal: the card, the invoices; `card` — straight at changing the card
 *   (PUT subscription refuses with 409 `children_in_use` to give up a place a child's profile is in)
 *
 * A parent's session only (403 `parent_only` for a child's). The changes need
 * the paid mode on (503 `billing_off`); `me` always answers — with `paidMode: false`.
 */
@RestController
@RequiredArgsConstructor
public class BillingAccountController extends ApiController {
  private static final String CABINET = "/parent";
  private static final String CABINET_SUBSCRIPTION = "/parent/subscription";

  private final SubscriptionService subscriptions;
  private final BillingService billing;
  private final MarketingService marketing;

  private void requireOn() {
    if (!billing.configured() || !marketing.paidModeOn()) throw new HttpError(ApiError.BILLING_OFF);
  }

  @GetMapping(Routes.BILLING_ME)
  public ResponseEntity<Object> me(HttpServletRequest request) {
    Auth.User user = CheckoutController.requireParent(request);
    return CheckoutController.fresh(subscriptions.stateOf((int) user.id()));
  }

  @PostMapping(Routes.BILLING_CHOOSE)
  public ResponseEntity<Object> choose(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
    Auth.User user = CheckoutController.requireParent(request);
    // The free plan needs no Stripe — only the paid mode, in which plans are chosen at all.
    if (!marketing.paidModeOn()) throw new HttpError(ApiError.BILLING_OFF);
    if (Wire.of(PlanChoice.class, Json.at(body, Fields.PLAN)) != PlanChoice.FREE) throw new HttpError(ApiError.INVALID_PLAN);
    subscriptions.chooseFree((int) user.id());
    return CheckoutController.fresh(subscriptions.stateOf((int) user.id()));
  }

  @PutMapping(Routes.BILLING_SUBSCRIPTION)
  public ResponseEntity<Object> change(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
    Auth.User user = CheckoutController.requireParent(request);
    requireOn();
    try {
      JsonNode cancel = Json.at(body, Fields.CANCEL);
      if (cancel.isBoolean()) {
        subscriptions.setCancel((int) user.id(), cancel.booleanValue());
      } else {
        JsonNode children = Json.at(body, Fields.CHILDREN);
        BillingPeriod period = Wire.of(BillingPeriod.class, Json.at(body, Fields.PERIOD));
        if (Json.present(children) && !Json.isInt(children)) throw new HttpError(ApiError.INVALID_CHILDREN);
        if (!Json.present(children) && period == null) throw new HttpError(ApiError.INVALID_PLAN);
        subscriptions.change((int) user.id(), Json.present(children) ? (int) Json.intOf(children) : null, period);
      }
    } catch (StripeException err) {
      log.error("[billing] subscription not changed: {}", err.getMessage());
      throw new HttpError(ApiError.BILLING_UNREACHABLE);
    }
    return CheckoutController.fresh(subscriptions.stateOf((int) user.id()));
  }

  /** How many children are asked to be added: a whole number from 1. */
  private static int added(JsonNode body) {
    JsonNode add = Json.at(body, Fields.ADD);
    if (!Json.isInt(add) || Json.intOf(add) < 1 || Json.intOf(add) > 100) throw new HttpError(ApiError.INVALID_CHILDREN);
    return (int) Json.intOf(add);
  }

  @PostMapping(Routes.BILLING_CHILDREN_PREVIEW)
  public ResponseEntity<Object> previewChildren(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
    Auth.User user = CheckoutController.requireParent(request);
    requireOn();
    try {
      SubscriptionService.ChildrenQuote quote = subscriptions.quoteChildren((int) user.id(), added(body));
      return CheckoutController.fresh(Json.map(
          Fields.ADD, quote.add(),
          Fields.CHILDREN, quote.children(),
          Fields.CHILDREN_AFTER, quote.childrenAfter(),
          Fields.AMOUNT, quote.amount(),
          Fields.CURRENCY, quote.currency(),
          Fields.PRORATION_DATE, quote.prorationDate(),
          Fields.TRIALING, quote.trialing(),
          Fields.NEXT_CHARGE, Json.iso(quote.nextCharge())));
    } catch (StripeException err) {
      log.error("[billing] children not quoted: {}", err.getMessage());
      throw new HttpError(ApiError.BILLING_UNREACHABLE);
    }
  }

  @PostMapping(Routes.BILLING_CHILDREN)
  public ResponseEntity<Object> addChildren(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
    Auth.User user = CheckoutController.requireParent(request);
    requireOn();
    JsonNode date = Json.at(body, Fields.PRORATION_DATE);
    JsonNode shown = Json.at(body, Fields.AMOUNT);
    if (!Json.isInt(date) || !Json.isInt(shown)) throw new HttpError(ApiError.PRICE_CHANGED);
    try {
      SubscriptionService.ChildrenAdded done = subscriptions.addChildren((int) user.id(), added(body), Json.intOf(date), Json.intOf(shown), messages.lang());
      // The state as the cabinet reads it, and what was charged for this.
      Map<String, Object> state = new java.util.LinkedHashMap<>(subscriptions.stateOf((int) user.id()));
      state.put(Fields.CHARGED, Json.map(Fields.AMOUNT, done.charged(), Fields.CURRENCY, done.currency()));
      return CheckoutController.fresh(state);
    } catch (StripeException err) {
      log.error("[billing] children not added: {}", err.getMessage());
      throw new HttpError(ApiError.BILLING_UNREACHABLE);
    }
  }

  @GetMapping(Routes.BILLING_DETAILS)
  public ResponseEntity<Object> details(HttpServletRequest request) {
    Auth.User user = CheckoutController.requireParent(request);
    requireOn();
    try {
      return CheckoutController.fresh(subscriptions.details((int) user.id()));
    } catch (StripeException err) {
      log.error("[billing] details not read: {}", err.getMessage());
      throw new HttpError(ApiError.BILLING_UNREACHABLE);
    }
  }

  @PostMapping(Routes.BILLING_PORTAL)
  public ResponseEntity<Object> portal(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
    Auth.User user = CheckoutController.requireParent(request);
    requireOn();
    // `flow: "card"` opens the portal straight at changing the card, and brings the parent back to the subscription's page.
    boolean card = "card".equals(Json.text(Json.at(body, Fields.FLOW)));
    try {
      return CheckoutController.fresh(Json.map(Fields.URL, subscriptions.portal((int) user.id(), CheckoutController.parentsOrigin(request) + (card ? CABINET_SUBSCRIPTION : CABINET), card)));
    } catch (StripeException err) {
      log.error("[billing] portal not opened: {}", err.getMessage());
      throw new HttpError(ApiError.BILLING_UNREACHABLE);
    }
  }
}
