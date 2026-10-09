import { Mechanics } from '@/core/game/kernel/mechanics';
import { V4_RELEASE, type GameCard, type SubjectDef } from '../shared/templateModule';
import { WHY_STEPS } from './content/questions';
import { ecologyTexts } from './grammar';
import TEXTS from '@/locales/app/uk/games/ecology.json';

const J = TEXTS.config;

/** The subject as the hub shows it. */
export const SUBJECT: SubjectDef = {
  id: 'ecology',
  texts: { en: ecologyTexts('en').cards, pl: ecologyTexts('pl').cards },
  title: J.SUBJECT.title,
  icon: '♻️',
  accent: '#22c55e',
};

/**
 * The games of this subject — their catalog cards, in the order the hub lists
 * them. How each game makes its tasks lives in `tasks.ts` under the same id.
 */
export const GAMES: GameCard[] = [
  {
    id: 'recycling',
    langs: ecologyTexts.langs,
    gameId: 'eco_recycling_patrol',
    label: J.GAMES.recycling.label,
    icon: '♻️',
    blurb: J.GAMES.recycling.blurb,
    intro: J.GAMES.recycling.intro,
    // No difficulty to grow here — open play, unlimited replays.
    progression: 'free',
    difficulty: 1,
    publishDate: V4_RELEASE,
    tasksPerLevel: 6,
    mechanics: Mechanics.SorterBins,
    hasText: true,
  },
  {
    id: 'why',
    langs: ecologyTexts.langs,
    gameId: 'eco_why_questions',
    label: J.GAMES.why.label,
    icon: '🌍',
    blurb: J.GAMES.why.blurb,
    intro:
      J.GAMES.why.intro,
    steps: WHY_STEPS,
    difficulty: [1, 2],
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: Mechanics.GridChoice,
    hasText: true,
  },
];
