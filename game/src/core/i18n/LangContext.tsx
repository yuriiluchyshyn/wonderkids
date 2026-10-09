import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useGameStore } from '@/core/child/store/useGameStore';
import { effectiveCurrency, type CurrencyId } from '@/core/game/content/currency';
import type { LangCode } from '@/core/lang';
import { translatorOf, type T } from './app';
import { useDeviceLang } from './deviceLang';

/**
 * Which language a part of the app is shown in. The app has three audiences,
 * each with a language of its own, so the language is not global: `App` wraps
 * the child's routes in the game's language, the parents' routes in the
 * cabinet's, and leaves the login pages to the device's (`deviceLang.ts`).
 * A component only ever calls `useT()`.
 */
const LangContext = createContext<LangCode | null>(null);

export function LangProvider({ lang, children }: { lang: LangCode; children: ReactNode }) {
  // Screen readers, hyphenation and the browser's own translator go by this.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

/** The language of the screen this component is on. */
export function useLang(): LangCode {
  const device = useDeviceLang((s) => s.lang);
  return useContext(LangContext) ?? device;
}

/** `t('hub.play')` in the language of the screen — or of `lang`, when given. */
export function useT(lang?: LangCode): T {
  const screen = useLang();
  const code = lang ?? screen;
  return useMemo(() => translatorOf(code), [code]);
}

/** The language of the active child's game: the parent's choice, or the one offered to this device. */
export function useGameLang(): LangCode {
  const chosen = useGameStore((s) => s.settings.gameLang);
  const device = useDeviceLang((s) => s.lang);
  return chosen ?? device;
}

/** The language the voice speaks to the active child: the parent's choice, or the game's. */
export function useVoiceLang(): LangCode {
  const chosen = useGameStore((s) => s.settings.voiceLang);
  const game = useGameLang();
  return chosen ?? game;
}

/** The money the active child's game counts in: the parent's choice, or the money of the game's language. */
export function useCurrency(): CurrencyId {
  const currency = useGameStore((s) => s.settings.currency);
  const currencyChosen = useGameStore((s) => s.settings.currencyChosen);
  return effectiveCurrency({ currency, currencyChosen }, useGameLang());
}

/** The language of the parents' cabinet: the parent's choice, or the one offered to this device. */
export function useParentLang(): LangCode {
  const chosen = useGameStore((s) => s.parentLang);
  const device = useDeviceLang((s) => s.lang);
  return chosen ?? device;
}
