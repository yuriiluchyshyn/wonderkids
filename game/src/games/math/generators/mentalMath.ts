import { mathTexts } from '../grammar';
import type { MathTexts } from '../grammar/types';
import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import { pick, randInt, shuffle, uid } from '@/core/utils/random';
import { composeLevel, recallSteps } from '@/core/game/engine/recall';
import { buildNumberOptions } from './options';
import type { Counting, Glyph, GridChoicePayload, Lesson } from '@/core/game/templates/types';
import { MATH_SUB, type ExprToken, type MathOp } from '../ids';
import {
  addSubMax,
  chainFactorMax,
  divFactorMax,
  levelPlan,
  mixedAddMax,
  mixedFactorMax,
  mulFactorMax,
  optionSpread,
  rewardForStep,
  type ChainOp,
  type TaskShape,
} from '../difficulty';
import { keyOf, solve, trapsOf, written, type SolveStep } from './expression';

/** Cubes the helper may lay out for a long sum. More than this cannot be counted by touch. */
const CHAIN_COUNTING_MAX = 40;
/** Tries at a friendly «mixed» row (whole, never below zero) before settling for a simpler one. */
const TRIES = 300;
/** How many candidates to draw for each two-number place of a level. */
const PAIR_FACTOR = 5;

/** The games this generator plays, by the sign they practise. */
const GAME_OP: Record<string, ChainOp> = {
  [MATH_SUB.add]: '+',
  [MATH_SUB.sub]: '-',
  [MATH_SUB.mul]: '×',
  [MATH_SUB.div]: '÷',
  [MATH_SUB.mixed]: 'mixed',
};

/** Is this one of the mental-math games (+, −, ×, ÷, mixed)? */
export function isMentalGame(subCategoryId: string): boolean {
  return subCategoryId in GAME_OP;
}

const gameOp = (subCategoryId: string): ChainOp => GAME_OP[subCategoryId] ?? 'mixed';

/** A row to work out, and its answer. */
interface Row {
  tokens: ExprToken[];
  answer: number;
}

/** What the child counts by touch when the sum needs help (PRD §5). */
function countingFor(a: number, b: number, op: MathOp, answer: number): Counting {
  // Multiplication: `a` groups of `b` dots.
  if (op === '×') return { kind: 'groups', rows: a, cols: b };
  // Division a ÷ b: `a` dots shared into `b` groups — each holds the answer.
  if (op === '÷') return { kind: 'groups', rows: b, cols: answer };
  // Addition: the two numbers as two colours of cubes, counted together.
  if (op === '+') return { kind: 'towers', count: a + b, split: { a, b } };
  return { kind: 'towers', count: answer };
}

const row = (tokens: ExprToken[]): Row => ({ tokens, answer: solve(tokens)?.answer ?? 0 });
/** `a op b op c …` out of numbers and the signs between them. */
const joined = (nums: number[], ops: MathOp[]): ExprToken[] => nums.flatMap((n, i): ExprToken[] => (i > 0 ? [ops[i - 1], n] : [n]));

/** Two numbers: the original sums of the path. */
function pair(op: MathOp, step: number): Row {
  let a: number;
  let b: number;
  if (op === '×') {
    const max = mulFactorMax(step);
    a = randInt(2, max);
    // One factor reaches a little further so even the first levels have
    // enough different sums to fill a level without repeating.
    b = randInt(2, max + 3);
  } else if (op === '÷') {
    // Build from the answer so the division is always exact.
    const max = divFactorMax(step);
    b = randInt(2, max); // divisor
    a = b * randInt(1, max + 3); // dividend; the quotient is wider for variety on early levels
  } else if (op === '+') {
    const max = addSubMax(step);
    a = randInt(1, max);
    b = randInt(1, Math.max(1, max - a));
  } else {
    // Subtraction: ensure a >= b for a friendly, non-negative answer.
    a = randInt(2, addSubMax(step));
    b = randInt(1, a);
  }
  return row([a, op, b]);
}

/**
 * Three to five numbers with one sign (or + and − in «mixed»). The total stays within
 * the step's range (`addSubMax`), so a longer sum has smaller numbers, not a
 * bigger answer. Nothing along the way goes below zero, and every division is exact.
 */
