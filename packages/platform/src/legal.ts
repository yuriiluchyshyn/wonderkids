/**
 * The pages the law asks for — the privacy policy and the terms — live on the
 * public site, and the game links to them (its login pages, the parents'
 * area). Both sides name them the same way, so it is said once, here.
 */
export const LEGAL_DOCS = ['privacy', 'terms'] as const;
export type LegalDoc = (typeof LEGAL_DOCS)[number];

/** Where a parent writes about their data, a complaint or anything else. */
export const CONTACT_EMAIL = 'hello@pulsarkids.com';

/**
 * A legal page's address in a language: `https://pulsarkids.com/pl/privacy/`.
 * The language the site was written in sits at the root, and the site sends
 * its own code there (`/uk/privacy/` → `/privacy/`), so whoever links need not
 * know which language that is.
 */
export const legalUrl = (site: string, lang: string, doc: LegalDoc): string => `${site}/${lang}/${doc}/`;
