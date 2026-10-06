import type { TaskConfig, TaskInstance } from '@/core/kernel/types';
import type { Card, TangramPiece, TemplatePayload } from '@/core/templates/types';
import { perimeter } from '@/core/templates/validate';
import { pick, randInt, shuffle, uid } from '@/core/utils/random';
import { rewardForStep } from '../difficulty';

type Piece = Omit<TangramPiece, 'id'>;

const C = { red: '#ef4444', orange: '#f59e0b', yellow: '#facc15', green: '#22c55e', blue: '#3b82f6', purple: '#a855f7', brown: '#a16207', pink: '#ec4899' };

/** Silhouettes built from basic shapes on a 100×100 canvas (no overlaps). */
const FIGURES: { name: string; say: string; pieces: Piece[] }[] = [
  {
    name: 'будиночок',
    say: 'Це будиночок: квадратні стіни і трикутний дах.',
    pieces: [
      { shape: 'triangle', x: 50, y: 25, size: 46, color: C.red },
      { shape: 'square', x: 50, y: 68, size: 40, color: C.orange },
      { shape: 'circle', x: 86, y: 14, size: 16, color: C.yellow },
    ],
  },
  {
    name: 'ялинка',
    say: 'Це ялинка: два трикутники і маленький стовбур.',
    pieces: [
      { shape: 'triangle', x: 50, y: 22, size: 30, color: C.green },
      { shape: 'triangle', x: 50, y: 56, size: 38, color: C.green },
      { shape: 'rect', x: 50, y: 81, size: 20, color: C.brown },
    ],
  },
  {
    name: 'рибка',
    say: 'Це рибка: кругле тіло і трикутний хвостик.',
    pieces: [
      { shape: 'circle', x: 40, y: 54, size: 42, color: C.blue },
      { shape: 'triangle', x: 78, y: 54, size: 30, rotate: 270, color: C.orange },
      { shape: 'triangle', x: 40, y: 22, size: 18, color: C.orange },
    ],
  },
  {
    name: 'кораблик',
    say: 'Це кораблик: прямокутний корпус і трикутне вітрило.',
    pieces: [
      { shape: 'triangle', x: 50, y: 34, size: 42, color: C.pink },
      { shape: 'rect', x: 50, y: 72, size: 64, color: C.blue },
      { shape: 'circle', x: 86, y: 14, size: 16, color: C.yellow },
    ],
  },
  {
    name: 'сніговик',
    say: 'Це сніговик: три кола — маленьке, середнє і велике.',
    pieces: [
      { shape: 'circle', x: 50, y: 14, size: 20, color: C.blue },
      { shape: 'circle', x: 50, y: 40, size: 30, color: C.purple },
      { shape: 'circle', x: 50, y: 76, size: 40, color: C.pink },
    ],
  },
  {
    name: 'котик',
    say: 'Це котик: кругла голова, вушка-трикутники і квадратне тіло.',
    pieces: [
      { shape: 'triangle', x: 37, y: 11, size: 16, color: C.orange },
      { shape: 'triangle', x: 63, y: 11, size: 16, color: C.orange },
      { shape: 'circle', x: 50, y: 38, size: 36, color: C.orange },
      { shape: 'square', x: 50, y: 74, size: 34, color: C.brown },
    ],
  },
  {
    name: 'ракета',
    say: 'Це ракета: гострий ніс, два квадрати і крила-трикутники.',
    pieces: [
      { shape: 'triangle', x: 50, y: 14, size: 26, color: C.red },
      { shape: 'square', x: 50, y: 40, size: 26, color: C.blue },
      { shape: 'square', x: 50, y: 66, size: 26, color: C.purple },
      { shape: 'triangle', x: 27, y: 71, size: 18, color: C.orange },
      { shape: 'triangle', x: 73, y: 71, size: 18, color: C.orange },
    ],
  },
];