function chain(op: ChainOp, n: number, step: number): Row {
  if (op === '×') {
    const max = chainFactorMax(n, step);
    const nums = Array.from({ length: n }, () => randInt(2, max));
    return row(joined(nums, nums.slice(1).map((): MathOp => '×')));
  }
  if (op === '÷') {
    // Built backwards from the answer: 60 ÷ 2 ÷ 5 = 6.
    const divisors = Array.from({ length: n - 1 }, () => randInt(2, chainFactorMax(n, step)));
    const answer = randInt(1, divFactorMax(step));
    return row(joined([divisors.reduce((acc, d) => acc * d, answer), ...divisors], divisors.map((): MathOp => '÷')));
  }

  const max = op === 'mixed' ? mixedAddMax(step) * 2 : addSubMax(step);
  // What one number may be, so that n of them still fit the step's range.
  const part = Math.max(3, Math.floor(max / n));
  if (op === '+') {
    const nums = Array.from({ length: n }, () => randInt(1, part));
    return row(joined(nums, nums.slice(1).map((): MathOp => '+')));
  }
  if (op === '-') {
    // Start big enough to take every number away: 20 − 4 − 7 − 3.
    const start = randInt(Math.max(n * 2, Math.floor(max / 2)), Math.max(n * 2, max));
    const nums = [start];
    let left = start;
    for (let i = 1; i < n; i += 1) {
      const take = randInt(1, Math.max(1, Math.floor(left / (n - i))));
      nums.push(take);
      left -= take;
    }
    return row(joined(nums, nums.slice(1).map((): MathOp => '-')));
  }

  // Mixed: plus and minus in one row, never below zero: 12 + 5 − 7 + 3.
  const nums = [randInt(2, part)];
  const ops: MathOp[] = [];
  let value = nums[0];
  for (let i = 1; i < n; i += 1) {
    const minus = value > 1 && Math.random() < 0.5;
    const next = minus ? randInt(1, Math.min(part, value)) : randInt(1, part);
    ops.push(minus ? '-' : '+');
    nums.push(next);
    value += minus ? -next : next;
  }
  return row(joined(nums, ops));
}

/**
 * The rows of «mixed» where the order matters. `n` stands for a number. Where
 * × or ÷ comes second, working left to right gives another answer, so those
 * rows come up twice as often.
 */
const ORDER_FORMS: Record<3 | 4, string[][]> = {
  3: [
    ['n', '+', 'n', '×', 'n'],
    ['n', '+', 'n', '×', 'n'],
    ['n', '-', 'n', '×', 'n'],
    ['n', '+', 'n', '÷', 'n'],
    ['n', '-', 'n', '÷', 'n'],
    ['n', '×', 'n', '+', 'n'],
    ['n', '×', 'n', '-', 'n'],
    ['n', '÷', 'n', '+', 'n'],
  ],
  4: [
    ['n', '×', 'n', '+', 'n', '×', 'n'],
    ['n', '+', 'n', '×', 'n', '-', 'n'],
    ['n', '-', 'n', '×', 'n', '+', 'n'],
    ['n', '+', 'n', '÷', 'n', '+', 'n'],
    ['n', '×', 'n', '-', 'n', '÷', 'n'],
  ],
};

/** Rows with brackets that change the order: without them the answer is another. */
const BRACKET_FORMS: Record<3 | 4, string[][]> = {
  3: [
    ['(', 'n', '+', 'n', ')', '×', 'n'],
    ['(', 'n', '-', 'n', ')', '×', 'n'],
    ['n', '×', '(', 'n', '+', 'n', ')'],
    ['n', '×', '(', 'n', '-', 'n', ')'],
    ['(', 'n', '+', 'n', ')', '÷', 'n'],
    ['n', '-', '(', 'n', '+', 'n', ')'],
  ],
  4: [
    ['(', 'n', '+', 'n', ')', '×', '(', 'n', '-', 'n', ')'],
    ['(', 'n', '+', 'n', ')', '×', 'n', '-', 'n'],
    ['n', '×', '(', 'n', '+', 'n', ')', '-', 'n'],
    ['n', '+', '(', 'n', '-', 'n', ')', '×', 'n'],
  ],
};

const isHigh = (t: string | undefined) => t === '×' || t === '÷';

/** One draw of a form: a factor next to × and ÷, a bigger number next to + and −. */
function fillForm(form: string[], step: number): ExprToken[] {
  const factor = mixedFactorMax(step);
  const addend = mixedAddMax(step);
  const tokens: ExprToken[] = form.map((t, i) => {
    if (t !== 'n') return t as ExprToken;
    return isHigh(form[i - 1]) || isHigh(form[i + 1]) ? randInt(2, factor) : randInt(1, addend);
  });
  // A plain number divided: make it whole at once (12 ÷ 3), not by luck.
  tokens.forEach((t, i) => {
    if (t === '÷' && typeof tokens[i - 1] === 'number' && typeof tokens[i + 1] === 'number' && tokens[i - 2] !== '×') {
      tokens[i - 1] = (tokens[i + 1] as number) * randInt(1, factor);
    }
  });
  return tokens;
}

/**
 * A «mixed» row where the order of operations (or brackets) matters: whole at
 * every step, never below zero, a sensible size, and with a trap among the
 * answers wherever the form allows one. Falls back to a +/− chain.
 */
