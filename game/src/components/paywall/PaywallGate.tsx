import { useEffect, useRef } from 'react';
import { childrenIncluded, firstView, paidPlan, type View } from '@pulsar/plans';
import { billingApi } from '@/core/account/api/client';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import { usePlan } from '@/core/account/billing/usePlan';
import { dropOffer, pendingOffer } from '@/core/app/offer';
import { useLang } from '@/core/translator';
import { Paywall } from './Paywall';

/**
 * When the paywall opens by itself, on the parents' portal once the parent is
 * signed in (billing spec §3, the owner's rules of 2026-10-16):
 *
 *  - a link offered a plan (the site's «Розпочати пригоду», an owner's link —
 *    `core/app/offer.ts`): the paid plan → straight to its payment, with the
 *    children and period of the link and its promotion code; the free plan →
 *    it is made theirs, and a parent who had no plan yet (a new account) is
 *    invited once to Family — the plans, which close with ✕. Once the free
 *    plan is theirs the account is no longer `none`, so it never comes again;
 *  - no plan chosen, and not the first sign-in (`mustChoose` from the server):
 *    the plans, which cannot be closed until one is chosen;
 *  - Stripe brought the parent back from a payment that had to leave the page
 *    (`?checkout=cs_…`): «done».
 *
 * Nothing at all while the paid mode is off.
 */
export function PaywallGate() {
  const token = useAuthStore((s) => s.token);
  const childId = useAuthStore((s) => s.childId);
  const lang = useLang();
  const { load, open, setState } = usePlan();
  const asked = useRef(false);

  useEffect(() => {
    if (!token || childId || asked.current) return;
    asked.current = true;
    void (async () => {
      const state = await load(token);
      if (!state?.paidMode) {
        // No paying while the owner keeps the paid mode off: an offer a link brought is not kept for later.
        dropOffer();
        return;
      }
      const { catalog } = usePlan.getState();

      const back = new URLSearchParams(window.location.search).get('checkout');
      if (back) {
        window.history.replaceState(null, '', window.location.pathname);
        open({ reason: 'upgrade', step: 'done', view: null });
        return;
      }

      const offer = pendingOffer();
      if (offer) {
        dropOffer();
        if (offer.plan === 'free') {
          if (state.access !== 'none') return;
          setState(await billingApi.chooseFree(token));
          if (catalog && paidPlan(catalog)) open({ reason: 'upsell', step: 'plans', view: null });
          return;
        }
        if (catalog && (state.access === 'none' || state.access === 'free')) {
          const first = firstView(catalog, lang);
          const least = childrenIncluded(catalog);
          const view: View | null = first && paidPlan(catalog) ? { ...first, period: offer.period ?? first.period, children: Math.max(least, offer.children ?? least) } : null;
          open({ reason: 'offer', step: 'checkout', view, promo: offer.promo });
          return;
        }
      }

      if (state.mustChoose) open({ reason: 'mustChoose', step: 'plans', view: null });
    })();
  }, [token, childId, lang, load, open, setState]);

  // The owner may switch the paid mode while the cabinet is open: asked again whenever the page comes back into sight.
  useEffect(() => {
    if (!token || childId) return;
    const recheck = () => {
      if (document.visibilityState !== 'visible') return;
      void load(token).then((state) => {
        if (state && !state.paidMode) usePlan.getState().close();
      });
    };
    document.addEventListener('visibilitychange', recheck);
    return () => document.removeEventListener('visibilitychange', recheck);
  }, [token, childId, load]);

  return <Paywall />;
}
