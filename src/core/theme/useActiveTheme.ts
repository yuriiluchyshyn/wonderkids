import { useGameStore } from '@/core/child/store/useGameStore';
import { useLang } from '@/core/i18n';
import type { LangCode } from '@/core/lang';
import { themeOf } from './localTheme';
import type { Theme } from './theme.types';

/**
 * Returns the full Theme for the active child, its words in the language of
 * the screen (or in `lang` — the voice's, when a phrase is to be spoken). When
 * no theme has been chosen yet (`themeId === null`) this resolves to the
 * neutral galaxy default, so a freshly-created child sees a galactic skin —
 * not a unicorn.
 */
export function useActiveTheme(lang?: LangCode): Theme {
  const themeId = useGameStore((s) => s.themeId);
  const screen = useLang();
  return themeOf(themeId, lang ?? screen);
}
