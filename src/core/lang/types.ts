/**
 * What a language of the app is made of. One folder per language (`uk/`,
 * `en/`, `pl/`): `config.ts` — its facts, `numbers.ts` / `letters.ts` — its
 * words, `voice.ts` — the rules that make a text ready to be read aloud,
 * `index.ts` — the `Language` put together. A new language is a new folder
 * and one line in `LANGUAGES` (`index.ts`).
 *
 * Deliberately free of React and of `@/` imports so it runs under `node --test`.
 */

export const LANG_CODES = ['uk', 'en', 'pl'] as const;
export type LangCode = (typeof LANG_CODES)[number];

export interface LanguageConfig {
  code: LangCode;
  /** The language's own name for itself: «Українська», «English», «Polski». */
  name: string;
  /** Its name in three letters, for a place too narrow for the whole of it: «Укр», «Eng», «Pol». */
  short: string;
  flag: string;
  /** BCP 47 tag handed to the browser's speech synthesiser. */
  locale: string;
  /** The money a child counts in while nobody has chosen another (ISO 4217): the hryvnia, the dollar, the złoty. */
  currency: string;
  /** Countries (ISO 3166-1 alpha-2) where this language is offered first. */
  countries: readonly string[];
}

export interface Language extends LanguageConfig {
  /** A text as the voice should read it: numbers, dates, clock times and lone letters become words. */
  voiced(text: string): string;
  /** How a letter of the alphabet is called aloud. */
  letterName(letter: string): string;
  /** A sign of arithmetic as it is said: «+» → «плюс» / «plus». Anything else comes back as it is. */
  sign(sign: string): string;
  /** A fraction as it is said: 3/4 → «3 з 4» / «three quarters» / «trzy czwarte». */
  fraction(n: number, d: number): string;
}
