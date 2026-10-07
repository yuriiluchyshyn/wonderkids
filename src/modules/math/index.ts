import { moduleRegistry } from '@/core/kernel/ModuleRegistry';
import type { LearningModule, SubCategory, TaskConfig, TaskInstance } from '@/core/kernel/types';
import type { Theme } from '@/core/theme/theme.types';
import { generateMentalMath } from './generators/mentalMath';
import { generateFraction } from './generators/fractions';
import { FRACTION_OPS_INTRO, fractionOpsTier, generateFractionOps } from './generators/fractionOps';
import { generateBalance } from './generators/balance';
import { GEOMETRY_STEPS, geometryIntro, generateGeometry } from './generators/geometry';
import { MAZE_STEPS, generateMaze, mazeIntro } from './generators/maze';
import { generateShop } from './generators/shop';
import { generateCompare } from './generators/compare';
import { clockIntro, generateClock } from './generators/clock';
import { WORD_PROBLEM_STEPS, generateWordProblem } from './generators/wordProblems';
import type { TemplatePayload } from '@/core/templates/types';
import { MathGameView } from './games/MathGameView';
import { MathVisualHelper } from './games/MathVisualHelper';
import { MathIntroView } from './games/MathIntroView';
import { MATH_SUB, isClassicPayload } from './math.types';

/**
 * Catalog cards exposed by the Math module, each with its declarative game
 * config (PRD v4.0 §1.2). `steps` is the path length; `tasksPerLevel` how many
 * tasks one level asks — every game states its own.
 */
/** Publication date of the PRD v4.0 game pack (drives the "NEW" badge). */
const V4_RELEASE = '2026-10-06T00:00:00Z';
/** «Більше, менше, дорівнює» and «Котра година?». */
const COMPARE_CLOCK_RELEASE = '2026-10-06T00:00:00Z';

