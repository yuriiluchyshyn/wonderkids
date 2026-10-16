import { useEffect, useState } from 'react';
import { MAX_CHILDREN, freePlan, paidPlan, planName, type Period } from '@pulsar/plans';
import { ApiError, billingApi } from '@/core/account/api/client';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import { usePlan } from '@/core/account/billing/usePlan';
import { useLang, useT } from '@/core/translator';
import pStyles from '@/components/parent/Parent.module.css';
import { AddChildrenDialog } from './AddChildrenDialog';
import { Dialog } from './Dialog';
import styles from './Paywall.module.css';

/**
 * «Підписка» in the parents' cabinet: the account's plan and what can be done
 * with it — choose a plan, move up to the paid one (the paywall), add children
 * (a window to choose how many, then one with the amount due now, which Stripe
 * charges once the parent approves), change the period, go to the free plan at
 * the end of the paid period or keep the paid one after all, and Stripe's portal
 * for the card and the invoices. A gift is only shown. Nothing in the free mode.
 */
export function BillingSection() {
  const t = useT();
  const lang = useLang();
  const token = useAuthStore((s) => s.token);
  const { state, catalog, load, setState, open } = usePlan();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [adding, setAdding] = useState(false);
  const [asked, setAsked] = useState<{ text: string; run: () => Promise<void> } | null>(null);

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

  const act = async (work: () => Promise<void>) => {
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
  const change = (body: { period?: Period; cancel?: boolean }) => act(async () => setState(await billingApi.change(token, body)));
  // A question in the cabinet's own window (not the browser's): the work is done once the parent says yes.
  const ask = (text: string, body: { period?: Period; cancel?: boolean }) => setAsked({ text, run: () => change(body) });
  const portal = () =>
    act(async () => {
      window.location.assign((await billingApi.portal(token)).url);
    });

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
            {!plan.cancelAtPeriodEnd && (plan.children ?? 0) < MAX_CHILDREN && (
              <button type="button" className={styles.primary} disabled={busy} onClick={() => setAdding(true)}>
                <span className="emoji" aria-hidden>➕</span> {t('billing.section.addChild')}
              </button>
            )}
            {!plan.cancelAtPeriodEnd && (
              <button type="button" className={styles.secondary} disabled={busy} onClick={() => ask(t('billing.section.confirmPeriod'), { period: plan.period === 'year' ? 'month' : 'year' })}>
                {t(plan.period === 'year' ? 'billing.section.toMonthly' : 'billing.section.toYearly')}
              </button>
            )}
            {plan.cancelAtPeriodEnd ? (
              <button type="button" className={styles.primary} disabled={busy} onClick={() => void change({ cancel: false })}>
                {t('billing.section.resume')}
              </button>
            ) : (
              <button type="button" className={styles.secondary} disabled={busy} onClick={() => ask(t('billing.section.confirmToFree', { name: freeName, date: date(plan.periodEnd ?? plan.trialEnd) }), { cancel: true })}>
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

      {adding && plan && (
        <AddChildrenDialog
          token={token}
          current={plan.children ?? 1}
          period={plan.period ?? 'year'}
          region={plan.region}
          catalog={catalog}
          onClose={() => setAdding(false)}
          onDone={(next) => setState(next)}
        />
      )}
      {asked && (
        <Dialog title={t('billing.section.title')} onClose={() => setAsked(null)}>
          <p className={styles.dialogText}>{asked.text}</p>
          <div className={styles.dialogActions}>
            <button type="button" className={styles.secondary} onClick={() => setAsked(null)}>
              {t('billing.dialog.cancel')}
            </button>
            <button
              type="button"
              className={styles.primary}
              onClick={() => {
                const { run } = asked;
                setAsked(null);
                void run();
              }}
            >
              {t('billing.dialog.ok')}
            </button>
          </div>
        </Dialog>
      )}
    </section>
  );
}
