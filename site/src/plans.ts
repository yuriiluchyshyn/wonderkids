/**
 * The page of prices, drawn from the plans as Stripe keeps them. The site
 * holds no plan, price or «what is included» of its own: the API reads them
 * from Stripe (`GET /api/billing/plans`, `backend/…/core/Catalog.java`) and this
 * turns its answer into the page — at build time (so a crawler reads the prices
 * in the HTML) and again in the browser (so an edit in Stripe shows without a
 * new build, and the visitor sees their own region).
 *
 * The page's own words — labels, questions, the units — are the site's
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
  /** The site's languages whose page shows this region first. */
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
  /** The visitor's region, by their country. */
  region: string | null;
  regions: CatalogRegion[];
  plans: CatalogPlan[];
}

/** The dictionary's section `pricing`, as it stands in the language's file. */
export type Words = Record<string, unknown>;

/** What is shown: whose prices and for which period. */
export interface View {
  region: string;
  period: Period;
}

/** Where the cards lead. */
export interface Links {
  parents: string;
  trial: string;
}

const esc = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A text of `words` by its dotted path, its `{holes}` filled. */
function say(words: Words, path: string, holes: Record<string, string | number> = {}): string {
  const found = path.split('.').reduce<unknown>((node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined), words);
  const text = typeof found === 'string' ? found : '';
  return text.replace(/\{(\w+)\}/g, (all, name: string) => (name in holes ? String(holes[name]) : all));
}

/** «15 хвилин», «2 dzieci» — a number with its unit, in the form the language asks for. */
function counted(words: Words, unit: string, count: number, lang: string): string {
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

const symbolOf = (currency: string, lang: string): string => formatPrice(0, currency, lang).replace(/[\d\s., ]/g, '');

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

/** The regions in the order a reader of `lang` wants them: theirs first, then the rest by name. */
function regionsFor(catalog: Catalog, lang: string, words: Words): CatalogRegion[] {
  const rank = (region: CatalogRegion): number => (region.langs.includes(lang) ? 0 : region.fallback ? 1 : 2);
  return [...catalog.regions].sort((a, b) => rank(a) - rank(b) || regionName(a, lang, words).localeCompare(regionName(b, lang, words), lang));
}

/** Whose prices a page in `lang` shows before it knows the visitor: its language's region, else the fallback. */
export function regionOfLang(catalog: Catalog, lang: string): string | null {
  return (catalog.regions.find((region) => region.langs.includes(lang)) ?? catalog.regions.find((region) => region.fallback) ?? catalog.regions[0])?.id ?? null;
}

const priceOf = (prices: CatalogPrice[], region: string, period: Period): CatalogPrice | undefined => prices.find((price) => price.region === region && price.period === period);

/** How much a year saves against twelve months, in whole per cent; null without both. */
function yearSaving(plan: CatalogPlan, region: string): number | null {
  const month = priceOf(plan.prices, region, 'month');
  const year = priceOf(plan.prices, region, 'year');
  return month && year ? Math.round((1 - year.amount / (month.amount * 12)) * 100) : null;
}

/** The facts the page's sentences speak of, each already with its unit: `{minutes}` → «15 хвилин». */
function factsOf(catalog: Catalog, words: Words, lang: string): Record<string, string> {
  const free = catalog.plans.find((plan) => plan.kind === 'free');
  const paid = catalog.plans.find((plan) => plan.kind === 'paid');
  const out: Record<string, string> = {};
  if (free) out.free = free.name[lang] ?? free.name.en ?? free.id;
  if (paid) out.paid = paid.name[lang] ?? paid.name.en ?? paid.id;
  if (free?.facts.dailyMinutes) out.minutes = counted(words, 'minutes', free.facts.dailyMinutes, lang);
  if (paid?.facts.trialDays) out.days = counted(words, 'days', paid.facts.trialDays, lang);
  if (paid?.facts.childrenIncluded) out.children = counted(words, 'children', paid.facts.childrenIncluded, lang);
  return out;
}

function planCard(plan: CatalogPlan, catalog: Catalog, view: View, lang: string, words: Words, facts: Record<string, string>, links: Links): string {
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
    const price = priceOf(plan.prices, view.region, view.period) ?? priceOf(plan.prices, view.region, view.period === 'year' ? 'month' : 'year');
    if (price) {
      lines.push(`<p class="price"><b>${esc(formatPrice(price.amount, price.currency, lang))}</b> <span>${esc(say(words, price.period === 'year' ? 'perYear' : 'perMonth'))}</span></p>`);
      const saving = yearSaving(plan, view.region);
      if (price.period === 'year') lines.push(`<p class="price-note">${esc(say(words, 'monthly', { price: formatPrice(Math.round(price.amount / 12), price.currency, lang) }))}${saving ? ` · ${esc(say(words, 'save', { percent: saving }))}` : ''}</p>`);
      const extra = priceOf(plan.extraChild, view.region, price.period);
      if (extra && facts.children) lines.push(`<p class="price-extra">${esc(say(words, price.period === 'year' ? 'extraYear' : 'extraMonth', { price: formatPrice(extra.amount, extra.currency, lang), children: facts.children }))}</p>`);
    }
  }

  const features = plan.features[lang] ?? plan.features.en ?? [];
  if (features.length > 0) lines.push(`<ul class="plan-features">${features.map((line) => `<li>${esc(line)}</li>`).join('')}</ul>`);
  if (paid && facts.days) lines.push(`<p class="plan-trial">${esc(say(words, 'trial', facts))}</p>`);
  lines.push(`<a class="btn ${paid ? 'btn-play' : 'btn-parent'}" data-portal="parents" href="${esc(links.parents)}/">${esc(say(words, paid ? 'ctaPaid' : 'ctaFree'))}</a>`);
  lines.push('</article>');
  return lines.join('');
}

