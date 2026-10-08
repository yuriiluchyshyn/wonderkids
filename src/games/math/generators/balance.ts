import { heaps } from './options';
import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import type { BalanceScalePayload, Card, FractionValue, Glyph } from '@/core/game/templates/types';
import { pick, randInt, shuffle, uid } from '@/core/utils/random';
import { rewardForStep } from '../difficulty';
import { buildNumberOptions } from './options';

type Weight = Card & { value: number };

const numberWeight = (n: number): Weight => ({ id: `w${n}`, glyphs: [String(n)], value: n });
const fractionWeight = (f: FractionValue): Weight => ({ id: `w${f.n}_${f.d}`, glyphs: [f], value: f.n / f.d });

/** Simple fractions and an equal, un-reduced way of writing each. */
const EQUIVALENTS: { simple: FractionValue; same: FractionValue[] }[] = [
  { simple: { n: 1, d: 2 }, same: [{ n: 2, d: 4 }, { n: 3, d: 6 }, { n: 4, d: 8 }, { n: 5, d: 10 }] },
  { simple: { n: 1, d: 3 }, same: [{ n: 2, d: 6 }, { n: 3, d: 9 }, { n: 4, d: 12 }] },
  { simple: { n: 2, d: 3 }, same: [{ n: 4, d: 6 }, { n: 6, d: 9 }, { n: 8, d: 12 }] },
  { simple: { n: 1, d: 4 }, same: [{ n: 2, d: 8 }, { n: 3, d: 12 }] },
  { simple: { n: 3, d: 4 }, same: [{ n: 6, d: 8 }, { n: 9, d: 12 }] },
  { simple: { n: 1, d: 5 }, same: [{ n: 2, d: 10 }] },
];

/**
 * «Математичні ваги» (UI_BALANCE_SCALE): the left pan holds a sum or a
 * fraction; the child drags the weight that balances it. Path: + → − → × →
 * equivalent fractions.
 */
export function generateBalance(config: TaskConfig): TaskInstance<BalanceScalePayload> {
  const { step } = config;
  const base = {
    id: uid('bl'),
    prompt: 'Зрівноваж ваги! Яка гиря важить стільки ж?',
    reward: rewardForStep(step) + 1,
  };

  if (step >= 12) {
    const eq = pick(EQUIVALENTS);
    const left = pick(eq.same);
    const others = shuffle(EQUIVALENTS.filter((e) => e !== eq)).slice(0, 3).map((e) => e.simple);
    return {
      ...base,
      key: `eq:${left.n}/${left.d}`,
      payload: {
        template: Mechanics.BalanceScale,
        left: { glyphs: [left], value: left.n / left.d },
        weights: shuffle([eq.simple, ...others]).map(fractionWeight),
        hint: `Скороти дріб: поділи верх і низ на одне й те саме число. ${left.n} з ${left.d} — це стільки ж, скільки ${eq.simple.n} з ${eq.simple.d}.`,
      },
    };
  }

  let glyphs: Glyph[];
  let answer: number;
  let hintDots: number[] | undefined;
  let hint: string;
  if (step <= 5) {
    const a = randInt(1, 4 + step * 2);
    const b = randInt(1, 4 + step * 2);
    glyphs = [String(a), '+', String(b)];
    answer = a + b;
    hintDots = answer <= 24 ? [a, b] : undefined;
    hint = `Полічи всі крапки разом: ${a} і ще ${b}.`;
  } else if (step <= 8) {
    const a = randInt(6, 10 + step * 2);
    const b = randInt(1, a - 1);
    glyphs = [String(a), '−', String(b)];
    answer = a - b;
    hintDots = answer <= 24 ? [answer] : undefined;
    hint = `Було ${a}, забрали ${b}. Полічи, скільки крапок лишилось.`;
  } else {
    const a = randInt(2, 5);
    const b = randInt(2, step - 4);
    glyphs = [String(a), '×', String(b)];
    answer = a * b;
    hintDots = answer <= 24 ? Array.from({ length: a }, () => b) : undefined;
    hint = `Це ${heaps(a)} по ${b}. Полічи всі крапки.`;
  }

  return {
    ...base,
    key: glyphs.join(''),
    payload: {
      template: Mechanics.BalanceScale,
      left: { glyphs, value: answer },
      weights: buildNumberOptions(answer, 4, 4).map(numberWeight),
      hintDots,
      hint,
    },
  };
}
