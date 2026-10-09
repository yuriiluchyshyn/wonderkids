import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import type { TemplatePayload } from '@/core/game/templates/types';
import { OCEANS } from '@/core/game/templates/worldMap';
import { shuffle } from '@/core/utils/random';
import { card, templateTask, unlocked, withDistractors, type GameTasks } from '../shared/templateModule';
import { COUNTRIES, MAP_COUNTRIES, type Country } from './content/countries';
import { BIOMES, BIOME_ANIMALS, CAPITAL_OF, CONTINENT_ANIMALS, DAY_NIGHT, LANDMARKS, OCEAN_PLACES, SEAS, TIME_SHIFTS, type Biome, type BiomeAnimal, type BiomeId, type OceanPart } from './content/data';
import { MORE_OCEAN_PLACES, MORE_SEAS, RIVERS, SHORES } from './content/moreOceans';
import { MORE_BIOME_ANIMALS } from './content/moreAnimals';
import { RECALL_WINDOW, composeLevel } from '@/core/game/engine/recall';
import { taskKey } from '@/core/game/engine/LevelEngine';
import { factPool } from '../shared/facts';
import { geographyTexts } from './lang';
import type { GeographyTexts } from './lang/types';

type Config = Pick<TaskConfig, 'lang'>;
type Tasks = TaskInstance<TemplatePayload>[];
const byId = <T extends { id: string }>(a: T, b: T) => a.id === b.id;

/** New flags introduced on each path step — the "new" half of a level. */
const FLAGS_PER_STEP = 5;

/** Ten ways to confirm a flag, so a familiar one is not always met the same way. */
export const FLAG_STEPS = Math.ceil(COUNTRIES.length / FLAGS_PER_STEP);

function flagTask(country: Country, known: readonly Country[], step: number, T: GeographyTexts): TaskInstance<TemplatePayload> {
  return templateTask(
    `flag:${country.id}`,
    T.flags.ask(country.id),
    {
      template: Mechanics.GridChoice,
      cols: 3,
      options: withDistractors(country, known, 6, byId).map((c) => card(c.id, c.flag, undefined, T.country(c.id))),
      correctId: country.id,
      hint: T.flags.hint(country.id),
    },
    step,
    factPool(...T.flags.stories(country.id)),
  );
}

/** By the last step every flag is in play; the first steps still offer a full board. */
const flagsKnownAt = (step: number) => COUNTRIES.slice(0, Math.max(12, step * FLAGS_PER_STEP));

function flagsLevel(step: number, count: number, config: Config): Tasks {
  const T = geographyTexts(config.lang);
  const start = (step - 1) * FLAGS_PER_STEP;
  const windowStart = Math.max(0, start - RECALL_WINDOW * FLAGS_PER_STEP);
  const known = flagsKnownAt(step);
  const tasks = (list: readonly Country[]) => shuffle(list).map((country) => flagTask(country, known, step, T));
  return composeLevel(
    tasks(COUNTRIES.slice(start, start + FLAGS_PER_STEP)),
    [...tasks(COUNTRIES.slice(windowStart, start)), ...tasks(COUNTRIES.slice(0, windowStart))],
    count,
    taskKey,
  );
}

function flags(step: number, config: Config): Tasks {
  const T = geographyTexts(config.lang);
  const known = flagsKnownAt(step);
  return known.map((country) => flagTask(country, known, step, T));
}

function continents(step: number, config: Config): Tasks {
  const T = geographyTexts(config.lang);
  const animals: Tasks = CONTINENT_ANIMALS.map((a) =>
    templateTask(
      `home:${a.id}`,
      T.map.animalAsk(a.id),
      {
        template: Mechanics.MapPuzzle,
        layer: 'continents',
        mode: 'drag',
        marker: card(a.id, a.emoji),
        targetId: a.home,
        hint: T.map.animalHint(a.id),
      },
      step,
      T.map.animalFacts(a.id),
    ),
  );
  const countries: Tasks = unlocked(MAP_COUNTRIES.slice(0, 60), step, 12, 0).map((c) =>
    templateTask(
      `where:${c.id}`,
      T.map.countryAsk(c.id),
      {
        template: Mechanics.MapPuzzle,
        layer: 'continents',
        mode: 'drag',
        marker: card(c.id, c.flag),
        targetId: c.continent,
        hint: T.map.countryHint(c.id),
      },
      step,
      T.map.countryYes(c.id),
    ),
  );
  return step <= 3 ? animals : [...animals, ...countries];
}

const cap = (text: string) => `${text[0].toUpperCase()}${text.slice(1)}`;

/** Path lengths of the three games below — also what their unlocking is paced by. */
export const BIOME_STEPS = 50;
export const OCEAN_STEPS = 50;
export const CAPITAL_STEPS = 15;

