/**
 * The language menu. A language picked here is a choice to keep: it is
 * remembered where the game reads it too, and «/» sends a returning visitor
 * to their language (`vercel.json`).
 */
import { rememberLangChoice } from '@pulsar/platform/browser';

export function wireLanguageMenu(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-lang]').forEach((link) => {
    link.addEventListener('click', () => rememberLangChoice(link.dataset.lang ?? document.documentElement.lang));
  });

  // The menu closes on a tap outside it.
  const menu = document.querySelector<HTMLDetailsElement>('.langs');
  document.addEventListener('click', (e) => {
    if (menu?.open && !menu.contains(e.target as Node)) menu.open = false;
  });
}
