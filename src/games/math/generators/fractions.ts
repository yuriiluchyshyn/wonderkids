import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import { pick, randInt, shuffle, uid } from '@/core/utils/random';
import type { FractionValue, GridChoicePayload } from '@/core/game/templates/types';
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
function sameDenominatorOptions(answer: FractionValue, denom: number): FractionValue[] {
  const others = shuffle(
    Array.from({ length: denom }, (_, i) => i + 1).filter((n) => n !== answer.n),
  ).slice(0, OPTIONS - 1);
  return [answer.n, ...others].sort((x, y) => x - y).map((n) => ({ n, d: denom }));
}

/**
 * Generates a "find the fraction" task: a food is split into `denom` slices,
 * `filled` of them are highlighted, and the child taps the matching fraction.
 */
const NUMBER_WORDS = ['нуль', 'один', 'два', 'три', 'чотири', "п'ять", 'шість', 'сім', 'вісім'];

export function generateFraction(config: TaskConfig): TaskInstance<GridChoicePayload> {
  const { step } = config;
  const maxD = fractionDenomMax(step);
  const denom = randInt(2, maxD);
  const filled = randInt(1, denom - 1);
  const food = pick(FOODS);
  const answer: FractionValue = { n: filled, d: denom };

  return {
    id: uid('fr'),
    // Same fraction on a different food is the SAME task — never ask it twice.
    key: `fraction:${filled}/${denom}`,
    prompt: `Яка частинка ${food.name} зафарбована?`,
    reward: rewardForStep(step),
    payload: {
      template: Mechanics.GridChoice,
      cols: 2,
      stimulus: { pie: { food: food.emoji, denom, filled } },
      options: sameDenominatorOptions(answer, denom).map((f) => ({ id: `${f.n}/${f.d}`, glyphs: [f] })),
      correctId: `${filled}/${denom}`,
      // Count the highlighted slices aloud: «Один, два, три — з чотирьох!»
      hint: `Полічімо зафарбовані шматочки: ${Array.from({ length: filled }, (_, i) => NUMBER_WORDS[i + 1]).join(', ')}. Усього шматочків ${denom}. Отже, це ${filled} з ${denom}!`,
    },
  };
}