/** Every dweller of the zones, in the order the path meets them. */
export const ZONE_ANIMALS: BiomeAnimal[] = [...BIOME_ANIMALS, ...MORE_BIOME_ANIMALS];
/** What is told about an animal once it is placed: its own facts, never its zone's. */
/** Six ways to recognise a zone. */

/** Answers on a board of this game: the right one and five others. */
const ZONE_CHOICES = 6;
/** The first twelve animals open the game; the last arrive on this step. */
const ALL_ANIMALS_BY = 40;
/** Steps after meeting an animal on which each further question about it opens. */
const WHO_AFTER = 3;
const RIDDLE_AFTER = 6;
const ODD_AFTER = 9;
/** The step on which each of a zone's six descriptions opens. */
const SIGN_STEPS = [5, 12, 19, 26, 33, 40];

/** Animals met up to this step. */
const animalsAt = (step: number) => (step < 1 ? [] : unlocked(ZONE_ANIMALS, step, ALL_ANIMALS_BY, 12));
const livesIn = (a: BiomeAnimal, zone: BiomeId) => a.home === zone || Boolean(a.also?.includes(zone));

/**
 * Game 9 — «Тварини та Природні Зони». Fifty steps: two new animals on almost
 * every one, and four questions about each animal that open one after another
 * (so a step always brings something new to ask, to the very end of the path):
 *   where does this animal live                    UI_SORTER_BINS, six zones
 *   +3 steps  who lives in this zone               UI_GRID_CHOICE, six animals
 *   +6 steps  «Хто це?» — the animal by a riddle
 *   +9 steps  «Хто тут зайвий?» — five neighbours and a stranger
 * plus «Яка це природна зона?» by six descriptions of every zone.
 */
function biomes(step: number, config: Config): Tasks {
  const T = geographyTexts(config.lang);
  const factsOf = (a: BiomeAnimal) => T.animal(a.id).facts;
  const animals = animalsAt(step);
  const wrongSay = Object.fromEntries(BIOMES.map((b) => [b.id, T.zone(b.id).no]));
  const zoneOf = (a: BiomeAnimal) => BIOMES.find((b) => b.id === a.home) as Biome;
  const zoneCard = (b: Biome) => card(b.id, b.emoji, T.zone(b.id).name);
  const animalCard = (a: BiomeAnimal) => card(a.id, a.emoji, cap(T.animal(a.id).name));
  /** The right zone plus up to five wrong ones, always in the same order. */
  const zoneChoices = (right: Biome, wrong: readonly Biome[]) => {
    const picked = new Set([right.id, ...shuffle(wrong).slice(0, ZONE_CHOICES - 1).map((b) => b.id)]);
    return BIOMES.filter((b) => picked.has(b.id)).map(zoneCard);
  };

  const whereLives: Tasks = animals.map((a) =>
    templateTask(
      `biome:${a.id}`,
      T.zones.whereAsk(a.id),
      {
        template: Mechanics.SorterBins,
        item: card(a.id, a.emoji),
        // Never a zone the animal could arguably live in too.
        bins: zoneChoices(zoneOf(a), BIOMES.filter((b) => !livesIn(a, b.id))),
        correctBinId: a.home,
        wrongSay,
        hint: T.zones.whereHint(a.id),
      },
      step,
      factsOf(a),
    ),
  );

  const whoLives: Tasks = animalsAt(step - WHO_AFTER).map((a) => {
    const zone = zoneOf(a);
    const others = shuffle(animals.filter((o) => !livesIn(o, zone.id))).slice(0, ZONE_CHOICES - 1);
    return templateTask(
      `biome:who:${a.id}`,
      T.zones.whoAsk(zone.id),
      {
        template: Mechanics.GridChoice,
        cols: 3,
        stimulus: { emoji: zone.emoji, caption: T.zone(zone.id).name },
        options: shuffle([a, ...others]).map(animalCard),
        correctId: a.id,
        hint: T.zones.whoHint(zone.id),
      },
      step,
      factsOf(a),
    );
  });

  const riddles: Tasks = animalsAt(step - RIDDLE_AFTER).map((a) =>
    templateTask(
      `biome:riddle:${a.id}`,
      T.zones.riddleAsk(a.id),
      {
        template: Mechanics.GridChoice,
        cols: 3,
        options: withDistractors(a, animals, ZONE_CHOICES, byId).map(animalCard),
        correctId: a.id,
        hint: T.zones.riddleHint(a.id, a.home),
      },
      step,
      factsOf(a),
    ),
  );

  // The stranger among neighbours: asked once the zone has enough dwellers to stand beside it.
  const oddOnes: Tasks = animalsAt(step - ODD_AFTER).flatMap((a) => {
    const zones = shuffle(BIOMES.filter((z) => !livesIn(a, z.id) && animals.filter((o) => o.home === z.id).length >= 3));
    if (zones.length === 0) return [];
    const zone = zones[0];
    const neighbours = shuffle(animals.filter((o) => o.home === zone.id)).slice(0, ZONE_CHOICES - 1);
    return [
      templateTask(
        `biome:odd:${a.id}`,
        T.zones.oddAsk,
        {
          template: Mechanics.GridChoice,
          cols: 3,
          options: shuffle([a, ...neighbours]).map(animalCard),
          correctId: a.id,
          hint: T.zones.oddHint(zone.id),
        },
        step,
        factsOf(a),
      ),
    ];
  });

  const whichZone: Tasks = BIOMES.flatMap((zone) =>
    T.zone(zone.id).signs
      .filter((_, i) => step >= SIGN_STEPS[i])
      .map((_, i) => {
        const dwellers = animals.filter((a) => a.home === zone.id).slice(0, 3);
        return templateTask(
          `biome:zone:${zone.id}:${i}`,
          T.zones.zoneAsk(zone.id, i),
          {
            template: Mechanics.GridChoice,
            cols: 3,
            options: zoneChoices(zone, BIOMES.filter((b) => b.id !== zone.id)),
            correctId: zone.id,
            hint: T.zones.zoneHint(zone.id, dwellers.map((a) => a.id)),
          },
          step,
          // This very description, and one more thing about the zone that no other question tells.
          factPool(T.zones.zoneYes(zone.id, i), T.zone(zone.id).facts[i]),
        );
      }),
  );

  return [...whereLives, ...whoLives, ...riddles, ...oddOnes, ...whichZone];
}

