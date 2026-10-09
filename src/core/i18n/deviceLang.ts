import { create } from 'zustand';
import { isLang, offeredLang, type LangCode } from '@/core/lang';

/**
 * The language of this device — what a visitor sees before an account says
 * otherwise (the login pages, a parent who has not chosen a language yet).
 *
 * It is offered, in this order: what the visitor chose (on the landing page
 * or in the cabinet) → the language of the country the request came from
 * (`GET /api/health`, read from Vercel's `x-vercel-ip-country`) → the
 * browser's own language → English.
 *
 * A choice is remembered in a cookie on the root domain, so the public site,
 * `play.` and `parents.` agree, and in `localStorage` for hosts where such a
 * cookie cannot be set (localhost, `*.vercel.app`).
 */
const KEY = 'pulsar-lang-v1';
const COOKIE = 'pk_lang';
const YEAR = 60 * 60 * 24 * 365;

function readChoice(): LangCode | null {
  if (typeof document === 'undefined') return null;
  const cookie = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-z]{2})`))?.[1];
  if (isLang(cookie)) return cookie;
  try {
    const stored = localStorage.getItem(KEY);
    return isLang(stored) ? stored : null;
  } catch {
    return null;
  }
}

function rememberChoice(lang: LangCode): void {
  // `play.pulsarkids.com` → `.pulsarkids.com`; a host without a dot (localhost) gets a host-only cookie.
  const root = window.location.hostname.replace(/^(www|play|parents)\./, '');
  const domain = root.includes('.') && !/^\d+(\.\d+){3}$/.test(root) ? `; domain=.${root}` : '';
  document.cookie = `${COOKIE}=${lang}; path=/; max-age=${YEAR}; samesite=lax${domain}`;
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    // Private mode: the cookie is enough.
  }
}

const browserLangs = (): readonly string[] => (typeof navigator === 'undefined' ? [] : (navigator.languages ?? [navigator.language]));

interface DeviceLangState {
  lang: LangCode;
  /** The visitor picked it; until then it is only our offer. */
  chosen: boolean;
  /** The visitor's own choice — remembered across the site and both portals. */
  choose: (lang: LangCode) => void;
}

const choice = readChoice();

export const useDeviceLang = create<DeviceLangState>((set) => ({
  // Before the country is known the browser's language is the best guess.
  lang: choice ?? offeredLang(null, browserLangs()),
  chosen: choice !== null,
  choose: (lang) => {
    rememberChoice(lang);
    set({ lang, chosen: true });
  },
}));

/**
 * Asks the server which country the visitor is in and, unless a choice was
 * made, offers that country's language. Called once at start; a failure
 * leaves the browser's language in place.
 */
export async function offerLangByCountry(base = ''): Promise<void> {
  if (useDeviceLang.getState().chosen) return;
  try {
    const res = await fetch(`${base}/api/health`, { cache: 'no-store' });
    const { country } = (await res.json()) as { country?: string | null };
    if (!useDeviceLang.getState().chosen) useDeviceLang.setState({ lang: offeredLang(country, browserLangs()) });
  } catch {
    // Offline or no API: keep the guess.
  }
}
