import { mathTexts } from '../lang';
import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import { pick, randInt, uid } from '@/core/utils/random';
import { buildNumberOptions } from './options';
import type { Counting, GridChoicePayload } from '@/core/game/templates/types';
import { MATH_SUB, type MathOp } from '../ids';
import { addSubMax, divFactorMax, mulFactorMax, optionSpread, rewardForStep } from '../difficulty';

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

/** Resolves the operation(s) a given adventure uses. */
function opForSub(subCategoryId: string): MathOp | 'mixed' {
  switch (subCategoryId) {
    case MATH_SUB.add:
      return '+';
    case MATH_SUB.sub:
      return '-';
    case MATH_SUB.mul:
      return '×';
    case MATH_SUB.div:
      return '÷';
    default:
      return 'mixed';
  }
}

/**
 * Rng-driven generator for a single arithmetic task, scaled by the path `step`.
 * The operation is fixed per adventure (add/sub/mul/div) or random for "mixed".
 * Subtraction stays non-negative and division is always whole — never a scary
 * result for a small child.
 */
export function generateMentalMath(config: TaskConfig): TaskInstance<GridChoicePayload> {
  const { step, subCategoryId, choicesCount = 9 } = config;
  const T = mathTexts(config.lang);
  const resolved = opForSub(subCategoryId);
  const op: MathOp = resolved === 'mixed' ? pick<MathOp>(['+', '-', '×', '÷']) : resolved;

  let a: number;
  let b: number;
  let answer: number;

  if (op === '×') {
    const max = mulFactorMax(step);
    a = randInt(2, max);
    // One factor reaches a little further so even the first levels have
    // enough different sums to fill a level without repeating.
    b = randInt(2, max + 3);
    answer = a * b;
  } else if (op === '÷') {
    // Build from the answer so the division is always exact.
    const max = divFactorMax(step);
    b = randInt(2, max); // divisor
    answer = randInt(1, max + 3); // quotient (wider, for variety on early levels)
    a = b * answer; // dividend
  } else if (op === '+') {
    const max = addSubMax(step);
    a = randInt(1, max);
    b = randInt(1, Math.max(1, max - a));
    answer = a + b;
  } else {
    // Subtraction: ensure a >= b for a friendly, non-negative answer.
    const max = addSubMax(step);
    a = randInt(2, max);
    b = randInt(1, a);
    answer = a - b;
  }

  return {
    id: uid('mm'),
    key: `${a}${op}${b}`,
    prompt: T.mental.prompt(a, b, op),
    reward: rewardForStep(step),
    payload: {
      template: Mechanics.GridChoice,
      cols: 3,
      // The two numbers wear the colours of their cubes in the helper below.
      stimulus: { glyphs: [{ text: String(a), tone: 'a' }, op, { text: String(b), tone: 'b' }, '=', '?'] },
      options: buildNumberOptions(answer, choicesCount, optionSpread(step)).map((value) => ({ id: String(value), glyphs: [String(value)] })),
      correctId: String(answer),
      counting: countingFor(a, b, op, answer),
      hint: T.mental.hint(a, b, op),
    },
  };
}
