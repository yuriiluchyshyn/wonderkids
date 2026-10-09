import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import type { GridChoicePayload } from '@/core/game/templates/types';
import { pick, randInt, uid } from '@/core/utils/random';
import { currencyOf, type CurrencyId } from '@/core/game/content/currency';
import { rewardForStep } from '../difficulty';
import { mathTexts, type MathTexts } from '../lang';
import type { MeasureWords } from '../lang/types';

/** One side of a comparison: how it is written, read aloud, and what it is worth. */
interface Side {
  text: string;
  speak: string;
  value: number;
}

const number = (n: number): Side => ({ text: String(n), speak: String(n), value: n });

function sum(max: number, T: MathTexts): Side {
  const a = randInt(1, max);
  const b = randInt(1, max);
  return { text: `${a} + ${b}`, speak: T.compare.plus(a, b), value: a + b };
}

function difference(max: number, T: MathTexts): Side {
  const a = randInt(3, max);
  const b = randInt(1, a - 1);
  return { text: `${a} − ${b}`, speak: T.compare.minus(a, b), value: a - b };
}

function product(T: MathTexts): Side {
  const a = randInt(2, 6);
  const b = randInt(2, 9);
  return { text: `${a} × ${b}`, speak: T.compare.times(a, b), value: a * b };
}

/**
 * Measures: the same quantity in a big and a small unit. `rule` is what the
 * helper reminds the child of.
 */
const PER = [100, 1000, 60, 10, 1000];

/** A big-unit amount against a small-unit one: more, less, or exactly equal. */
function measures(money: CurrencyId, T: MathTexts): { left: Side; right: Side; rule: string } {
  // One of the five pairs of measures (the languages' `compare.units`: m, kg, h, cm, l — as many of the smaller in one of the bigger as `PER` says), or the parent's money with its small change.
  const at = randInt(0, PER.length);
  const unit: MeasureWords = at < PER.length ? T.compare.units[at] : T.money(money).measure;
  const per = at < PER.length ? PER[at] : 100;
  const n = randInt(1, 3);
  const exact = n * per;
  // Either exactly equal, or off by a visible amount.
  const shift = pick([0, 0, -1, 1]) * pick([per / 10, per / 2, per / 5]);
  const smallAmount = Math.max(1, Math.round(exact + shift));
  const big: Side = { text: `${n} ${unit.big}`, speak: unit.bigSaid(n), value: exact };
  const small: Side = { text: `${smallAmount} ${unit.small}`, speak: unit.smallSaid(smallAmount), value: smallAmount };
  return Math.random() < 0.5 ? { left: big, right: small, rule: unit.rule } : { left: small, right: big, rule: unit.rule };
}

/** The three signs; what each is called is the language's (`compare.signs`). */
const SIGNS: { id: 'lt' | 'eq' | 'gt'; glyphs: string[] }[] = [
  { id: 'lt', glyphs: ['<'] },
  { id: 'eq', glyphs: ['='] },
  { id: 'gt', glyphs: ['>'] },
];

/** Roughly one task in four is an equality, so «=» is a real answer. */
function pair(make: () => Side, other: () => Side = make): [Side, Side] {
  const left = make();
  if (Math.random() < 0.25) return [left, number(left.value)];
  return [left, other()];
}

/**
 * «Більше, менше, дорівнює» (UI_GRID_CHOICE): pick the sign that belongs
 * between two things. Path: numbers to 10 → to 100 → a sum against a number →
 * two expressions → measures (metres and centimetres, hours and minutes…) →
 * products and everything mixed.
 */
export function generateCompare(config: TaskConfig): TaskInstance<GridChoicePayload> {
  const { step } = config;
  const T = mathTexts(config.lang);
  const money = currencyOf(config.currency).id;
  let left: Side;
  let right: Side;
  let rule = T.compare.rule;

  if (step <= 2) {
    [left, right] = pair(() => number(randInt(1, 10)));
  } else if (step <= 4) {
    [left, right] = pair(() => number(randInt(10, step === 3 ? 30 : 100)));
  } else if (step <= 6) {
    [left, right] = pair(() => sum(step === 5 ? 6 : 12, T), () => number(randInt(3, step === 5 ? 12 : 24)));
    if (Math.random() < 0.5) [left, right] = [right, left];
  } else if (step <= 8) {
    [left, right] = Math.random() < 0.5 ? pair(() => sum(12, T)) : pair(() => difference(20, T), () => sum(8, T));
  } else if (step <= 10) {
    ({ left, right, rule } = measures(money, T));
  } else if (Math.random() < 0.5) {
    ({ left, right, rule } = measures(money, T));
  } else {
    [left, right] = pair(() => product(T), () => (Math.random() < 0.5 ? product(T) : sum(20, T)));
  }

  const correctId = left.value < right.value ? 'lt' : left.value > right.value ? 'gt' : 'eq';
  const verdict = T.compare.verdict(left.speak, right.speak, correctId);

  return {
    id: uid('cmp'),
    key: `cmp:${left.text}|${right.text}`,
    prompt: T.compare.prompt(left.speak, right.speak),
    reward: rewardForStep(step),
    outro: T.compare.yes(verdict),
    payload: {
      template: Mechanics.GridChoice,
      cols: 3,
      stimulus: { glyphs: [left.text, '?', right.text] },
      options: SIGNS.map((sign) => ({ ...sign, label: T.compare.signs[sign.id], speak: T.compare.signs[sign.id] })),
      correctId,
      hint: T.compare.hint(rule, left.value, right.value),
    },
  };
}
