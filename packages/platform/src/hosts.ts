/**
 * Where everything lives. The public site is the root domain; the game is
 * deployed apart from it and answers on two subdomains — its portals:
 *
 *   pulsarkids.com           the public site
 *   play.pulsarkids.com      the child's portal
 *   parents.pulsarkids.com   the parents' portal (and the admin panel)
 *
 * Pure: no DOM, so the build plugins and `node --test` can use it too.
 */

/** The game's portals, named by the subdomain each lives on. */
export const PORTAL_HOSTS = ['play', 'parents'] as const;
export type PortalHost = (typeof PORTAL_HOSTS)[number];

export const DEFAULT_SITE_URL = 'https://pulsarkids.com';

/** The cookie that carries the language a visitor chose; the site's redirects at `/` read it too (`site/vercel.json`). */
export const LANG_COOKIE = 'pk_lang';

/** The port each dev server takes, so a page of one can link to the other on the same machine. */
export const DEV_PORT = { game: 4321, site: 4322 } as const;

const LOCAL_HOST = /^(localhost$|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)|\.local$/;
const PREVIEW_HOST = /\.vercel\.app$/;
const IPV4 = /^\d+(\.\d+){3}$/;

/** A developer's machine or a device on the same network: no subdomains exist there. */
export const isLocalHost = (host: string): boolean => LOCAL_HOST.test(host.toLowerCase());
/** A Vercel preview deployment: one origin, no subdomains either. */
export const isPreviewHost = (host: string): boolean => PREVIEW_HOST.test(host.toLowerCase());

/** The root domain of a host, without `www.` or a portal's prefix. */
export const rootHost = (host: string): string => host.toLowerCase().replace(/^(www|play|parents)\./, '');

/** The portal a host belongs to, if it is one. */
export const portalOfHost = (host: string): PortalHost | null => PORTAL_HOSTS.find((portal) => host.toLowerCase().startsWith(`${portal}.`)) ?? null;

/** The host of a portal on the same root domain as `host`: `play.pulsarkids.com`. */
export const portalHost = (portal: PortalHost, host: string): string => `${portal}.${rootHost(host)}`;

/**
 * The cookie domain the site and both portals share (`.pulsarkids.com`), or
 * `null` where a cookie can only belong to the host itself (localhost, an IP).
 */
export function sharedCookieDomain(host: string): string | null {
  const root = rootHost(host);
  return root.includes('.') && !IPV4.test(root) ? `.${root}` : null;
}

export interface PublicUrls {
  site: string;
  play: string;
  parents: string;
}

/**
 * The public addresses of a deployment, none with a trailing slash. Only the
 * site's is needed (`VITE_SITE_URL`): the portals are its subdomains unless
 * one is given an address of its own.
 */
export function publicUrls(siteUrl: string | undefined = DEFAULT_SITE_URL, own: Partial<Record<PortalHost, string | undefined>> = {}): PublicUrls {
  const trim = (url: string): string => url.replace(/\/+$/, '');
  const site = trim(siteUrl || DEFAULT_SITE_URL);
  const sub = (portal: PortalHost): string => trim(own[portal] || site.replace('://', `://${portal}.`));
  return { site, play: sub('play'), parents: sub('parents') };
}
