import type { Theme, ThemeId, Treasure } from '@/core/theme/theme.types';

/**
 * Treasure hunt: besides the progression gifts (🎀/🎁/🏆) that sit on every
 * 5th/10th/final step, some steps hide a themed treasure chest. Finishing a
 * session on a chest step springs the chest open and reveals a random, not-yet
 * collected treasure that flies into the child's collection.
 *
 * Which steps those are is `pathStops.ts`'s business — the one place that
 * knows what waits on a step.
 */

export { hasChest } from './pathStops.ts';

/** Fully-qualified id for a treasure, namespaced by theme. */
export function treasureKey(themeId: ThemeId, treasureId: string): string {
  return `${themeId}:${treasureId}`;
}

/** The treasures of a theme the child has NOT found yet. */
export function uncollectedTreasures(theme: Theme, collected: string[]): Treasure[] {
  const owned = new Set(collected);
  return theme.treasures.filter((t) => !owned.has(treasureKey(theme.id, t.id)));
}

/**
 * Pick the treasure revealed by a chest: a random one the child is still
 * missing, or (once the set is complete) any random treasure as a bonus. The
 * second return value is whether this is a brand-new find for the collection.
 */
export function pickChestTreasure(
  theme: Theme,
  collected: string[],
): { treasure: Treasure; isNew: boolean } | null {
  if (theme.treasures.length === 0) return null;
  const missing = uncollectedTreasures(theme, collected);
  if (missing.length > 0) {
    const treasure = missing[Math.floor(Math.random() * missing.length)];
    return { treasure, isNew: true };
  }
  const treasure = theme.treasures[Math.floor(Math.random() * theme.treasures.length)];
  return { treasure, isNew: false };
}
