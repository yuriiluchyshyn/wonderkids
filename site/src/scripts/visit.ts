/**
 * Counts an arrival by one of the owner's own links (`?l=insta-bio`, made in
 * the admin panel): when, by which link, from which country. The count is kept
 * by the game's API (`game/api/health.js`), on another origin; a link it does
 * not know is not counted. A reload of the page is the same arrival.
 */
import { linkOfQuery, rootHost } from '@pulsar/platform';
import { localGameOrigin } from './portals.ts';

const SEEN = 'pulsar-visit-';

/** Where arrivals are counted: the address the page was built with, or the game's dev server beside this one. */
function endpoint(): string | null {
  const built = document.body.dataset.visitsApi;
  if (!built) return null;
  const local = localGameOrigin();
  return local ? local + new URL(built, window.location.href).pathname : built;
}

/** The site that sent the visitor, if the browser tells and it is not this one. */
function referrerHost(): string | null {
  try {
    const host = new URL(document.referrer).hostname.toLowerCase();
    return host && rootHost(host) !== rootHost(window.location.hostname) ? host : null;
  } catch {
    return null;
  }
}

export function countArrival(): void {
  const link = linkOfQuery(window.location.search);
  const api = endpoint();
  if (!link || !api) return;
  try {
    if (sessionStorage.getItem(SEEN + link)) return;
    sessionStorage.setItem(SEEN + link, '1');
  } catch {
    /* private mode: a reload may be counted twice */
  }
  void fetch(api, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ link, mode: 'site', via: 'link', lang: document.documentElement.lang, referrer: referrerHost() }),
    keepalive: true,
  }).catch(() => {
    /* offline, or the game is down: the page works without the count */
  });
}