/** «Пливи до …» needs the ocean's name in the genitive. */
const RIDDLE_STEPS = [1, 2, 3, 6, 9, 12, 15, 18];
/** What a list has opened by `step`, arriving evenly from its first step to its last. */
function arriving<T>(items: readonly T[], step: number, from: number, to: number): T[] {
  if (step < from) return [];
  return items.slice(0, Math.ceil((items.length * (Math.min(step, to) - from + 1)) / (to - from + 1)));
}
/** Countries with one ocean at their shores, best-known first, with that ocean. */
const SHORE_COUNTRIES = COUNTRIES.flatMap((c) => {
  const ocean = Object.keys(SHORES).find((o) => SHORES[o].includes(c.id));
  return ocean ? [{ country: c, ocean }] : [];
});

/**
 * Game 10 — «Моря та Океани Світу»: sail the ship to the right ocean. The map
 * stays the same; what is asked grows over fifty steps:
 *   1       the ocean by its name
 *   1–18    eight riddles about each ocean («до найбільшого океану»)
 *   4–50    seas and gulfs: which ocean is this a part of
 *   7–50    famous places: in which ocean is it
 *   10–50   countries: which ocean washes its shores
 *   20–50   rivers: which ocean does its water run to
 * What is told afterwards is always about the very thing that was asked.
 */
function oceans(step: number, config: Config): Tasks {
  const T = geographyTexts(config.lang);
  const sail = (key: string, prompt: string, oceanId: string, facts: string | string[], clue?: string) =>
    templateTask(
      key,
      prompt,
      {
        template: Mechanics.MapPuzzle,
        layer: 'oceans',
        mode: 'tap',
        marker: card('ship', '⛵'),
        targetId: oceanId,
        hint: T.seas.hint(clue ?? T.ocean(oceanId).fact),
      },
      step,
      facts,
    );

  const tasks: Tasks = OCEANS.map((o) => sail(`ocean:${o.id}`, T.seas.sailTo(o.id), o.id, T.ocean(o.id).pool));

  for (const o of OCEANS) {
    T.ocean(o.id).riddles.forEach((_, i) => {
      if (step >= RIDDLE_STEPS[i]) tasks.push(sail(`ocean:riddle:${o.id}:${i}`, T.seas.riddleAsk(o.id, i), o.id, T.ocean(o.id).riddleFacts[i], T.seas.itIs(o.id)));
    });
  }

  const part = (kind: 'sea' | 'place' | 'river') => (p: OceanPart) => {
    const words = T.seas[kind](p.id);
    return sail(`ocean:${kind}:${p.id}`, words.ask, p.ocean, words.fact, words.fact);
  };
  tasks.push(...arriving([...SEAS, ...MORE_SEAS], step, 4, OCEAN_STEPS).map(part('sea')));
  tasks.push(...arriving([...OCEAN_PLACES, ...MORE_OCEAN_PLACES], step, 7, OCEAN_STEPS).map(part('place')));
  tasks.push(
    ...arriving(SHORE_COUNTRIES, step, 10, OCEAN_STEPS).map(({ country, ocean }) =>
      sail(`ocean:shore:${country.id}`, T.seas.shoreAsk(country.id), ocean, T.seas.shoreYes(country.id, ocean), T.seas.itIs(ocean)),
    ),
  );
  tasks.push(...arriving(RIVERS, step, 20, OCEAN_STEPS).map(part('river')));
  return tasks;
}

