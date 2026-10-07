import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_GALAXY_ID } from '@/core/game/galaxies';
import type { Difficulty } from '@/core/game/kernel/types';

/**
 * Where the child is in the Hub: the galaxy they picked and the star filter.
 * Kept outside the page component (and in sessionStorage) so coming back from
 * a game — or reloading — lands in the same section, not back on the default.
 */
interface HubState {
  galaxyId: string;
  /** Show only games of this difficulty; null = all. */
  stars: Difficulty | null;
  setGalaxy: (id: string) => void;
  setStars: (stars: Difficulty | null) => void;
}

export const useHubState = create<HubState>()(
  persist(
    (set) => ({
      galaxyId: DEFAULT_GALAXY_ID,
      stars: null,
      setGalaxy: (galaxyId) => set({ galaxyId }),
      setStars: (stars) => set({ stars }),
    }),
    { name: 'wk-hub-v1', storage: createJSONStorage(() => sessionStorage) },
  ),
);
