import type { TaskInstance } from '@/core/game/kernel/types';
import type { Card, TemplatePayload } from '@/core/game/templates/types';
import { shuffle } from '@/core/utils/random';
import { factPool } from '../shared/facts';
import { card, templateTask, type GameTasks } from '../shared/templateModule';
import { PATTERN_STEPS, PER_STEP, SETS, PATTERN_FACTS, type Thing, SHADOW_FACTS, MIXED, FAMILIES, LOOKALIKES, type Half, DRAWN, HALF_SIZE, MIRROR_FACTS } from './content/data';

type Tasks = TaskInstance<TemplatePayload>[];

// ------------------------------------------------------ Rhythm & patterns —

function patterns(step: number): Tasks {
  const tasks: Tasks = [];
  PATTERN_STEPS.slice(0, step).forEach(({ unit, length, gap }, at) => {
    for (let i = 0; i < PER_STEP; i += 1) {
      // Every step takes five other sets, turned so the same pictures play new roles.
      const set = SETS[(at * PER_STEP + i) % SETS.length];
      const turn = Math.floor((at * PER_STEP + i) / SETS.length);
      const picture = (letter: string) => set[(letter.charCodeAt(0) - 65 + turn) % set.length];
      const row = Array.from({ length }, (_, k) => picture(unit[k % unit.length]));
      const hole = gap ?? length - 1;
      const answer = row[hole];
      const shown = row.map((p, k) => (k === hole ? '❓' : p));
      tasks.push(
        templateTask(
          `pattern:${shown.join('')}`,
          'Який малюнок має бути замість знака питання?',
          {
            template: 'UI_GRID_CHOICE',
            cols: 2,
            stimulus: { scene: [{ emoji: shown.join(' ') }] },
            options: shuffle(set).map((p) => card(p, p)),
            correctId: answer,
            hint: `Назви малюнки вголос по порядку. Тут повторюється шматочок із ${unit.length === 2 ? 'двох' : unit.length === 3 ? 'трьох' : 'чотирьох'} малюнків.`,
          },
          step,
          PATTERN_FACTS,
        ),
      );
    }
  });
  return tasks;
}

// ------------------------------------------------------------ Shadow lotto —

/** Pair up coloured things with their shadows; `lead` is the pair the task is about. */
function shadowTask(lead: Thing, others: readonly Thing[], pairs: number, step: number) {
  const things = [lead, ...shuffle(others.filter((t) => t[0] !== lead[0])).slice(0, pairs - 1)];
  const item = (t: Thing): Card => ({ id: t[0], emoji: t[0] });
  const shadow = (t: Thing): Card => ({ id: `shadow:${t[0]}`, emoji: t[0], silhouette: true });
  return templateTask(
    `shadow:${lead[0]}`,
    'Знайди для кожного малюнка його тінь.',
    {
      template: 'UI_DRAG_MATCH',
      items: shuffle(things.map(item)),
      slots: shuffle(things.map(shadow)),
      pairs: Object.fromEntries(things.map((t) => [t[0], `shadow:${t[0]}`])),
      hint: 'Придивись до обрисів: вуха, хвіст, колеса. Тінь має таку саму форму, як і малюнок.',
    },
    step,
    factPool(`Це ${lead[1]} — упізнати можна навіть за тінню!`, SHADOW_FACTS),
  );
}

function shadows(step: number): Tasks {
  const tasks: Tasks = [];
  const mixed = MIXED.slice(0, Math.min(step, 3) * PER_STEP);
  for (const thing of mixed) tasks.push(shadowTask(thing, mixed, 3, step));
  FAMILIES.slice(0, Math.max(0, Math.min(step, 7) - 3)).forEach((family) => {
    for (const thing of family) tasks.push(shadowTask(thing, family, 3, step));
  });
  LOOKALIKES.slice(0, Math.max(0, step - 7)).forEach((family) => {
    for (const thing of family) tasks.push(shadowTask(thing, family, 4, step));
  });
  return tasks;
}

// -------------------------------------------------------- Mirror symmetry —

/** Small deterministic generator, so a step always holds the same figures. */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const mirrorRow = (row: string) => [...row].reverse().join('');
const flipH = (rows: string[]) => rows.map(mirrorRow);
const flipV = (rows: string[]) => [...rows].reverse();
const sameRows = (a: string[], b: string[]) => a.join('|') === b.join('|');

/** The halves of one step — drawn or generated — always the same five. */
function halvesOf(step: number): Half[] {
  if (step === 3) return DRAWN.slice(0, PER_STEP);
  if (step === 4) return DRAWN.slice(PER_STEP);
  const [cols, rows] = HALF_SIZE[step - 1];
  const random = seeded(step * 7919);
  const halves: Half[] = [];
  while (halves.length < PER_STEP) {
    const half = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (random() < 0.55 ? '#' : '.')).join(''));
    const filled = half.join('').split('#').length - 1;
    // A fair figure: neither nearly empty nor full, not its own mirror image, not met before.
    if (filled < (cols * rows) / 3 || filled > cols * rows - 2) continue;
    if (sameRows(flipH(half), half) || halves.some((h) => sameRows(h.rows, half))) continue;
    halves.push({ rows: half });
  }
  return halves;
}

const toShape = (rows: string[]) => ({
  cols: rows[0].length,
  rows: rows.length,
  cells: [...rows.join('')].flatMap((c, i) => (c === '#' ? [i] : [])),
});

function mirrors(step: number): Tasks {
  const tasks: Tasks = [];
  for (let s = 1; s <= step; s += 1) {
    for (const half of halvesOf(s)) {
      const right = flipH(half.rows);
      // Traps: the half copied without turning, upside-down ones, and one with a single cell moved.
      const nudged = (seed: number) => {
        const cells = [...right.join('')];
        const at = seed % cells.length;
        cells[at] = cells[at] === '#' ? '.' : '#';
        return half.rows.map((_, r) => cells.slice(r * right[0].length, (r + 1) * right[0].length).join(''));
      };
      const traps: string[][] = [];
      for (const trap of [half.rows, flipV(right), nudged(1), nudged(right[0].length + 1), nudged(right.join('').length - 1), flipV(half.rows)]) {
        if (traps.length < 3 && !sameRows(trap, right) && !traps.some((t) => sameRows(t, trap))) traps.push(trap);
      }
      const width = right[0].length;
      tasks.push(
        templateTask(
          `mirror:${half.rows.join('|')}`,
          'Це ліва половинка малюнка. Знайди праву — таку, як у дзеркалі.',
          {
            template: 'UI_GRID_CHOICE',
            cols: 2,
            // The whole canvas with its right half still empty.
            stimulus: { shape: toShape(half.rows.map((row) => row + '.'.repeat(width))), caption: half.name },
            options: shuffle([{ id: 'mirror', shape: toShape(right) }, ...traps.map((trap, i) => ({ id: `trap${i}`, shape: toShape(trap) }))]),
            correctId: 'mirror',
            hint: 'Уяви дзеркало посередині. Клітинка, що стоїть біля дзеркала зліва, буде біля нього і справа.',
          },
          step,
          factPool(half.name ? `${half.name} — симетричний малюнок: половинки однакові.` : undefined, MIRROR_FACTS),
        ),
      );
    }
  }
  return tasks;
}

/** Task generators of every game, by game id (the cards are in `config.ts`). */
export const TASKS: Record<string, GameTasks> = {
  patterns: { pool: patterns },
  shadows: { pool: shadows },
  mirror: { pool: mirrors },
};
