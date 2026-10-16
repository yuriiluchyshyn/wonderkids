import { AnimatePresence, motion } from 'framer-motion';
import {
  MAX_CHILDREN,
  childrenIncluded,
  formatPrice,
  freePlan,
  paidPlan,
  planName,
  totalOf,
  yearAgainstMonths,
  yearSaving,
  type Catalog,
  type CatalogPlan,
  type View,
} from '@pulsar/plans';
import type { Access } from '@/core/account/api/client';
import { useLang, useT } from '@/core/translator';
import styles from './Paywall.module.css';

/**
 * The two plans of the paywall, drawn from Stripe's catalogue: the period,
 * the free plan, and the paid one with the trial said big, the year against
 * twelve months, and how many children. A change of period or children slides
 * the price in anew; the switch's pill slides under the period chosen.
 */
export function PlanCards({ catalog, view, access, mustChoose, busy, onView, onFree, onPaid }: {
  catalog: Catalog;
  view: View;
  access: Access;
  /** The parent must answer: «stay on the free plan» is a choice too. */
  mustChoose: boolean;
  busy: boolean;
  onView: (view: View) => void;
  onFree: () => void;
  onPaid: () => void;
}) {
  const t = useT();
  const lang = useLang();
  const paid = paidPlan(catalog);
  const free = freePlan(catalog);
  const saving = paid ? yearSaving(paid, view.region) : null;

  return (
    <>
      <div className={styles.periods}>
        <div className={styles.seg} role="group" data-period={view.period} aria-label={t('billing.paywall.yearly')}>
          {(['year', 'month'] as const).map((period) => (
            <button key={period} type="button" aria-pressed={view.period === period} onClick={() => onView({ ...view, period })}>
              {t(period === 'year' ? 'billing.paywall.yearly' : 'billing.paywall.monthly')}
              {period === 'year' && saving ? <span className={styles.saveTag}>{t('billing.paywall.save', { percent: saving })}</span> : null}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.cards}>
        {free && (
          <PlanCard plan={free} current={access === 'free'}>
            <p className={styles.price}>
              <b>{formatPrice(0, catalog.regions.find((r) => r.id === view.region)?.currency ?? 'USD', lang)}</b> <span>{t('billing.paywall.forever')}</span>
            </p>
            <Features plan={free} lang={lang} />
            {(mustChoose || access === 'none') && (
              <button type="button" className={styles.secondary} disabled={busy} onClick={onFree}>
                {t('billing.paywall.chooseFree', { name: planName(free, lang) })}
              </button>
            )}
          </PlanCard>
        )}
        {paid && (
          <PlanCard plan={paid} current={false} pro>
            {paid.facts.trialDays ? <p className={styles.trialBanner}>{t('billing.paywall.freeDays', { count: paid.facts.trialDays })}</p> : null}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={`${view.period}:${view.children}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                <PaidPrice catalog={catalog} view={view} />
              </motion.div>
            </AnimatePresence>
            <ChildrenPick catalog={catalog} view={view} onView={onView} />
            <Features plan={paid} lang={lang} />
            <button type="button" className={styles.primary} disabled={busy} onClick={onPaid}>
              {t('billing.paywall.start')} <span className="emoji" aria-hidden>🚀</span>
            </button>
          </PlanCard>
        )}
      </div>
    </>
  );
}

function PlanCard({ plan, current, pro, children }: { plan: CatalogPlan; current: boolean; pro?: boolean; children: React.ReactNode }) {
  const t = useT();
  const lang = useLang();
  return (
    <article className={pro ? `${styles.card} ${styles.cardPro}` : styles.card}>
      {current ? <span className={styles.currentTag}>{t('billing.paywall.current')}</span> : plan.badge[lang] ? <span className={styles.badge}>{plan.badge[lang]}</span> : null}
      <h3 className={styles.planName}>{planName(plan, lang)}</h3>
      {plan.tagline[lang] && <p className={styles.tagline}>{plan.tagline[lang]}</p>}
      {children}
    </article>
  );
}

function Features({ plan, lang }: { plan: CatalogPlan; lang: string }) {
  const lines = plan.features[lang] ?? plan.features.en ?? [];
  return lines.length ? (
    <ul className={styles.features}>
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  ) : null;
}

function PaidPrice({ catalog, view }: { catalog: Catalog; view: View }) {
  const t = useT();
  const lang = useLang();
  const total = totalOf(catalog, view);
  if (!total) return null;
  const year = view.period === 'year' ? yearAgainstMonths(catalog, view) : null;
  return (
    <div className={styles.priceBlock}>
      <p className={styles.pricePlan}>
        {t(view.period === 'year' ? 'billing.paywall.yearPlan' : 'billing.paywall.monthPlan')}
        {year?.saving ? <span className={styles.savePill}>{t('billing.paywall.save', { percent: year.saving })}</span> : null}
      </p>
      <p className={styles.price}>
        {year?.saving ? <s>{formatPrice(year.full, total.currency, lang)}</s> : null} <b>{formatPrice(total.amount, total.currency, lang)}</b>{' '}
        <span>{t(view.period === 'year' ? 'billing.paywall.perYear' : 'billing.paywall.perMonth')}</span>
      </p>
      {view.period === 'year' && <p className={styles.note}>{t('billing.paywall.monthlyEq', { price: formatPrice(Math.round(total.amount / 12), total.currency, lang) })}</p>}
      {!total.taxIncluded && <p className={styles.note}>{t('billing.paywall.taxExtra')}</p>}
    </div>
  );
}

function ChildrenPick({ catalog, view, onView }: { catalog: Catalog; view: View; onView: (view: View) => void }) {
  const t = useT();
  const lang = useLang();
  const total = totalOf(catalog, view);
  if (!total?.extra) return null;
  const least = childrenIncluded(catalog);
  return (
    <>
      <div className={styles.childrenPick}>
        <span>{t('billing.paywall.children')}</span>
        <div className={styles.stepper}>
          <button type="button" aria-label={t('billing.paywall.fewer')} disabled={view.children <= least} onClick={() => onView({ ...view, children: view.children - 1 })}>
            −
          </button>
          <output aria-live="polite">{view.children}</output>
          <button type="button" aria-label={t('billing.paywall.more')} disabled={view.children >= MAX_CHILDREN} onClick={() => onView({ ...view, children: view.children + 1 })}>
            +
          </button>
        </div>
      </div>
      <p className={styles.note}>
        {t('billing.paywall.extra', {
          included: t('billing.kids', { count: least }),
          price: formatPrice(total.extra.amount, total.extra.currency, lang),
          per: t(view.period === 'year' ? 'billing.paywall.perYear' : 'billing.paywall.perMonth'),
        })}
      </p>
    </>
  );
}
