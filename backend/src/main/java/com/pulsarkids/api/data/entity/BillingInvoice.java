package com.pulsarkids.api.data.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

/** A paid invoice of a subscription, as Stripe sent it, and whether the family's letter about it went (`InvoiceService`). */
@Getter
@Setter
@Entity
@Table(name = "wk_billing_invoices")
public class BillingInvoice {
  @Id
  private String stripeInvoiceId;

  private String stripeCustomerId;
  private String email;
  private String number;
  private long amountPaid;
  private String currency;
  private String hostedUrl;
  private String pdfUrl;
  /** The language the letter is written in — the page's the family paid on. */
  private String lang;
  private Instant mailedAt;
  private String mailError;

  @Column(insertable = false, updatable = false)
  private Instant createdAt;
}
