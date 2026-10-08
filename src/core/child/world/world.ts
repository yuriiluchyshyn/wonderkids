/**
 * The child's WORLD — a place that grows as they learn. Three things live in
 * it. Residents are derived from progress; whatever the child exchanged
 * something for is remembered as a key beside the treasures — so no schema
 * change was needed:
 *
 *  1. The theme's planet: buildings and decorations the child CHOOSES to
 *     exchange artifacts for, ending in the theme's "dream build".
 *  2. Stations of knowledge: the same few stations on every planet, opened
 *     with KEYS OF KNOWLEDGE — a second currency, earned in any game. No
 *     station belongs to a game, so the catalog can grow freely.
 *  3. Inhabitants: each path gift (every 5th step) brings a new resident.
 *
 * Pure functions only (no React, no value imports) so it runs under `node --test`.
 */

export interface BuildingDef {
  id: string;
  name: string;
  emoji: string;
}

export interface Inhabitant {
  id: string;
  name: string;
  emoji: string;
}

/** What the ten town buildings cost, in order — a long, rising curve. */
export const BUILDING_COSTS = [30, 50, 80, 120, 160, 220, 300, 400, 500, 800] as const;
/** What the eight small decorations cost. */
export const DECOR_COSTS = [10, 15, 20, 25, 30, 40, 50, 60] as const;

export type ItemKind = 'building' | 'decor';

/**
 * The child's world is a solar system: eight planets, travelled from the
 * outermost inwards — the goal is the Sun. (Ours is the Milky Way; another
 * galaxy may open beyond the Sun one day.) Every planet has the same things to
 * build, one level higher and dearer than on the planet before.
 */
export const WORLD_PLANETS = ['neptune', 'uranus', 'saturn', 'jupiter', 'mars', 'earth', 'venus', 'mercury'] as const;
export type WorldPlanetId = (typeof WORLD_PLANETS)[number];
export const PLANET_COUNT = WORLD_PLANETS.length;
export const PLANET_NAMES: Record<WorldPlanetId, string> = {
  neptune: 'Нептун', uranus: 'Уран', saturn: 'Сатурн', jupiter: 'Юпітер', mars: 'Марс', earth: 'Земля', venus: 'Венера', mercury: 'Меркурій',
};
export const GALAXY_NAME = 'Чумацький Шлях';

/** The spaceport: the building that opens the way to the next planet. Not the dream build — that stays the very last. */
export const SPACEPORT_ID = 'sp';
export const SPACEPORT_COST = 650;
/** The theme's dream build: the final building of a planet. */
export const DREAM_ID = 'b9';

/** How much dearer everything is on planet `planet` (1-based) than on the first. */
export function planetFactor(planet: number): number {
  return 1 + 0.25 * (Math.max(1, Math.min(PLANET_COUNT, Math.floor(planet))) - 1);
}

/**
 * Item ids encode kind + position (`b3`, `d5`), and the price depends only on
 * that — never on the theme. So what a child has spent can be worked out from
 * the ids they own, without loading any theme's catalog.
 */
export function itemId(kind: ItemKind, index: number): string {
  return `${kind === 'building' ? 'b' : 'd'}${index}`;
}

export function itemCost(id: string, planet = 1): number {
  const scaled = (base: number) => Math.round(base * planetFactor(planet));
  if (id === SPACEPORT_ID) return scaled(SPACEPORT_COST);
  const index = Number(id.slice(1));
  if (!Number.isInteger(index) || index < 0) return 0;
  if (id[0] === 'b') return scaled(BUILDING_COSTS[index] ?? 0);
  if (id[0] === 'd') return scaled(DECOR_COSTS[index] ?? 0);
  return 0;
}

const OWNED_PREFIX = 'world:';

/**
 * Key under which a bought item is remembered (lives beside the treasures).
 * The first planet keeps the short form every child already has saved:
 * `world:<theme>:<id>`; further planets add their number — `world:<theme>:p3:<id>`.
 */
export function ownedKey(themeId: string, id: string, planet = 1): string {
  return planet <= 1 ? `${OWNED_PREFIX}${themeId}:${id}` : `${OWNED_PREFIX}${themeId}:p${planet}:${id}`;
}

/** What a saved key says was bought, or null when it is not a purchase. */
export function parseOwned(key: string): { themeId: string; planet: number; id: string } | null {
  if (!key.startsWith(OWNED_PREFIX)) return null;
  const parts = key.slice(OWNED_PREFIX.length).split(':');
  if (parts.length === 2) return { themeId: parts[0], planet: 1, id: parts[1] };
  const planet = Number(parts[1]?.slice(1));
  if (parts.length !== 3 || parts[1][0] !== 'p' || !Number.isInteger(planet)) return null;
  return { themeId: parts[0], planet, id: parts[2] };
}

