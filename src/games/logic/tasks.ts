import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskInstance } from '@/core/game/kernel/types';
import type { Card, TemplatePayload } from '@/core/game/templates/types';
import { pick, shuffle } from '@/core/utils/random';
import { card, templateTask, type GameTasks } from '../shared/templateModule';
import { CHOICES, DRAWN, MIRROR_STEPS, PATTERN_STEPS, PER_STEP, SETS, SHADOW_STEPS, SHADOW_WORLD, type Half } from './content/data';

type Tasks = TaskInstance<TemplatePayload>[];

/** Small deterministic generator, so a step always holds the same tasks. */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** A shuffle that comes out the same every time for the same `random`. */
function mixed<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Work a step's tasks out once — pools are asked for again and again. */
function perStep<T>(make: (step: number) => T): (step: number) => T {
  const made = new Map<number, T>();
  return (step) => {
    if (!made.has(step)) made.set(step, make(step));
    return made.get(step) as T;
  };
}

// ------------------------------------------------------ Rhythm & patterns —

interface Pattern {
  shown: string[];
  answer: string;
  set: string[];
  unit: string;
}

/** The patterns one step opens: every set of pictures, with its pictures in ever new roles. */
const patternsOf = perStep((step: number): Pattern[] => {
  const { unit, length, gap } = PATTERN_STEPS[step - 1];
  const random = seeded(step * 7919 + 17);
  const found = new Map<string, Pattern>();
  for (let i = 0; found.size < PER_STEP && i < PER_STEP * 20; i += 1) {
    const set = SETS[(step * 7 + i) % SETS.length];
    const roles = mixed(set, random);
    const line = Array.from({ length }, (_, k) => roles[unit.charCodeAt(k % unit.length) - 65]);
    const hole = gap ?? length - 1;
    const shown = line.map((p, k) => (k === hole ? '❓' : p));
    if (!found.has(shown.join(''))) found.set(shown.join(''), { shown, answer: line[hole], set, unit });
  }
  return [...found.values()];
});

const UNIT_SIZE = ['', '', 'двох', 'трьох', 'чотирьох'];

function patterns(step: number): Tasks {
  const tasks: Tasks = [];
  for (let s = 1; s <= Math.min(step, PATTERN_STEPS.length); s += 1) {
    for (const { shown, answer, set, unit } of patternsOf(s)) {
      tasks.push(
        templateTask(`pattern:${s}:${shown.join('')}`, 'Який малюнок має бути замість знака питання?', {
          template: Mechanics.GridChoice,
          cols: 3,
          stimulus: { scene: [{ emoji: shown.join(' ') }] },
          options: shuffle(set).map((p) => card(p, p)),
          correctId: answer,
          hint: `Назви малюнки вголос по порядку. Тут повторюється шматочок із ${UNIT_SIZE[unit.length]} малюнків.`,
        }, step),
      );
    }
  }
  return tasks;
}

// ------------------------------------------------------------ Shadow lotto —

interface Thing {
  emoji: string;
  family: number;
  group: number;
}

const THINGS: Thing[] = SHADOW_WORLD.flatMap((groups, family) => groups.flatMap((emojis, group) => emojis.map((emoji) => ({ emoji, family, group }))));
const sameGroup = (a: Thing, b: Thing) => a.family === b.family && a.group === b.group;

/** The things a step asks about: every thing has its turn at every kind of board. */
const leadsOf = perStep((step: number): Thing[] => {
  const { mix } = SHADOW_STEPS[step - 1];
  // Steps of one kind share the catalog between them, in an order of their own.
  const alike = SHADOW_STEPS.map((s, i) => (s.mix === mix ? i + 1 : 0)).filter(Boolean);
  const order = mixed(THINGS, seeded(alike[0] * 104729));
  const share = Math.ceil(order.length / alike.length);
  const at = alike.indexOf(step);
  return order.slice(at * share, (at + 1) * share);
});

/** Who shares the board with `lead` — as close to it as the step asks. */
function companions(lead: Thing, step: number): Thing[] {
  const { pairs, mix } = SHADOW_STEPS[step - 1];
  const others = THINGS.filter((t) => t.emoji !== lead.emoji);
  const family = others.filter((t) => t.family === lead.family);
  const group = family.filter((t) => sameGroup(t, lead));
  const need = pairs - 1;

  if (mix === 'apart') {
    // One thing from each of some other families: nothing on the board is alike.
    const families = shuffle([...new Set(others.map((t) => t.family))].filter((f) => f !== lead.family)).slice(0, need);
    return families.map((f) => pick(others.filter((t) => t.family === f)));
  }
  if (mix === 'family') {
    // The same kind of thing, but not look-alikes where the family allows it.
    const far = shuffle(family.filter((t) => !sameGroup(t, lead)));
    const seen = new Set<number>();
    const spread = far.filter((t) => !seen.has(t.group) && seen.add(t.group));
    return [...spread, ...shuffle(far.filter((t) => !spread.includes(t))), ...shuffle(group)].slice(0, need);
  }
  if (mix === 'twoGroups') {
    // Two pairs of look-alikes: the lead with its double, and two from a group next door.
    const double = shuffle(group).slice(0, 1);
    const nextDoor = shuffle([...new Set(family.filter((t) => !sameGroup(t, lead)).map((t) => t.group))])[0];
    const pair = shuffle(family.filter((t) => t.group === nextDoor));
    return [...double, ...pair, ...shuffle(group.filter((t) => !double.includes(t)))].slice(0, need);
  }
  // Look-alikes only; a small group is topped up from its family.
  return [...shuffle(group), ...shuffle(family.filter((t) => !sameGroup(t, lead)))].slice(0, need);
}

