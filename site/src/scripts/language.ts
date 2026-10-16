/**
 * The language menu. A language picked here is a choice to keep: it is
 * remembered where the game reads it too, and «/» sends a returning visitor
 * to their language (`vercel.json`).
 */
import { rememberLangChoice } from '@pulsar/platform/browser';
import { health } from './health.ts';

/**
 * The owner may offer only some languages in a country (the admin panel's
 * «Доступність»; the API's `GET /api/health` tells which). The others leave
 * the menu — never the language of the page being read, and nobody is sent
 * anywhere: a page opened by its address stays, for a reader and a crawler alike.
 * With one language left there is nothing to choose, and the menu goes too.
 */
async function offerOnlyWhatIsHere(): Promise<void> {
  try {
    const offered = (await health())?.availability?.langs?.site;
    const links = [...document.querySelectorAll<HTMLAnchorElement>('a[data-lang]')];
    // A rule that names none of this site's languages says nothing here.
    if (!Array.isArray(offered) || !links.some((link) => offered.includes(link.dataset.lang ?? ''))) return;
    const here = document.documentElement.lang;
    const left = new Set<string>();
    for (const link of links) {
      const lang = link.dataset.lang ?? '';
      const stays = lang === here || offered.includes(lang);
      (link.closest('li') ?? link).toggleAttribute('hidden', !stays);
      if (stays) left.add(lang);
    }
    document.querySelector('.langs')?.toggleAttribute('hidden', left.size < 2);
  } catch {
    /* offline, or the game is down: every language stays */
  }
}

export function wireLanguageMenu(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-lang]').forEach((link) => {
    link.addEventListener('click', () => rememberLangChoice(link.dataset.lang ?? document.documentElement.lang));
  });

  void offerOnlyWhatIsHere();

  // The menu closes on a tap outside it.
  const menu = document.querySelector<HTMLDetailsElement>('.langs');
  document.addEventListener('click', (e) => {
    if (menu?.open && !menu.contains(e.target as Node)) menu.open = false;
  });
}
