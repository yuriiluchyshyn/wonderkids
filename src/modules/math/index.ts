import { moduleRegistry } from '@/core/kernel/ModuleRegistry';
import type { LearningModule, SubCategory, TaskConfig, TaskInstance } from '@/core/kernel/types';
import { generateMentalMath } from './generators/mentalMath';
import { generateFraction } from './generators/fractions';
import { MathGameView } from './games/MathGameView';
import { MathVisualHelper } from './games/MathVisualHelper';
import { MathIntroView } from './games/MathIntroView';
import { MATH_SUB, type MathPayload } from './math.types';

/** Catalog cards exposed by the Math module (shown in the Hub). */
const subCategories: SubCategory[] = [
  {
    id: MATH_SUB.mental,
    label: 'Усний Рахунок',
    icon: '🧮',
    blurb: 'Додавання та віднімання з веселим супутником',
    intro:
      'Порахуй у голові! Подивись на приклад, полічи — і обери правильну відповідь. Якщо важко, супутник допоможе порахувати.',
  },
  {
    id: MATH_SUB.fractions,
    label: 'Смачні Дроби',
    icon: '🍕',
    blurb: 'Знайди зафарбовану частинку смаколика',
    intro:
      'Дроби — це рівні частинки цілого. Згори пишемо, скільки частинок взяли, а знизу — на скільки шматочків поділили. Знайди зафарбовану частинку!',
  },
  {
    id: MATH_SUB.multiply,
    label: 'Магія Множення',
    icon: '✖️',
    blurb: 'Таблиця множення як чарівна гра',
    intro:
      'Множення — це коли беремо однакові групи кілька разів. Наприклад, 3 рази по 2 — це дві, і ще дві, і ще дві. Порахуй, скільки всього!',
  },
];

/** Dispatches task generation to the right generator for the sub-category. */
function generateTask(config: TaskConfig): TaskInstance {
  if (config.subCategoryId === MATH_SUB.fractions) {
    return generateFraction(config);
  }
  return generateMentalMath(config);
}

/** Task-aware, encouraging explanation of how to solve the current task. */
function getHintSpeech(task: TaskInstance): string {
  const p = task.payload as MathPayload;
  if (p.kind === 'fraction') {
    return `Подивись на тарілочку. Згори — скільки шматочків зафарбовано, а знизу — на скільки поділили. Полічи і обери дріб ${p.filled} з ${p.denom}.`;
  }
  if (p.op === '×') {
    return `Полічи по рядочках: тут ${p.a} рядочки, у кожному по ${p.b}. Торкайся кружечків по одному і рахуй усі разом.`;
  }
  if (p.op === '-') {
    return `Візьми ${p.a} кубиків і прибери ${p.b}. Полічи кубики по одному — скільки залишилось?`;
  }
  return `Полічи кубики по одному: спочатку ${p.a}, а потім додай ще ${p.b}. Скільки вийшло разом?`;
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
  getHintSpeech,
};

// Self-register with the micro-kernel on import.
moduleRegistry.register(mathModule);
