import { Mechanics } from '@/core/game/kernel/mechanics';
import { V6_RELEASE, type GameCard, type SubjectDef } from '../shared/templateModule';
import { MIRROR_STEPS, PATTERN_STEPS, SHADOW_STEPS } from './content/data';
import { RIDDLE_STEPS } from './content/riddles';
import { logicTexts } from './lang';

/** Publication date of «Логічні задачі» (drives the 60-day "NEW" badge). */
const RIDDLES_RELEASE = '2026-10-08T00:00:00Z';

/** The subject as the hub shows it. */
export const SUBJECT: SubjectDef = {
  id: 'logic',
  texts: { en: logicTexts('en').cards, pl: logicTexts('pl').cards },
  title: 'Логіка',
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
    label: 'Ритм і Візерунки',
    icon: '🔁',
    blurb: 'Розгадай правило і продовж візерунок',
    intro: 'Малюнки стоять у рядку за правилом і повторюються. Розгадай це правило і скажи, що має бути замість знака питання!',
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
    label: 'Тіньове Лото',
    icon: '👤',
    blurb: 'Знайди для кожного малюнка його тінь',
    intro: 'У кожного предмета є тінь — чорний силует такої самої форми. Перетягни кожен малюнок на його тінь!',
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
    label: 'Дзеркало',
    icon: '🪞',
    blurb: 'Домалюй другу половинку — як у дзеркалі',
    intro: 'Тут намальована лише ліва половинка малюнка. Права має бути такою самою, тільки віддзеркаленою. Знайди її!',
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
    label: 'Логічні Задачі',
    icon: '🧠',
    blurb: 'Маленькі історії, де треба не рахувати, а міркувати',
    intro: 'Послухай коротку історію і подумай. Тут не треба довго рахувати — треба здогадатися! Якщо потрібно, натисни на динамік, і я прочитаю задачу ще раз.',
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
