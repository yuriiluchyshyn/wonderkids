/**
 * The window of prices and of paying for a plan. Every page opens it from its
 * «Ціни» links (`src/scripts/pricing-links.ts`); the page of prices also draws
 * the plans in itself and opens the window at the payment.
 *
 *   plans     the two plans with the visitor's region's prices (Stripe's, by
 *             `GET /api/billing/plans`), the period and how many children
 *   checkout  Stripe's embedded Checkout for the chosen plan: the summary of
 *             the invoice, the trial, the billing address, tax where it is due,
 *             the card — Stripe.js is loaded from js.stripe.com only now
 *   done      the subscription has begun: where to sign in
 *
 * Nothing about money is decided here: the page names a plan, a period and a
 * number of children; the API finds the prices (`POST /api/billing/checkout`).
 */
import type { StripeEmbeddedCheckout } from '@stripe/stripe-js';
import { firstView, MAX_CHILDREN, childrenIncluded, orderLine, paidPlan, renderLead, renderPlans, say, type Catalog, type Period, type View, type Words } from '../../plans.ts';
import { apiAddress } from '../health.ts';
import { wirePortalLinks } from '../portals.ts';

type Step = 'plans' | 'checkout' | 'done';

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
  private step: Step = 'plans';
  private inline: HTMLElement | null = null;
  private embedded: StripeEmbeddedCheckout | null = null;

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
  async mountInline(container: HTMLElement, lead?: HTMLElement | null): Promise<void> {
    this.inline = container;
    this.listen(container);
    await this.load();
    if (lead) lead.innerHTML = renderLead(this.catalog, this.lang, this.words);
    this.redraw();
  }

  /** Open the window at the plans. */
  async open(): Promise<void> {
    this.show('plans');
    await this.load();
    if (this.step === 'plans') this.render();
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
      if ((e.target as HTMLElement).closest('[data-back]')) this.show('plans');
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

  private show(step: Step): void {
    const dialog = this.ensureDialog();
    if (step !== 'checkout') this.dropCheckout();
    this.step = step;
    if (!dialog.open) {
      dialog.classList.remove('closing');
      dialog.showModal();
      document.documentElement.classList.add('letter-on');
    }
    this.render();
  }

  /** Fade the window out, then close it; a payment begun is let go. */
  private close(): void {
    const dialog = this.dialog;
    if (!dialog?.open) return;
    this.dropCheckout();
    const finish = (): void => {
      dialog.classList.remove('closing');
      dialog.close();
      document.documentElement.classList.remove('letter-on');
      this.step = 'plans';
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
    if (this.step === 'plans') body.innerHTML = `${renderLead(this.catalog, this.lang, this.words)}${renderPlans(this.catalog, this.view, this.lang, this.words)}`;
    body.closest('dialog')?.scrollTo?.({ top: 0 });
  }

  /** Both places that show the plans, after a choice changed. */
  private redraw(): void {
    if (this.inline) this.inline.innerHTML = renderPlans(this.catalog, this.view, this.lang, this.words);
    if (this.dialog?.open && this.step === 'plans') this.render();
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
        void this.checkout();
      }
    });
  }

  // ---- paying ----------------------------------------------------------------

  private dropCheckout(): void {
    this.embedded?.destroy();
    this.embedded = null;
  }

  private async checkout(): Promise<void> {
    const catalog = this.catalog;
    const view = this.view;
    const plan = catalog && paidPlan(catalog);
    if (!catalog || !view || !plan) return;
    this.show('checkout');
    const body = this.body();
    if (!body) return;
    body.innerHTML = [
      `<div class="checkout-head"><button type="button" class="btn btn-parent btn-small" data-back>${esc(say(this.words, 'back'))}</button><p class="checkout-order">${esc(orderLine(catalog, view, this.lang, this.words))}</p></div>`,
      `<p class="checkout-note">🔒 ${esc(say(this.words, 'secure'))}</p>`,
      '<p class="checkout-note checkout-test" hidden></p>',
      `<div class="checkout-mount"><p class="checkout-wait">${esc(say(this.words, 'checkoutLoading'))}</p></div>`,
    ].join('');
    const mount = body.querySelector<HTMLElement>('.checkout-mount');
    const url = api('/api/billing/checkout');
    try {
      if (!url || !mount) throw new Error('no api');
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.id, period: view.period, children: view.children, region: view.region, lang: this.lang }),
      });
      if (!response.ok) throw new Error(String(response.status));
      const started = (await response.json()) as { sessionId: string; clientSecret: string; publishableKey: string };
      // The window may have been closed, or turned back to the plans, while the session was being made.
      if (this.step !== 'checkout') return;
      if (started.publishableKey.startsWith('pk_test_')) {
        const test = body.querySelector<HTMLElement>('.checkout-test');
        if (test) {
          test.textContent = `🧪 ${say(this.words, 'testMode')}`;
          test.hidden = false;
        }
      }
      // Stripe.js comes from js.stripe.com, as PCI asks — and only now, when a parent has chosen to pay.
      const { loadStripe } = await import('@stripe/stripe-js/pure');
      const stripe = await loadStripe(started.publishableKey);
      if (!stripe || this.step !== 'checkout') return;
      this.dropCheckout();
      this.embedded = await stripe.createEmbeddedCheckoutPage({ clientSecret: started.clientSecret, onComplete: () => void this.done(started.sessionId) });
      mount.innerHTML = '';
      this.embedded.mount(mount);
    } catch {
      if (mount && this.step === 'checkout') mount.innerHTML = `<p class="checkout-wait">${esc(say(this.words, 'checkoutError'))}</p>`;
    }
  }

  private async done(sessionId: string): Promise<void> {
    let email: string | null = null;
    const url = api(`/api/billing/checkout?session=${encodeURIComponent(sessionId)}`);
    try {
      if (url) email = ((await (await fetch(url)).json()) as { email?: string | null }).email ?? null;
    } catch {
      /* the confirmation is in the mailbox either way */
    }
    this.show('done');
    const body = this.body();
    if (!body) return;
    const parents = document.querySelector<HTMLAnchorElement>('a[data-portal="parents"]')?.href ?? '/';
    body.innerHTML = [
      '<div class="checkout-done">',
      `<h3>${esc(say(this.words, 'doneTitle'))}</h3>`,
      `<p>${esc(email ? say(this.words, 'doneText', { email }) : say(this.words, 'doneTextNoEmail'))}</p>`,
      `<a class="btn btn-play" data-portal="parents" href="${esc(parents)}">${esc(say(this.words, 'doneCta'))}</a>`,
      '</div>',
    ].join('');
    wirePortalLinks();
  }
}

let one: PricingFlow | null = null;

/** The page's one window of prices. */
export const pricingFlow = (): PricingFlow => (one ??= new PricingFlow());
