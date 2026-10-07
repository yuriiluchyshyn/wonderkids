import { useGameStore } from '@/core/child/store/useGameStore';
import { balanceOf } from './world';

/**
 * The crystals the child HAS right now: everything earned minus everything
 * exchanged for the planet. This — not the lifetime total — is what every
 * counter and every family goal shows, so spending is a real choice: build
 * something new, or keep saving towards a goal.
 */
export function useBalance(): number {
  return useGameStore((s) => balanceOf(s.artifacts, s.treasures));
}
