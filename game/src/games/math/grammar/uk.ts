import { counted, countWord, num, ordinalWords } from '@/core/language/uk';
import { clockExplain, partOfDay } from './clockExplain';
import { CURRENCIES } from '@/core/game/content/currency';
import { LANGUAGES } from '@/core/language';
import type { MathTexts, MeasureWords } from '@/games/math/grammar/types';
import type { MathOp } from '@/games/math/ids';
import { chainTexts } from './expr';
import { divisibleBeats } from './divisible';
import { compareHelp, fractionsHelp } from './helps';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/uk/games/math.json';

/**
 * The Math galaxy in Ukrainian — the language it was written in. These are the
 * galaxy's original sentences, word for word.
 */

const { fraction, sign } = LANGUAGES.uk;
const plural = (n: number, forms: readonly string[]) => (n === 1 ? forms[0] : n >= 2 && n <= 4 ? forms[1] : forms[2]);
const measure = (big: string, bigForms: readonly string[], small: string, smallMany: string, rule: string): MeasureWords => ({
  big,
  bigSaid: (n) => `${n} ${plural(n, bigForms)}`,
  small,
  smallSaid: (n) => `${n} ${smallMany}`,
  rule,
});

const HOUR = J.HOUR;
/** «пів на третю», «чверть на п’яту» — the hour being headed for. */
const HOUR_TO = J.HOUR_TO;
const nextHour = (h: number) => (h % 12) + 1;
const NUMBER_WORDS = J.NUMBER_WORDS;
const CELLS = [J.CELLS[0], J.CELLS[1], J.CELLS[2]] as const;
const SHAPES = J.SHAPES;

function heaps(n: number): string {
  const ones = n % 10;
  const tens = n % 100;
  if (ones === 1 && tens !== 11) return fill(J.heaps[1], { n: num(n, 'f') });
  return ones >= 2 && ones <= 4 && !(tens >= 12 && tens <= 14) ? fill(J.heaps[2], { n: num(n, 'f') }) : fill(J.heaps[3], { n: num(n, 'f') });
}

/** «плюс», «помножити на» — an operation as it is read out. */
const opWord = (op: MathOp): string => {
  const words = J.mental.prompt.word;
  return op === '+' ? words[1] : op === '-' ? words[2] : op === '×' ? words[3] : words[4];
};


