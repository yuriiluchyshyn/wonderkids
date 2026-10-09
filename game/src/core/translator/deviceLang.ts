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
 * browser's own language → English — within the languages the owner offers
 * in that country (`offerDeviceLang`).
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
 * The server has said which country the visitor is in and which languages the
 * owner offers there (`core/app/availability.ts`): unless a choice was made,
 * that country's language is offered — or, when it is not among those
 * offered, the browser's first that is, else the first of them.
 */
export function offerDeviceLang(country: string | null | undefined, offered: readonly LangCode[]): void {
  if (useDeviceLang.getState().chosen) return;
  const natural = offeredLang(country, browserLangs());
  const fromBrowser = browserLangs()
    .map((tag) => tag.toLowerCase().split('-')[0])
    .find((code): code is LangCode => isLang(code) && offered.includes(code));
  useDeviceLang.setState({ lang: offered.includes(natural) ? natural : (fromBrowser ?? offered[0] ?? natural) });
}
