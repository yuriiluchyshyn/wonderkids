/**
 * The child's WORLD — a place that grows as they learn. Three things live in
 * it. Landmarks and residents are derived from progress; bought items are
 * remembered as keys beside the treasures — so no schema change was needed:
 *
 *  1. The theme's planet: buildings and decorations the child CHOOSES to
 *     exchange artifacts for, ending in the theme's "dream build".
 *  2. Lands of knowledge: every game owns a landmark that grows in four stages
 *     as the child climbs its path (or keeps playing a free-play game).
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

/** A landmark grows through this many stages. */
export const LANDMARK_STAGES = 4;
/** Levels a free-play game must be finished to reach each stage. */
export const FREE_PLAY_STAGE_AT = [1, 3, 6, 10] as const;

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

/**
 * 0 = not started … 4 = complete. A path game grows with the share of the
 * path behind the child; a free-play game with how often it has been played.
 */
export function landmarkStage({ free, steps, step, plays }: GameProgress): number {
  if (free) return FREE_PLAY_STAGE_AT.filter((at) => plays >= at).length;
  const done = Math.max(0, Math.min(steps, step) - 1);
  if (done === 0 && plays === 0) return 0;
  if (steps <= 1) return LANDMARK_STAGES;
  // Finishing the first level lays the foundation; the rest follow the path.
  return Math.min(LANDMARK_STAGES, 1 + Math.floor(((LANDMARK_STAGES - 1) * done) / (steps - 1)));
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

/** Levels a free-play game must be finished to reach each of its eight levels. */
export const FREE_PLAY_LEVEL_AT = [1, 3, 6, 10, 15, 21, 28, 36] as const;

/**
 * The level of a game's landmark, 0…8 — one level per planet. Level N takes
 * the N-th part of the game: an eighth of its path for each (so the whole
 * game is all eight), or ever more finished levels of a free-play game.
 */
export function landmarkLevel({ free, steps, step, plays }: GameProgress): number {
  if (free || steps <= 1) return FREE_PLAY_LEVEL_AT.filter((at) => plays >= at).length;
  const done = Math.max(0, Math.min(steps, step) - 1);
  const whole = steps - 1;
  let level = 0;
  while (level < PLANET_COUNT && done >= Math.max(1, Math.ceil((whole * (level + 1)) / PLANET_COUNT))) level += 1;
  return level;
}

/** Share of the games whose landmark must have reached a planet's level before leaving it. */
export const LANDS_SHARE = 0.6;
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
  /** Games whose landmark has this planet's level. */
  lands: Need;
  residents: Need;
  treasures: Need;
  /** All of it — the next planet (or, from the last one, the Sun) is open. */
  done: boolean;
}

const need = (have: number, wanted: number): Need => ({ have: Math.min(have, wanted), need: wanted, done: have >= wanted });

/**
 * What a planet asks for before the child may fly on: not the spaceport
 * alone, but nearly everything the planet has to give — its buildings, its
 * share of the lands of knowledge, residents and treasures.
 */
export function planetNeeds(input: {
  planet: number;
  itemsOwned: number;
  itemsTotal: number;
  spaceport: boolean;
  /** `landmarkLevel` of every game. */
  landLevels: readonly number[];
  gifts: number;
  treasuresFound: number;
  treasuresTotal: number;
}): PlanetNeeds {
  const { planet } = input;
  const built = need(input.itemsOwned, input.itemsTotal);
  const lands = need(input.landLevels.filter((level) => level >= planet).length, Math.ceil(input.landLevels.length * LANDS_SHARE));
  const residentsNeed = need(input.gifts, planet * RESIDENTS_PER_PLANET);
  const treasures = need(input.treasuresFound, Math.ceil((input.treasuresTotal * planet) / PLANET_COUNT));
  return {
    built,
    spaceport: input.spaceport,
    lands,
    residents: residentsNeed,
    treasures,
    done: built.done && input.spaceport && lands.done && residentsNeed.done && treasures.done,
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
