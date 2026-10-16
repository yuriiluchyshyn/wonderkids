import type { Dict } from '@pulsar/i18n';
import { TRIAL_PATH, type PublicUrls } from '@pulsar/platform';
import { sitePath, type SiteLang } from '../src/languages.ts';
import { pricingLd, regionOfLang, renderPricing, type Catalog, type Words } from '../src/plans.ts';
import type { Dictionaries } from './pages.ts';

/**
 * The page of prices, `/pricing/` (and `/en/pricing/`, `/pl/pricing/`). The
 * plans, prices and «what is included» are Stripe's: the build asks the API
 * for them (`GET /api/billing/plans`) and draws them into the page with
 * `src/plans.ts`, so a crawler reads every price in the HTML; in the browser
 * `src/scripts/pricing.ts` asks again and draws the visitor's region — an
 * edit in Stripe shows without a new build. When the build cannot reach the
 * API the page is built without prices and the browser fills them in.
 *
 * Whether the page is offered at all is the owner's switch (`/admin/settings`,
 * read from `GET /api/health`): off, the script sends a visitor to the main page.
 */
export const PRICING_SLUG = 'pricing/';

/** The address the plans are asked at. */
export const plansUrl = (urls: PublicUrls): string => `${urls.api}/api/billing/plans`;

/** How long the build waits for the API before it builds the page without prices. */
const FETCH_WAIT_MS = 8000;

/** The plans as the API has them now, or null — the build goes on without them. */
export async function fetchCatalog(urls: PublicUrls): Promise<Catalog | null> {
  try {
    const response = await fetch(plansUrl(urls), { signal: AbortSignal.timeout(FETCH_WAIT_MS) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as Catalog;
  } catch (err) {
    console.warn(`[pricing] the plans were not read from ${plansUrl(urls)} (${(err as Error).message}): the page is built without prices, the browser fills them in`);
    return null;
  }
}

export interface PricingPage {
  title: string;
  description: string;
  /** The page's `<main>`, ready HTML. */
  body: string;
  /** The structured data. */
  ld: string;
  /** The dictionary's `pricing` section, for the page's script. */
  words: string;
}

export function pricingPage(lang: SiteLang, urls: PublicUrls, dictionaries: Dictionaries, catalog: Catalog | null): PricingPage {
  const words = dictionaries[lang].pricing as Words;
  const meta = dictionaries[lang].pricingMeta as Dict;
  const title = String(meta.title);
  const description = String(meta.description);
  const region = catalog ? regionOfLang(catalog, lang) : null;
  const links = { parents: urls.parents, trial: urls.play + TRIAL_PATH };
  const body = renderPricing(catalog, region ? { region, period: 'year' } : null, lang, words, links);
  const url = `${urls.site}/${sitePath(lang)}${PRICING_SLUG}`;
  return { title, description, body, ld: pricingLd(catalog, lang, words, url, urls.site, title, description), words: JSON.stringify(words).replace(/</g, '\\u003c') };
}
