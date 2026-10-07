import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import { glyphSpeech, type Card, type FractionValue, type Glyph, type GridChoicePayload } from '@/core/game/templates/types';
import { pick, randInt, shuffle, uid } from '@/core/utils/random';
import { rewardForStep } from '../difficulty';

type Op = '+' | '−' | '×' | '÷';

/** Which kind of fraction sum a path step practises (PRD v4.0, game 2). */
export type FractionOpsTier = 'addSame' | 'subSame' | 'unlike' | 'mul' | 'div' | 'mixed';

export function fractionOpsTier(step: number): FractionOpsTier {
  if (step <= 4) return 'addSame';
  if (step <= 8) return 'subSame';
  if (step <= 12) return 'unlike';
  if (step <= 15) return 'mul';
  if (step <= 18) return 'div';
  return 'mixed';
}

/** Child-level explanation shown before each new kind of task. */
export const FRACTION_OPS_INTRO: Record<FractionOpsTier, string> = {
  addSame:
    'Коли знаменники однакові, шматочки однакового розміру. Просто додай верхні числа, а нижнє залиш таким самим: одна четверта плюс дві четверті — це три четверті.',
  subSame:
    'Віднімаємо так само: шматочки однакові, тому від верхнього числа забираємо верхнє, а нижнє не змінюємо. Три четверті мінус одна четверта — це дві четверті.',
  unlike:
    'Тепер знаменники різні — шматочки різного розміру. Спершу зроби їх однаковими: знайди спільний знаменник, а тоді додавай чи віднімай верхні числа. Одна друга — це те саме, що дві четверті!',
  mul: 'Щоб помножити дроби, множимо верх на верх і низ на низ. Одна друга від однієї третьої — це одна шоста.',
  div: 'Щоб поділити на дріб, перевертаємо другий дріб і множимо. Поділити на одну другу — те саме, що помножити на два.',
  mixed: 'Тут усі дії разом. Дивись уважно на знак і згадай правило для кожної дії!',
};

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

export function reduce(f: FractionValue): FractionValue {
  const g = gcd(f.n, f.d) || 1;
  return { n: f.n / g, d: f.d / g };
}

function apply(a: FractionValue, b: FractionValue, op: Op): FractionValue {
  switch (op) {
    case '+':
      return { n: a.n * b.d + b.n * a.d, d: a.d * b.d };
    case '−':
      return { n: a.n * b.d - b.n * a.d, d: a.d * b.d };
    case '×':
      return { n: a.n * b.n, d: a.d * b.d };
    default:
      return { n: a.n * b.d, d: a.d * b.n };
  }
}

const proper = (maxD: number): FractionValue => {
  const d = randInt(2, maxD);
  return { n: randInt(1, d - 1), d };
};

interface Sum {
  a: FractionValue;
  b: FractionValue;
  op: Op;
  answer: FractionValue;
}

function draw(tier: Exclude<FractionOpsTier, 'mixed'>): Sum {
  if (tier === 'addSame' || tier === 'subSame') {
    const d = randInt(3, 9);
    if (tier === 'addSame') {
      const n1 = randInt(1, d - 2);
      const n2 = randInt(1, d - 1 - n1);
      // Same-denominator answers keep the denominator — that IS the lesson.
      return { a: { n: n1, d }, b: { n: n2, d }, op: '+', answer: { n: n1 + n2, d } };
    }
    const n1 = randInt(2, d - 1);
    const n2 = randInt(1, n1 - 1);
    return { a: { n: n1, d }, b: { n: n2, d }, op: '−', answer: { n: n1 - n2, d } };
  }
  const op: Op = tier === 'unlike' ? pick<Op>(['+', '−']) : tier === 'mul' ? '×' : '÷';
  for (let guard = 0; guard < 60; guard += 1) {
    let a = proper(tier === 'unlike' ? 6 : 5);
    let b = proper(tier === 'unlike' ? 6 : 5);
    if (tier === 'unlike' && a.d === b.d) continue;
    if (op === '−' && a.n * b.d <= b.n * a.d) [a, b] = [b, a];
    const answer = reduce(apply(a, b, op));
    // Keep results friendly: a real fraction with small numbers.
    if (answer.n <= 0 || answer.d === 1 || answer.d > 30 || answer.n > 30) continue;
    return { a, b, op, answer };
  }
  return { a: { n: 1, d: 2 }, b: { n: 1, d: 3 }, op: '×', answer: { n: 1, d: 6 } };
}

const same = (x: FractionValue, y: FractionValue) => x.n === y.n && x.d === y.d;

/** Near-misses a child makes for real (e.g. adding the denominators too). */
function distractors({ a, b, op, answer }: Sum): FractionValue[] {
  const typical: FractionValue[] =
    op === '+' || op === '−'
      ? [
          { n: op === '+' ? a.n + b.n : Math.abs(a.n - b.n), d: a.d + b.d },
          { n: op === '+' ? a.n + b.n : Math.abs(a.n - b.n), d: Math.max(a.d, b.d) },
        ]
      : [
          { n: a.n * b.d, d: a.d * b.n },
          { n: a.n * b.n, d: a.d * b.d },
          { n: a.n + b.n, d: a.d + b.d },
        ];
  const near: FractionValue[] = [
    { n: answer.n + 1, d: answer.d },
    { n: answer.n - 1, d: answer.d },
    { n: answer.n, d: answer.d + 1 },
    { n: answer.n + 1, d: answer.d + 1 },
    { n: answer.n, d: Math.max(2, answer.d - 1) },
  ];
  const out: FractionValue[] = [];
  for (const f of [...shuffle(typical), ...shuffle(near)]) {
    if (f.n <= 0 || f.d <= 1) continue;
    if (same(f, answer) || out.some((o) => same(o, f))) continue;
    out.push(f);
    if (out.length === 3) break;
  }
  return out;
}

/** «Дроби: дії» — add, subtract, multiply and divide fractions (UI_GRID_CHOICE). */
export function generateFractionOps(config: TaskConfig): TaskInstance<GridChoicePayload> {
  const tier = fractionOpsTier(config.step);
  const sum = draw(tier === 'mixed' ? pick(['addSame', 'subSame', 'unlike', 'mul', 'div'] as const) : tier);
  const glyphs: Glyph[] = [sum.a, sum.op, sum.b, '=', '?'];
  const options: Card[] = shuffle([sum.answer, ...distractors(sum)]).map((f) => ({
    id: `${f.n}/${f.d}`,
    glyphs: [f],
  }));

  return {
    id: uid('fo'),
    key: `${sum.a.n}/${sum.a.d}${sum.op}${sum.b.n}/${sum.b.d}`,
    prompt: `Обчисли: ${[sum.a, sum.op, sum.b].map(glyphSpeech).join(' ')}`,
    reward: rewardForStep(config.step) + 1,
    payload: {
      template: 'UI_GRID_CHOICE',
      cols: 2,
      stimulus: { glyphs },
      options,
      correctId: `${sum.answer.n}/${sum.answer.d}`,
      hint: FRACTION_OPS_INTRO[tier === 'mixed' ? 'unlike' : tier],
    },
  };
}
