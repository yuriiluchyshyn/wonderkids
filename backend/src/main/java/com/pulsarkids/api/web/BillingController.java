package com.pulsarkids.api.web;

import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.service.BillingService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The plans and their prices, as Stripe keeps them (`Catalog`) — public, any
 * origin may ask (the site's page of prices, its build, the game):
 *
 *   GET /api/billing/plans  → { country, region, regions: [{ id, currency, countries, fallback, langs }],
 *                               plans: [{ id, kind, name, tagline, badge, features, facts, prices, extraChild }] }
 *
 * `region` is the visitor's (by `x-vercel-ip-country`). 503 `billing_off`
 * without a Stripe key, 502 `billing_unreachable` when Stripe cannot be read.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(Routes.BILLING_PLANS)
public class BillingController extends ApiController {
  private final BillingService billing;

  @GetMapping
  public ResponseEntity<Object> plans(HttpServletRequest request) {
    if (!billing.configured()) throw new HttpError(ApiError.BILLING_OFF);
    try {
      // The answer depends on the visitor's country: a browser may keep it a little, a shared cache not.
      return ResponseEntity.ok().cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES).cachePrivate()).body(billing.plansFor(Requests.country(request)));
    } catch (com.stripe.exception.StripeException err) {
      log.error("[billing] plans not read: {}", err.getMessage());
      throw new HttpError(ApiError.BILLING_UNREACHABLE);
    }
  }
}