/**
 * Selling gives back less than the item cost: this share of the price returns
 * to the purse, the rest is gone for good — so buying and selling over and
 * over slowly empties it. That is the lesson, and the child is told so.
 */
export const SELL_REFUND = 0.8;

/** What selling an item puts back into the purse. */
export function sellPrice(id: string, planet = 1): number {
  return Math.floor(itemCost(id, planet) * SELL_REFUND);
}

const LOSS_PREFIX = 'worldloss:';

/**
 * Key remembering the artifacts lost in one sale (kept beside the treasures,
 * like purchases). `stamp` only makes the key unique: two sales of the same
 * item must both count.
 */
export function lossKey(amount: number, stamp: string): string {
  return `${LOSS_PREFIX}${Math.max(0, Math.floor(amount))}:${stamp}`;
}

/** Artifacts no longer in the purse: what stands on the planets + what sales lost. */
export function spentOn(ownedKeys: readonly string[]): number {
  return ownedKeys.reduce((sum, key) => {
    if (key.startsWith(LOSS_PREFIX)) return sum + (Number(key.split(':')[1]) || 0);
    const bought = parseOwned(key);
    return bought ? sum + itemCost(bought.id, bought.planet) : sum;
  }, 0);
}

/** What the child can still spend: everything earned minus everything spent. */
export function balanceOf(artifacts: number, ownedKeys: readonly string[]): number {
  return Math.max(0, Math.floor(artifacts) - spentOn(ownedKeys));
}

export interface ShopItem extends BuildingDef {
  kind: ItemKind;
  cost: number;
}

export type ItemStatus =
  | 'owned'
  /** Enough artifacts — can be built right now. */
  | 'affordable'
  /** Not enough artifacts yet. */
  | 'saving'
  /** The dream build: every other building has to stand first. */
  | 'locked';

export interface ItemState {
  item: ShopItem;
  status: ItemStatus;
  /** Artifacts still missing (0 unless `saving`). */
  missing: number;
}

/**
 * The state of every item of one planet. The dream build (`DREAM_ID`) unlocks
 * only when all the other buildings — the spaceport among them — are owned:
 * it is the finale.
 */
export function shopState(items: readonly ShopItem[], owned: ReadonlySet<string>, balance: number): ItemState[] {
  const buildings = items.filter((i) => i.kind === 'building');
  const dream = buildings.find((b) => b.id === DREAM_ID) ?? buildings[buildings.length - 1];
  const othersBuilt = buildings.every((b) => b === dream || owned.has(b.id));

  return items.map((item) => {
    if (owned.has(item.id)) return { item, status: 'owned', missing: 0 };
    if (item === dream && !othersBuilt) return { item, status: 'locked', missing: 0 };
    if (balance >= item.cost) return { item, status: 'affordable', missing: 0 };
    return { item, status: 'saving', missing: item.cost - balance };
  });
}

export interface GameProgress {
  /** Free-play game (no path). */
  free: boolean;
  /** Path length (ignored for free play). */
  steps: number;
  /** Stored frontier step, 1-based; 0/undefined = never opened. */
  step: number;
  /** Levels finished in this game. */
  plays: number;
}

// ------------------------------------------------------- Keys of knowledge —

/**
 * Keys of knowledge («ключі знань») are the world's second currency. A key is
 * earned for every path step passed for the first time — in ANY game — and
 * for the first levels of a free-play game. Keys do not know which game they
 * came from: thirty new games are simply thirty more places to earn them, and
 * what they open (stations, later further planets and galaxies, or a share in
 * something a group of children opens together) never has to follow the catalog.
 */
export const KEYS_PER_FREE_GAME = 20;

/** Every key the child has earned so far. Replaying a step that is already passed earns none. */
export function keysEarned(games: readonly GameProgress[]): number {
  return games.reduce(
    (sum, g) => sum + (g.free ? Math.min(KEYS_PER_FREE_GAME, Math.max(0, g.plays)) : Math.max(0, Math.min(g.steps, g.step) - 1)),
    0,
  );
}

/** What the stations of a planet cost, in keys, in order. */
export const STATION_COSTS = [3, 5, 7, 9, 12, 15] as const;
export const STATION_COUNT = STATION_COSTS.length;

export function stationId(index: number): string {
  return `k${index}`;
}

/** Like buildings, a station is dearer on every next planet. */
export function stationCost(id: string, planet = 1): number {
  const index = Number(id.slice(1));
  if (id[0] !== 'k' || !Number.isInteger(index)) return 0;
  return Math.round((STATION_COSTS[index] ?? 0) * planetFactor(planet));
}

