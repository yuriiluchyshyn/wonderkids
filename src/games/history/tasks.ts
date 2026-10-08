import { Mechanics } from '@/core/game/kernel/mechanics';
import { accusative, conjugate, inflect, lowerFirst, noun, verb } from '@/core/lang/uk';
import type { TaskInstance } from '@/core/game/kernel/types';
import type { TemplatePayload } from '@/core/game/templates/types';
import { shuffle } from '@/core/utils/random';
import { card, introSteps, templateTask, unlocked, withDistractors, type GameTasks } from '../shared/templateModule';
import { RECALL_WINDOW, composeLevel } from '@/core/game/engine/recall';
import { taskKey } from '@/core/game/engine/LevelEngine';
import {
  UA_FIGURES,
  UA_INVENTIONS,
  WORLD_FIGURES,
  WORLD_INVENTIONS,
  type Achiever,
  type Invention,
  WHO_ASK,
  PICTURED,
  UNPICTURED_INVENTIONS,
} from './content/data';
import { DINOSAURS } from './content/dinosaurs';
import { EARLIER, EPOCHS, EPOCH_ITEMS, SEQUENCES, WHEN } from './content/timeMachine';

type Tasks = TaskInstance<TemplatePayload>[];

const FAMOUS = verb('прославитися', ['прославиться', 'прославляться'], { perfective: true });
const CREATE = verb('створити', ['створить', 'створять'], { perfective: true });
const HE = noun('він', 'm', { animate: true });
const SHE = noun('вона', 'f', { animate: true });
const THEY = noun('вони', 'm', { animate: true, number: 'pl' });
/** «прославився», «прославилася», «прославилися» — by who it is said of. */
const becameFamous = (who?: 'she' | 'they') => conjugate(FAMOUS, 'past', who === 'she' ? SHE : who === 'they' ? THEY : HE);
/** «брати Райт», «конструктори Антонова»: a group is not a proper name inside a sentence. */
const inSentence = (name: string) => (/^(Брати|Конструктори) /.test(name) ? lowerFirst(name) : name);
/** The person's portrait — `public/people/<id>.webp` (sources in its CREDITS.md). */
const portrait = (p: Achiever) => `/people/${p.id}.webp`;
/** What the person is known for, as a real picture — `public/things/<id>.webp` — where there is one. */
const work = (p: Achiever) => (PICTURED.has(p.id) ? `/things/${p.id}.webp` : undefined);
/** The invention itself and the one who made it, as real pictures. */
const invented = (inv: Invention) => (UNPICTURED_INVENTIONS.has(inv.id) ? undefined : `/things/inv_${inv.id}.webp`);
const inventor = (inv: Invention) => (inv.face ? `/people/${inv.face}.webp` : undefined);
/** «створив» for one inventor, «створили» for several («Брати Райт», «… і …»). */
const created = (by: string) => conjugate(CREATE, 'past', / і |^Брати |^Конструктори /.test(by) ? THEY : HE);
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
      // «Чим нагодувати стегозавра?»
      `Чим нагодувати ${inflect(noun(lowerFirst(d.name), 'm', { animate: true }), 'acc')}?`,
      {
        template: Mechanics.SorterBins,
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
        template: Mechanics.GridChoice,
        cols: 2,
        stimulus: { emoji: d.eats === 'meat' ? '🦖' : '🦕' },
        options: withDistractors(d, DINOSAURS, 6, byId).map((o) => card(o.id, undefined, o.name)),
        correctId: d.id,
        hint: `Це ${d.eats === 'meat' ? 'хижак' : 'травоїдний динозавр'}. Його назва починається на літеру «${d.name[0]}».`,
      },
      step,
      `Це ${d.name}. ${d.feature}`,
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
        template: Mechanics.ChronoSequence,
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
        template: Mechanics.GridChoice,
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
      `${label} — коли це було?`,
      {
        template: Mechanics.SorterBins,
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
        template: Mechanics.GridChoice,
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
 * Games 15–16 — famous people, ranked by fame (see `data.ts`). Step N brings
 * the people of fame level N, each asked two ways (what are they known for /
 * who is known for this), and recalls people from the previous `RECALL_WINDOW`
 * steps — one of them as a "connect three" (UI_DRAG_MATCH).
 */
function figures(people: Achiever[], atStart: number, perStep: number) {
  const intro = introSteps(people.length, atStart, perStep);
  const fame = new Map(people.map((p, i) => [p.id, intro[i]]));
  const fameOf = (p: Achiever) => fame.get(p.id) ?? 1;
  const knownAt = (step: number) => people.filter((p) => fameOf(p) <= step);

  const knownFor = (p: Achiever, known: Achiever[], step: number) =>
    templateTask(
      `figure:${p.id}`,
      `Чим ${becameFamous(p.who)} ${inSentence(p.name)}?`,
      {
        template: Mechanics.GridChoice,
        cols: 2,
        stimulus: { emoji: p.face, image: portrait(p), caption: p.name },
        options: withDistractors(p, known, 4, byId).map((o) => ({ ...card(o.id, o.symbol, o.symbolName), image: work(o) })),
        correctId: p.id,
        hint: p.fact,
      },
      step,
      // The person's own story — nothing that would fit somebody else just as well.
      p.fact,
    );

  const whoIsIt = (p: Achiever, known: Achiever[], step: number) =>
    templateTask(
      `figure:who:${p.id}`,
      WHO_ASK[p.id] ?? `${p.symbolName} — хто цим прославився?`,
      {
        template: Mechanics.GridChoice,
        cols: 2,
        stimulus: { emoji: p.symbol, image: work(p), caption: p.symbolName },
        options: withDistractors(p, known, 4, byId).map((o) => ({ ...card(o.id, o.face, o.name), image: portrait(o) })),
        correctId: p.id,
        hint: `Ім’я цієї людини починається на літеру «${p.name[0]}».`,
      },
      step,
      // The person's own story — nothing that would fit somebody else just as well.
      p.fact,
    );

  const connect = (trio: Achiever[], step: number) =>
    templateTask(
      `figures:${trio.map((p) => p.id).sort().join('+')}`,
      'З’єднай людину з тим, чим вона прославилась',
      {
        template: Mechanics.DragMatch,
        items: shuffle(trio.map((p) => ({ ...card(p.id, p.face, p.name), image: portrait(p) }))),
        slots: shuffle(trio.map((p) => ({ ...card(`s_${p.id}`, p.symbol, p.symbolName), image: work(p) }))),
        pairs: Object.fromEntries(trio.map((p) => [p.id, `s_${p.id}`])),
        hint: trio[0].fact,
      },
      step,
      trio.map((p) => p.fact).join(' '),
    );

  return {
    steps: Math.max(...intro),
    pool: (step: number): Tasks => {
      const known = knownAt(step);
      return known.flatMap((p) => [knownFor(p, known, step), whoIsIt(p, known, step)]);
    },
    level: (step: number, count: number): Tasks => {
      const known = knownAt(step);
      const both = (p: Achiever) => shuffle([knownFor(p, known, step), whoIsIt(p, known, step)]);
      const fresh = shuffle(known.filter((p) => fameOf(p) === step).flatMap(both));

      const recent = shuffle(known.filter((p) => fameOf(p) < step && fameOf(p) >= step - RECALL_WINDOW)).map(both);
      const older = shuffle(known.filter((p) => fameOf(p) < step - RECALL_WINDOW)).map(both);
      const trio = shuffle(known.filter((p) => fameOf(p) < step)).slice(0, 3);
      return composeLevel(
        fresh,
        [
          ...(trio.length === 3 ? [connect(trio, step)] : []),
          // One question per recalled person first; their second one only if needed.
          ...recent.map((pair) => pair[0]),
          ...older.map((pair) => pair[0]),
          ...recent.map((pair) => pair[1]),
        ],
        count,
        taskKey,
      );
    },
  };
}

export const worldFigures = figures(WORLD_FIGURES, 5, 3);
export const uaFigures = figures(UA_FIGURES, 4, 1);

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
        // «Хто винайшов автомобіль?», «Хто винайшов гасову лампу?» — never a name glued on after a dash.
        inv.ask ?? `Хто винайшов ${accusative(lowerFirst(inv.name))}?`,
        {
          template: Mechanics.GridChoice,
          cols: 2,
          stimulus: { emoji: inv.emoji, image: invented(inv), caption: inv.name },
          options: withDistractors(inv, known, 4, byId).map((o) => ({ ...card(o.id, inventor(o) ? '🧑‍🔬' : undefined, o.by), image: inventor(o) })),
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
        `Що ${created(inv.by)} ${inSentence(inv.by)}?`,
        {
          template: Mechanics.GridChoice,
          cols: 2,
          options: withDistractors(inv, known, 4, byId).map((o) => ({ ...card(o.id, o.emoji, o.name), image: invented(o) })),
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

/** Task generators of every game, by game id (the cards are in `config.ts`). */
export const TASKS: Record<string, GameTasks> = {
  dinosaurs: { pool: dinosaurs },
  epochs: { pool: timeMachine },
  world_figures: { pool: worldFigures.pool, level: worldFigures.level },
  ua_figures: { pool: uaFigures.pool, level: uaFigures.level },
  inventions: { pool: inventions(WORLD_INVENTIONS, 10) },
  ua_inventions: { pool: inventions(UA_INVENTIONS, 10) },
};
