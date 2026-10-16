import type { Dict } from '@pulsar/i18n';
import { TRIAL_PATH, type PublicUrls } from '@pulsar/platform';
import { sitePath, type SiteLang } from '../src/languages.ts';
import { firstView, pricingLd, renderPlans, say, type Catalog, type Words } from '../src/plans.ts';
import type { Dictionaries } from './pages.ts';

/**
 * The page of prices, `/pricing/` (and `/en/pricing/`, `/pl/pricing/`). The
 * plans, prices and «what is included» are Stripe's: the build asks the API
 * for them (`GET /api/billing/plans`) and draws them into the page with
 * `src/plans.ts`, so a crawler reads every price of the language's region in
 * the HTML (and every region's in the JSON-LD); in the browser
 * `src/scripts/pricing.ts` asks again and draws the visitor's region — an
 * edit in Stripe shows without a new build — and «Розпочати пригоду» opens
 * the window of paying (`src/scripts/pricing/flow.ts`). When the build cannot reach the
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
}

export function pricingPage(lang: SiteLang, urls: PublicUrls, dictionaries: Dictionaries, catalog: Catalog | null): PricingPage {
  const words = dictionaries[lang].pricing as Words;
  const meta = dictionaries[lang].pricingMeta as Dict;
  const title = String(meta.title);
  const description = String(meta.description);
  // The build asks from a server, whose country is nobody's: the page shows its language's region until the browser knows the visitor's.
  const esc = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const body = [
    `<div class="wrap pricing-hero"><h1><small class="eyebrow">${esc(say(words, 'eyebrow'))}</small> ${esc(say(words, 'title'))}</h1></div>`,
    `<section class="plans"><div class="wrap" data-plans>${renderPlans(catalog, catalog ? firstView({ ...catalog, region: null }, lang) : null, lang, words)}</div></section>`,
    `<section class="final"><div class="wrap band"><h2>${esc(say(words, 'final.title'))}</h2><p class="sub" style="margin-inline: auto">${esc(say(words, 'final.sub'))}</p><div class="cta"><a class="btn btn-try" data-portal="play" data-trial href="${esc(urls.play + TRIAL_PATH)}"><span class="emoji" aria-hidden="true">🚀</span> ${esc(say(words, 'final.cta'))}</a></div></div></section>`,
  ].join('\n');
  const url = `${urls.site}/${sitePath(lang)}${PRICING_SLUG}`;
  return { title, description, body, ld: pricingLd(catalog, lang, url, urls.site, title, description) };
}