/**
 * The page's `<main>`: the plans with the chosen region's prices, every
 * region's prices in a table, the questions about paying. Without a catalogue
 * (Stripe or the API out of reach) — a line saying the prices could not be loaded.
 */
export function renderPricing(catalog: Catalog | null, view: View | null, lang: string, words: Words, links: Links): string {
  const hero = (lead: string, controls: string): string =>
    `<div class="wrap pricing-hero"><h1><small class="eyebrow">${esc(say(words, 'eyebrow'))}</small> ${esc(say(words, 'title'))}</h1>${lead}${controls}</div>`;
  const final = `<section class="final"><div class="wrap band"><h2>${esc(say(words, 'final.title'))}</h2><p class="sub" style="margin-inline: auto">${esc(say(words, 'final.sub'))}</p><div class="cta"><a class="btn btn-try" data-portal="play" data-trial href="${esc(links.trial)}"><span class="emoji" aria-hidden="true">🚀</span> ${esc(say(words, 'final.cta'))}</a></div></div></section>`;

  if (!catalog || !view || catalog.plans.length === 0) return [hero(`<p class="lead" data-plans-state>${esc(say(words, catalog === null ? 'loading' : 'unavailable'))}</p>`, ''), final].join('\n');

  const facts = factsOf(catalog, words, lang);
  const paid = catalog.plans.find((plan) => plan.kind === 'paid');
  const regions = regionsFor(catalog, lang, words);
  const saving = paid ? yearSaving(paid, view.region) : null;

  const controls = [
    '<div class="pricing-controls">',
    `<div class="seg" role="group" aria-label="${esc(say(words, 'periodLabel'))}">`,
    ...PERIODS.map((period) => `<button type="button" data-period-pick="${period}" aria-pressed="${period === view.period}">${esc(say(words, period === 'year' ? 'year' : 'month'))}${period === 'year' && saving ? ` <span class="save">${esc(say(words, 'save', { percent: saving }))}</span>` : ''}</button>`),
    '</div>',
    `<label class="region-pick"><span>${esc(say(words, 'currencyLabel'))}</span><select data-region-pick>`,
    ...regions.map((region) => `<option value="${esc(region.id)}"${region.id === view.region ? ' selected' : ''}>${esc(regionName(region, lang, words))} · ${esc(symbolOf(region.currency, lang))} ${esc(region.currency)}</option>`),
    '</select></label>',
    '</div>',
  ].join('');

  const lead = facts.minutes && facts.free && facts.paid ? `<p class="lead">${esc(say(words, facts.days ? 'lead' : 'leadNoTrial', facts))}</p>` : '';
  const cards = `<section class="plans"><div class="wrap plans-grid">${catalog.plans.map((plan) => planCard(plan, catalog, view, lang, words, facts, links)).join('')}</div></section>`;

  const table = paid
    ? [
        '<section class="pricing-table"><div class="wrap">',
        `<h2>${esc(say(words, 'table.title'))}</h2>`,
        `<p class="sub">${esc(say(words, 'table.sub'))}</p>`,
        '<div class="table"><table>',
        `<thead><tr><th scope="col">${esc(say(words, 'table.region'))}</th><th scope="col">${esc(say(words, 'table.month'))}</th><th scope="col">${esc(say(words, 'table.year'))}</th><th scope="col">${esc(say(words, 'table.extraMonth'))}</th><th scope="col">${esc(say(words, 'table.extraYear'))}</th></tr></thead><tbody>`,
        ...regions.map((region) => {
          const cell = (prices: CatalogPrice[], period: Period, plus = ''): string => {
            const price = priceOf(prices, region.id, period);
            return `<td>${price ? `${plus}${esc(formatPrice(price.amount, price.currency, lang))}` : '—'}</td>`;
          };
          const yearly = priceOf(paid.prices, region.id, 'year');
          const save = yearSaving(paid, region.id);
          return `<tr data-row="${esc(region.id)}"${region.id === view.region ? ' class="here"' : ''}><th scope="row">${esc(regionName(region, lang, words))}</th>${cell(paid.prices, 'month')}<td>${yearly ? esc(formatPrice(yearly.amount, yearly.currency, lang)) : '—'}${save ? ` <small>${esc(say(words, 'save', { percent: save }))}</small>` : ''}</td>${cell(paid.extraChild, 'month', '+')}${cell(paid.extraChild, 'year', '+')}</tr>`;
        }),
        '</tbody></table></div></div></section>',
      ].join('')
    : '';

  const faq = `<section class="pricing-faq"><div class="wrap"><h2>${esc(say(words, 'faq.title'))}</h2><div class="grid">${questions(catalog, words, lang)
    .map((q) => `<article class="card"><h3>${esc(q.title)}</h3><p>${esc(q.text)}</p></article>`)
    .join('')}</div></div></section>`;

  return [hero(lead, controls), cards, table, faq, final].join('\n');
}

