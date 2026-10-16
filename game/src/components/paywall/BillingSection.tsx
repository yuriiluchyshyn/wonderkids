import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { freePlan, paidPlan, planName } from '@pulsar/plans';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import { usePlan } from '@/core/account/billing/usePlan';
import { useLang, useT } from '@/core/translator';
import pStyles from '@/components/parent/Parent.module.css';
import styles from './Paywall.module.css';

/**
 * «Підписка» at the top of the parents' cabinet: only what the account has now —
 * the plan, the children in it, the trial or the next charge — and the way on to
 * its own page (`SubscriptionPage`: children, plan, card, invoices). A gift is
 * only shown. Nothing in the free mode.
 */
export function BillingSection() {
  const t = useT();
  const lang = useLang();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const { state, catalog, load, open } = usePlan();

  useEffect(() => {
    if (token && !state) void load(token);
  }, [token, state, load]);

  if (!token || !state?.paidMode) return null;
  const paid = catalog ? paidPlan(catalog) : undefined;
  const free = catalog ? freePlan(catalog) : undefined;
  const paidName = paid ? planName(paid, lang) : '';
  const freeName = free ? planName(free, lang) : '';
  const date = (iso: string | null | undefined) => (iso ? new Intl.DateTimeFormat(lang, { dateStyle: 'long' }).format(new Date(iso)) : '');
  const plan = state.plan;
  const manage = () => navigate('/parent/subscription');

  return (
    <section className={pStyles.section}>
      <h3 className={pStyles.sectionTitle}>
        <span className="emoji" aria-hidden>💳</span> {t('billing.section.title')}
      </h3>

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
          <p>
            <b>{t('billing.section.current', { name: freeName })}</b>
          </p>
          <div className={pStyles.chipRow}>
            <button type="button" className={styles.primary} onClick={() => open({ reason: 'upgrade', step: 'plans', view: null })}>
              {t('billing.section.upgrade', { name: paidName })}
            </button>
            <button type="button" className={styles.secondary} onClick={manage}>
              {t('billing.section.manage')}
            </button>
          </div>
        </>
      )}

      {state.access === 'gift' && (
        <>
          <p>{t('billing.section.gift', { name: paidName })}</p>
          {state.gift?.code && <p className={pStyles.hint}>{t('billing.section.giftCode', { code: state.gift.code })}</p>}
        </>
      )}

      {state.access === 'family' && plan && (
        <div className={styles.priceBlock} style={{ gap: 6 }}>
          <p>
            <b>{t('billing.section.current', { name: paidName })}</b>
            {plan.children ? ` · ${t('billing.kids', { count: plan.children })}` : ''}
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
          <div className={pStyles.chipRow}>
            <button type="button" className={styles.primary} onClick={manage}>
              {t('billing.section.manage')}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
