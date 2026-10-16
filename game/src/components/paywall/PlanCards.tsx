import { AnimatePresence, motion } from 'framer-motion';
import {
  MAX_CHILDREN,
  baseOf,
  childrenIncluded,
  extraOf,
  formatPrice,
  freePlan,
  isChildrenLine,
  paidPlan,
  planName,
  totalOf,
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
          // No plan chosen and the free plan are the same: either way this is the plan the parent has now.
          <PlanCard plan={free} current={access === 'free' || (access === 'none' && !mustChoose)}>
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
            <Features plan={paid} lang={lang} childrenNote={childrenNoteOf(catalog, view, lang, t('billing.paywall.perMonth'), t('billing.paywall.perYear'))} included={childrenIncluded(catalog)} />
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
      {/* The name and the badge on one line. */}
      <div className={styles.planHead}>
        <h3 className={styles.planName}>{planName(plan, lang)}</h3>
        {current ? <span className={styles.currentTag}>{t('billing.paywall.current')}</span> : plan.badge[lang] ? <span className={styles.badge}>{plan.badge[lang]}</span> : null}
      </div>
      {plan.tagline[lang] && <p className={styles.tagline}>{plan.tagline[lang]}</p>}
      {children}
    </article>
  );
}

/** `childrenNote` — what a child beyond those included costs; it is said in the line that speaks of the children the plan includes. */
function Features({ plan, lang, childrenNote, included }: { plan: CatalogPlan; lang: string; childrenNote?: string; included?: number }) {
  const lines = plan.features[lang] ?? plan.features.en ?? [];
  const noted = childrenNote && included ? lines.findIndex((line) => isChildrenLine(line, included)) : -1;
  return lines.length ? (
    <ul className={styles.features}>
      {lines.map((line, i) => (
        <li key={line}>{i === noted ? `${line}${childrenNote}` : line}</li>
      ))}
    </ul>
  ) : null;
}

/** « — +1,25 € на місяць (14,99 € на рік)»: what each child beyond those included costs, for the period chosen. */
function childrenNoteOf(catalog: Catalog, view: View, lang: string, month: string, year: string): string {
  const extra = totalOf(catalog, view)?.extra;
  if (!extra) return '';
  return view.period === 'year'
    ? ` — +${formatPrice(Math.round(extra.amount / 12), extra.currency, lang)} ${month} (${formatPrice(extra.amount, extra.currency, lang)} ${year})`
    : ` — +${formatPrice(extra.amount, extra.currency, lang)} ${month}`;
}

function PaidPrice({ catalog, view }: { catalog: Catalog; view: View }) {
  const t = useT();
  const lang = useLang();
  // The big price is the plan's own; the children beyond those included are said apart, never added into it.
  const total = baseOf(catalog, view);
  if (!total) return null;
  const monthly = view.period === 'year' ? baseOf(catalog, { ...view, period: 'month' }) : null;
  const full = monthly ? monthly.amount * 12 : 0;
  const year = monthly ? { saving: full > total.amount ? Math.round((1 - total.amount / full) * 100) : 0 } : null;
  const more = extraOf(catalog, view);
  return (
    <div className={styles.priceBlock}>
      <p className={styles.pricePlan}>
        {t(view.period === 'year' ? 'billing.paywall.yearPlan' : 'billing.paywall.monthPlan')}
        {year?.saving ? <span className={styles.savePill}>{t('billing.paywall.save', { percent: year.saving })}</span> : null}
      </p>
      {view.period === 'year' ? (
        <>
          {/* Three prices, in the middle: the month as the monthly plan charges it (crossed out), the month the year comes to, and — small — what is really paid, once a year. */}
          <p className={styles.price}>
            {year?.saving && monthly ? <s>{formatPrice(monthly.amount, total.currency, lang)}</s> : null} <b>{formatPrice(Math.round(total.amount / 12), total.currency, lang)}</b>{' '}
            <span>{t('billing.paywall.perMonth')}</span>
          </p>
          <p className={styles.real}>
            {formatPrice(total.amount, total.currency, lang)} {t('billing.paywall.perYear')}
          </p>
        </>
      ) : (
        <p className={styles.price}>
          <b>{formatPrice(total.amount, total.currency, lang)}</b> <span>{t('billing.paywall.perMonth')}</span>
        </p>
      )}
      {/* «+ …» for the children chosen beyond those included — beside the plan's price, not in it. */}
      {more && (
        <p className={styles.more}>
          {t('billing.paywall.extraSum', { children: t('billing.kids', { count: more.count }) })}{' '}
          {view.period === 'year' ? (
            <>
              <b>+{formatPrice(Math.round(more.amount / 12), more.currency, lang)}</b> {t('billing.paywall.perMonth')}{' '}
              <small>
                ({formatPrice(more.amount, more.currency, lang)} {t('billing.paywall.perYear')})
              </small>
            </>
          ) : (
            <>
              <b>+{formatPrice(more.amount, more.currency, lang)}</b> {t('billing.paywall.perMonth')}
            </>
          )}
        </p>
      )}
      {!total.taxIncluded && <p className={styles.note}>{t('billing.paywall.taxExtra')}</p>}
    </div>
  );
}

function ChildrenPick({ catalog, view, onView }: { catalog: Catalog; view: View; onView: (view: View) => void }) {
  const t = useT();
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
    </>
  );
}
