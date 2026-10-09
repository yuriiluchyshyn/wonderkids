/**
 * Publication status of a game (PRD v4.0 §1.2), derived purely from its
 * `publish_date` (UTC) — nothing is toggled by hand:
 *
 *   now <  publish_date            → 'soon'  locked card with a «Скоро» tag
 *   now <  publish_date + 60 days  → 'new'   playable, "NEW" badge
 *   otherwise                      → 'live'  playable
 */
export type PublishStatus = 'soon' | 'new' | 'live';

/** How long the "NEW" badge stays on a freshly published game. */
export const NEW_BADGE_DAYS = 60;

const DAY_MS = 24 * 60 * 60 * 1000;

export function publishStatus(publishDate: string | undefined, now: number = Date.now()): PublishStatus {
  if (!publishDate) return 'live';
  const at = Date.parse(publishDate);
  // An unreadable date must never hide a game.
  if (Number.isNaN(at)) return 'live';
  if (now < at) return 'soon';
  return now < at + NEW_BADGE_DAYS * DAY_MS ? 'new' : 'live';
}

export function isPlayable(publishDate: string | undefined, now: number = Date.now()): boolean {
  return publishStatus(publishDate, now) !== 'soon';
}
