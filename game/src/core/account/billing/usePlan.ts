/**
 * The plan of the signed-in parent's account and the paywall's state — one
 * store, read by the paywall (`components/paywall`) and the cabinet's
 * «Підписка». The server decides what the account has (`GET /api/billing/me`);
 * the plans and prices are Stripe's (`GET /api/billing/plans`).
 */
import { create } from 'zustand';
import type { Catalog, View } from '@pulsar/plans';
import { billingApi, type PlanState } from '@/core/account/api/client';

/**
 * Why the paywall is open: it must be answered (no plan, a second sign-in), an
 * offer from a link, the one invitation to Family after a link made the free
 * plan theirs (`upsell`), or the parent asked.
 */
export type PaywallReason = 'mustChoose' | 'offer' | 'upsell' | 'upgrade';

export interface Paywall {
  reason: PaywallReason;
  step: 'plans' | 'checkout' | 'done' | 'gift';
  view: View | null;
  /** A promotion code the link brought. */
  promo?: string;
  /** What the parent reached for that their plan does not give — the offer says so above the plans. */
  perk?: Perk;
}

/** What the free plan (and no plan) does not give: the family's goals, setting the screen time, more than one child. */
export type Perk = 'goals' | 'time' | 'children';

/**
 * What the plan lets the parents do, as the server holds it (`SubscriptionService.allowanceOf`) — the cabinet
 * asks the same to offer the plans in place of a control. No plan chosen and the free plan are the same.
 */
export function useAllowance(): { restricted: boolean } {
  const state = usePlan((s) => s.state);
  return { restricted: state?.paidMode === true && (state.access === 'none' || state.access === 'free') };
}

interface PlanStore {
  state: PlanState | null;
  catalog: Catalog | null;
  paywall: Paywall | null;
  /** Ask the server anew what the account has (and the plans, once). */
  load: (token: string) => Promise<PlanState | null>;
  setState: (state: PlanState) => void;
  open: (paywall: Paywall) => void;
  update: (patch: Partial<Paywall>) => void;
  close: () => void;
}

export const usePlan = create<PlanStore>((set, get) => ({
  state: null,
  catalog: null,
  paywall: null,
  load: async (token) => {
    try {
      const [state, catalog] = await Promise.all([billingApi.me(token), get().catalog ? Promise.resolve(get().catalog) : billingApi.plans().catch(() => null)]);
      set({ state, catalog });
      return state;
    } catch {
      return null;
    }
  },
  setState: (state) => set({ state }),
  open: (paywall) => set({ paywall }),
  update: (patch) => set((s) => (s.paywall ? { paywall: { ...s.paywall, ...patch } } : {})),
  close: () => set({ paywall: null }),
}));
