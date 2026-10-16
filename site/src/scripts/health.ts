/**
 * What the API says about this visitor — `GET /api/health`: their country,
 * what the owner offers there (`availability`) and which of the site's own
 * parts are switched on (`features`). Asked once per page, whoever needs it.
 */
import { localGameOrigin } from './portals.ts';

export interface Health {
  /** ISO alpha-2, or null when the edge did not say (local dev). */
  country?: string | null;
  availability?: { langs?: { site?: string[] | null } };
  /** The owner's switches (`/admin/settings`). */
  features?: { paid?: boolean };
}

/** An address of the API as the page was built with it — or, on a developer's machine, the same path on the game's dev server, which passes `/api` on. */
export function apiAddress(built: string): string {
  const local = localGameOrigin();
  return local ? local + new URL(built, window.location.href).pathname : built;
}

/** Where the API answers `GET /api/health`. */
function endpoint(): string | null {
  const built = document.body.dataset.visitsApi;
  return built ? apiAddress(built) : null;
}

let asked: Promise<Health | null> | null = null;

/** The API's answer, or null — offline, the game is down, or the page names no API. */
export function health(): Promise<Health | null> {
  asked ??= (async () => {
    const api = endpoint();
    if (!api) return null;
    try {
      return (await (await fetch(api, { cache: 'no-store' })).json()) as Health;
    } catch {
      return null;
    }
  })();
  return asked;
}

/** The links to the page of prices (`[data-pricing-link]`) are built hidden and shown only while the paid mode is on. */
export async function showPricingLinks(): Promise<void> {
  if (!(await health())?.features?.paid) return;
  document.querySelectorAll<HTMLElement>('[data-pricing-link]').forEach((link) => (link.hidden = false));
}
