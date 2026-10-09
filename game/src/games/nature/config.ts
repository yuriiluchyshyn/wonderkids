import { Mechanics } from '@/core/game/kernel/mechanics';
import type { GameCard, SubjectDef } from '../shared/templateModule';
import { RELEASE } from './tasks';
import { natureTexts } from './grammar';
import TEXTS from '@/locales/app/uk/games/nature.json';

const J = TEXTS.config;

/** The subject as the hub shows it. */
export const SUBJECT: SubjectDef = {
  texts: { en: natureTexts('en').cards, pl: natureTexts('pl').cards },
  id: 'nature',
  title: J.SUBJECT.title,
  icon: '🌿',
  accent: '#16a34a',
};

/**
 * The games of this subject — their catalog cards, in the order the hub lists
 * them. How each game makes its tasks lives in `tasks.ts` under the same id.
 */
export const GAMES: GameCard[] = [
  {
    id: 'seasons',
    gameId: 'nature_seasons_months',
    label: J.GAMES.seasons.label,
    icon: '🍂',
    blurb: J.GAMES.seasons.blurb,
    intro:
      J.GAMES.seasons.intro,
    introFor: (step, lang) => natureTexts(lang).introFor(step),
    langs: natureTexts.langs,
    steps: 8,
    difficulty: 1,
    publishDate: RELEASE,
    tasksPerLevel: 10,
    mechanics: [Mechanics.SorterBins, Mechanics.GridChoice, Mechanics.ChronoSequence],
    hasText: true,
  },
];
