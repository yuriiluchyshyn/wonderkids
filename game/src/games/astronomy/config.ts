import { Mechanics } from '@/core/game/kernel/mechanics';
import { V6_RELEASE, type GameCard, type SubjectDef } from '../shared/templateModule';
import { FIND_STEPS, SKY_STEPS } from './content/data';
import { QUIZ_STEPS } from './content/planetQuiz';
import { QUIZ_FROM } from './tasks';
import { astronomyTexts } from './lang';

/** The subject as the hub shows it. */
export const SUBJECT: SubjectDef = {
  id: 'astronomy',
  texts: { en: astronomyTexts('en').cards, pl: astronomyTexts('pl').cards },
  title: 'Астрономія',
  icon: '🔭',
  accent: '#6366f1',
};

/**
 * The games of this subject — their catalog cards, in the order the hub lists
 * them. How each game makes its tasks lives in `tasks.ts` under the same id.
 */
export const GAMES: GameCard[] = [
  {
    id: 'planets',
    gameId: 'astro_planet_parade',
    label: 'Парад Планет',
    icon: '🪐',
    blurb: 'Розстав планети від Сонця й за розміром і дізнайся про кожну сто цікавинок',
    intro: 'Навколо Сонця кружляють вісім планет. Розстав їх по порядку: спершу ту, що найближче до Сонця!',
    introFor: (step, lang) => astronomyTexts(lang).introFor.planets(step, QUIZ_FROM),
    langs: astronomyTexts.langs,
    steps: QUIZ_FROM - 1 + QUIZ_STEPS,
    difficulty: [1, 2],
    publishDate: V6_RELEASE,
    tasksPerLevel: 6,
    mechanics: [Mechanics.ChronoSequence, Mechanics.DragMatch, Mechanics.GridChoice],
    hasText: true,
  },
  {
    id: 'constellations',
    gameId: 'astro_space_navigator',
    label: 'Космічний Навігатор',
    icon: '✨',
    blurb: 'З’єднуй зорі по порядку, малюй сузір’я і шукай їх на зоряному небі',
    intro: 'На небі зорі складаються в малюнки — сузір’я. Торкайся зір по порядку, від найменшого числа, — і побачиш, що вийде!',
    introFor: (step, lang) => astronomyTexts(lang).introFor.constellations(step, SKY_STEPS.length),
    langs: astronomyTexts.langs,
    steps: SKY_STEPS.length + FIND_STEPS.length,
    difficulty: [1, 2],
    publishDate: V6_RELEASE,
    tasksPerLevel: 5,
    mechanics: Mechanics.ChronoSequence,
  },
];
