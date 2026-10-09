import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import type { Card, TangramPiece, TemplatePayload } from '@/core/game/templates/types';
import { perimeter } from '@/core/game/templates/validate';
import { spoken, written } from '@/core/lang';
import { pick, randInt, shuffle, uid } from '@/core/utils/random';
import type { LangCode } from '@/core/lang';
import { rewardForStep } from '../difficulty';
import { mathTexts, type MathTexts } from '../lang';
import { buildNumberOptions } from './options';

type Piece = Omit<TangramPiece, 'id'>;

const C = { red: '#ef4444', orange: '#f59e0b', yellow: '#facc15', green: '#22c55e', blue: '#3b82f6', purple: '#a855f7', brown: '#a16207', pink: '#ec4899' };

/** A picture built of shapes. What it is called and what is told about it is the language's (`geometry.figures`, in the order of `FIGURES`). */
interface Figure {
  /** Path step that introduces it: more pieces and turned pieces come later. */
  level: number;
  pieces: Piece[];
}

const fig = (level: number, pieces: Piece[]): Figure => ({ level, pieces });
const tri = (x: number, y: number, size: number, color: string, rotate?: number): Piece => ({ shape: 'triangle', x, y, size, color, rotate });
const sq = (x: number, y: number, size: number, color: string): Piece => ({ shape: 'square', x, y, size, color });
const ci = (x: number, y: number, size: number, color: string): Piece => ({ shape: 'circle', x, y, size, color });
const re = (x: number, y: number, size: number, color: string, rotate?: number): Piece => ({ shape: 'rect', x, y, size, color, rotate });

/**
 * Silhouettes built from basic shapes on a 100×100 canvas (no overlaps), three
 * per level. A figure's `level` is its difficulty — the path step it appears
 * on: two pieces at level 1, up to eight (some turned) at level 8.
 */
export const FIGURES: Figure[] = [
  // ---- level 1: two pieces
  fig(1, [ci(50, 28, 36, C.pink), tri(50, 66, 40, C.orange, 180)]),
  fig(1, [tri(50, 30, 56, C.red), sq(50, 76, 30, C.yellow)]),
  fig(1, [ci(50, 30, 40, C.purple), re(50, 72, 40, C.brown, 90)]),
  // ---- level 2: three pieces
  fig(2, [tri(50, 25, 46, C.red), sq(50, 68, 40, C.orange), ci(86, 14, 16, C.yellow)]),
  fig(2, [ci(50, 14, 20, C.blue), ci(50, 40, 30, C.purple), ci(50, 76, 40, C.pink)]),
  fig(2, [ci(50, 50, 36, C.pink), tri(20, 50, 24, C.yellow, 90), tri(80, 50, 24, C.yellow, 270)]),
  // ---- level 3: three pieces, different shapes
  fig(3, [tri(50, 22, 30, C.green), tri(50, 56, 38, C.green), re(50, 81, 20, C.brown)]),
  fig(3, [ci(40, 54, 42, C.blue), tri(78, 54, 30, C.orange, 270), tri(40, 22, 18, C.orange)]),
  fig(3, [tri(50, 34, 42, C.pink), re(50, 72, 64, C.blue), ci(86, 14, 16, C.yellow)]),
  // ---- level 4: four pieces
  fig(4, [tri(37, 11, 16, C.orange), tri(63, 11, 16, C.orange), ci(50, 38, 36, C.orange), sq(50, 74, 34, C.brown)]),
  fig(4, [re(40, 50, 60, C.blue), sq(84, 54, 24, C.red), ci(28, 78, 18, C.brown), ci(72, 78, 18, C.brown)]),
  fig(4, [ci(26, 34, 20, C.pink), ci(50, 34, 22, C.yellow), ci(74, 34, 20, C.pink), re(50, 70, 36, C.green, 90)]),
  // ---- level 5: four–five pieces
  fig(5, [tri(50, 14, 26, C.red), sq(50, 40, 26, C.blue), sq(50, 66, 26, C.purple), tri(27, 71, 18, C.orange), tri(73, 71, 18, C.orange)]),
  fig(5, [re(38, 50, 56, C.green), sq(80, 44, 26, C.red), ci(24, 76, 16, C.brown), ci(50, 76, 16, C.brown), ci(80, 74, 20, C.brown)]),
  fig(5, [ci(50, 28, 14, C.brown), ci(50, 50, 16, C.brown), tri(26, 50, 30, C.purple, 90), tri(74, 50, 30, C.purple, 270)]),
  // ---- level 6: six pieces
  fig(6, [sq(50, 18, 24, C.blue), sq(50, 52, 36, C.purple), re(20, 48, 20, C.orange), re(80, 48, 20, C.orange), sq(38, 84, 16, C.blue), sq(62, 84, 16, C.blue)]),
  fig(6, [re(50, 74, 80, C.brown), sq(20, 38, 22, C.orange), sq(50, 40, 22, C.yellow), sq(80, 38, 22, C.orange), tri(20, 14, 22, C.red), tri(80, 14, 22, C.red)]),
  fig(6, [ci(28, 12, 16, C.brown), ci(72, 12, 16, C.brown), ci(50, 34, 36, C.orange), ci(50, 74, 40, C.orange), ci(20, 70, 16, C.brown), ci(80, 70, 16, C.brown)]),
  // ---- level 7: six pieces, several turned
  fig(7, [ci(44, 62, 44, C.yellow), ci(72, 30, 26, C.yellow), tri(93, 30, 12, C.orange, 90), tri(12, 56, 16, C.orange, 270), tri(36, 92, 12, C.orange), tri(54, 92, 12, C.orange)]),
  fig(7, [re(50, 44, 88, C.yellow), ci(24, 78, 18, C.brown), ci(50, 78, 18, C.brown), ci(76, 78, 18, C.brown), sq(30, 12, 16, C.red), sq(60, 12, 16, C.blue)]),
  fig(7, [ci(50, 14, 22, C.pink), sq(50, 44, 30, C.blue), re(22, 40, 22, C.pink), re(78, 40, 22, C.pink), re(40, 78, 30, C.purple, 90), re(60, 78, 30, C.purple, 90)]),
  // ---- level 8: seven–eight pieces
  fig(8, [re(50, 74, 80, C.brown), sq(20, 38, 22, C.orange), sq(50, 40, 22, C.yellow), sq(80, 38, 22, C.orange), tri(20, 14, 22, C.red), tri(80, 14, 22, C.red), tri(50, 14, 16, C.blue, 90)]),
  fig(8, [re(38, 50, 56, C.green), sq(80, 44, 26, C.red), ci(24, 76, 16, C.brown), ci(50, 76, 16, C.brown), ci(80, 74, 20, C.brown), sq(30, 26, 14, C.purple), ci(30, 9, 12, C.blue)]),
  fig(8, [re(46, 56, 56, C.green), sq(78, 34, 16, C.green), re(84, 18, 24, C.green), tri(9, 56, 16, C.green, 270), sq(30, 80, 16, C.brown), sq(62, 80, 16, C.brown), tri(36, 34, 14, C.orange), tri(56, 34, 14, C.orange)]),
];

