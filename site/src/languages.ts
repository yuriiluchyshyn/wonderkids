/**
 * The languages of the public site — its own list: a page is written per
 * language (`src/locales/<code>.json`), and the game's languages are the
 * game's business. A new language of the site is a line here, its dictionary,
 * and its redirect at `/` in `vercel.json`.
 *
 * No DOM here: the build plugins and the tests read it too.
 */
export const SITE_LANGS = ['uk', 'en', 'pl'] as const;
export type SiteLang = (typeof SITE_LANGS)[number];

/** The language the site was written in: it lives at `/`, and every other falls back to it. */
export const DEFAULT_LANG: SiteLang = 'uk';

export interface SiteLanguage {
  /** The language's own name for itself. */
  name: string;
  /** Its name in three letters, for the menu in the bar. */
  short: string;
  /** How Open Graph calls it. */
  ogLocale: string;
}

export const LANGUAGES: Record<SiteLang, SiteLanguage> = {
  uk: { name: 'Українська', short: 'Укр', ogLocale: 'uk_UA' },
  en: { name: 'English', short: 'Eng', ogLocale: 'en_US' },
  pl: { name: 'Polski', short: 'Pol', ogLocale: 'pl_PL' },
};

/** The address of a language's page under the site root: `''`, `'en/'`, `'pl/'`. */
export const sitePath = (lang: SiteLang): string => (lang === DEFAULT_LANG ? '' : `${lang}/`);
