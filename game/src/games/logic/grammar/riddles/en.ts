import { say } from '@/core/language/marks';
import type { RiddleWords, Rule } from '@/games/logic/grammar/riddles/types';
import { fill } from '@/core/language/fill';
import TEXTS from '@/locales/app/en/games/logic.json';

const J = TEXTS.riddles;

/**
 * «Логічні задачі» in English. Every list keeps the order of the skins in
 * `content/riddles.ts`. Numbers are written as digits: the English voice reads
 * a digit right wherever it stands.
 */

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
/** «a ball» → «ball»: a thing as it stands on a card. */
const bare = (thing: string) => thing.replace(/^(an?|the) /, '');
const list = (items: string[], last = J.list) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} ${last} ${items[items.length - 1]}` : items[0]);

const BOYS = J.BOYS;
const GIRLS = J.GIRLS;

const ORDINALS = J.ORDINALS;
const ordinal = (n: number) => say(`${n}${n === 1 ? J.ordinal[1] : n === 2 ? J.ordinal[2] : n === 3 ? J.ordinal[3] : J.ordinal[4]}`, ORDINALS[n]);

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

const ROWS_OF_THREE: [verb: string, what: string, three: string[]][] = [
  [J.ROWS_OF_THREE[0][0], J.ROWS_OF_THREE[0][1], J.ROWS_OF_THREE[0][2]],
  [J.ROWS_OF_THREE[1][0], J.ROWS_OF_THREE[1][1], J.ROWS_OF_THREE[1][2]],
  [J.ROWS_OF_THREE[2][0], J.ROWS_OF_THREE[2][1], J.ROWS_OF_THREE[2][2]],
  [J.ROWS_OF_THREE[3][0], J.ROWS_OF_THREE[3][1], J.ROWS_OF_THREE[3][2]],
  [J.ROWS_OF_THREE[4][0], J.ROWS_OF_THREE[4][1], J.ROWS_OF_THREE[4][2]],
  [J.ROWS_OF_THREE[5][0], J.ROWS_OF_THREE[5][1], J.ROWS_OF_THREE[5][2]],
  [J.ROWS_OF_THREE[6][0], J.ROWS_OF_THREE[6][1], J.ROWS_OF_THREE[6][2]],
  [J.ROWS_OF_THREE[7][0], J.ROWS_OF_THREE[7][1], J.ROWS_OF_THREE[7][2]],
  [J.ROWS_OF_THREE[8][0], J.ROWS_OF_THREE[8][1], J.ROWS_OF_THREE[8][2]],
  [J.ROWS_OF_THREE[9][0], J.ROWS_OF_THREE[9][1], J.ROWS_OF_THREE[9][2]],
];

/** «taller», «the tallest», «the shortest» */
const COMPARE: [string, string, string][] = [
  [J.COMPARE[0][0], J.COMPARE[0][1], J.COMPARE[0][2]],
  [J.COMPARE[1][0], J.COMPARE[1][1], J.COMPARE[1][2]],
  [J.COMPARE[2][0], J.COMPARE[2][1], J.COMPARE[2][2]],
  [J.COMPARE[3][0], J.COMPARE[3][1], J.COMPARE[3][2]],
  [J.COMPARE[4][0], J.COMPARE[4][1], J.COMPARE[4][2]],
  [J.COMPARE[5][0], J.COMPARE[5][1], J.COMPARE[5][2]],
  [J.COMPARE[6][0], J.COMPARE[6][1], J.COMPARE[6][2]],
  [J.COMPARE[7][0], J.COMPARE[7][1], J.COMPARE[7][2]],
  [J.COMPARE[8][0], J.COMPARE[8][1], J.COMPARE[8][2]],
  [J.COMPARE[9][0], J.COMPARE[9][1], J.COMPARE[9][2]],
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

/** Someone with `a` in front and `b` behind; from the sixth on the place is told from both ends. */
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
  (a, b) => fill(J.QUEUES[9], { a: ordinal(a + 1), b: ordinal(b + 1) }),
];

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
const DAY_ASKS: [tells: (day: string) => string, question: string, note: string][] = [
  [(d) => fill(J.DAY_ASKS[0][0], { d }), J.DAY_ASKS[0][1], J.DAY_ASKS[0][2]],
  [(d) => fill(J.DAY_ASKS[1][0], { d }), J.DAY_ASKS[1][1], J.DAY_ASKS[1][2]],
  [(d) => fill(J.DAY_ASKS[2][0], { d }), J.DAY_ASKS[2][1], J.DAY_ASKS[2][2]],
  [(d) => fill(J.DAY_ASKS[3][0], { d }), J.DAY_ASKS[3][1], J.DAY_ASKS[3][2]],
  [(d) => fill(J.DAY_ASKS[4][0], { d }), J.DAY_ASKS[4][1], J.DAY_ASKS[4][2]],
  [(d) => fill(J.DAY_ASKS[5][0], { d }), J.DAY_ASKS[5][1], J.DAY_ASKS[5][2]],
  [(d) => fill(J.DAY_ASKS[6][0], { d }), J.DAY_ASKS[6][1], J.DAY_ASKS[6][2]],
  [(d) => fill(J.DAY_ASKS[7][0], { d }), J.DAY_ASKS[7][1], J.DAY_ASKS[7][2]],
  [(d) => fill(J.DAY_ASKS[8][0], { d }), J.DAY_ASKS[8][1], J.DAY_ASKS[8][2]],
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

const REPEATS: [string, string, string[]][] = [
  [J.REPEATS[0][0], J.REPEATS[0][1], J.REPEATS[0][2]],
  [J.REPEATS[1][0], J.REPEATS[1][1], J.REPEATS[1][2]],
  [J.REPEATS[2][0], J.REPEATS[2][1], J.REPEATS[2][2]],
  [J.REPEATS[3][0], J.REPEATS[3][1], J.REPEATS[3][2]],
  [J.REPEATS[4][0], J.REPEATS[4][1], J.REPEATS[4][2]],
  [J.REPEATS[5][0], J.REPEATS[5][1], J.REPEATS[5][2]],
  [J.REPEATS[6][0], J.REPEATS[6][1], J.REPEATS[6][2]],
  [J.REPEATS[7][0], J.REPEATS[7][1], J.REPEATS[7][2]],
  [J.REPEATS[8][0], J.REPEATS[8][1], J.REPEATS[8][2]],
  [J.REPEATS[9][0], J.REPEATS[9][1], J.REPEATS[9][2]],
];

const RACES = J.RACES;

const HAVE = J.HAVE;

/** What three boys have: how it is said, what one is called («pet»), the things in a list and in a sentence. */
const OWNERS: [does: string, kind: string, listed: string[], named: string[], ask?: (kid: string) => string][] = [
  [J.OWNERS[0][0], J.OWNERS[0][1], J.OWNERS[0][2], J.OWNERS[0][3]],
  [J.OWNERS[1][0], J.OWNERS[1][1], J.OWNERS[1][2], J.OWNERS[1][3]],
  [J.OWNERS[2][0], J.OWNERS[2][1], J.OWNERS[2][2], J.OWNERS[2][3]],
  [J.OWNERS[3][0], J.OWNERS[3][1], J.OWNERS[3][2], J.OWNERS[3][3]],
  [J.OWNERS[4][0], J.OWNERS[4][1], J.OWNERS[4][2], J.OWNERS[4][3]],
  [J.OWNERS[5][0], J.OWNERS[5][1], J.OWNERS[5][2], J.OWNERS[5][3]],
  [J.OWNERS[6][0], J.OWNERS[6][1], J.OWNERS[6][2], J.OWNERS[6][3], (kid) => fill(J.OWNERS[6][4], { kid })],
  [J.OWNERS[7][0], J.OWNERS[7][1], J.OWNERS[7][2], J.OWNERS[7][3]],
  [J.OWNERS[8][0], J.OWNERS[8][1], J.OWNERS[8][2], J.OWNERS[8][3]],
  [J.OWNERS[9][0], J.OWNERS[9][1], J.OWNERS[9][2], J.OWNERS[9][3]],
];

const MEETINGS: [who: string, did: string, ask: string, both: boolean][] = [
  [J.MEETINGS[0][0], J.MEETINGS[0][1], J.MEETINGS[0][2], false],
  [J.MEETINGS[1][0], J.MEETINGS[1][1], J.MEETINGS[1][2], false],
  [J.MEETINGS[2][0], J.MEETINGS[2][1], J.MEETINGS[2][2], false],
  [J.MEETINGS[3][0], J.MEETINGS[3][1], J.MEETINGS[3][2], true],
  [J.MEETINGS[4][0], J.MEETINGS[4][1], J.MEETINGS[4][2], false],
];
const COUNT = J.COUNT;

export const en: RiddleWords = {
  cap,
  boys: BOYS,
  girls: GIRLS,
  note: J.note,

  oneOf: (skin) => {
    const [lead, ask, things] = ONE_OF[skin];
    return {
      things: things.map(bare),
      tell: (set, out) => ({
        text: fill(J.oneOf.tell.text[1], { lead, set: list(set.map((i) => things[i]), J.oneOf.tell.text[2]), out: list(out.map((i) => fill(J.oneOf.tell.text[3], { things: things[i] }))), ask }),
        how: fill(J.oneOf.tell.how, { out: out.map((i) => things[i]).join(', ') }),
      }),
    };
  },

  row: (skin) => {
    const [verb, what, three] = ROWS_OF_THREE[skin];
    return {
      names: three,
      ends: [J.row.ends[0], J.row.ends[1]],
      tell: (l, m, r, asked, leftFirst) => ({
        text: `${
          leftFirst
            ? fill(J.row.tell.text[1], { three: three[l], verb, three2: three[m], three3: three[r] })
            : fill(J.row.tell.text[2], { three: three[r], verb, three2: three[m], three3: three[l] })
        } ${what} ${verb} ${J.row.tell.text[3][asked]}?`,
        how: fill(J.row.tell.how, { three: three[l], three2: three[m], three3: three[r] }),
      }),
    };
  },

  chain: (skin, girls) => {
    const [more, top, bottom] = COMPARE[skin];
    const names = girls ? GIRLS : BOYS;
    return {
      tell: (row, order, low) => {
        const links = row.slice(0, -1).map((who, i) => fill(J.chain.tell.links, { names: names[who], more, names2: names[row[i + 1]] }));
        const told = order.map((i) => links[i]);
        return {
          text: fill(J.chain.tell.text, { told: told.slice(0, -1).join(', '), told2: told[told.length - 1], low: low ? bottom : top }),
          how: fill(J.chain.tell.how, { row: row.map((w) => names[w]).join(', '), top, bottom }),
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
    short: DAYS.map((d) => d.slice(0, 3)),
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
    const [lead, thing, colours] = REPEATS[skin];
    return {
      colours,
      tell: (unit, place) => ({
        text: fill(J.repeats.tell.text, { lead, unit: [...unit, ...unit].map((c) => colours[c]).join(', '), place: ordinal(place), thing }),
        how: fill(J.repeats.tell.how, { length: unit.length, unit: unit.map((c) => colours[c]).join(', ') }),
      }),
    };
  },

  race: (skin) => {
    const did = RACES[skin];
    return {
      ends: [J.race.ends[0], J.race.ends[1]],
      tell: (f, s, t, last, told) => {
        const [first, second, third] = [BOYS[f], BOYS[s], BOYS[t]];
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
      () => ({ text: fill(J.family[0].text[1], { a, a2: a === 1 ? J.family[0].text[2] : J.family[0].text[3], b, b2: b === 1 ? J.family[0].text[4] : J.family[0].text[5] }), how: J.family[0].how }),
      () => ({ text: fill(J.family[1].text, { a }), how: J.family[1].how }),
      () => ({ text: fill(J.family[2].text, { a }), how: J.family[2].how }),
      () => ({ text: fill(J.family[3].text, { a }), how: J.family[3].how }),
      () => ({ text: fill(J.family[4].text, { a }), how: J.family[4].how }),
    ][at](),

  ages: (at, [a, d, e]) =>
    [
      () => ({ text: fill(J.ages[0].text, { a, d }), how: J.ages[0].how }),
      () => ({ text: fill(J.ages[1].text, { d, a: a + d }), how: J.ages[1].how }),
      () => ({ text: fill(J.ages[2].text, { a }), how: J.ages[2].how }),
      () => ({ text: fill(J.ages[3].text[1], { d: d === 2 ? J.ages[3].text[2] : J.ages[3].text[3], a: a - d, e, e2: e === 1 ? J.ages[3].text[4] : J.ages[3].text[5] }), how: J.ages[3].how }),
      () => ({ text: fill(J.ages[4].text, { d, a }), how: J.ages[4].how }),
    ][at](),

  hidden: (at, [a, b]) =>
    [
      () => ({ text: fill(J.hidden[0].text, { a, b }), how: fill(J.hidden[0].how, { a, b }) }),
      () => ({ text: fill(J.hidden[1].text, { a, b }), how: fill(J.hidden[1].how, { a, b }) }),
      () => ({ text: fill(J.hidden[2].text, { a, b }), how: J.hidden[2].how }),
      () => ({ text: fill(J.hidden[3].text, { a, b }), how: fill(J.hidden[3].how, { b, a }) }),
      () => ({ text: fill(J.hidden[4].text, { b, a }), how: fill(J.hidden[4].how, { a, b }) }),
    ][at](),

  owners: (skin) => {
    const [does, kind, listed, named, ask] = OWNERS[skin];
    return {
      things: named.map(bare),
      tell: (who, has, hard) => {
        const kids = who.map((k) => BOYS[k]);
        const not = (kid: string, things: number[]) => fill(J.owners.tell.not[1], { kid, kind, things: things.map((t) => fill(J.owners.tell.not[2], { named: named[t] })).join(J.owners.tell.not[3]) });
        const asked = kids[hard ? 1 : 0];
        return {
          text: fill(J.owners.tell.text[1], { kids: list(kids), does, listed: listed.join(', '), kids2: not(kids[0], [has[1], has[2]]), hard: hard ? ` ${not(kids[2], [has[1]])}` : '', ask: ask ? ask(asked) : fill(J.owners.tell.text[2], { asked, kind }) }),
          how: hard
            ? fill(J.owners.tell.how[1], { kids: kids[0], kind, kids2: kids[2], kids3: kids[1] })
            : J.owners.tell.how[2],
        };
      },
    };
  },

  meetings: (skin) => {
    const [who, did, ask, both] = MEETINGS[skin];
    return {
      tell: (n) => ({
        text: `${COUNT[n - 3]} ${who} ${did}. ${ask}`,
        how: both
          ? J.meetings.tell.how[1]
          : fill(J.meetings.tell.how[2], { length: Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(' + ') }),
      }),
    };
  },
};
