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
  /** The code of the owner's own link (`?l=…`, made in the admin panel), when the visitor came by one. */
  link?: string;
}

/** The query parameter that carries the code of one of the owner's links: `?l=insta-bio`. */
export const LINK_PARAM = 'l';

/** How the trial game is opened on the child's portal: `play.…/try` (see the game's `core/app/demo.ts`). */
export const TRIAL_PATH = '/try';
/** Set on the way from the public site's own button into the trial game: `?via=site`. */
export const VIA_PARAM = 'via';

const LINK_CODE = /^[a-z0-9][a-z0-9_-]{1,39}$/;

/** The code of the owner's link a query string names, if it is written the way codes are. */
export function linkOfQuery(search: string): string | undefined {
  const code = new URLSearchParams(search).get(LINK_PARAM)?.trim().toLowerCase();
  return code && LINK_CODE.test(code) ? code : undefined;
}

/**
 * The source a link names in its query string, if it names one: its `utm_*`
 * labels, the code of the owner's link (`?l=…`), or both. A link with a code
 * and no labels is its own source.
 */
export function sourceOfQuery(search: string): SignupSource | undefined {
  const query = new URLSearchParams(search);
  const link = linkOfQuery(search);
  const source = query.get('utm_source');
  if (!source) return link ? { source: link, medium: 'link', link } : undefined;
  return { source, medium: query.get('utm_medium') || undefined, campaign: query.get('utm_campaign') || undefined, ...(link ? { link } : {}) };
}

/** A source as the query string of a link: `?utm_source=…&utm_medium=…`. */
export function queryOfSource({ source, medium, campaign, link }: SignupSource): string {
  const query = new URLSearchParams({ utm_source: source });
  if (medium) query.set('utm_medium', medium);
  if (campaign) query.set('utm_campaign', campaign);
  if (link) query.set(LINK_PARAM, link);
  return `?${query}`;
}
