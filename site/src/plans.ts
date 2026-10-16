/**
 * The plans, drawn from what Stripe keeps. The site holds no plan, price or
 * «what is included» of its own: the API reads them from Stripe
 * (`GET /api/billing/plans`, `backend/…/core/Catalog.java`) and this turns its
 * answer into HTML — for the page of prices at build time (so a crawler reads
 * the prices) and in the browser, in the window of prices every page opens.
 *
 * The prices are the visitor's region's — by their country, as the API saw it;
 * there is nothing to pick. The page's own words (labels, units) are the site's
 * dictionary (`pricing.*`), handed in as `words`.
 *
 * No DOM here: the build and the page's script both use it.
 */

import { MAX_CHILDREN, PERIODS, childrenIncluded, formatPrice, paidPlan, totalOf, yearSaving, type Catalog, type CatalogPlan, type View } from '@pulsar/plans';

// The plans' data and sums are shared with the game's paywall (`@pulsar/plans`); here they are only drawn.
export { MAX_CHILDREN, PERIODS, childrenIncluded, firstView, formatPrice, paidPlan, regionOfLang, totalOf } from '@pulsar/plans';
export type { Catalog, CatalogPlan, CatalogPrice, CatalogRegion, Period, View } from '@pulsar/plans';

/** The dictionary's section `pricing`, as it stands in the language's file. */
export type Words = Record<string, unknown>;

const esc = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A text of `words` by its dotted path, its `{holes}` filled. */
export function say(words: Words, path: string, holes: Record<string, string | number> = {}): string {
  const found = path.split('.').reduce<unknown>((node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined), words);
  const text = typeof found === 'string' ? found : '';
  return text.replace(/\{(\w+)\}/g, (all, name: string) => (name in holes ? String(holes[name]) : all));
}

/** «15 хвилин», «2 dzieci» — a number with its unit, in the form the language asks for. */
export function counted(words: Words, unit: string, count: number, lang: string): string {
  const forms = ((words.unit as Record<string, Record<string, string>> | undefined) ?? {})[unit] ?? {};
  const rule = new Intl.PluralRules(lang).select(count);
  return (forms[rule] ?? forms.other ?? '{count}').replace('{count}', String(count));
}

/** The facts the sentences speak of, each with its unit: `{minutes}` → «15 хвилин». */
export function factsOf(catalog: Catalog, words: Words, lang: string): Record<string, string> {
  const free = catalog.plans.find((plan) => plan.kind === 'free');
  const paid = paidPlan(catalog);
  const out: Record<string, string> = {};
  if (free) out.free = free.name[lang] ?? free.name.en ?? free.id;
  if (paid) out.paid = paid.name[lang] ?? paid.name.en ?? paid.id;
  if (free?.facts.dailyMinutes) out.minutes = counted(words, 'minutes', free.facts.dailyMinutes, lang);
  if (paid?.facts.trialDays) out.days = counted(words, 'days', paid.facts.trialDays, lang);
  if (paid?.facts.childrenIncluded) out.children = counted(words, 'children', paid.facts.childrenIncluded, lang);
  return out;
}

/** A block whose content changes with a choice: drawn anew, it fades in (`.swap` in pricing.css) when `animate`. */
const swap = (animate: boolean): string => (animate ? ' swap' : '');

