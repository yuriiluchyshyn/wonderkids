import { say } from '@/core/language/marks';
import type { RiddleWords, Rule } from '@/games/logic/grammar/riddles/types';
import { fill } from '@/core/language/fill';
import TEXTS from '@/locales/app/pl/games/logic.json';

const J = TEXTS.riddles;

/**
 * «Логічні задачі» in Polish. Every list keeps the order of the skins in
 * `content/riddles.ts`. A number is written as a digit where the Polish voice
 * reads it right by itself, and with `say` where the word depends on who is
 * counted («2 braci» — «dwóch braci»).
 */

const cap = (text: string) => text.charAt(0).toLocaleUpperCase('pl') + text.slice(1);

/** A name and its genitive: «wyższy od Tomka», «u Tomka». */
const BOYS: [string, string][] = [[J.BOYS[0][0], J.BOYS[0][1]], [J.BOYS[1][0], J.BOYS[1][1]], [J.BOYS[2][0], J.BOYS[2][1]], [J.BOYS[3][0], J.BOYS[3][1]], [J.BOYS[4][0], J.BOYS[4][1]], [J.BOYS[5][0], J.BOYS[5][1]], [J.BOYS[6][0], J.BOYS[6][1]], [J.BOYS[7][0], J.BOYS[7][1]]];
const GIRLS: [string, string][] = [[J.GIRLS[0][0], J.GIRLS[0][1]], [J.GIRLS[1][0], J.GIRLS[1][1]], [J.GIRLS[2][0], J.GIRLS[2][1]], [J.GIRLS[3][0], J.GIRLS[3][1]], [J.GIRLS[4][0], J.GIRLS[4][1]], [J.GIRLS[5][0], J.GIRLS[5][1]], [J.GIRLS[6][0], J.GIRLS[6][1]], [J.GIRLS[7][0], J.GIRLS[7][1]]];

const ORDINAL_M = J.ORDINAL_M;
const ORDINAL_F = ORDINAL_M.map((word) => word.replace(/[yi]$/, J.ORDINAL_F));
const ordinal = (n: number, feminine = false) => say(`${n}.`, (feminine ? ORDINAL_F : ORDINAL_M)[n]);
/** «2 braci» is said «dwóch braci»: men are counted in their own way. */
const MEN = J.MEN;
const WOMEN = J.WOMEN;
const BOTH = J.BOTH;
/** «5 lat», «3 lata», «22 lata», «12 lat» */
const years = (n: number) => (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? J.years[1] : n === 1 ? J.years[2] : J.years[3]);

const ONE_OF: [string, string, string[]][] = [
  [J.ONE_OF[0][0], J.ONE_OF[0][1], J.ONE_OF[0][2]],
  [J.ONE_OF[1][0], J.ONE_OF[1][1], J.ONE_OF[1][2]],
  [J.ONE_OF[2][0], J.ONE_OF[2][1], J.ONE_OF[2][2]],
  [J.ONE_OF[3][0], J.ONE_OF[3][1], J.ONE_OF[3][2]],
  [J.ONE_OF[4][0], J.ONE_OF[4][1], J.ONE_OF[4][2]],
  [J.ONE_OF[5][0], J.ONE_OF[5][1], J.ONE_OF[5][2]],
  [J.ONE_OF[6][0], J.ONE_OF[6][1], J.ONE_OF[6][2]],
  [J.ONE_OF[7][0], J.ONE_OF[7][1], J.ONE_OF[7][2]],
  [J.ONE_OF[8][0], J.ONE_OF[8][1], J.ONE_OF[8][2]],
  [J.ONE_OF[9][0], J.ONE_OF[9][1], J.ONE_OF[9][2]],
];

