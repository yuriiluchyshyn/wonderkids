/**
 * The texts of the app — the child's game and the parents' cabinet. Every
 * phrase lives in `src/locales/app/<lang>.json` under its key; the Ukrainian
 * file is the one the keys are read from, so a key that does not exist there
 * does not compile.
 */
import { DEFAULT_LANG, type LangCode } from '@/core/lang';
import en from '@/locales/app/en.json';
import pl from '@/locales/app/pl.json';
import uk from '@/locales/app/uk.json';
import { createTranslator, type Dict, type KeyOf, type Params } from './engine';

export type AppKey = KeyOf<typeof uk>;
export type { Params };

/** `tApp('pl', 'hub.play')` — for code outside React; components use `useT()`. */
export const tApp = createTranslator<AppKey>({ uk, en, pl } as Record<LangCode, Dict>, DEFAULT_LANG);

/** A translator already bound to its language. */
export type T = (key: AppKey, params?: Params) => string;
export const translatorOf = (lang: LangCode): T => (key, params) => tApp(lang, key, params);
