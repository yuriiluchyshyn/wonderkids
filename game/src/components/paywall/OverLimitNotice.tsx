import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paidPlan, planName } from '@pulsar/plans';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import { useGameStore } from '@/core/child/store/useGameStore';
import { usePlan, useAllowance } from '@/core/account/billing/usePlan';
import { useLang, useT } from '@/core/translator';
import { AddChildrenDialog } from './AddChildrenDialog';
import { TrimChildrenDialog } from './TrimChildrenDialog';
import pStyles from '@/components/parent/Parent.module.css';
import styles from './Paywall.module.css';

/**
 * Shown to the parents while there are more children than their plan has room for
 * (a switch to Basic, a subscription that ended, a change the owner made): the
 * children's accounts are paused. Either a plan with room for them is added —
 * and everything comes back — or the children that do not fit are removed.
 *
 * On the cabinet's first page (`compact`) it only points the way; the choices
 * themselves are made on the subscription's page, where saving is not held back
 * for an explicit «Зберегти».
 */
export function OverLimitNotice({ compact }: { compact?: boolean }) {
  const t = useT();
  const lang = useLang();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const profiles = useGameStore((s) => s.children.length);
  const { state, catalog, open, setState } = usePlan();
  const { restricted } = useAllowance();
  const [adding, setAdding] = useState(false);
  const [trimming, setTrimming] = useState(false);

  const room = !state?.paidMode ? null : restricted ? 1 : state.access === 'family' ? (state.plan?.children ?? null) : null;
  if (room === null || profiles <= room || !token) return null;

  const paid = catalog ? paidPlan(catalog) : undefined;
  const shortfall = profiles - room;

  return (
    <section className={pStyles.section} role="alert">
      <h3 className={pStyles.sectionTitle}>
        <span className="emoji" aria-hidden>⚠️</span> {t('billing.over.title')}
      </h3>
      <p>{t('billing.over.text', { profiles, room })}</p>
      <p className={pStyles.hint}>{restricted ? t('billing.over.fixFree', { paid: paid ? planName(paid, lang) : '' }) : t('billing.over.fixFamily')}</p>
      <div className={pStyles.chipRow}>
        {compact ? (
          <button type="button" className={styles.primary} onClick={() => navigate('/parent/subscription')}>
            {t('billing.over.settle')}
          </button>
        ) : (
          <>
            {restricted ? (
              <button type="button" className={styles.primary} onClick={() => open({ reason: 'upgrade', step: 'plans', view: null, perk: 'children' })}>
                {t('billing.over.seePlans')}
              </button>
            ) : (
              <button type="button" className={styles.primary} onClick={() => setAdding(true)}>
                {t('billing.over.addPlaces')}
              </button>
            )}
            <button type="button" className={styles.secondary} onClick={() => setTrimming(true)}>
              {t('billing.over.remove')}
            </button>
          </>
        )}
      </div>

      {adding && state?.plan && (
        <AddChildrenDialog
          token={token}
          current={state.plan.children ?? room}
          period={state.plan.period ?? 'year'}
          region={state.plan.region}
          catalog={catalog}
          minAdd={shortfall}
          onClose={() => setAdding(false)}
          onDone={(next) => setState(next)}
        />
      )}
      {trimming && <TrimChildrenDialog keep={room} onClose={() => setTrimming(false)} onDone={() => setTrimming(false)} />}
    </section>
  );
}
