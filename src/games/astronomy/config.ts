import { Mechanics } from '@/core/game/kernel/mechanics';
import { V6_RELEASE, type GameCard, type SubjectDef } from '../shared/templateModule';
import { SKY_STEPS } from './content/data';

/** The subject as the hub shows it. */
export const SUBJECT: SubjectDef = {
  id: 'astronomy',
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
    blurb: 'Розстав планети від Сонця та за розміром',
    intro: 'Навколо Сонця кружляють вісім планет. Розстав їх по порядку: спершу ту, що найближче до Сонця!',
    introFor: (step) => {
      if (step === 2) return 'Тепер далекі планети-велетні: Юпітер, Сатурн, Уран і Нептун.';
      if (step === 4) return 'Планети бувають маленькі й велетенські. Розстав їх за розміром: від найменшої до найбільшої!';
      if (step === 7) return 'Кожна планета чимось особлива. З’єднай підказку з планетою, про яку вона розповідає.';
      return undefined;
    },
    landmark: { name: 'Планетарій', emoji: '🪐' },
    steps: 10,
    difficulty: [1, 2],
    publishDate: V6_RELEASE,
    tasksPerLevel: 6,
    mechanics: [Mechanics.ChronoSequence, Mechanics.DragMatch],
    hasText: true,
  },
  {
    id: 'constellations',
    gameId: 'astro_space_navigator',
    label: 'Космічний Навігатор',
    icon: '✨',
    blurb: 'З’єднуй зорі по порядку й малюй сузір’я',
    intro: 'На небі зорі складаються в малюнки — сузір’я. Торкайся зір по порядку, від найменшого числа, — і побачиш, що вийде!',
    introFor: (step) => {
      if (step === 3) return 'Тепер рахунок починається не з одиниці. Знайди найменше число і йди далі по порядку.';
      if (step === 6) return 'Сузір’я стають більшими, а на зорях тепер літери. З’єднуй їх за абеткою!';
      if (step === 11) return 'Тепер рахуємо двійками: два, чотири, шість, вісім…';
      if (step === 13) return 'А тепер — десятками: десять, двадцять, тридцять…';
      return undefined;
    },
    landmark: { name: 'Обсерваторія', emoji: '🔭' },
    steps: SKY_STEPS.length,
    difficulty: [1, 2],
    publishDate: V6_RELEASE,
    tasksPerLevel: 5,
    mechanics: Mechanics.ChronoSequence,
  },
];
