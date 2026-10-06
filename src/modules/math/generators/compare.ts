import type { TaskConfig, TaskInstance } from '@/core/kernel/types';
import type { Card, GridChoicePayload } from '@/core/templates/types';
import { pick, randInt, uid } from '@/core/utils/random';
import { rewardForStep } from '../difficulty';

/** One side of a comparison: how it is written, read aloud, and what it is worth. */
interface Side {
  text: string;
  speak: string;
  value: number;
}

const number = (n: number): Side => ({ text: String(n), speak: String(n), value: n });

function sum(max: number): Side {
  const a = randInt(1, max);
  const b = randInt(1, max);
  return { text: `${a} + ${b}`, speak: `${a} плюс ${b}`, value: a + b };
}

function difference(max: number): Side {
  const a = randInt(3, max);
  const b = randInt(1, a - 1);
  return { text: `${a} − ${b}`, speak: `${a} мінус ${b}`, value: a - b };
}

function product(): Side {
  const a = randInt(2, 6);
  const b = randInt(2, 9);
  return { text: `${a} × ${b}`, speak: `${a} помножити на ${b}`, value: a * b };
}

/**
 * Measures: the same quantity in a big and a small unit. `rule` is what the
 * helper reminds the child of.
 */
const UNITS = [
  { big: 'м', bigSpeak: ['метр', 'метри', 'метрів'], small: 'см', smallSpeak: 'сантиметрів', per: 100, rule: 'В одному метрі — сто сантиметрів.' },
  { big: 'кг', bigSpeak: ['кілограм', 'кілограми', 'кілограмів'], small: 'г', smallSpeak: 'грамів', per: 1000, rule: 'В одному кілограмі — тисяча грамів.' },
  { big: 'год', bigSpeak: ['година', 'години', 'годин'], small: 'хв', smallSpeak: 'хвилин', per: 60, rule: 'В одній годині — шістдесят хвилин.' },
  { big: 'грн', bigSpeak: ['гривня', 'гривні', 'гривень'], small: 'коп', smallSpeak: 'копійок', per: 100, rule: 'В одній гривні — сто копійок.' },
  { big: 'см', bigSpeak: ['сантиметр', 'сантиметри', 'сантиметрів'], small: 'мм', smallSpeak: 'міліметрів', per: 10, rule: 'В одному сантиметрі — десять міліметрів.' },
  { big: 'л', bigSpeak: ['літр', 'літри', 'літрів'], small: 'мл', smallSpeak: 'мілілітрів', per: 1000, rule: 'В одному літрі — тисяча мілілітрів.' },
] as const;

const plural = (n: number, forms: readonly [string, string, string] | readonly string[]) =>
  n === 1 ? forms[0] : n >= 2 && n <= 4 ? forms[1] : forms[2];

/** A big-unit amount against a small-unit one: more, less, or exactly equal. */
function measures(): { left: Side; right: Side; rule: string } {
  const unit = pick(UNITS);
  const n = randInt(1, 3);
  const exact = n * unit.per;
  // Near the conversion point, so the child has to actually convert.
  const shift = pick([0, 0, -1, 1]) * pick([unit.per / 10, unit.per / 2, unit.per / 5]);
  const smallAmount = Math.max(1, Math.round(exact + shift));
  const big: Side = { text: `${n} ${unit.big}`, speak: `${n} ${plural(n, unit.bigSpeak)}`, value: exact };
  const small: Side = { text: `${smallAmount} ${unit.small}`, speak: `${smallAmount} ${unit.smallSpeak}`, value: smallAmount };
  return Math.random() < 0.5 ? { left: big, right: small, rule: unit.rule } : { left: small, right: big, rule: unit.rule };
}

const SIGNS: Card[] = [
  { id: 'lt', glyphs: ['<'], label: 'менше', speak: 'менше' },
  { id: 'eq', glyphs: ['='], label: 'дорівнює', speak: 'дорівнює' },
  { id: 'gt', glyphs: ['>'], label: 'більше', speak: 'більше' },
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
  let left: Side;
  let right: Side;
  let rule = 'Знак схожий на дзьобик пташки: він завжди відкритий до більшого числа.';

  if (step <= 2) {
    [left, right] = pair(() => number(randInt(1, 10)));
  } else if (step <= 4) {
    [left, right] = pair(() => number(randInt(10, step === 3 ? 30 : 100)));
  } else if (step <= 6) {
    [left, right] = pair(() => sum(step === 5 ? 6 : 12), () => number(randInt(3, step === 5 ? 12 : 24)));
    if (Math.random() < 0.5) [left, right] = [right, left];
  } else if (step <= 8) {
    [left, right] = Math.random() < 0.5 ? pair(() => sum(12)) : pair(() => difference(20), () => sum(8));
  } else if (step <= 10) {
    ({ left, right, rule } = measures());
  } else if (Math.random() < 0.5) {
    ({ left, right, rule } = measures());
  } else {
    [left, right] = pair(product, () => (Math.random() < 0.5 ? product() : sum(20)));
  }

  const correctId = left.value < right.value ? 'lt' : left.value > right.value ? 'gt' : 'eq';
  const verdict =
    correctId === 'eq'
      ? `${left.speak} дорівнює ${right.speak}`
      : `${left.speak} ${correctId === 'lt' ? 'менше, ніж' : 'більше, ніж'} ${right.speak}`;

  return {
    id: uid('cmp'),
    key: `cmp:${left.text}|${right.text}`,
    prompt: `Порівняй: ${left.speak} і ${right.speak}. Який знак поставити між ними?`,
    reward: rewardForStep(step),
    outro: `Так! ${verdict[0].toUpperCase()}${verdict.slice(1)}.`,
    payload: {
      template: 'UI_GRID_CHOICE',
      cols: 3,
      stimulus: { glyphs: [left.text, '?', right.text] },
      options: SIGNS,
      correctId,
      hint: `${rule} Порахуй, скільки ліворуч і скільки праворуч: ліворуч ${left.value}, праворуч ${right.value}.`,
    },
  };
}
