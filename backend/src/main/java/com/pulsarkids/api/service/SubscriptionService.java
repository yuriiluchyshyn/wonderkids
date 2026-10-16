package com.pulsarkids.api.service;

import com.pulsarkids.api.core.Billing;
import com.pulsarkids.api.core.Catalog;
import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.core.Mail;
import com.pulsarkids.api.core.Plans;
import com.pulsarkids.api.data.entity.BillingAccount;
import com.pulsarkids.api.data.entity.Parent;
import com.pulsarkids.api.data.repo.BillingAccountRepository;
import com.pulsarkids.api.data.repo.ParentRepository;
import com.pulsarkids.api.model.Access;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.BillingPeriod;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.model.GiftSource;
import com.pulsarkids.api.model.Lang;
import com.pulsarkids.api.model.PlanChoice;
import com.pulsarkids.api.model.PlanKind;
import com.pulsarkids.api.model.Text;
import com.pulsarkids.api.model.Wire;
import com.pulsarkids.api.web.HttpError;
import com.stripe.exception.CardException;
import com.stripe.exception.StripeException;
import com.stripe.model.Coupon;
import com.stripe.model.Customer;
import com.stripe.model.Invoice;
import com.stripe.model.InvoiceLineItem;
import com.stripe.model.PromotionCode;
import com.stripe.model.Subscription;
import com.stripe.model.SubscriptionItem;
import com.stripe.model.checkout.Session;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.InvoiceCreatePreviewParams;
import com.stripe.param.PromotionCodeListParams;
import com.stripe.param.PromotionCodeRetrieveParams;
import com.stripe.param.SubscriptionUpdateParams;
import com.stripe.param.checkout.SessionCreateParams;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * The plan of each account (billing spec §1.1, §3, §6): what the parent
 * chose, the Stripe subscription that pays for Family (kept in step by Stripe's
 * webhooks), and Family as a gift — from the admin panel, or from a promotion
 * code whose coupon is 100 % off for ever (no payment form at all; taken back
 * as soon as the code or its coupon stops being valid in Stripe).
 *
 * Stripe does the money: trials, invoices, retries, prorations. Here only the
 * state is kept, and the requests a parent makes are passed on.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {
  /** How long a promotion code's answer «still a gift» is trusted. */
  private static final long GIFT_CHECK_TTL_MS = 5 * 60_000;
  private static final String META_PARENT = "parent_id";
  private static final String EXPAND_PROMO_COUPON = "promotion.coupon";
  private static final String EXPAND_LIST_PROMO_COUPON = "data.promotion.coupon";
  private static final String INTEGRATION = "pulsar_family_";
  private static final String EXPAND_LATEST_INVOICE = "latest_invoice";
  /** How long the moment a quote was worked out at may be used for the charge. */
  private static final long PRORATION_DATE_TTL_SECONDS = 30 * 60;

  private final BillingAccountRepository accounts;
  private final ParentRepository parents;
  private final BillingService billing;
  private final MarketingService marketing;
  private final SchemaService schema;
  private final Messages messages;
  private final TransactionTemplate tx;

  private record GiftCheck(boolean valid, long at) {}

  private final Map<String, GiftCheck> giftChecks = new ConcurrentHashMap<>();

  // ---------------------------------------------------------------------------
  // What an account has
  // ---------------------------------------------------------------------------

  private BillingAccount load(int parentId) {
    schema.ensure();
    return tx.execute((status) -> {
      accounts.insertIfAbsent(parentId);
      return accounts.findById(parentId).orElseThrow();
    });
  }

  private BillingAccount save(BillingAccount account) {
    account.setUpdatedAt(Instant.now());
    return tx.execute((status) -> accounts.save(account));
  }

  /** What an account has now, a gift of a code taken back in Stripe dropped on the way. */
  public Access accessOf(int parentId) {
    BillingAccount account = load(parentId);
    dropTakenBackGift(account);
    return Plans.accessOf(account.getPlan(), account.getStatus(), account.getGift());
  }

  /**
   * What the parent's game and cabinet are told: whether the paid mode is on,
   * what the account has, whether it must choose a plan now, and its plan.
   */
  public Map<String, Object> stateOf(int parentId) {
    // The paid mode off: nothing of paying exists for the clients — no plan, no gift, nothing to choose.
    if (!marketing.paidModeOn()) return Json.map(Fields.PAID_MODE, false, Fields.ACCESS, Access.NONE.wire(), Fields.MUST_CHOOSE, false, Fields.PLAN, null, Fields.GIFT, null);
    BillingAccount account = load(parentId);
    dropTakenBackGift(account);
    Access access = Plans.accessOf(account.getPlan(), account.getStatus(), account.getGift());
    int logins = tx.execute((status) -> parents.findById(parentId).map(Parent::getLogins).orElse(0));
    boolean paidMode = true;
    return Json.map(
        Fields.PAID_MODE, paidMode,
        Fields.ACCESS, access.wire(),
        Fields.MUST_CHOOSE, Plans.mustChoose(paidMode, access, logins),
        Fields.PLAN, account.getStripeSubscriptionId() == null ? null : Json.map(
            Fields.PLAN_ID, account.getPlanId(),
            Fields.PERIOD, account.getPeriod(),
            Fields.REGION, account.getRegion(),
            Fields.CHILDREN, account.getChildren(),
            Fields.STATUS, account.getStatus(),
            Fields.TRIAL_END, Json.iso(account.getTrialEnd()),
            Fields.PERIOD_END, Json.iso(account.getPeriodEnd()),
            Fields.CANCEL_AT_PERIOD_END, account.isCancelAtPeriodEnd()),
        Fields.GIFT, account.getGift() == null ? null : Json.map(Fields.SOURCE, Plans.giftSource(account.getGift()) == null ? null : Plans.giftSource(account.getGift()).wire(), Fields.CODE, account.getGiftCode()));
  }

  /** A gift that came with a promotion code lasts while the code and its coupon are valid in Stripe — the owner takes it back there. */
  private void dropTakenBackGift(BillingAccount account) {
    if (Plans.giftSource(account.getGift()) != GiftSource.PROMO) return;
    String codeId = Plans.giftCodeId(account.getGift());
    if (codeId == null || giftStillValid(codeId)) return;
    log.info("[billing] gift of code {} taken back from account {}", account.getGiftCode(), account.getParentId());
    account.setGift(null);
    account.setGiftCode(null);
    save(account);
  }

  private boolean giftStillValid(String promotionCodeId) {
    GiftCheck kept = giftChecks.get(promotionCodeId);
    if (kept != null && System.currentTimeMillis() - kept.at() < GIFT_CHECK_TTL_MS) return kept.valid();
    boolean valid;
    try {
      PromotionCode code = billing.client().v1().promotionCodes().retrieve(promotionCodeId, PromotionCodeRetrieveParams.builder().addExpand(EXPAND_PROMO_COUPON).build());
      valid = givesForever(code);
    } catch (StripeException err) {
      // Stripe out of reach: the gift stays rather than a family losing it by an outage.
      log.error("[billing] promotion code {} not checked: {}", promotionCodeId, err.getMessage());
      return true;
    }
    giftChecks.put(promotionCodeId, new GiftCheck(valid, System.currentTimeMillis()));
    return valid;
  }

  private static Coupon couponOf(PromotionCode code) {
    return code.getPromotion() == null ? null : code.getPromotion().getCouponObject();
  }

  private static boolean givesForever(PromotionCode code) {
    Coupon coupon = couponOf(code);
    return Boolean.TRUE.equals(code.getActive()) && coupon != null && Boolean.TRUE.equals(coupon.getValid()) && Plans.freeForever(coupon.getPercentOff(), coupon.getDuration());
  }

  // ---------------------------------------------------------------------------
  // What a parent does
  // ---------------------------------------------------------------------------

  /** The parent chose the free plan. Not over a paid Family — that is cancelled through `setCancel`. */
  public void chooseFree(int parentId) {
    BillingAccount account = load(parentId);
    if (Plans.accessOf(account.getPlan(), account.getStatus(), account.getGift()) == Access.FAMILY) throw new HttpError(ApiError.ALREADY_PAID);
    account.setPlan(PlanChoice.FREE.wire());
    account.setChosenAt(Instant.now());
    save(account);
  }

  /** What a checkout began with: Stripe's session for the page, or — for a code that is free for ever — a gift and no payment at all. */
  public record Begun(String sessionId, String clientSecret, boolean gift) {}

  /**
   * Begins paying for Family: Stripe's Checkout in `elements` mode — the page
   * draws the summary itself and mounts Stripe's address and card fields beside it.
   * `promo` — a code from the link the parent came by: applied if Stripe has it
   * active, refused neutrally otherwise (`offer_inactive`, spec §3.5); a code of
   * a coupon 100 % off for ever makes Family a gift with no checkout.
   */
  public Begun checkout(int parentId, String email, Catalog.Order order, String promo, Lang lang, String returnUrl) throws StripeException {
    BillingAccount account = load(parentId);
    if (Plans.accessOf(account.getPlan(), account.getStatus(), account.getGift()) == Access.FAMILY) throw new HttpError(ApiError.ALREADY_PAID);

    String promotionCodeId = null;
    if (promo != null && !promo.isBlank()) {
      PromotionCode code = billing.client().v1().promotionCodes().list(PromotionCodeListParams.builder().setCode(promo.strip()).setActive(true).setLimit(1L).addExpand(EXPAND_LIST_PROMO_COUPON).build())
          .getData().stream().findFirst().orElse(null);
      Coupon coupon = code == null ? null : couponOf(code);
      if (code == null || coupon == null || !Boolean.TRUE.equals(coupon.getValid())) throw new HttpError(ApiError.OFFER_INACTIVE);
      if (givesForever(code)) {
        account.setGift(Plans.gift(GiftSource.PROMO, code.getId()));
        account.setGiftCode(code.getCode());
        save(account);
        giftChecks.put(code.getId(), new GiftCheck(true, System.currentTimeMillis()));
        return new Begun(null, null, true);
      }
      promotionCodeId = code.getId();
    }

    // One Stripe customer per account, made with the parent's address: the invoices go there.
    if (account.getStripeCustomerId() == null) {
      Customer customer = billing.client().v1().customers().create(CustomerCreateParams.builder()
          .setEmail(email)
          .addPreferredLocale(lang.wire())
          .putMetadata(META_PARENT, String.valueOf(parentId))
          .build());
      account.setStripeCustomerId(customer.getId());
      save(account);
    }

    SessionCreateParams.Builder params = SessionCreateParams.builder()
        .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
        .setUiMode(SessionCreateParams.UiMode.ELEMENTS)
        .setReturnUrl(returnUrl)
        .setCustomer(account.getStripeCustomerId())
        .setCustomerUpdate(SessionCreateParams.CustomerUpdate.builder().setAddress(SessionCreateParams.CustomerUpdate.Address.AUTO).setName(SessionCreateParams.CustomerUpdate.Name.AUTO).build())
        .setClientReferenceId(String.valueOf(parentId))
        .setBillingAddressCollection(SessionCreateParams.BillingAddressCollection.REQUIRED)
        // A card only — Apple Pay and Google Pay come with it as its wallets; no Link and its «optional» sign-up block.
        .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
        .setAutomaticTax(SessionCreateParams.AutomaticTax.builder().setEnabled(billing.taxReady()).build())
        .setIntegrationIdentifier(INTEGRATION + BillingService.randomLetters(8))
        .addLineItem(SessionCreateParams.LineItem.builder().setPrice(order.planPriceId()).setQuantity(1L).build())
        .putMetadata(META_PARENT, String.valueOf(parentId))
        .putMetadata(BillingService.META_LANG, lang.wire());
    if (order.extraChildren() > 0) params.addLineItem(SessionCreateParams.LineItem.builder().setPrice(order.extraPriceId()).setQuantity((long) order.extraChildren()).build());
    // Stripe takes one of the two: a code given already, or a field to type one into.
    if (promotionCodeId != null) params.addDiscount(SessionCreateParams.Discount.builder().setPromotionCode(promotionCodeId).build());
    else params.setAllowPromotionCodes(true);
    SessionCreateParams.SubscriptionData.Builder subscription = SessionCreateParams.SubscriptionData.builder()
        .putMetadata(META_PARENT, String.valueOf(parentId))
        .putMetadata(BillingService.META_LANG, lang.wire());
    if (order.trialDays() != null) subscription.setTrialPeriodDays((long) order.trialDays());
    params.setSubscriptionData(subscription.build());
    Session session = billing.client().v1().checkout().sessions().create(params.build());
    return new Begun(session.getId(), session.getClientSecret(), false);
  }

  /** Change the paid plan: how many children, or the period. Stripe prorates. */
  public void change(int parentId, Integer children, BillingPeriod period) throws StripeException {
    BillingAccount account = load(parentId);
    if (account.getStripeSubscriptionId() == null || Plans.accessOf(account.getPlan(), account.getStatus(), account.getGift()) != Access.FAMILY) throw new HttpError(ApiError.NO_SUBSCRIPTION);
    Subscription subscription = billing.client().v1().subscriptions().retrieve(account.getStripeSubscriptionId());
    Catalog.View view = billing.catalog();
    BillingPeriod nextPeriod = period != null ? period : Wire.of(BillingPeriod.class, account.getPeriod());
    int nextChildren = children != null ? children : (account.getChildren() == null ? Catalog.childrenIncluded(view, account.getPlanId()) : account.getChildren());
    Catalog.OrderResult result = Catalog.order(view, account.getPlanId(), account.getRegion(), nextPeriod, nextChildren);
    if (result.refusal() == Catalog.Refusal.BAD_CHILDREN) throw new HttpError(ApiError.INVALID_CHILDREN);
    if (result.order() == null) throw new HttpError(ApiError.INVALID_PLAN);
    Catalog.Order order = result.order();

    SubscriptionUpdateParams.Builder update = SubscriptionUpdateParams.builder().setProrationBehavior(SubscriptionUpdateParams.ProrationBehavior.CREATE_PRORATIONS);
    for (ItemChange change : itemChanges(subscription, view, order)) update.addItem(updateItem(change));
    sync(billing.client().v1().subscriptions().update(subscription.getId(), update.build()));
  }

  // ---------------------------------------------------------------------------
  // Adding children: shown first (what is due now), charged when the parent approves
  // ---------------------------------------------------------------------------

  /** One line of a subscription as it should be after a change: the plan's, or the extra children's (a new one has no `id`). */
  private record ItemChange(String id, String price, Long quantity, boolean deleted) {}

  /** The lines a subscription needs for an order: the plan's price, and the extra-child line — kept, made, or taken away. */
  private static List<ItemChange> itemChanges(Subscription subscription, Catalog.View view, Catalog.Order order) {
    List<ItemChange> out = new ArrayList<>();
    boolean extraKept = false;
    for (SubscriptionItem item : subscription.getItems().getData()) {
      PlanKind kind = Catalog.kindOf(view, item.getPrice().getProduct());
      if (kind == PlanKind.PAID) {
        out.add(new ItemChange(item.getId(), order.planPriceId(), null, false));
      } else if (kind == PlanKind.EXTRA_CHILD) {
        extraKept = order.extraChildren() > 0;
        out.add(extraKept ? new ItemChange(item.getId(), order.extraPriceId(), (long) order.extraChildren(), false) : new ItemChange(item.getId(), null, null, true));
      }
    }
    if (!extraKept && order.extraChildren() > 0) out.add(new ItemChange(null, order.extraPriceId(), (long) order.extraChildren(), false));
    return out;
  }

  private static SubscriptionUpdateParams.Item updateItem(ItemChange change) {
    SubscriptionUpdateParams.Item.Builder item = SubscriptionUpdateParams.Item.builder();
    if (change.id() != null) item.setId(change.id());
    if (change.deleted()) return item.setDeleted(true).build();
    item.setPrice(change.price());
    if (change.quantity() != null) item.setQuantity(change.quantity());
    return item.build();
  }

  private static InvoiceCreatePreviewParams.SubscriptionDetails.Item previewItem(ItemChange change) {
    InvoiceCreatePreviewParams.SubscriptionDetails.Item.Builder item = InvoiceCreatePreviewParams.SubscriptionDetails.Item.builder();
    if (change.id() != null) item.setId(change.id());
    if (change.deleted()) return item.setDeleted(true).build();
    item.setPrice(change.price());
    if (change.quantity() != null) item.setQuantity(change.quantity());
    return item.build();
  }

  /**
   * What adding `add` children costs now, as Stripe works it out: the extra
   * children's price for the days left of the period, tax included where it is
   * added on top. `prorationDate` fixes the moment the days are counted from —
   * the same date is given to Stripe again when the parent approves, so what
   * was shown is what is charged. A trial charges nothing now: the children
   * are in the first charge after it.
   */
  public record ChildrenQuote(int add, int children, int childrenAfter, long amount, String currency, long prorationDate, boolean trialing, Instant nextCharge) {}

  private record Quoted(ChildrenQuote quote, Subscription subscription, List<ItemChange> changes) {}

  private Quoted quote(int parentId, int add, Long givenDate) throws StripeException {
    BillingAccount account = load(parentId);
    if (account.getStripeSubscriptionId() == null || account.isCancelAtPeriodEnd() || Plans.accessOf(account.getPlan(), account.getStatus(), account.getGift()) != Access.FAMILY) throw new HttpError(ApiError.NO_SUBSCRIPTION);
    if (add < 1) throw new HttpError(ApiError.INVALID_CHILDREN);
    Subscription subscription = billing.client().v1().subscriptions().retrieve(account.getStripeSubscriptionId());
    Catalog.View view = billing.catalog();
    int now = account.getChildren() == null ? Catalog.childrenIncluded(view, account.getPlanId()) : account.getChildren();
    Catalog.OrderResult result = Catalog.order(view, account.getPlanId(), account.getRegion(), Wire.of(BillingPeriod.class, account.getPeriod()), now + add);
    if (result.refusal() == Catalog.Refusal.BAD_CHILDREN) throw new HttpError(ApiError.INVALID_CHILDREN);
    if (result.order() == null) throw new HttpError(ApiError.INVALID_PLAN);
    List<ItemChange> changes = itemChanges(subscription, view, result.order());

    long date = givenDate != null ? givenDate : Instant.now().getEpochSecond();
    InvoiceCreatePreviewParams.SubscriptionDetails.Builder details = InvoiceCreatePreviewParams.SubscriptionDetails.builder()
        .setProrationBehavior(InvoiceCreatePreviewParams.SubscriptionDetails.ProrationBehavior.ALWAYS_INVOICE)
        .setProrationDate(date);
    for (ItemChange change : changes) details.addItem(previewItem(change));
    Invoice preview = billing.client().v1().invoices().createPreview(InvoiceCreatePreviewParams.builder()
        .setCustomer(subscription.getCustomer())
        .setSubscription(subscription.getId())
        .setSubscriptionDetails(details.build())
        .build());

    boolean trialing = "trialing".equals(subscription.getStatus());
    long amount = 0;
    if (!trialing && preview.getLines() != null) {
      // Only the prorations are due now; the lines of the next renewal wait for it.
      for (InvoiceLineItem line : preview.getLines().getData()) {
        if (!isProration(line)) continue;
        long due = line.getAmount() == null ? 0 : line.getAmount();
        if (line.getDiscountAmounts() != null) for (InvoiceLineItem.DiscountAmount discount : line.getDiscountAmounts()) due -= discount.getAmount() == null ? 0 : discount.getAmount();
        if (line.getTaxes() != null) for (InvoiceLineItem.Tax tax : line.getTaxes()) if ("exclusive".equals(tax.getTaxBehavior()) && tax.getAmount() != null) due += tax.getAmount();
        amount += due;
      }
    }
    Instant next = trialing ? account.getTrialEnd() : account.getPeriodEnd();
    return new Quoted(new ChildrenQuote(add, now, now + add, Math.max(0, amount), preview.getCurrency(), date, trialing, next), subscription, changes);
  }

  private static boolean isProration(InvoiceLineItem line) {
    return line.getParent() != null && line.getParent().getSubscriptionItemDetails() != null && Boolean.TRUE.equals(line.getParent().getSubscriptionItemDetails().getProration());
  }

  /** What adding `add` children would cost now (nothing is charged or changed). */
  public ChildrenQuote quoteChildren(int parentId, int add) throws StripeException {
    return quote(parentId, add, null).quote();
  }

  /** What was charged for the children added. */
  public record ChildrenAdded(long charged, String currency) {}

  /**
   * The parent approved: the children are added and the amount shown is
   * charged by Stripe at once (an invoice of the prorations, paid with the card
   * on the subscription). If the amount is no longer what was shown, or the
   * card is declined, nothing changes. The parent gets a letter about it.
   */
  public ChildrenAdded addChildren(int parentId, int add, long prorationDate, long shownAmount, Lang lang) throws StripeException {
    long now = Instant.now().getEpochSecond();
    if (prorationDate > now + 60 || prorationDate < now - PRORATION_DATE_TTL_SECONDS) throw new HttpError(ApiError.PRICE_CHANGED);
    Quoted quoted = quote(parentId, add, prorationDate);
    if (quoted.quote().amount() != shownAmount) throw new HttpError(ApiError.PRICE_CHANGED);

    SubscriptionUpdateParams.Builder update = SubscriptionUpdateParams.builder()
        .setProrationBehavior(SubscriptionUpdateParams.ProrationBehavior.ALWAYS_INVOICE)
        .setProrationDate(prorationDate)
        // A payment that does not go through leaves the subscription as it was.
        .setPaymentBehavior(SubscriptionUpdateParams.PaymentBehavior.ERROR_IF_INCOMPLETE)
        .addExpand(EXPAND_LATEST_INVOICE);
    for (ItemChange change : quoted.changes()) update.addItem(updateItem(change));
    Subscription updated;
    try {
      updated = billing.client().v1().subscriptions().update(quoted.subscription().getId(), update.build());
    } catch (CardException err) {
      log.warn("[billing] children not added for account {}: {}", parentId, err.getMessage());
      throw new HttpError(ApiError.PAYMENT_FAILED);
    } catch (StripeException err) {
      if (err.getCode() != null && err.getCode().startsWith("subscription_payment_intent")) throw new HttpError(ApiError.PAYMENT_FAILED);
      throw err;
    }
    sync(updated);
    Invoice invoice = updated.getLatestInvoiceObject();
    long charged = quoted.quote().trialing() || invoice == null || invoice.getAmountPaid() == null ? 0 : invoice.getAmountPaid();
    mailChildrenAdded(parentId, add, charged, quoted.quote().currency(), invoice, lang);
    return new ChildrenAdded(charged, quoted.quote().currency());
  }

  /** The letter about the children added; a letter that cannot go never undoes the payment. */
  private void mailChildrenAdded(int parentId, int add, long charged, String currency, Invoice invoice, Lang lang) {
    try {
      Parent parent = tx.execute((status) -> parents.findById(parentId).orElse(null));
      if (parent == null || parent.getEmail() == null || parent.getEmail().isBlank()) return;
      BillingAccount account = load(parentId);
      Instant next = "trialing".equals(account.getStatus()) ? account.getTrialEnd() : account.getPeriodEnd();
      String date = next == null ? "—" : DateTimeFormatter.ofLocalizedDate(FormatStyle.LONG).withLocale(lang.locale()).withZone(ZoneOffset.UTC).format(next);
      String children = String.valueOf(account.getChildren() == null ? "" : account.getChildren());
      String link = invoice == null || invoice.getHostedInvoiceUrl() == null ? "—" : invoice.getHostedInvoiceUrl();
      String subject = messages.of(Text.MAIL_CHILDREN_SUBJECT, lang);
      String body = charged > 0
          ? messages.of(Text.MAIL_CHILDREN_BODY, lang, String.valueOf(add), children, Billing.formatAmount(charged, currency, lang), link, date)
          : messages.of(Text.MAIL_CHILDREN_BODY_TRIAL, lang, String.valueOf(add), children, "", "", date);
      Mail.send(parent.getEmail(), subject, body, Mail.ownerMailbox().isEmpty() ? null : Mail.ownerMailbox(), List.of());
    } catch (Exception err) {
      log.error("[billing] letter about the children of account {} not sent: {}", parentId, err.getMessage());
    }
  }

  /** Go to the free plan at the end of the paid period (`cancel`), or keep Family after all. */
  public void setCancel(int parentId, boolean cancel) throws StripeException {
    BillingAccount account = load(parentId);
    if (account.getStripeSubscriptionId() == null || Plans.accessOf(account.getPlan(), account.getStatus(), account.getGift()) != Access.FAMILY) throw new HttpError(ApiError.NO_SUBSCRIPTION);
    sync(billing.client().v1().subscriptions().update(account.getStripeSubscriptionId(), SubscriptionUpdateParams.builder().setCancelAtPeriodEnd(cancel).build()));
  }

  /** Stripe's customer portal: the card, the invoices. */
  public String portal(int parentId, String returnUrl) throws StripeException {
    BillingAccount account = load(parentId);
    if (account.getStripeCustomerId() == null) throw new HttpError(ApiError.NO_SUBSCRIPTION);
    return billing.client().v1().billingPortal().sessions().create(com.stripe.param.billingportal.SessionCreateParams.builder()
        .setCustomer(account.getStripeCustomerId())
        .setReturnUrl(returnUrl)
        .build()).getUrl();
  }

  /** The owner gives Family as a gift, or takes the gift back (admin panel). */
  public void setAdminGift(int parentId, boolean on) {
    BillingAccount account = load(parentId);
    account.setGift(on ? Plans.gift(GiftSource.ADMIN, null) : null);
    account.setGiftCode(null);
    save(account);
  }

  /** How many accounts have a Stripe subscription that still charges (in trial, active, a payment retried) — Stripe goes on charging them whatever the paid mode. */
  public long chargingSubscriptions() {
    schema.ensure();
    return tx.execute((status) -> accounts.findAll().stream().filter((a) -> a.getStripeSubscriptionId() != null && Plans.accessOf(a.getPlan(), a.getStatus(), null) == Access.FAMILY).count());
  }

  /** Every account's plan for the admin page, by parent id — what was kept; Stripe is not asked. */
  public Map<Integer, Map<String, Object>> adminViews() {
    schema.ensure();
    Map<Integer, Map<String, Object>> out = new java.util.HashMap<>();
    for (BillingAccount account : tx.execute((status) -> accounts.findAll())) {
      out.put(account.getParentId(), Json.map(
          Fields.ACCESS, Plans.accessOf(account.getPlan(), account.getStatus(), account.getGift()).wire(),
          Fields.STATUS, account.getStatus(),
          Fields.PERIOD, account.getPeriod(),
          Fields.CHILDREN, account.getChildren(),
          Fields.PERIOD_END, Json.iso(account.getPeriodEnd()),
          Fields.TRIAL_END, Json.iso(account.getTrialEnd()),
          Fields.CANCEL_AT_PERIOD_END, account.isCancelAtPeriodEnd(),
          Fields.GIFT, account.getGift() == null ? null : Plans.giftSource(account.getGift()).wire(),
          Fields.GIFT_CODE, account.getGiftCode()));
    }
    return out;
  }

  // ---------------------------------------------------------------------------
  // What Stripe tells (webhooks)
  // ---------------------------------------------------------------------------

  /** A checkout was completed: the subscription belongs to the account that began it. */
  public void checkoutCompleted(Session session) throws StripeException {
    Integer parentId = whole(session.getClientReferenceId());
    if (parentId == null || session.getSubscription() == null || !Boolean.TRUE.equals(tx.execute((status) -> parents.existsById(parentId)))) return;
    BillingAccount account = load(parentId);
    account.setStripeCustomerId(session.getCustomer());
    account.setStripeSubscriptionId(session.getSubscription());
    account.setPlan(PlanChoice.PAID.wire());
    account.setChosenAt(Instant.now());
    save(account);
    sync(billing.client().v1().subscriptions().retrieve(session.getSubscription()));
  }

  /** A subscription was made, changed or ended: the account follows it. */
  public void sync(Subscription subscription) {
    Integer parentId = subscription.getMetadata() == null ? null : whole(subscription.getMetadata().get(META_PARENT));
    // An account deleted since: its subscription is Stripe's business alone now.
    if (parentId != null && !Boolean.TRUE.equals(tx.execute((status) -> parents.existsById(parentId)))) {
      log.warn("[billing] subscription {} names account {}, which is gone", subscription.getId(), parentId);
      return;
    }
    BillingAccount account = parentId != null
        ? load(parentId)
        : tx.execute((status) -> accounts.findFirstByStripeSubscriptionId(subscription.getId()).orElse(null));
    if (account == null) {
      log.warn("[billing] subscription {} belongs to no account", subscription.getId());
      return;
    }
    // The catalogue tells which item is the plan and which the extra children; without it the status alone is kept.
    Catalog.View view = null;
    if (billing.configured()) {
      try {
        view = billing.catalog();
      } catch (StripeException err) {
        log.error("[billing] catalogue not read for subscription {}: {}", subscription.getId(), err.getMessage());
      }
    }
    account.setStripeSubscriptionId(subscription.getId());
    account.setStripeCustomerId(subscription.getCustomer());
    account.setPlan(PlanChoice.PAID.wire());
    account.setStatus(subscription.getStatus());
    account.setTrialEnd(subscription.getTrialEnd() == null ? null : Instant.ofEpochSecond(subscription.getTrialEnd()));
    account.setCancelAtPeriodEnd(Boolean.TRUE.equals(subscription.getCancelAtPeriodEnd()) || subscription.getCancelAt() != null);
    long periodEnd = 0;
    int extra = 0;
    for (SubscriptionItem item : subscription.getItems().getData()) {
      if (item.getCurrentPeriodEnd() != null) periodEnd = Math.max(periodEnd, item.getCurrentPeriodEnd());
      PlanKind kind = view == null ? null : Catalog.kindOf(view, item.getPrice().getProduct());
      if (kind == PlanKind.PAID) {
        account.setPlanId(item.getPrice().getProduct());
        if (item.getPrice().getRecurring() != null) account.setPeriod(item.getPrice().getRecurring().getInterval());
        Catalog.Price price = Catalog.priceById(view, item.getPrice().getId());
        if (price != null) account.setRegion(Catalog.regionOf(price));
      } else if (kind == PlanKind.EXTRA_CHILD && item.getQuantity() != null) {
        extra += item.getQuantity().intValue();
      }
    }
    account.setPeriodEnd(periodEnd > 0 ? Instant.ofEpochSecond(periodEnd) : null);
    if (view != null && account.getPlanId() != null) account.setChildren(Catalog.childrenIncluded(view, account.getPlanId()) + extra);
    save(account);
  }

  private static Integer whole(String text) {
    try {
      return text == null ? null : Integer.valueOf(text.strip());
    } catch (NumberFormatException err) {
      return null;
    }
  }
}
