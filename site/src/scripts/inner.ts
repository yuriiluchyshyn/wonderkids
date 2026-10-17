/** What an inner page — a legal text, a page of a game — does once it is read: its links into the game and its language menu, nothing else of the main page. */
import { rememberLangChoice } from '@pulsar/platform/browser';
import { wireConsent } from './consent.ts';
import { showPricingLinks } from './health.ts';
import { wireLanguageMenu } from './language.ts';
import { wirePricingLinks } from './pricing-links.ts';
import { wirePortalLinks } from './portals.ts';

wirePortalLinks();
wireLanguageMenu();
void showPricingLinks();
void wireConsent();
wirePricingLinks();

// Going back to the main page, the reader stays in the language of the page: without
// this «/» would send them by their country (`vercel.json`) — from a Ukrainian page to the Polish one.
document.querySelectorAll<HTMLAnchorElement>('a[data-home]').forEach((link) => {
  link.addEventListener('click', () => rememberLangChoice(document.documentElement.lang));
});

// «More games of the galaxy»: every other game is in the page; a few of them, drawn anew on each visit, are shown.
document.querySelectorAll<HTMLElement>('[data-shuffle]').forEach((grid) => {
  const shown = Number(grid.dataset.shuffle) || 4;
  const cards = [...grid.children] as HTMLElement[];
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  cards.forEach((card, i) => {
    card.hidden = i >= shown;
    grid.appendChild(card);
  });
});

const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
