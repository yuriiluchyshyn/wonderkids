package com.pulsarkids.api.web;

import com.pulsarkids.api.core.Env;
import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.core.Vars;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.service.InvoiceService;
import com.pulsarkids.api.service.SubscriptionService;
import com.stripe.exception.StripeException;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import java.util.Set;
import com.stripe.exception.EventDataObjectDeserializationException;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.Invoice;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Stripe tells the API what happened (billing spec §6.5):
 *
 *   POST /api/billing/webhook   (Stripe's event; signed — `Stripe-Signature`)
 *
 * Only events signed with `STRIPE_WEBHOOK_SECRET` are read; anything else is
 * 400 `invalid_signature`. Handled: `invoice.paid` — the invoice of a payment
 * is kept and mailed to the family (`InvoiceService`); `checkout.session.completed`
 * and `customer.subscription.created|updated|deleted` — the account's plan follows
 * its subscription (`SubscriptionService`). Other events are acknowledged and
 * left alone, so Stripe does not send them again.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(Routes.BILLING_WEBHOOK)
public class StripeWebhookController extends ApiController {
  private static final String INVOICE_PAID = "invoice.paid";
  private static final String CHECKOUT_COMPLETED = "checkout.session.completed";
  private static final Set<String> SUBSCRIPTION_EVENTS = Set.of("customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted");

  private final InvoiceService invoices;
  private final SubscriptionService subscriptions;

  @PostMapping
  public ResponseEntity<Object> receive(@RequestBody(required = false) String payload, @RequestHeader(name = Headers.STRIPE_SIGNATURE, required = false) String signature) {
    String secret = Env.get(Vars.STRIPE_WEBHOOK_SECRET);
    if (secret == null || secret.isBlank()) throw new HttpError(ApiError.BILLING_OFF);
    Event event;
    try {
      event = Webhook.constructEvent(payload == null ? "" : payload, signature == null ? "" : signature, secret.strip());
    } catch (SignatureVerificationException | RuntimeException err) {
      log.warn("[billing] webhook refused: {}", err.getMessage());
      throw new HttpError(ApiError.INVALID_SIGNATURE);
    }
    StripeObject object = objectOf(event);
    try {
      if (INVOICE_PAID.equals(event.getType()) && object instanceof Invoice invoice) invoices.paid(invoice);
      else if (CHECKOUT_COMPLETED.equals(event.getType()) && object instanceof Session session) subscriptions.checkoutCompleted(session);
      else if (SUBSCRIPTION_EVENTS.contains(event.getType()) && object instanceof Subscription subscription) subscriptions.sync(subscription);
    } catch (StripeException err) {
      // Stripe sends the event again later: answer that it did not land.
      log.error("[billing] event {} not handled: {}", event.getId(), err.getMessage());
      throw new HttpError(ApiError.BILLING_UNREACHABLE);
    }
    return ok(Json.map(Fields.RECEIVED, true));
  }

  /** The event's object — also when it was written by another API version than the library's. */
  private StripeObject objectOf(Event event) {
    try {
      return event.getDataObjectDeserializer().getObject().orElse(event.getDataObjectDeserializer().deserializeUnsafe());
    } catch (EventDataObjectDeserializationException err) {
      log.error("[billing] event {} not read: {}", event.getId(), err.getMessage());
      return null;
    }
  }
}
