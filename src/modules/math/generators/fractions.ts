import type { TaskConfig, TaskInstance } from '@/core/kernel/types';
import { pick, randInt, shuffle, uid } from '@/core/utils/random';
import { type Fraction, type FractionPayload } from '../math.types';
import { fractionDenomMax, rewardForStep } from '../difficulty';

/** The 7 sensory foods from the PRD "Смачні Дроби" spec (§4.1). */
const FOODS: { emoji: string; name: string }[] = [
  { emoji: '🍕', name: 'піци' },
  { emoji: '🎂', name: 'торта' },
  { emoji: '🍏', name: 'яблука' },
  { emoji: '🍉', name: 'кавуна' },
  { emoji: '🍊', name: 'апельсина' },
  { emoji: '🥧', name: 'пирога' },
  { emoji: '🍫', name: 'шоколадки' },
];

/** How many answers to offer: 1/4, 2/4, 3/4, 4/4 (PRD v4.0, game 1). */
const OPTIONS = 4;

/**
 * Answers share the task's denominator, so the child compares "how many
 * slices", not unrelated fractions. Small denominators simply offer fewer.
 */
function sameDenominatorOptions(answer: Fraction, denom: number): Fraction[] {
  const others = shuffle(
    Array.from({ length: denom }, (_, i) => i + 1).filter((n) => n !== answer.n),
  ).slice(0, OPTIONS - 1);
  return [answer.n, ...others].sort((x, y) => x - y).map((n) => ({ n, d: denom }));
}

/**
 * Generates a "find the fraction" task: a food is split into `denom` slices,
 * `filled` of them are highlighted, and the child taps the matching fraction.
 */
export function generateFraction(config: TaskConfig): TaskInstance<FractionPayload> {
  const { step } = config;
  const maxD = fractionDenomMax(step);
  const denom = randInt(2, maxD);
  const filled = randInt(1, denom - 1);
  const food = pick(FOODS);
  const answer: Fraction = { n: filled, d: denom };

  return {
    id: uid('fr'),
    // Same fraction on a different food is the SAME task — never ask it twice.
    key: `fraction:${filled}/${denom}`,
    prompt: `Яка частинка ${food.name} зафарбована?`,
    reward: rewardForStep(step),
    payload: {
      kind: 'fraction',
      food: food.emoji,
      foodName: food.name,
      denom,
      filled,
      answer,
      options: sameDenominatorOptions(answer, denom),
    },
  };
}
