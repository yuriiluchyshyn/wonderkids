import type { TaskInstance } from '@/core/kernel/types';
import type { TemplatePayload } from '@/core/templates/types';
import { shuffle } from '@/core/utils/random';
import {
  V4_RELEASE,
  card,
  defineTemplateModule,
  templateTask,
  unlocked,
  withDistractors,
} from '../shared/templateModule';
import {
  UA_FIGURES,
  UA_INVENTIONS,
  WORLD_FIGURES,
  WORLD_INVENTIONS,
  type Achiever,
  type Invention,
} from './data';
import { DINOSAURS } from './dinosaurs';
import { EARLIER, EPOCHS, EPOCH_ITEMS, SEQUENCES, WHEN } from './timeMachine';

type Tasks = TaskInstance<TemplatePayload>[];
const byId = <T extends { id: string }>(a: T, b: T) => a.id === b.id;

/** A shuffled order that is guaranteed not to be already solved. */
function scramble(ids: string[]): string[] {
  for (let i = 0; i < 12; i += 1) {
    const order = shuffle(ids);
    if (order.some((id, at) => id !== ids[at])) return order;
  }
  return [...ids].reverse();
}

/**
 * Game 13 — «Динозаври»: fifty dinosaurs, two kinds of task each — feed it
 * (meat or plants) and "who is it?" from its most telling feature.
 */
function dinosaurs(step: number): Tasks {
  const bins = [card('meat', '🥩', "М'ясо"), card('plants', '🌿', 'Рослини')];
  const wrongSay = { meat: 'Фу, я таке не їм!', plants: 'Гр-р-р, мені б чогось ситнішого!' };

  const feeding: Tasks = DINOSAURS.map((d) =>
    templateTask(
      `dino:eat:${d.id}`,
      `Чим нагодувати: ${d.name}?`,
      {
        template: 'UI_SORTER_BINS',
        item: card(d.id, d.eats === 'meat' ? '🦖' : '🦕', d.name),
        bins,
        correctBinId: d.eats,
        wrongSay,
        hint:
          d.eats === 'meat'
            ? `${d.name} — хижак. У хижаків зуби гострі, як ножі: ними їдять м’ясо.`
            : `${d.name} — травоїдний. У травоїдних зуби пласкі: ними перетирають листя.`,
      },
      step,
      d.feature,
    ),
  );

  const whoIsIt: Tasks = DINOSAURS.map((d) =>
    templateTask(
      `dino:who:${d.id}`,
      `Хто це? ${d.feature}`,
      {
        template: 'UI_GRID_CHOICE',
        cols: 2,
        stimulus: { emoji: d.eats === 'meat' ? '🦖' : '🦕' },
        options: withDistractors(d, DINOSAURS, 4, byId).map((o) => card(o.id, undefined, o.name)),
        correctId: d.id,
        hint: `Це ${d.eats === 'meat' ? 'хижак' : 'травоїдний динозавр'}. Його назва починається на літеру «${d.name[0]}».`,
      },
      step,
      `Так, це ${d.name}!`,
    ),
  );

  return [...feeding, ...whoIsIt];
}

/**
 * Game 14 — «Часова Машина»: 100 time tasks of four kinds (see timeMachine.ts),
 * served at random. There is no difficulty ladder — it is free play, and every
 * solved task ends with a short story about what the child just placed in time.
 */
