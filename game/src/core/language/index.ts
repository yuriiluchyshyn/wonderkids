/**
 * The languages of the app. Everything that depends on a language — how a
 * text is read aloud, what a letter is called, which voice speaks — is asked
 * of the `Language` here, never decided by an `if (lang === …)` elsewhere.
 *
 * Deliberately free of React and of `@/` imports so it runs under `node --test`.
 */
import { en } from './en/index.ts';
import { pl } from './pl/index.ts';
import { LANG_CODES, type LangCode, type Language } from './types.ts';
import { uk } from './uk/index.ts';

export { LANG_CODES, type LangCode, type Language, type LanguageConfig } from './types.ts';
export { common, hasOwn, own, say, spoken, written } from './marks.ts';

export const LANGUAGES: Record<LangCode, Language> = { uk, en, pl };
/** The language the app was written in, and the one every other falls back to. */
export const DEFAULT_LANG: LangCode = 'uk';
/** The language offered where none of ours is at home. */
export const WORLD_LANG: LangCode = 'en';

export const isLang = (value: unknown): value is LangCode => typeof value === 'string' && (LANG_CODES as readonly string[]).includes(value);
export const language = (code: LangCode): Language => LANGUAGES[code];

/** A text as the voice of `lang` should read it. */
export const voiced = (text: string, lang: LangCode = DEFAULT_LANG): string => LANGUAGES[lang].voiced(text);

/** The language to offer in a country (ISO 3166-1 alpha-2): its own, or the world's. */
export function langOfCountry(country: string | null | undefined): LangCode {
  const code = (country ?? '').toUpperCase();
  return LANG_CODES.find((lang) => LANGUAGES[lang].countries.includes(code)) ?? WORLD_LANG;
}

/**
 * The language to offer a visitor who has not chosen one. The region decides
 * first: in a country where one of our languages is at home, it is offered.
 * Elsewhere the visitor's own browser knows better than the map (a Ukrainian
 * family in Berlin) — its first language that is one of ours; failing that,
 * the world's.
 */
export function offeredLang(country: string | null | undefined, browserLangs: readonly string[] = []): LangCode {
  const code = (country ?? '').toUpperCase();
  const home = LANG_CODES.find((lang) => LANGUAGES[lang].countries.includes(code));
  if (home) return home;
  for (const tag of browserLangs) {
    const lang = tag.toLowerCase().split('-')[0];
    if (isLang(lang)) return lang;
  }
  return WORLD_LANG;
}