function planCard(plan: CatalogPlan, catalog: Catalog, view: View, lang: string, words: Words, facts: Record<string, string>, animate: boolean): string {
  const paid = plan.kind === 'paid';
  const currency = catalog.regions.find((region) => region.id === view.region)?.currency ?? 'USD';
  const lines: string[] = [`<article class="card plan${paid ? ' plan-pro' : ''}" data-plan="${esc(plan.id)}">`];
  const badge = plan.badge[lang];
  if (badge) lines.push(`<span class="plan-badge">${esc(badge)}</span>`);
  lines.push(`<h2>${esc(plan.name[lang] ?? plan.name.en ?? plan.id)}</h2>`);
  const tagline = plan.tagline[lang];
  if (tagline) lines.push(`<p class="plan-for">${esc(tagline)}</p>`);

  if (!paid) {
    lines.push(`<div class="price-block"><p class="price"><b>${esc(formatPrice(0, currency, lang))}</b> <span>${esc(say(words, 'forever'))}</span></p></div>`);
  } else {
    // The trial, said big: the first thing a parent should see on the paid card.
    if (facts.days) lines.push(`<p class="trial-banner">${esc(say(words, 'freeDays', facts))}</p>`);
    const total = totalOf(catalog, view);
    if (total) {
      const block: string[] = [`<div class="price-block${swap(animate)}">`];
      if (view.period === 'year') {
        // Three prices, in the middle: the month as the monthly plan would charge it (crossed out), the month the year comes to
        // (the big one), and — small, under them — what is really paid, once a year.
        const monthly = totalOf(catalog, { ...view, period: 'month' });
        const full = monthly ? monthly.amount * 12 : 0;
        const saving = full > total.amount ? Math.round((1 - total.amount / full) * 100) : 0;
        block.push(`<p class="price-plan">${esc(say(words, 'yearPlan'))}${saving ? ` <span class="save-pill">${esc(say(words, 'save', { percent: saving }))}</span>` : ''}</p>`);
        block.push(`<p class="price">${saving && monthly ? `<s>${esc(formatPrice(monthly.amount, total.currency, lang))}</s> ` : ''}<b>${esc(formatPrice(Math.round(total.amount / 12), total.currency, lang))}</b> <span>${esc(say(words, 'perMonth'))}</span></p>`);
        block.push(`<p class="price-note price-real">${esc(formatPrice(total.amount, total.currency, lang))} ${esc(say(words, 'perYear'))}</p>`);
      } else {
        block.push(`<p class="price-plan">${esc(say(words, 'monthPlan'))}</p>`);
        block.push(`<p class="price"><b>${esc(formatPrice(total.amount, total.currency, lang))}</b> <span>${esc(say(words, 'perMonth'))}</span></p>`);
      }
      if (!total.taxIncluded) block.push(`<p class="price-note">${esc(say(words, 'taxExtra'))}</p>`);
      block.push('</div>');
      lines.push(block.join(''));
      // How many children: from those the plan includes up; every one beyond is a slot of its own.
      if (total.extra) {
        const least = childrenIncluded(catalog);
        // The same three prices for a child beyond those included: on a year, the month it would cost on the monthly plan
        // (crossed out), the month the year comes to, and the real price of the year, small.
        const extra = total.extra;
        const included = esc(say(words, 'extraIncluded', { children: facts.children ?? String(least) }));
        let each: string;
        if (view.period === 'year') {
          const monthlyExtra = totalOf(catalog, { ...view, period: 'month' })?.extra;
          const crossed = monthlyExtra && monthlyExtra.amount * 12 > extra.amount ? `<s>${esc(formatPrice(monthlyExtra.amount, extra.currency, lang))}</s> ` : '';
          each = `${esc(say(words, 'extraEach'))} ${crossed}<b>+${esc(formatPrice(Math.round(extra.amount / 12), extra.currency, lang))}</b> ${esc(say(words, 'perMonth'))}<small>${esc(formatPrice(extra.amount, extra.currency, lang))} ${esc(say(words, 'perYear'))}</small>`;
        } else {
          each = `${esc(say(words, 'extraEach'))} <b>+${esc(formatPrice(extra.amount, extra.currency, lang))}</b> ${esc(say(words, 'perMonth'))}`;
        }
        lines.push(
          `<div class="children-pick"><span class="children-label">${esc(say(words, 'children'))}</span>`,
          `<div class="stepper"><button type="button" data-children="-1" aria-label="${esc(say(words, 'fewer'))}"${view.children <= least ? ' disabled' : ''}>−</button>`,
          `<output aria-live="polite">${view.children}</output>`,
          `<button type="button" data-children="1" aria-label="${esc(say(words, 'more'))}"${view.children >= MAX_CHILDREN ? ' disabled' : ''}>+</button></div></div>`,
          `<p class="price-extra${swap(animate)}">${included}<span class="extra-each">${each}</span></p>`,
        );
      }
    }
  }

  const features = plan.features[lang] ?? plan.features.en ?? [];
  if (features.length > 0) lines.push(`<ul class="plan-features">${features.map((line) => `<li>${esc(line)}</li>`).join('')}</ul>`);
  if (paid) {
    if (facts.days) lines.push(`<p class="plan-trial">${esc(say(words, 'trial', facts))}</p>`);
    lines.push(`<button type="button" class="btn btn-try" data-start>${esc(say(words, 'start'))} <span class="emoji" aria-hidden="true">🚀</span></button>`);
  }
  lines.push('</article>');
  return lines.join('');
}

