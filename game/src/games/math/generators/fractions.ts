import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import { pick, randInt, shuffle, uid } from '@/core/utils/random';
import type { FractionValue, GridChoicePayload } from '@/core/game/templates/types';
import { fractionDenomMax, rewardForStep } from '../difficulty';
import { mathTexts } from '../grammar';

/** The 7 sensory foods from the PRD "Смачні Дроби" spec (§4.1). */
/** The foods a slice is cut from; their names are the language's (`fractions.foods`, in this order). */
const FOODS = ['🍕', '🎂', '🍏', '🍉', '🍊', '🥧', '🍫'];

/** Nine answers, as on every tap-the-answer board. */
const OPTIONS = 9;

/**
 * The right fraction and eight others that are never equal to it (2/4 is not
 * offered beside 1/2). Fractions of the same denominator come first — the
 * child compares "how many slices" — then neighbours with one slice more or
 * fewer in the whole.
 */
function fractionOptions(answer: FractionValue): FractionValue[] {
  const equal = (f: FractionValue) => f.n * answer.d === answer.n * f.d;
  const taken = new Set([`${answer.n}/${answer.d}`]);
  const out = [answer];
  const offer = (f: FractionValue) => {
    const id = `${f.n}/${f.d}`;
    if (out.length >= OPTIONS || taken.has(id) || equal(f) || out.some((o) => o.n * f.d === f.n * o.d)) return;
    taken.add(id);
    out.push(f);
  };
  const slices = (d: number) => shuffle(Array.from({ length: d - 1 }, (_, i) => ({ n: i + 1, d })));
  slices(answer.d).forEach(offer);
  for (const d of [answer.d + 1, answer.d - 1, answer.d + 2, answer.d - 2, answer.d + 3]) if (d >= 2) slices(d).forEach(offer);
  return shuffle(out);
}

/**
 * Generates a "find the fraction" task: a food is split into `denom` slices,
 * `filled` of them are highlighted, and the child taps the matching fraction.
 */
export function generateFraction(config: TaskConfig): TaskInstance<GridChoicePayload> {
  const { step } = config;
  const maxD = fractionDenomMax(step);
  const denom = randInt(2, maxD);
  const filled = randInt(1, denom - 1);
  const T = mathTexts(config.lang);
  const food = pick(FOODS);
  const answer: FractionValue = { n: filled, d: denom };

  return {
    id: uid('fr'),
    // Same fraction on a different food is the SAME task — never ask it twice.
    key: `fraction:${filled}/${denom}`,
    prompt: T.fractions.prompt(T.fractions.foods[FOODS.indexOf(food)]),
    reward: rewardForStep(step),
    payload: {
      template: Mechanics.GridChoice,
      cols: 3,
      stimulus: { pie: { food, denom, filled } },
      // Written on one line, with a slash: nine stacked fractions would not fit a phone.
      options: fractionOptions(answer).map((f) => ({ id: `${f.n}/${f.d}`, glyphs: [`${f.n}/${f.d}`] })),
      correctId: `${filled}/${denom}`,
      // Count the highlighted slices aloud: «Один, два, три — з чотирьох!»
      hint: T.fractions.hint(filled, denom),
    },
  };
}
