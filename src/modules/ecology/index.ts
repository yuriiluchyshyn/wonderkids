import type { TaskInstance } from '@/core/kernel/types';
import type { TemplatePayload } from '@/core/templates/types';
import { shuffle } from '@/core/utils/random';
import { factPool } from '../shared/facts';
import { V4_RELEASE, card, defineTemplateModule, templateTask } from '../shared/templateModule';
import { RECYCLING_FACTS } from './facts';
import { ECO_QUESTIONS, QUESTIONS_PER_TOPIC, TOPIC_FACTS } from './questions';

/** Questions a path step adds: one of every topic. */
const QUESTIONS_PER_STEP = ECO_QUESTIONS.length / QUESTIONS_PER_TOPIC;

const BINS = [
  { id: 'glass', name: 'Скло', emoji: '🫙', no: 'Дзень! Це не скло.' },
  { id: 'paper', name: 'Папір', emoji: '📄', no: 'Шурх! Це не папір.' },
  { id: 'plastic', name: 'Пластик', emoji: '🧴', no: 'Ой! Це не пластик.' },
] as const;

/** Rubbish found on the meadow, with the marker clue the helper points out. */
const RUBBISH = [
  { id: 'bottle', name: 'скляна пляшка', emoji: '🍾', bin: 'glass', clue: 'Вона прозора, тверда і дзвенить — це скло.' },
  { id: 'newspaper', name: 'газета', emoji: '📰', bin: 'paper', clue: 'Її можна порвати і зім’яти — це папір.' },
  { id: 'cup', name: 'пластиковий стаканчик', emoji: '🥤', bin: 'plastic', clue: 'Він легкий і гнеться — це пластик.' },
  { id: 'box', name: 'картонна коробка', emoji: '📦', bin: 'paper', clue: 'Картон — це товстий папір.' },
  { id: 'jar', name: 'скляна банка', emoji: '🫙', bin: 'glass', clue: 'Банка прозора і важкенька — це скло.' },
  { id: 'shampoo', name: 'пляшка від шампуню', emoji: '🧴', bin: 'plastic', clue: 'Вона м’яка і не б’ється — це пластик.' },
  { id: 'envelope', name: 'конверт', emoji: '✉️', bin: 'paper', clue: 'Конверт зроблений з паперу.' },
  { id: 'glass', name: 'склянка', emoji: '🥛', bin: 'glass', clue: 'Склянка тверда і прозора — це скло.' },
  { id: 'bag', name: 'пластиковий пакет', emoji: '🛍️', bin: 'plastic', clue: 'Пакет тонкий і шелестить — це пластик.' },
  { id: 'notebook', name: 'старий зошит', emoji: '📓', bin: 'paper', clue: 'Сторінки зошита — це папір.' },
  { id: 'toothbrush', name: 'зубна щітка', emoji: '🪥', bin: 'plastic', clue: 'Ручка щітки зроблена з пластику.' },
  { id: 'perfume', name: 'флакон від парфумів', emoji: '🧪', bin: 'glass', clue: 'Флакон твердий і прозорий — це скло.' },
  { id: 'books', name: 'старі книжки', emoji: '📚', bin: 'paper', clue: 'Книжки надруковані на папері.' },
  { id: 'bucket', name: 'пластикове відерце', emoji: '🪣', bin: 'plastic', clue: 'Відерце легке і не б’ється — це пластик.' },
  { id: 'honey_jar', name: 'баночка від меду', emoji: '🍯', bin: 'glass', clue: 'Баночка важкенька, тверда і прозора — це скло.' },
  { id: 'shoe_box', name: 'коробка від взуття', emoji: '👟', bin: 'paper', clue: 'Коробка з картону, а картон — це товстий папір.' },
  { id: 'soap_bottle', name: 'флакон від рідкого мила', emoji: '🧼', bin: 'plastic', clue: 'Флакон легкий і пружний — це пластик.' },
  { id: 'lemonade', name: 'скляна пляшка від лимонаду', emoji: '🍶', bin: 'glass', clue: 'Вона дзвенить, якщо постукати, — це скло.' },
  { id: 'towel_roll', name: 'картонна втулка від рушників', emoji: '🧻', bin: 'paper', clue: 'Втулка з картону легко мнеться — це папір.' },
  { id: 'container', name: 'пластиковий контейнер', emoji: '🍱', bin: 'plastic', clue: 'Контейнер легкий і не б’ється — це пластик.' },
  { id: 'pickle_jar', name: 'банка від огірків', emoji: '🥒', bin: 'glass', clue: 'Банка прозора й тверда — це скло.' },
  { id: 'postcard', name: 'стара листівка', emoji: '💌', bin: 'paper', clue: 'Листівку можна зігнути й порвати — це папір.' },
  { id: 'duck', name: 'пластикова качечка', emoji: '🦆', bin: 'plastic', clue: 'Качечка легка, плаває і не б’ється — це пластик.' },
  { id: 'jam_jar', name: 'слоїк від варення', emoji: '🍓', bin: 'glass', clue: 'Слоїк твердий, прозорий і важкенький — це скло.' },
  { id: 'egg_tray', name: 'картонний лоток від яєць', emoji: '🥚', bin: 'paper', clue: 'Лоток зроблений із пресованого паперу.' },
  { id: 'straw', name: 'пластикова соломинка', emoji: '🧋', bin: 'plastic', clue: 'Соломинка легка і гнеться — це пластик.' },
  { id: 'oil_bottle', name: 'скляна пляшка від олії', emoji: '🫒', bin: 'glass', clue: 'Пляшка тверда і прозора — це скло.' },
  { id: 'calendar', name: 'старий календар', emoji: '📅', bin: 'paper', clue: 'Сторінки календаря — це папір.' },
  { id: 'cap', name: 'кришечка від пляшки', emoji: '🔘', bin: 'plastic', clue: 'Кришечка легка і тверда, але не б’ється — це пластик.' },
] as const;

