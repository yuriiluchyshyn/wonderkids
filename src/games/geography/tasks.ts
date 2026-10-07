import { Mechanics } from '@/core/game/kernel/mechanics';
import { accusative } from '@/core/lang/uk';
import type { TaskInstance } from '@/core/game/kernel/types';
import type { TemplatePayload } from '@/core/game/templates/types';
import { OCEANS, regionName } from '@/core/game/templates/worldMap';
import { shuffle } from '@/core/utils/random';
import { card, templateTask, unlocked, withDistractors, type GameTasks } from '../shared/templateModule';
import { COUNTRIES, MAP_COUNTRIES, type Country } from './content/countries';
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
  type BiomeAnimal,
  type OceanPart,
} from './content/data';
import { ANIMAL_FACTS } from './content/animalFacts';
import { DAY_NIGHT_FACTS, LANDMARK_FACTS, OCEAN_POOLS } from './content/facts';
import { RECALL_WINDOW, composeLevel } from '@/core/game/engine/recall';
import { taskKey } from '@/core/game/engine/LevelEngine';
import { factPool } from '../shared/facts';

type Tasks = TaskInstance<TemplatePayload>[];
const byId = <T extends { id: string }>(a: T, b: T) => a.id === b.id;

/** New flags introduced on each path step — the "new" half of a level. */
const FLAGS_PER_STEP = 5;

/** Ten ways to confirm a flag, so a familiar one is not always met the same way. */
function flagStories(country: Country): string[] {
  const n = country.name;
  return factPool(
    `Так, це прапор країни ${n}!`,
    country.look,
    `Саме так! ${n} — це країна в ${country.continentName}.`,
    `Чудово! Ти знаєш прапор країни ${n}.`,
    `Молодець! Це ${n}.`,
    `Влучно! Прапор країни ${n} ти вже не забудеш.`,
    `Чудова пам’ять! Це прапор країни ${n}.`,
    `Так тримати! Це ${n}. Шукай цю країну на карті в ${country.continentName}.`,
    `Є! Це прапор країни ${n}.`,
    `Точно! ${n}. Запам’ятай кольори цього прапора.`,
    `Так! Якщо побачиш цей прапор на змаганнях — це ${n}.`,
  );
}
/** Path length that walks through every country once. */
export const FLAG_STEPS = Math.ceil(COUNTRIES.length / FLAGS_PER_STEP);

function flagTask(country: Country, known: readonly Country[], step: number): TaskInstance<TemplatePayload> {
  return templateTask(
    `flag:${country.id}`,
    `Знайди прапор ${country.of}.`,
    {
      template: Mechanics.GridChoice,
      cols: 3,
      options: withDistractors(country, known, 6, byId).map((c) => card(c.id, c.flag, undefined, c.name)),
      correctId: country.id,
      hint: country.look ?? `${country.name} — це країна в ${country.continentName}. Придивись до кольорів і малюнка на прапорах.`,
    },
    step,
    flagStories(country),
  );
}

/** Every flag met up to and including this step. */
const flagsKnownAt = (step: number) => COUNTRIES.slice(0, Math.max(12, step * FLAGS_PER_STEP));

/**
 * Game 7 — «Вгадай Прапор». The path walks down the familiarity ranking: each
 * step brings five new, slightly less famous flags and recalls five met on
 * the previous `RECALL_WINDOW` steps (older ones only when those run out).
 */
function flagsLevel(step: number, count: number): Tasks {
  const start = (step - 1) * FLAGS_PER_STEP;
  const windowStart = Math.max(0, start - RECALL_WINDOW * FLAGS_PER_STEP);
  const known = flagsKnownAt(step);
  const tasks = (list: readonly Country[]) => shuffle(list).map((country) => flagTask(country, known, step));
  return composeLevel(
    tasks(COUNTRIES.slice(start, start + FLAGS_PER_STEP)),
    [...tasks(COUNTRIES.slice(windowStart, start)), ...tasks(COUNTRIES.slice(0, windowStart))],
    count,
    taskKey,
  );
}

