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

export type Period = 'month' | 'year';
export const PERIODS: readonly Period[] = ['year', 'month'];

export interface CatalogPrice {
  region: string;
  period: Period;
  /** Minor units (kopiyky, grosze, cents), as Stripe keeps them. */
  amount: number;
  /** ISO 4217, upper case. */
  currency: string;
}

export interface CatalogRegion {
  id: string;
  currency: string;
  countries: string[];
  /** The region of every country no region names. */
  fallback: boolean;
  /** The site's languages whose page shows this region before the visitor's country is known. */
  langs: string[];
}

export interface CatalogPlan {
  id: string;
  kind: 'free' | 'paid';
  name: Record<string, string>;
  tagline: Record<string, string | null>;
  badge: Record<string, string | null>;
  features: Record<string, string[]>;
  facts: { dailyMinutes?: number; trialDays?: number; childrenIncluded?: number };
  prices: CatalogPrice[];
  extraChild: CatalogPrice[];
}

/** What `GET /api/billing/plans` answers. */
export interface Catalog {
  country: string | null;
  /** The visitor's region, by their country; null when the country is not known. */
  region: string | null;
  regions: CatalogRegion[];
  plans: CatalogPlan[];
}

/** The dictionary's section `pricing`, as it stands in the language's file. */
export type Words = Record<string, unknown>;

/** What is chosen: whose prices, the period, and how many children. */
export interface View {
  region: string;
  period: Period;
  children: number;
}

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

/** «79 ₴», «14,99 zł», «$6.99», «CA$8.99», «6,99 €» — a price as a reader of `lang` writes it. */
export function formatPrice(minor: number, currency: string, lang: string): string {
  const amount = minor / 100;
  const digits = Number.isInteger(amount) ? 0 : 2;
  // The hryvnia and the złoty are written after the number in every language.
  const after: Record<string, string> = { UAH: '₴', PLN: 'zł' };
  if (currency in after) return `${new Intl.NumberFormat(lang, { minimumFractionDigits: digits, maximumFractionDigits: 2 }).format(amount)} ${after[currency]}`;
  // A bare «$» would not tell the Canadian dollar from the American one.
  return new Intl.NumberFormat(lang, { style: 'currency', currency, currencyDisplay: currency === 'CAD' ? 'symbol' : 'narrowSymbol', minimumFractionDigits: digits, maximumFractionDigits: 2 })
    .format(amount)
    .replace(/\s/g, ' ');
}

/** «Україна», «Європейський Союз», «США та інші країни» — a region by the names the browser knows. */
function regionName(region: CatalogRegion, lang: string, words: Words): string {
  let name = region.id;
  try {
    name = new Intl.DisplayNames([lang], { type: 'region' }).of(region.id) ?? region.id;
  } catch {
    /* not a code the browser knows: its id */
  }
  return region.fallback ? say(words, 'otherCountries', { region: name }) : name;
}

/** Whose prices a page in `lang` shows before it knows the visitor: its language's region, else the fallback. */
export function regionOfLang(catalog: Catalog, lang: string): string | null {
  return (catalog.regions.find((region) => region.langs.includes(lang)) ?? catalog.regions.find((region) => region.fallback) ?? catalog.regions[0])?.id ?? null;
}

/** The paid plan, the one the window sells. */
export const paidPlan = (catalog: Catalog): CatalogPlan | undefined => catalog.plans.find((plan) => plan.kind === 'paid');

/** How many children the paid plan includes — the fewest that can be chosen. */
export const childrenIncluded = (catalog: Catalog): number => paidPlan(catalog)?.facts.childrenIncluded ?? 1;

/** The most children the window lets one choose (the API refuses more; a bigger family writes). */
export const MAX_CHILDREN = 20;

/** What is chosen first: the visitor's region (or the page's language's), yearly, the children the plan includes. */
export function firstView(catalog: Catalog, lang: string): View | null {
  const region = catalog.region ?? regionOfLang(catalog, lang);
  return region ? { region, period: 'year', children: childrenIncluded(catalog) } : null;
}

const priceOf = (prices: CatalogPrice[], region: string, period: Period): CatalogPrice | undefined => prices.find((price) => price.region === region && price.period === period);

/** How much a year saves against twelve months, in whole per cent; null without both. */
function yearSaving(plan: CatalogPlan, region: string): number | null {
  const month = priceOf(plan.prices, region, 'month');
  const year = priceOf(plan.prices, region, 'year');
  return month && year ? Math.round((1 - year.amount / (month.amount * 12)) * 100) : null;
}

