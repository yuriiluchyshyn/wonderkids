/** Content for «Пори року і місяці». */
import { adj, noun, own, verb, type Clause } from '@/core/language/uk';
import TEXTS from '@/locales/app/uk/games/nature.json';

const J = TEXTS.content.data;

/** `word` declines the name («із зими», «з осені»); `of` is «зимовий» for «зимові місяці». */
export const SEASONS = [
  { id: 'winter', name: J.SEASONS.winter.name, word: noun(J.SEASONS.winter.word, 'f'), of: adj(J.SEASONS.winter.of), emoji: '❄️', no: J.SEASONS.winter.no },
  { id: 'spring', name: J.SEASONS.spring.name, word: noun(J.SEASONS.spring.word, 'f'), of: adj(J.SEASONS.spring.of), emoji: '🌷', no: J.SEASONS.spring.no },
  { id: 'summer', name: J.SEASONS.summer.name, word: noun(J.SEASONS.summer.word, 'n'), of: adj(J.SEASONS.summer.of), emoji: '☀️', no: J.SEASONS.summer.no },
  { id: 'autumn', name: J.SEASONS.autumn.name, word: noun(J.SEASONS.autumn.word[1], 'f', J.SEASONS.autumn.word[2]), of: adj(J.SEASONS.autumn.of), emoji: '🍂', no: J.SEASONS.autumn.no },
] as const;

/** «місяці», «місяців» — for texts that count or describe them. */
export const MONTH_WORD = noun(J.MONTH_WORD, 'm', { number: 'pl' });

export type SeasonId = (typeof SEASONS)[number]['id'];

export interface Month {
  id: string;
  name: string;
  /** «після березня», «перед березнем» need these forms. */
  after: string;
  before: string;
  season: SeasonId;
  emoji: string;
  /** Where the name comes from — the story told when the month is placed. */
  fact: string;
}

/** January first: the order IS the calendar. */
export const MONTHS: Month[] = [
  { id: 'jan', name: J.MONTHS.jan.name, after: J.MONTHS.jan.after, before: J.MONTHS.jan.before, season: 'winter', emoji: '⛄', fact: J.MONTHS.jan.fact },
  { id: 'feb', name: J.MONTHS.feb.name, after: J.MONTHS.feb.after, before: J.MONTHS.feb.before, season: 'winter', emoji: '🌨️', fact: J.MONTHS.feb.fact },
  { id: 'mar', name: J.MONTHS.mar.name, after: J.MONTHS.mar.after, before: J.MONTHS.mar.before, season: 'spring', emoji: '🌱', fact: J.MONTHS.mar.fact },
  { id: 'apr', name: J.MONTHS.apr.name, after: J.MONTHS.apr.after, before: J.MONTHS.apr.before, season: 'spring', emoji: '🌷', fact: J.MONTHS.apr.fact },
  { id: 'may', name: J.MONTHS.may.name, after: J.MONTHS.may.after, before: J.MONTHS.may.before, season: 'spring', emoji: '🌿', fact: J.MONTHS.may.fact },
  { id: 'jun', name: J.MONTHS.jun.name, after: J.MONTHS.jun.after, before: J.MONTHS.jun.before, season: 'summer', emoji: '🍓', fact: J.MONTHS.jun.fact },
  { id: 'jul', name: J.MONTHS.jul.name, after: J.MONTHS.jul.after, before: J.MONTHS.jul.before, season: 'summer', emoji: '🐝', fact: J.MONTHS.jul.fact },
  { id: 'aug', name: J.MONTHS.aug.name, after: J.MONTHS.aug.after, before: J.MONTHS.aug.before, season: 'summer', emoji: '🌾', fact: J.MONTHS.aug.fact },
  { id: 'sep', name: J.MONTHS.sep.name, after: J.MONTHS.sep.after, before: J.MONTHS.sep.before, season: 'autumn', emoji: '🎒', fact: J.MONTHS.sep.fact },
  { id: 'oct', name: J.MONTHS.oct.name, after: J.MONTHS.oct.after, before: J.MONTHS.oct.before, season: 'autumn', emoji: '🍁', fact: J.MONTHS.oct.fact },
  { id: 'nov', name: J.MONTHS.nov.name, after: J.MONTHS.nov.after, before: J.MONTHS.nov.before, season: 'autumn', emoji: '🍂', fact: J.MONTHS.nov.fact },
  { id: 'dec', name: J.MONTHS.dec.name, after: J.MONTHS.dec.after, before: J.MONTHS.dec.before, season: 'winter', emoji: '🎄', fact: J.MONTHS.dec.fact },
];

const many = { number: 'pl' } as const;
const alive = { number: 'pl', animate: true } as const;

