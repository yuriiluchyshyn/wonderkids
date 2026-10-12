import { Mechanics } from '@/core/game/kernel/mechanics';
import { V6_RELEASE, type GameCard, type SubjectDef } from '../shared/templateModule';
import { LEARN_STEPS, STEPS } from './content/data';
import { artTexts } from './grammar';
import TEXTS from '@/locales/app/uk/games/art.json';

const J = TEXTS.config;

/** «Вивчаємо кольори» and the 30-step mixer came out together. */
const COLORS_RELEASE = '2026-10-12T00:00:00Z';

/** The subject as the hub shows it. */
export const SUBJECT: SubjectDef = {
  id: 'art',
  texts: { en: artTexts('en').cards, pl: artTexts('pl').cards },
  title: J.SUBJECT.title,
  icon: '🎨',
  accent: '#ec4899',
};

/**
 * The games of this subject — their catalog cards, in the order the hub lists
 * them. How each game makes its tasks lives in `tasks.ts` under the same id.
 */
export const GAMES: GameCard[] = [
  {
    id: 'mixer',
    gameId: 'art_color_mixer',
    label: J.GAMES.mixer.label,
    icon: '🎨',
    blurb: J.GAMES.mixer.blurb,
    intro: J.GAMES.mixer.intro,
    introFor: (step, lang) => artTexts(lang).introFor(step),
    langs: artTexts.langs,
    steps: STEPS.length,
    difficulty: [1, 3],
    publishDate: V6_RELEASE,
    tasksPerLevel: 6,
    mechanics: Mechanics.DragMatch,
    hasText: true,
  },
  {
    id: 'colors',
    gameId: 'art_colors',
    label: J.GAMES.colors.label,
    icon: '🌈',
    blurb: J.GAMES.colors.blurb,
    intro: J.GAMES.colors.intro,
    langs: artTexts.langs,
    steps: LEARN_STEPS.length,
    difficulty: [1, 2],
    publishDate: COLORS_RELEASE,
    // Seven quick taps a level, as the owner asked.
    tasksPerLevel: 7,
    mechanics: Mechanics.GridChoice,
    hasText: true,
  },
];