/** What the chosen plan costs for the chosen children and period: the plan and every child beyond those included. */
export function totalOf(catalog: Catalog, view: View): { amount: number; currency: string; extra: CatalogPrice | undefined } | null {
  const plan = paidPlan(catalog);
  const price = plan && priceOf(plan.prices, view.region, view.period);
  if (!plan || !price) return null;
  const extra = priceOf(plan.extraChild, view.region, view.period);
  const beyond = Math.max(0, view.children - childrenIncluded(catalog));
  return { amount: price.amount + (extra ? extra.amount * beyond : 0), currency: price.currency, extra };
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

/** «Family Pro · 3 дитини · 1 499 ₴ на рік» — what is being paid for, over the checkout. */
export function orderLine(catalog: Catalog, view: View, lang: string, words: Words): string {
  const plan = paidPlan(catalog);
  const total = totalOf(catalog, view);
  if (!plan || !total) return '';
  return [plan.name[lang] ?? plan.name.en ?? plan.id, counted(words, 'children', view.children, lang), `${formatPrice(total.amount, total.currency, lang)} ${say(words, view.period === 'year' ? 'perYear' : 'perMonth')}`].join(' · ');
}

function planCard(plan: CatalogPlan, catalog: Catalog, view: View, lang: string, words: Words, facts: Record<string, string>): string {
  const paid = plan.kind === 'paid';
  const currency = catalog.regions.find((region) => region.id === view.region)?.currency ?? 'USD';
  const lines: string[] = [`<article class="card plan${paid ? ' plan-pro' : ''}" data-plan="${esc(plan.id)}">`];
  const badge = plan.badge[lang];
  if (badge) lines.push(`<span class="plan-badge">${esc(badge)}</span>`);
  lines.push(`<h2>${esc(plan.name[lang] ?? plan.name.en ?? plan.id)}</h2>`);
  const tagline = plan.tagline[lang];
  if (tagline) lines.push(`<p class="plan-for">${esc(tagline)}</p>`);

  if (!paid) {
    lines.push(`<p class="price"><b>${esc(formatPrice(0, currency, lang))}</b> <span>${esc(say(words, 'forever'))}</span></p>`);
  } else {
    const total = totalOf(catalog, view);
    if (total) {
      lines.push(`<p class="price"><b>${esc(formatPrice(total.amount, total.currency, lang))}</b> <span>${esc(say(words, view.period === 'year' ? 'perYear' : 'perMonth'))}</span></p>`);
      const saving = yearSaving(plan, view.region);
      if (view.period === 'year') lines.push(`<p class="price-note">${esc(say(words, 'monthly', { price: formatPrice(Math.round(total.amount / 12), total.currency, lang) }))}${saving ? ` · ${esc(say(words, 'save', { percent: saving }))}` : ''}</p>`);
      // How many children: from those the plan includes up; every one beyond is a slot of its own.
      if (total.extra) {
        const least = childrenIncluded(catalog);
        lines.push(
          `<div class="children-pick"><span class="children-label">${esc(say(words, 'children'))}</span>`,
          `<div class="stepper"><button type="button" data-children="-1" aria-label="${esc(say(words, 'fewer'))}"${view.children <= least ? ' disabled' : ''}>−</button>`,
          `<output aria-live="polite">${view.children}</output>`,
          `<button type="button" data-children="1" aria-label="${esc(say(words, 'more'))}"${view.children >= MAX_CHILDREN ? ' disabled' : ''}>+</button></div></div>`,
          `<p class="price-extra">${esc(say(words, view.period === 'year' ? 'extraYear' : 'extraMonth', { price: formatPrice(total.extra.amount, total.extra.currency, lang), children: facts.children ?? String(least) }))}</p>`,
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

/**
 * The plans: the period, the two cards with the chosen region's prices and
 * the children chosen, and whose prices they are. Without a catalogue (Stripe
 * or the API out of reach) — a line saying the prices could not be loaded.
 */
export function renderPlans(catalog: Catalog | null, view: View | null, lang: string, words: Words): string {
  if (!catalog || !view || catalog.plans.length === 0) return `<p class="lead" data-plans-state>${esc(say(words, catalog === null ? 'loading' : 'unavailable'))}</p>`;
  const facts = factsOf(catalog, words, lang);
  const paid = paidPlan(catalog);
  const saving = paid ? yearSaving(paid, view.region) : null;
  const region = catalog.regions.find((r) => r.id === view.region);
  return [
    '<div class="pricing-controls">',
    `<div class="seg" role="group" aria-label="${esc(say(words, 'periodLabel'))}">`,
    ...PERIODS.map((period) => `<button type="button" data-period-pick="${period}" aria-pressed="${period === view.period}">${esc(say(words, period))}${period === 'year' && saving ? ` <span class="save">${esc(say(words, 'save', { percent: saving }))}</span>` : ''}</button>`),
    '</div>',
    region ? `<p class="region-note">${esc(say(words, 'regionNote', { region: regionName(region, lang, words) }))}</p>` : '',
    '</div>',
    `<div class="plans-grid">${catalog.plans.map((plan) => planCard(plan, catalog, view, lang, words, facts)).join('')}</div>`,
  ].join('');
}

/** The heading and lead of the plans: what both give and what the paid one adds. */
export function renderLead(catalog: Catalog | null, lang: string, words: Words): string {
  const facts = catalog ? factsOf(catalog, words, lang) : {};
  return facts.minutes && facts.free && facts.paid ? `<p class="lead">${esc(say(words, facts.days ? 'lead' : 'leadNoTrial', facts))}</p>` : '';
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
            priceSpecification: { '@type': 'UnitPriceSpecification', price: (price.amount / 100).toFixed(2), priceCurrency: price.currency, valueAddedTaxIncluded: true, referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: price.period === 'year' ? 'ANN' : 'MON' } },
          }));
    graph.push({ '@type': 'Product', '@id': `${site}/#plan-${plan.id}`, name: `Pulsar Kids ${name}`, description: plan.tagline[lang] ?? undefined, brand: { '@type': 'Brand', name: 'Pulsar Kids' }, offers });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}