/** Game 12 — «Сортування Сміття та Еко-патруль»: 3 bins. */
function recycling(step: number): TaskInstance<TemplatePayload>[] {
  const bins = BINS.map((b) => card(b.id, b.emoji, b.name));
  const wrongSay = Object.fromEntries(BINS.map((b) => [b.id, `${b.no} Спробуй інший бак!`]));
  return RUBBISH.map((r) =>
    templateTask(
      `bin:${r.id}`,
      `Куди викинути: ${r.name}?`,
      {
        template: 'UI_SORTER_BINS',
        item: card(r.id, r.emoji, r.name),
        bins,
        correctBinId: r.bin,
        wrongSay,
        hint: r.clue,
      },
      step,
      // Twelve stories per material: a replay tells the next one.
      RECYCLING_FACTS[r.bin],
    ),
  );
}

/**
 * «Чому так?» — why we look after nature. Each step unlocks six more
 * questions (one per topic); `recallLevel` mixes them with earlier ones.
 */
function whyQuestions(step: number): TaskInstance<TemplatePayload>[] {
  return ECO_QUESTIONS.slice(0, step * QUESTIONS_PER_STEP).map((q) =>
    templateTask(
      `eco:why:${q.id}`,
      q.question,
      {
        template: 'UI_GRID_CHOICE',
        cols: 2,
        stimulus: { emoji: q.emoji },
        options: shuffle([card('right', undefined, q.right), card('a', undefined, q.wrong[0]), card('b', undefined, q.wrong[1])]),
        correctId: 'right',
        hint: q.why,
      },
      step,
      factPool(q.why, TOPIC_FACTS[q.topic]),
    ),
  );
}

/** The cross-subject Ecology section (PRD v4.0 §4.3). */
export const ecologyModule = defineTemplateModule({
  id: 'ecology',
  title: 'Екологія',
  icon: '♻️',
  accent: '#22c55e',
  games: [
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
      pool: recycling,
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
      pool: whyQuestions,
    },
  ],
});
