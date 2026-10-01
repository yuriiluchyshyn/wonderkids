import type { TaskConfig, TaskInstance } from '@/core/kernel/types';
import { pick, randInt, uid } from '@/core/utils/random';
import { buildNumberOptions } from './options';
import { MATH_SUB, type MathOp, type MentalMathPayload } from '../math.types';
import { addSubMax, divFactorMax, mulFactorMax, optionSpread, rewardForStep } from '../difficulty';

function spokenPrompt(a: number, b: number, op: MathOp): string {
  const word =
    op === '+' ? 'плюс' : op === '-' ? 'мінус' : op === '×' ? 'помножити на' : 'поділити на';
  return `Скільки буде ${a} ${word} ${b}?`;
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
export function generateMentalMath(config: TaskConfig): TaskInstance<MentalMathPayload> {
  const { step, subCategoryId } = config;
  const resolved = opForSub(subCategoryId);
  const op: MathOp = resolved === 'mixed' ? pick<MathOp>(['+', '-', '×', '÷']) : resolved;

  let a: number;
  let b: number;
  let answer: number;

  if (op === '×') {
    const max = mulFactorMax(step);
    a = randInt(2, max);
    b = randInt(2, max);
    answer = a * b;
  } else if (op === '÷') {
    // Build from the answer so the division is always exact.
    const max = divFactorMax(step);
    b = randInt(2, max); // divisor
    answer = randInt(1, max); // quotient
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
    prompt: spokenPrompt(a, b, op),
    reward: rewardForStep(step),
    payload: {
      kind: 'mental',
      a,
      b,
      op,
      answer,
      options: buildNumberOptions(answer, 4, optionSpread(step)),
    },
  };
}
