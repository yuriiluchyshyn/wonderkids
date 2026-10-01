import { useGameStore } from '@/core/store/useGameStore';
import { THEMES } from './themes';
import type { Theme } from './theme.types';

/** Returns the full Theme object for the currently selected theme id. */
export function useActiveTheme(): Theme {
  const themeId = useGameStore((s) => s.themeId);
  return THEMES[themeId];
}
