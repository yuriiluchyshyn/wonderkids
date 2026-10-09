import { capitalise, clause, from, inflect, list, own, phrase } from '@/core/language/uk';
import { MONTHS, MONTH_WORD, SEASONS, SEASON_FACTS, SIGNS, type SeasonId } from '@/games/nature/content/data';
import type { NatureTexts } from '@/games/nature/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/uk/games/nature.json';

/**
 * The Nature galaxy in Ukrainian — its original sentences, word for word,
 * built with the phrase engine from the words written with the content itself
 * (`content/data.ts`).
 */

const seasonOf = (id: SeasonId) => SEASONS.find((s) => s.id === id) ?? SEASONS[0];
const low = (at: number) => MONTHS[at].name.toLowerCase();
const ORDINAL = J.ORDINAL;

export const uk: NatureTexts = {
  introFor: (step) => {
    if (step === 3) return J.introFor[1];
    if (step === 4 || step === 5) return J.introFor[2];
    if (step === 6 || step === 8) return J.introFor[3];
    if (step === 7) return J.introFor[4];
    return undefined;
  },
  season: (id) => ({ name: seasonOf(id).name, no: seasonOf(id).no, facts: SEASON_FACTS[id] }),
  // A month's fact tells where ITS name comes from: each language has its own story (`own`).
  month: (at) => ({ name: MONTHS[at].name, fact: own(MONTHS[at].fact) }),
  sign: (at) => ({ ask: fill(J.sign.ask, { at: clause(SIGNS[at].what, 'present', { we: true }) }), label: capitalise(clause(SIGNS[at].what)), fact: SIGNS[at].fact }),
  monthSeason: {
    ask: (m) => fill(J.monthSeason.ask, { m: low(m) }),
    hint: (m, season) => fill(J.monthSeason.hint, { name: MONTHS[m].name, season: seasonOf(season).name.toLowerCase(), season2: SEASON_FACTS[season][0] }),
  },
  after: {
    ask: (m) => fill(J.after.ask, { after: MONTHS[m].after }),
    hint: (m) => fill(J.after.hint, { m: low((m + 11) % 12), m2: low(m) }),
    fact: (m) => fill(J.after.fact, { after: MONTHS[m].after, m: low((m + 1) % 12) }),
  },
  before: {
    ask: (m) => fill(J.before.ask, { before: MONTHS[m].before }),
    hint: (m) => fill(J.before.hint, { m: low(m) }),
    fact: (m) => fill(J.before.fact, { before: MONTHS[m].before, m: low((m + 11) % 12) }),
  },
  orderMonths: {
    ask: (season) => phrase(J.orderMonths.ask, { of: seasonOf(season).of, months: MONTH_WORD }),
    hint: (season, first) => fill(J.orderMonths.hint, { name: seasonOf(season).name, first: from(MONTHS[first].after) }),
    fact: (season, months) => fill(J.orderMonths.fact, { name: seasonOf(season).name, months: list(months.map(low)) }),
  },
  ends: [J.ends[0], J.ends[1]],
  nth: {
    ask: (m) => fill(J.nth.ask, { m: ORDINAL[m] }),
    hint: J.nth.hint,
    fact: (m) => fill(J.nth.fact, { name: MONTHS[m].name, m: ORDINAL[m] }),
  },
  orderSeasons: {
    ask: (first) => fill(J.orderSeasons.ask, { first: from(inflect(seasonOf(first).word, 'gen')) }),
    circle: J.orderSeasons.circle,
  },
};
