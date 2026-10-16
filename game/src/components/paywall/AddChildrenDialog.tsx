import { useState } from 'react';
import { MAX_CHILDREN, formatPrice, paidPlan, priceOf, type Period } from '@pulsar/plans';
import type { Catalog } from '@pulsar/plans';
import { ApiError, billingApi, type ChildrenQuote, type PlanState } from '@/core/account/api/client';
import { GalaxyLoader } from '@/components/ui/GalaxyLoader';
import { useLang, useT } from '@/core/translator';
import { Dialog } from './Dialog';
import styles from './Paywall.module.css';

type Stage = 'pick' | 'loading' | 'review' | 'done';

/**
 * Adding children to the paid plan, in two windows. First the parent chooses
 * how many and presses «Додати»; then the amount due now (Stripe's prorations
 * for the days left — nothing in a trial) is shown and only the parent's
 * approval charges it. The amount shown is sent back with the approval: if it
 * is no longer what Stripe would charge, the server refuses and it is shown anew.
 */
export function AddChildrenDialog({ token, current, period, region, catalog, onClose, onDone }: {
  token: string;
  /** Children in the plan now. */
  current: number;
  period: Period;
  region: string | null;
  catalog: Catalog | null;
  onClose: () => void;
  /** The account's plan after the children were added. */
  onDone: (state: PlanState) => void;
}) {
  const t = useT();
  const lang = useLang();
  const room = Math.max(0, MAX_CHILDREN - current);
  const [add, setAdd] = useState(1);
  const [stage, setStage] = useState<Stage>('pick');
  const [quote, setQuote] = useState<ChildrenQuote | null>(null);
  const [charged, setCharged] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kids = (count: number) => t('billing.kids', { count });
  const money = (minor: number, currency: string) => formatPrice(minor, currency.toUpperCase(), lang);
  const date = (iso: string | null) => (iso ? new Intl.DateTimeFormat(lang, { dateStyle: 'long' }).format(new Date(iso)) : '');
  const words = (err: unknown) => (err instanceof ApiError && err.text) || t('billing.checkout.error');

  const paid = catalog ? paidPlan(catalog) : undefined;
  const extra = paid && region ? priceOf(paid.extraChild, region, period) : undefined;

  const review = async (notice?: string) => {
    setStage('loading');
    setError(null);
    try {
      setQuote(await billingApi.previewChildren(token, add));
      setError(notice ?? null);
      setStage('review');
    } catch (err) {
      setError(words(err));
      setStage('pick');
    }
  };

  const approve = async () => {
    if (!quote) return;
    setBusy(true);
    setError(null);
    try {
      const done = await billingApi.addChildren(token, { add: quote.add, prorationDate: quote.prorationDate, amount: quote.amount });
      setCharged(done.charged.amount);
      onDone(done);
      setStage('done');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'price_changed') await review(words(err));
      else {
        // A declined card and the rest: said, and nothing was added.
        setError(words(err));
        setStage('pick');
      }
    } finally {
      setBusy(false);
    }
  };

  if (stage === 'done' && quote) {
    return (
      <Dialog title={t('billing.add.doneTitle')} onClose={onClose}>
        <p className={styles.dialogText}>
          {charged > 0
            ? t('billing.add.doneText', { kids: kids(quote.childrenAfter), amount: money(charged, quote.currency) })
            : t('billing.add.doneTrial', { kids: kids(quote.childrenAfter) })}
        </p>
        <div className={styles.dialogActions}>
          <button type="button" className={styles.primary} onClick={onClose}>
            {t('billing.add.close')}
          </button>
        </div>
      </Dialog>
    );
  }

  if (stage === 'loading') {
    return (
      <Dialog title={t('billing.add.title')} locked onClose={onClose}>
        <GalaxyLoader label={t('billing.add.loading')} />
      </Dialog>
    );
  }

  if (stage === 'review' && quote) {
    const due = quote.amount > 0;
    return (
      <Dialog title={t('billing.add.reviewTitle')} locked={busy} onClose={onClose}>
        <dl className={styles.dialogLines}>
          <div>
            <dt>{t('billing.add.changeLine')}</dt>
            <dd>
              {quote.children} → <b>{quote.childrenAfter}</b>
            </dd>
          </div>
          <div className={styles.dialogDue}>
            <dt>{due ? t('billing.add.due') : t('billing.add.dueNothing')}</dt>
            {due && <dd>{money(quote.amount, quote.currency)}</dd>}
          </div>
        </dl>
        <p className={styles.dialogText}>{quote.trialing ? t('billing.add.trialNote', { date: date(quote.nextCharge) }) : t('billing.add.prorated', { date: date(quote.nextCharge) })}</p>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.dialogActions}>
          <button type="button" className={styles.secondary} disabled={busy} onClick={() => setStage('pick')}>
            {t('billing.add.back')}
          </button>
          <button type="button" className={styles.primary} disabled={busy} onClick={() => void approve()}>
            {busy ? t('billing.add.paying') : due ? t('billing.add.confirm', { amount: money(quote.amount, quote.currency) }) : t('billing.add.confirmTrial')}
          </button>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog title={t('billing.add.title')} onClose={onClose}>
      <p className={styles.dialogText}>{t('billing.add.pickHint')}</p>
      <div className={styles.childrenPick}>
        <span>{t('billing.add.now', { kids: kids(current) })}</span>
        <div className={styles.stepper}>
          <button type="button" aria-label={t('billing.paywall.fewer')} disabled={add <= 1} onClick={() => setAdd(add - 1)}>
            −
          </button>
          <output aria-live="polite">{add}</output>
          <button type="button" aria-label={t('billing.paywall.more')} disabled={add >= room} onClick={() => setAdd(add + 1)}>
            +
          </button>
        </div>
      </div>
      <p className={styles.dialogText}>{t('billing.add.after', { kids: kids(current + add) })}</p>
      {extra && (
        <p className={styles.dialogText}>
          {t('billing.add.each', { price: formatPrice(extra.amount, extra.currency, lang), per: t(period === 'year' ? 'billing.paywall.perYear' : 'billing.paywall.perMonth') })}
        </p>
      )}
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.dialogActions}>
        <button type="button" className={styles.secondary} onClick={onClose}>
          {t('billing.dialog.cancel')}
        </button>
        <button type="button" className={styles.primary} disabled={room < 1} onClick={() => void review()}>
          {t('billing.add.submit')}
        </button>
      </div>
    </Dialog>
  );
}
