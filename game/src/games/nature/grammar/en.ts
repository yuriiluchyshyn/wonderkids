import { ordinalWords } from '@/core/language/en';
import { own } from '@/core/language/marks';
import type { SeasonId } from '@/games/nature/content/data';
import type { NatureTexts } from '@/games/nature/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/en/games/nature.json';

/** The Nature galaxy in English. */

const SEASONS: Record<SeasonId, { name: string; said: string; no: string; facts: string[] }> = J.SEASONS;

/** The months and the story of each one's English name. */
const MONTHS: [name: string, fact: string][] = [
  [J.MONTHS[0][0], J.MONTHS[0][1]],
  [J.MONTHS[1][0], J.MONTHS[1][1]],
  [J.MONTHS[2][0], J.MONTHS[2][1]],
  [J.MONTHS[3][0], J.MONTHS[3][1]],
  [J.MONTHS[4][0], J.MONTHS[4][1]],
  [J.MONTHS[5][0], J.MONTHS[5][1]],
  [J.MONTHS[6][0], J.MONTHS[6][1]],
  [J.MONTHS[7][0], J.MONTHS[7][1]],
  [J.MONTHS[8][0], J.MONTHS[8][1]],
  [J.MONTHS[9][0], J.MONTHS[9][1]],
  [J.MONTHS[10][0], J.MONTHS[10][1]],
  [J.MONTHS[11][0], J.MONTHS[11][1]],
];

/** The signs of the seasons, in the order of `SIGNS`: the question, the card, the fact. */
const SIGNS: [ask: string, label: string, fact: string][] = [
  [J.SIGNS[0][0], J.SIGNS[0][1], J.SIGNS[0][2]],
  [J.SIGNS[1][0], J.SIGNS[1][1], J.SIGNS[1][2]],
  [J.SIGNS[2][0], J.SIGNS[2][1], J.SIGNS[2][2]],
  [J.SIGNS[3][0], J.SIGNS[3][1], J.SIGNS[3][2]],
  [J.SIGNS[4][0], J.SIGNS[4][1], J.SIGNS[4][2]],
  [J.SIGNS[5][0], J.SIGNS[5][1], J.SIGNS[5][2]],
  [J.SIGNS[6][0], J.SIGNS[6][1], J.SIGNS[6][2]],
  [J.SIGNS[7][0], J.SIGNS[7][1], J.SIGNS[7][2]],
  [J.SIGNS[8][0], J.SIGNS[8][1], J.SIGNS[8][2]],
  [J.SIGNS[9][0], J.SIGNS[9][1], J.SIGNS[9][2]],
  [J.SIGNS[10][0], J.SIGNS[10][1], J.SIGNS[10][2]],
  [J.SIGNS[11][0], J.SIGNS[11][1], own(J.SIGNS[11][2])],
  [J.SIGNS[12][0], J.SIGNS[12][1], J.SIGNS[12][2]],
  [J.SIGNS[13][0], J.SIGNS[13][1], J.SIGNS[13][2]],
  [J.SIGNS[14][0], J.SIGNS[14][1], J.SIGNS[14][2]],
  [J.SIGNS[15][0], J.SIGNS[15][1], J.SIGNS[15][2]],
  [J.SIGNS[16][0], J.SIGNS[16][1], J.SIGNS[16][2]],
  [J.SIGNS[17][0], J.SIGNS[17][1], J.SIGNS[17][2]],
  [J.SIGNS[18][0], J.SIGNS[18][1], J.SIGNS[18][2]],
  [J.SIGNS[19][0], J.SIGNS[19][1], J.SIGNS[19][2]],
  [J.SIGNS[20][0], J.SIGNS[20][1], J.SIGNS[20][2]],
  [J.SIGNS[21][0], J.SIGNS[21][1], J.SIGNS[21][2]],
];

const name = (at: number) => MONTHS[at][0];
const cap = (text: string) => text[0].toUpperCase() + text.slice(1);

export const en: NatureTexts = {
  cards: J.cards,
  introFor: (step) => {
    if (step === 3) return J.introFor[1];
    if (step === 4 || step === 5) return J.introFor[2];
    if (step === 6 || step === 8) return J.introFor[3];
    if (step === 7) return J.introFor[4];
    return undefined;
  },
  season: (id) => SEASONS[id],
  // A month's fact tells where ITS name comes from: each language has its own story (`own`).
  month: (at) => ({ name: name(at), fact: own(MONTHS[at][1]) }),
  sign: (at) => ({ ask: SIGNS[at][0], label: SIGNS[at][1], fact: SIGNS[at][2] }),
  monthSeason: {
    ask: (m) => fill(J.monthSeason.ask, { m: name(m) }),
    hint: (m, season) => fill(J.monthSeason.hint, { m: name(m), said: SEASONS[season].said, season: SEASONS[season].facts[0] }),
  },
  after: {
    ask: (m) => fill(J.after.ask, { m: name(m) }),
    hint: (m) => fill(J.after.hint, { m: name((m + 11) % 12), m2: name(m) }),
    fact: (m) => fill(J.after.fact, { m: name(m), m2: name((m + 1) % 12) }),
  },
  before: {
    ask: (m) => fill(J.before.ask, { m: name(m) }),
    hint: (m) => fill(J.before.hint, { m: name(m) }),
    fact: (m) => fill(J.before.fact, { m: name(m), m2: name((m + 11) % 12) }),
  },
  orderMonths: {
    ask: (season) => fill(J.orderMonths.ask, { season: SEASONS[season].name.toLowerCase() }),
    hint: (season, first) => fill(J.orderMonths.hint, { season: cap(SEASONS[season].said), first: name(first) }),
    fact: (season, months) => fill(J.orderMonths.fact, { season: cap(SEASONS[season].said), months: name(months[0]), months2: name(months[1]), months3: name(months[2]) }),
  },
  ends: [J.ends[0], J.ends[1]],
  nth: {
    ask: (m) => fill(J.nth.ask, { m: ordinalWords(m + 1) }),
    hint: J.nth.hint,
    fact: (m) => fill(J.nth.fact, { m: name(m), m2: ordinalWords(m + 1) }),
  },
  orderSeasons: {
    ask: (first) => fill(J.orderSeasons.ask, { said: SEASONS[first].said }),
    circle: J.orderSeasons.circle,
  },
};
