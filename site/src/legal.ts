import { LEGAL_DOCS, type LegalDoc } from '@pulsar/platform';
import { sitePath, type SiteLang } from './languages.ts';

/**
 * The site's legal pages: the privacy policy and the terms, each written per
 * language in `src/legal/<lang>/<doc>.md` and built into a page of its own
 * (`build/legal.ts`): `/privacy/`, `/en/privacy/`, `/pl/terms/`…
 *
 * No DOM here: the build plugins and the tests read it too.
 */
export { LEGAL_DOCS, type LegalDoc };

/**
 * The day each text last changed — what the page shows as «in force from».
 * It is not the day of the build: change it together with the text, in every
 * language at once.
 */
export const LEGAL_UPDATED: Record<LegalDoc, string> = {
  privacy: '2026-10-17',
  terms: '2026-10-12',
};

/** The address of a legal page under the site root: `'privacy/'`, `'en/terms/'`. */
export const legalPath = (lang: SiteLang, doc: LegalDoc): string => `${sitePath(lang)}${doc}/`;
