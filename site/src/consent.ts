/**
 * When the Meta pixel may count a visitor (`scripts/consent.ts` asks, `scripts/pixel.ts` counts).
 * Pure: no browser in here, so the rules are tested as they are.
 *
 * Where the GDPR (and its British and Swiss twins) applies, an advertising cookie needs a «yes»
 * before it is set — so the page asks first. Elsewhere (the USA, Canada, Ukraine…) the pixel counts
 * unless the visitor says no: the footer's «cookie settings», or the browser's Global Privacy
 * Control, which several US state laws make a «no» by itself. A visitor whose country is unknown
 * is asked first.
 */

/** The Meta pixel of pulsarkids.com (Events Manager → «Pulsar Kids — pulsarkids.com»). Public: it is in every page that loads it. */
export const META_PIXEL_ID = '1622060529422703';

/** Where the choice is kept (local storage, this site only). */
export const CONSENT_KEY = 'pulsar-consent-v1';

export type ConsentChoice = 'granted' | 'denied';

/** The EU, the rest of the EEA, the United Kingdom and Switzerland: opt-in before any advertising cookie. */
const ASK_FIRST = new Set(
  [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
    'IS', 'LI', 'NO',
    'GB', 'CH',
  ],
);

/** Whether a visitor from this country (ISO alpha-2, or null when unknown) is asked before the pixel. */
export const asksFirst = (country: string | null | undefined): boolean => !country || ASK_FIRST.has(country.toUpperCase());

/**
 * Whether the pixel may count: what the visitor chose wins; with no choice — no in an ask-first
 * country or under Global Privacy Control, yes elsewhere.
 */
export function pixelAllowed(choice: ConsentChoice | null, country: string | null | undefined, gpc: boolean): boolean {
  if (choice) return choice === 'granted';
  return !gpc && !asksFirst(country);
}
