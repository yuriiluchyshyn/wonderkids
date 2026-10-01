import type { TaskConfig, TaskInstance } from '@/core/kernel/types';
import { pick, randInt, uid } from '@/core/utils/random';
import { buildNumberOptions } from './options';
import { MATH_SUB, type MathOp, type MentalMathPayload } from '../math.types';
import { addSubMax, mulFactorMax, optionSpread, rewardForStep } from '../difficulty';

function spokenPrompt(a: number, b: number, op: MathOp): string {
  const word = op === '+' ? 'плюс' : op === '-' ? 'мінус' : 'помножити на';
  return `Скільки буде ${a} ${word} ${b}?`;
}

/**
 * Rng-driven generator for a mental-math task, scaled by the path `step`. The
 * multiply sub-category yields '×'; the "mental" sub-category alternates +/-
 * and keeps subtraction non-negative so there is never a scary negative result.
 */
export function generateMentalMath(config: TaskConfig): TaskInstance<MentalMathPayload> {
  const { step, subCategoryId } = config;
  const isMultiply = subCategoryId === MATH_SUB.multiply;

  let a: number;
  let b: number;
  let op: MathOp;

  if (isMultiply) {
    const max = mulFactorMax(step);
    a = randInt(2, max);
    b = randInt(2, max);
    op = '×';
  } else {
    const max = addSubMax(step);
    op = pick<MathOp>(['+', '-']);
    if (op === '+') {
      a = randInt(1, max);
      b = randInt(1, Math.max(1, max - a));
    } else {
      // Subtraction: ensure a >= b for a friendly, non-negative answer.
      a = randInt(2, max);
      b = randInt(1, a);
    }
  }

  const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;

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