/** A random connected figure of `area` cells on a cols×rows grid. */
function randomFigure(area: number, cols: number, rows: number): number[] {
  const cells = new Set<number>([randInt(0, cols * rows - 1)]);
  let guard = 0;
  while (cells.size < area && guard < 400) {
    guard += 1;
    const from = pick([...cells]);
    const col = from % cols;
    const next = pick([from - cols, from + cols, col > 0 ? from - 1 : -1, col < cols - 1 ? from + 1 : -1]);
    if (next >= 0 && next < cols * rows) cells.add(next);
  }
  return [...cells].sort((a, b) => a - b);
}

/**
 * «Геометричний конструктор»: tangram silhouettes for the youngest (6–7 y),
 * then area on a grid and perimeter comparison (8–10 y).
 */
export function generateGeometry(config: TaskConfig): TaskInstance<TemplatePayload> {
  const { step } = config;
  const reward = rewardForStep(step) + 1;

  if (step <= 4) {
    // Simpler figures first; everything is in play by step 4.
    const figure = pick(FIGURES.slice(0, Math.min(FIGURES.length, 3 + step)));
    return {
      id: uid('tg'),
      key: `tangram:${figure.name}`,
      prompt: `Склади з фігур: ${figure.name}`,
      reward,
      outro: figure.say,
      payload: {
        template: 'UI_TANGRAM',
        figure: figure.name,
        pieces: figure.pieces.map((p, i) => ({ ...p, id: `p${i}` })),
        hint: 'Знайди контур такої самої форми і такого самого розміру.',
      },
    };
  }

  if (step <= 8) {
    const targetArea = randInt(3 + (step - 5), 6 + (step - 5) * 2);
    return {
      id: uid('ga'),
      key: `area:${targetArea}`,
      prompt: `Побудуй загін для овечки площею ${targetArea} клітинок`,
      reward,
      outro: `Чудовий загін! Його площа — ${targetArea} клітинок.`,
      payload: {
        template: 'UI_GRID_AREA',
        cols: 5,
        rows: 4,
        targetArea,
        hint: `Площа — це кількість клітинок. Зафарбуй рівно ${targetArea} клітинок поруч одна з одною.`,
      },
    };
  }

  // Same area, different outlines: which one needs the longest fence?
  const area = randInt(4, 6);
  const cols = 4;
  const rows = 4;
  for (let guard = 0; guard < 40; guard += 1) {
    const figures = Array.from({ length: 4 }, () => randomFigure(area, cols, rows));
    const lengths = figures.map((f) => perimeter(new Set(f), cols));
    const max = Math.max(...lengths);
    if (lengths.filter((l) => l === max).length !== 1 || new Set(lengths).size < 2) continue;
    const options: Card[] = figures.map((cells, i) => ({ id: `f${i}`, shape: { cols, rows, cells } }));
    return {
      id: uid('gp'),
      key: `perimeter:${figures.map((f) => f.join('.')).join('|')}`,
      prompt: 'Знайди фігуру з найбільшим периметром',
      reward,
      outro: `Так! Її периметр — ${max}: саме стільки сторін клітинок треба обійти.`,
      payload: {
        template: 'UI_GRID_CHOICE',
        cols: 2,
        options: shuffle(options),
        correctId: `f${lengths.indexOf(max)}`,
        hint: 'Периметр — це довжина паркану навколо фігури. Обійди кожну фігуру пальчиком і полічи сторони клітинок по краю.',
      },
    };
  }
  // Extremely unlikely fallback: a guaranteed line-vs-square comparison.
  return {
    id: uid('gp'),
    key: 'perimeter:line-vs-square',
    prompt: 'Знайди фігуру з найбільшим периметром',
    reward,
    payload: {
      template: 'UI_GRID_CHOICE',
      cols: 2,
      options: [
        { id: 'line', shape: { cols, rows, cells: [0, 1, 2, 3] } },
        { id: 'square', shape: { cols, rows, cells: [0, 1, 4, 5] } },
      ],
      correctId: 'line',
      hint: 'Периметр — це довжина паркану навколо фігури.',
    },
  };
}