/** Three in a row: each with its genitive («na lewo od psa»). */
const ROWS_OF_THREE: [verb: string, what: string, three: [string, string][]][] = [
  [J.ROWS_OF_THREE[0][0], J.ROWS_OF_THREE[0][1], [[J.ROWS_OF_THREE[0][2][0][0], J.ROWS_OF_THREE[0][2][0][1]], [J.ROWS_OF_THREE[0][2][1][0], J.ROWS_OF_THREE[0][2][1][1]], [J.ROWS_OF_THREE[0][2][2][0], J.ROWS_OF_THREE[0][2][2][1]]]],
  [J.ROWS_OF_THREE[1][0], J.ROWS_OF_THREE[1][1], [[J.ROWS_OF_THREE[1][2][0][0], J.ROWS_OF_THREE[1][2][0][1]], [J.ROWS_OF_THREE[1][2][1][0], J.ROWS_OF_THREE[1][2][1][1]], [J.ROWS_OF_THREE[1][2][2][0], J.ROWS_OF_THREE[1][2][2][1]]]],
  [J.ROWS_OF_THREE[2][0], J.ROWS_OF_THREE[2][1], [[J.ROWS_OF_THREE[2][2][0][0], J.ROWS_OF_THREE[2][2][0][1]], [J.ROWS_OF_THREE[2][2][1][0], J.ROWS_OF_THREE[2][2][1][1]], [J.ROWS_OF_THREE[2][2][2][0], J.ROWS_OF_THREE[2][2][2][1]]]],
  [J.ROWS_OF_THREE[3][0], J.ROWS_OF_THREE[3][1], [[J.ROWS_OF_THREE[3][2][0][0], J.ROWS_OF_THREE[3][2][0][1]], [J.ROWS_OF_THREE[3][2][1][0], J.ROWS_OF_THREE[3][2][1][1]], [J.ROWS_OF_THREE[3][2][2][0], J.ROWS_OF_THREE[3][2][2][1]]]],
  [J.ROWS_OF_THREE[4][0], J.ROWS_OF_THREE[4][1], [[J.ROWS_OF_THREE[4][2][0][0], J.ROWS_OF_THREE[4][2][0][1]], [J.ROWS_OF_THREE[4][2][1][0], J.ROWS_OF_THREE[4][2][1][1]], [J.ROWS_OF_THREE[4][2][2][0], J.ROWS_OF_THREE[4][2][2][1]]]],
  [J.ROWS_OF_THREE[5][0], J.ROWS_OF_THREE[5][1], [[J.ROWS_OF_THREE[5][2][0][0], J.ROWS_OF_THREE[5][2][0][1]], [J.ROWS_OF_THREE[5][2][1][0], J.ROWS_OF_THREE[5][2][1][1]], [J.ROWS_OF_THREE[5][2][2][0], J.ROWS_OF_THREE[5][2][2][1]]]],
  [J.ROWS_OF_THREE[6][0], J.ROWS_OF_THREE[6][1], [[J.ROWS_OF_THREE[6][2][0][0], J.ROWS_OF_THREE[6][2][0][1]], [J.ROWS_OF_THREE[6][2][1][0], J.ROWS_OF_THREE[6][2][1][1]], [J.ROWS_OF_THREE[6][2][2][0], J.ROWS_OF_THREE[6][2][2][1]]]],
  [J.ROWS_OF_THREE[7][0], J.ROWS_OF_THREE[7][1], [[J.ROWS_OF_THREE[7][2][0][0], J.ROWS_OF_THREE[7][2][0][1]], [J.ROWS_OF_THREE[7][2][1][0], J.ROWS_OF_THREE[7][2][1][1]], [J.ROWS_OF_THREE[7][2][2][0], J.ROWS_OF_THREE[7][2][2][1]]]],
  [J.ROWS_OF_THREE[8][0], J.ROWS_OF_THREE[8][1], [[J.ROWS_OF_THREE[8][2][0][0], J.ROWS_OF_THREE[8][2][0][1]], [J.ROWS_OF_THREE[8][2][1][0], J.ROWS_OF_THREE[8][2][1][1]], [J.ROWS_OF_THREE[8][2][2][0], J.ROWS_OF_THREE[8][2][2][1]]]],
  [J.ROWS_OF_THREE[9][0], J.ROWS_OF_THREE[9][1], [[J.ROWS_OF_THREE[9][2][0][0], J.ROWS_OF_THREE[9][2][0][1]], [J.ROWS_OF_THREE[9][2][1][0], J.ROWS_OF_THREE[9][2][1][1]], [J.ROWS_OF_THREE[9][2][2][0], J.ROWS_OF_THREE[9][2][2][1]]]],
];

