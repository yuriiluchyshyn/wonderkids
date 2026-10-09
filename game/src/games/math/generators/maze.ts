import type { LangCode } from '@/core/language';
import { mathTexts } from '../grammar';
import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import type { NumberMazePayload } from '@/core/game/templates/types';
import { pick, randInt, shuffle, uid } from '@/core/utils/random';
import { rewardForStep } from '../difficulty';

/** The divisor practised at each path step (easy tables first). */
const DIVISORS = [2, 5, 10, 3, 4, 3, 6, 4, 7, 8, 9, 6, 3, 4, 6, 8];
/** Path length: one step per entry above. */
export const MAZE_STEPS = DIVISORS.length;

/**
 * How the maze grows along the path:
 *   1–4    4×4, one way through
 *   5–8    5×5, one way through
 *   9–12   6×6 with side corridors that end in a dead end — turn back
 *   13–16  the same, and negative numbers join in
 */
const FIRST_5X5 = 5;
const FIRST_6X6 = 9;
const FIRST_NEGATIVE = 13;

export function mazeSize(step: number): number {
  if (step >= FIRST_6X6) return 6;
  return step >= FIRST_5X5 ? 5 : 4;
}

/** Child-level explanation of what is new at this point of the path. */
export function mazeIntro(step: number, base: string | undefined, lang?: LangCode): string | undefined {
  const T = mathTexts(lang).maze;
  if (step >= FIRST_NEGATIVE) {
    return `${base}${T.negatives}`;
  }
  if (step >= FIRST_6X6) {
    return `${base}${T.deadEnds}`;
  }
  return base;
}

/** Side-by-side neighbours of a cell on a `size`×`size` grid. */
function neighbours(cell: number, size: number): number[] {
  const out: number[] = [];
  const col = cell % size;
  if (cell >= size) out.push(cell - size);
  if (cell < size * (size - 1)) out.push(cell + size);
  if (col > 0) out.push(cell - 1);
  if (col < size - 1) out.push(cell + 1);
  return out;
}

/** A random route from the top-left to the bottom-right corner (right/down). */
function randomRoute(size: number): number[] {
  const moves = shuffle([...Array(size - 1).fill('r'), ...Array(size - 1).fill('d')]);
  const route = [0];
  let at = 0;
  for (const m of moves) {
    at += m === 'r' ? 1 : size;
    route.push(at);
  }
  return route;
}

/**
 * Side corridors off the route, each two or three cells long and ending in a
 * dead end. A corridor cell touches no walkable cell except the one it grew
 * from, so a corridor can never become a shortcut or a second way through.
 */
function deadEnds(route: number[], size: number, count: number): number[] {
  const walkable = new Set(route);
  const open: number[] = [];
  // Never branch off the last cells: a corridor beside the finish fools no one.
  const starts = shuffle(route.slice(1, -2));

  for (const start of starts) {
    if (count <= 0) break;
    const corridor: number[] = [];
    let at = start;
    const length = randInt(2, 3);
    while (corridor.length < length) {
      const taken = new Set([...walkable, ...corridor]);
      const options = neighbours(at, size).filter(
        (n) => !taken.has(n) && neighbours(n, size).every((m) => m === at || !taken.has(m)),
      );
      if (options.length === 0) break;
      at = pick(options);
      corridor.push(at);
    }
    if (corridor.length < 2) continue;
    corridor.forEach((cell) => walkable.add(cell));
    open.push(...corridor);
    count -= 1;
  }
  return open;
}

/**
 * «Числовий лабіринт» (8–10 y): run across the grid stepping only on numbers
 * divisible by k. Every cell that is neither on the route nor in a dead-end
 * corridor is NOT divisible by k. On some steps the route is the k-times
 * table in order.
 */
export function generateMaze(config: TaskConfig): TaskInstance<NumberMazePayload> {
  const T = mathTexts(config.lang).maze;
  const { step } = config;
  const k = DIVISORS[(step - 1) % DIVISORS.length];
  const size = mazeSize(step);
  const negative = step >= FIRST_NEGATIVE;
  const inOrder = !negative && step > 6 && step % 2 === 0;
  const path = randomRoute(size);
  const open = size >= 6 ? deadEnds(path, size, 2) : [];

  // Enough different multiples for the route and the corridors.
  const top = Math.max(12, path.length + open.length + 2);
  const table = Array.from({ length: top }, (_, i) => k * (i + 1));
  const multiples = shuffle(negative ? [...table.slice(0, 12), ...table.slice(0, 12).map((n) => -n)] : table);

  const cells = Array.from({ length: size * size }, () => {
    let n = negative ? randInt(-k * 12, k * 12) : randInt(1, k * 12);
    while (n % k === 0) n += 1;
    return n;
  });
  path.forEach((cell, i) => {
    cells[cell] = inOrder ? k * (i + 1) : multiples[i];
  });
  open.forEach((cell, i) => {
    cells[cell] = multiples[path.length + i];
  });

  return {
    id: uid('mz'),
    key: `maze:${k}:${size}:${path.join('.')}:${inOrder}`,
    prompt: inOrder ? T.table(k) : T.divisible(k),
    reward: rewardForStep(step) + 2,
    payload: {
      template: Mechanics.NumberMaze,
      cols: size,
      rows: size,
      cells,
      path,
      open,
      divisor: k,
      hint: T.hint(k, open.length > 0, negative),
    },
  };
}
