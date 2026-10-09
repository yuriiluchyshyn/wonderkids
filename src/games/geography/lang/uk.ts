import { regionName } from '@/core/game/templates/worldMap';
import { accusative } from '@/core/lang/uk';
import { ANIMAL_FACTS } from '../content/animalFacts';
import { COUNTRIES, type Country } from '../content/countries';
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
} from '../content/data';
import { LANDMARK_FACTS, OCEAN_POOLS } from '../content/facts';
import { ANIMAL_CLUES, MORE_ANIMAL_FACTS, MORE_BIOME_ANIMALS, MORE_SIGNS } from '../content/moreAnimals';
import { MORE_OCEAN_PLACES, MORE_OCEAN_RIDDLES, MORE_SEAS, RIDDLE_FACTS, RIVERS } from '../content/moreOceans';
import type { GeographyTexts } from './types';

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

const OCEAN_TO: Record<string, string> = {
  pacific: 'Тихого океану',
  atlantic: 'Атлантичного океану',
  indian: 'Індійського океану',
  arctic: 'Північного Льодовитого океану',
  southern: 'Південного океану',
};

const hoursWord = (n: number) => (n === 1 ? 'годину' : n >= 2 && n <= 4 ? 'години' : 'годин');
const capitalOf = (id: string) => CAPITAL_OF[id];

