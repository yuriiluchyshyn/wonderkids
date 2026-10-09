import { ordinalWords } from '@/core/language/pl';
import { own } from '@/core/language/marks';
import type { SeasonId } from '@/games/nature/content/data';
import type { NatureTexts } from '@/games/nature/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/pl/games/nature.json';

/** The Nature galaxy in Polish. */

/** A season: its name, «od zimy», the months' adjective («zimowe miesiące»), the answer to a wrong bin, ten facts. */
const SEASONS: Record<SeasonId, { name: string; from: string; of: string; no: string; facts: string[] }> = J.SEASONS;

/**
 * The months: the name, «od stycznia» (genitive), «po styczniu» (locative),
 * «przed styczniem» (instrumental) — and the story of each one's Polish name.
 */
const MONTHS: [name: string, from: string, after: string, before: string, fact: string][] = [
  [J.MONTHS[0][0], J.MONTHS[0][1], J.MONTHS[0][2], J.MONTHS[0][3], J.MONTHS[0][4]],
  [J.MONTHS[1][0], J.MONTHS[1][1], J.MONTHS[1][2], J.MONTHS[1][3], J.MONTHS[1][4]],
  [J.MONTHS[2][0], J.MONTHS[2][1], J.MONTHS[2][2], J.MONTHS[2][3], J.MONTHS[2][4]],
  [J.MONTHS[3][0], J.MONTHS[3][1], J.MONTHS[3][2], J.MONTHS[3][3], J.MONTHS[3][4]],
  [J.MONTHS[4][0], J.MONTHS[4][1], J.MONTHS[4][2], J.MONTHS[4][3], J.MONTHS[4][4]],
  [J.MONTHS[5][0], J.MONTHS[5][1], J.MONTHS[5][2], J.MONTHS[5][3], J.MONTHS[5][4]],
  [J.MONTHS[6][0], J.MONTHS[6][1], J.MONTHS[6][2], J.MONTHS[6][3], J.MONTHS[6][4]],
  [J.MONTHS[7][0], J.MONTHS[7][1], J.MONTHS[7][2], J.MONTHS[7][3], J.MONTHS[7][4]],
  [J.MONTHS[8][0], J.MONTHS[8][1], J.MONTHS[8][2], J.MONTHS[8][3], J.MONTHS[8][4]],
  [J.MONTHS[9][0], J.MONTHS[9][1], J.MONTHS[9][2], J.MONTHS[9][3], J.MONTHS[9][4]],
  [J.MONTHS[10][0], J.MONTHS[10][1], J.MONTHS[10][2], J.MONTHS[10][3], J.MONTHS[10][4]],
  [J.MONTHS[11][0], J.MONTHS[11][1], J.MONTHS[11][2], J.MONTHS[11][3], J.MONTHS[11][4]],
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

const low = (at: number) => MONTHS[at][0].toLocaleLowerCase('pl');

export const pl: NatureTexts = {
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
  month: (at) => ({ name: MONTHS[at][0], fact: own(MONTHS[at][4]) }),
  sign: (at) => ({ ask: SIGNS[at][0], label: SIGNS[at][1], fact: SIGNS[at][2] }),
  monthSeason: {
    ask: (m) => fill(J.monthSeason.ask, { m: low(m) }),
    hint: (m, season) => fill(J.monthSeason.hint, { m: MONTHS[m][0], season: SEASONS[season].name.toLocaleLowerCase('pl'), season2: SEASONS[season].facts[0] }),
  },
  after: {
    ask: (m) => fill(J.after.ask, { m: MONTHS[m][2] }),
    hint: (m) => fill(J.after.hint, { m: low((m + 11) % 12), m2: low(m) }),
    fact: (m) => fill(J.after.fact, { m: MONTHS[m][2], m2: low((m + 1) % 12) }),
  },
  before: {
    ask: (m) => fill(J.before.ask, { m: MONTHS[m][3] }),
    hint: (m) => fill(J.before.hint, { m: low(m) }),
    fact: (m) => fill(J.before.fact, { m: MONTHS[m][3], m2: low((m + 11) % 12) }),
  },
  orderMonths: {
    ask: (season) => fill(J.orderMonths.ask, { of: SEASONS[season].of }),
    hint: (season, first) => fill(J.orderMonths.hint, { name: SEASONS[season].name, first: MONTHS[first][1] }),
    fact: (season, months) => fill(J.orderMonths.fact, { name: SEASONS[season].name, months: low(months[0]), months2: low(months[1]), months3: low(months[2]) }),
  },
  ends: [J.ends[0], J.ends[1]],
  nth: {
    ask: (m) => fill(J.nth.ask, { m: ordinalWords(m + 1) }),
    hint: J.nth.hint,
    fact: (m) => fill(J.nth.fact, { m: MONTHS[m][0], m2: ordinalWords(m + 1) }),
  },
  orderSeasons: {
    ask: (first) => fill(J.orderSeasons.ask, { from: SEASONS[first].from }),
    circle: J.orderSeasons.circle,
  },
};
