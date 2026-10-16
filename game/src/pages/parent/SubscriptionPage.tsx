import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { formatPrice, freePlan, MAX_CHILDREN, paidPlan, planName, type Period } from '@pulsar/plans';
import { usePageMeta } from '@/core/app/seo/usePageMeta';
import { ApiError, billingApi, type BillingDetails } from '@/core/account/api/client';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import { usePlan } from '@/core/account/billing/usePlan';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useLang, useT } from '@/core/translator';
import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { AddChildrenDialog } from '@/components/paywall/AddChildrenDialog';
import { Dialog } from '@/components/paywall/Dialog';
import { PaywallGate } from '@/components/paywall/PaywallGate';
import { OverLimitNotice } from '@/components/paywall/OverLimitNotice';
import { RemoveChildDialog } from '@/components/paywall/RemoveChildDialog';
import { TrimChildrenDialog } from '@/components/paywall/TrimChildrenDialog';
import pStyles from '@/components/parent/Parent.module.css';
import styles from '@/components/paywall/Paywall.module.css';

interface Question {
  text: string;
  yes: string;
  danger?: boolean;
  run: () => Promise<void>;
}

/**
 * «Керувати підпискою»: the subscription on a page of its own, in the cabinet's
 * look — the children in the plan (add one, remove one), the plan (change how
 * often it is paid, go to Basic, go to Family), the card it is paid with, and
 * the invoices. Money is Stripe's; what is asked here is asked in the cabinet's
 * own windows.
 */
