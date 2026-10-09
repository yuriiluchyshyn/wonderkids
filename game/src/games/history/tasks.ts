import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import type { TemplatePayload } from '@/core/game/templates/types';
import { shuffle } from '@/core/utils/random';
import { card, introSteps, templateTask, unlocked, withDistractors, type GameTasks } from '../shared/templateModule';
import { RECALL_WINDOW, composeLevel } from '@/core/game/engine/recall';
import { taskKey } from '@/core/game/engine/LevelEngine';
import { UA_FIGURES, UA_INVENTIONS, WORLD_FIGURES, WORLD_INVENTIONS, type Achiever, type Invention, PICTURED, UNPICTURED_INVENTIONS } from './content/data';
import { DINOSAURS } from './content/dinosaurs';
import { PL_FIGURES, PL_INVENTIONS } from './content/poland';
import { EARLIER, EPOCHS, EPOCH_ITEMS, SEQUENCES, WHEN } from './content/timeMachine';
import { historyTexts } from './grammar';
import type { HistoryTexts } from './grammar/types';

type Tasks = TaskInstance<TemplatePayload>[];
type Config = Pick<TaskConfig, 'lang'>;

/** The people of the Polish games have no portraits of their own yet. */
const UNPORTRAYED = new Set(PL_FIGURES.filter((p) => !p.picture).map((p) => p.id));
const portrait = (p: Achiever) => (UNPORTRAYED.has(p.id) ? undefined : `/people/${p.picture ?? p.id}.webp`);
/** What the person is known for: a real picture where there is one, the emoji otherwise. */
const work = (p: Achiever) => (PICTURED.has(p.id) ? `/things/${p.id}.webp` : undefined);
const invented = (inv: Invention) => (UNPICTURED_INVENTIONS.has(inv.id) || inv.id.startsWith('pl_') ? undefined : `/things/inv_${inv.id}.webp`);
const inventor = (inv: Invention) => (inv.face ? `/people/${inv.face}.webp` : undefined);
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
function dinosaurs(step: number, config: Config): Tasks {
  const T = historyTexts(config.lang).dino;
  const bins = [card('meat', '🥩', T.meat), card('plants', '🌿', T.plants)];

  const feeding: Tasks = DINOSAURS.map((d) =>
    templateTask(
      `dino:eat:${d.id}`,
      T.ask(d.id),
      {
        template: Mechanics.SorterBins,
        item: card(d.id, d.eats === 'meat' ? '🦖' : '🦕', T.name(d.id)),
        bins,
        correctBinId: d.eats,
        wrongSay: T.no,
        hint: T.hint(d.id, d.eats),
      },
      step,
      T.feature(d.id),
    ),
  );

  const whoIsIt: Tasks = DINOSAURS.map((d) =>
    templateTask(
      `dino:who:${d.id}`,
      T.who(d.id),
      {
        template: Mechanics.GridChoice,
        cols: 2,
        stimulus: { emoji: d.eats === 'meat' ? '🦖' : '🦕' },
        options: withDistractors(d, DINOSAURS, 6, byId).map((o) => card(o.id, undefined, T.name(o.id))),
        correctId: d.id,
        hint: T.whoHint(d.id, d.eats),
      },
      step,
      T.yes(d.id),
    ),
  );

  return [...feeding, ...whoIsIt];
}

function timeMachine(step: number, config: Config): Tasks {
  const T = historyTexts(config.lang).time;
  const sequences: Tasks = SEQUENCES.map(([, cards], i) => {
    const words = T.sequence(i);
    return templateTask(
      `tm:seq:${i}`,
      words.ask,
      {
        template: Mechanics.ChronoSequence,
        cards: cards.map(([emoji], c) => card(`c${c}`, emoji, words.labels[c])),
        initial: scramble(cards.map((_, c) => `c${c}`)),
        orientation: 'horizontal',
        hint: T.sequenceHint,
      },
      step,
      words.story,
    );
  });

  const earlier: Tasks = EARLIER.map(([firstEmoji, , laterEmoji], i) => {
    const words = T.earlier(i);
    return templateTask(
      `tm:first:${i}`,
      T.earlierAsk,
      {
        template: Mechanics.GridChoice,
        cols: 2,
        options: shuffle([card('first', firstEmoji, words.first), card('later', laterEmoji, words.later)]),
        correctId: 'first',
        hint: words.hint,
      },
      step,
      words.story,
    );
  });

  const epochBins = EPOCHS.map((e) => card(e.id, e.emoji, T.epoch(e.id).name));
  const epochSay = Object.fromEntries(EPOCHS.map((e) => [e.id, T.epoch(e.id).no]));
  const epochs: Tasks = EPOCH_ITEMS.map(([emoji, , epoch], i) => {
    const words = T.item(i, epoch);
    return templateTask(
      `tm:epoch:${i}`,
      words.ask,
      {
        template: Mechanics.SorterBins,
        item: card(`item${i}`, emoji, words.label),
        bins: epochBins,
        correctBinId: epoch,
        wrongSay: epochSay,
        hint: words.hint,
      },
      step,
      words.story,
    );
  });

  const when: Tasks = WHEN.map(([, emoji], i) => {
    const words = T.when(i);
    return templateTask(
      `tm:when:${i}`,
      words.question,
      {
        template: Mechanics.GridChoice,
        cols: 2,
        stimulus: { emoji },
        options: shuffle([card('right', undefined, words.right), card('a', undefined, words.wrong[0]), card('b', undefined, words.wrong[1])]),
        correctId: 'right',
        hint: words.story,
      },
      step,
      words.story,
    );
  });

  return [...sequences, ...earlier, ...epochs, ...when];
}

