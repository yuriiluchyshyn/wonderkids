import { useGameStore } from '@/core/store/useGameStore';
import { THEMES, DEFAULT_THEME_ID } from './themes';
import type { Theme } from './theme.types';

/**
 * Returns the full Theme for the active child. When no theme has been chosen
 * yet (`themeId === null`) this resolves to the neutral galaxy default, so a
 * freshly-created child sees a galactic skin — not a unicorn.
 */
export function useActiveTheme(): Theme {
  const themeId = useGameStore((s) => s.themeId);
  return THEMES[themeId ?? DEFAULT_THEME_ID] ?? THEMES[DEFAULT_THEME_ID];
}
