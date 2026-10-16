package com.pulsarkids.api.data.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

/**
 * The plan of an account (`SubscriptionService`): what the parent chose
 * (`plan` — `PlanChoice`, null — nothing yet), the Stripe subscription it is
 * paid by, as Stripe last told it, and a gift of Family that needs no payment.
 */
@Getter
@Setter
@Entity
@Table(name = "wk_billing_accounts")
public class BillingAccount {
  @Id
  private Integer parentId;

  private String plan;
  private String stripeCustomerId;
  private String stripeSubscriptionId;
  /** Stripe's subscription status: trialing, active, past_due, canceled… */
  private String status;
  private String planId;
  private String period;
  private String region;
  private Integer children;
  private Instant trialEnd;
  private Instant periodEnd;
  private boolean cancelAtPeriodEnd;
  /** Why Family is a gift (`GiftSource`, with a promotion code's id after a colon); null — no gift. */
  private String gift;
  /** The code the gift came with, as the parent typed it. */
  private String giftCode;
  private Instant chosenAt;
  private Instant updatedAt = Instant.now();
}