export const uk: MathTexts = {
  intro: {
    add: (it) => fill(J.intro.add, { it }),
    sub: (it) => fill(J.intro.sub, { it }),
    mul: (it) => fill(J.intro.mul, { it }),
    div: (it) => fill(J.intro.div, { it }),
    mixed: J.intro.mixed,
    fractions: J.intro.fractions,
    other: J.intro.other,
  },

  heaps,

  mental: {
    prompt: (a, b, op) => fill(J.mental.prompt._, { a, word: opWord(op), b }),
    hint: (a, b, op) => {
      if (op === '×') return fill(J.mental.hint[1], { a: heaps(a), b });
      if (op === '÷') return fill(J.mental.hint[2], { a, b });
      if (op === '-') return fill(J.mental.hint[3], { a, b });
      return fill(J.mental.hint[4], { a, b });
    },
    ...chainTexts(J.mental, opWord),
  },

  balance: {
    prompt: J.balance.prompt,
    reduce: (n, d, simpleN, simpleD) => fill(J.balance.reduce, { n, d, simpleN, simpleD }),
    add: (a, b) => fill(J.balance.add, { a, b }),
    sub: (a, b) => fill(J.balance.sub, { a, b }),
    mul: (a, b) => fill(J.balance.mul, { a: heaps(a), b }),
  },

  fractions: {
    foods: J.fractions.foods,
    prompt: (food) => fill(J.fractions.prompt, { food }),
    hint: (filled, denom) => fill(J.fractions.hint, { length: Array.from({ length: filled }, (_, i) => NUMBER_WORDS[i + 1]).join(', '), denom, filled }),
    help: (filled, denom) => fractionsHelp(J.fractions.help, Array.from({ length: filled }, (_, i) => NUMBER_WORDS[i + 1]).join(', '), filled, denom),
  },

  fractionOps: {
    intro: J.fractionOps.intro,
    prompt: (a, op, b) => fill(J.fractionOps.prompt, { a: fraction(a.n, a.d), op: sign(op), b: fraction(b.n, b.d) }),
    barFirst: (a) => fill(J.fractionOps.barFirst, { d: a.d, n: a.n, a: fraction(a.n, a.d) }),
    barAdd: (b) => fill(J.fractionOps.barAdd, { n: b.n, d: b.d }),
    barTake: (b) => fill(J.fractionOps.barTake, { n: b.n, d: b.d }),
    barCut: (a, b, d) => fill(J.fractionOps.barCut, { d, a: fraction(a.n, a.d), b: fraction(b.n, b.d), an: fraction(a.n * (d / a.d), d), bn: fraction(b.n * (d / b.d), d) }),
    barSameTotal: (total) => fill(J.fractionOps.barSameTotal, { n: total.n, d: total.d }),
    barTotal: (total) => fill(J.fractionOps.barTotal, { n: total.n, d: total.d }),
    barReduced: (total, simpler) => fill(J.fractionOps.barReduced, { total: fraction(total.n, total.d), simpler: fraction(simpler.n, simpler.d) }),
  },

  compare: {
    plus: (a, b) => fill(J.compare.plus, { a, b }),
    minus: (a, b) => fill(J.compare.minus, { a, b }),
    times: (a, b) => fill(J.compare.times, { a, b }),
    units: [
      measure(J.compare.units[0][1], J.compare.units[0][2], J.compare.units[0][3], J.compare.units[0][4], J.compare.units[0][5]),
      measure(J.compare.units[1][1], J.compare.units[1][2], J.compare.units[1][3], J.compare.units[1][4], J.compare.units[1][5]),
      measure(J.compare.units[2][1], J.compare.units[2][2], J.compare.units[2][3], J.compare.units[2][4], J.compare.units[2][5]),
      measure(J.compare.units[3][1], J.compare.units[3][2], J.compare.units[3][3], J.compare.units[3][4], J.compare.units[3][5]),
      measure(J.compare.units[4][1], J.compare.units[4][2], J.compare.units[4][3], J.compare.units[4][4], J.compare.units[4][5]),
    ],
    signs: J.compare.signs,
    rule: J.compare.rule,
    verdict: (left, right, sign) => (sign === 'eq' ? fill(J.compare.verdict[1], { left, right }) : `${left} ${sign === 'lt' ? J.compare.verdict[2] : J.compare.verdict[3]} ${right}`),
    prompt: (left, right) => fill(J.compare.prompt, { left, right }),
    yes: (verdict) => fill(J.compare.yes, { verdict: verdict[0].toUpperCase(), verdict2: verdict.slice(1) }),
    hint: (rule, left, right) => fill(J.compare.hint, { rule, left, right }),
    help: compareHelp(J.compare.help),
  },

  clock: {
    say: ({ h, m }) => {
      if (m === 0) return fill(J.clock.say[1], { h: HOUR[h] });
      if (m === 30) return fill(J.clock.say[2], { h: HOUR_TO[nextHour(h)] });
      if (m === 15) return fill(J.clock.say[3], { h: HOUR_TO[nextHour(h)] });
      if (m === 45) return fill(J.clock.say[4], { h: HOUR[nextHour(h)] });
      return fill(J.clock.say[5], { h: HOUR[h], m });
    },
    intro: J.clock.intro,
    say24: (hour24, m) => (m === 0 ? fill(J.clock.say24[1], { h: ordinalWords(hour24, 'f') }) : fill(J.clock.say24[2], { h: ordinalWords(hour24, 'f'), m })),
    explain: (time, told, hour24) => clockExplain(J.clock, time, told, hour24),
    yes: (time) => fill(J.clock.yes, { time }),
    find: (time) => fill(J.clock.find, { time }),
    read: J.clock.read,
    read24: (hour24) => fill(J.clock.read24, { part: J.clock.parts[partOfDay(hour24)] }),
  },

  maze: {
    negatives: J.maze.negatives,
    deadEnds: J.maze.deadEnds,
    table: (k) => fill(J.maze.table, { k, k2: k * 2, k3: k * 3 }),
    divisible: (k) => fill(J.maze.divisible, { k }),
    hint: (k, deadEnds, negative) =>
      fill(J.maze.hint[1], { k }) +
      (deadEnds ? J.maze.hint[2] : '') +
      (negative ? J.maze.hint[3] : ''),
    divisibleBeats: (k, how, marks) => divisibleBeats(J.maze.rule, k, how, marks),
  },

  shop: {
    toys: J.shop.toys,
    change: (toy, price, paid) => fill(J.shop.change, { toy: toy[0].toUpperCase(), toy2: toy.slice(1), price, paid }),
    buy: (toy, price) => fill(J.shop.buy, { toy, price }),
    changeHint: (paid, price) => fill(J.shop.changeHint, { paid, price }),
    payHint: (price) => fill(J.shop.payHint, { price }),
  },

  geometry: {
    figures: Object.values(J.geometry.figures).map((f) => [f[0], f[1].join(' ')] as const),
    figureParts: Object.values(J.geometry.figures).map((f) => f[1]),
    build: (name) => fill(J.geometry.build, { name }),
    buildHint: J.geometry.buildHint,
    count: (name, shape) => fill(J.geometry.count, { name, many: SHAPES[shape].many }),
    countHint: (shape) => fill(J.geometry.countHint, { one: SHAPES[shape].one }),
    areaRead: J.geometry.areaRead,
    areaIs: (area) => fill(J.geometry.areaIs, { area }),
    areaHint: J.geometry.areaHint,
    pens: J.geometry.pens,
    pen: (animal, area) => fill(J.geometry.pen, { animal, area: counted(area, CELLS) }),
    penDone: (area) => fill(J.geometry.penDone, { area: counted(area, CELLS) }),
    penHint: (area) => fill(J.geometry.penHint, { area: counted(area, CELLS) }),
    perimeterRead: J.geometry.perimeterRead,
    perimeterIs: (length) => fill(J.geometry.perimeterIs, { length }),
    perimeterHint: J.geometry.perimeterHint,
    longest: J.geometry.longest,
    longestIs: (length) => fill(J.geometry.longestIs, { length }),
    longestHint: J.geometry.longestHint,
    intro: J.geometry.intro,
  },

  // The currencies' Ukrainian words are those of `core/game/content/currency.ts`.
  money: (id) => {
    const m = CURRENCIES[id];
    return {
      short: m.short,
      sum: (n) => `${num(n, m.gender)} ${countWord(n, m.counted)}`,
      measure: measure(m.short, m.counted, m.minor.short, m.minor.many, m.minor.rule),
    };
  },
};
