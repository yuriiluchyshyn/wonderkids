import { shuffle } from '@/core/utils/random';

/**
 * Builds a set of multiple-choice options containing the correct answer plus
 * near-miss distractors. Touch-native, pre-reader friendly: the child taps a
 * big tile rather than typing. Guarantees uniqueness and non-negative values.
 */
export function buildNumberOptions(answer: number, count = 4, spread = 5): number[] {
  const options = new Set<number>([answer]);
  let guard = 0;
  while (options.size < count && guard < 50) {
    guard += 1;
    const delta = Math.floor(Math.random() * spread) + 1;
    const candidate = Math.random() < 0.5 ? answer - delta : answer + delta;
    if (candidate >= 0) options.add(candidate);
  }
  // Backfill if we somehow couldn't reach `count` (very small answers).
  let next = answer + 1;
  while (options.size < count) {
    options.add(next);
    next += 1;
  }
  return shuffle([...options]);
}
