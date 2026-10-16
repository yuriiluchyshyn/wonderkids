/** Everything the public page does once it is read. Each part minds one thing and knows nothing of the others. */
import { showPricingLinks } from './health.ts';
import { wireLanguageMenu } from './language.ts';
import { wirePricingLinks } from './pricing-links.ts';
import { wireLetterForm } from './letter/index.ts';
import { wirePortalLinks } from './portals.ts';
import { animateOnScroll } from './reveal.ts';
import { countArrival } from './visit.ts';

wirePortalLinks();
countArrival();
wireLanguageMenu();
void showPricingLinks();
wirePricingLinks();
animateOnScroll();
wireLetterForm();

const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