/** «wyższy», «wyższa», «najwyższy», «najwyższa», «najniższy», «najniższa» */
const COMPARE: [string, string, string, string, string, string][] = [
  [J.COMPARE[0][0], J.COMPARE[0][1], J.COMPARE[0][2], J.COMPARE[0][3], J.COMPARE[0][4], J.COMPARE[0][5]],
  [J.COMPARE[1][0], J.COMPARE[1][1], J.COMPARE[1][2], J.COMPARE[1][3], J.COMPARE[1][4], J.COMPARE[1][5]],
  [J.COMPARE[2][0], J.COMPARE[2][1], J.COMPARE[2][2], J.COMPARE[2][3], J.COMPARE[2][4], J.COMPARE[2][5]],
  [J.COMPARE[3][0], J.COMPARE[3][1], J.COMPARE[3][2], J.COMPARE[3][3], J.COMPARE[3][4], J.COMPARE[3][5]],
  [J.COMPARE[4][0], J.COMPARE[4][1], J.COMPARE[4][2], J.COMPARE[4][3], J.COMPARE[4][4], J.COMPARE[4][5]],
  [J.COMPARE[5][0], J.COMPARE[5][1], J.COMPARE[5][2], J.COMPARE[5][3], J.COMPARE[5][4], J.COMPARE[5][5]],
  [J.COMPARE[6][0], J.COMPARE[6][1], J.COMPARE[6][2], J.COMPARE[6][3], J.COMPARE[6][4], J.COMPARE[6][5]],
  [J.COMPARE[7][0], J.COMPARE[7][1], J.COMPARE[7][2], J.COMPARE[7][3], J.COMPARE[7][4], J.COMPARE[7][5]],
  [J.COMPARE[8][0], J.COMPARE[8][1], J.COMPARE[8][2], J.COMPARE[8][3], J.COMPARE[8][4], J.COMPARE[8][5]],
  [J.COMPARE[9][0], J.COMPARE[9][1], J.COMPARE[9][2], J.COMPARE[9][3], J.COMPARE[9][4], J.COMPARE[9][5]],
];

const rule = (r: Rule): string => {
  switch (r.kind) {
    case 'add':
      return fill(J.rule[1], { by: r.by });
    case 'sub':
      return fill(J.rule[2], { by: r.by });
    case 'alt':
      return fill(J.rule[3], { by: r.by, then: r.then });
    case 'double':
      return J.rule[4];
    case 'triple':
      return J.rule[5];
    case 'half':
      return J.rule[6];
    case 'grow':
      return J.rule[7];
    case 'shrink':
      return J.rule[8];
    case 'two':
      return J.rule[9];
  }
};

/** Someone with `a` in front and `b` behind (five or more, so the noun never changes); from the sixth on the place is told from both ends. */
const QUEUES: ((a: number, b: number) => string)[] = [
  (a, b) => fill(J.QUEUES[0], { a, b }),
  (a, b) => fill(J.QUEUES[1], { a, b }),
  (a, b) => fill(J.QUEUES[2], { a, b }),
  (a, b) => fill(J.QUEUES[3], { a, b }),
  (a, b) => fill(J.QUEUES[4], { a, b }),
  (a, b) => fill(J.QUEUES[5], { a: ordinal(a + 1), b: ordinal(b + 1) }),
  (a, b) => fill(J.QUEUES[6], { a: ordinal(a + 1), b: ordinal(b + 1) }),
  (a, b) => fill(J.QUEUES[7], { a: ordinal(a + 1), b: ordinal(b + 1) }),
  (a, b) => fill(J.QUEUES[8], { a: ordinal(a + 1), b: ordinal(b + 1) }),
  (a, b) => fill(J.QUEUES[9], { a: ordinal(a + 1, true), b: ordinal(b + 1, true) }),
];

