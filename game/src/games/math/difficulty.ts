/**
 * Maps a path step (1..50) to concrete math difficulty parameters. This is the
 * per-module interpretation of the shared difficulty coefficient — the single
 * place that defines how "hard" each step is for the Math subject. Tune here.
 */

/** Largest operand for addition/subtraction at a given step (≈5 → ≈950). */
export function addSubMax(step: number): number {
  return Math.round(5 + Math.pow(step, 1.75));
}

/** Largest factor for multiplication at a given step (2 → ~27). */
export function mulFactorMax(step: number): number {
  return Math.min(30, 2 + Math.floor(step / 2));
}

/** The arithmetic of a mental-math game: one operation, or the «mixed» game. */
export type ChainOp = '+' | '-' | '×' | '÷' | 'mixed';

/**
 * What one task of a mental-math level looks like:
 * - `pair`: two numbers (6 + 3);
 * - `chain`: n numbers with the game's own sign (4 + 6 + 3 + 4). In «mixed» it is + and − together;
 * - `order`: «mixed» only, × or ÷ together with + or −, so the order matters (2 + 3 × 4);
 * - `brackets`: «mixed» only, brackets that change that order ((2 + 3) × 4).
 */
export type TaskShape =
  | { kind: 'pair' }
  | { kind: 'chain'; n: number }
  | { kind: 'order'; n: number }
  | { kind: 'brackets'; n: number };

/** A kind of longer task: the step it opens on, and how many of a level it may take. */
interface ShapeRule {
  shape: TaskShape;
  from: number;
  max: number;
}

const chainRules = (from: readonly number[]): ShapeRule[] => from.map((step, i) => ({ shape: { kind: 'chain', n: 3 + i }, from: step, max: 10 }));

/**
 * When the longer tasks open, game by game. The steps are spread over each path
 * (+/− 40 steps, × 30, ÷ 25, mixed 60). Products and quotients stop at four
 * numbers, so they stay countable. Only «mixed» puts different signs in one
 * task. «Додавання» is only ever +, «Віднімання» only −.
 */
const SHAPES: Record<ChainOp, ShapeRule[]> = {
  '+': chainRules([8, 16, 26]),
  '-': chainRules([10, 18, 28]),
  '×': chainRules([10, 20]),
  '÷': chainRules([9, 17]),
  mixed: [
    { shape: { kind: 'chain', n: 3 }, from: 10, max: 3 },
    { shape: { kind: 'order', n: 3 }, from: 18, max: 4 },
    { shape: { kind: 'chain', n: 4 }, from: 24, max: 2 },
    { shape: { kind: 'brackets', n: 3 }, from: 30, max: 4 },
    { shape: { kind: 'order', n: 4 }, from: 38, max: 3 },
    { shape: { kind: 'chain', n: 5 }, from: 44, max: 1 },
    { shape: { kind: 'brackets', n: 4 }, from: 50, max: 3 },
  ],
};

/** At most this share of a level is longer tasks: two-number sums keep coming. */
const LONG_SHARE = 0.7;

/**
 * How many tasks of a new kind a level has, `since` steps after it opened:
 * one for two levels, two for the next three, three for three more, and so on.
 * The new thing comes in slowly.
 */
export function rampOf(since: number): number {
  if (since < 0) return 0;
  return since < 2 ? 1 : 2 + Math.floor((since - 2) / 3);
}

/**
 * The shapes of one level's tasks, in no particular order. The same for every
 * replay of a step. The newest kind is served first. An older one gives way
 * but keeps at least one task while there is room, and the rest are pairs.
 */
export function levelPlan(op: ChainOp, step: number, count: number): TaskShape[] {
  const open = SHAPES[op].filter((r) => step >= r.from).sort((a, b) => b.from - a.from);
  let room = Math.min(count, Math.round(count * LONG_SHARE));
  const plan: TaskShape[] = [];
  open.forEach((rule, i) => {
    const older = open.length - 1 - i;
    // Leave a place for each older kind, while there are places to leave.
    const reserve = Math.max(0, Math.min(older, room - 1));
    const take = Math.max(0, Math.min(rule.max, rampOf(step - rule.from), room - reserve));
    for (let k = 0; k < take; k += 1) plan.push(rule.shape);
    room -= take;
  });
  while (plan.length < count) plan.push({ kind: 'pair' });
  return plan;
}

/** The step from which a shape is first asked in a game (for its intro). */
export function shapeFrom(op: ChainOp, kind: TaskShape['kind']): number | undefined {
  return SHAPES[op].find((r) => r.shape.kind === kind)?.from;
}

/**
 * Largest factor (or divisor) when a product has `n` numbers: small at
 * first and growing along the path. 3 × 3 × 3, later 7 × 6 × 5, and 5 × 4 × 3 × 2 for
 * four numbers.
 */
export function chainFactorMax(n: number, step: number): number {
  const from = SHAPES['×'][n >= 4 ? 1 : 0].from;
  const grown = 3 + Math.floor(Math.max(0, step - from) / (n >= 4 ? 5 : 4));
  return Math.max(3, Math.min(mulFactorMax(step), n >= 4 ? 5 : 7, grown));
}

/** «mixed»: the largest factor next to + and − (2 + 3 × 4), growing 3 → 10. */
export function mixedFactorMax(step: number): number {
  return Math.min(10, 3 + Math.floor(step / 8));
}

/** «mixed»: the largest number that is added or taken away in such a task. */
export function mixedAddMax(step: number): number {
  return Math.min(60, 6 + step);
}

/** Divisor/quotient ceiling for division at a given step (2 → ~12). */
export function divFactorMax(step: number): number {
  return Math.min(12, 2 + Math.floor(step / 3));
}

/**
 * Denominator ceiling for «Смачні Дроби» at a given step (4 → 8). The game is
 * an introduction (PRD v4.0: ⭐, 10 levels), so it grows one slice at a time.
 */
export function fractionDenomMax(step: number): number {
  // Starts at quarters so even the first level has six different fractions.
  return Math.min(8, 4 + Math.floor((step - 1) * 0.45));
}

/** Spread of the distractor answers — wider as it gets harder. */
export function optionSpread(step: number): number {
  return Math.max(3, Math.min(20, Math.round(step / 2) + 2));
}

/** Apples awarded per task — grows modestly with difficulty (1 → ~9). */
export function rewardForStep(step: number): number {
  return 1 + Math.floor(step / 6);
}