const STATION_PREFIX = 'know:';

/**
 * Key under which an opened station is remembered (beside the treasures, like
 * purchases). It names no theme: knowledge stays with the child whatever the
 * world is dressed as.
 */
export function stationKey(id: string, planet = 1): string {
  return `${STATION_PREFIX}p${planet}:${id}`;
}

export function parseStation(key: string): { planet: number; id: string } | null {
  if (!key.startsWith(STATION_PREFIX)) return null;
  const [where, id, ...rest] = key.slice(STATION_PREFIX.length).split(':');
  const planet = Number(where?.slice(1));
  if (rest.length > 0 || where?.[0] !== 'p' || !Number.isInteger(planet) || !id) return null;
  return { planet, id };
}

/** Keys already exchanged for stations. */
export function keysSpent(ownedKeys: readonly string[]): number {
  return ownedKeys.reduce((sum, key) => {
    const station = parseStation(key);
    return station ? sum + stationCost(station.id, station.planet) : sum;
  }, 0);
}

/** Keys the child can still exchange. */
export function keyBalance(earned: number, ownedKeys: readonly string[]): number {
  return Math.max(0, Math.floor(earned) - keysSpent(ownedKeys));
}

/** A gift (and with it a new inhabitant) every 5th step of a path. */
export const GIFT_EVERY_STEPS = 5;

export function giftsEarned(games: readonly GameProgress[]): number {
  return games.reduce(
    (sum, g) => (g.free ? sum : sum + Math.floor(Math.max(0, Math.min(g.steps, g.step) - 1) / GIFT_EVERY_STEPS)),
    0,
  );
}

/** The residents who have moved in so far (each of the theme's list, once). */
export function residents<T>(all: readonly T[], gifts: number): T[] {
  return all.slice(0, Math.max(0, Math.min(all.length, gifts)));
}

/** The resident a given gift brings (cycles once the whole list has moved in). */
export function residentForGift<T>(all: readonly T[], giftNumber: number): T | undefined {
  if (all.length === 0 || giftNumber <= 0) return undefined;
  return all[(giftNumber - 1) % all.length];
}

// ------------------------------------------------------------ The solar system —

/** Share of a planet's stations of knowledge that must be open before leaving it. */
export const STATIONS_SHARE = 0.6;
/** Residents (gifts earned) a planet asks for, per planet travelled. */
export const RESIDENTS_PER_PLANET = 4;

/** One line of the "before you fly on" list: how much there is and how much is needed. */
export interface Need {
  have: number;
  need: number;
  done: boolean;
}

export interface PlanetNeeds {
  /** Everything of the planet built: buildings, the dream build, decorations. */
  built: Need;
  spaceport: boolean;
  /** Stations of knowledge opened on this planet. */
  stations: Need;
  residents: Need;
  treasures: Need;
  /** All of it — the next planet (or, from the last one, the Sun) is open. */
  done: boolean;
}

const need = (have: number, wanted: number): Need => ({ have: Math.min(have, wanted), need: wanted, done: have >= wanted });

/**
 * What a planet asks for before the child may fly on: not the spaceport
 * alone, but nearly everything the planet has to give — its buildings, most
 * of its stations of knowledge, residents and treasures.
 */
export function planetNeeds(input: {
  planet: number;
  itemsOwned: number;
  itemsTotal: number;
  spaceport: boolean;
  /** Stations of knowledge opened on this planet. */
  stationsOpen: number;
  gifts: number;
  treasuresFound: number;
  treasuresTotal: number;
}): PlanetNeeds {
  const { planet } = input;
  const built = need(input.itemsOwned, input.itemsTotal);
  const stations = need(input.stationsOpen, Math.ceil(STATION_COUNT * STATIONS_SHARE));
  const residentsNeed = need(input.gifts, planet * RESIDENTS_PER_PLANET);
  const treasures = need(input.treasuresFound, Math.ceil((input.treasuresTotal * planet) / PLANET_COUNT));
  return {
    built,
    spaceport: input.spaceport,
    stations,
    residents: residentsNeed,
    treasures,
    done: built.done && input.spaceport && stations.done && residentsNeed.done && treasures.done,
  };
}

/**
 * The furthest planet (1-based) the child may build on: each planet opens
 * when the one before it is done. A planet with something already standing on
 * it stays open even if a building further back is later sold.
 */
export function frontierPlanet(done: readonly boolean[], started: readonly boolean[]): number {
  let frontier = 1;
  for (let planet = 2; planet <= PLANET_COUNT; planet += 1) {
    if (done[planet - 2] || started[planet - 1]) frontier = planet;
    else break;
  }
  return frontier;
}
