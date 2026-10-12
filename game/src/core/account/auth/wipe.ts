import { LANG_COOKIE, sharedCookieDomain } from '@pulsar/platform';

/**
 * Signing out — and signing in as someone else — must leave nothing of the
 * previous account behind, on this portal or the other one. The two portals
 * (`play.` and `parents.`) are separate origins: each keeps its own storage,
 * and neither can clear the other's. What they share is a cookie on the root
 * domain, so a sign-out or a sign-in leaves a mark there:
 *
 *   wk-auth=<time>.<account id>    (account id 0 — signed out)
 *
 * Every portal checks the mark when it starts and whenever its tab comes back
 * into view. A session that began before the mark, for a different account,
 * is over: it is dropped and the device storage wiped.
 */
const MARK_COOKIE = 'wk-auth';
const MARK_MAX_AGE = 60 * 60 * 24 * 400;

/** What survives a wipe: the language the family chose, and the mark itself. */
const KEEP_STORAGE = new Set(['pulsar-lang-v1']);
const KEEP_COOKIES = new Set([LANG_COOKIE, MARK_COOKIE]);

export interface AuthMark {
  at: number;
  /** The account signed in then; 0 — signed out. */
  user: number;
}

function setCookie(name: string, value: string, maxAge: number, domain: string | null): void {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; samesite=lax${domain ? `; domain=${domain}` : ''}${window.location.protocol === 'https:' ? '; secure' : ''}`;
}

export function readAuthMark(): AuthMark | null {
  const raw = document.cookie.match(new RegExp(`(?:^|;\\s*)${MARK_COOKIE}=(\\d+)\\.(\\d+)`));
  return raw ? { at: Number(raw[1]), user: Number(raw[2]) } : null;
}

/** Leaves the mark on the root domain (or on this host where there is none, e.g. a preview). */
export function markAuth(user: number): void {
  const value = `${Date.now()}.${user}`;
  const domain = sharedCookieDomain(window.location.hostname);
  if (domain) setCookie(MARK_COOKIE, value, MARK_MAX_AGE, domain);
  // A public suffix (`*.vercel.app`) refuses the domain cookie: fall back to this host.
  if (readAuthMark()?.at !== Number(value.split('.')[0])) setCookie(MARK_COOKIE, value, MARK_MAX_AGE, null);
}

/**
 * Clears what this origin holds: local and session storage, every cookie the
 * page can see (the Auth0 SDK keeps an `is.authenticated` one — left behind, it
 * makes Auth0 sign the old parent straight back in), the Cache Storage and any
 * service worker. Only the language choice and the mark stay.
 */
export function wipeDevice(): void {
  try {
    for (const key of Object.keys(localStorage)) if (!KEEP_STORAGE.has(key)) localStorage.removeItem(key);
  } catch {
    /* storage blocked — nothing to clear */
  }
  try {
    sessionStorage.clear();
  } catch {
    /* storage blocked */
  }

  const domain = sharedCookieDomain(window.location.hostname);
  for (const pair of document.cookie.split(';')) {
    const name = pair.split('=')[0].trim();
    if (!name || KEEP_COOKIES.has(name)) continue;
    setCookie(name, '', 0, null);
    if (domain) setCookie(name, '', 0, domain);
  }

  if ('caches' in window) void caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))).catch(() => undefined);
  if ('serviceWorker' in navigator) void navigator.serviceWorker.getRegistrations().then((all) => Promise.all(all.map((r) => r.unregister()))).catch(() => undefined);
}

/** Whether a session that began at `since`, for `user`, was ended by a sign-out or another sign-in since. */
export function isStale(since: number | null, user: number | undefined): boolean {
  const mark = readAuthMark();
  return Boolean(mark && mark.at > (since ?? 0) && mark.user !== user);
}
