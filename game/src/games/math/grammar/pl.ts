import { LANGUAGES } from '@/core/language';
import { num, numberWords, ordinalWords, type Gender } from '@/core/language/pl';
import type { CurrencyId } from '@/core/game/content/currency';
import type { MathTexts, MeasureWords, Shape } from '@/games/math/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/pl/games/math.json';

/** The Math galaxy in Polish. */

/** «1 kratka», «3 kratki», «5 kratek» — the form a count asks for. */
const form = (n: number, forms: readonly [one: string, few: string, many: string]): string =>
  n === 1 ? forms[0] : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? forms[1] : forms[2];
/** A count with its thing: shown «2 kratki», said «dwie kratki». */
const counted = (n: number, forms: readonly [string, string, string], gender: Gender): string => `${num(n, gender)} ${form(n, forms)}`;

const measure = (big: string, bigForms: readonly [string, string, string], small: string, smallMany: string, rule: string): MeasureWords => ({
  big,
  // Plain digits: this stands inside a prompt that is shown as it is said, and the voice knows «dwie godziny» (`core/language/pl/voice.ts`).
  bigSaid: (n) => `${n} ${form(n, bigForms)}`,
  small,
  smallSaid: (n) => `${n} ${smallMany}`,
  rule,
});

const { fraction, sign } = LANGUAGES.pl;
const SQUARES = [J.SQUARES[0], J.SQUARES[1], J.SQUARES[2]] as const;
const SHAPES: Record<Shape, string> = J.SHAPES;
const OPS = J.OPS;

const heaps = (n: number): string => `${num(n, 'f')} ${form(n, [J.heaps[0], J.heaps[1], J.heaps[2]])}`;

export const MONEY: Record<CurrencyId, { short: string; forms: readonly [string, string, string]; gender: Gender; small: string; smallMany: string; rule: string }> = {
  UAH: { short: J.MONEY.UAH.short, forms: [J.MONEY.UAH.forms[0], J.MONEY.UAH.forms[1], J.MONEY.UAH.forms[2]], gender: 'f', small: J.MONEY.UAH.small, smallMany: J.MONEY.UAH.smallMany, rule: J.MONEY.UAH.rule },
  EUR: { short: '€', forms: [J.MONEY.EUR.forms[0], J.MONEY.EUR.forms[1], J.MONEY.EUR.forms[2]], gender: 'n', small: J.MONEY.EUR.small, smallMany: J.MONEY.EUR.smallMany, rule: J.MONEY.EUR.rule },
  USD: { short: '$', forms: [J.MONEY.USD.forms[0], J.MONEY.USD.forms[1], J.MONEY.USD.forms[2]], gender: 'm', small: '¢', smallMany: J.MONEY.USD.smallMany, rule: J.MONEY.USD.rule },
  GBP: { short: '£', forms: [J.MONEY.GBP.forms[0], J.MONEY.GBP.forms[1], J.MONEY.GBP.forms[2]], gender: 'm', small: J.MONEY.GBP.small, smallMany: J.MONEY.GBP.smallMany, rule: J.MONEY.GBP.rule },
  PLN: { short: J.MONEY.PLN.short, forms: [J.MONEY.PLN.forms[0], J.MONEY.PLN.forms[1], J.MONEY.PLN.forms[2]], gender: 'm', small: J.MONEY.PLN.small, smallMany: J.MONEY.PLN.smallMany, rule: J.MONEY.PLN.rule },
};

