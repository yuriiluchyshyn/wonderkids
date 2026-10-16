import { useEffect, useState } from 'react';
import { MAX_CHILDREN, childrenIncluded, freePlan, paidPlan, planName, type Period } from '@pulsar/plans';
import { ApiError, billingApi } from '@/core/account/api/client';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import { usePlan } from '@/core/account/billing/usePlan';
import { useLang, useT } from '@/core/translator';
import pStyles from '@/components/parent/Parent.module.css';
import styles from './Paywall.module.css';

/**
 * «Підписка» in the parents' cabinet: the account's plan and what can be done
 * with it — choose a plan, move up to the paid one (the paywall), change how
 * many children or the period (Stripe prorates), go to the free plan at the
 * end of the paid period or keep the paid one after all, and Stripe's portal
 * for the card and the invoices. A gift is only shown. Nothing in the free mode.
 */
export function BillingSection() {
  const t = useT();
  const lang = useLang();
  const token = useAuthStore((s) => s.token);
  const { state, catalog, load, setState, open } = usePlan();
  const [children, setChildren] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (token && !state) void load(token);
  }, [token, state, load]);

  useEffect(() => setChildren(state?.plan?.children ?? null), [state?.plan?.children]);

  if (!token || !state?.paidMode) return null;
  const paid = catalog ? paidPlan(catalog) : undefined;
  const free = catalog ? freePlan(catalog) : undefined;
  const paidName = paid ? planName(paid, lang) : '';
  const freeName = free ? planName(free, lang) : '';
  const date = (iso: string | null | undefined) => (iso ? new Intl.DateTimeFormat(lang, { dateStyle: 'long' }).format(new Date(iso)) : '');
  const plan = state.plan;

  const act = async (work: () => Promise<void>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    setNote(null);
    try {
      await work();
      setNote({ ok: true, text: t('billing.section.saved') });
    } catch (err) {
      // The server's own words in the cabinet's language, else a plain «try again».
      setNote({ ok: false, text: (err instanceof ApiError && err.text) || t('billing.checkout.error') });
    } finally {
      setBusy(false);
    }
  };
  const change = (body: { children?: number; period?: Period; cancel?: boolean }, confirmText?: string) =>
    act(async () => setState(await billingApi.change(token, body)), confirmText);
  const portal = () =>
    act(async () => {
      window.location.assign((await billingApi.portal(token)).url);
    });

  const least = catalog ? childrenIncluded(catalog) : 1;

  return (
    <section className={pStyles.section}>
      <h3 className={pStyles.sectionTitle}>💳 {t('billing.section.title')}</h3>

      {state.access === 'none' && (
        <>
          <p className={pStyles.hint}>{t('billing.section.none')}</p>
          <button type="button" className={styles.primary} onClick={() => open({ reason: 'upgrade', step: 'plans', view: null })}>
            {t('billing.section.choose')}
          </button>
        </>
      )}

      {state.access === 'free' && (
        <>
          <p>{t('billing.section.current', { name: freeName })}</p>
          <button type="button" className={styles.primary} onClick={() => open({ reason: 'upgrade', step: 'plans', view: null })}>
            {t('billing.section.upgrade', { name: paidName })}
          </button>
        </>
      )}

      {state.access === 'gift' && (
        <>
          <p>{t('billing.section.gift', { name: paidName })}</p>
          {state.gift?.code && <p className={pStyles.hint}>{t('billing.section.giftCode', { code: state.gift.code })}</p>}
        </>
      )}

      {state.access === 'family' && plan && (
        <div className={styles.priceBlock} style={{ gap: 10 }}>
          <p>
            <b>{t('billing.section.current', { name: paidName })}</b>
            {children ? ` · ${t('billing.kids', { count: plan.children ?? children })}` : ''}
          </p>
          {plan.status === 'trialing' && plan.trialEnd && <p className={pStyles.hint}>{t('billing.section.trial', { date: date(plan.trialEnd) })}</p>}
          {plan.status === 'active' && !plan.cancelAtPeriodEnd && plan.periodEnd && <p className={pStyles.hint}>{t('billing.section.next', { date: date(plan.periodEnd) })}</p>}
          {plan.status === 'past_due' && <p className={styles.warn}>{t('billing.section.pastDue', { name: paidName })}</p>}
          {plan.cancelAtPeriodEnd && (
            <p className={styles.warn} style={{ background: '#fee2e2', color: '#991b1b' }}>
              {t('billing.section.cancelled', { date: date(plan.periodEnd) })}
            </p>
          )}
          <p className={pStyles.hint}>{t('billing.section.period', { period: t(plan.period === 'year' ? 'billing.paywall.yearly' : 'billing.paywall.monthly') })}</p>

          {!plan.cancelAtPeriodEnd && children !== null && (
            <div className={styles.childrenPick}>
              <span>{t('billing.section.children')}</span>
              <div className={styles.stepper}>
                <button type="button" aria-label={t('billing.paywall.fewer')} disabled={busy || children <= least} onClick={() => setChildren(children - 1)}>
                  −
                </button>
                <output aria-live="polite">{children}</output>
                <button type="button" aria-label={t('billing.paywall.more')} disabled={busy || children >= MAX_CHILDREN} onClick={() => setChildren(children + 1)}>
                  +
                </button>
              </div>
            </div>
          )}
          {children !== null && children !== plan.children && (
            <button type="button" className={styles.primary} disabled={busy} onClick={() => void change({ children }, t('billing.section.confirmChange'))}>
              {t('billing.section.apply')}
            </button>
          )}

          <div className={pStyles.chipRow}>
            {!plan.cancelAtPeriodEnd && (
              <button type="button" className={styles.secondary} disabled={busy} onClick={() => void change({ period: plan.period === 'year' ? 'month' : 'year' }, t('billing.section.confirmChange'))}>
                {t(plan.period === 'year' ? 'billing.section.toMonthly' : 'billing.section.toYearly')}
              </button>
            )}
            {plan.cancelAtPeriodEnd ? (
              <button type="button" className={styles.primary} disabled={busy} onClick={() => void change({ cancel: false })}>
                {t('billing.section.resume')}
              </button>
            ) : (
              <button type="button" className={styles.secondary} disabled={busy} onClick={() => void change({ cancel: true }, t('billing.section.confirmToFree', { name: freeName, date: date(plan.periodEnd ?? plan.trialEnd) }))}>
                {t('billing.section.toFree', { name: freeName })}
              </button>
            )}
            <button type="button" className={styles.secondary} disabled={busy} onClick={() => void portal()}>
              {t('billing.section.portal')}
            </button>
          </div>
        </div>
      )}

      {note && <p className={note.ok ? pStyles.hint : styles.error}>{note.text}</p>}
    </section>
  );
}
