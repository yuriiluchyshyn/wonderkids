/**
 * The learning "path" — a Duolingo-style ladder of difficulty steps that every
 * sub-category shares. The current step is the difficulty coefficient handed to
 * a module's task generator, so one mechanic scales smoothly from easiest to
 * "mega-hard". Progress is tracked per module+sub-category.
 */
export const TOTAL_STEPS = 50;

/** Storage key for a sub-category's path progress. */
export function pathKey(moduleId: string, subCategoryId: string): string {
  return `${moduleId}:${subCategoryId}`;
}

export function clampStep(step: number): number {
  return Math.min(TOTAL_STEPS, Math.max(1, Math.round(step)));
}
