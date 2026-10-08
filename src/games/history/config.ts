import { Mechanics } from '@/core/game/kernel/mechanics';
import { V4_RELEASE, type GameCard, type SubjectDef } from '../shared/templateModule';
import { worldFigures, uaFigures } from './tasks';

/** The subject as the hub shows it. */
export const SUBJECT: SubjectDef = {
  id: 'history',
  title: 'Історія',
  icon: '🏛️',
  accent: '#f59e0b',
};

/**
 * The games of this subject — their catalog cards, in the order the hub lists
 * them. How each game makes its tasks lives in `tasks.ts` under the same id.
 */
export const GAMES: GameCard[] = [
  {
    id: 'dinosaurs',
    gameId: 'hist_dino_diet',
    label: 'Динозаври',
    icon: '🦖',
    blurb: 'П’ятдесят динозаврів: чим годувати і як упізнати',
    intro: 'Знайомся з динозаврами! Нагодуй кожного тим, що він їв, — м’ясом чи рослинами — і впізнай динозавра за його особливою прикметою.',
    // No difficulty to grow here — open play, unlimited replays.
    progression: 'free',
    difficulty: 1,
    publishDate: V4_RELEASE,
    tasksPerLevel: 6,
    mechanics: Mechanics.SorterBins,
    hasText: true,
  },
  {
    id: 'epochs',
    gameId: 'hist_time_machine',
    label: 'Часова Машина',
    icon: '⏳',
    blurb: 'Випадкові завдання про час: що було раніше, що пізніше',
    intro: 'Сідаймо в машину часу! Вона щоразу привозить нові завдання: розстав події по порядку, вгадай, що з’явилося раніше, і дізнайся, коли це було. Після кожного завдання — коротка історія.',
    // Random tasks from a big pool: nothing here gets "harder", so free play.
    progression: 'free',
    difficulty: 2,
    publishDate: V4_RELEASE,
    tasksPerLevel: 6,
    mechanics: [Mechanics.ChronoSequence, Mechanics.GridChoice, Mechanics.SorterBins],
    hasText: true,
  },
  {
    id: 'world_figures',
    gameId: 'hist_world_figures',
    label: 'Видатні Постаті Світу',
    icon: '🌟',
    blurb: 'Хто чим прославився',
    intro: 'Познайомся з людьми, які змінили світ: ученими, митцями і мандрівниками. На кожній сходинці — нові постаті, а знайомі повертаються, щоб ти їх не забув.',
    steps: worldFigures.steps,
    difficulty: 1,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: [Mechanics.DragMatch, Mechanics.GridChoice],
    hasText: true,
  },
  {
    id: 'ua_figures',
    gameId: 'hist_ua_figures',
    label: 'Видатні Постаті України',
    icon: '🇺🇦',
    blurb: 'Українці, якими ми пишаємось',
    intro: 'Україна має багато видатних людей: поетів, князів, учених і космонавтів. Дізнайся, чим вони прославились!',
    steps: uaFigures.steps,
    difficulty: 2,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: [Mechanics.DragMatch, Mechanics.GridChoice],
    hasText: true,
  },
  {
    id: 'inventions',
    gameId: 'hist_world_inventions',
    label: 'Видатні Винаходи Світу',
    icon: '💡',
    blurb: 'Хто що винайшов',
    intro: 'Лампочка, телефон, літак — усе це колись хтось придумав уперше. Знайди винахідника!',
    steps: 10,
    difficulty: 2,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: [Mechanics.GridChoice, Mechanics.DragMatch],
    hasText: true,
  },
  {
    id: 'ua_inventions',
    gameId: 'hist_ua_inventions',
    label: 'Видатні Винаходи України',
    icon: '🚁',
    blurb: 'Що подарували світу українці',
    intro: 'Гелікоптер, гасова лампа, найбільший у світі літак — це все придумали в Україні. Знайомся з нашими винаходами!',
    steps: 10,
    difficulty: 2,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: [Mechanics.GridChoice, Mechanics.DragMatch],
    hasText: true,
  },
];
