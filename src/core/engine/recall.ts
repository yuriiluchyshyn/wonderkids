/**
 * Spaced recall (see docs/level-design.md): a level of a path game is half new
 * material for the current step and half reminders of what the previous steps
 * taught, so nothing is learned once and then forgotten.
 *
 * Pure and free of `@/` imports so it runs under plain `node --test`.
 */

/** How many steps back a level reaches for its reminders. */
export const RECALL_WINDOW = 5;
/** Tasks in one level of a path game: half new, half recall. */
export const PATH_TASKS_PER_LEVEL = 10;
/** Share of a level given to the current step's own material. */
export const FRESH_SHARE = 0.5;

/** The earlier steps a level at `step` revisits, oldest first. */
export function recallSteps(step: number, window: number = RECALL_WINDOW): number[] {
  const steps: number[] = [];
  for (let s = Math.max(1, step - window); s < step; s += 1) steps.push(s);
  return steps;
}

/**
 * Builds one level from two already-shuffled lists: `fresh` (the current
 * step's tasks) and `recall` (earlier steps', most relevant first). Takes half
 * of each; when one side runs short the other fills in, so a level only
 * shrinks when the game truly has nothing more to ask. A question never
 * appears twice, and the two kinds alternate, starting with a new one.
 */
export function composeLevel<T>(fresh: readonly T[], recall: readonly T[], count: number, keyOf: (task: T) => string): T[] {
  const seen = new Set<string>();
  const unique = (list: readonly T[]) =>
    list.filter((task) => {
      const key = keyOf(task);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  const news = unique(fresh);
  const olds = unique(recall);

  const wantFresh = Math.ceil(count * FRESH_SHARE);
  const takeOld = Math.min(olds.length, Math.max(count - wantFresh, count - news.length));
  const takeNew = Math.min(news.length, count - takeOld);

  const level: T[] = [];
  for (let i = 0; i < Math.max(takeNew, takeOld); i += 1) {
    if (i < takeNew) level.push(news[i]);
    if (i < takeOld) level.push(olds[i]);
  }
  return level;
}
