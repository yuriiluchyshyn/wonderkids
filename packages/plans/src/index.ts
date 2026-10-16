/**
 * The plans of Pulsar Kids as the API reads them from Stripe
 * (`GET /api/billing/plans`, `backend/…/core/Catalog.java`), and what both
 * front ends make of them — the site's window of prices and the game's
 * paywall: whose prices a visitor pays, what a choice of period and children
 * costs, what a year saves. Stripe is the one place plans are written; nothing
 * here holds a price, a name or a number of a plan.
 *
 * No words and no markup: each project says it in its own dictionary.
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
  /** False where the tax is added on top (the US: sales tax by state); the price is final everywhere else. */
  taxIncluded?: boolean;
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

/** What is chosen: whose prices, the period, and how many children. */
export interface View {
  region: string;
  period: Period;
  children: number;
}

/** The most children one may choose (the API refuses more; a bigger family writes). */
export const MAX_CHILDREN = 20;

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

/** Whose prices a page in `lang` shows before it knows the visitor: its language's region, else the fallback. */
export function regionOfLang(catalog: Catalog, lang: string): string | null {
  return (catalog.regions.find((region) => region.langs.includes(lang)) ?? catalog.regions.find((region) => region.fallback) ?? catalog.regions[0])?.id ?? null;
}

/** The paid plan. */
export const paidPlan = (catalog: Catalog): CatalogPlan | undefined => catalog.plans.find((plan) => plan.kind === 'paid');

/** The free plan. */
export const freePlan = (catalog: Catalog): CatalogPlan | undefined => catalog.plans.find((plan) => plan.kind === 'free');

/** How many children the paid plan includes — the fewest that can be chosen. */
export const childrenIncluded = (catalog: Catalog): number => paidPlan(catalog)?.facts.childrenIncluded ?? 1;

/** A plan's name in a language (English, else its id, when the language has none). */
export const planName = (plan: CatalogPlan, lang: string): string => plan.name[lang] ?? plan.name.en ?? plan.id;

/** What is chosen first: the visitor's region (or the page's language's), yearly, the children the plan includes. */
export function firstView(catalog: Catalog, lang: string): View | null {
  const region = catalog.region ?? regionOfLang(catalog, lang);
  return region ? { region, period: 'year', children: childrenIncluded(catalog) } : null;
}

export const priceOf = (prices: CatalogPrice[], region: string, period: Period): CatalogPrice | undefined => prices.find((price) => price.region === region && price.period === period);

/** How much a year saves against twelve months of the plan, in whole per cent; null without both. */
export function yearSaving(plan: CatalogPlan, region: string): number | null {
  const month = priceOf(plan.prices, region, 'month');
  const year = priceOf(plan.prices, region, 'year');
  return month && year ? Math.round((1 - year.amount / (month.amount * 12)) * 100) : null;
}

/** What the paid plan costs for the chosen children and period: the plan and every child beyond those included. */
export function totalOf(catalog: Catalog, view: View): { amount: number; currency: string; taxIncluded: boolean; extra: CatalogPrice | undefined } | null {
  const plan = paidPlan(catalog);
  const price = plan && priceOf(plan.prices, view.region, view.period);
  if (!plan || !price) return null;
  const extra = priceOf(plan.extraChild, view.region, view.period);
  const beyond = Math.max(0, view.children - childrenIncluded(catalog));
  return { amount: price.amount + (extra ? extra.amount * beyond : 0), currency: price.currency, taxIncluded: price.taxIncluded !== false, extra };
}

/**
 * The plan's own price for the period, with the children it includes — the children beyond them are NOT in it: they are
 * said apart (`extraOf`). This is the price a card shows big.
 */
export function baseOf(catalog: Catalog, view: View): ReturnType<typeof totalOf> {
  return totalOf(catalog, { ...view, children: childrenIncluded(catalog) });
}

/** What the children beyond those included cost for the chosen period, apart from the plan; null when there are none. */
export function extraOf(catalog: Catalog, view: View): { count: number; amount: number; currency: string } | null {
  const total = totalOf(catalog, view);
  const count = Math.max(0, view.children - childrenIncluded(catalog));
  return total?.extra && count > 0 ? { count, amount: total.extra.amount * count, currency: total.extra.currency } : null;
}

/** A year against twelve months of the same choice: the twelve, and what the year saves in per cent (0 — nothing). */
export function yearAgainstMonths(catalog: Catalog, view: View): { full: number; saving: number } | null {
  const year = totalOf(catalog, { ...view, period: 'year' });
  const month = totalOf(catalog, { ...view, period: 'month' });
  if (!year || !month) return null;
  const full = month.amount * 12;
  return { full, saving: full > year.amount ? Math.round((1 - year.amount / full) * 100) : 0 };
}
