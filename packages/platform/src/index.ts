/**
 * What the public site and the game agree on. This entry is pure — no DOM —
 * so build plugins and `node --test` can read it; what touches the browser's
 * cookies and storage is `@pulsar/platform/browser`.
 */
export { DEFAULT_SITE_URL, DEV_PORT, LANG_COOKIE, PORTAL_HOSTS, isLocalHost, isPreviewHost, portalHost, portalOfHost, publicUrls, rootHost, sharedCookieDomain, type PortalHost, type PublicUrls } from './hosts.ts';
export { queryOfSource, sourceOfQuery, type SignupSource } from './source.ts';
