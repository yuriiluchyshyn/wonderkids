import { useGameStore } from '@/core/store/useGameStore';

/**
 * Small selector hook for cross-cutting presentation preferences so components
 * don't each reach into the settings slice directly.
 */
export function useShowText(): boolean {
  return useGameStore((s) => s.settings.showText);
}
