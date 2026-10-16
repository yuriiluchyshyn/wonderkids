import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { StripeCheckoutElementsSdk, StripeCheckoutLoadActionsSuccess, StripeCheckoutSession } from '@stripe/stripe-js';
import { paidPlan, planName, type Catalog, type View } from '@pulsar/plans';
import { ApiError, billingApi, type CheckoutBegun } from '@/core/account/api/client';
import { useLang, useT } from '@/core/translator';
import styles from './Paywall.module.css';

/** Stripe.js from js.stripe.com — as PCI asks, never bundled — and only once per page. */
let stripeJs: Promise<typeof import('@stripe/stripe-js/pure')> | null = null;
export function preloadStripe(): void {
  stripeJs ??= import('@stripe/stripe-js/pure');
  // With the key known at build time the script itself is fetched now, while the parent looks at the plans.
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
  if (key) void stripeJs.then(({ loadStripe }) => loadStripe(key));
}

/**
 * Paying for the paid plan: Stripe's Checkout in `elements` mode — on the
 * left Stripe's own fields (the billing address, required for VAT, and the
 * card), on the right the summary drawn here from the session Stripe keeps
 * (lines, discount, tax, the trial, what comes next). The amounts are always
 * Stripe's: the page names a plan, a period and the children, never a price.
 * A promotion code from the link is applied by the server; one typed here is
 * applied by Stripe. A code of a coupon 100 % off for ever makes the plan a
 * gift and there is nothing to pay (`onGift`).
 */
