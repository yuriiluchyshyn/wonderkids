package com.pulsarkids.api.service;

import com.pulsarkids.api.core.Billing;
import com.pulsarkids.api.core.Mail;
import com.pulsarkids.api.data.entity.BillingInvoice;
import com.pulsarkids.api.data.repo.BillingInvoiceRepository;
import com.pulsarkids.api.model.Lang;
import com.pulsarkids.api.model.Text;
import com.pulsarkids.api.model.Wire;
import com.stripe.model.Invoice;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * The invoice of every payment. Stripe makes one for each charge of a
 * subscription (its number, its PDF, its page); when it is paid (`invoice.paid`)
 * it is kept here and the family gets a letter with its links — unless the owner
 * switched those letters off (`/admin/settings`, `invoice_emails`). An invoice of
 * nothing (the start of a trial) is neither kept nor mailed. Stripe may send the
 * same event again: an invoice is mailed once.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceService {
  private final BillingInvoiceRepository invoices;
  private final MarketingService marketing;
  private final SchemaService schema;
  private final Messages messages;
  private final TransactionTemplate tx;

  /** What became of a paid invoice: kept (or seen before), and whether a letter went now. */
  public record Outcome(boolean kept, boolean mailed) {}

  public Outcome paid(Invoice invoice) {
    Long amount = invoice.getAmountPaid();
    if (amount == null || amount <= 0 || invoice.getId() == null) return new Outcome(false, false);
    schema.ensure();
    BillingInvoice row = tx.execute((status) -> invoices.findById(invoice.getId()).orElseGet(() -> {
      BillingInvoice made = new BillingInvoice();
      made.setStripeInvoiceId(invoice.getId());
      made.setStripeCustomerId(invoice.getCustomer());
      made.setEmail(invoice.getCustomerEmail());
      made.setNumber(invoice.getNumber());
      made.setAmountPaid(amount);
      made.setCurrency(invoice.getCurrency());
      made.setHostedUrl(invoice.getHostedInvoiceUrl());
      made.setPdfUrl(invoice.getInvoicePdf());
      made.setLang(langOf(invoice).wire());
      return invoices.save(made);
    }));
    if (row.getMailedAt() != null || !marketing.invoiceEmailsOn() || row.getEmail() == null || row.getEmail().isBlank()) return new Outcome(true, false);

    Lang lang = Wire.of(Lang.class, row.getLang());
    if (lang == null) lang = Lang.FALLBACK;
    String number = row.getNumber() == null ? "" : row.getNumber();
    String error = null;
    try {
      Mail.send(row.getEmail(),
          messages.of(Text.MAIL_INVOICE_SUBJECT, lang, number),
          messages.of(Text.MAIL_INVOICE_BODY, lang, Billing.formatAmount(row.getAmountPaid(), row.getCurrency(), lang), number, nullToDash(row.getHostedUrl()), nullToDash(row.getPdfUrl())),
          Mail.ownerMailbox().isEmpty() ? null : Mail.ownerMailbox(),
          List.of());
    } catch (Exception err) {
      error = err.getMessage();
      log.error("[billing] invoice {} not mailed: {}", row.getStripeInvoiceId(), error);
    }
    String failed = error;
    tx.executeWithoutResult((status) -> invoices.findById(row.getStripeInvoiceId()).ifPresent((kept) -> {
      if (failed == null) kept.setMailedAt(Instant.now());
      kept.setMailError(failed);
      invoices.save(kept);
    }));
    return new Outcome(true, failed == null);
  }

  /** The language of the page the family paid on — kept with the subscription (`BillingService.META_LANG`). */
  private static Lang langOf(Invoice invoice) {
    Map<String, String> meta = invoice.getParent() == null || invoice.getParent().getSubscriptionDetails() == null ? null : invoice.getParent().getSubscriptionDetails().getMetadata();
    Lang lang = meta == null ? null : Wire.of(Lang.class, meta.get(BillingService.META_LANG));
    return lang == null ? Lang.FALLBACK : lang;
  }

  private static String nullToDash(String value) {
    return value == null || value.isBlank() ? "—" : value;
  }
}
