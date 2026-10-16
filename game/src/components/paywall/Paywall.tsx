import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { firstView, paidPlan, planName, type View } from '@pulsar/plans';
import { billingApi } from '@/core/account/api/client';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import { usePlan } from '@/core/account/billing/usePlan';
import { useLang, useT } from '@/core/translator';
import { CheckoutStep, preloadStripe } from './CheckoutStep';
import { PlanCards } from './PlanCards';
import styles from './Paywall.module.css';

/**
 * The paywall of the parents' portal (billing spec §3): the plans, then the
 * payment of the paid one, then «done». Opened by `PaywallGate` — when a link
 * offered a plan, when a parent with no plan signs in for the second time (then
 * it cannot be closed: a plan, free or paid, must be chosen), or from the
 * cabinet's «Підписка». Shown only in the paid mode.
 */
export function Paywall() {
  const t = useT();
  const lang = useLang();
  const token = useAuthStore((s) => s.token);
  const { paywall, catalog, state, update, close, setState, load } = usePlan();
  const [busy, setBusy] = useState(false);
  const [trialEnd, setTrialEnd] = useState<string | null>(null);

  useEffect(() => {
    if (paywall) preloadStripe();
  }, [paywall]);

  const mandatory = paywall?.reason === 'mustChoose' && paywall.step !== 'done' && paywall.step !== 'gift';
  const view: View | null = paywall?.view ?? (catalog ? firstView(catalog, lang) : null);
  const paid = catalog ? paidPlan(catalog) : undefined;

  const chooseFree = async () => {
    if (!token) return;
    setBusy(true);
    try {
      setState(await billingApi.chooseFree(token));
      close();
    } finally {
      setBusy(false);
    }
  };

  const finished = async () => {
    if (!token) return;
    // Stripe's webhook makes the account's plan; until it lands the state may still say «free» — ask again.
    for (let i = 0; i < 6; i += 1) {
      const next = await load(token);
      if (next?.access === 'family') {
        setTrialEnd(next.plan?.trialEnd ?? null);
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    update({ step: 'done' });
  };

  const gifted = async () => {
    if (token) await load(token);
    update({ step: 'gift' });
  };

  return createPortal(
    <AnimatePresence>
      {/* Never while the paid mode is off — whoever asked for the paywall. */}
      {paywall && state?.paidMode && (
        <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby="paywall-title"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <div className={styles.head}>
              <h2 id="paywall-title">{mandatory ? t('billing.paywall.chooseTitle') : t('billing.paywall.title')}</h2>
              {!mandatory && (
                <button type="button" className={styles.close} onClick={close} aria-label={t('billing.paywall.close')}>
                  ✕
                </button>
              )}
            </div>
            <div className={styles.body}>
              {paywall.step === 'plans' &&
                (catalog && view && catalog.plans.length ? (
                  <>
                    {mandatory && <p className={styles.hint}>{t('billing.paywall.chooseHint')}</p>}
                    <PlanCards
                      catalog={catalog}
                      view={view}
                      access={state?.access ?? 'none'}
                      mustChoose={mandatory}
                      busy={busy}
                      onView={(next) => update({ view: next })}
                      onFree={() => void chooseFree()}
                      onPaid={() => update({ step: 'checkout', view })}
                    />
                  </>
                ) : (
                  <p className={styles.hint}>{catalog ? t('billing.paywall.unavailable') : t('billing.paywall.loading')}</p>
                ))}
              {paywall.step === 'checkout' && token && catalog && view && (
                <CheckoutStep token={token} catalog={catalog} view={view} promo={paywall.promo} onBack={() => update({ step: 'plans', promo: undefined })} onDone={() => void finished()} onGift={() => void gifted()} />
              )}
              {(paywall.step === 'done' || paywall.step === 'gift') && (
                <div className={styles.done}>
                  <h3>{paywall.step === 'gift' ? t('billing.gift.title', { name: paid ? planName(paid, lang) : '' }) : t('billing.done.title')}</h3>
                  <p>
                    {paywall.step === 'gift'
                      ? t('billing.gift.text', { name: paid ? planName(paid, lang) : '', code: state?.gift?.code ?? paywall.promo ?? '' })
                      : trialEnd
                        ? t('billing.done.trialText', { date: new Intl.DateTimeFormat(lang, { dateStyle: 'long' }).format(new Date(trialEnd)) })
                        : t('billing.done.text', { name: paid ? planName(paid, lang) : '' })}
                  </p>
                  <button type="button" className={styles.primary} onClick={close}>
                    {t('billing.done.cta')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