export const pl: MathTexts = {
  cards: J.cards,

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
    prompt: (a, b, op) => fill(J.mental.prompt, { a, op: OPS[op], b }),
    hint: (a, b, op) => {
      if (op === '×') return fill(J.mental.hint[1], { a: heaps(a), b });
      if (op === '÷') return fill(J.mental.hint[2], { a, b });
      if (op === '-') return fill(J.mental.hint[3], { a, b });
      return fill(J.mental.hint[4], { a, b });
    },
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
    hint: (filled, denom) =>
      fill(J.fractions.hint, { length: Array.from({ length: filled }, (_, i) => numberWords(i + 1)).join(', '), denom, filled }),
  },

  fractionOps: {
    intro: J.fractionOps.intro,
    // «podzielić przez jedną drugą» — after «przez» a single part stands in the accusative.
    prompt: (a, op, b) => fill(J.fractionOps.prompt[1], { a: fraction(a.n, a.d), op: sign(op), op2: op === '÷' && b.n === 1 ? fill(J.fractionOps.prompt[2], { b: ordinalWords(b.d, 'f-acc') }) : fraction(b.n, b.d) }),
  },

  compare: {
    plus: (a, b) => fill(J.compare.plus, { a, b }),
    minus: (a, b) => fill(J.compare.minus, { a, b }),
    times: (a, b) => fill(J.compare.times, { a, b }),
    units: [
      measure(J.compare.units[0][1][1], [J.compare.units[0][0], J.compare.units[0][1][2], J.compare.units[0][2][1]], J.compare.units[0][2][2], J.compare.units[0][3], J.compare.units[0][4]),
      measure(J.compare.units[1][1][1], [J.compare.units[1][0], J.compare.units[1][1][2], J.compare.units[1][2][1]], J.compare.units[1][2][2], J.compare.units[1][3], J.compare.units[1][4]),
      measure(J.compare.units[2][1][1], [J.compare.units[2][0], J.compare.units[2][1][2], J.compare.units[2][2][1]], J.compare.units[2][2][2], J.compare.units[2][3], J.compare.units[2][4]),
      measure(J.compare.units[3][1][1], [J.compare.units[3][0], J.compare.units[3][1][2], J.compare.units[3][2][1]], J.compare.units[3][2][2], J.compare.units[3][3], J.compare.units[3][4]),
      measure(J.compare.units[4][1][1], [J.compare.units[4][0], J.compare.units[4][1][2], J.compare.units[4][2][1]], J.compare.units[4][2][2], J.compare.units[4][3], J.compare.units[4][4]),
    ],
    signs: J.compare.signs,
    rule: J.compare.rule,
    verdict: (left, right, sign) => (sign === 'eq' ? fill(J.compare.verdict[1], { left, right }) : fill(J.compare.verdict[2], { left, sign: sign === 'lt' ? J.compare.verdict[3] : J.compare.verdict[4], right })),
    prompt: (left, right) => fill(J.compare.prompt, { left, right }),
    yes: (verdict) => fill(J.compare.yes, { verdict: verdict[0].toLocaleUpperCase('pl'), verdict2: verdict.slice(1) }),
    hint: (rule, left, right) => fill(J.compare.hint, { rule, left, right }),
  },

  clock: {
    // The hour is an ordinal, feminine like «godzina»: «trzecia», «wpół do czwartej».
    say: ({ h, m }) => {
      const next = (h % 12) + 1;
      if (m === 0) return fill(J.clock.say[1], { h: ordinalWords(h, 'f') });
      if (m === 30) return fill(J.clock.say[2], { next: ordinalWords(next, 'f-obl') });
      if (m === 15) return fill(J.clock.say[3], { h: ordinalWords(h, 'f-obl') });
      if (m === 45) return fill(J.clock.say[4], { next: ordinalWords(next, 'f') });
      return `${ordinalWords(h, 'f')} ${m < 10 ? J.clock.say[5] : ''}${numberWords(m, 'f')}`;
    },
    intro: J.clock.intro,
    hint: ({ h, m }) => {
      const long = m === 0 ? J.clock.hint.long[1] : fill(J.clock.hint.long[2], { m: m / 5 });
      const short = m === 0 ? fill(J.clock.hint.short[1], { h }) : fill(J.clock.hint.short[2], { h });
      return fill(J.clock.hint._, { short, long });
    },
    yes: (time) => fill(J.clock.yes, { time }),
    find: (time) => fill(J.clock.find, { time }),
    read: J.clock.read,
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
  },

  shop: {
    toys: J.shop.toys,
    change: (toy, price, paid) => fill(J.shop.change, { toy: toy[0].toLocaleUpperCase('pl'), toy2: toy.slice(1), price, paid }),
    buy: (toy, price) => fill(J.shop.buy, { toy, price }),
    changeHint: (paid, price) => fill(J.shop.changeHint, { paid, price }),
    payHint: (price) => fill(J.shop.payHint, { price }),
  },

  geometry: {
    figures: [
      [J.geometry.figures[0][0], J.geometry.figures[0][1]],
      [J.geometry.figures[1][0], J.geometry.figures[1][1]],
      [J.geometry.figures[2][0], J.geometry.figures[2][1]],
      [J.geometry.figures[3][0], J.geometry.figures[3][1]],
      [J.geometry.figures[4][0], J.geometry.figures[4][1]],
      [J.geometry.figures[5][0], J.geometry.figures[5][1]],
      [J.geometry.figures[6][0], J.geometry.figures[6][1]],
      [J.geometry.figures[7][0], J.geometry.figures[7][1]],
      [J.geometry.figures[8][0], J.geometry.figures[8][1]],
      [J.geometry.figures[9][0], J.geometry.figures[9][1]],
      [J.geometry.figures[10][0], J.geometry.figures[10][1]],
      [J.geometry.figures[11][0], J.geometry.figures[11][1]],
      [J.geometry.figures[12][0], J.geometry.figures[12][1]],
      [J.geometry.figures[13][0], J.geometry.figures[13][1]],
      [J.geometry.figures[14][0], J.geometry.figures[14][1]],
      [J.geometry.figures[15][0], J.geometry.figures[15][1]],
      [J.geometry.figures[16][0], J.geometry.figures[16][1]],
      [J.geometry.figures[17][0], J.geometry.figures[17][1]],
      [J.geometry.figures[18][0], J.geometry.figures[18][1]],
      [J.geometry.figures[19][0], J.geometry.figures[19][1]],
      [J.geometry.figures[20][0], J.geometry.figures[20][1]],
      [J.geometry.figures[21][0], J.geometry.figures[21][1]],
      [J.geometry.figures[22][0], J.geometry.figures[22][1]],
      [J.geometry.figures[23][0], J.geometry.figures[23][1]],
    ],
    build: (name) => fill(J.geometry.build, { name }),
    buildHint: J.geometry.buildHint,
    count: (name, shape) => fill(J.geometry.count, { name, shape: SHAPES[shape] }),
    countHint: (shape) => fill(J.geometry.countHint, { shape: SHAPES[shape] }),
    areaRead: J.geometry.areaRead,
    areaIs: (area) => fill(J.geometry.areaIs, { area }),
    areaHint: J.geometry.areaHint,
    pens: J.geometry.pens,
    // «o polu dwóch kratek» — the count stands in the genitive.
    pen: (animal, area) => fill(J.geometry.pen[1], { animal, area: area === 1 ? fill(J.geometry.pen[2], { num: num(1, 'f', 'gen') }) : fill(J.geometry.pen[3], { area: num(area, 'f', 'gen') }) }),
    penDone: (area) => fill(J.geometry.penDone, { area: counted(area, SQUARES, 'f') }),
    penHint: (area) => fill(J.geometry.penHint, { area: counted(area, SQUARES, 'f') }),
    perimeterRead: J.geometry.perimeterRead,
    perimeterIs: (length) => fill(J.geometry.perimeterIs, { length }),
    perimeterHint: J.geometry.perimeterHint,
    longest: J.geometry.longest,
    longestIs: (length) => fill(J.geometry.longestIs, { length }),
    longestHint: J.geometry.longestHint,
    intro: J.geometry.intro,
  },

  money: (id) => {
    const m = MONEY[id];
    return { short: m.short, sum: (n) => counted(n, m.forms, m.gender), measure: measure(m.short, m.forms, m.small, m.smallMany, m.rule) };
  },
};
