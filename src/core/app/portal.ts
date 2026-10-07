/**
 * Which "face" of the app is running, decided by the hostname so the public
 * site, the parent portal and the child portal stay apart (Tech Spec v2.1 §2 —
 * Domain Isolation):
 *
 *   pulsarkids.com           → 'site'    the public landing page (served as
 *                                        static landing.html); any app path
 *                                        opened here is sent to its subdomain
 *   parents.pulsarkids.com   → 'parent'  only the parent portal (+ admin)
 *   play.pulsarkids.com      → 'kid'     only the child portal
 *   localhost / LAN / *.vercel.app → 'dev'  everything, for development
 *
 * The same bundle behaves correctly on each host.
 */
export type Portal = 'site' | 'parent' | 'kid' | 'dev';

/** Hosts where everything is reachable on one origin (no subdomains exist). */
const DEV_HOST = /^(localhost$|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)|\.local$|\.vercel\.app$/;

/** Set VITE_USE_SUBDOMAINS=false to keep the whole app on the root domain. */
const USE_SUBDOMAINS = import.meta.env.VITE_USE_SUBDOMAINS !== 'false';

export function getPortal(): Portal {
  if (typeof window === 'undefined') return 'dev';
  const host = window.location.hostname.toLowerCase();
  if (host.startsWith('parents.')) return 'parent';
  if (host.startsWith('play.')) return 'kid';
  if (DEV_HOST.test(host) || !USE_SUBDOMAINS) return 'dev';
  return 'site';
}

/** The root domain without `www.` / portal prefix. */
function rootHost(): string {
  return window.location.hostname.toLowerCase().replace(/^(www|play|parents)\./, '');
}

/**
 * Absolute URL of a path on the child (`play.`) or parent (`parents.`) portal.
 * On dev hosts there are no subdomains, so the path is returned as is.
 */
export function portalUrl(portal: 'kid' | 'parent', path = '/'): string {
  if (getPortal() === 'dev') return path;
  return `${window.location.protocol}//${portal === 'kid' ? 'play' : 'parents'}.${rootHost()}${path}`;
}

/**
 * Absolute URL of the public site's front page (the landing page). On dev
 * hosts that is this origin's own root.
 */
export function siteUrl(): string {
  if (getPortal() === 'dev') return `${window.location.origin}/`;
  return `${window.location.protocol}//${rootHost()}/`;
}

/** Paths that belong to the parent portal; everything else is the child's. */
export function isParentPath(pathname: string): boolean {
  return /^\/(parent|parent-login|admin)(\/|$)/.test(pathname);
}
