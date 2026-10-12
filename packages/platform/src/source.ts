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
/** Set on the way from the public site into the trial game: `?via=site` — the site's own button, `?via=page` — the button on a game's page. */
export const VIA_PARAM = 'via';
/** How a visitor got into the trial game. */
export const VISIT_VIAS = ['link', 'site', 'page'] as const;
export type VisitVia = (typeof VISIT_VIAS)[number];
/** What `?via=` says, or `link` when it says nothing we know. */
export const viaOfQuery = (search: string): VisitVia => VISIT_VIAS.find((via) => via === new URLSearchParams(search).get(VIA_PARAM)) ?? 'link';

/**
 * The query parameter that opens the trial game in ONE game instead of the
 * hub: `play.…/try?game=geography:flags` — what a game's page on the site
 * leads to. A game is named as the game names it: `<module>:<sub>`.
 */
export const GAME_PARAM = 'game';
const GAME_ID = /^([a-z][a-z0-9_]{0,29}):([a-z][a-z0-9_]{0,39})$/;

export interface GameRef {
  module: string;
  sub: string;
}

/** The game an id names (`geography:flags`), if it is written the way ids are. */
export function gameOfId(id: string | null | undefined): GameRef | undefined {
  const named = GAME_ID.exec(id?.trim() ?? '');
  return named ? { module: named[1], sub: named[2] } : undefined;
}

/** The game a query string asks the trial to open in. */
export const gameOfQuery = (search: string): GameRef | undefined => gameOfId(new URLSearchParams(search).get(GAME_PARAM));

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
