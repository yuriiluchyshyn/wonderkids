import { readLangChoice, rememberLangChoice } from '@pulsar/platform/browser';
import { create } from 'zustand';
import { isLang, offeredLang, type LangCode } from '@/core/language';

/**
 * The language of this device — what a visitor sees before an account says
 * otherwise (the login pages, a parent who has not chosen a language yet).
 *
 * It is offered, in this order: what the visitor chose (on the landing page
 * or in the cabinet) → the language of the country the request came from
 * (`GET /api/health`, read from Vercel's `x-vercel-ip-country`) → the
 * browser's own language → English.
 *
 * A choice is remembered where the public site, `play.` and `parents.` all
 * read it (`@pulsar/platform`). The site keeps a list of languages of its own:
 * a choice made there that the game does not speak is no choice here.
 */
function readChoice(): LangCode | null {
  const choice = readLangChoice();
  return isLang(choice) ? choice : null;
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
    rememberLangChoice(lang);
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
