/**
 * An offer in a link (billing spec §1.1, §4.3): which plan a parent chose on
 * the public site — or in a link the owner hands out — and a promotion code.
 * The link leads to the parents' sign-in; the game keeps the offer past the trip
 * to Auth0 and, once the parent is in, its paywall opens at the payment of that
 * plan (or makes the free plan theirs). Both sides write and read the same
 * names, so they are said once, here:
 *
 *   parents.…/parent-login?plan=family&period=year&children=3&offer=SUMMER30
 *
 *   plan      family | basic          (a paid plan's or the free plan's kind; the plan's Stripe id works too)
 *   period    year | month            (default: year)
 *   children  2, 3, …                 (default: those the plan includes)
 *   offer     a Stripe promotion code (a coupon 100 % off for ever makes Family a gift — no payment)
 */
export const OFFER_PARAMS = { plan: 'plan', period: 'period', children: 'children', promo: 'offer' } as const;

/** What a link may name as a plan: the paid one, or the free one. */
export const OFFER_PLANS = { paid: ['family', 'paid'], free: ['basic', 'free'] } as const;

export interface Offer {
  /** `paid` — the paid plan (or the one whose Stripe id is `planId`); `free` — the free one; null — no plan named. */
  plan: 'paid' | 'free' | null;
  /** The Stripe id of the plan, when the link named one by its id. */
  planId?: string;
  period?: 'year' | 'month';
  children?: number;
  promo?: string;
}

const PLAN_ID = /^[a-z][a-z0-9_]{1,60}$/i;
const PROMO = /^[A-Za-z0-9_-]{2,64}$/;

/** The offer a query string carries, or null when it carries none. */
export function offerOfQuery(search: string): Offer | null {
  const query = new URLSearchParams(search);
  const rawPlan = (query.get(OFFER_PARAMS.plan) ?? '').trim().toLowerCase();
  const promo = (query.get(OFFER_PARAMS.promo) ?? '').trim();
  if (!rawPlan && !promo) return null;
  const offer: Offer = { plan: null };
  if ((OFFER_PLANS.paid as readonly string[]).includes(rawPlan)) offer.plan = 'paid';
  else if ((OFFER_PLANS.free as readonly string[]).includes(rawPlan)) offer.plan = 'free';
  else if (PLAN_ID.test(rawPlan)) {
    offer.plan = 'paid';
    offer.planId = rawPlan;
  }
  const period = query.get(OFFER_PARAMS.period);
  if (period === 'year' || period === 'month') offer.period = period;
  const children = Number(query.get(OFFER_PARAMS.children));
  if (Number.isInteger(children) && children > 0 && children <= 20) offer.children = children;
  if (PROMO.test(promo)) offer.promo = promo;
  // A code alone is an offer of the paid plan.
  if (offer.plan === null && offer.promo) offer.plan = 'paid';
  return offer.plan === null && !offer.promo ? null : offer;
}

/** The query string of an offer: `plan=family&period=year&children=3`. */
export function queryOfOffer(offer: Offer): string {
  const query = new URLSearchParams();
  if (offer.plan) query.set(OFFER_PARAMS.plan, offer.planId ?? (offer.plan === 'paid' ? OFFER_PLANS.paid[0] : OFFER_PLANS.free[0]));
  if (offer.period) query.set(OFFER_PARAMS.period, offer.period);
  if (offer.children) query.set(OFFER_PARAMS.children, String(offer.children));
  if (offer.promo) query.set(OFFER_PARAMS.promo, offer.promo);
  return query.toString();
}
