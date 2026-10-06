import type { TaskInstance } from '@/core/kernel/types';
import type { TemplatePayload } from '@/core/templates/types';
import { OCEANS, regionName } from '@/core/templates/worldMap';
import { shuffle } from '@/core/utils/random';
import {
  V4_RELEASE,
  card,
  defineTemplateModule,
  templateTask,
  unlocked,
  withDistractors,
} from '../shared/templateModule';
import { COUNTRIES, MAP_COUNTRIES, type Country } from './countries';
import { BIOMES, BIOME_ANIMALS, CONTINENT_ANIMALS, DAY_NIGHT, LANDMARKS, OCEAN_FACTS } from './data';
import { BIOME_FACTS, CAPITAL_FACTS, CONTINENT_FACTS, DAY_NIGHT_FACTS, OCEAN_POOLS } from './facts';
import { RECALL_WINDOW, composeLevel } from '@/core/engine/recall';
import { taskKey } from '@/core/engine/LevelEngine';
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
    `Є! Під цим прапором живе ${n}.`,
    `Точно! ${n}. Запам’ятай кольори цього прапора.`,
    `Так! Якщо побачиш цей прапор на змаганнях — це ${n}.`,
  );
}
/** Path length that walks through every country once. */
const FLAG_STEPS = Math.ceil(COUNTRIES.length / FLAGS_PER_STEP);

function flagTask(country: Country, known: readonly Country[], step: number): TaskInstance<TemplatePayload> {
  return templateTask(
    `flag:${country.id}`,
    `Знайди прапор: ${country.name}`,
    {
      template: 'UI_GRID_CHOICE',
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
      `Де живе ${a.name}? Перетягни на карту`,
      {
        template: 'UI_MAP_PUZZLE',
        layer: 'continents',
        mode: 'drag',
        marker: card(a.id, a.emoji),
        targetId: a.home,
        hint: `Шукай материк, який блимає. ${a.name[0].toUpperCase()}${a.name.slice(1)} живе там, де ${regionName(a.home)}.`,
      },
      step,
      factPool(`${regionName(a.home)} — дім для тваринки ${a.name}!`, `Так! ${a.name[0].toUpperCase()}${a.name.slice(1)} живе там, де ${regionName(a.home)}.`, CONTINENT_FACTS[a.home]),
    ),
  );
  // Countries join once the animals are familiar — the best-known ones first.
  const countries: Tasks = unlocked(MAP_COUNTRIES.slice(0, 60), step, 12, 0).map((c) =>
    templateTask(
      `where:${c.id}`,
      `На якому материку ${c.name}? Перетягни прапор`,
      {
        template: 'UI_MAP_PUZZLE',
        layer: 'continents',
        mode: 'drag',
        marker: card(c.id, c.flag),
        targetId: c.continent,
        hint: `${c.name} — це ${regionName(c.continent)}. Шукай материк, який блимає.`,
      },
      step,
      factPool(`${c.name} — це ${regionName(c.continent)}.`, `Так! ${c.name} — це країна в ${c.continentName}.`, CONTINENT_FACTS[c.continent]),
    ),
  );
  return step <= 3 ? animals : [...animals, ...countries];
}

/** Game 9 — «Тварини та Природні Зони»: sort animals into 4 biomes. */
function biomes(step: number): Tasks {
  const bins = BIOMES.map((b) => card(b.id, b.emoji, b.name));
  const wrongSay = Object.fromEntries(BIOMES.map((b) => [b.id, b.no]));
  return BIOME_ANIMALS.map((a) =>
    templateTask(
      `biome:${a.id}`,
      `Де живе ${a.name}?`,
      {
        template: 'UI_SORTER_BINS',
        item: card(a.id, a.emoji),
        bins,
        correctBinId: a.home,
        wrongSay,
        hint: `Подумай, де тваринці буде добре. ${a.fact}`,
      },
      step,
      factPool(a.fact, BIOME_FACTS[a.home]),
    ),
  );
}

/** Game 10 — «Моря та Океани Світу»: sail the ship to the named ocean. */
function oceans(step: number): Tasks {
  return OCEANS.map((ocean) =>
    templateTask(
      `ocean:${ocean.id}`,
      `Пливи до: ${ocean.name}!`,
      {
        template: 'UI_MAP_PUZZLE',
        layer: 'oceans',
        mode: 'tap',
        marker: card('ship', '⛵'),
        targetId: ocean.id,
        hint: `Шукай воду, що переливається хвилями. ${OCEAN_FACTS[ocean.id]}`,
      },
      step,
      OCEAN_POOLS[ocean.id],
    ),
  );
}

