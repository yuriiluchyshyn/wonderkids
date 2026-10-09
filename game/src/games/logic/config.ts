import { Mechanics } from '@/core/game/kernel/mechanics';
import { V6_RELEASE, type GameCard, type SubjectDef } from '../shared/templateModule';
import { MIRROR_STEPS, PATTERN_STEPS, SHADOW_STEPS } from './content/data';
import { RIDDLE_STEPS } from './content/riddles';
import { logicTexts } from './grammar';
import TEXTS from '@/locales/app/uk/games/logic.json';

const J = TEXTS.config;

/** Publication date of «Логічні задачі» (drives the 60-day "NEW" badge). */
const RIDDLES_RELEASE = '2026-10-08T00:00:00Z';

/** The subject as the hub shows it. */
export const SUBJECT: SubjectDef = {
  id: 'logic',
  texts: { en: logicTexts('en').cards, pl: logicTexts('pl').cards },
  title: J.SUBJECT.title,
  icon: '🧩',
  accent: '#8b5cf6',
};

/**
 * The games of this subject — their catalog cards, in the order the hub lists
 * them. How each game makes its tasks lives in `tasks.ts` under the same id.
 */
export const GAMES: GameCard[] = [
  {
    id: 'patterns',
    gameId: 'logic_patterns',
    label: J.GAMES.patterns.label,
    icon: '🔁',
    blurb: J.GAMES.patterns.blurb,
    intro: J.GAMES.patterns.intro,
    introFor: (step, lang) => logicTexts(lang).introFor.patterns(step),
    langs: logicTexts.langs,
    steps: PATTERN_STEPS.length,
    difficulty: [1, 2],
    publishDate: V6_RELEASE,
    // Five, not ten: one task here is a long look (nine answers, several shadows to place).
    tasksPerLevel: 5,
    mechanics: Mechanics.GridChoice,
  },
  {
    id: 'shadows',
    gameId: 'logic_shadow_lotto',
    label: J.GAMES.shadows.label,
    icon: '👤',
    blurb: J.GAMES.shadows.blurb,
    intro: J.GAMES.shadows.intro,
    introFor: (step, lang) => logicTexts(lang).introFor.shadows(step),
    langs: logicTexts.langs,
    steps: SHADOW_STEPS.length,
    difficulty: [1, 3],
    publishDate: V6_RELEASE,
    // Five, not ten: one task here is a long look (nine answers, several shadows to place).
    tasksPerLevel: 5,
    mechanics: Mechanics.DragMatch,
  },
  {
    id: 'mirror',
    gameId: 'logic_mirror_symmetry',
    label: J.GAMES.mirror.label,
    icon: '🪞',
    blurb: J.GAMES.mirror.blurb,
    intro: J.GAMES.mirror.intro,
    introFor: (step, lang) => logicTexts(lang).introFor.mirror(step),
    langs: logicTexts.langs,
    steps: MIRROR_STEPS.length,
    difficulty: [1, 3],
    publishDate: V6_RELEASE,
    // Five, not ten: one task here is a long look (nine answers, several shadows to place).
    tasksPerLevel: 5,
    mechanics: Mechanics.GridChoice,
  },
  {
    id: 'riddles',
    gameId: 'logic_riddles',
    label: J.GAMES.riddles.label,
    icon: '🧠',
    blurb: J.GAMES.riddles.blurb,
    intro: J.GAMES.riddles.intro,
    introFor: (step, lang) => logicTexts(lang).introFor.riddles(step),
    langs: logicTexts.langs,
    steps: RIDDLE_STEPS,
    difficulty: [1, 3],
    publishDate: RIDDLES_RELEASE,
    // Five, not ten: a riddle takes a good think.
    tasksPerLevel: 5,
    mechanics: Mechanics.GridChoice,
    hasText: true,
  },
];
