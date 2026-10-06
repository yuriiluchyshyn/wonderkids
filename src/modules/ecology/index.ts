import type { TaskInstance } from '@/core/kernel/types';
import type { TemplatePayload } from '@/core/templates/types';
import { V4_RELEASE, card, defineTemplateModule, templateTask } from '../shared/templateModule';

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
] as const;

const FACTS: Record<string, string> = {
  glass: 'Зі старого скла зроблять нові пляшки — і так можна безліч разів!',
  paper: 'З паперу зроблять нові зошити, і дерева залишаться рости.',
  plastic: 'З пластику зроблять нові іграшки, лавки і навіть одяг.',
};

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
      FACTS[r.bin],
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
      blurb: 'Сортуємо сміття: скло, папір, пластик',
      intro: 'Галявину треба прибрати! Скло, папір і пластик кидаємо в різні баки — тоді з них зроблять нові речі.',
      // No difficulty to grow here — open play, unlimited replays.
      progression: 'free',
      difficulty: 1,
      publishDate: V4_RELEASE,
      tasksPerLevel: 6,
      mechanics: 'UI_SORTER_BINS',
      hintDelaySec: 10,
      hasText: true,
      pool: recycling,
    },
  ],
});
