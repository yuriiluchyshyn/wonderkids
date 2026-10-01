import type { SubCategory } from '@/core/kernel/types';

/**
 * The learning "path" — a Duolingo-style ladder of difficulty steps. Each
 * adventure (sub-category) can define its own number of steps; the current step
 * is the difficulty coefficient handed to a module's task generator, so one
 * mechanic scales smoothly from easiest to "mega-hard".
 */

/** Fallback length when an adventure doesn't specify its own. */
export const DEFAULT_STEPS = 30;

/** Absolute ceiling (used to clamp parent-entered milestone steps). */
export const MAX_STEPS = 200;

/** Steps for a given adventure. */
export function subSteps(sub: Pick<SubCategory, 'steps'>): number {
  return sub.steps ?? DEFAULT_STEPS;
}

/** Storage key for a sub-category's path progress. */
export function pathKey(moduleId: string, subCategoryId: string): string {
  return `${moduleId}:${subCategoryId}`;
}

export function clampStep(step: number, max: number = MAX_STEPS): number {
  return Math.min(max, Math.max(1, Math.round(step || 1)));
}
