/**
 * The question about the Meta pixel (`#consent`, in every template) and the footer's «cookie
 * settings» that asks it again. Who is asked first and when the pixel may count is decided by
 * `../consent.ts`; the choice is kept in local storage (`CONSENT_KEY`). The country comes from
 * the API (`health.ts`), so a visitor whose choice is unknown waits for that answer.
 */
import { isLocalHost } from '@pulsar/platform';
import { CONSENT_KEY, asksFirst, pixelAllowed, type ConsentChoice } from '../consent.ts';
import { health } from './health.ts';
import { startPixel, stopPixel } from './pixel.ts';

declare global {
  interface Navigator {
    /** Global Privacy Control — a «do not sell or share» set in the browser. */
    globalPrivacyControl?: boolean;
  }
}

function storedChoice(): ConsentChoice | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

function storeChoice(choice: ConsentChoice): void {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* private mode: the page asks again next time */
  }
}

/** Shows the question; its buttons are wired once, by `wireBanner`. */
function ask(banner: HTMLElement): void {
  banner.hidden = false;
  banner.querySelector<HTMLButtonElement>('[data-consent="granted"]')?.focus({ preventScroll: true });
}

function wireBanner(banner: HTMLElement): void {
  banner.querySelectorAll<HTMLButtonElement>('[data-consent]').forEach((button) => {
    button.addEventListener('click', () => {
      const choice = button.dataset.consent as ConsentChoice;
      storeChoice(choice);
      banner.hidden = true;
      if (choice === 'granted') startPixel();
      else stopPixel();
    });
  });
  document.querySelectorAll<HTMLElement>('[data-consent-open]').forEach((link) => {
    link.hidden = false;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      ask(banner);
    });
  });
}

export async function wireConsent(): Promise<void> {
  const banner = document.getElementById('consent');
  if (!banner || isLocalHost(window.location.hostname)) return;
  wireBanner(banner);
  const choice = storedChoice();
  const gpc = navigator.globalPrivacyControl === true;
  if (choice) {
    if (pixelAllowed(choice, null, gpc)) startPixel();
    return;
  }
  const country = (await health())?.country;
  if (pixelAllowed(null, country, gpc)) startPixel();
  else if (asksFirst(country) && !gpc) ask(banner);
}