/** What happens in the signs below. */
const DO = {
  build: verb(J.DO.build._, [J.DO.build[0], J.DO.build[1]]),
  bathe: verb(J.DO.bathe._, [J.DO.bathe[0], J.DO.bathe[1]]),
  fall: verb(J.DO.fall._, [J.DO.fall[0], J.DO.fall[1]]),
  bloom: verb(J.DO.bloom._, [J.DO.bloom[0], J.DO.bloom[1]]),
  decorate: verb(J.DO.decorate._, [J.DO.decorate[0], J.DO.decorate[1]]),
  ripen: verb(J.DO.ripen._, [J.DO.ripen[0], J.DO.ripen[1]]),
  return: verb(J.DO.return._, [J.DO.return[0], J.DO.return[1]]),
  gather: verb(J.DO.gather._, [J.DO.gather[0], J.DO.gather[1]]),
  skate: verb(J.DO.skate._, [J.DO.skate[0], J.DO.skate[1]]),
  flower: verb(J.DO.flower[1][1], [J.DO.flower[0], J.DO.flower[1][2]], J.DO.flower[2] as { past: [string, string, string, string] }),
  appear: verb(J.DO.appear._, [J.DO.appear[0], J.DO.appear[1]]),
  go: verb(J.DO.go[1][1], [J.DO.go[0], J.DO.go[1][2]], J.DO.go[2] as { past: [string, string, string, string] }),
  sleep: verb(J.DO.sleep._, [J.DO.sleep[0], J.DO.sleep[1]]),
  fly: verb(J.DO.fly._, [J.DO.fly[0], J.DO.fly[1]]),
  melt: verb(J.DO.melt._, [J.DO.melt[0], J.DO.melt[1]]),
  wear: verb(J.DO.wear._, [J.DO.wear[0], J.DO.wear[1]]),
  hatch: verb(J.DO.hatch._, [J.DO.hatch[0], J.DO.hatch[1]]),
  store: verb(J.DO.store._, [J.DO.store[0], J.DO.store[1]]),
  happen: verb(J.DO.happen._, [J.DO.happen[0], J.DO.happen[1]]),
};

/**
 * A sign of a season: what you see, do or eat then — a clause, not a ready
 * text, so the card («Достигають кавуни») and the question («Коли достигають
 * кавуни?») are both made from it. Easiest first.
 */
export interface Sign {
  emoji: string;
  what: Clause;
  season: SeasonId;
  fact: string;
}

const sign = (emoji: string, what: Clause, season: SeasonId, fact: string): Sign => ({ emoji, what, season, fact });

export const SIGNS: Sign[] = [
  sign('⛄', { does: DO.build, tail: J.SIGNS[0].tail }, 'winter', J.SIGNS[0]._),
  sign('🏖️', { does: DO.bathe, tail: J.SIGNS[1].tail }, 'summer', J.SIGNS[1]._),
  sign('🍂', { who: noun(J.SIGNS[2].who, 'n'), does: DO.fall }, 'autumn', J.SIGNS[2]._),
  sign('🌷', { who: noun(J.SIGNS[3].who, 'm', many), does: DO.bloom }, 'spring', J.SIGNS[3]._),
  sign('🎄', { does: DO.decorate, tail: J.SIGNS[4].tail }, 'winter', J.SIGNS[4]._),
  sign('🍉', { who: noun(J.SIGNS[5].who, 'm', many), does: DO.ripen }, 'summer', J.SIGNS[5]._),
  sign('🐦', { who: noun(J.SIGNS[6].who, 'm', alive), does: DO.return, subjectFirst: true, tail: J.SIGNS[6].tail }, 'spring', J.SIGNS[6]._),
  sign('🍄', { does: DO.gather, tail: J.SIGNS[7].tail }, 'autumn', J.SIGNS[7]._),
  sign('⛸️', { does: DO.skate, tail: J.SIGNS[8].tail }, 'winter', J.SIGNS[8]._),
  sign('🌻', { who: noun(J.SIGNS[9].who, 'm', many), does: DO.flower }, 'summer', J.SIGNS[9]._),
  sign('🌱', { who: noun(J.SIGNS[10].who._, 'm', { ...many, pl: J.SIGNS[10].who.pl }), does: DO.appear }, 'spring', J.SIGNS[10]._),
  sign('🎒', { who: noun(J.SIGNS[11].who._, 'f', { ...alive, pl: J.SIGNS[11].who.pl }), does: DO.go, subjectFirst: true, tail: J.SIGNS[11].tail }, 'autumn', own(J.SIGNS[11]._)),
  sign('🐻', { who: noun(J.SIGNS[12].who, 'm', { animate: true }), does: DO.sleep, subjectFirst: true, tail: J.SIGNS[12].tail }, 'winter', J.SIGNS[12]._),
  sign('🦋', { who: noun(J.SIGNS[13].who, 'm', alive), does: DO.fly }, 'summer', J.SIGNS[13]._),
  sign('💧', { who: noun(J.SIGNS[14].who, 'm'), does: DO.melt, tail: J.SIGNS[14].tail }, 'spring', J.SIGNS[14]._),
  sign('🎃', { who: noun(J.SIGNS[15].who, 'm', many), does: DO.ripen }, 'autumn', J.SIGNS[15]._),
  sign('🧤', { does: DO.wear, tail: J.SIGNS[16].tail }, 'winter', J.SIGNS[16]._),
  sign('🍓', { who: noun(J.SIGNS[17].who, 'f', many), does: DO.ripen }, 'summer', J.SIGNS[17]._),
  sign('🐣', { who: noun(J.SIGNS[18].who._, 'n', { ...alive, pl: J.SIGNS[18].who.pl }), does: DO.hatch }, 'spring', J.SIGNS[18]._),
  sign('🌧️', { lead: J.SIGNS[19].lead, who: noun(J.SIGNS[19].who._, 'm', { ...many, pl: J.SIGNS[19].who.pl }), does: DO.go }, 'autumn', J.SIGNS[19]._),
  sign('🐿️', { who: noun(J.SIGNS[20].who, 'f', { animate: true }), does: DO.store, subjectFirst: true, tail: J.SIGNS[20].tail }, 'autumn', J.SIGNS[20]._),
  sign('🌈', { who: noun(J.SIGNS[21].who._, 'f', { ...many, pl: J.SIGNS[21].who.pl }), does: DO.happen }, 'summer', J.SIGNS[21]._),
];

/** Ten things to tell about each season once something is sorted into it. */
export const SEASON_FACTS: Record<SeasonId, string[]> = J.SEASON_FACTS;
