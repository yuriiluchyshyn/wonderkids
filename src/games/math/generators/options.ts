import { num } from '@/core/lang/numbers';
import { shuffle } from '@/core/utils/random';

/**
 * Builds a set of multiple-choice options containing the correct answer plus
 * near-miss distractors. Touch-native, pre-reader friendly: the child taps a
 * big tile rather than typing. Guarantees uniqueness and non-negative values.
 */
export function buildNumberOptions(answer: number, count = 9, spread = 5): number[] {
  const options = new Set<number>([answer]);

  // Anti-guessing: lead with the classic near-miss deviations (±1, ±2, ±10)
  // the Tech Spec (FR-GAME-01) calls out — these are the mistakes a child makes
  // when actually calculating (off-by-one, place-value slip), so a blind tap is
  // never obviously right. Shuffled so the plausible traps aren't predictable.
  const biased = shuffle([1, 2, 10, 1, 2]);
  for (const delta of biased) {
    if (options.size >= count) break;
    const candidate = Math.random() < 0.5 ? answer - delta : answer + delta;
    if (candidate >= 0) options.add(candidate);
  }

  // Fill the rest with wider near-misses so the grid is full and varied.
  let guard = 0;
  while (options.size < count && guard < 80) {
    guard += 1;
    const delta = Math.floor(Math.random() * spread) + 1;
    const candidate = Math.random() < 0.5 ? answer - delta : answer + delta;
    if (candidate >= 0) options.add(candidate);
  }

  // Backfill if we still couldn't reach `count` (very small answers near 0).
  let next = answer + 1;
  while (options.size < count) {
    options.add(next);
    next += 1;
  }

  return shuffle([...options]);
}

/** «2 однакові купки», «5 однакових купок», «1 купка» — the number marked feminine for the voice. */
export function heaps(n: number): string {
  const ones = n % 10;
  const tens = n % 100;
  if (ones === 1 && tens !== 11) return `${num(n, 'f')} купка`;
  return ones >= 2 && ones <= 4 && !(tens >= 12 && tens <= 14) ? `${num(n, 'f')} однакові купки` : `${num(n, 'f')} однакових купок`;
}
