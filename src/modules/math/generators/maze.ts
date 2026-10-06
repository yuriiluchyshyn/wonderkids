import type { TaskConfig, TaskInstance } from '@/core/kernel/types';
import type { NumberMazePayload } from '@/core/templates/types';
import { randInt, shuffle, uid } from '@/core/utils/random';
import { rewardForStep } from '../difficulty';

/** The divisor practised at each path step (easy tables first). */
const DIVISORS = [2, 5, 10, 3, 4, 3, 6, 4, 7, 8, 9, 6];
const SIZE = 4;

/** A random route from the top-left to the bottom-right corner (right/down). */
function randomRoute(): number[] {
  const moves = shuffle([...Array(SIZE - 1).fill('r'), ...Array(SIZE - 1).fill('d')]);
  const route = [0];
  let at = 0;
  for (const m of moves) {
    at += m === 'r' ? 1 : SIZE;
    route.push(at);
  }
  return route;
}

/**
 * «Числовий лабіринт» (8–10 y): run across the grid stepping only on numbers
 * divisible by k. On later steps the route is the k-times table in order.
 * Every cell off the route is NOT divisible by k, so there is one way through.
 */
export function generateMaze(config: TaskConfig): TaskInstance<NumberMazePayload> {
  const { step } = config;
  const k = DIVISORS[(step - 1) % DIVISORS.length];
  const inOrder = step > 6 && step % 2 === 0;
  const path = randomRoute();

  const multiples = inOrder
    ? path.map((_, i) => k * (i + 1))
    : shuffle(Array.from({ length: 12 }, (_, i) => k * (i + 1))).slice(0, path.length);

  const cells = Array.from({ length: SIZE * SIZE }, () => {
    let n = randInt(1, k * 12);
    while (n % k === 0) n += 1;
    return n;
  });
  path.forEach((cell, i) => {
    cells[cell] = multiples[i];
  });

  return {
    id: uid('mz'),
    key: `maze:${k}:${path.join('.')}:${inOrder}`,
    prompt: inOrder
      ? `Біжи по таблиці множення на ${k}: ${k}, ${k * 2}, ${k * 3} і далі`
      : `Біжи тільки по числах, які діляться на ${k}`,
    reward: rewardForStep(step) + 2,
    payload: {
      template: 'UI_NUMBER_MAZE',
      cols: SIZE,
      rows: SIZE,
      cells,
      path,
      hint: `Шукай сусідню клітинку з числом, яке ділиться на ${k} без остачі.`,
    },
  };
}
