import { COUNTRIES as LIST } from '@/games/geography/content/countries';
import { BIOME_ANIMALS, CONTINENT_ANIMALS, DAY_NIGHT as DAY_NIGHT_LIST, TIME_SHIFTS } from '@/games/geography/content/data';
import { cap } from '@/games/geography/grammar/shared';
import type { GeographyTexts } from '@/games/geography/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/en/games/geography.json';

const CAPITALS: Record<string, string> = J.data.places.CAPITALS;
const COUNTRIES: Record<string, string> = J.data.places.COUNTRIES;
const IN_CONTINENT: Record<string, string> = J.data.places.IN_CONTINENT;
const LOOKS: Record<string, string> = J.data.places.LOOKS;
const REGIONS: Record<string, string> = J.data.places.REGIONS;
const OCEANS: Record<string, { fact: string; pool: string[]; riddles: string[]; riddleFacts: string[] }> = J.data.oceans.OCEANS;
const PLACES: Record<string, string[]> = J.data.oceans.PLACES;
const RIVERS: Record<string, string[]> = J.data.oceans.RIVERS;
const SEAS: Record<string, string[]> = J.data.oceans.SEAS;
const ANIMALS: Record<string, string[]> = J.data.nature.ANIMALS;
const MAP_ANIMALS: Record<string, string> = J.data.nature.MAP_ANIMALS;
const ZONES = J.data.nature.ZONES;
const CITIES: Record<string, string> = J.data.capitals.CITIES;
const DAY_NIGHT: Record<string, string[]> = J.data.capitals.DAY_NIGHT;
const LANDMARKS: Record<string, string[]> = J.data.capitals.LANDMARKS;
const LANDMARK_FACTS: Record<string, string[]> = J.data.capitals.LANDMARK_FACTS;
const ANIMAL_FACTS: Record<string, string[]> = J.data.animalFacts.ANIMAL_FACTS;

/** The Geography galaxy in English. */

/** «the Netherlands» in a sentence, «Netherlands» on a card. */
const the = (id: string) => COUNTRIES[id];
const bare = (id: string) => COUNTRIES[id].replace(/^the /, '');
const continentOf = Object.fromEntries(LIST.map((c) => [c.id, c.continent]));
const partOf = (id: string) => IN_CONTINENT[continentOf[id]];
const homeOf = Object.fromEntries(CONTINENT_ANIMALS.map((a) => [a.id, a.home]));
const first = new Set(BIOME_ANIMALS.map((a) => a.id));
const kyivAt = Object.fromEntries(DAY_NIGHT_LIST.map((q) => [q.id, q.kyiv]));
const shiftOf = Object.fromEntries(TIME_SHIFTS.map((t) => [t.id, t]));
const hours = (n: number) => `${n} ${n === 1 ? J.hours[1] : J.hours[2]}`;