/** Game 11 — «Часові Пояси та Столиці»: landmarks → capitals, day or night. */
function capitals(step: number): Tasks {
  const known = unlocked(LANDMARKS, step, 10, 6);
  const landmarkTasks: Tasks = known.map((l) =>
    templateTask(
      `capital:${l.id}`,
      `${l.landmark}: у якій столиці це можна побачити?`,
      {
        template: 'UI_GRID_CHOICE',
        cols: 2,
        stimulus: { emoji: l.emoji, art: l.id, caption: l.landmark },
        options: withDistractors(l, known, 4, byId).map((o) => card(o.id, undefined, o.capital)),
        correctId: l.id,
        hint: `${l.landmark} — символ ${l.country}. Згадай столицю цієї країни.`,
      },
      step,
      factPool(`${l.landmark} стоїть у місті ${l.capital} — це столиця ${l.country}.`, CAPITAL_FACTS),
    ),
  );
  if (step <= 4) return landmarkTasks;

  const dayNight: Tasks = DAY_NIGHT.map((q) =>
    templateTask(
      `time:${q.id}`,
      `У Києві зараз ${q.kyiv === 'day' ? 'день' : 'ніч'}. А що у ${q.city}?`,
      {
        template: 'UI_GRID_CHOICE',
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
  return [...landmarkTasks, ...dayNight];
}

/** The Geography subject — "Навколо Світу" (PRD v4.0 §4.2). */
export const geographyModule = defineTemplateModule({
  id: 'geography',
  title: 'Географія',
  icon: '🌍',
  accent: '#0ea5e9',
  games: [
    {
      id: 'flags',
    landmark: { name: 'Алея прапорів', emoji: '🚩', stages: [['🇺🇦', 'Україна'], ['🗼', 'Франція'], ['🗻', 'Японія'], ['🗽', 'Америка']] },
      gameId: 'geo_flags_quiz',
      label: 'Вгадай Прапор',
      icon: '🚩',
      blurb: `Усі ${COUNTRIES.length} прапори світу — від найвідоміших`,
      intro: 'У кожної країни є свій прапор. Послухай назву країни і знайди її прапор серед шести! На кожній сходинці — п’ять нових прапорів, а знайомі повертаються, щоб ти їх не забув.',
      // One step per five flags: the whole world, best-known first.
      steps: FLAG_STEPS,
      difficulty: 1,
      publishDate: V4_RELEASE,
      mechanics: 'UI_GRID_CHOICE',
      level: flagsLevel,
      pool: flags,
    },
    {
      id: 'continents',
    landmark: { name: 'Материки', emoji: '🗺️', stages: [['🦘', 'Австралія'], ['🦁', 'Африка'], ['🐼', 'Азія'], ['🌍', 'Увесь світ']] },
      gameId: 'geo_continent_puzzle',
      label: 'Склади Карту',
      icon: '🗺️',
      blurb: 'Розстав тварин і прапори на материках',
      intro: 'На Землі сім материків. Перетягни тваринку чи прапор на той материк, де вони живуть.',
      steps: 12,
      difficulty: 2,
      publishDate: V4_RELEASE,
      mechanics: 'UI_MAP_PUZZLE',
      pool: continents,
    },
    {
      id: 'biomes',
    landmark: { name: 'Заповідник', emoji: '🏞️', stages: [['❄️', 'Арктика'], ['🌴', 'Джунглі'], ['🏜️', 'Пустеля'], ['🌊', 'Океан']] },
      gameId: 'geo_biomes_sorter',
      label: 'Тварини і Природні Зони',
      icon: '🐧',
      blurb: 'Хто де живе: Арктика, джунглі, пустеля, океан',
      intro: 'Кожна тваринка любить свій дім. Комусь добре серед криги, а комусь — у спекотній пустелі. Допоможи їм дістатися додому!',
      // No difficulty to grow here — open play, unlimited replays.
      progression: 'free',
      difficulty: 1,
      publishDate: V4_RELEASE,
      tasksPerLevel: 6,
      mechanics: 'UI_SORTER_BINS',
      hasText: true,
      pool: biomes,
    },
    {
      id: 'oceans',
    landmark: { name: 'Морський порт', emoji: '⚓', stages: [['⛵', 'Причал'], ['🏝️', 'Острів'], ['🚢', 'Порт'], ['🐬', 'Океанаріум']] },
      gameId: 'geo_oceans',
      label: 'Моря та Океани',
      icon: '⛵',
      blurb: 'Веди кораблик до потрібного океану',
      intro: 'На нашій планеті п’ять океанів. Послухай, куди пливти, і торкнись потрібного океану на карті!',
      // No difficulty to grow here — open play, unlimited replays.
      progression: 'free',
      difficulty: 2,
      publishDate: V4_RELEASE,
      // Only five oceans exist — the level shrinks to five on its own.
      tasksPerLevel: 6,
      mechanics: 'UI_MAP_PUZZLE',
      pool: oceans,
    },
    {
      id: 'capitals',
    landmark: { name: 'Столиці світу', emoji: '🌐', stages: [['⛪', 'Київ'], ['🕰️', 'Лондон'], ['🗼', 'Париж'], ['🏯', 'Пекін']] },
      gameId: 'geo_timezones_capitals',
      label: 'Столиці та Часові Пояси',
      icon: '🌐',
      blurb: 'Впізнай столицю і дізнайся, де зараз ніч',
      intro: 'Упізнай столицю за її найвідомішою спорудою. А ще дізнаємось, чому в одних містах день, коли в інших ніч!',
      steps: 10,
      difficulty: 3,
      publishDate: V4_RELEASE,
      mechanics: 'UI_GRID_CHOICE',
      hasText: true,
      pool: capitals,
    },
  ],
});
