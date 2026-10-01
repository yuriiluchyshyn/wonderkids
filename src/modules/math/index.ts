import { moduleRegistry } from '@/core/kernel/ModuleRegistry';
import type { LearningModule, SubCategory, TaskConfig, TaskInstance } from '@/core/kernel/types';
import type { Theme } from '@/core/theme/theme.types';
import { generateMentalMath } from './generators/mentalMath';
import { generateFraction } from './generators/fractions';
import { MathGameView } from './games/MathGameView';
import { MathVisualHelper } from './games/MathVisualHelper';
import { MathIntroView } from './games/MathIntroView';
import { MATH_SUB, type MathPayload } from './math.types';

/**
 * Catalog cards exposed by the Math module — one adventure per operation plus
 * a mixed mode and fractions. Each adventure sets its own path length: the core
 * arithmetic ladders are long, fractions is short.
 */
const subCategories: SubCategory[] = [
  {
    id: MATH_SUB.add,
    label: 'Додавання',
    icon: '➕',
    blurb: 'Збираємо все докупи',
    steps: 40,
  },
  {
    id: MATH_SUB.sub,
    label: 'Віднімання',
    icon: '➖',
    blurb: 'Забираємо потрошку',
    steps: 40,
  },
  {
    id: MATH_SUB.mul,
    label: 'Множення',
    icon: '✖️',
    blurb: 'Однакові купки разом',
    steps: 30,
  },
  {
    id: MATH_SUB.div,
    label: 'Ділення',
    icon: '➗',
    blurb: 'Ділимо порівну',
    steps: 25,
  },
  {
    id: MATH_SUB.mixed,
    label: 'Усний Рахунок',
    icon: '🧮',
    blurb: 'Усе разом: +, −, ×, ÷',
    steps: 60,
  },
  {
    id: MATH_SUB.fractions,
    label: 'Смачні Дроби',
    icon: '🍕',
    blurb: 'Шукаємо частинку смаколика',
    steps: 15,
  },
];

/** Dispatches task generation to the right generator for the sub-category. */
function generateTask(config: TaskConfig): TaskInstance {
  if (config.subCategoryId === MATH_SUB.fractions) {
    return generateFraction(config);
  }
  return generateMentalMath(config);
}

/**
 * Short, concrete, 6-year-old-level explanation for each adventure, counted in
 * the active theme's own collectible (apples, bricks, snowflakes…).
 */
function getIntro(subCategoryId: string, theme: Theme): string {
  const it = theme.artifact.emoji;
  switch (subCategoryId) {
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
  const p = task.payload as MathPayload;
  if (p.kind === 'fraction') {
    return `Подивись на тарілочку. Згори — скільки шматочків зафарбовано, а знизу — на скільки поділили. Полічи і обери дріб ${p.filled} з ${p.denom}.`;
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
  IntroView: MathIntroView,
  getIntro,
  getHintSpeech,
};

// Self-register with the micro-kernel on import.
moduleRegistry.register(mathModule);
