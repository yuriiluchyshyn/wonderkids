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
import { BIOMES, BIOME_ANIMALS, CONTINENT_ANIMALS, COUNTRIES, DAY_NIGHT, LANDMARKS, OCEAN_FACTS } from './data';

type Tasks = TaskInstance<TemplatePayload>[];
const byId = <T extends { id: string }>(a: T, b: T) => a.id === b.id;

/** Game 7 — «Вгадай Прапор»: hear the country, tap 1 of 6 flags. */
function flags(step: number): Tasks {
  const known = unlocked(COUNTRIES, step, 10, 8);
  return known.map((country) =>
    templateTask(
      `flag:${country.id}`,
      `Знайди прапор: ${country.name}`,
      {
        template: 'UI_GRID_CHOICE',
        cols: 3,
        options: withDistractors(country, known, 6, byId).map((c) => card(c.id, c.flag, undefined, c.name)),
        correctId: country.id,
        hint: country.look,
      },
      step,
      `Так, це прапор країни ${country.name}!`,
    ),
  );
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
      `${regionName(a.home)} — дім для тваринки ${a.name}!`,
    ),
  );
  // Countries join once the animals are familiar.
  const countries: Tasks = unlocked(COUNTRIES, step, 12, 0).map((c) =>
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
      `${c.name} — це ${regionName(c.continent)}.`,
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
      a.fact,
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
      OCEAN_FACTS[ocean.id],
    ),
  );
}

/** Game 11 — «Часові Пояси та Столиці»: landmarks → capitals, day or night. */
function capitals(step: number): Tasks {
  const known = unlocked(LANDMARKS, step, 10, 6);
  const landmarkTasks: Tasks = known.map((l) =>
    templateTask(
      `capital:${l.id}`,
      `${l.landmark} — у якій це столиці?`,
      {
        template: 'UI_GRID_CHOICE',
        cols: 2,
        stimulus: { emoji: l.emoji, caption: l.landmark },
        options: withDistractors(l, known, 4, byId).map((o) => card(o.id, undefined, o.capital)),
        correctId: l.id,
        hint: `${l.landmark} — символ ${l.country}. Згадай столицю цієї країни.`,
      },
      step,
      `${l.landmark} стоїть у місті ${l.capital} — це столиця ${l.country}.`,
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
      q.why,
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
      blurb: 'Знайди прапор країни',
      intro: 'У кожної країни є свій прапор. Послухай назву країни і знайди її прапор серед шести!',
      steps: 10,
      difficulty: 1,
      publishDate: V4_RELEASE,
      tasksPerLevel: 6,
      mechanics: 'UI_GRID_CHOICE',
      hintDelaySec: 10,
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
      tasksPerLevel: 6,
      mechanics: 'UI_MAP_PUZZLE',
      hintDelaySec: 12,
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
      hintDelaySec: 10,
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
      hintDelaySec: 10,
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
      tasksPerLevel: 6,
      mechanics: 'UI_GRID_CHOICE',
      hintDelaySec: 12,
      hasText: true,
      pool: capitals,
    },
  ],
});
