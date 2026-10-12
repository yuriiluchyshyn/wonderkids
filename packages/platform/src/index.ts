/**
 * What the public site and the game agree on. This entry is pure — no DOM —
 * so build plugins and `node --test` can read it; what touches the browser's
 * cookies and storage is `@pulsar/platform/browser`.
 */
export { DEFAULT_SITE_URL, DEV_PORT, LANG_COOKIE, PORTAL_HOSTS, isLocalHost, isPreviewHost, portalHost, portalOfHost, publicUrls, rootHost, sharedCookieDomain, type PortalHost, type PublicUrls } from './hosts.ts';
export { GAME_PARAM, LINK_PARAM, TRIAL_PATH, VIA_PARAM, VISIT_VIAS, gameOfId, gameOfQuery, linkOfQuery, queryOfSource, sourceOfQuery, viaOfQuery, type GameRef, type SignupSource, type VisitVia } from './source.ts';
export { CONTACT_EMAIL, LEGAL_DOCS, legalUrl, type LegalDoc } from './legal.ts';
