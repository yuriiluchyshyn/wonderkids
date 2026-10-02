/**
 * Which "face" of the app is running, decided by the hostname so the parent and
 * child portals stay isolated (Tech Spec v2.1 §2 — Domain Isolation):
 *
 *   parents.wonderkids.app → 'parent'  (only the parent portal; no adventures)
 *   play.wonderkids.app    → 'kid'     (only the child portal; no parent portal)
 *   localhost / anything   → 'dev'     (everything, for local development)
 *
 * The real DNS/reverse-proxy split happens at deploy time; this lets the same
 * bundle behave correctly on each host and keeps the two experiences apart.
 */
export type Portal = 'parent' | 'kid' | 'dev';

export function getPortal(): Portal {
  if (typeof window === 'undefined') return 'dev';
  const host = window.location.hostname.toLowerCase();
  if (host.startsWith('parents.')) return 'parent';
  if (host.startsWith('play.')) return 'kid';
  return 'dev';
}
