/**
 * Where a visitor came from: the `utm_*` labels of the link that brought them
 * (an ad, a profile link, a video description). The public site reads them and
 * passes them on in its links to the portals; the game keeps them past the
 * trip to the sign-in and sends them along when a parent account is created.
 * Both sides read and write the same thing, so it is described once, here
 * (and kept on the device by `browser/source.ts`).
 */
export interface SignupSource {
  source: string;
  medium?: string;
  campaign?: string;
}

/** The source a link names in its query string (`?utm_source=…`), if it names one. */
export function sourceOfQuery(search: string): SignupSource | undefined {
  const query = new URLSearchParams(search);
  const source = query.get('utm_source');
  if (!source) return undefined;
  return { source, medium: query.get('utm_medium') || undefined, campaign: query.get('utm_campaign') || undefined };
}

/** A source as the query string of a link: `?utm_source=…&utm_medium=…`. */
export function queryOfSource({ source, medium, campaign }: SignupSource): string {
  const query = new URLSearchParams({ utm_source: source });
  if (medium) query.set('utm_medium', medium);
  if (campaign) query.set('utm_campaign', campaign);
  return `?${query}`;
}