function timeMachine(step: number): Tasks {
  const sequences: Tasks = SEQUENCES.map(([topic, cards, story], i) =>
    templateTask(
      `tm:seq:${i}`,
      // The instruction comes first and never changes; the topic follows.
      `Постав по порядку: що було найраніше — на місце 1, що найпізніше — на останнє. ${topic}`,
      {
        template: 'UI_CHRONO_SEQUENCE',
        cards: cards.map(([emoji, label], c) => card(`c${c}`, emoji, label)),
        initial: scramble(cards.map((_, c) => `c${c}`)),
        orientation: 'horizontal',
        hint: 'Знайди найдавнішу картку і постав її на місце 1. Щоб поміняти дві картки місцями, торкнись однієї, а потім другої. Зеленим обведено ті, що вже стоять правильно.',
      },
      step,
      story,
    ),
  );

  const earlier: Tasks = EARLIER.map(([firstEmoji, first, laterEmoji, later, story], i) =>
    templateTask(
      `tm:first:${i}`,
      'Що з’явилося раніше?',
      {
        template: 'UI_GRID_CHOICE',
        cols: 2,
        options: shuffle([card('first', firstEmoji, first), card('later', laterEmoji, later)]),
        correctId: 'first',
        hint: `Подумай, без чого люди обходилися довше. ${first} — давніший винахід.`,
      },
      step,
      story,
    ),
  );

  const epochBins = EPOCHS.map((e) => card(e.id, e.emoji, e.name));
  const epochSay = Object.fromEntries(EPOCHS.map((e) => [e.id, e.no]));
  const epochs: Tasks = EPOCH_ITEMS.map(([emoji, label, epoch, story], i) =>
    templateTask(
      `tm:epoch:${i}`,
      `Коли це було: ${label}?`,
      {
        template: 'UI_SORTER_BINS',
        item: card(`item${i}`, emoji, label),
        bins: epochBins,
        correctBinId: epoch,
        wrongSay: epochSay,
        hint: `Це ${EPOCHS.find((e) => e.id === epoch)?.name}. ${story}`,
      },
      step,
      story,
    ),
  );

  const when: Tasks = WHEN.map(([question, emoji, correct, wrongA, wrongB, story], i) =>
    templateTask(
      `tm:when:${i}`,
      question,
      {
        template: 'UI_GRID_CHOICE',
        cols: 2,
        stimulus: { emoji },
        options: shuffle([card('right', undefined, correct), card('a', undefined, wrongA), card('b', undefined, wrongB)]),
        correctId: 'right',
        hint: story,
      },
      step,
      story,
    ),
  );

  return [...sequences, ...earlier, ...epochs, ...when];
}

/**
 * Games 15–16 — famous people: first pick a person's symbol out of four
 * (UI_GRID_CHOICE), later connect three people with their symbols at once
 * (UI_DRAG_MATCH).
 */
function figures(people: Achiever[], steps: number) {
  return (step: number): Tasks => {
    const known = unlocked(people, step, steps, 6);
    const choice: Tasks = known.map((p) =>
      templateTask(
        `figure:${p.id}`,
        `Чим прославився: ${p.name}?`,
        {
          template: 'UI_GRID_CHOICE',
          cols: 2,
          stimulus: { emoji: p.face, caption: p.name },
          options: withDistractors(p, known, 4, byId).map((o) => card(o.id, o.symbol, o.symbolName)),
          correctId: p.id,
          hint: p.fact,
        },
        step,
        p.fact,
      ),
    );
    if (step <= Math.ceil(steps / 2)) return choice;

    // Trios without a repeated symbol, so every connection is unambiguous.
    const trios: Tasks = [];
    const order = shuffle(known);
    for (let i = 0; i + 3 <= order.length; i += 3) {
      const trio = order.slice(i, i + 3);
      trios.push(
        templateTask(
          `figures:${trio.map((p) => p.id).sort().join('+')}`,
          'З’єднай людину з тим, чим вона прославилась',
          {
            template: 'UI_DRAG_MATCH',
            items: shuffle(trio.map((p) => card(p.id, p.face, p.name))),
            slots: shuffle(trio.map((p) => card(`s_${p.id}`, p.symbol, p.symbolName))),
            pairs: Object.fromEntries(trio.map((p) => [p.id, `s_${p.id}`])),
            hint: trio[0].fact,
          },
          step,
          trio.map((p) => p.fact).join(' '),
        ),
      );
    }
    return [...choice.slice(0, 4), ...trios];
  };
}

/**
 * Games 17–18 — inventions: "who made it?" (names) and, further along the
 * path, the reverse "what did they make?" (pictures).
 */
function inventions(list: Invention[], steps: number) {
  return (step: number): Tasks => {
    const known = unlocked(list, step, steps, 6);
    const whoMadeIt: Tasks = known.map((inv) =>
      templateTask(
        `inventor:${inv.id}`,
        `Хто це створив: ${inv.name}?`,
        {
          template: 'UI_GRID_CHOICE',
          cols: 2,
          stimulus: { emoji: inv.emoji, caption: inv.name },
          options: withDistractors(inv, known, 4, byId).map((o) => card(o.id, undefined, o.by)),
          correctId: inv.id,
          hint: inv.fact,
        },
        step,
        inv.fact,
      ),
    );
    if (step <= Math.ceil(steps / 2)) return whoMadeIt;

    const whatDidTheyMake: Tasks = known.map((inv) =>
      templateTask(
        `invention:${inv.id}`,
        `Що створив: ${inv.by}?`,
        {
          template: 'UI_GRID_CHOICE',
          cols: 2,
          options: withDistractors(inv, known, 4, byId).map((o) => card(o.id, o.emoji, o.name)),
          correctId: inv.id,
          hint: inv.fact,
        },
        step,
        inv.fact,
      ),
    );
    return [...whoMadeIt, ...whatDidTheyMake];
  };
}

