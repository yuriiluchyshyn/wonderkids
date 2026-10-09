import { Mechanics } from '@/core/game/kernel/mechanics';
import type { LearningModule, SubCategory } from '@/core/game/kernel/types';
import type { LangCode } from '@/core/language';
import type { Theme } from '@/core/theme/theme.types';
import { fractionOpsIntro } from './generators/fractionOps';
import { GEOMETRY_STEPS, geometryIntro } from './generators/geometry';
import { MAZE_STEPS, mazeIntro } from './generators/maze';
import { clockIntro } from './generators/clock';
import { WORD_PROBLEM_STEPS } from './generators/wordProblems';
import type { SubjectDef } from '../shared/templateModule';
import { MATH_SUB } from './ids';
import { MATH_LANGS, mathTexts } from './grammar';
import WORDS from '@/locales/app/uk/games/math.json';

const J = WORDS.config;

/** The subject as the hub shows it. */
export const SUBJECT: SubjectDef = {
  id: 'math',
  title: J.SUBJECT.title,
  icon: '🧮',
  accent: '#a855f7',
};

/**
 * Catalog cards exposed by the Math module, each with its declarative game
 * config (PRD v4.0 §1.2). `steps` is the path length; `tasksPerLevel` how many
 * tasks one level asks — every game states its own.
 */
/** Publication date of the PRD v4.0 game pack (drives the "NEW" badge). */
const V4_RELEASE = '2026-10-06T00:00:00Z';
/** «Більше, менше, дорівнює» and «Котра година?». */
const COMPARE_CLOCK_RELEASE = '2026-10-06T00:00:00Z';

/**
 * The games of this subject — their catalog cards, in the order the hub lists
 * them. How each game makes its tasks lives in `tasks.ts` under the same id.
 */
const CARDS: SubCategory[] = [
  {
    id: MATH_SUB.add,
    demo: { kind: 'row', items: ['*', '*', '➕', '*', '🟰', '*', '*', '*'] },
    label: J.CARDS[0].label,
    icon: '➕',
    blurb: J.CARDS[0].blurb,
    steps: 40,
    difficulty: [1, 3],
    tasksPerLevel: 10,
    mechanics: Mechanics.GridChoice,
  },
  {
    id: MATH_SUB.sub,
    demo: { kind: 'row', items: ['*', '*', '*', '➖', '*', '🟰', '*', '*'] },
    label: J.CARDS[1].label,
    icon: '➖',
    blurb: J.CARDS[1].blurb,
    steps: 40,
    difficulty: [1, 3],
    tasksPerLevel: 10,
    mechanics: Mechanics.GridChoice,
  },
  {
    id: MATH_SUB.mul,
    demo: { kind: 'groups', groups: [2, 2], caption: J.CARDS[2].demo.caption },
    label: J.CARDS[2].label,
    icon: '✖️',
    blurb: J.CARDS[2].blurb,
    steps: 30,
    difficulty: [2, 3],
    tasksPerLevel: 10,
    mechanics: Mechanics.GridChoice,
  },
  {
    id: MATH_SUB.div,
    demo: { kind: 'groups', groups: [2, 2], caption: J.CARDS[3].demo.caption },
    label: J.CARDS[3].label,
    icon: '➗',
    blurb: J.CARDS[3].blurb,
    steps: 25,
    difficulty: [2, 3],
    tasksPerLevel: 10,
    mechanics: Mechanics.GridChoice,
  },
  {
    id: MATH_SUB.mixed,
    demo: { kind: 'row', items: ['*', '*', '➕', '*', '🟰', '*', '*', '*'] },
    label: J.CARDS[4].label,
    icon: '🧮',
    blurb: J.CARDS[4].blurb,
    steps: 60,
    difficulty: [1, 3],
    tasksPerLevel: 10,
    mechanics: Mechanics.GridChoice,
  },
  {
    // PRD v4.0, game 1: an introductory mode, shortened to 10 levels.
    id: MATH_SUB.fractions,
    demo: { kind: 'pie', food: '🍕', denom: 4, filled: 1 },
    gameId: 'math_tasty_fractions',
    label: J.CARDS[5].label,
    icon: '🍕',
    blurb: J.CARDS[5].blurb,
    steps: 10,
    difficulty: 1,
    tasksPerLevel: 10,
    mechanics: Mechanics.GridChoice,
  },
  {
    id: MATH_SUB.fractionOps,
    gameId: 'math_fraction_ops',
    label: J.CARDS[6].label,
    icon: '🧁',
    blurb: J.CARDS[6].blurb,
    steps: 20,
    difficulty: [2, 3],
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: [Mechanics.GridChoice, Mechanics.DragMatch],
  },
  {
    id: MATH_SUB.balance,
    gameId: 'math_balance_scale',
    label: J.CARDS[7].label,
    icon: '⚖️',
    blurb: J.CARDS[7].blurb,
    intro: J.CARDS[7].intro,
    steps: 15,
    difficulty: 2,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: Mechanics.BalanceScale,
  },
  {
    id: MATH_SUB.geometry,
    gameId: 'math_geometry_builder',
    label: J.CARDS[8].label,
    icon: '📐',
    blurb: J.CARDS[8].blurb,
    steps: GEOMETRY_STEPS,
    difficulty: [1, 3],
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: Mechanics.DragMatch,
  },
  {
    id: MATH_SUB.maze,
    gameId: 'math_number_maze',
    label: J.CARDS[9].label,
    icon: '🧭',
    blurb: J.CARDS[9].blurb,
    intro: J.CARDS[9].intro,
    steps: MAZE_STEPS,
    difficulty: 3,
    publishDate: V4_RELEASE,
    // One maze is a dozen steps of its own — five make a full level.
    tasksPerLevel: 5,
    mechanics: Mechanics.GridChoice,
  },
  {
    id: MATH_SUB.shop,
    gameId: 'math_shop_money',
    label: J.CARDS[10].label,
    icon: '🛒',
    blurb: J.CARDS[10].blurb,
    intro: J.CARDS[10].intro,
    steps: 12,
    difficulty: 2,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: Mechanics.DragMatch,
    hasText: true,
  },
  {
    id: MATH_SUB.compare,
    gameId: 'math_compare',
    label: J.CARDS[11].label,
    icon: '🐥',
    blurb: J.CARDS[11].blurb,
    intro:
      J.CARDS[11].intro,
    steps: 12,
    difficulty: [1, 2],
    publishDate: COMPARE_CLOCK_RELEASE,
    tasksPerLevel: 10,
    mechanics: Mechanics.GridChoice,
    hasText: true,
  },
  {
    id: MATH_SUB.clock,
    gameId: 'math_clock',
    label: J.CARDS[12].label,
    icon: '🕰️',
    blurb: J.CARDS[12].blurb,
    steps: 12,
    difficulty: [1, 2],
    publishDate: COMPARE_CLOCK_RELEASE,
    // Six clocks to study on every task: five to a level.
    tasksPerLevel: 5,
    mechanics: Mechanics.GridChoice,
    hasText: true,
  },
  {
    id: MATH_SUB.wordProblems,
    gameId: 'math_word_problems',
    label: J.CARDS[13].label,
    icon: '📖',
    blurb: J.CARDS[13].blurb,
    intro:
      J.CARDS[13].intro,
    steps: WORD_PROBLEM_STEPS,
    difficulty: [1, 3],
    publishDate: COMPARE_CLOCK_RELEASE,
    tasksPerLevel: 10,
    mechanics: Mechanics.GridChoice,
    hasText: true,
  },
];

