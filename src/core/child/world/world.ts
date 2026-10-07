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
 * Item ids encode kind + position (`b3`, `d5`), and the price depends only on
 * that — never on the theme. So what a child has spent can be worked out from
 * the ids they own, without loading any theme's catalog.
 */
export function itemId(kind: ItemKind, index: number): string {
  return `${kind === 'building' ? 'b' : 'd'}${index}`;
}

export function itemCost(id: string): number {
  const index = Number(id.slice(1));
  if (!Number.isInteger(index) || index < 0) return 0;
  if (id[0] === 'b') return BUILDING_COSTS[index] ?? 0;
  if (id[0] === 'd') return DECOR_COSTS[index] ?? 0;
  return 0;
}

const OWNED_PREFIX = 'world:';

/** Key under which a bought item is remembered (lives beside the treasures). */
export function ownedKey(themeId: string, id: string): string {
  return `${OWNED_PREFIX}${themeId}:${id}`;
}

/**
 * Selling gives back less than the item cost: this share of the price returns
 * to the purse, the rest is gone for good — so buying and selling over and
 * over slowly empties it. That is the lesson, and the child is told so.
 */
export const SELL_REFUND = 0.8;

/** What selling an item puts back into the purse. */
export function sellPrice(id: string): number {
  return Math.floor(itemCost(id) * SELL_REFUND);
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
    if (!key.startsWith(OWNED_PREFIX)) return sum;
    return sum + itemCost(key.slice(key.lastIndexOf(':') + 1));
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
 * The state of every item of one theme's world. The LAST building is the dream
 * build and unlocks only when all the others are owned — it is the finale.
 */
export function shopState(items: readonly ShopItem[], owned: ReadonlySet<string>, balance: number): ItemState[] {
  const buildings = items.filter((i) => i.kind === 'building');
  const dream = buildings[buildings.length - 1];
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
