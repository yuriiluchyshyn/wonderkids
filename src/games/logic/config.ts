import { V6_RELEASE, type GameCard, type SubjectDef } from '../shared/templateModule';
import { PATTERN_STEPS, HALF_SIZE } from './content/data';

/** The subject as the hub shows it. */
export const SUBJECT: SubjectDef = {
  id: 'logic',
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
    introFor: (step) => {
      if (step === 3) return 'Тепер знак питання стоїть посередині рядка. Подивись, що повторюється до нього і після нього.';
      if (step === 4) return 'Візерунки стають довшими: тепер повторюються три різні малюнки.';
      if (step === 7) return 'Обережно: тепер малюнки можуть стояти парами — два однакові поспіль.';
      return undefined;
    },
    landmark: { name: 'Майстерня візерунків', emoji: '🧵' },
    steps: PATTERN_STEPS.length,
    difficulty: [1, 2],
    publishDate: V6_RELEASE,
    tasksPerLevel: 10,
    mechanics: 'UI_GRID_CHOICE',
  },
  {
    id: 'shadows',
    gameId: 'logic_shadow_lotto',
    label: 'Тіньове Лото',
    icon: '👤',
    blurb: 'Знайди для кожного малюнка його тінь',
    intro: 'У кожного предмета є тінь — чорний силует такої самої форми. Перетягни кожен малюнок на його тінь!',
    introFor: (step) => {
      if (step === 4) return 'Тепер тіні більше схожі одна на одну. Придивляйся до дрібниць!';
      if (step === 8) return 'Найскладніше: чотири схожі тіні одразу. Будь дуже уважним!';
      return undefined;
    },
    landmark: { name: 'Театр тіней', emoji: '🎭' },
    steps: 10,
    difficulty: 1,
    publishDate: V6_RELEASE,
    tasksPerLevel: 10,
    mechanics: 'UI_DRAG_MATCH',
  },
  {
    id: 'mirror',
    gameId: 'logic_mirror_symmetry',
    label: 'Дзеркальний Симетрик',
    icon: '🪞',
    blurb: 'Домалюй другу половинку — як у дзеркалі',
    intro: 'Тут намальована лише ліва половинка малюнка. Права має бути такою самою, тільки віддзеркаленою. Знайди її!',
    introFor: (step) => (step === 3 ? 'А тепер половинки справжніх малюнків: метелика, сердечка, ялинки. Знайди другу половинку!' : undefined),
    landmark: { name: 'Дзеркальний палац', emoji: '🏰' },
    steps: HALF_SIZE.length,
    difficulty: [1, 3],
    publishDate: V6_RELEASE,
    tasksPerLevel: 10,
    mechanics: 'UI_GRID_CHOICE',
  },
];
