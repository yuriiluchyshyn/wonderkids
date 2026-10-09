/**
 * The language a visitor chose — on the public site or in the game — kept
 * where both can read it: a cookie on the root domain (the site's redirects
 * at `/` read it on the server, see `site/vercel.json`) and `localStorage`
 * for hosts where such a cookie cannot be set (localhost, `*.vercel.app`).
 *
 * It is only a code, as it was written. Whether that is a language of the
 * reader's own list is the reader's to decide: the site and the game each
 * keep their own.
 */
import { LANG_COOKIE, sharedCookieDomain } from '../hosts.ts';

const STORAGE_KEY = 'pulsar-lang-v1';
const YEAR = 60 * 60 * 24 * 365;

export function readLangChoice(): string | null {
  if (typeof document === 'undefined') return null;
  const cookie = document.cookie.match(new RegExp(`(?:^|;\\s*)${LANG_COOKIE}=([a-z]{2})`))?.[1];
  if (cookie) return cookie;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function rememberLangChoice(lang: string): void {
  const domain = sharedCookieDomain(window.location.hostname);
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=${YEAR}; samesite=lax${domain ? `; domain=${domain}` : ''}`;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Private mode: the cookie is enough.
  }
}
