/**
 * What the owner offers in the visitor's country — set on `/admin/availability`,
 * resolved by the server for the country the request came from and told by
 * `GET /api/health` (`api/_lib/availability.js`):
 *
 * - **the languages of the game** — which may be chosen in the parents'
 *   cabinet, and which is offered to a visitor who has chosen none;
 * - **games and galaxies put away** — not in the hub, and their address
 *   answers «not found»;
 * - **games and galaxies marked «soon»** — shown, locked.
 *
 * A language already chosen stays: a family that set Ukrainian and went
 * travelling keeps its game. The last answer is kept on the device, so the
 * next visit starts with it instead of flashing what is about to go away.
 */
import { create } from 'zustand';
import { GALAXIES, type Galaxy } from '@/core/game/galaxies';
import { pathKey } from '@/core/child/progress/path';
import { LANG_CODES, isLang, type LangCode } from '@/core/language';
import { offerDeviceLang } from '@/core/translator/deviceLang';

export type ItemState = 'on' | 'soon' | 'hidden';

interface Listed {
  hidden: string[];
  soon: string[];
}

/** The server's answer for one country. */
export interface Availability {
  /** The languages offered, as the owner listed them; null — all. */
  langs: { site: string[] | null; game: string[] | null };
  /** Keys `${moduleId}:${subId}`. */
  games: Listed;
  /** Galaxy ids. */
  galaxies: Listed;
}

const OPEN: Availability = { langs: { site: null, game: null }, games: { hidden: [], soon: [] }, galaxies: { hidden: [], soon: [] } };
const STORAGE_KEY = 'pulsar-availability-v1';

const strings = (value: unknown): string[] => (Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []);
const listed = (value: unknown): Listed => {
  const raw = (value ?? {}) as Partial<Listed>;
  return { hidden: strings(raw.hidden), soon: strings(raw.soon) };
};

/** Whatever arrived (or was kept on the device) as an `Availability`; anything odd in it is simply open. */
function read(value: unknown): Availability {
  const raw = (value ?? {}) as { langs?: { site?: unknown; game?: unknown }; games?: unknown; galaxies?: unknown };
  const langs = (list: unknown): string[] | null => (Array.isArray(list) && list.length > 0 ? strings(list) : null);
  return { langs: { site: langs(raw.langs?.site), game: langs(raw.langs?.game) }, games: listed(raw.games), galaxies: listed(raw.galaxies) };
}

function remembered(): Availability {
  try {
    return read(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null'));
  } catch {
    return OPEN;
  }
}

export const useAvailability = create<Availability>(() => remembered());

/** The game's languages the owner offers here; all of them when the rule names none the game speaks. */
export function offeredGameLangs(availability: Availability): readonly LangCode[] {
  const allowed = (availability.langs.game ?? []).filter(isLang);
  return allowed.length > 0 ? LANG_CODES.filter((code) => allowed.includes(code)) : LANG_CODES;
}

/**
 * Asks the server, once at start-up, where the visitor is and what is offered
 * there; then offers the language of that country (unless one was chosen). A
 * failure leaves what the device remembered.
 */
export async function loadAvailability(base = ''): Promise<void> {
  try {
    const res = await fetch(`${base}/api/health`, { cache: 'no-store' });
    const { country, availability } = (await res.json()) as { country?: string | null; availability?: unknown };
    const next = read(availability);
    useAvailability.setState(next, true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* private mode: asked again next time */
    }
    offerDeviceLang(country, offeredGameLangs(next));
  } catch {
    // Offline or no API: keep the guess.
  }
}

const stateIn = (list: Listed, key: string): ItemState => (list.hidden.includes(key) ? 'hidden' : list.soon.includes(key) ? 'soon' : 'on');

/** A galaxy here: open, «soon», or put away. */
export const galaxyState = (availability: Availability, galaxyId: string): ItemState => stateIn(availability.galaxies, galaxyId);

/**
 * A game here. A game of a galaxy that is put away — or not open yet — is not
 * there either, whatever is said of the game itself.
 */
export function gameState(availability: Availability, moduleId: string, subId: string): ItemState {
  const galaxy = GALAXIES.find((g) => g.moduleId === moduleId);
  if (galaxy && galaxyState(availability, galaxy.id) !== 'on') return 'hidden';
  return stateIn(availability.games, pathKey(moduleId, subId));
}

/** The galaxies of the hub as they are offered here: those put away are gone, those marked «soon» are placeholders. */
export function useGalaxies(): Galaxy[] {
  const availability = useAvailability();
  const shown = GALAXIES.filter((g) => galaxyState(availability, g.id) !== 'hidden').map((g) => (galaxyState(availability, g.id) === 'soon' ? { ...g, comingSoon: true } : g));
  // A rule that puts every galaxy away would leave the hub with nothing to stand on.
  return shown.length > 0 ? shown : GALAXIES;
}

/** The languages a parent may choose here — and the one already chosen, wherever they are now. */
export function useGameLangChoices(chosen?: LangCode | null): readonly LangCode[] {
  const offered = offeredGameLangs(useAvailability());
  return LANG_CODES.filter((code) => offered.includes(code) || code === chosen);
}
