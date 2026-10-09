import { Mechanics } from '@/core/game/kernel/mechanics';
import { I18N_RELEASE, V4_RELEASE, type GameCard, type SubjectDef } from '../shared/templateModule';
import { historyTexts } from './grammar';
import { plFigures, worldFigures, uaFigures } from './tasks';
import TEXTS from '@/locales/app/uk/games/history.json';

const J = TEXTS.config;

/** The subject as the hub shows it. */
export const SUBJECT: SubjectDef = {
  id: 'history',
  texts: { en: historyTexts('en').cards, pl: historyTexts('pl').cards },
  title: J.SUBJECT.title,
  icon: '🏛️',
  accent: '#f59e0b',
};

/**
 * The games of this subject — their catalog cards, in the order the hub lists
 * them. How each game makes its tasks lives in `tasks.ts` under the same id.
 */
export const GAMES: GameCard[] = [
  {
    id: 'dinosaurs',
    langs: historyTexts.langs,
    gameId: 'hist_dino_diet',
    label: J.GAMES.dinosaurs.label,
    icon: '🦖',
    blurb: J.GAMES.dinosaurs.blurb,
    intro: J.GAMES.dinosaurs.intro,
    // No difficulty to grow here — open play, unlimited replays.
    progression: 'free',
    difficulty: 1,
    publishDate: V4_RELEASE,
    tasksPerLevel: 6,
    mechanics: Mechanics.SorterBins,
    hasText: true,
  },
  {
    id: 'epochs',
    langs: historyTexts.langs,
    gameId: 'hist_time_machine',
    label: J.GAMES.epochs.label,
    icon: '⏳',
    blurb: J.GAMES.epochs.blurb,
    intro: J.GAMES.epochs.intro,
    // Random tasks from a big pool: nothing here gets "harder", so free play.
    progression: 'free',
    difficulty: 2,
    publishDate: V4_RELEASE,
    tasksPerLevel: 6,
    mechanics: [Mechanics.ChronoSequence, Mechanics.GridChoice, Mechanics.SorterBins],
    hasText: true,
  },
  {
    id: 'world_figures',
    langs: historyTexts.langs,
    gameId: 'hist_world_figures',
    label: J.GAMES.world_figures.label,
    icon: '🌟',
    blurb: J.GAMES.world_figures.blurb,
    intro: J.GAMES.world_figures.intro,
    steps: worldFigures.steps,
    difficulty: 1,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: [Mechanics.DragMatch, Mechanics.GridChoice],
    hasText: true,
  },
  {
    id: 'ua_figures',
    langs: historyTexts.langs,
    gameId: 'hist_ua_figures',
    label: J.GAMES.ua_figures.label,
    icon: '🇺🇦',
    blurb: J.GAMES.ua_figures.blurb,
    intro: J.GAMES.ua_figures.intro,
    steps: uaFigures.steps,
    difficulty: 2,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: [Mechanics.DragMatch, Mechanics.GridChoice],
    hasText: true,
  },
  {
    id: 'inventions',
    langs: historyTexts.langs,
    gameId: 'hist_world_inventions',
    label: J.GAMES.inventions.label,
    icon: '💡',
    blurb: J.GAMES.inventions.blurb,
    intro: J.GAMES.inventions.intro,
    steps: 10,
    difficulty: 2,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: [Mechanics.GridChoice, Mechanics.DragMatch],
    hasText: true,
  },
  {
    id: 'ua_inventions',
    langs: historyTexts.langs,
    gameId: 'hist_ua_inventions',
    label: J.GAMES.ua_inventions.label,
    icon: '🚁',
    blurb: J.GAMES.ua_inventions.blurb,
    intro: J.GAMES.ua_inventions.intro,
    steps: 10,
    difficulty: 2,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: [Mechanics.GridChoice, Mechanics.DragMatch],
    hasText: true,
  },
  // The history of Poland comes with the Polish language (`content/poland.ts`).
  {
    id: 'pl_figures',
    langs: ['pl'],
    gameId: 'hist_pl_figures',
    label: J.GAMES.pl_figures.label,
    icon: '🇵🇱',
    blurb: J.GAMES.pl_figures.blurb,
    intro: J.GAMES.pl_figures.intro,
    steps: plFigures.steps,
    difficulty: 2,
    publishDate: I18N_RELEASE,
    tasksPerLevel: 10,
    mechanics: [Mechanics.DragMatch, Mechanics.GridChoice],
    hasText: true,
  },
  {
    id: 'pl_inventions',
    langs: ['pl'],
    gameId: 'hist_pl_inventions',
    label: J.GAMES.pl_inventions.label,
    icon: '🪔',
    blurb: J.GAMES.pl_inventions.blurb,
    intro: J.GAMES.pl_inventions.intro,
    steps: 10,
    difficulty: 2,
    publishDate: I18N_RELEASE,
    tasksPerLevel: 10,
    mechanics: [Mechanics.GridChoice, Mechanics.DragMatch],
    hasText: true,
  },
];
