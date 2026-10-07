import { V4_RELEASE, type GameCard, type SubjectDef } from '../shared/templateModule';
import { QUESTIONS_PER_TOPIC } from './content/questions';

/** The subject as the hub shows it. */
export const SUBJECT: SubjectDef = {
  id: 'ecology',
  title: 'Екологія',
  icon: '♻️',
  accent: '#22c55e',
};

/**
 * The games of this subject — their catalog cards, in the order the hub lists
 * them. How each game makes its tasks lives in `tasks.ts` under the same id.
 */
export const GAMES: GameCard[] = [
  {
    id: 'recycling',
    landmark: { name: 'Сміттєпереробний завод', emoji: '🏭', stages: [['🗑️', 'Сміттєві баки'], ['🚛', 'Сміттєвоз'], ['♻️', 'Пункт сортування'], ['🏭', 'Сміттєпереробний завод']] },
    gameId: 'eco_recycling_patrol',
    label: 'Еко-патруль',
    icon: '♻️',
    blurb: 'Сортуємо сміття: тридцять предметів — скло, папір, пластик',
    intro: 'Галявину треба прибрати! Скло, папір і пластик кидаємо в різні баки — тоді з них зроблять нові речі.',
    // No difficulty to grow here — open play, unlimited replays.
    progression: 'free',
    difficulty: 1,
    publishDate: V4_RELEASE,
    tasksPerLevel: 6,
    mechanics: 'UI_SORTER_BINS',
    hasText: true,
  },
  {
    id: 'why',
    landmark: { name: 'Заповідний парк', emoji: '🌳', stages: [['🌱', 'Саджанці'], ['🐝', 'Пасіка'], ['💧', 'Чисте джерело'], ['🌳', 'Заповідний парк']] },
    gameId: 'eco_why_questions',
    label: 'Чому так?',
    icon: '🌍',
    blurb: 'Чому тануть льодовики і чому не можна палити листя',
    intro:
      'Природі потрібна наша допомога. Послухай запитання і вибери відповідь — а я розповім, чому це важливо: про повітря, воду, тварин, сміття і тепло на планеті.',
    steps: QUESTIONS_PER_TOPIC,
    difficulty: [1, 2],
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: 'UI_GRID_CHOICE',
    hasText: true,
  },
];
