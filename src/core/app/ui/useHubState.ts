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
  /** The set of games chosen in a galaxy that has several (a language): galaxy id → group id. */
  groups: Record<string, string>;
  setGalaxy: (id: string) => void;
  setGroup: (galaxyId: string, groupId: string | null) => void;
  setStars: (stars: Difficulty | null) => void;
}

export const useHubState = create<HubState>()(
  persist(
    (set) => ({
      galaxyId: DEFAULT_GALAXY_ID,
      stars: null,
      groups: {},
      setGalaxy: (galaxyId) => set({ galaxyId }),
      setStars: (stars) => set({ stars }),
      setGroup: (galaxyId, groupId) =>
        set((s) => {
          const groups = { ...s.groups };
          if (groupId) groups[galaxyId] = groupId;
          else delete groups[galaxyId];
          return { groups };
        }),
    }),
    { name: 'wk-hub-v1', storage: createJSONStorage(() => sessionStorage) },
  ),
);