/** The questions of the page, in their order; each is `faq.<id>.title` / `.text`. */
const FAQ = ['limit', 'trial', 'cancel', 'progress', 'children', 'currency'] as const;

/** The questions about paying, with the catalogue's facts in them; one whose fact Stripe does not give is left out. */
export function questions(catalog: Catalog, words: Words, lang: string): { title: string; text: string }[] {
  const facts = factsOf(catalog, words, lang);
  const needs: Record<(typeof FAQ)[number], string[]> = { limit: ['minutes', 'free'], trial: ['days', 'paid', 'free'], cancel: ['paid', 'free'], progress: ['free'], children: ['children', 'paid'], currency: [] };
  return FAQ.filter((id) => needs[id].every((fact) => fact in facts)).map((id) => ({ title: say(words, `faq.${id}.title`, facts), text: say(words, `faq.${id}.text`, facts) }));
}

/** The structured data of the page: the page, each plan as a `Product` with an `Offer` per price, the questions. */
export function pricingLd(catalog: Catalog | null, lang: string, words: Words, url: string, site: string, title: string, description: string): string {
  const graph: unknown[] = [{ '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, description, inLanguage: lang, isPartOf: { '@id': `${site}/#website` } }];
  if (catalog && catalog.plans.length > 0) {
    for (const plan of catalog.plans) {
      const name = plan.name[lang] ?? plan.name.en ?? plan.id;
      const offers =
        plan.kind === 'free'
          ? catalog.regions.map((region) => ({ '@type': 'Offer', price: '0', priceCurrency: region.currency, url }))
          : plan.prices.map((price) => ({
              '@type': 'Offer',
              price: (price.amount / 100).toFixed(2),
              priceCurrency: price.currency,
              url,
              priceSpecification: { '@type': 'UnitPriceSpecification', price: (price.amount / 100).toFixed(2), priceCurrency: price.currency, referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: price.period === 'year' ? 'ANN' : 'MON' } },
            }));
      graph.push({ '@type': 'Product', '@id': `${site}/#plan-${plan.id}`, name: `Pulsar Kids ${name}`, description: plan.tagline[lang] ?? undefined, brand: { '@type': 'Brand', name: 'Pulsar Kids' }, offers });
    }
    graph.push({ '@type': 'FAQPage', mainEntity: questions(catalog, words, lang).map((q) => ({ '@type': 'Question', name: q.title, acceptedAnswer: { '@type': 'Answer', text: q.text } })) });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}
