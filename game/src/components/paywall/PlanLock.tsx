import { freePlan, paidPlan, planName } from '@pulsar/plans';
import { usePlan } from '@/core/account/billing/usePlan';
import { useLang, useT } from '@/core/translator';
import pStyles from '@/components/parent/Parent.module.css';
import styles from './Paywall.module.css';

/**
 * In place of a control the parents' plan does not give (the family's goals, the
 * screen time): what the plan holds back, and the way to the offer — the plans,
 * with the one they have now marked and what the other would give.
 */
export function PlanLock({ perk }: { perk: 'goals' | 'time' }) {
  const t = useT();
  const lang = useLang();
  const { catalog, open } = usePlan();
  const paid = catalog ? paidPlan(catalog) : undefined;
  const free = catalog ? freePlan(catalog) : undefined;
  const minutes = free?.facts.dailyMinutes ?? 15;
  return (
    <div className={styles.lock}>
      <p className={pStyles.hint}>
        <span className="emoji" aria-hidden>🔒</span>{' '}
        {perk === 'goals' ? t('billing.lock.goals', { paid: paid ? planName(paid, lang) : '' }) : t('billing.lock.time', { minutes: t('parent.time.minutes', { n: minutes }), paid: paid ? planName(paid, lang) : '' })}
      </p>
      <button type="button" className={styles.primary} onClick={() => open({ reason: 'upgrade', step: 'plans', view: null, perk })}>
        {t('billing.lock.see')}
      </button>
    </div>
  );
}