/** Five or more of each, so the nouns stand in one form: «5 kur i 6 psów». */
const LEGS: [text: (a: number, b: number) => string, first: string, legs: number, second: string, legsToo: number][] = [
  [(a, b) => fill(J.LEGS[0][0], { a, b }), J.LEGS[0][1], 2, J.LEGS[0][3], 4],
  [(a, b) => fill(J.LEGS[1][0], { a, b }), J.LEGS[1][1], 2, J.LEGS[1][3], 4],
  [(a, b) => fill(J.LEGS[2][0], { a, b }), J.LEGS[2][1], 2, J.LEGS[2][3], 4],
  [(a, b) => fill(J.LEGS[3][0], { a, b }), J.LEGS[3][1], 2, J.LEGS[3][3], 4],
  [(a, b) => fill(J.LEGS[4][0], { a, b }), J.LEGS[4][1], 2, J.LEGS[4][3], 4],
  [(a, b) => fill(J.LEGS[5][0], { a, b }), J.LEGS[5][1], 2, J.LEGS[5][3], 4],
  [(a, b) => fill(J.LEGS[6][0], { a, b }), J.LEGS[6][1], 2, J.LEGS[6][3], 3],
  [(a, b) => fill(J.LEGS[7][0], { a, b }), J.LEGS[7][1], 3, J.LEGS[7][3], 4],
  [(a, b) => fill(J.LEGS[8][0], { a, b }), J.LEGS[8][1], 6, J.LEGS[8][3], 2],
  [(a, b) => fill(J.LEGS[9][0], { a, b }), J.LEGS[9][1], 8, J.LEGS[9][3], 6],
];

const DAYS = J.DAYS;
const was = (day: string) => (day.endsWith('a') ? J.was[1] : J.was[2]);
const DAY_ASKS: [tells: (day: string) => string, question: string, note: string][] = [
  [(d) => fill(J.DAY_ASKS[0][0], { d }), J.DAY_ASKS[0][1], J.DAY_ASKS[0][2]],
  [(d) => fill(J.DAY_ASKS[1][0], { d }), J.DAY_ASKS[1][1], J.DAY_ASKS[1][2]],
  [(d) => fill(J.DAY_ASKS[2][0], { d }), J.DAY_ASKS[2][1], J.DAY_ASKS[2][2]],
  [(d) => fill(J.DAY_ASKS[3][0], { d }), J.DAY_ASKS[3][1], J.DAY_ASKS[3][2]],
  [(d) => fill(J.DAY_ASKS[4][0], { d }), J.DAY_ASKS[4][1], J.DAY_ASKS[4][2]],
  [(d) => fill(J.DAY_ASKS[5][0], { d }), J.DAY_ASKS[5][1], J.DAY_ASKS[5][2]],
  [(d) => fill(J.DAY_ASKS[6][0], { d }), J.DAY_ASKS[6][1], J.DAY_ASKS[6][2]],
  [(d) => fill(J.DAY_ASKS[7][0], { d: was(d), d2: d }), J.DAY_ASKS[7][1], J.DAY_ASKS[7][2]],
  [(d) => fill(J.DAY_ASKS[8][0], { d: was(d), d2: d }), J.DAY_ASKS[8][1], J.DAY_ASKS[8][2]],
  [(d) => fill(J.DAY_ASKS[9][0], { d }), J.DAY_ASKS[9][1], J.DAY_ASKS[9][2]],
];

const CUTS: [text: (n: number) => string, find: 'cuts' | 'pieces'][] = [
  [(n) => fill(J.CUTS[0][0], { n }), 'cuts'],
  [(n) => fill(J.CUTS[1][0], { n }), 'cuts'],
  [(n) => fill(J.CUTS[2][0], { n }), 'cuts'],
  [(n) => fill(J.CUTS[3][0], { n }), 'cuts'],
  [(n) => fill(J.CUTS[4][0], { n }), 'cuts'],
  [(n) => fill(J.CUTS[5][0], { n }), 'pieces'],
  [(n) => fill(J.CUTS[6][0], { n }), 'pieces'],
  [(n) => fill(J.CUTS[7][0], { n }), 'pieces'],
  [(n) => fill(J.CUTS[8][0], { n }), 'pieces'],
  [(n) => fill(J.CUTS[9][0], { n }), 'pieces'],
];

