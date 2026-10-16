/**
 * The window of prices. Every page opens it from its «Ціни» links
 * (`src/scripts/pricing-links.ts`); the page of prices also draws the plans in
 * itself. It shows the two plans with the visitor's region's prices (Stripe's,
 * by `GET /api/billing/plans`), the period and how many children.
 *
 * Paying is not done here: «Розпочати пригоду» leads to the parents' sign-in
 * with the choice in the link (`queryOfOffer` of `@pulsar/platform` — and a
 * promotion code the visitor came with, `?offer=…`). Once signed in, the game's
 * paywall opens at the payment of that plan (`game/src/components/paywall`).
 */
import { OFFER_PARAMS, queryOfOffer } from '@pulsar/platform';
import { firstView, MAX_CHILDREN, childrenIncluded, paidPlan, renderGrid, renderPlans, say, type Catalog, type Period, type View, type Words } from '../../plans.ts';
import { apiAddress } from '../health.ts';

const esc = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** An address of the API, from the one every page is built with (`data-visits-api` → `/api/health`). */
function api(path: string): string | null {
  const built = document.body.dataset.visitsApi;
  return built ? apiAddress(new URL(path, built).href) : null;
}

class PricingFlow {
  private readonly lang = document.documentElement.lang;
  private readonly words = JSON.parse(document.getElementById('pricing-words')?.textContent ?? '{}') as Words;
  private catalog: Catalog | null = null;
  private view: View | null = null;
  private loading: Promise<void> | null = null;
  private dialog: HTMLDialogElement | null = null;
  private inline: HTMLElement | null = null;

  /** The plans from the API, once per page. */
  load(): Promise<void> {
    this.loading ??= (async () => {
      const url = api('/api/billing/plans');
      if (!url) return;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(String(response.status));
        this.catalog = (await response.json()) as Catalog;
        this.view = firstView(this.catalog, this.lang);
      } catch {
        this.catalog = { country: null, region: null, regions: [], plans: [] };
      }
    })();
    return this.loading;
  }

  /** Draw the plans into a part of the page too (the page of prices); the window then opens at the payment. */
  async mountInline(container: HTMLElement): Promise<void> {
    this.inline = container;
    this.listen(container);
    await this.load();
    container.innerHTML = renderPlans(this.catalog, this.view, this.lang, this.words);
  }

  /** Open the window at the plans. */
  async open(): Promise<void> {
    this.show();
    await this.load();
    this.render();
  }

  // ---- the window ----------------------------------------------------------

  private ensureDialog(): HTMLDialogElement {
    if (this.dialog) return this.dialog;
    const dialog = document.createElement('dialog');
    dialog.className = 'pricing-modal';
    dialog.setAttribute('aria-labelledby', 'pricing-modal-title');
    dialog.innerHTML = `<div class="pricing-modal-head"><h2 id="pricing-modal-title">${esc(say(this.words, 'modalTitle'))}</h2><button type="button" class="letter-close" data-close aria-label="${esc(say(this.words, 'close'))}">✕</button></div><div class="pricing-modal-body"></div>`;
    document.body.appendChild(dialog);
    dialog.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('[data-close]')) this.close();
    });
    // A tap on the dimmed page around the window lands on the dialog itself.
    dialog.addEventListener('mousedown', (e) => {
      if (e.target === dialog) this.close();
    });
    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      this.close();
    });
    this.listen(dialog);
    this.dialog = dialog;
    return dialog;
  }

  private show(): void {
    const dialog = this.ensureDialog();
    if (!dialog.open) {
      dialog.classList.remove('closing');
      dialog.showModal();
      document.documentElement.classList.add('letter-on');
    }
    this.render();
  }

  /** Fade the window out, then close it. */
  private close(): void {
    const dialog = this.dialog;
    if (!dialog?.open) return;
    const finish = (): void => {
      dialog.classList.remove('closing');
      dialog.close();
      document.documentElement.classList.remove('letter-on');
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return finish();
    dialog.classList.add('closing');
    dialog.addEventListener('animationend', finish, { once: true });
  }

  private body(): HTMLElement | null {
    return this.dialog?.querySelector<HTMLElement>('.pricing-modal-body') ?? null;
  }

  private render(): void {
    const body = this.body();
    if (!body) return;
    body.innerHTML = renderPlans(this.catalog, this.view, this.lang, this.words);
    body.scrollTo?.({ top: 0 });
  }

  /**
   * Both places that show the plans, after a choice changed: the switch of the
   * period stays (its pill slides), the cards are drawn anew and what changed
   * on them fades in.
   */
  private redraw(): void {
    const { catalog, view } = this;
    if (!catalog || !view) return;
    const places = [this.inline, this.dialog?.open ? this.body() : null];
    for (const place of places) {
      if (!place) continue;
      const seg = place.querySelector<HTMLElement>('.seg');
      if (seg) {
        seg.dataset.period = view.period;
        seg.querySelectorAll<HTMLElement>('[data-period-pick]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.periodPick === view.period)));
      }
      const grid = place.querySelector<HTMLElement>('[data-grid]');
      if (grid) grid.innerHTML = renderGrid(catalog, view, this.lang, this.words, true);
    }
  }

  // ---- choices ---------------------------------------------------------------

  private listen(root: HTMLElement): void {
    root.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const period = target.closest<HTMLElement>('[data-period-pick]');
      const children = target.closest<HTMLElement>('[data-children]');
      if (period && this.view) {
        this.view = { ...this.view, period: period.dataset.periodPick as Period };
        this.redraw();
      } else if (children && this.view && this.catalog) {
        const next = this.view.children + Number(children.dataset.children);
        this.view = { ...this.view, children: Math.min(MAX_CHILDREN, Math.max(childrenIncluded(this.catalog), next)) };
        this.redraw();
      } else if (target.closest('[data-start]')) {
        this.start();
      }
    });
  }

  // ---- on to the sign-in ----------------------------------------------------

  /**
   * «Розпочати пригоду»: to the parents' sign-in with the choice — the plan, the
   * period, the children, and the promotion code the visitor came with. The
   * parents' link of the page already knows where the portal is and carries the
   * visitor's source (`portals.ts`).
   */
  private start(): void {
    const { catalog, view } = this;
    const plan = catalog && paidPlan(catalog);
    if (!plan || !view) return;
    const portal = document.querySelector<HTMLAnchorElement>('a[data-portal="parents"]')?.href;
    if (!portal) return;
    const url = new URL(portal);
    url.pathname = '/parent-login';
    const promo = new URLSearchParams(window.location.search).get(OFFER_PARAMS.promo) ?? undefined;
    for (const [name, value] of new URLSearchParams(queryOfOffer({ plan: 'paid', period: view.period, children: view.children, promo }))) url.searchParams.set(name, value);
    window.location.assign(url.href);
  }
}

let one: PricingFlow | null = null;

/** The page's one window of prices. */
export const pricingFlow = (): PricingFlow => (one ??= new PricingFlow());
