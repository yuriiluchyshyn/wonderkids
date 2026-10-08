import { Mechanics } from '@/core/game/kernel/mechanics';
import { accusative } from '@/core/lang/uk';
import type { TaskInstance } from '@/core/game/kernel/types';
import type { TemplatePayload } from '@/core/game/templates/types';
import { shuffle } from '@/core/utils/random';
import { factPool } from '../shared/facts';
import { card, templateTask, type GameTasks } from '../shared/templateModule';
import { RECYCLING_FACTS } from './content/facts';
import { ECO_QUESTIONS, type EcoQuestion } from './content/questions';
import { MORE_RUBBISH } from './content/rubbish';

const BINS = [
  { id: 'glass', name: 'Скло', emoji: '🫙', no: 'Дзень! Це не скло.' },
  { id: 'paper', name: 'Папір', emoji: '📄', no: 'Шурх! Це не папір.' },
  { id: 'plastic', name: 'Пластик', emoji: '🧴', no: 'Ой! Це не пластик.' },
  { id: 'metal', name: 'Метал', emoji: '🥫', no: 'Дзинь! Це не метал.' },
  { id: 'organic', name: 'Органіка', emoji: '🍂', no: 'Хрум! Це не для компосту.' },
] as const;

/** What gives a material away — the helper's clue for the things of `content/rubbish.ts`. */
const CLUE: Record<(typeof BINS)[number]['id'], string> = {
  glass: 'Воно тверде, прозоре і дзвенить — це скло.',
  paper: 'Його можна порвати і зім’яти — це папір.',
  plastic: 'Воно легке, гнеться і не б’ється — це пластик.',
  metal: 'Воно тверде, блищить і брязкає — це метал.',
  organic: 'Це залишки рослин та їжі — вони перегниють у компості.',
};

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

/** Game 12 — «Сортування Сміття та Еко-патруль»: five bins, a hundred things to sort. */
function recycling(step: number): TaskInstance<TemplatePayload>[] {
  const bins = BINS.map((b) => card(b.id, b.emoji, b.name));
  const wrongSay = Object.fromEntries(BINS.map((b) => [b.id, `${b.no} Спробуй інший бак!`]));
  const all = [...RUBBISH, ...MORE_RUBBISH.map((r) => ({ ...r, clue: CLUE[r.bin] }))];
  // The stories about a material are dealt out among its things, one each:
  // no story is told for two different things.
  const dealt: Record<string, number> = {};
  return all.map((r) => {
    const story = RECYCLING_FACTS[r.bin][dealt[r.bin] ?? 0];
    dealt[r.bin] = (dealt[r.bin] ?? 0) + 1;
    return templateTask(
      `bin:${r.id}`,
      `Куди викинути ${accusative(r.name)}?`,
      {
        template: Mechanics.SorterBins,
        item: card(r.id, r.emoji, r.name),
        bins,
        correctBinId: r.bin,
        wrongSay,
        hint: r.clue,
      },
      step,
      factPool(`Так! ${r.name[0].toUpperCase()}${r.name.slice(1)} — у бак «${BINS.find((bin) => bin.id === r.bin)?.name}».`, story),
    );
  });
}

/** Answers on the board of «Чому так?» — nine, so the right one cannot be guessed. */
const CHOICES = 9;

/**
 * Eight wrong answers for a question: its own hand-written ones, then right
 * answers of questions about OTHER topics (an answer from the same topic
 * could happen to fit) and of the same kind — a "because…" among "because…"s.
 */
function wrongAnswers(q: EcoQuestion): string[] {
  const others = ECO_QUESTIONS.filter((o) => o.topic !== q.topic && o.right !== q.right);
  const sameKind = shuffle(others.filter((o) => o.kind === q.kind));
  const rest = shuffle(others.filter((o) => o.kind !== q.kind));
  return [...new Set([...q.wrong, ...sameKind.map((o) => o.right), ...rest.map((o) => o.right)])].slice(0, CHOICES - 1);
}

/**
 * «Чому так?» — why we look after nature. Every question has a level of its
 * own; a step opens the five of its level and `recallLevel` adds five from
 * the levels just behind it.
 */
function whyQuestions(step: number): TaskInstance<TemplatePayload>[] {
  return ECO_QUESTIONS.filter((q) => q.level <= step).map((q) =>
    templateTask(
      `eco:why:${q.id}`,
      q.question,
      {
        template: Mechanics.GridChoice,
        // Whole sentences: a list reads better than a 3×3 board.
        cols: 1,
        stimulus: { emoji: q.emoji },
        options: shuffle([card('right', undefined, q.right), ...wrongAnswers(q).map((text, i) => card(`w${i}`, undefined, text))]),
        correctId: 'right',
        hint: q.why,
      },
      step,
      q.why,
    ),
  );
}

/** Task generators of every game, by game id (the cards are in `config.ts`). */
export const TASKS: Record<string, GameTasks> = {
  recycling: { pool: recycling },
  why: { pool: whyQuestions },
};
