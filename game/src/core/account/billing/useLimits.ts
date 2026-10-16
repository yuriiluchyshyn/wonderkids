/**
 * The plan's room for children as the server told it with the save
 * (`PlanLimits`): read by the child's game (to pause itself when there are more
 * children than the plan has room for, and to count time while the account is
 * open on the free plan). Set when the save is loaded.
 */
import { create } from 'zustand';
import type { PlanLimits } from '@/core/account/api/client';

interface LimitsStore {
  limits: PlanLimits | null;
  set: (limits: PlanLimits | null) => void;
}

export const useLimits = create<LimitsStore>((set) => ({
  limits: null,
  set: (limits) => set({ limits }),
}));