export const en: GeographyTexts = {
  cards: {
    title: J.cards.title,
    games: {
      flags: {
        label: J.cards.games.flags.label,
        blurb: fill(J.cards.games.flags.blurb, { length: LIST.length }),
        intro: J.cards.games.flags.intro,
      },
      continents: J.cards.games.continents,
      biomes: {
        label: J.cards.games.biomes.label,
        blurb: fill(J.cards.games.biomes.blurb, { length: Object.keys(ANIMALS).length }),
        intro: J.cards.games.biomes.intro,
      },
      oceans: J.cards.games.oceans,
      capitals: {
        label: J.cards.games.capitals.label,
        blurb: fill(J.cards.games.capitals.blurb, { length: Object.keys(CAPITALS).length }),
        intro: J.cards.games.capitals.intro,
      },
    },
  },
  country: bare,
  region: (id) => REGIONS[id],
  flags: {
    ask: (id) => fill(J.flags.ask, { id: the(id) }),
    hint: (id) => LOOKS[id] ?? fill(J.flags.hint, { id: cap(the(id)), id2: partOf(id) }),
    stories: (id) => [
      fill(J.flags.stories[0], { id: the(id) }),
      LOOKS[id],
      fill(J.flags.stories[2], { id: cap(the(id)), id2: partOf(id) }),
      fill(J.flags.stories[3], { id: the(id) }),
      fill(J.flags.stories[4], { id: the(id) }),
      fill(J.flags.stories[5], { id: the(id) }),
      fill(J.flags.stories[6], { id: the(id) }),
      fill(J.flags.stories[7], { id: the(id), id2: partOf(id) }),
      fill(J.flags.stories[8], { id: the(id) }),
      fill(J.flags.stories[9], { id: cap(the(id)) }),
      fill(J.flags.stories[10], { id: the(id) }),
    ],
  },
  map: {
    animalAsk: (id) => fill(J.map.animalAsk, { id: MAP_ANIMALS[id] }),
    animalHint: (id) => fill(J.map.animalHint, { id: MAP_ANIMALS[id], homeOf: REGIONS[homeOf[id]] }),
    animalFacts: (id) => ANIMAL_FACTS[id],
    countryAsk: (id) => fill(J.map.countryAsk, { id: the(id) }),
    countryHint: (id) => fill(J.map.countryHint, { continentOf: REGIONS[continentOf[id]] }),
    countryYes: (id) => [fill(J.map.countryYes[0], { id: cap(the(id)), id2: partOf(id) }), fill(J.map.countryYes[1], { id: the(id), continentOf: REGIONS[continentOf[id]] })],
  },
  zone: (id) => ZONES[id],
  animal: (id) => {
    const [name, clue, fact, ...more] = ANIMALS[id];
    return { name, clue, fact, facts: ANIMAL_FACTS[id] ?? (first.has(id) ? [fact] : [fact, ...more]) };
  },
  zones: {
    whereAsk: (id) => fill(J.zones.whereAsk, { id: ANIMALS[id][0] }),
    whereHint: (id) => fill(J.zones.whereHint, { id: ANIMALS[id][2] }),
    whoAsk: (id) => fill(J.zones.whoAsk, { where: ZONES[id].where }),
    whoHint: (id) => fill(J.zones.whoHint, { id: ZONES[id].signs[0] }),
    riddleAsk: (id) => fill(J.zones.riddleAsk, { id: ANIMALS[id][1] }),
    riddleHint: (id, home) => fill(J.zones.riddleHint, { where: ZONES[home].where, id: ANIMALS[id][0][0].toUpperCase() }),
    oddAsk: J.zones.oddAsk,
    oddHint: (id) => fill(J.zones.oddHint, { where: ZONES[id].where }),
    zoneAsk: (id, i) => fill(J.zones.zoneAsk, { id: ZONES[id].signs[i] }),
    zoneHint: (id, dwellers) => (dwellers.length > 0 ? fill(J.zones.zoneHint[1], { dwellers: dwellers.map((a) => ANIMALS[a][0]).join(J.zones.zoneHint[2]) }) : ZONES[id].signs[0]),
    zoneYes: (id, i) => fill(J.zones.zoneYes, { id: ZONES[id].where.replace(/^in /, ''), id2: ZONES[id].signs[i] }),
  },
  ocean: (id) => OCEANS[id],
  seas: {
    sailTo: (id) => fill(J.seas.sailTo, { id: REGIONS[id] }),
    riddleAsk: (id, i) => fill(J.seas.riddleAsk, { id: OCEANS[id].riddles[i] }),
    hint: (clue) => fill(J.seas.hint, { clue }),
    itIs: (id) => fill(J.seas.itIs, { id: REGIONS[id] }),
    sea: (id) => ({ ask: fill(J.seas.sea.ask, { id: SEAS[id][0] }), fact: SEAS[id][1] }),
    place: (id) => ({ ask: fill(J.seas.place.ask, { id: PLACES[id][0] }), fact: PLACES[id][1] }),
    river: (id) => ({ ask: fill(J.seas.river.ask, { id: RIVERS[id][0] }), fact: RIVERS[id][1] }),
    shoreAsk: (id) => fill(J.seas.shoreAsk, { id: the(id) }),
    shoreYes: (id, ocean) => fill(J.seas.shoreYes, { id: the(id), ocean: REGIONS[ocean] }),
  },
  capitals: {
    landmark: (id) => {
      const [name, inSentence, capital, country] = LANDMARKS[id];
      return {
        name,
        capital,
        ask: fill(J.capitals.landmark.ask, { inSentence }),
        hint: fill(J.capitals.landmark.hint, { inSentence: cap(inSentence), country }),
        facts: LANDMARK_FACTS[id],
      };
    },
    capital: (id) => CAPITALS[id],
    ask: (id) => fill(J.capitals.ask, { id: the(id) }),
    hint: (id) => fill(J.capitals.hint, { id: CAPITALS[id][0] }),
    stories: (id) => {
      const pair = fill(J.capitals.stories.pair, { id: CAPITALS[id], id2: the(id) });
      return [
        fill(J.capitals.stories[0], { pair }),
        fill(J.capitals.stories[1], { id: the(id), id2: CAPITALS[id] }),
        fill(J.capitals.stories[2], { id: CAPITALS[id], id2: the(id) }),
        fill(J.capitals.stories[3], { pair, id: partOf(id) }),
        fill(J.capitals.stories[4], { id: cap(the(id)), id2: CAPITALS[id] }),
        fill(J.capitals.stories[5], { pair }),
        fill(J.capitals.stories[6], { id: CAPITALS[id], id2: partOf(id) }),
        fill(J.capitals.stories[7], { pair }),
        fill(J.capitals.stories[8], { id: the(id), id2: CAPITALS[id] }),
        fill(J.capitals.stories[9], { pair }),
      ];
    },
    countryAsk: (id) => fill(J.capitals.countryAsk, { id: CAPITALS[id] }),
    countryHint: (id) => LOOKS[id] ?? fill(J.capitals.countryHint, { id: partOf(id), id2: bare(id)[0] }),
    day: J.capitals.day,
    night: J.capitals.night,
    dayNight: (id) => {
      const now = kyivAt[id];
      return { ask: fill(J.capitals.dayNight.ask, { now, id: DAY_NIGHT[id][0] }), caption: fill(J.capitals.dayNight.caption, { now }), why: DAY_NIGHT[id][1] };
    },
    dayNightHint: J.capitals.dayNightHint,
    clock: (id, hour) => {
      const t = shiftOf[id];
      const city = CITIES[id];
      const by = Math.abs(t.shift);
      const side = t.shift > 0 ? J.capitals.clock.side[1] : J.capitals.clock.side[2];
      const rule = t.shift === 0 ? fill(J.capitals.clock.rule[1], { city }) : fill(J.capitals.clock.rule[2], { t: 'winter' in t ? J.capitals.clock.rule[3] : J.capitals.clock.rule[4], by: hours(by), side, city });
      return {
        ask: fill(J.capitals.clock.ask, { hour, rule, city }),
        caption: fill(J.capitals.clock.caption, { hour }),
        hint:
          t.shift === 0
            ? J.capitals.clock.hint[1]
            : fill(J.capitals.clock.hint[2], { by: cap(hours(by)), side, hour, t: t.shift > 0 ? J.capitals.clock.hint[3] : J.capitals.clock.hint[4], by2: by }),
        yes: fill(J.capitals.clock.yes, { hour, hour2: hour + t.shift, city }),
      };
    },
    hourSay: (hour) => `${hour}:00`,
  },
};