export function SubscriptionPage() {
  const t = useT();
  const lang = useLang();
  usePageMeta({ title: t('billing.manage.title') });
  const token = useAuthStore((s) => s.token);
  const { state, catalog, load, setState, open } = usePlan();
  const profiles = useGameStore((s) => s.children.length);
  const [details, setDetails] = useState<BillingDetails | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [trimming, setTrimming] = useState(false);
  const [asked, setAsked] = useState<Question | null>(null);

  useEffect(() => {
    if (token && !state) void load(token);
  }, [token, state, load]);

  // The card and the invoices are Stripe's; if they cannot be read the rest of the page still works.
  const paidMode = state?.paidMode;
  const kept = state?.plan?.children;
  useEffect(() => {
    if (!token || !paidMode) return;
    billingApi.details(token).then(setDetails).catch(() => setDetails({ card: null, invoices: [] }));
  }, [token, paidMode, kept]);

  if (state && !state.paidMode) return <Navigate to="/parent" replace />;
  if (!token || !state) return null;

  const paid = catalog ? paidPlan(catalog) : undefined;
  const free = catalog ? freePlan(catalog) : undefined;
  const paidName = paid ? planName(paid, lang) : '';
  const freeName = free ? planName(free, lang) : '';
  const date = (iso: string | null | undefined) => (iso ? new Intl.DateTimeFormat(lang, { dateStyle: 'long' }).format(new Date(iso)) : '');
  const plan = state.plan;
  const kids = (count: number) => t('billing.kids', { count });
  const money = (minor: number, currency: string) => formatPrice(minor, currency.toUpperCase(), lang);

  const act = async (work: () => Promise<void>) => {
    setBusy(true);
    setNote(null);
    try {
      await work();
      setNote({ ok: true, text: t('billing.section.saved') });
    } catch (err) {
      setNote({ ok: false, text: (err instanceof ApiError && err.text) || t('billing.checkout.error') });
    } finally {
      setBusy(false);
    }
  };
  const change = (body: { period?: Period; cancel?: boolean }) => act(async () => setState(await billingApi.change(token, body)));
  const ask = (question: Omit<Question, 'run'>, body: { period?: Period; cancel?: boolean }) => setAsked({ ...question, run: () => change(body) });
  const changeCard = () =>
    act(async () => {
      window.location.assign((await billingApi.portal(token, 'card')).url);
    });

  return (
    <div className="page stack">
      <SubPageHeader title={t('billing.manage.title')} icon="💳" backTo="/parent" />

      {/* More children than the plan has room for: the children's accounts are paused until this is settled. */}
      <OverLimitNotice />

      {/* ---- What the account has ---- */}
      <section className={pStyles.section}>
        <h3 className={pStyles.sectionTitle}>{t('billing.manage.current')}</h3>
        {state.access === 'none' && <p className={pStyles.hint}>{t('billing.section.none')}</p>}
        {state.access === 'free' && (
          <p>
            <b>{t('billing.section.current', { name: freeName })}</b>
          </p>
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
              {plan.children ? ` · ${kids(plan.children)}` : ''}
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
          </div>
        )}
        {note && <p className={note.ok ? pStyles.hint : styles.error}>{note.text}</p>}
      </section>

      {/* ---- Children: add one, remove one ---- */}
      {state.access === 'family' && plan && !plan.cancelAtPeriodEnd && (
        <section className={pStyles.section}>
          <h3 className={pStyles.sectionTitle}>{t('billing.manage.kidsTitle')}</h3>
          <p className={pStyles.hint}>{t('billing.manage.kidsLine', { places: kids(plan.children ?? profiles), profiles })}</p>
          <div className={pStyles.chipRow}>
            {(plan.children ?? 0) < MAX_CHILDREN && (
              <button type="button" className={styles.primary} disabled={busy} onClick={() => setAdding(true)}>
                <span className="emoji" aria-hidden>➕</span> {t('billing.section.addChild')}
              </button>
            )}
            <button type="button" className={styles.secondary} disabled={busy} onClick={() => setRemoving(true)}>
              <span className="emoji" aria-hidden>➖</span> {t('billing.manage.removeChild')}
            </button>
          </div>
        </section>
      )}

      {/* ---- The plan: up, down, how often it is paid ---- */}
      <section className={pStyles.section}>
        <h3 className={pStyles.sectionTitle}>{t('billing.manage.planTitle')}</h3>
        {(state.access === 'none' || state.access === 'free') && (
          <div className={pStyles.chipRow}>
            <button type="button" className={styles.primary} onClick={() => open({ reason: 'upgrade', step: 'plans', view: null })}>
              {t('billing.section.upgrade', { name: paidName })}
            </button>
          </div>
        )}
        {state.access === 'gift' && <p className={pStyles.hint}>{t('billing.manage.giftNote')}</p>}
        {state.access === 'family' && plan && (
          <div className={pStyles.chipRow}>
            {plan.cancelAtPeriodEnd ? (
              <button type="button" className={styles.primary} disabled={busy} onClick={() => void change({ cancel: false })}>
                {t('billing.section.resume')}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.secondary}
                  disabled={busy}
                  onClick={() =>
                    ask({ text: t('billing.section.confirmPeriod'), yes: t('billing.dialog.ok') }, { period: plan.period === 'year' ? 'month' : 'year' })
                  }
                >
                  {t(plan.period === 'year' ? 'billing.section.toMonthly' : 'billing.section.toYearly')}
                </button>
                <button
                  type="button"
                  className={styles.secondary}
                  disabled={busy}
                  onClick={() =>
                    setAsked({
                      // More than one child: the next window asks which of them stay — Basic has room for one.
                      text: t(profiles > 1 ? 'billing.manage.confirmDowngrade' : 'billing.manage.confirmDowngradeOne', { name: freeName, date: date(plan.periodEnd ?? plan.trialEnd) }),
                      yes: profiles > 1 ? t('billing.manage.downgradeNext') : t('billing.manage.downgradeYes', { name: freeName }),
                      danger: true,
                      run: async () => {
                        if (profiles > 1) setTrimming(true);
                        else await change({ cancel: true });
                      },
                    })
                  }
                >
                  {t('billing.section.toFree', { name: freeName })}
                </button>
              </>
            )}
          </div>
        )}
      </section>

      {/* ---- The card ---- */}
      {state.access === 'family' && (
        <section className={pStyles.section}>
          <h3 className={pStyles.sectionTitle}>{t('billing.manage.cardTitle')}</h3>
          {details === null ? (
            <p className={pStyles.hint}>{t('billing.manage.loading')}</p>
          ) : details.card ? (
            <p className={styles.cardLine}>
              <b>{details.card.brand.charAt(0).toUpperCase() + details.card.brand.slice(1)}</b> •••• {details.card.last4}
              <small>
                {' '}
                {String(details.card.expMonth).padStart(2, '0')}/{String(details.card.expYear).slice(-2)}
              </small>
            </p>
          ) : (
            <p className={pStyles.hint}>{t('billing.manage.noCard')}</p>
          )}
          <div className={pStyles.chipRow}>
            <button type="button" className={styles.secondary} disabled={busy} onClick={() => void changeCard()}>
              {t('billing.manage.changeCard')}
            </button>
          </div>
        </section>
      )}

      {/* ---- Invoices ---- */}
      {details && details.invoices.length > 0 && (
        <section className={pStyles.section}>
          <h3 className={pStyles.sectionTitle}>{t('billing.manage.invoicesTitle')}</h3>
          <ul className={styles.invoiceList}>
            {details.invoices.map((invoice) => (
              <li key={invoice.id}>
                <span className={styles.invoiceMain}>
                  <b>{invoice.number ?? '—'}</b>
                  <small>{date(invoice.created)}</small>
                </span>
                <span className={styles.invoiceSum}>{money(invoice.amount, invoice.currency)}</span>
                <span className={styles.invoiceStatus} data-status={invoice.status}>
                  {invoice.status === 'paid'
                    ? t('billing.invoice.paid')
                    : invoice.status === 'void'
                      ? t('billing.invoice.void')
                      : invoice.status === 'uncollectible'
                        ? t('billing.invoice.uncollectible')
                        : t('billing.invoice.open')}
                </span>
                <span className={styles.invoiceLinks}>
                  {invoice.hostedUrl && (
                    <a href={invoice.hostedUrl} target="_blank" rel="noreferrer">
                      {t('billing.invoice.view')}
                    </a>
                  )}
                  {invoice.pdfUrl && (
                    <a href={invoice.pdfUrl} target="_blank" rel="noreferrer">
                      PDF
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

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
      {removing && plan && <RemoveChildDialog plan={plan} catalog={catalog} onClose={() => setRemoving(false)} onDone={(next) => setState(next)} />}
      {/* Moving to Basic with several children: those ticked are deleted now, and the plan ends with the paid period. */}
      {trimming && (
        <TrimChildrenDialog
          keep={1}
          downgrade
          onClose={() => setTrimming(false)}
          onDone={() => {
            setTrimming(false);
            void change({ cancel: true });
          }}
        />
      )}
      {asked && (
        <Dialog title={t('billing.manage.title')} onClose={() => setAsked(null)}>
          <p className={asked.danger ? styles.warn : styles.dialogText}>{asked.text}</p>
          <div className={styles.dialogActions}>
            <button type="button" className={styles.secondary} onClick={() => setAsked(null)}>
              {t('billing.dialog.cancel')}
            </button>
            <button
              type="button"
              className={asked.danger ? styles.danger : styles.primary}
              onClick={() => {
                const { run } = asked;
                setAsked(null);
                void run();
              }}
            >
              {asked.yes}
            </button>
          </div>
        </Dialog>
      )}

      {/* The paywall: «Перейти на Family» opens it here too. */}
      <PaywallGate />
    </div>
  );
}