function figures(people: Achiever[], atStart: number, perStep: number) {
  const intro = introSteps(people.length, atStart, perStep);
  const fame = new Map(people.map((p, i) => [p.id, intro[i]]));
  const fameOf = (p: Achiever) => fame.get(p.id) ?? 1;
  const knownAt = (step: number) => people.filter((p) => fameOf(p) <= step);

  const knownFor = (p: Achiever, known: Achiever[], step: number, T: HistoryTexts) =>
    templateTask(
      `figure:${p.id}`,
      T.person(p.id).ask,
      {
        template: Mechanics.GridChoice,
        cols: 2,
        stimulus: { emoji: p.face, image: portrait(p), caption: T.person(p.id).name },
        options: withDistractors(p, known, 4, byId).map((o) => ({ ...card(o.id, o.symbol, T.person(o.id).symbol), image: work(o) })),
        correctId: p.id,
        hint: T.person(p.id).fact,
      },
      step,
      T.person(p.id).fact,
    );

  const whoIsIt = (p: Achiever, known: Achiever[], step: number, T: HistoryTexts) =>
    templateTask(
      `figure:who:${p.id}`,
      T.person(p.id).who,
      {
        template: Mechanics.GridChoice,
        cols: 2,
        stimulus: { emoji: p.symbol, image: work(p), caption: T.person(p.id).symbol },
        options: withDistractors(p, known, 4, byId).map((o) => ({ ...card(o.id, o.face, T.person(o.id).name), image: portrait(o) })),
        correctId: p.id,
        hint: T.person(p.id).hint,
      },
      step,
      T.person(p.id).fact,
    );

  const connect = (trio: Achiever[], step: number, T: HistoryTexts) =>
    templateTask(
      `figures:${trio.map((p) => p.id).sort().join('+')}`,
      T.connectAsk,
      {
        template: Mechanics.DragMatch,
        items: shuffle(trio.map((p) => ({ ...card(p.id, p.face, T.person(p.id).name), image: portrait(p) }))),
        slots: shuffle(trio.map((p) => ({ ...card(`s_${p.id}`, p.symbol, T.person(p.id).symbol), image: work(p) }))),
        pairs: Object.fromEntries(trio.map((p) => [p.id, `s_${p.id}`])),
        hint: T.person(trio[0].id).fact,
      },
      step,
      trio.map((p) => T.person(p.id).fact).join(' '),
    );

  return {
    steps: Math.max(...intro),
    pool: (step: number, config: Config): Tasks => {
      const T = historyTexts(config.lang);
      const known = knownAt(step);
      return known.flatMap((p) => [knownFor(p, known, step, T), whoIsIt(p, known, step, T)]);
    },
    level: (step: number, count: number, config: Config): Tasks => {
      const T = historyTexts(config.lang);
      const known = knownAt(step);
      const both = (p: Achiever) => shuffle([knownFor(p, known, step, T), whoIsIt(p, known, step, T)]);
      const fresh = shuffle(known.filter((p) => fameOf(p) === step).flatMap(both));

      const recent = shuffle(known.filter((p) => fameOf(p) < step && fameOf(p) >= step - RECALL_WINDOW)).map(both);
      const older = shuffle(known.filter((p) => fameOf(p) < step - RECALL_WINDOW)).map(both);
      const trio = shuffle(known.filter((p) => fameOf(p) < step)).slice(0, 3);
      return composeLevel(
        fresh,
        [
          ...(trio.length === 3 ? [connect(trio, step, T)] : []),
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
export const plFigures = figures(PL_FIGURES, 4, 1);

/**
 * Games 17–18 — inventions: "who made it?" (names) and, further along the
 * path, the reverse "what did they make?" (pictures).
 */
function inventions(list: Invention[], steps: number) {
  return (step: number, config: Config): Tasks => {
    const T = historyTexts(config.lang);
    const known = unlocked(list, step, steps, 6);
    const whoMadeIt: Tasks = known.map((inv) =>
      templateTask(
        `inventor:${inv.id}`,
        // «Хто винайшов автомобіль?», «Хто винайшов гасову лампу?» — never a name glued on after a dash.
        T.invention(inv.id).ask,
        {
          template: Mechanics.GridChoice,
          cols: 2,
          stimulus: { emoji: inv.emoji, image: invented(inv), caption: T.invention(inv.id).name },
          options: withDistractors(inv, known, 4, byId).map((o) => ({ ...card(o.id, inventor(o) ? '🧑‍🔬' : undefined, T.invention(o.id).by), image: inventor(o) })),
          correctId: inv.id,
          hint: T.invention(inv.id).fact,
        },
        step,
        T.invention(inv.id).fact,
      ),
    );
    if (step <= Math.ceil(steps / 2)) return whoMadeIt;

    const whatDidTheyMake: Tasks = known.map((inv) =>
      templateTask(
        `invention:${inv.id}`,
        T.invention(inv.id).what,
        {
          template: Mechanics.GridChoice,
          cols: 2,
          options: withDistractors(inv, known, 4, byId).map((o) => ({ ...card(o.id, o.emoji, T.invention(o.id).name), image: invented(o) })),
          correctId: inv.id,
          hint: T.invention(inv.id).fact,
        },
        step,
        T.invention(inv.id).fact,
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
  pl_figures: { pool: plFigures.pool, level: plFigures.level },
  pl_inventions: { pool: inventions(PL_INVENTIONS, 10) },
};
