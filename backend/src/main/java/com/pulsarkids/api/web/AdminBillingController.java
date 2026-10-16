package com.pulsarkids.api.web;

import com.pulsarkids.api.service.BillingService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin: the connection to Stripe →
 *   GET /api/admin/billing  → { configured, ok?, mode?, account?: { id, name, country }, prices?: { expected, found, missing }, detail? }
 * `configured: false` — no `STRIPE_SECRET_KEY`; `ok: false` — Stripe refused the key or was out of reach
 * (`detail` says why). Requires `x-admin-key`.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(Routes.ADMIN_BILLING)
public class AdminBillingController extends ApiController {
  private final BillingService billing;

  @GetMapping
  public ResponseEntity<Object> status(HttpServletRequest request) {
    Requests.requireAdmin(request);
    return ok(billing.status());
  }
}