function ordered(kind: 'order' | 'brackets', n: number, step: number): Row {
  const forms = (kind === 'order' ? ORDER_FORMS : BRACKET_FORMS)[n >= 4 ? 4 : 3];
  const cap = 50 + step * 3;
  let fallback: Row | null = null;
  for (let attempt = 0; attempt < TRIES; attempt += 1) {
    const form = pick(forms);
    const tokens = fillForm(form, step);
    const solved = solve(tokens);
    if (!solved || solved.answer > cap) continue;
    const candidate = { tokens, answer: solved.answer };
    // Brackets must change something, or they teach nothing.
    if (kind === 'brackets' && !trapsOf(tokens, solved.answer).length) continue;
    if (trapsOf(tokens, solved.answer).length || isHigh(String(form[1]))) return candidate;
    fallback ??= candidate;
  }
  return fallback ?? chain('mixed', n, step);
}

/** Makes the row of one task of the given shape. */
function rowOf(game: ChainOp, shape: TaskShape, step: number): Row {
  switch (shape.kind) {
    case 'pair':
      return pair(game === 'mixed' ? pick<MathOp>(['+', '-', '×', '÷']) : game, step);
    case 'chain':
      return chain(game, shape.n, step);
    default:
      return game === 'mixed' ? ordered(shape.kind, shape.n, step) : chain(game, shape.n, step);
  }
}

/** The math line on the board: the numbers take turns in the two colours. */
function glyphsOf(tokens: ExprToken[]): Glyph[] {
  let nth = 0;
  return [
    ...tokens.map((t): Glyph => {
      if (typeof t !== 'number') return t;
      nth += 1;
      return { text: String(t), tone: nth % 2 === 1 ? 'a' : 'b' };
    }),
    '=',
    '?',
  ];
}

/** The helper of a long sum: the cubes of the answer, if there are few enough to count. */
function chainCounting({ tokens, answer }: Row): Counting | undefined {
  const additive = tokens.every((t) => typeof t === 'number' || t === '+' || t === '-');
  return additive && answer > 0 && answer <= CHAIN_COUNTING_MAX ? { kind: 'towers', count: answer } : undefined;
}

/** The worked example of each lesson: never a task of the game, so nothing is given away. */
const LESSON_EXAMPLE: Record<Lesson['id'], ExprToken[]> = {
  order: [2, '+', 3, '×', 4],
  brackets: ['(', 2, '+', 3, ')', '×', 4],
};

/** The steps of a row as a lesson draws them, ending with the answer alone. */
function lessonSteps(tokens: ExprToken[], T: MathTexts): Lesson['steps'] {
  const solved = solve(tokens);
  if (!solved) return [];
  return [
    ...solved.steps.map((s: SolveStep, i) => ({
      tokens: written(s.tokens),
      focus: s.focus,
      note: T.mental.lesson.step(s.part, s.result, i === 0, s.inBrackets),
    })),
    { tokens: [String(solved.answer)] },
  ];
}

/** The lesson a task of the order of operations or of brackets stands on. */
function lessonFor(kind: 'order' | 'brackets', first: ExprToken[], traps: number[], T: MathTexts): Lesson {
  const L = T.mental.lesson;
  if (kind === 'brackets') {
    return {
      id: 'brackets',
      title: L.brackets.title,
      text: L.brackets.text,
      steps: lessonSteps(LESSON_EXAMPLE.brackets, T),
      contrast: lessonSteps(LESSON_EXAMPLE.order, T),
      contrastText: L.brackets.contrast,
      again: L.brackets.again(first),
      traps: traps.map(String),
    };
  }
  return { id: 'order', title: L.order.title, text: L.order.text, steps: lessonSteps(LESSON_EXAMPLE.order, T), again: L.order.again(first), traps: traps.map(String) };
}

/** What kind of rule a row stands on. */
function ruleOf(tokens: ExprToken[]): 'order' | 'brackets' | null {
  if (tokens.includes('(')) return 'brackets';
  const high = tokens.some((t) => t === '×' || t === '÷');
  const low = tokens.some((t) => t === '+' || t === '-');
  return high && low ? 'order' : null;
}

/** The options of the board, with the traps of a rule among them (where they fit). */
function optionsOf(answer: number, traps: number[], count: number, spread: number): number[] {
  const base = buildNumberOptions(answer, count, spread);
  const missing = traps.filter((t) => !base.includes(t));
  if (!missing.length) return base;
  // Traps replace the near-misses farthest from the answer.
  const others = base.filter((v) => v !== answer).sort((a, b) => Math.abs(b - answer) - Math.abs(a - answer));
  const dropped = new Set(others.slice(0, missing.length));
  return shuffle([...base.filter((v) => !dropped.has(v)), ...missing]);
}

