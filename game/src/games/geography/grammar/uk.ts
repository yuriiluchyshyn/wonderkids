import { regionName } from '@/core/game/templates/worldMap';
import { accusative } from '@/core/language/uk';
import { ANIMAL_FACTS } from '@/games/geography/content/animalFacts';
import { COUNTRIES, type Country } from '@/games/geography/content/countries';
import {
  BIOMES,
  BIOME_ANIMALS,
  BIOME_FACTS,
  CAPITAL_OF,
  CONTINENT_ANIMALS,
  DAY_NIGHT,
  LANDMARKS,
  OCEAN_FACTS,
  OCEAN_PLACES,
  OCEAN_RIDDLES,
  SEAS,
  TIME_SHIFTS,
  type Biome,
  type BiomeId,
} from '@/games/geography/content/data';
import { LANDMARK_FACTS, OCEAN_POOLS } from '@/games/geography/content/facts';
import { ANIMAL_CLUES, MORE_ANIMAL_FACTS, MORE_BIOME_ANIMALS, MORE_SIGNS } from '@/games/geography/content/moreAnimals';
import { MORE_OCEAN_PLACES, MORE_OCEAN_RIDDLES, MORE_SEAS, RIDDLE_FACTS, RIVERS } from '@/games/geography/content/moreOceans';
import type { GeographyTexts } from '@/games/geography/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/uk/games/geography.json';

/** The Geography galaxy in Ukrainian: the words of `content/`, put into sentences. */

const byId = <T extends { id: string }>(list: readonly T[]) => {
  const map = new Map(list.map((item) => [item.id, item]));
  return (id: string) => map.get(id) as T;
};
const cap = (text: string) => `${text[0].toUpperCase()}${text.slice(1)}`;

const country = byId<Country>(COUNTRIES);
const mapAnimal = byId(CONTINENT_ANIMALS);
const zoneAnimal = byId([...BIOME_ANIMALS, ...MORE_BIOME_ANIMALS]);
const zone = byId<Biome>(BIOMES);
const sea = byId([...SEAS, ...MORE_SEAS]);
const place = byId([...OCEAN_PLACES, ...MORE_OCEAN_PLACES]);
const river = byId(RIVERS);
const landmark = byId(LANDMARKS);
const dayNight = byId(DAY_NIGHT);
const shift = byId(TIME_SHIFTS);

const signs = (id: BiomeId) => [...zone(id).signs, ...MORE_SIGNS[id]];
const riddles = (id: string) => [...OCEAN_RIDDLES[id], ...MORE_OCEAN_RIDDLES[id]];

const OCEAN_TO: Record<string, string> = J.OCEAN_TO;

const hoursWord = (n: number) => (n === 1 ? J.hoursWord[1] : n >= 2 && n <= 4 ? J.hoursWord[2] : J.hoursWord[3]);
const capitalOf = (id: string) => CAPITAL_OF[id];