/** The games of the galaxy: every one is written in every language of `grammar/`. */
export const GAMES: SubCategory[] = CARDS.map((game) => ({ ...game, langs: MATH_LANGS }));

/**
 * Short, concrete, 6-year-old-level explanation for each adventure, counted in
 * the active theme's own collectible (apples, bricks, snowflakes…).
 */
export function getIntro(subCategoryId: string, theme: Theme, step: number, lang?: LangCode): string | undefined {
  const T = mathTexts(lang);
  const it = theme.artifact.emoji;
  // The game's own intro, as its card has it in this language.
  const own = (lang && T.cards?.games[subCategoryId]?.intro) || GAMES.find((sc) => sc.id === subCategoryId)?.intro;
  switch (subCategoryId) {
    // Each new kind of fraction sum is explained when the path reaches it.
    case MATH_SUB.fractionOps:
      return fractionOpsIntro(step, lang);
    case MATH_SUB.geometry:
      return geometryIntro(step, lang);
    case MATH_SUB.clock:
      return clockIntro(step, lang);
    case MATH_SUB.maze:
      return mazeIntro(step, own, lang);
    case MATH_SUB.balance:
    case MATH_SUB.shop:
    case MATH_SUB.compare:
    case MATH_SUB.wordProblems:
      return own;
    case MATH_SUB.add:
      return T.intro.add(it);
    case MATH_SUB.sub:
      return T.intro.sub(it);
    case MATH_SUB.mul:
      return T.intro.mul(it);
    case MATH_SUB.div:
      return T.intro.div(it);
    case MATH_SUB.mixed:
      return T.intro.mixed;
    case MATH_SUB.fractions:
      return T.intro.fractions;
    default:
      return T.intro.other;
  }
}

/** The words of the galaxy's cards in the languages other than Ukrainian. */
export const TEXTS: LearningModule['texts'] = Object.fromEntries(MATH_LANGS.flatMap((lang) => (mathTexts(lang).cards ? [[lang, mathTexts(lang).cards]] : [])));
