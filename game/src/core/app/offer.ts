/**
 * The offer a link brought (`?plan=family&period=year&children=3&offer=CODE` —
 * `offerOfQuery` of `@pulsar/platform`): from the public site's window of
 * prices, or a link the owner hands out. It is kept on the device past the
 * trip to Auth0 and taken by the paywall once the parent is in
 * (`components/paywall/PaywallGate.tsx`), which opens the payment of that plan.
 */
import { offerOfQuery, type Offer } from '@pulsar/platform';

const KEY = 'pulsar-offer-v1';
/** An offer older than this is not acted on: the parent came back another day for something else. */
const KEEP_MS = 24 * 60 * 60_000;

/** Called once at start-up, before anything strips the query string. */
export function rememberOffer(): void {
  const offer = offerOfQuery(window.location.search);
  if (!offer) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...offer, at: Date.now() }));
  } catch {
    /* storage off: the offer is lost, the parent chooses again */
  }
}

/** The offer waiting to be acted on, or null. */
export function pendingOffer(): Offer | null {
  try {
    const kept = JSON.parse(localStorage.getItem(KEY) ?? 'null') as (Offer & { at?: number }) | null;
    if (!kept || !kept.at || Date.now() - kept.at > KEEP_MS) return null;
    const { at: _at, ...offer } = kept;
    return offer;
  } catch {
    return null;
  }
}

/** The offer was acted on (or refused): it is not offered again. */
export function dropOffer(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing kept */
  }
}