const subCategories: SubCategory[] = [
  {
    id: MATH_SUB.add,
    landmark: { name: 'Інститут додавання', emoji: '🏛️' },
    label: 'Додавання',
    icon: '➕',
    blurb: 'Збираємо все докупи',
    steps: 40,
    difficulty: [1, 3],
    tasksPerLevel: 10,
    mechanics: 'UI_GRID_CHOICE',
  },
  {
    id: MATH_SUB.sub,
    landmark: { name: 'Інститут віднімання', emoji: '🏦' },
    label: 'Віднімання',
    icon: '➖',
    blurb: 'Забираємо потрошку',
    steps: 40,
    difficulty: [1, 3],
    tasksPerLevel: 10,
    mechanics: 'UI_GRID_CHOICE',
  },
  {
    id: MATH_SUB.mul,
    landmark: { name: 'Фабрика множення', emoji: '🏭' },
    label: 'Множення',
    icon: '✖️',
    blurb: 'Однакові купки разом',
    steps: 30,
    difficulty: [2, 3],
    tasksPerLevel: 10,
    mechanics: 'UI_GRID_CHOICE',
  },
  {
    id: MATH_SUB.div,
    landmark: { name: 'Центр ділення', emoji: '🏢' },
    label: 'Ділення',
    icon: '➗',
    blurb: 'Ділимо порівну',
    steps: 25,
    difficulty: [2, 3],
    tasksPerLevel: 10,
    mechanics: 'UI_GRID_CHOICE',
  },
  {
    id: MATH_SUB.mixed,
    landmark: { name: 'Академія наук', emoji: '🔬' },
    label: 'Усний Рахунок',
    icon: '🧮',
    blurb: 'Усе разом: +, −, ×, ÷',
    steps: 60,
    difficulty: [1, 3],
    tasksPerLevel: 10,
    mechanics: 'UI_GRID_CHOICE',
  },
  {
    // PRD v4.0, game 1: an introductory mode, shortened to 10 levels.
    id: MATH_SUB.fractions,
    landmark: { name: 'Піцерія дробів', emoji: '🍕' },
    gameId: 'math_tasty_fractions',
    label: 'Смачні Дроби',
    icon: '🍕',
    blurb: 'Шукаємо частинку смаколика',
    steps: 10,
    difficulty: 1,
    tasksPerLevel: 10,
    mechanics: 'UI_GRID_CHOICE',
  },
  {
    id: MATH_SUB.fractionOps,
    landmark: { name: 'Кондитерська дробів', emoji: '🧁' },
    gameId: 'math_fraction_ops',
    label: 'Дроби: дії',
    icon: '🧁',
    blurb: 'Додаємо, віднімаємо, множимо й ділимо дроби',
    steps: 20,
    difficulty: [2, 3],
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: ['UI_GRID_CHOICE', 'UI_DRAG_MATCH'],
  },
  {
    id: MATH_SUB.balance,
    landmark: { name: 'Палата мір і ваг', emoji: '⚖️' },
    gameId: 'math_balance_scale',
    label: 'Математичні Ваги',
    icon: '⚖️',
    blurb: 'Знайди гирю, що врівноважить',
    intro: 'Ваги люблять рівновагу! Зліва лежить приклад. Перетягни на праву шальку гирю, яка важить стільки ж.',
    steps: 15,
    difficulty: 2,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: 'UI_BALANCE_SCALE',
  },
  {
    id: MATH_SUB.geometry,
    landmark: { name: 'Архітектурне бюро', emoji: '📐' },
    gameId: 'math_geometry_builder',
    label: 'Геометричний Конструктор',
    icon: '📐',
    blurb: 'Складаємо фігури, рахуємо площу і периметр',
    steps: GEOMETRY_STEPS,
    difficulty: [1, 3],
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: 'UI_DRAG_MATCH',
  },
  {
    id: MATH_SUB.maze,
    landmark: { name: 'Фортеця-лабіринт', emoji: '🏯' },
    gameId: 'math_number_maze',
    label: 'Числовий Лабіринт',
    icon: '🧭',
    blurb: 'Біжи тільки по правильних числах',
    intro: 'Допоможи другові перебігти лабіринт! Ставати можна тільки на числа, які підходять під правило. Роби крок на сусідню клітинку.',
    steps: MAZE_STEPS,
    difficulty: 3,
    publishDate: V4_RELEASE,
    // One maze is a dozen steps of its own — five make a full level.
    tasksPerLevel: 5,
    mechanics: 'UI_GRID_CHOICE',
  },
  {
    id: MATH_SUB.shop,
    landmark: { name: 'Крамниця', emoji: '🏪' },
    gameId: 'math_shop_money',
    label: 'Магазин',
    icon: '🛒',
    blurb: 'Рахуємо кишенькові гроші',
    intro: 'Ласкаво просимо до магазину! Подивись на цінник і поклади на касу стільки грошей, скільки коштує іграшка.',
    steps: 12,
    difficulty: 2,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: 'UI_DRAG_MATCH',
    hasText: true,
  },
  {
    id: MATH_SUB.compare,
    landmark: { name: 'Школа порівнянь', emoji: '🏫' },
    gameId: 'math_compare',
    label: 'Більше, менше, дорівнює',
    icon: '🐥',
    blurb: 'Порівнюємо числа, приклади й величини',
    intro:
      'Порівнюймо! Знак «більше» і «менше» схожий на дзьобик пташки: він завжди відкритий до більшого числа. А якщо з обох боків однаково — ставимо «дорівнює».',
    steps: 12,
    difficulty: [1, 2],
    publishDate: COMPARE_CLOCK_RELEASE,
    tasksPerLevel: 10,
    mechanics: 'UI_GRID_CHOICE',
    hasText: true,
  },
  {
    id: MATH_SUB.clock,
    landmark: { name: 'Годинникова вежа', emoji: '🕰️' },
    gameId: 'math_clock',
    label: 'Котра година?',
    icon: '🕰️',
    blurb: 'Вчимося розуміти годинник зі стрілками',
    steps: 12,
    difficulty: [1, 2],
    publishDate: COMPARE_CLOCK_RELEASE,
    tasksPerLevel: 10,
    mechanics: 'UI_GRID_CHOICE',
    hasText: true,
  },
  {
    id: MATH_SUB.wordProblems,
    landmark: { name: 'Ринок', emoji: '🧺' },
    gameId: 'math_word_problems',
    label: 'Задачі',
    icon: '📖',
    blurb: 'Історії з життя: магазин, друзі, дорога',
    intro:
      'Послухай маленьку історію і дай відповідь на запитання. Картинки підкажуть, що ми знаємо і про що питають. Якщо треба — натисни на динамік, і я прочитаю задачу ще раз.',
    steps: WORD_PROBLEM_STEPS,
    difficulty: [1, 3],
    publishDate: COMPARE_CLOCK_RELEASE,
    tasksPerLevel: 10,
    mechanics: 'UI_GRID_CHOICE',
    hasText: true,
  },
];

const NUMBER_WORDS = ['нуль', 'один', 'два', 'три', 'чотири', "п'ять", 'шість', 'сім', 'вісім', "дев'ять", 'десять', 'одинадцять', 'дванадцять'];

