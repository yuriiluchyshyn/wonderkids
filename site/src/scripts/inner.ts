/** What an inner page — a legal text, a page of a game — does once it is read: its links into the game and its language menu, nothing else of the main page. */
import { rememberLangChoice } from '@pulsar/platform/browser';
import { wireLanguageMenu } from './language.ts';
import { wirePortalLinks } from './portals.ts';

wirePortalLinks();
wireLanguageMenu();

// Going back to the main page, the reader stays in the language of the page: without
// this «/» would send them by their country (`vercel.json`) — from a Ukrainian page to the Polish one.
document.querySelectorAll<HTMLAnchorElement>('a[data-home]').forEach((link) => {
  link.addEventListener('click', () => rememberLangChoice(document.documentElement.lang));
});

const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