function flags(step: number): Tasks {
  const known = flagsKnownAt(step);
  return known.map((country) => flagTask(country, known, step));
}

/** Game 8 — «Склади Карту»: drag a flag or an animal onto its continent. */
function continents(step: number): Tasks {
  const animals: Tasks = CONTINENT_ANIMALS.map((a) =>
    templateTask(
      `home:${a.id}`,
      `Де живе ${a.name}? Перетягни на карту.`,
      {
        template: Mechanics.MapPuzzle,
        layer: 'continents',
        mode: 'drag',
        marker: card(a.id, a.emoji),
        targetId: a.home,
        hint: `Шукай материк, який блимає. ${a.name[0].toUpperCase()}${a.name.slice(1)} живе на материку ${regionName(a.home)}.`,
      },
      step,
      // Ten facts about this very animal — not about its continent.
      ANIMAL_FACTS[a.id],
    ),
  );
  // Countries join once the animals are familiar — the best-known ones first.
  const countries: Tasks = unlocked(MAP_COUNTRIES.slice(0, 60), step, 12, 0).map((c) =>
    templateTask(
      `where:${c.id}`,
      `На якому материку ${c.name}? Перетягни прапор.`,
      {
        template: Mechanics.MapPuzzle,
        layer: 'continents',
        mode: 'drag',
        marker: card(c.id, c.flag),
        targetId: c.continent,
        hint: `Шукай материк ${regionName(c.continent)} — він блимає.`,
      },
      step,
      [`Так! ${c.name} — це країна в ${c.continentName}.`, `Саме так: ${c.name} — на материку ${regionName(c.continent)}.`],
    ),
  );
  return step <= 3 ? animals : [...animals, ...countries];
}

const cap = (text: string) => `${text[0].toUpperCase()}${text.slice(1)}`;

/** Path lengths of the three games below — also what their unlocking is paced by. */
export const BIOME_STEPS = 10;
export const OCEAN_STEPS = 8;
export const CAPITAL_STEPS = 15;

/** Animals met up to this step: the first twelve open the game, three more a step. */
const animalsAt = (step: number) => unlocked(BIOME_ANIMALS, step, BIOME_STEPS, 12);
/** Zones that already have a dweller the child knows. */
const biomesFor = (animals: readonly BiomeAnimal[]) => BIOMES.filter((b) => animals.some((a) => a.home === b.id));

/**
 * Game 9 — «Тварини та Природні Зони». The path adds animals and zones (the
 * savanna, the forest, the mountains) and, one at a time, new kinds of question:
 *   1  where does this animal live                 UI_SORTER_BINS
 *   3  who lives in this zone                      UI_GRID_CHOICE
 *   5  which zone is this (by its description)     UI_GRID_CHOICE
 *   7  the same, by a second, harder description
 */
