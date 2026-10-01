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

function distractorFractions(answer: Fraction, denom: number): Fraction[] {
  const used = new Set<number>([answer.n]);
  const options: Fraction[] = [answer];
  let guard = 0;
  while (options.length < 3 && guard < 40) {
    guard += 1;
    const n = randInt(1, denom - 1);
    if (!used.has(n)) {
      used.add(n);
      options.push({ n, d: denom });
    }
  }
  return shuffle(options);
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
    prompt: `Яка частинка ${food.name} зафарбована?`,
    reward: rewardForStep(step),
    payload: {
      kind: 'fraction',
      food: food.emoji,
      foodName: food.name,
      denom,
      filled,
      answer,
      options: distractorFractions(answer, denom),
    },
  };
}