/** The History subject (PRD v4.0 §4.4). */
export const historyModule = defineTemplateModule({
  id: 'history',
  title: 'Історія',
  icon: '🏛️',
  accent: '#f59e0b',
  games: [
    {
      id: 'dinosaurs',
    landmark: { name: 'Парк динозаврів', emoji: '🦖', stages: [['🥚', 'Яйце'], ['🦕', 'Диплодок'], ['🦖', 'Тиранозавр'], ['🌋', 'Парк динозаврів']] },
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
      mechanics: 'UI_SORTER_BINS',
      hasText: true,
      pool: dinosaurs,
    },
    {
      id: 'epochs',
      landmark: { name: 'Місто крізь віки', emoji: '⏳', stages: [['⛰️', 'Печера'], ['🐫', 'Піраміди'], ['🏰', 'Замок'], ['🏙️', 'Сучасне місто']] },
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
      mechanics: ['UI_CHRONO_SEQUENCE', 'UI_GRID_CHOICE', 'UI_SORTER_BINS'],
      hasText: true,
      pool: timeMachine,
    },
    {
      id: 'world_figures',
    landmark: { name: 'Музей великих людей', emoji: '🏛️', stages: [['🎭', 'Театр'], ['🔭', 'Обсерваторія'], ['🖼️', 'Галерея'], ['🏛️', 'Музей']] },
      gameId: 'hist_world_figures',
      label: 'Видатні Постаті Світу',
      icon: '🌟',
      blurb: 'Хто чим прославився',
      intro: 'Познайомся з людьми, які змінили світ: ученими, митцями і мандрівниками. З’єднай кожного з його справою.',
      steps: 10,
      difficulty: 1,
      publishDate: V4_RELEASE,
      tasksPerLevel: 6,
      mechanics: ['UI_DRAG_MATCH', 'UI_GRID_CHOICE'],
      hasText: true,
      pool: figures(WORLD_FIGURES, 10),
    },
    {
      id: 'ua_figures',
    landmark: { name: 'Алея слави України', emoji: '🇺🇦', stages: [['📖', 'Бібліотека'], ['🔔', 'Дзвіниця'], ['🚀', 'Космодром'], ['🇺🇦', 'Алея слави']] },
      gameId: 'hist_ua_figures',
      label: 'Видатні Постаті України',
      icon: '🇺🇦',
      blurb: 'Українці, якими ми пишаємось',
      intro: 'Україна має багато видатних людей: поетів, князів, учених і космонавтів. Дізнайся, чим вони прославились!',
      steps: 10,
      difficulty: 2,
      publishDate: V4_RELEASE,
      tasksPerLevel: 6,
      mechanics: ['UI_DRAG_MATCH', 'UI_GRID_CHOICE'],
      hasText: true,
      pool: figures(UA_FIGURES, 10),
    },
    {
      id: 'inventions',
    landmark: { name: 'Музей винаходів', emoji: '💡', stages: [['💡', 'Лампочка'], ['☎️', 'Телефон'], ['✈️', 'Літак'], ['🏭', 'Музей винаходів']] },
      gameId: 'hist_world_inventions',
      label: 'Видатні Винаходи Світу',
      icon: '💡',
      blurb: 'Хто що винайшов',
      intro: 'Лампочка, телефон, літак — усе це колись хтось придумав уперше. Знайди винахідника!',
      steps: 10,
      difficulty: 2,
      publishDate: V4_RELEASE,
      tasksPerLevel: 6,
      mechanics: ['UI_GRID_CHOICE', 'UI_DRAG_MATCH'],
      hasText: true,
      pool: inventions(WORLD_INVENTIONS, 10),
    },
    {
      id: 'ua_inventions',
    landmark: { name: 'Конструкторське бюро', emoji: '🚁', stages: [['🪔', 'Гасова лампа'], ['🚁', 'Гелікоптер'], ['✈️', 'Літак «Мрія»'], ['🏗️', 'Конструкторське бюро']] },
      gameId: 'hist_ua_inventions',
      label: 'Видатні Винаходи України',
      icon: '🚁',
      blurb: 'Що подарували світу українці',
      intro: 'Гелікоптер, гасова лампа, найбільший у світі літак — це все придумали в Україні. Знайомся з нашими винаходами!',
      steps: 10,
      difficulty: 2,
      publishDate: V4_RELEASE,
      tasksPerLevel: 6,
      mechanics: ['UI_GRID_CHOICE', 'UI_DRAG_MATCH'],
      hasText: true,
      pool: inventions(UA_INVENTIONS, 10),
    },
  ],
});
