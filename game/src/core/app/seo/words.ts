import type { LangCode } from '@/core/language';
import en from '@/locales/seo/en.json';
import pl from '@/locales/seo/pl.json';
import uk from '@/locales/seo/uk.json';

/**
 * What the game says to search engines and link previews — its own file per
 * language, `src/locales/seo/<lang>.json`, apart from the interface's words:
 * `shell` is the head of the app shell (filled at build time by
 * `seo-plugin.ts`), every other section a public page's `title` and
 * `description`. A new public page is a section in each file, a line in the
 * plugin's `PUBLIC_PAGES` and its rewrite in `vercel.json`.
 */
export type SeoWords = typeof uk;
export type PublicPageId = Exclude<keyof SeoWords, 'shell'>;

const WORDS: Record<LangCode, SeoWords> = { uk, en, pl };

export const seoWords = (lang: LangCode): SeoWords => WORDS[lang];