/** The colours already answer to the thing: «czerwony koralik», «zielona chorągiewka». */
const REPEATS: [string, string, 'm' | 'f', string[]][] = [
  [J.REPEATS[0][0], J.REPEATS[0][1], 'm', J.REPEATS[0][3]],
  [J.REPEATS[1][0], J.REPEATS[1][1], 'f', J.REPEATS[1][3]],
  [J.REPEATS[2][0], J.REPEATS[2][1], 'm', J.REPEATS[2][3]],
  [J.REPEATS[3][0], J.REPEATS[3][1], 'f', J.REPEATS[3][3]],
  [J.REPEATS[4][0], J.REPEATS[4][1], 'm', J.REPEATS[4][3]],
  [J.REPEATS[5][0], J.REPEATS[5][1], 'f', J.REPEATS[5][3]],
  [J.REPEATS[6][0], J.REPEATS[6][1], 'm', J.REPEATS[6][3]],
  [J.REPEATS[7][0], J.REPEATS[7][1], 'm', J.REPEATS[7][3]],
  [J.REPEATS[8][0], J.REPEATS[8][1], 'm', J.REPEATS[8][3]],
  [J.REPEATS[9][0], J.REPEATS[9][1], 'm', J.REPEATS[9][3]],
];

const RACES = J.RACES;

/** Five or more, so always «jabłek». */
const HAVE = J.HAVE;

const OWNERS: [string, string[]][] = [
  [J.OWNERS[0][0], J.OWNERS[0][1]],
  [J.OWNERS[1][0], J.OWNERS[1][1]],
  [J.OWNERS[2][0], J.OWNERS[2][1]],
  [J.OWNERS[3][0], J.OWNERS[3][1]],
  [J.OWNERS[4][0], J.OWNERS[4][1]],
  [J.OWNERS[5][0], J.OWNERS[5][1]],
  [J.OWNERS[6][0], J.OWNERS[6][1]],
  [J.OWNERS[7][0], J.OWNERS[7][1]],
  [J.OWNERS[8][0], J.OWNERS[8][1]],
  [J.OWNERS[9][0], J.OWNERS[9][1]],
];

/** Who met, for three, four, five and six of them — the verb answers to the number. */
const MEETINGS: [who: [string, string, string, string], did: string, ask: string, both: boolean][] = [
  [[J.MEETINGS[0][0][0], J.MEETINGS[0][0][1], J.MEETINGS[0][0][2], J.MEETINGS[0][0][3]], J.MEETINGS[0][1], J.MEETINGS[0][2], false],
  [[J.MEETINGS[1][0][0], J.MEETINGS[1][0][1], J.MEETINGS[1][0][2], J.MEETINGS[1][0][3]], J.MEETINGS[1][1], J.MEETINGS[1][2], false],
  [[J.MEETINGS[2][0][0], J.MEETINGS[2][0][1], J.MEETINGS[2][0][2], J.MEETINGS[2][0][3]], J.MEETINGS[2][1], J.MEETINGS[2][2], false],
  [[J.MEETINGS[3][0][0], J.MEETINGS[3][0][1], J.MEETINGS[3][0][2], J.MEETINGS[3][0][3]], J.MEETINGS[3][1], J.MEETINGS[3][2], true],
  [[J.MEETINGS[4][0][0], J.MEETINGS[4][0][1], J.MEETINGS[4][0][2], J.MEETINGS[4][0][3]], J.MEETINGS[4][1], J.MEETINGS[4][2], false],
];