function biomes(step: number): Tasks {
  const animals = animalsAt(step);
  const zones = biomesFor(animals);
  const wrongSay = Object.fromEntries(BIOMES.map((b) => [b.id, b.no]));
  const zoneOf = (a: BiomeAnimal) => BIOMES.find((b) => b.id === a.home) as Biome;
  const zoneCard = (b: Biome) => card(b.id, b.emoji, b.name);
  /** The right zone plus up to three wrong ones, always in the same order. */
  const zoneChoices = (right: Biome, wrong: readonly Biome[]) => {
    const picked = new Set([right.id, ...shuffle(wrong).slice(0, 3).map((b) => b.id)]);
    return BIOMES.filter((b) => picked.has(b.id)).map(zoneCard);
  };

  const whereLives: Tasks = animals.map((a) =>
    templateTask(
      `biome:${a.id}`,
      `Де живе ${a.name}?`,
      {
        template: Mechanics.SorterBins,
        item: card(a.id, a.emoji),
        bins: zoneChoices(zoneOf(a), zones.filter((b) => b.id !== a.home && !a.also?.includes(b.id))),
        correctBinId: a.home,
        wrongSay,
        hint: `Подумай, де тваринці буде добре. ${a.fact}`,
      },
      step,
      ANIMAL_FACTS[a.id],
    ),
  );

  // Asked about animals the child has already placed (met two steps ago).
  const familiar = step >= 3 ? animalsAt(step - 2) : [];
  const whoLives: Tasks = familiar.map((a) => {
    const zone = zoneOf(a);
    // Never a second animal that could live there too.
    const others = shuffle(animals.filter((o) => o.home !== zone.id && !o.also?.includes(zone.id))).slice(0, 3);
    return templateTask(
      `biome:who:${a.id}`,
      `Хто живе ${zone.where}?`,
      {
        template: Mechanics.GridChoice,
        cols: 2,
        stimulus: { emoji: zone.emoji, caption: zone.name },
        options: shuffle([a, ...others]).map((o) => card(o.id, o.emoji, cap(o.name))),
        correctId: a.id,
        hint: `Згадай, яка це природна зона. ${zone.signs[0]}`,
      },
      step,
      ANIMAL_FACTS[a.id],
    );
  });

  const signsKnown = step >= 7 ? 2 : step >= 5 ? 1 : 0;
  const whichZone: Tasks = zones.flatMap((zone) =>
    zone.signs.slice(0, signsKnown).map((sign, i) => {
      const dwellers = animals.filter((a) => a.home === zone.id).slice(0, 3);
      return templateTask(
        `biome:zone:${zone.id}:${i}`,
        `Яка це природна зона? ${sign}`,
        {
          template: Mechanics.GridChoice,
          cols: 2,
          options: zoneChoices(zone, zones.filter((b) => b.id !== zone.id)),
          correctId: zone.id,
          hint: `Тут живуть: ${dwellers.map((a) => a.name).join(', ')}.`,
        },
        step,
        factPool(`Так, це ${zone.name.toLowerCase()}! ${sign}`, BIOME_FACTS[zone.id]),
      );
    }),
  );

  return [...whereLives, ...whoLives, ...whichZone];
}

/** «Пливи до …» needs the ocean's name in the genitive. */
const OCEAN_TO: Record<string, string> = {
  pacific: 'Тихого океану',
  atlantic: 'Атлантичного океану',
  indian: 'Індійського океану',
  arctic: 'Північного Льодовитого океану',
  southern: 'Південного океану',
};

/**
 * Game 10 — «Моря та Океани Світу»: sail the ship to the right ocean. The
 * question gets harder along the path, the map stays the same:
 *   1  the ocean by its name, and by an easy riddle («до найбільшого океану»)
 *   2  a second riddle about each ocean
 *   3  a third one
 *   4–6  seas: which ocean is this sea a part of
 *   7–8  famous places: in which ocean is it
 */
function oceans(step: number): Tasks {
  const sail = (key: string, prompt: string, oceanId: string, facts: string[], clue?: string) =>
    templateTask(
      key,
      prompt,
      {
        template: Mechanics.MapPuzzle,
        layer: 'oceans',
        mode: 'tap',
        marker: card('ship', '⛵'),
        targetId: oceanId,
        hint: `Шукай воду, що переливається хвилями. ${clue ?? OCEAN_FACTS[oceanId]}`,
      },
      step,
      facts,
    );

  const tasks: Tasks = OCEANS.map((o) => sail(`ocean:${o.id}`, `Пливи до ${OCEAN_TO[o.id]}!`, o.id, OCEAN_POOLS[o.id]));

  for (const o of OCEANS) {
    OCEAN_RIDDLES[o.id].slice(0, Math.min(3, step)).forEach((riddle, i) => {
      tasks.push(
        sail(
          `ocean:riddle:${o.id}:${i}`,
          `Пливи до ${riddle}!`,
          o.id,
          factPool(`Так, це ${o.name}!`, OCEAN_POOLS[o.id]),
          `Це ${o.name}.`,
        ),
      );
    });
  }

  // Six seas a step from step 4, then six places a step from step 7.
  const part = (kind: string, prompt: (p: OceanPart) => string) => (p: OceanPart) =>
    sail(`ocean:${kind}:${p.id}`, prompt(p), p.ocean, factPool(p.fact, OCEAN_POOLS[p.ocean]), p.fact);
  if (step >= 4) {
    tasks.push(...SEAS.slice(0, (step - 3) * 6).map(part('sea', (p) => `${cap(p.name)} — частина якого океану? Пливи туди!`)));
  }
  if (step >= 7) {
    tasks.push(...OCEAN_PLACES.slice(0, (step - 6) * 6).map(part('place', (p) => `У якому океані ${p.name}? Пливи туди!`)));
  }
  return tasks;
}