/** Dispatches task generation to the right generator for the sub-category. */
function generateTask(config: TaskConfig): TaskInstance {
  switch (config.subCategoryId) {
    case MATH_SUB.fractions:
      return generateFraction(config);
    case MATH_SUB.fractionOps:
      return generateFractionOps(config);
    case MATH_SUB.balance:
      return generateBalance(config);
    case MATH_SUB.geometry:
      return generateGeometry(config);
    case MATH_SUB.maze:
      return generateMaze(config);
    case MATH_SUB.shop:
      return generateShop(config);
    case MATH_SUB.compare:
      return generateCompare(config);
    case MATH_SUB.wordProblems:
      return generateWordProblem(config);
    case MATH_SUB.clock:
      return generateClock(config);
    default:
      return generateMentalMath(config);
  }
}

/**
 * Short, concrete, 6-year-old-level explanation for each adventure, counted in
 * the active theme's own collectible (apples, bricks, snowflakes…).
 */
function getIntro(subCategoryId: string, theme: Theme, step: number): string | undefined {
  const it = theme.artifact.emoji;
  switch (subCategoryId) {
    // Each new kind of fraction sum is explained when the path reaches it.
    case MATH_SUB.fractionOps:
      return FRACTION_OPS_INTRO[fractionOpsTier(step)];
    case MATH_SUB.geometry:
      return geometryIntro(step);
    case MATH_SUB.clock:
      return clockIntro(step);
    case MATH_SUB.maze:
      return mazeIntro(step, subCategories.find((sc) => sc.id === subCategoryId)?.intro);
    case MATH_SUB.balance:
    case MATH_SUB.shop:
    case MATH_SUB.compare:
    case MATH_SUB.wordProblems:
      return subCategories.find((sc) => sc.id === subCategoryId)?.intro;
    case MATH_SUB.add:
      return `Додавати — це збирати разом! Поклади ${it}${it} і ще ${it}. Порахуй: один, два, три. Разом три ${it}!`;
    case MATH_SUB.sub:
      return `Віднімати — це забирати. Було ${it}${it}${it}, одне ${it} забрали — лишилось два. Полічи, скільки лишиться!`;
    case MATH_SUB.mul:
      return `Множити — це брати однакові купки. Беремо ${it}${it} два рази: ${it}${it} і ще ${it}${it} — разом чотири ${it}!`;
    case MATH_SUB.div:
      return `Ділити — це роздати порівну. Маємо ${it}${it}${it}${it}, кладемо у два кошики порівну — у кожному по два. Скільки в одному?`;
    case MATH_SUB.mixed:
      return `Тут різні приклади. Дивись на знак: «плюс» — збираємо разом, «мінус» — забираємо. Рахуй уважно!`;
    case MATH_SUB.fractions:
      return `Дроби — це рівні шматочки. Уяви піцу 🍕: розрізали на чотири шматочки й узяли один — це одна четвертинка. Знайди зафарбований шматочок!`;
    default:
      return 'Готовий до пригоди? Рахуймо разом!';
  }
}

/** Task-aware, encouraging explanation of HOW to solve the current task. */
function getHintSpeech(task: TaskInstance): string {
  if (!isClassicPayload(task.payload)) return (task.payload as TemplatePayload).hint ?? '';
  const p = task.payload;
  if (p.kind === 'fraction') {
    // Count the highlighted slices aloud: «Один, два, три — з чотирьох!»
    const counted = Array.from({ length: p.filled }, (_, i) => NUMBER_WORDS[i + 1] ?? String(i + 1)).join(', ');
    return `Полічімо зафарбовані шматочки: ${counted}. Усього шматочків ${p.denom}. Отже, це ${p.filled} з ${p.denom}!`;
  }
  if (p.op === '×') {
    return `Це ${p.a} однакові купки, у кожній по ${p.b}. Торкайся кружечків по одному і рахуй усі разом.`;
  }
  if (p.op === '÷') {
    return `Розклади ${p.a} кружечків порівну у ${p.b} рядочки. Полічи, скільки опиниться в одному рядочку.`;
  }
  if (p.op === '-') {
    return `Було ${p.a}. Прибери ${p.b} — забирай по одному кружечку. Скільки лишилось?`;
  }
  return `Полічи кружечки по одному: спочатку ${p.a}, а потім додай ще ${p.b}. Скільки вийшло разом?`;
}

/** The Math module plugin — "Математичний Маг". */
export const mathModule: LearningModule = {
  id: 'math',
  title: 'Математика',
  icon: '🧮',
  accent: '#a855f7',
  subCategories,
  generateTask,
  GameView: MathGameView,
  VisualHelper: MathVisualHelper,
  // Template games scaffold inside their own layout — no separate panel.
  showsHelper: (task) => isClassicPayload(task.payload),
  IntroView: MathIntroView,
  getIntro,
  getHintSpeech,
};

// Self-register with the micro-kernel on import.
moduleRegistry.register(mathModule);