function shadows(step: number): Tasks {
  const tasks: Tasks = [];
  for (let s = 1; s <= Math.min(step, SHADOW_STEPS.length); s += 1) {
    const { blur } = SHADOW_STEPS[s - 1];
    for (const lead of leadsOf(s)) {
      const things = [lead, ...companions(lead, s)];
      const item = (t: Thing): Card => ({ id: t.emoji, emoji: t.emoji });
      const shadow = (t: Thing): Card => ({ id: `shadow:${t.emoji}`, emoji: t.emoji, silhouette: true, blur });
      tasks.push(
        templateTask(`shadow:${s}:${lead.emoji}`, 'Знайди для кожного малюнка його тінь.', {
          template: Mechanics.DragMatch,
          items: shuffle(things.map(item)),
          slots: shuffle(things.map(shadow)),
          pairs: Object.fromEntries(things.map((t) => [t.emoji, `shadow:${t.emoji}`])),
          hint: 'Придивись до обрисів: вуха, хвіст, колеса. Тінь має таку саму форму, як і малюнок.',
        }, step),
      );
    }
  }
  return tasks;
}

// -------------------------------------------------------- Mirror symmetry —

const mirrorRow = (line: string) => [...line].reverse().join('');
const flipH = (rows: string[]) => rows.map(mirrorRow);
const flipV = (rows: string[]) => [...rows].reverse();
const keyOf = (rows: string[]) => rows.join('|');
const filledIn = (rows: string[]) => rows.join('').split('#').length - 1;

/** A figure worth asking about: neither nearly empty nor full, and not its own mirror image. */
function fair(rows: string[]): boolean {
  const cells = rows.length * rows[0].length;
  const filled = filledIn(rows);
  return filled >= cells / 3 && filled <= cells - 2 && keyOf(flipH(rows)) !== keyOf(rows);
}

/** The halves of one step — the drawn ones first, the rest generated — always the same. */
const halvesOf = perStep((step: number): Half[] => {
  const [cols, rows] = MIRROR_STEPS[step - 1].size;
  // Steps of one size must not open the same figure twice.
  const taken = new Set<string>();
  for (let s = 1; s < step; s += 1) {
    if (MIRROR_STEPS[s - 1].size.join() === [cols, rows].join()) for (const h of halvesOf(s)) taken.add(keyOf(h.rows));
  }
  const drawn = step === 3 ? DRAWN.slice(0, 5) : step === 4 ? DRAWN.slice(5) : [];
  const halves: Half[] = [...drawn];
  for (const h of DRAWN) taken.add(keyOf(h.rows));

  const random = seeded(step * 7919);
  for (let tries = 0; halves.length < PER_STEP && tries < 5000; tries += 1) {
    const half = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (random() < 0.55 ? '#' : '.')).join(''));
    if (!fair(half) || taken.has(keyOf(half))) continue;
    taken.add(keyOf(half));
    halves.push({ rows: half });
  }
  return halves;
});

const toShape = (rows: string[]) => ({
  cols: rows[0].length,
  rows: rows.length,
  cells: [...rows.join('')].flatMap((c, i) => (c === '#' ? [i] : [])),
});

/** `right` with `count` of its cells switched over. */
function nudged(right: string[], count: number): string[] {
  const cells = [...right.join('')];
  for (const at of shuffle(cells.map((_, i) => i)).slice(0, count)) cells[at] = cells[at] === '#' ? '.' : '#';
  const width = right[0].length;
  return right.map((_, r) => cells.slice(r * width, (r + 1) * width).join(''));
}

/**
 * Eight wrong halves for the right one: the left half copied without turning
 * it, the figure upside down, and look-alikes that differ by as few cells as
 * the step allows.
 */
function trapsFor(half: string[], step: number): string[][] {
  const right = flipH(half);
  const [min, max] = MIRROR_STEPS[step - 1].differ;
  const traps = new Map<string, string[]>();
  const offer = (trap: string[]) => {
    if (traps.size < CHOICES - 1 && keyOf(trap) !== keyOf(right) && filledIn(trap) > 0) traps.set(keyOf(trap), trap);
  };
  offer(half);
  if (step >= 5) offer(flipV(right));
  for (let tries = 0; traps.size < CHOICES - 1 && tries < 400; tries += 1) {
    offer(nudged(right, min + Math.floor(Math.random() * (max - min + 1))));
  }
  return [...traps.values()];
}

function mirrors(step: number): Tasks {
  const tasks: Tasks = [];
  for (let s = 1; s <= Math.min(step, MIRROR_STEPS.length); s += 1) {
    for (const half of halvesOf(s)) {
      const right = flipH(half.rows);
      const width = right[0].length;
      tasks.push(
        templateTask(`mirror:${keyOf(half.rows)}`, 'Це ліва половинка малюнка. Знайди праву — таку, як у дзеркалі.', {
          template: Mechanics.GridChoice,
          cols: 3,
          // The whole canvas with its right half still empty.
          stimulus: { shape: toShape(half.rows.map((line) => line + '.'.repeat(width))), caption: half.name },
          options: shuffle([{ id: 'mirror', shape: toShape(right) }, ...trapsFor(half.rows, s).map((trap, i) => ({ id: `trap${i}`, shape: toShape(trap) }))]),
          correctId: 'mirror',
          hint: 'Уяви дзеркало посередині. Клітинка, що стоїть біля дзеркала зліва, буде біля нього і справа.',
        }, step),
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
