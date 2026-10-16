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
 *   POST /api/billing/portal         → { url }   Stripe's portal: the card, the invoices
 *
 * A parent's session only (403 `parent_only` for a child's). The changes need
 * the paid mode on (503 `billing_off`); `me` always answers — with `paidMode: false`.
 */
@RestController
@RequiredArgsConstructor
public class BillingAccountController extends ApiController {
  private static final String CABINET = "/parent";

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

  @PostMapping(Routes.BILLING_PORTAL)
  public ResponseEntity<Object> portal(HttpServletRequest request) {
    Auth.User user = CheckoutController.requireParent(request);
    requireOn();
    try {
      return CheckoutController.fresh(Json.map(Fields.URL, subscriptions.portal((int) user.id(), CheckoutController.parentsOrigin(request) + CABINET)));
    } catch (StripeException err) {
      log.error("[billing] portal not opened: {}", err.getMessage());
      throw new HttpError(ApiError.BILLING_UNREACHABLE);
    }
  }
}