export const uk: GeographyTexts = {
  country: (id) => country(id).name,
  region: regionName,
  flags: {
    ask: (id) => fill(J.flags.ask, { of: country(id).of }),
    hint: (id) => country(id).look ?? fill(J.flags.hint, { name: country(id).name, continentName: country(id).continentName }),
    stories: (id) => {
      const c = country(id);
      const n = c.name;
      return [
        fill(J.flags.stories[0], { n }),
        c.look,
        fill(J.flags.stories[2], { n, continentName: c.continentName }),
        fill(J.flags.stories[3], { n }),
        fill(J.flags.stories[4], { n }),
        fill(J.flags.stories[5], { n }),
        fill(J.flags.stories[6], { n }),
        fill(J.flags.stories[7], { n, continentName: c.continentName }),
        fill(J.flags.stories[8], { n }),
        fill(J.flags.stories[9], { n }),
        fill(J.flags.stories[10], { n }),
      ];
    },
  },
  map: {
    animalAsk: (id) => fill(J.map.animalAsk, { name: mapAnimal(id).name }),
    animalHint: (id) => fill(J.map.animalHint, { id: cap(mapAnimal(id).name), id2: regionName(mapAnimal(id).home) }),
    animalFacts: (id) => ANIMAL_FACTS[id],
    countryAsk: (id) => fill(J.map.countryAsk, { name: country(id).name }),
    countryHint: (id) => fill(J.map.countryHint, { id: regionName(country(id).continent) }),
    countryYes: (id) => [
      fill(J.map.countryYes[0], { name: country(id).name, continentName: country(id).continentName }),
      fill(J.map.countryYes[1], { name: country(id).name, id: regionName(country(id).continent) }),
    ],
  },
  zone: (id) => ({ name: zone(id).name, no: zone(id).no, signs: signs(id), facts: BIOME_FACTS[id] }),
  animal: (id) => {
    const a = zoneAnimal(id);
    return { name: a.name, clue: ANIMAL_CLUES[id], fact: a.fact, facts: ANIMAL_FACTS[id] ?? MORE_ANIMAL_FACTS[id] ?? [a.fact] };
  },
  zones: {
    whereAsk: (id) => fill(J.zones.whereAsk, { name: zoneAnimal(id).name }),
    whereHint: (id) => fill(J.zones.whereHint, { fact: zoneAnimal(id).fact }),
    whoAsk: (id) => fill(J.zones.whoAsk, { where: zone(id).where }),
    whoHint: (id) => fill(J.zones.whoHint, { id: zone(id).signs[0] }),
    riddleAsk: (id) => fill(J.zones.riddleAsk, { id: ANIMAL_CLUES[id] }),
    riddleHint: (id, home) => fill(J.zones.riddleHint, { where: zone(home).where, id: zoneAnimal(id).name[0].toUpperCase() }),
    oddAsk: J.zones.oddAsk,
    oddHint: (id) => fill(J.zones.oddHint, { where: zone(id).where }),
    zoneAsk: (id, i) => fill(J.zones.zoneAsk, { id: signs(id)[i] }),
    zoneHint: (id, dwellers) => (dwellers.length > 0 ? fill(J.zones.zoneHint, { dwellers: dwellers.map((a) => zoneAnimal(a).name).join(', ') }) : zone(id).signs[0]),
    zoneYes: (id, i) => fill(J.zones.zoneYes, { id: zone(id).name.toLowerCase(), id2: signs(id)[i] }),
  },
  ocean: (id) => ({ fact: OCEAN_FACTS[id], pool: OCEAN_POOLS[id], riddles: riddles(id), riddleFacts: RIDDLE_FACTS[id] }),
  seas: {
    sailTo: (id) => fill(J.seas.sailTo, { id: OCEAN_TO[id] }),
    riddleAsk: (id, i) => fill(J.seas.riddleAsk, { id: riddles(id)[i] }),
    hint: (clue) => fill(J.seas.hint, { clue }),
    itIs: (id) => fill(J.seas.itIs, { id: regionName(id) }),
    sea: (id) => ({ ask: fill(J.seas.sea.ask, { id: cap(sea(id).name) }), fact: sea(id).fact }),
    place: (id) => ({ ask: fill(J.seas.place.ask, { name: place(id).name }), fact: place(id).fact }),
    river: (id) => ({ ask: fill(J.seas.river.ask, { name: river(id).name }), fact: river(id).fact }),
    shoreAsk: (id) => fill(J.seas.shoreAsk, { of: country(id).of }),
    shoreYes: (id, ocean) => fill(J.seas.shoreYes, { of: country(id).of, ocean: regionName(ocean) }),
  },
  capitals: {
    landmark: (id) => {
      const l = landmark(id);
      return {
        name: l.landmark,
        capital: l.capital,
        ask: fill(J.capitals.landmark.ask, { l: accusative(l.landmark) }),
        hint: fill(J.capitals.landmark.hint, { landmark: l.landmark, country: l.country }),
        facts: LANDMARK_FACTS[id],
      };
    },
    capital: capitalOf,
    ask: (id) => fill(J.capitals.ask, { of: country(id).of }),
    hint: (id) => fill(J.capitals.hint, { id: capitalOf(id)[0] }),
    stories: (id) => {
      const c = country(id);
      const capital = capitalOf(id);
      const pair = fill(J.capitals.stories.pair, { capital, name: c.name });
      return [
        fill(J.capitals.stories[0], { pair }),
        fill(J.capitals.stories[1], { name: c.name, capital }),
        fill(J.capitals.stories[2], { capital, name: c.name }),
        fill(J.capitals.stories[3], { pair, continentName: c.continentName }),
        fill(J.capitals.stories[4], { name: c.name, capital }),
        fill(J.capitals.stories[5], { pair }),
        fill(J.capitals.stories[6], { capital, continentName: c.continentName }),
        fill(J.capitals.stories[7], { pair }),
        fill(J.capitals.stories[8], { name: c.name, capital }),
        fill(J.capitals.stories[9], { pair }),
      ];
    },
    countryAsk: (id) => fill(J.capitals.countryAsk, { id: capitalOf(id) }),
    countryHint: (id) => country(id).look ?? fill(J.capitals.countryHint, { continentName: country(id).continentName, id: country(id).name[0] }),
    day: J.capitals.day,
    night: J.capitals.night,
    dayNight: (id) => {
      const q = dayNight(id);
      const now = q.kyiv === 'day' ? J.capitals.dayNight.now[1] : J.capitals.dayNight.now[2];
      return { ask: fill(J.capitals.dayNight.ask, { now, city: q.city }), caption: fill(J.capitals.dayNight.caption, { now }), why: q.why };
    },
    dayNightHint: J.capitals.dayNightHint,
    clock: (id, hour) => {
      const t = shift(id);
      const there = hour + t.shift;
      const by = Math.abs(t.shift);
      const rule =
        t.shift === 0
          ? fill(J.capitals.clock.rule[1], { city: t.city })
          : fill(J.capitals.clock.rule[2], { t: 'winter' in t ? J.capitals.clock.rule[3] : J.capitals.clock.rule[4], city: t.city, by, by2: hoursWord(by), t2: t.shift > 0 ? J.capitals.clock.rule[5] : J.capitals.clock.rule[6] });
      return {
        ask: fill(J.capitals.clock.ask, { hour, rule, city: t.city }),
        caption: fill(J.capitals.clock.caption, { hour }),
        hint:
          t.shift === 0
            ? J.capitals.clock.hint[1]
            : fill(J.capitals.clock.hint[2], { by, by2: hoursWord(by), t: t.shift > 0 ? J.capitals.clock.hint[3] : J.capitals.clock.hint[4], hour, t2: t.shift > 0 ? J.capitals.clock.hint[5] : J.capitals.clock.hint[6] }),
        yes: fill(J.capitals.clock.yes, { hour, city: t.city, there }),
      };
    },
    hourSay: (hour) => fill(J.capitals.hourSay, { hour }),
  },
};
