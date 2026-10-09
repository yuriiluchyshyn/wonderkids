import { Mechanics } from '@/core/game/kernel/mechanics';
import { V4_RELEASE, type GameCard, type SubjectDef } from '../shared/templateModule';
import { COUNTRIES } from './content/countries';
import { FLAG_STEPS, BIOME_STEPS, OCEAN_STEPS, CAPITALS, CAPITAL_STEPS, ZONE_ANIMALS } from './tasks';
import { geographyTexts } from './grammar';
import { fill } from '@/core/language/fill';
import TEXTS from '@/locales/app/uk/games/geography.json';

const J = TEXTS.config;

/** The subject as the hub shows it. */
export const SUBJECT: SubjectDef = {
  id: 'geography',
  texts: { en: geographyTexts('en').cards, pl: geographyTexts('pl').cards },
  title: J.SUBJECT.title,
  icon: '🌍',
  accent: '#0ea5e9',
};

/**
 * The games of this subject — their catalog cards, in the order the hub lists
 * them. How each game makes its tasks lives in `tasks.ts` under the same id.
 */
export const GAMES: GameCard[] = [
  {
    id: 'flags',
    langs: geographyTexts.langs,
    gameId: 'geo_flags_quiz',
    label: J.GAMES.flags.label,
    icon: '🚩',
    blurb: fill(J.GAMES.flags.blurb, { length: COUNTRIES.length }),
    intro: J.GAMES.flags.intro,
    // One step per five flags: the whole world, best-known first.
    steps: FLAG_STEPS,
    difficulty: 1,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: Mechanics.GridChoice,
  },
  {
    id: 'continents',
    langs: geographyTexts.langs,
    gameId: 'geo_continent_puzzle',
    label: J.GAMES.continents.label,
    icon: '🗺️',
    blurb: J.GAMES.continents.blurb,
    intro: J.GAMES.continents.intro,
    steps: 12,
    difficulty: 2,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: Mechanics.MapPuzzle,
  },
  {
    id: 'biomes',
    langs: geographyTexts.langs,
    gameId: 'geo_biomes_sorter',
    label: J.GAMES.biomes.label,
    icon: '🐧',
    blurb: fill(J.GAMES.biomes.blurb, { length: ZONE_ANIMALS.length }),
    intro: J.GAMES.biomes.intro,
    steps: BIOME_STEPS,
    difficulty: [1, 2],
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: [Mechanics.SorterBins, Mechanics.GridChoice],
    hasText: true,
  },
  {
    id: 'oceans',
    langs: geographyTexts.langs,
    gameId: 'geo_oceans',
    label: J.GAMES.oceans.label,
    icon: '⛵',
    blurb: J.GAMES.oceans.blurb,
    intro: J.GAMES.oceans.intro,
    steps: OCEAN_STEPS,
    difficulty: 2,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: Mechanics.MapPuzzle,
  },
  {
    id: 'capitals',
    langs: geographyTexts.langs,
    gameId: 'geo_timezones_capitals',
    label: J.GAMES.capitals.label,
    icon: '🌐',
    blurb: fill(J.GAMES.capitals.blurb, { length: CAPITALS.length }),
    intro: J.GAMES.capitals.intro,
    steps: CAPITAL_STEPS,
    difficulty: 3,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: Mechanics.GridChoice,
    hasText: true,
  },
];