export const pl: RiddleWords = {
  cap,
  boys: BOYS.map((b) => b[0]),
  girls: GIRLS.map((g) => g[0]),
  note: J.note,

  oneOf: (skin) => {
    const [lead, ask, things] = ONE_OF[skin];
    const name = (i: number) => things[i];
    return {
      things,
      tell: (set, out) => ({
        text: fill(J.oneOf.tell.text[1], { lead, set: set.slice(0, -1).map(name).join(', '), set2: name(set[set.length - 1]), out: out.slice(0, -1).map((i) => fill(J.oneOf.tell.text[2], { i: name(i) })).join(', '), out2: out.length > 1 ? J.oneOf.tell.text[3] : '', out3: name(out[out.length - 1]), ask }),
        how: fill(J.oneOf.tell.how, { out: out.map(name).join(', ') }),
      }),
    };
  },

  row: (skin) => {
    const [verb, what, three] = ROWS_OF_THREE[skin];
    return {
      names: three.map((t) => t[0]),
      ends: [J.row.ends[0], J.row.ends[1]],
      tell: (l, m, r, asked, leftFirst) => {
        const [left, middle, right] = [three[l], three[m], three[r]];
        const told = leftFirst
          ? fill(J.row.tell.told[1], { left: cap(left[0]), verb, middle: middle[1], right: right[0] })
          : fill(J.row.tell.told[2], { right: cap(right[0]), verb, middle: middle[1], left: left[0] });
        return {
          text: `${told} ${what} ${verb} ${J.row.tell.text[asked]}?`,
          how: fill(J.row.tell.how, { left: left[0], middle: middle[0], right: right[0] }),
        };
      },
    };
  },

  chain: (skin, girls) => {
    const [m, f, topM, topF, lowM, lowF] = COMPARE[skin];
    const names = girls ? GIRLS : BOYS;
    const more = girls ? f : m;
    const [top, bottom] = girls ? [topF, lowF] : [topM, lowM];
    return {
      tell: (row, order, low) => {
        const links = row.slice(0, -1).map((who, i) => fill(J.chain.tell.links, { names: names[who][0], more, names2: names[row[i + 1]][1] }));
        const told = order.map((i) => links[i]);
        return {
          // «Kto» is always a he in Polish, so the question names whom it asks about.
          text: fill(J.chain.tell.text[1], { told: told.slice(0, -1).join(', '), told2: told[told.length - 1], girls: girls ? J.chain.tell.text[2] : J.chain.tell.text[3], low: low ? bottom : top }),
          how: fill(J.chain.tell.how, { row: row.map((w) => names[w][0]).join(', '), top, bottom }),
        };
      },
    };
  },

  next: (row, r) => ({ text: fill(J.next.text, { row: row.join(', ') }), how: fill(J.next.how, { r: rule(r) }) }),

  queue: (skin) => ({
    ends: [J.queue.ends[0], J.queue.ends[1]],
    tell: (a, b) => ({
      text: QUEUES[skin](a, b),
      how:
        skin >= 5
          ? fill(J.queue.tell.how[1], { a, b })
          : fill(J.queue.tell.how[2], { a, b }),
    }),
  }),

  legs: (skin) => {
    const [text, first, legs, second, legsToo] = LEGS[skin];
    return { labels: [first, second], tell: (a, b) => ({ text: text(a, b), how: fill(J.legs.tell.how, { a, legs, b, legsToo }) }) };
  },

  days: {
    names: DAYS,
    short: J.days.short,
    tell: (ask, given) => ({
      text: `${DAY_ASKS[ask][0](DAYS[given])} ${DAY_ASKS[ask][1]}`,
      how: fill(J.days.tell.how, { x: DAYS.join(', ') }),
    }),
    note: (ask) => DAY_ASKS[ask][2],
  },

  cuts: (skin) => ({
    tell: (n) => ({
      text: CUTS[skin][0](n),
      how: fill(J.cuts.tell.how[1], { skin: CUTS[skin][1] === 'cuts' ? J.cuts.tell.how[2] : J.cuts.tell.how[3] }),
    }),
  }),

  repeats: (skin) => {
    const [lead, thing, gender, colours] = REPEATS[skin];
    return {
      colours,
      tell: (unit, place) => ({
        text: fill(J.repeats.tell.text, { lead, unit: [...unit, ...unit].map((c) => colours[c]).join(', '), place: ordinal(place, gender === 'f'), thing }),
        how: fill(J.repeats.tell.how, { length: unit.length, unit: unit.map((c) => colours[c]).join(', ') }),
      }),
    };
  },

  race: (skin) => {
    const did = RACES[skin];
    return {
      ends: [J.race.ends[0], J.race.ends[1]],
      tell: (f, s, t, last, told) => {
        const [first, second, third] = [BOYS[f][0], BOYS[s][0], BOYS[t][0]];
        const tells = [
          fill(J.race.tell.tells[0], { second, did, third, first }),
          fill(J.race.tell.tells[1], { second, did, first, third }),
          fill(J.race.tell.tells[2], { first, did, second, third }),
        ][told];
        return { text: fill(J.race.tell.text[1], { tells, did, last: last ? J.race.tell.text[2] : J.race.tell.text[3] }), how: fill(J.race.tell.how, { first, second, third }) };
      },
    };
  },

  more: (skin) => {
    const many = HAVE[skin];
    return {
      names: [J.more.names[0], J.more.names[1], J.more.names[2]],
      tell: (c, b, a, fewer) => ({
        text: fewer
          ? fill(J.more.tell.text[1], { c: c + a + b, many, b, a })
          : fill(J.more.tell.text[2], { c, many, b, a }),
        how: J.more.tell.how,
      }),
    };
  },

  family: (at, [a, b]) =>
    [
      () => ({
        text: fill(J.family[0].text[1], { a: say(a, J.family[0].text[2][a]), a2: a === 1 ? J.family[0].text[3] : J.family[0].text[4], b: say(b, J.family[0].text[5][b]), b2: b === 1 ? J.family[0].text[6] : J.family[0].text[7] }),
        how: J.family[0].how,
      }),
      () => ({ text: fill(J.family[1].text, { a: say(a, MEN[a]) }), how: J.family[1].how }),
      () => ({ text: fill(J.family[2].text[1], { a: a < 5 ? J.family[2].text[2] : J.family[2].text[3], a2: say(a, WOMEN[a]), a3: a < 5 ? J.family[2].text[4] : J.family[2].text[5] }), how: J.family[2].how }),
      () => ({ text: fill(J.family[3].text, { a: say(a, BOTH[a]) }), how: J.family[3].how }),
      () => ({ text: fill(J.family[4].text[1], { a: say(a, WOMEN[a]), a2: a < 5 ? J.family[4].text[2] : J.family[4].text[3] }), how: J.family[4].how }),
    ][at](),

  ages: (at, [a, d, e]) =>
    [
      () => ({ text: fill(J.ages[0].text, { a, a2: years(a), d, d2: years(d) }), how: J.ages[0].how }),
      () => ({ text: fill(J.ages[1].text, { d, d2: years(d), a: a + d, a2: years(a + d) }), how: J.ages[1].how }),
      () => ({ text: fill(J.ages[2].text, { a, a2: years(a) }), how: J.ages[2].how }),
      () => ({ text: fill(J.ages[3].text[1], { d: d === 2 ? J.ages[3].text[2] : J.ages[3].text[3], a: a - d, a2: years(a - d), e, e2: years(e) }), how: J.ages[3].how }),
      () => ({ text: fill(J.ages[4].text, { d, d2: years(d), a }), how: J.ages[4].how }),
    ][at](),

  hidden: (at, [a, b]) =>
    [
      () => ({ text: fill(J.hidden[0].text, { a, b }), how: fill(J.hidden[0].how, { a, b }) }),
      () => ({ text: fill(J.hidden[1].text, { a, b }), how: fill(J.hidden[1].how, { a, b }) }),
      () => ({ text: fill(J.hidden[2].text, { a, b }), how: J.hidden[2].how }),
      () => ({ text: fill(J.hidden[3].text, { a, b }), how: fill(J.hidden[3].how, { a, b }) }),
      () => ({ text: fill(J.hidden[4].text, { b, a }), how: fill(J.hidden[4].how, { a, b }) }),
    ][at](),

  owners: (skin) => {
    const [does, things] = OWNERS[skin];
    return {
      things,
      tell: (who, has, hard) => {
        const kids = who.map((k) => BOYS[k]);
        const not = (kid: [string, string], out: number[]) => fill(J.owners.tell.not[1], { kid: kid[1], out: out.map((t) => fill(J.owners.tell.not[2], { things: things[t] })).join(J.owners.tell.not[3]) });
        return {
          text: fill(J.owners.tell.text, { kids: kids[0][0], kids2: kids[1][0], kids3: kids[2][0], does, things: things.join(', '), kids4: not(kids[0], [has[1], has[2]]), hard: hard ? ` ${not(kids[2], [has[1]])}` : '', kids5: kids[hard ? 1 : 0][1] }),
          how: hard
            ? fill(J.owners.tell.how[1], { kids: kids[0][1], kids2: kids[2][1], kids3: kids[1][1] })
            : J.owners.tell.how[2],
        };
      },
    };
  },

  meetings: (skin) => {
    const [who, did, ask, both] = MEETINGS[skin];
    return {
      tell: (n) => ({
        text: `${who[n - 3]} ${did}. ${ask}`,
        how: both
          ? J.meetings.tell.how[1]
          : fill(J.meetings.tell.how[2], { length: Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(' + ') }),
      }),
    };
  },
};
