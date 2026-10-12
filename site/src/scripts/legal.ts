/** What a legal page does once it is read: its links into the game and its language menu — nothing else of the main page. */
import { wireLanguageMenu } from './language.ts';
import { wirePortalLinks } from './portals.ts';

wirePortalLinks();
wireLanguageMenu();

const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
