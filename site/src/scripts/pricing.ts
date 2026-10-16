/**
 * The page of prices (`build/pricing.ts`). The plans are Stripe's: this asks
 * the API for them (`GET /api/billing/plans`) and draws them again with
 * `../plans.ts` — the visitor's region (by their country, as the API saw it)
 * until they pick another, for the period picked. What the build drew stays
 * when the API cannot be reached.
 *
 * The page exists only in the paid mode (`/admin/settings` → `features.paid` of
 * `GET /api/health`): while it is off, a visitor is sent to the main page. With
 * the API out of reach the page is shown — it is only prices.
 */
import { regionOfLang, renderPricing, type Catalog, type Period, type View, type Words } from '../plans.ts';
import { apiAddress, health } from './health.ts';
import { wirePortalLinks } from './portals.ts';

/** How long the page waits for the API before it shows itself anyway. */
const GATE_WAIT_MS = 4000;

const main = document.querySelector<HTMLElement>('main.pricing');
const lang = document.documentElement.lang;
const words = JSON.parse(document.getElementById('pricing-words')?.textContent ?? '{}') as Words;
const links = { parents: main?.dataset.parents ?? '', trial: main?.dataset.trial ?? '' };

let catalog: Catalog | null = null;
// What the build drew: its region, until the plans come.
const built = main?.querySelector<HTMLSelectElement>('[data-region-pick]');
let view: View | null = built ? { region: built.value, period: 'year' } : null;
let picked = false;

function draw(): void {
  if (!main || !catalog || !view) return;
  main.innerHTML = renderPricing(catalog, view, lang, words, links);
  // The new links into the game learn where the game is and where the visitor came from.
  wirePortalLinks();
}

// One listener for whatever the page draws.
main?.addEventListener('change', (e) => {
  const select = (e.target as HTMLElement).closest<HTMLSelectElement>('[data-region-pick]');
  if (!select || !view) return;
  view = { ...view, region: select.value };
  picked = true;
  draw();
});
main?.addEventListener('click', (e) => {
  const button = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-period-pick]');
  if (!button || !view) return;
  view = { ...view, period: button.dataset.periodPick as Period };
  draw();
});

async function loadPlans(): Promise<void> {
  const api = main?.dataset.plansApi ? apiAddress(main.dataset.plansApi) : null;
  if (!api) return;
  try {
    const response = await fetch(api);
    if (!response.ok) throw new Error(String(response.status));
    catalog = (await response.json()) as Catalog;
  } catch {
    // What the build drew stays; with nothing drawn, say the prices did not load.
    const state = main?.querySelector('[data-plans-state]');
    if (state) state.textContent = String(words.unavailable ?? '');
    return;
  }
  // The visitor's own region, unless they picked one while the plans were on their way.
  const region = (picked && view?.region) || catalog.region || regionOfLang(catalog, lang);
  view = region ? { region, period: view?.period ?? 'year' } : null;
  draw();
}

const reveal = (): void => document.documentElement.removeAttribute('data-gate');
const waited = window.setTimeout(reveal, GATE_WAIT_MS);

void health().then((answer) => {
  window.clearTimeout(waited);
  if (answer?.features?.paid === false) {
    window.location.replace(main?.dataset.homeUrl ?? '/');
    return;
  }
  reveal();
});

void loadPlans();
