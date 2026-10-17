/**
 * The Meta pixel — only once `consent.ts` allows it, and only on this site for parents: never in
 * the game, where a child plays. It is loaded from Meta's server at that moment, not by the page.
 *
 * What it tells Meta: `PageView` on every page, `ViewContent` on a game's page and on the page of
 * prices, `StartTrial` when the trial game is opened by a `[data-trial]` button — the event an ad
 * set can be optimised for. Meta's automatic collection of buttons and page data is switched off.
 */
import { GAME_PARAM } from '@pulsar/platform';
import { META_PIXEL_ID } from '../consent.ts';

type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[][]; loaded?: boolean; version?: string; push?: unknown; callMethod?: (...args: unknown[]) => void };

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

/** Meta's own cookies on pulsarkids.com: the browser's id and the id of the ad click. */
const META_COOKIES = ['_fbp', '_fbc'];

let started = false;

/** Meta's loader, as its snippet writes it: calls wait in a queue until the script is in. */
function loadScript(): Fbq {
  if (window.fbq) return window.fbq;
  const fbq: Fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue!.push(args);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];
  window.fbq = window._fbq = fbq;
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);
  return fbq;
}

/** The game a trial link opens (`?game=<module>:<sub>` — a game's own page), or null (the site's button). */
const gameOf = (link: HTMLAnchorElement): string | null => new URL(link.href).searchParams.get(GAME_PARAM);

/** What this page is: a game's page names its game (its button opens it), the page of prices is prices. */
function viewedContent(): Record<string, unknown> | null {
  const game = [...document.querySelectorAll<HTMLAnchorElement>('a[data-trial]')].map(gameOf).find(Boolean);
  if (game) return { content_type: 'product', content_ids: [game], content_name: document.querySelector('h1')?.textContent?.trim() ?? game };
  if (document.querySelector('main.pricing')) return { content_type: 'product_group', content_name: 'pricing' };
  return null;
}

/** Starts counting this page; a second call does nothing. */
export function startPixel(): void {
  if (started) return;
  started = true;
  const fbq = loadScript();
  fbq('set', 'autoConfig', false, META_PIXEL_ID);
  fbq('consent', 'grant');
  fbq('init', META_PIXEL_ID);
  fbq('track', 'PageView');
  const content = viewedContent();
  if (content) fbq('track', 'ViewContent', content);
  document.querySelectorAll<HTMLAnchorElement>('a[data-trial]').forEach((link) => {
    link.addEventListener('click', () => window.fbq?.('track', 'StartTrial', { content_name: gameOf(link) ?? 'site', value: 0, currency: 'USD' }));
  });
}

/** Stops counting: Meta is told, and its cookies on this site are removed. */
export function stopPixel(): void {
  window.fbq?.('consent', 'revoke');
  const host = window.location.hostname.split('.').slice(-2).join('.');
  for (const name of META_COOKIES) {
    for (const domain of ['', `; domain=.${host}`]) document.cookie = `${name}=; max-age=0; path=/${domain}`;
  }
}