export function CheckoutStep({ token, catalog, view, promo, onBack, onDone, onGift }: {
  token: string;
  catalog: Catalog;
  view: View;
  promo?: string;
  onBack: () => void;
  onDone: () => void;
  onGift: () => void;
}) {
  const t = useT();
  const lang = useLang();
  const addressRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<StripeCheckoutSession | null>(null);
  const [actions, setActions] = useState<StripeCheckoutLoadActionsSuccess | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offerNote, setOfferNote] = useState(false);
  const [paying, setPaying] = useState(false);
  const [code, setCode] = useState('');
  const [codeNote, setCodeNote] = useState<string | null>(null);
  const plan = paidPlan(catalog);
  // The session is asked for once per opening of this step — React may run the effect below twice.
  const begun = useRef<Promise<CheckoutBegun> | null>(null);

  useEffect(() => {
    let gone = false;
    let sdk: StripeCheckoutElementsSdk | null = null;
    preloadStripe();
    (async () => {
      const body = { plan: plan?.id ?? '', period: view.period, children: view.children, region: view.region, lang };
      begun.current ??= billingApi.checkout(token, promo ? { ...body, promo } : body).catch((err: unknown) => {
        // A code Stripe does not have active: said neutrally, and the plan is offered without it (spec §3.5).
        if (err instanceof ApiError && err.message === 'offer_inactive') {
          setOfferNote(true);
          return billingApi.checkout(token, body);
        }
        throw err;
      });
      const started = await begun.current;
      if (gone) return;
      if (started.gift) return onGift();
      const { loadStripe } = await (stripeJs ??= import('@stripe/stripe-js/pure'));
      const stripe = await loadStripe(started.publishableKey ?? '');
      if (!stripe || gone || !started.clientSecret) throw new Error('stripe');
      sdk = stripe.initCheckoutElementsSdk({
        clientSecret: started.clientSecret,
        elementsOptions: { appearance: { theme: 'stripe', variables: { borderRadius: '12px', fontSizeBase: '16px' } } },
      });
      sdk.on('change', (next) => setSession(next));
      if (addressRef.current) sdk.createBillingAddressElement().mount(addressRef.current);
      if (paymentRef.current) sdk.createPaymentElement().mount(paymentRef.current);
      const loaded = await sdk.loadActions();
      if (gone) return;
      if (loaded.type === 'error') throw new Error(loaded.error.message);
      setActions(loaded.actions);
      setSession(loaded.actions.getSession());
    })().catch(() => {
      if (!gone) setError(t('billing.checkout.error'));
    });
    return () => {
      gone = true;
      sdk?.getPaymentElement()?.destroy();
      sdk?.getBillingAddressElement()?.destroy();
    };
    // One session per choice: the choice cannot change while this step is open.
  }, []);

  const pay = async (e: FormEvent) => {
    e.preventDefault();
    if (!actions) return;
    setPaying(true);
    setError(null);
    const result = await actions.confirm({ redirect: 'if_required' });
    setPaying(false);
    if (result.type === 'success') onDone();
    else setError(result.error.message);
  };

  const applyCode = async () => {
    if (!actions || !code.trim()) return;
    setCodeNote(null);
    const result = await actions.applyPromotionCode(code.trim());
    if (result.type === 'error') setCodeNote(t('billing.checkout.promoInvalid'));
    else setCode('');
  };

  const date = (seconds: number) => new Intl.DateTimeFormat(lang, { dateStyle: 'long' }).format(new Date(seconds * 1000));
  const per = (interval: string | undefined) => t(interval === 'year' ? 'billing.paywall.perYear' : 'billing.paywall.perMonth');
  const trial = session?.recurring?.trial;
  const discounts = session?.discountAmounts ?? [];

  return (
    <div className={styles.checkout}>
      <div className={styles.checkoutHead}>
        <button type="button" className={styles.back} onClick={onBack}>
          {t('billing.checkout.back')}
        </button>
      </div>
      {offerNote && <p className={styles.warn}>{t('billing.checkout.promoInvalid')}</p>}
      <div className={styles.checkoutGrid}>
        <form className={styles.formSide} onSubmit={pay}>
          <h3>{t('billing.checkout.address')}</h3>
          <div ref={addressRef} className={styles.stripeField} />
          <h3>{t('billing.checkout.card')}</h3>
          <div ref={paymentRef} className={styles.stripeField} />
          {!actions && !error && <p className={styles.note}>{t('billing.checkout.loading')}</p>}
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.primary} disabled={!actions || paying || session?.canConfirm === false}>
            {paying ? t('billing.checkout.paying') : t('billing.checkout.pay')}
          </button>
          <p className={styles.note}>{t('billing.checkout.secure')}</p>
        </form>

        <aside className={styles.summary}>
          <h3>{t('billing.checkout.summary')}</h3>
          {plan && <p className={styles.summaryPlan}>{planName(plan, lang)} · {t('billing.kids', { count: view.children })}</p>}
          {session ? (
            <>
              {trial ? <p className={styles.trialBanner}>{t('billing.paywall.freeDays', { count: trial.trialPeriodDays })}</p> : null}
              <ul className={styles.lines}>
                {session.lineItems.map((line) => (
                  <li key={line.id}>
                    <span>{line.name}</span>
                    {/* In a trial today's sum is nothing: the line shows what the plan costs a period. */}
                    <span>
                      {line.quantity > 1 ? `${line.quantity} × ` : ''}
                      {line.unitAmount.amount}
                      {line.recurring ? ` ${per(line.recurring.interval)}` : ''}
                    </span>
                  </li>
                ))}
                {discounts.map((discount) => (
                  <li key={discount.displayName} className={styles.discountLine}>
                    <span>{discount.displayName}</span>
                    <span>−{discount.amount}</span>
                  </li>
                ))}
                {session.total.taxExclusive.minorUnitsAmount > 0 && (
                  <li>
                    <span>{t('billing.checkout.tax')}</span>
                    <span>{session.total.taxExclusive.amount}</span>
                  </li>
                )}
              </ul>
              <p className={styles.totalLine}>
                <span>{t('billing.checkout.todayDue')}</span>
                <b>{session.total.total.amount}</b>
              </p>
              {session.recurring && (
                <p className={styles.note}>
                  {trial ? `${t('billing.checkout.trial', { days: t('billing.days', { count: trial.trialPeriodDays }) })}. ` : ''}
                  {t('billing.checkout.then', {
                    amount: session.recurring.dueNext.total.amount,
                    per: per(session.recurring.interval),
                    date: date(trial ? trial.trialEnd : session.recurring.dueNext.billingCycleAnchor ?? Date.now() / 1000),
                  })}
                </p>
              )}
              {!promo && (
                <div className={styles.promo}>
                  {discounts.length ? (
                    <button type="button" className={styles.linkButton} onClick={() => void actions?.removePromotionCode()}>
                      {t('billing.checkout.promoRemove')}
                    </button>
                  ) : (
                    <>
                      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('billing.checkout.promo')} aria-label={t('billing.checkout.promo')} />
                      <button type="button" className={styles.secondary} disabled={!actions || !code.trim()} onClick={() => void applyCode()}>
                        {t('billing.checkout.promoApply')}
                      </button>
                    </>
                  )}
                  {codeNote && <p className={styles.error}>{codeNote}</p>}
                </div>
              )}
            </>
          ) : (
            <p className={styles.note}>{t('billing.checkout.loading')}</p>
          )}
        </aside>
      </div>
    </div>
  );
}
