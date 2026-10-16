/**
 * The page of prices (`build/pricing.ts`). The build drew the plans from
 * Stripe; here they are drawn again from the API — the visitor's region — and
 * can be chosen (period, children), and «Розпочати пригоду» opens the window
 * at the payment (`pricing/flow.ts`).
 *
 * The page exists only in the paid mode (`/admin/settings` → `features.paid` of
 * `GET /api/health`): while it is off, a visitor is sent to the main page. With
 * the API out of reach the page is shown — it is only prices.
 */
import { health } from './health.ts';
import { pricingFlow } from './pricing/flow.ts';

/** How long the page waits for the API before it shows itself anyway. */
const GATE_WAIT_MS = 4000;

const main = document.querySelector<HTMLElement>('main.pricing');

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

const plans = document.querySelector<HTMLElement>('[data-plans]');
if (plans) void pricingFlow().mountInline(plans, document.querySelector<HTMLElement>('[data-plans-lead]'));