/** A country and its capital. */
interface Capital extends Country {
  capital: string;
}

/** Countries with a capital we ask about, best-known country first. */
export const CAPITALS: Capital[] = COUNTRIES.flatMap((c) => (CAPITAL_OF[c.id] ? [{ ...c, capital: CAPITAL_OF[c.id] }] : []));

/** Ten ways to confirm a capital, so a familiar one is not always met the same way. */
function capitalStories(c: Capital): string[] {
  const pair = `${c.capital} — столиця країни ${c.name}`;
  return factPool(
    `Так! ${pair}.`,
    `Саме так! Столиця країни ${c.name} — ${c.capital}.`,
    `Чудово! ${c.capital} — найголовніше місто країни ${c.name}.`,
    `Молодець! ${pair}. Це в ${c.continentName}.`,
    `Влучно! ${c.name} і ${c.capital} — запам’ятай цю пару.`,
    `Чудова пам’ять! ${pair}.`,
    `Так тримати! Шукай місто ${c.capital} на карті в ${c.continentName}.`,
    `Є! ${pair}.`,
    `Точно! Якщо поїдеш у країну ${c.name}, побачиш її столицю — ${c.capital}.`,
    `Правильно! ${pair}. Тепер ти це знаєш.`,
  );
}

/** «на 1 годину», «на 2 години», «на 7 годин». */
const hoursWord = (n: number) => (n === 1 ? 'годину' : n >= 2 && n <= 4 ? 'години' : 'годин');

/**
 * Game 11 — «Столиці та Часові Пояси». The path adds, one at a time:
 *   1  a landmark → its capital; a country → its capital (more every step)
 *   3  a capital → its country (by flag)
 *   5  day or night in another city
 *   9  what time is it there (the clock difference with Kyiv)
 */