/** The last path step that introduces a figure; grids and fences follow. */
const FIGURE_STEPS = Math.max(...FIGURES.map((f) => f.level));
/** Total path length — keep `steps` of the game in `math/index.ts` equal to it. */
export const GEOMETRY_STEPS = FIGURE_STEPS + 12;

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

const withIds = (pieces: Piece[]) => pieces.map((p, i) => ({ ...p, id: `p${i}` }));

/** Build the figure from its pieces. */
function buildTask(figure: Figure, reward: number, T: MathTexts['geometry']): TaskInstance<TemplatePayload> {
  const at = FIGURES.indexOf(figure);
  const [name, say] = T.figures[at];
  return {
    id: uid('tg'),
    key: `tangram:${at}`,
    prompt: T.build(name),
    reward,
    outro: say,
    payload: {
      template: Mechanics.Tangram,
      figure: name,
      pieces: withIds(figure.pieces),
      hint: T.buildHint,
    },
  };
}

/** Look at the finished figure and count one kind of shape in it. */
function countTask(figure: Figure, reward: number, T: MathTexts['geometry']): TaskInstance<TemplatePayload> {
  const at = FIGURES.indexOf(figure);
  const [name, say] = T.figures[at];
  const shape = pick([...new Set(figure.pieces.map((p) => p.shape))]);
  const count = figure.pieces.filter((p) => p.shape === shape).length;
  const options = [...new Set([count, count + 1, Math.max(0, count - 1), count + 2])].slice(0, 4).sort((x, y) => x - y);
  return {
    id: uid('tc'),
    key: `count:${at}:${shape}`,
    prompt: T.count(name, shape),
    reward,
    outro: say,
    payload: {
      template: Mechanics.GridChoice,
      cols: 2,
      stimulus: { pieces: withIds(figure.pieces) },
      options: options.map((n) => ({ id: `n${n}`, glyphs: [String(n)] })),
      correctId: `n${count}`,
      hint: T.countHint(shape),
    },
  };
}

const figureCard = (cells: number[], cols: number, rows: number) => ({ shape: { cols, rows, cells } });

/** «Яка площа фігури?» — count the coloured cells. */
function areaReadTask(min: number, max: number, reward: number, T: MathTexts['geometry']): TaskInstance<TemplatePayload> {
  const cols = 5;
  const rows = 4;
  const cells = randomFigure(randInt(min, max), cols, rows);
  const area = cells.length;
  return {
    id: uid('gr'),
    key: `area-read:${cells.join('.')}`,
    prompt: T.areaRead,
    reward,
    outro: T.areaIs(area),
    payload: {
      template: Mechanics.GridChoice,
      cols: 2,
      stimulus: figureCard(cells, cols, rows),
      options: buildNumberOptions(area, 4, 2).map((n) => ({ id: `n${n}`, glyphs: [String(n)] })),
      correctId: `n${area}`,
      hint: T.areaHint,
    },
  };
}

/** How many animals there are to build a pen for (`geometry.pens`). */
const PENS = 6;