/** The countries whose capital is asked about, in the order of the flags. */
export const CAPITALS: Country[] = COUNTRIES.filter((c) => CAPITAL_OF[c.id]);

function capitals(step: number, config: Config): Tasks {
  const T = geographyTexts(config.lang);
  const C = T.capitals;
  const landmarks = unlocked(LANDMARKS, step, CAPITAL_STEPS, 6);
  const landmarkTasks: Tasks = landmarks.map((l) => {
    const words = C.landmark(l.id);
    return templateTask(
      `capital:${l.id}`,
      words.ask,
      {
        template: Mechanics.GridChoice,
        cols: 2,
        stimulus: { emoji: l.emoji, art: l.id, caption: words.name },
        options: withDistractors(l, landmarks, 4, byId).map((o) => card(o.id, undefined, C.landmark(o.id).capital)),
        correctId: l.id,
        hint: words.hint,
      },
      step,
      words.facts,
    );
  });

  const known = unlocked(CAPITALS, step, CAPITAL_STEPS, 8);
  const capitalOf: Tasks = known.map((c) =>
    templateTask(
      `capital:of:${c.id}`,
      C.ask(c.id),
      {
        template: Mechanics.GridChoice,
        cols: 2,
        stimulus: { emoji: c.flag, caption: T.country(c.id) },
        options: withDistractors(c, known, 4, byId).map((o) => card(o.id, undefined, C.capital(o.id))),
        correctId: c.id,
        hint: C.hint(c.id),
      },
      step,
      factPool(...C.stories(c.id)),
    ),
  );

  // «X — столиця якої країни?» comes two steps after the capital itself was met.
  const familiar = step >= 3 ? unlocked(CAPITALS, step - 2, CAPITAL_STEPS, 8) : [];
  const countryOf: Tasks = familiar.map((c) =>
    templateTask(
      `capital:where:${c.id}`,
      C.countryAsk(c.id),
      {
        template: Mechanics.GridChoice,
        cols: 2,
        options: withDistractors(c, known, 4, byId).map((o) => card(o.id, o.flag, T.country(o.id))),
        correctId: c.id,
        hint: C.countryHint(c.id),
      },
      step,
      factPool(...C.stories(c.id)),
    ),
  );

  const dayNight: Tasks = (step >= 5 ? DAY_NIGHT : []).map((q) => {
    const words = C.dayNight(q.id);
    return templateTask(
      `time:${q.id}`,
      words.ask,
      {
        template: Mechanics.GridChoice,
        cols: 2,
        stimulus: { emoji: q.kyiv === 'day' ? '🌍☀️' : '🌍🌙', caption: words.caption },
        options: shuffle([card('day', '☀️', C.day), card('night', '🌙', C.night)]),
        correctId: q.answer,
        hint: C.dayNightHint,
      },
      step,
      words.why,
    );
  });

  const shifts = step >= 9 ? TIME_SHIFTS.slice(0, 4 + (step - 9) * 2) : [];
  const clock: Tasks = shifts.flatMap((t) =>
    t.kyiv.map((hour) => {
      const there = hour + t.shift;
      const words = C.clock(t.id, hour);
      const hours = [...new Set([there, hour, hour - t.shift, there + 1, there - 1, there + 2])].filter((h) => h >= 0 && h <= 23);
      const offered = shuffle([there, ...shuffle(hours.filter((h) => h !== there)).slice(0, 3)]);
      return templateTask(
        `time:clock:${t.id}:${hour}`,
        words.ask,
        {
          template: Mechanics.GridChoice,
          cols: 2,
          stimulus: { emoji: '🕰️', caption: words.caption },
          options: offered.map((h) => ({ id: String(h), glyphs: [`${h}:00`], speak: C.hourSay(h) })),
          correctId: String(there),
          hint: words.hint,
        },
        step,
        words.yes,
      );
    }),
  );

  return [...landmarkTasks, ...capitalOf, ...countryOf, ...dayNight, ...clock];
}

export const TASKS: Record<string, GameTasks> = {
  flags: { pool: flags, level: flagsLevel },
  continents: { pool: continents },
  biomes: { pool: biomes },
  oceans: { pool: oceans },
  capitals: { pool: capitals },
};