function capitals(step: number): Tasks {
  const landmarks = unlocked(LANDMARKS, step, CAPITAL_STEPS, 6);
  const landmarkTasks: Tasks = landmarks.map((l) =>
    templateTask(
      `capital:${l.id}`,
      `У якій столиці можна побачити ${accusative(l.landmark)}?`,
      {
        template: Mechanics.GridChoice,
        cols: 2,
        stimulus: { emoji: l.emoji, art: l.id, caption: l.landmark },
        options: withDistractors(l, landmarks, 4, byId).map((o) => card(o.id, undefined, o.capital)),
        correctId: l.id,
        hint: `${l.landmark} — символ ${l.country}. Згадай столицю цієї країни.`,
      },
      step,
      LANDMARK_FACTS[l.id],
    ),
  );

  const known = unlocked(CAPITALS, step, CAPITAL_STEPS, 8);
  const capitalOf: Tasks = known.map((c) =>
    templateTask(
      `capital:of:${c.id}`,
      `Яка столиця ${c.of}?`,
      {
        template: Mechanics.GridChoice,
        cols: 2,
        stimulus: { emoji: c.flag, caption: c.name },
        options: withDistractors(c, known, 4, byId).map((o) => card(o.id, undefined, o.capital)),
        correctId: c.id,
        hint: `Назва цієї столиці починається на літеру «${c.capital[0]}».`,
      },
      step,
      capitalStories(c),
    ),
  );

  // The reverse question, about capitals met two steps ago.
  const familiar = step >= 3 ? unlocked(CAPITALS, step - 2, CAPITAL_STEPS, 8) : [];
  const countryOf: Tasks = familiar.map((c) =>
    templateTask(
      `capital:where:${c.id}`,
      `${c.capital} — столиця якої країни?`,
      {
        template: Mechanics.GridChoice,
        cols: 2,
        options: withDistractors(c, known, 4, byId).map((o) => card(o.id, o.flag, o.name)),
        correctId: c.id,
        hint: c.look ?? `Ця країна — в ${c.continentName}. Її назва починається на літеру «${c.name[0]}».`,
      },
      step,
      capitalStories(c),
    ),
  );

  const dayNight: Tasks = (step >= 5 ? DAY_NIGHT : []).map((q) =>
    templateTask(
      `time:${q.id}`,
      `У Києві зараз ${q.kyiv === 'day' ? 'день' : 'ніч'}. А що у ${q.city}?`,
      {
        template: Mechanics.GridChoice,
        cols: 2,
        stimulus: { emoji: q.kyiv === 'day' ? '🌍☀️' : '🌍🌙', caption: `Київ: ${q.kyiv === 'day' ? 'день' : 'ніч'}` },
        options: shuffle([card('day', '☀️', 'День'), card('night', '🌙', 'Ніч')]),
        correctId: q.answer,
        hint: 'Земля крутиться, як дзиґа. Сонце світить тільки на один її бік: там день, а на іншому боці — ніч.',
      },
      step,
      factPool(q.why, DAY_NIGHT_FACTS),
    ),
  );

  // Clock sums: four cities at step 9, two more every step.
  const shifts = step >= 9 ? TIME_SHIFTS.slice(0, 4 + (step - 9) * 2) : [];
  const clock: Tasks = shifts.flatMap((t) =>
    t.kyiv.map((hour) => {
      const there = hour + t.shift;
      const by = Math.abs(t.shift);
      const rule =
        t.shift === 0
          ? `У ${t.city} час такий самий, як у нас`
          : `${'winter' in t ? 'Узимку у' : 'У'} ${t.city} на ${by} ${hoursWord(by)} ${t.shift > 0 ? 'більше' : 'менше'}, ніж у Києві`;
      // The right hour, Kyiv's own, the shift taken the wrong way, and near misses.
      const hours = [...new Set([there, hour, hour - t.shift, there + 1, there - 1, there + 2])].filter((h) => h >= 0 && h <= 23);
      const offered = shuffle([there, ...shuffle(hours.filter((h) => h !== there)).slice(0, 3)]);
      return templateTask(
        `time:clock:${t.id}:${hour}`,
        `У Києві ${hour}:00. ${rule}. Котра година у ${t.city}?`,
        {
          template: Mechanics.GridChoice,
          cols: 2,
          stimulus: { emoji: '🕰️', caption: `Київ — ${hour}:00` },
          options: offered.map((h) => ({ id: String(h), glyphs: [`${h}:00`], speak: `${h} година` })),
          correctId: String(there),
          hint:
            t.shift === 0
              ? 'Це місто в тому самому часовому поясі, що й Київ, — годинники показують однаково.'
              : `«На ${by} ${hoursWord(by)} ${t.shift > 0 ? 'більше' : 'менше'}» — це ${hour} ${t.shift > 0 ? 'плюс' : 'мінус'} ${by}.`,
        },
        step,
        factPool(`Так! Коли в Києві ${hour}:00, у ${t.city} — ${there}:00.`, DAY_NIGHT_FACTS),
      );
    }),
  );

  return [...landmarkTasks, ...capitalOf, ...countryOf, ...dayNight, ...clock];
}

/** Task generators of every game, by game id (the cards are in `config.ts`). */
export const TASKS: Record<string, GameTasks> = {
  flags: { pool: flags, level: flagsLevel },
  continents: { pool: continents },
  biomes: { pool: biomes },
  oceans: { pool: oceans },
  capitals: { pool: capitals },
};