export const uk: GeographyTexts = {
  country: (id) => country(id).name,
  region: regionName,
  flags: {
    ask: (id) => `Знайди прапор ${country(id).of}.`,
    hint: (id) => country(id).look ?? `${country(id).name} — це країна в ${country(id).continentName}. Придивись до кольорів і малюнка на прапорах.`,
    stories: (id) => {
      const c = country(id);
      const n = c.name;
      return [
        `Так, це прапор країни ${n}!`,
        c.look,
        `Саме так! ${n} — це країна в ${c.continentName}.`,
        `Чудово! Ти знаєш прапор країни ${n}.`,
        `Молодець! Це ${n}.`,
        `Влучно! Прапор країни ${n} ти вже не забудеш.`,
        `Чудова пам’ять! Це прапор країни ${n}.`,
        `Так тримати! Це ${n}. Шукай цю країну на карті в ${c.continentName}.`,
        `Є! Це прапор країни ${n}.`,
        `Точно! ${n}. Запам’ятай кольори цього прапора.`,
        `Так! Якщо побачиш цей прапор на змаганнях — це ${n}.`,
      ];
    },
  },
  map: {
    animalAsk: (id) => `Де живе ${mapAnimal(id).name}? Перетягни на карту.`,
    animalHint: (id) => `Шукай материк, який блимає. ${cap(mapAnimal(id).name)} живе на материку ${regionName(mapAnimal(id).home)}.`,
    animalFacts: (id) => ANIMAL_FACTS[id],
    countryAsk: (id) => `На якому материку ${country(id).name}? Перетягни прапор.`,
    countryHint: (id) => `Шукай материк ${regionName(country(id).continent)} — він блимає.`,
    countryYes: (id) => [
      `Так! ${country(id).name} — це країна в ${country(id).continentName}.`,
      `Саме так: ${country(id).name} — на материку ${regionName(country(id).continent)}.`,
    ],
  },
  zone: (id) => ({ name: zone(id).name, no: zone(id).no, signs: signs(id), facts: BIOME_FACTS[id] }),
  animal: (id) => {
    const a = zoneAnimal(id);
    return { name: a.name, clue: ANIMAL_CLUES[id], fact: a.fact, facts: ANIMAL_FACTS[id] ?? MORE_ANIMAL_FACTS[id] ?? [a.fact] };
  },
  zones: {
    whereAsk: (id) => `Де живе ${zoneAnimal(id).name}?`,
    whereHint: (id) => `Подумай, де тваринці буде добре. ${zoneAnimal(id).fact}`,
    whoAsk: (id) => `Хто живе ${zone(id).where}?`,
    whoHint: (id) => `Згадай, яка це природна зона. ${zone(id).signs[0]}`,
    riddleAsk: (id) => `Хто це? ${ANIMAL_CLUES[id]}`,
    riddleHint: (id, home) => `Ця тварина живе ${zone(home).where}. Її назва починається на літеру «${zoneAnimal(id).name[0].toUpperCase()}».`,
    oddAsk: 'Хто тут зайвий? Усі інші — сусіди: вони живуть в одній природній зоні.',
    oddHint: (id) => `Усі сусіди живуть ${zone(id).where}. Знайди того, хто живе деінде.`,
    zoneAsk: (id, i) => `Яка це природна зона? ${signs(id)[i]}`,
    zoneHint: (id, dwellers) => (dwellers.length > 0 ? `Тут живуть: ${dwellers.map((a) => zoneAnimal(a).name).join(', ')}.` : zone(id).signs[0]),
    zoneYes: (id, i) => `Так, це ${zone(id).name.toLowerCase()}! ${signs(id)[i]}`,
  },
  ocean: (id) => ({ fact: OCEAN_FACTS[id], pool: OCEAN_POOLS[id], riddles: riddles(id), riddleFacts: RIDDLE_FACTS[id] }),
  seas: {
    sailTo: (id) => `Пливи до ${OCEAN_TO[id]}!`,
    riddleAsk: (id, i) => `Пливи до ${riddles(id)[i]}!`,
    hint: (clue) => `Шукай воду, що переливається хвилями. ${clue}`,
    itIs: (id) => `Це ${regionName(id)}.`,
    sea: (id) => ({ ask: `${cap(sea(id).name)} — частина якого океану? Пливи туди!`, fact: sea(id).fact }),
    place: (id) => ({ ask: `У якому океані ${place(id).name}? Пливи туди!`, fact: place(id).fact }),
    river: (id) => ({ ask: `У який океан несе свої води річка ${river(id).name}? Пливи туди!`, fact: river(id).fact }),
    shoreAsk: (id) => `Який океан омиває береги ${country(id).of}? Пливи туди!`,
    shoreYes: (id, ocean) => `Так! Береги ${country(id).of} омиває ${regionName(ocean)}.`,
  },
  capitals: {
    landmark: (id) => {
      const l = landmark(id);
      return {
        name: l.landmark,
        capital: l.capital,
        ask: `У якій столиці можна побачити ${accusative(l.landmark)}?`,
        hint: `${l.landmark} — символ ${l.country}. Згадай столицю цієї країни.`,
        facts: LANDMARK_FACTS[id],
      };
    },
    capital: capitalOf,
    ask: (id) => `Яка столиця ${country(id).of}?`,
    hint: (id) => `Назва цієї столиці починається на літеру «${capitalOf(id)[0]}».`,
    stories: (id) => {
      const c = country(id);
      const capital = capitalOf(id);
      const pair = `${capital} — столиця країни ${c.name}`;
      return [
        `Так! ${pair}.`,
        `Саме так! Столиця країни ${c.name} — ${capital}.`,
        `Чудово! ${capital} — найголовніше місто країни ${c.name}.`,
        `Молодець! ${pair}. Це в ${c.continentName}.`,
        `Влучно! ${c.name} і ${capital} — запам’ятай цю пару.`,
        `Чудова пам’ять! ${pair}.`,
        `Так тримати! Шукай місто ${capital} на карті в ${c.continentName}.`,
        `Є! ${pair}.`,
        `Точно! Якщо поїдеш у країну ${c.name}, побачиш її столицю — ${capital}.`,
        `Правильно! ${pair}. Тепер ти це знаєш.`,
      ];
    },
    countryAsk: (id) => `${capitalOf(id)} — столиця якої країни?`,
    countryHint: (id) => country(id).look ?? `Ця країна — в ${country(id).continentName}. Її назва починається на літеру «${country(id).name[0]}».`,
    day: 'День',
    night: 'Ніч',
    dayNight: (id) => {
      const q = dayNight(id);
      const now = q.kyiv === 'day' ? 'день' : 'ніч';
      return { ask: `У Києві зараз ${now}. А що у ${q.city}?`, caption: `Київ: ${now}`, why: q.why };
    },
    dayNightHint: 'Земля крутиться, як дзиґа. Сонце світить тільки на один її бік: там день, а на іншому боці — ніч.',
    clock: (id, hour) => {
      const t = shift(id);
      const there = hour + t.shift;
      const by = Math.abs(t.shift);
      const rule =
        t.shift === 0
          ? `У ${t.city} час такий самий, як у нас`
          : `${'winter' in t ? 'Узимку у' : 'У'} ${t.city} на ${by} ${hoursWord(by)} ${t.shift > 0 ? 'більше' : 'менше'}, ніж у Києві`;
      return {
        ask: `У Києві ${hour}:00. ${rule}. Котра година у ${t.city}?`,
        caption: `Київ — ${hour}:00`,
        hint:
          t.shift === 0
            ? 'Це місто в тому самому часовому поясі, що й Київ, — годинники показують однаково.'
            : `«На ${by} ${hoursWord(by)} ${t.shift > 0 ? 'більше' : 'менше'}» — це ${hour} ${t.shift > 0 ? 'плюс' : 'мінус'} ${by}.`,
        yes: `Так! Коли в Києві ${hour}:00, у ${t.city} — ${there}:00.`,
      };
    },
    hourSay: (hour) => `${hour} година`,
  },
};
