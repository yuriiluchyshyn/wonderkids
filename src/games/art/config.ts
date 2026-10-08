import { Mechanics } from '@/core/game/kernel/mechanics';
import { V6_RELEASE, type GameCard, type SubjectDef } from '../shared/templateModule';
import { STEPS } from './content/data';

/** The subject as the hub shows it. */
export const SUBJECT: SubjectDef = {
  id: 'art',
  title: 'Творчість',
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
    label: 'Змішувач Кольорів',
    icon: '🎨',
    blurb: 'Змішуй фарби в казані й розфарбовуй малюнки',
    intro: 'Малюнок ще сірий — його треба розфарбувати! Вилий у чарівний казан дві фарби, щоб вийшов потрібний колір.',
    introFor: (step) => {
      if (step === 4) return 'Тепер є біла й чорна фарби. Біла робить колір світлішим, а чорна — темнішим.';
      if (step === 8) return 'Найскладніші кольори виходять, коли змішати вже готовий колір з іншим. Спробуй!';
      return undefined;
    },
    steps: STEPS.length,
    difficulty: [1, 2],
    publishDate: V6_RELEASE,
    tasksPerLevel: 6,
    mechanics: Mechanics.DragMatch,
    hasText: true,
  },
];