/** Build a pen of a given area by colouring cells. */
function areaBuildTask(min: number, max: number, reward: number, T: MathTexts['geometry']): TaskInstance<TemplatePayload> {
  const targetArea = randInt(min, max);
  const id = uid('ga');
  // A count is shown as a digit and said as a word in the right form: the task carries both.
  const text = T.pen(T.pens[randInt(0, PENS - 1)], targetArea);
  return {
    id,
    key: `area:${targetArea}`,
    prompt: written(text),
    speak: spoken(text),
    reward,
    outro: T.penDone(targetArea),
    payload: {
      template: Mechanics.GridArea,
      cols: 5,
      rows: 4,
      targetArea,
      hint: T.penHint(targetArea),
    },
  };
}

/** «Який периметр фігури?» — walk around it and count cell sides. */
function perimeterReadTask(min: number, max: number, reward: number, T: MathTexts['geometry']): TaskInstance<TemplatePayload> {
  const cols = 4;
  const rows = 4;
  const cells = randomFigure(randInt(min, max), cols, rows);
  const length = perimeter(new Set(cells), cols);
  return {
    id: uid('pr'),
    key: `perimeter-read:${cells.join('.')}`,
    prompt: T.perimeterRead,
    reward,
    outro: T.perimeterIs(length),
    payload: {
      template: Mechanics.GridChoice,
      cols: 2,
      stimulus: figureCard(cells, cols, rows),
      options: buildNumberOptions(length, 4, 3).map((n) => ({ id: `n${n}`, glyphs: [String(n)] })),
      correctId: `n${length}`,
      hint: T.perimeterHint,
    },
  };
}

/** Same area, different outlines: which one needs the longest fence? */
function longestFenceTask(min: number, max: number, reward: number, T: MathTexts['geometry']): TaskInstance<TemplatePayload> {
  const area = randInt(min, max);
  const cols = 4;
  const rows = 4;
  for (let guard = 0; guard < 40; guard += 1) {
    const figures = Array.from({ length: 4 }, () => randomFigure(area, cols, rows));
    const lengths = figures.map((f) => perimeter(new Set(f), cols));
    const longest = Math.max(...lengths);
    if (lengths.filter((l) => l === longest).length !== 1) continue;
    const options: Card[] = figures.map((cells, i) => ({ id: `f${i}`, shape: { cols, rows, cells } }));
    return {
      id: uid('gp'),
      key: `perimeter:${figures.map((f) => f.join('.')).join('|')}`,
      prompt: T.longest,
      reward,
      outro: T.longestIs(longest),
      payload: {
        template: Mechanics.GridChoice,
        cols: 2,
        options: shuffle(options),
        correctId: `f${lengths.indexOf(longest)}`,
        hint: T.longestHint,
      },
    };
  }
  // Could not get a single winner (very unlikely): ask about one figure instead.
  return perimeterReadTask(min, max, reward, T);
}

/** What the game explains when the path reaches a new kind of task. */
export function geometryIntro(step: number, lang?: LangCode): string {
  const { intro } = mathTexts(lang).geometry;
  if (step <= FIGURE_STEPS) return intro.figures;
  if (step <= FIGURE_STEPS + 6) return intro.area;
  return intro.perimeter;
}

/**
 * «Геометричний конструктор». Every step has its own difficulty:
 *
 *   1–8    figures of that level (two pieces → eight): build them, and count
 *          the shapes they are made of
 *   9–11   read the area of a figure on a grid (3–5 → 6–9 cells)
 *   12–14  build a pen of a given area, mixed with harder area reading
 *   15–17  read the perimeter of a figure
 *   18–20  which of four figures has the longest fence (+ perimeter reading)
 *
 * Recall comes for free: the shell also draws this generator at the previous
 * five steps (`core/game/engine/recall`), so earlier figures keep coming back.
 */
export function generateGeometry(config: TaskConfig): TaskInstance<TemplatePayload> {
  const { step } = config;
  const T = mathTexts(config.lang).geometry;
  const reward = rewardForStep(step) + 1;

  if (step <= FIGURE_STEPS) {
    const figure = pick(FIGURES.filter((f) => f.level === step));
    // Building is the main task; counting shapes is the lighter second look.
    return Math.random() < 0.55 ? buildTask(figure, reward, T) : countTask(figure, reward, T);
  }

  const tier = step - FIGURE_STEPS; // 1..12
  if (tier <= 3) return areaReadTask(2 + tier, 4 + tier * 2 - (tier === 1 ? 1 : 0), reward, T);
  if (tier <= 6) {
    const t = tier - 3; // 1..3
    return Math.random() < 0.5 ? areaBuildTask(1 + t * 2, 3 + t * 3, reward, T) : areaReadTask(6 + t, 9 + t * 2, reward, T);
  }
  if (tier <= 9) {
    const t = tier - 6;
    return perimeterReadTask(1 + t, 3 + t, reward, T);
  }
  const t = tier - 9;
  return Math.random() < 0.7 ? longestFenceTask(3 + t, 5 + t, reward, T) : perimeterReadTask(4 + t, 6 + t, reward, T);
}