/** The two cards for a choice; `animate` — they are drawn anew after a choice changed, and what changed fades in. */
export function renderGrid(catalog: Catalog, view: View, lang: string, words: Words, animate = false): string {
  const facts = factsOf(catalog, words, lang);
  return `<div class="plans-grid">${catalog.plans.map((plan) => planCard(plan, catalog, view, lang, words, facts, animate)).join('')}</div>`;
}

/** The switch of the period — its pill slides to the period chosen (`.seg[data-period]`); kept in place while the cards are redrawn. */
export function renderPeriods(catalog: Catalog, view: View, words: Words): string {
  const paid = paidPlan(catalog);
  const saving = paid ? yearSaving(paid, view.region) : null;
  return [
    `<div class="pricing-controls"><div class="seg" role="group" data-period="${view.period}" aria-label="${esc(say(words, 'periodLabel'))}">`,
    ...PERIODS.map((period) => `<button type="button" data-period-pick="${period}" aria-pressed="${period === view.period}">${esc(say(words, period))}${period === 'year' && saving ? ` <span class="save">${esc(say(words, 'save', { percent: saving }))}</span>` : ''}</button>`),
    '</div></div>',
  ].join('');
}

/**
 * The plans: the switch of the period, then the two cards with the visitor's
 * region's prices and the children chosen. Without a catalogue (Stripe or the
 * API out of reach) — a line saying the prices could not be loaded.
 */
export function renderPlans(catalog: Catalog | null, view: View | null, lang: string, words: Words): string {
  // While the prices load, a small galaxy turns above the words (`.galaxy-loader` in pricing.css).
  if (!catalog || !view || catalog.plans.length === 0) return `<p class="lead plans-state" data-plans-state>${catalog === null ? '<span class="galaxy-loader" aria-hidden="true"></span>' : ''}${esc(say(words, catalog === null ? 'loading' : 'unavailable'))}</p>`;
  return `${renderPeriods(catalog, view, words)}<div data-grid>${renderGrid(catalog, view, lang, words)}</div>`;
}

/** The structured data of the page: the page and each plan as a `Product` with an `Offer` per price. */
export function pricingLd(catalog: Catalog | null, lang: string, url: string, site: string, title: string, description: string): string {
  const graph: unknown[] = [{ '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, description, inLanguage: lang, isPartOf: { '@id': `${site}/#website` } }];
  for (const plan of catalog?.plans ?? []) {
    const name = plan.name[lang] ?? plan.name.en ?? plan.id;
    const offers =
      plan.kind === 'free'
        ? (catalog?.regions ?? []).map((region) => ({ '@type': 'Offer', price: '0', priceCurrency: region.currency, url }))
        : plan.prices.map((price) => ({
            '@type': 'Offer',
            price: (price.amount / 100).toFixed(2),
            priceCurrency: price.currency,
            url,
            priceSpecification: { '@type': 'UnitPriceSpecification', price: (price.amount / 100).toFixed(2), priceCurrency: price.currency, valueAddedTaxIncluded: price.taxIncluded !== false, referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: price.period === 'year' ? 'ANN' : 'MON' } },
          }));
    graph.push({ '@type': 'Product', '@id': `${site}/#plan-${plan.id}`, name: `Pulsar Kids ${name}`, description: plan.tagline[lang] ?? undefined, brand: { '@type': 'Brand', name: 'Pulsar Kids' }, offers });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}
