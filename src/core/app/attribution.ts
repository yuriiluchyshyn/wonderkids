/**
 * Where the visitor came from: the `utm_*` labels of the link that brought them
 * (an ad, a profile link, a video description). The landing page passes them on
 * to the portals; here they are remembered on the device — past the trip to
 * Auth0 and back — and sent along when a parent account is created, so the
 * admin's «Джерела» page can tell which channel brings families.
 */
export interface SignupSource {
  source: string;
  medium?: string;
  campaign?: string;
}

/** Shared with the landing page's own script (landing.html). */
const STORAGE_KEY = 'pulsar-source-v1';

/** Called once at start-up, before anything strips the query string. */
export function rememberSource(): void {
  try {
    const query = new URLSearchParams(window.location.search);
    const source = query.get('utm_source');
    if (!source) return;
    const found: SignupSource = {
      source,
      medium: query.get('utm_medium') ?? undefined,
      campaign: query.get('utm_campaign') ?? undefined,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
  } catch {
    /* private mode or blocked storage — the account is simply created without a source */
  }
}

export function signupSource(): SignupSource | undefined {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as SignupSource | null;
    return saved && typeof saved.source === 'string' ? saved : undefined;
  } catch {
    return undefined;
  }
}