/** One task of a given shape. */
export function mentalTask(config: TaskConfig, shape: TaskShape): TaskInstance<GridChoicePayload> {
  const { step, subCategoryId, choicesCount = 9 } = config;
  const T = mathTexts(config.lang);
  const game = gameOp(subCategoryId);
  const task = rowOf(game, shape, step);
  const { tokens, answer } = task;
  const numbers = tokens.filter((t): t is number => typeof t === 'number');
  const rule = ruleOf(tokens);
  const steps = solve(tokens)?.steps ?? [];
  const first = steps[0] ? (steps[0].part as ExprToken[]) : tokens;
  const traps = rule ? trapsOf(tokens, answer) : [];

  // Two numbers: the original texts and helpers of the path.
  if (tokens.length === 3) {
    const [a, op, b] = tokens as [number, MathOp, number];
    return {
      id: uid('mm'),
      key: keyOf(tokens),
      prompt: T.mental.prompt(a, b, op),
      reward: rewardForStep(step),
      payload: {
        template: Mechanics.GridChoice,
        cols: 3,
        // The two numbers wear the colours of their cubes in the helper below.
        stimulus: { glyphs: glyphsOf(tokens) },
        options: buildNumberOptions(answer, choicesCount, optionSpread(step)).map((value) => ({ id: String(value), glyphs: [String(value)] })),
        correctId: String(answer),
        counting: countingFor(a, b, op, answer),
        hint: T.mental.hint(a, b, op),
      },
    };
  }

  const hint = rule === 'brackets' ? T.mental.bracketsHint(first) : rule === 'order' ? T.mental.orderHint(first) : T.mental.chainHint(first, steps[0]?.result ?? answer);
  return {
    id: uid('mm'),
    key: keyOf(tokens),
    prompt: T.mental.chain(tokens),
    // Shown in signs, said in words («99 плюс 36…», brackets as «у дужках»).
    speak: T.mental.chainSaid(tokens),
    reward: rewardForStep(step) + (numbers.length - 2) + (rule ? 1 : 0),
    payload: {
      template: Mechanics.GridChoice,
      cols: 3,
      stimulus: { glyphs: glyphsOf(tokens) },
      options: optionsOf(answer, traps, choicesCount, optionSpread(step)).map((value) => ({ id: String(value), glyphs: [String(value)] })),
      correctId: String(answer),
      counting: chainCounting(task),
      hint,
      ...(rule ? { lesson: lessonFor(rule, first, traps, T) } : {}),
    },
  };
}

/**
 * One task, as `generateTask` is asked for it (an extra task of a level). Its
 * shape is drawn from the step's level plan, so it is as long as the level's
 * own tasks tend to be.
 */
export function generateMentalMath(config: TaskConfig): TaskInstance<GridChoicePayload> {
  return mentalTask(config, pick(levelPlan(gameOp(config.subCategoryId), config.step, 10)));
}

/**
 * A whole level. The longer tasks follow the step's plan exactly (`levelPlan`):
 * one 3-number sum for the first two levels after they open, then two, and so on.
 * They are spread through the level. The two-number places are half new and half
 * recalled from the steps just behind (`composeLevel`), as before.
 */
export function buildMentalLevel(config: Omit<TaskConfig, 'index'>, count: number): TaskInstance[] {
  const game = gameOp(config.subCategoryId);
  const plan = levelPlan(game, config.step, count);
  const longShapes = plan.filter((s) => s.kind !== 'pair');
  const pairs = count - longShapes.length;
  const seen = new Set<string>();
  const unique = (t: TaskInstance) => (seen.has(t.key ?? '') ? false : (seen.add(t.key ?? ''), true));

  const long: TaskInstance[] = [];
  longShapes.forEach((shape, index) => {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const t = mentalTask({ ...config, index }, shape);
      if (unique(t)) {
        long.push(t);
        return;
      }
    }
  });

  const draw = (stepOf: () => number) =>
    Array.from({ length: Math.max(1, pairs) * PAIR_FACTOR }, (_, index) => mentalTask({ ...config, step: stepOf(), index }, { kind: 'pair' })).filter((t) => !seen.has(t.key ?? ''));
  const earlier = recallSteps(config.step);
  const fresh = draw(() => config.step);
  const short = pairs <= 0 ? [] : earlier.length ? composeLevel(fresh, draw(() => pick(earlier)), pairs, (t) => t.key ?? t.id) : fresh.filter(unique).slice(0, pairs);

  // The longer tasks are spread through the level, never all at its start.
  const level: TaskInstance[] = [...short];
  long.forEach((t, i) => level.splice(Math.min(level.length, Math.round(((i + 1) * count) / (long.length + 1))), 0, t));
  return level;
}
