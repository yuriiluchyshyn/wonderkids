import { portalHost, portalOfHost, type PortalHost } from '@pulsar/platform';

/**
 * Which "face" of the game is running, decided by the hostname so the parent
 * portal and the child portal stay apart (Tech Spec v2.1 §2 — Domain
 * Isolation):
 *
 *   parents.pulsarkids.com   → 'parent'  only the parent portal (+ admin)
 *   play.pulsarkids.com      → 'kid'     only the child portal
 *   anything else            → 'dev'     everything on one origin: localhost,
 *                                        a LAN address, a `*.vercel.app` preview
 *
 * The same bundle behaves correctly on each host. The root domain is not the
 * game's at all: the public site is a deployment of its own (`../site`), and
 * how the hosts are laid out is agreed with it in `@pulsar/platform`.
 */
export type Portal = 'parent' | 'kid' | 'dev';

const PORTAL_OF_HOST: Record<PortalHost, Portal> = { parents: 'parent', play: 'kid' };
const HOST_OF_PORTAL: Record<'kid' | 'parent', PortalHost> = { kid: 'play', parent: 'parents' };

export function getPortal(): Portal {
  if (typeof window === 'undefined') return 'dev';
  const portal = portalOfHost(window.location.hostname);
  return portal ? PORTAL_OF_HOST[portal] : 'dev';
}

/**
 * Absolute URL of a path on the child (`play.`) or parent (`parents.`) portal.
 * Where there are no subdomains the path is returned as is.
 */
export function portalUrl(portal: 'kid' | 'parent', path = '/'): string {
  if (getPortal() === 'dev') return path;
  const { hostname, protocol } = window.location;
  return `${protocol}//${portalHost(HOST_OF_PORTAL[portal], hostname)}${path}`;
}
