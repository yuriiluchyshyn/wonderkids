import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import type { Card, DotStar, TemplatePayload } from '@/core/game/templates/types';
import { shuffle } from '@/core/utils/random';
import { factPool } from '../shared/facts';
import { card, templateTask, withDistractors, type GameTasks } from '../shared/templateModule';
import { type Planet, PLANETS, LINE_UPS, BY_SIZE, FEATURES, FEATURES_PER_STEP, planet, type Figure, type Labels, SKY_STEPS, FIND_STEPS, FIND_TIERS, FIGURES } from './content/data';
import { PLANET_QUIZ, QUIZ_PER_STEP } from './content/planetQuiz';
import { astronomyTexts } from './lang';
import type { AstronomyTexts } from './lang/types';

type Tasks = TaskInstance<TemplatePayload>[];

/** A planet's card: drawn as it really looks and turning (the emoji is only the stand-in). */
type Texts = AstronomyTexts;
type Config = Pick<TaskConfig, 'lang'>;

const planetCard = (p: Planet, T: Texts): Card => ({ ...card(p.id, p.emoji, T.planet(p.id)), planet: p.id });

/** The step of «Парад Планет» on which the questions about the planets begin. */
export const QUIZ_FROM = 11;

/** A shuffled order that is guaranteed not to be already solved. */
function scramble(ids: string[]): string[] {
  for (let i = 0; i < 12; i += 1) {
    const order = shuffle(ids);
    if (order.some((id, at) => id !== ids[at])) return order;
  }
  return [...ids].reverse();
}

// ------------------------------------------------------------ Planet parade —

function lineUp(kind: 'sun' | 'size', order: Planet[], places: number[], step: number, T: Texts) {
  const row = places.map((i) => order[i]);
  const name = (p: Planet) => T.planet(p.id);
  const names = row.map(name).join(', ');
  const words = T.lineUp[kind];
  return templateTask(
    `${kind}:${row.map((p) => p.id).join('-')}`,
    words.ask,
    {
      template: Mechanics.ChronoSequence,
      cards: row.map((p) => planetCard(p, T)),
      initial: scramble(row.map((p) => p.id)),
      orientation: 'horizontal',
      ends: words.ends,
      // The help: the whole row, each planet in its own colours — the Sun first when counting from it.
      guide: kind === 'sun' ? [card('sun', '☀️', T.sun), ...PLANETS.map((p) => planetCard(p, T))] : BY_SIZE.map((p) => planetCard(p, T)),
      hint: kind === 'sun' ? T.lineUp.sun.hint(name(row[0]), PLANETS.map(name).join(', ')) : T.lineUp.size.hint(name(row[0]), name(row[row.length - 1])),
    },
    step,
    // Only what is about these very planets.
    words.fact(names),
  );
}

/**
 * «Парад Планет»: 1–3 the order from the Sun, 4–6 the order by size,
 * 7–10 what each planet is known for, and from 11 on — «На якій планеті…?»:
 * five new questions a step about heat and cold, water, days and years.
 */
function planets(step: number, config: Config): Tasks {
  const T = astronomyTexts(config.lang);
  const tasks: Tasks = [];
  LINE_UPS.slice(0, step).forEach((sets) => sets.forEach((places) => tasks.push(lineUp('sun', PLANETS, places, step, T))));
  LINE_UPS.slice(0, Math.max(0, step - 3)).forEach((sets) => sets.forEach((places) => tasks.push(lineUp('size', BY_SIZE, places, step, T))));

  const known = FEATURES.slice(0, Math.max(0, step - 6) * FEATURES_PER_STEP);
  for (const lead of known) {
    // Three features of three different planets.
    const set = [lead];
    for (const other of shuffle(known)) {
      if (set.length < 3 && !set.some((f) => f[1] === other[1])) set.push(other);
    }
    const slots = set.map((f) => planet(f[1]));
    tasks.push(
      templateTask(
        `feature:${lead[0]}`,
        T.features.ask,
        {
          template: Mechanics.DragMatch,
          items: shuffle(set.map((f) => card(`f:${f[0]}`, f[2], T.feature(f[0])))),
          slots: shuffle(slots.map((p) => planetCard(p, T))),
          pairs: Object.fromEntries(set.map((f) => [`f:${f[0]}`, f[1]])),
          hint: T.features.hint(T.feature(lead[0]), T.planet(lead[1])),
        },
        step,
        T.features.fact(T.feature(lead[0]), T.planet(lead[1])),
      ),
    );
  }
  const planetCards = PLANETS.map((p) => planetCard(p, T));
  for (const q of PLANET_QUIZ.slice(0, Math.max(0, step - QUIZ_FROM + 1) * QUIZ_PER_STEP)) {
    const right = planet(q.planet);
    tasks.push(
      templateTask(
        `quiz:${q.id}`,
        T.quiz(q.id).question,
        {
          template: Mechanics.GridChoice,
          cols: 3,
          options: withDistractors(planetCard(right, T), planetCards, 6, (a, b) => a.id === b.id),
          correctId: right.id,
          hint: T.quizHint(T.planet(right.id), PLANETS.indexOf(right)),
        },
        step,
        T.quiz(q.id).fact,
      ),
    );
  }
  return tasks;
}


// --------------------------------------------------------- Space navigator —

function skyTask(figure: Figure, labels: Labels, step: number, T: Texts) {
  const at = FIGURES.indexOf(figure);
  // An alphabet shorter than the Ukrainian one starts no later than lets the whole figure be lettered.
  const from = labels.kind === 'abc' ? Math.min(labels.start, T.alphabet.length - figure.stars.length) : 0;
  const text = figure.stars.map((_, i) => (labels.kind === 'abc' ? T.alphabet[from + i] : String(labels.start + i * labels.by)));
  const stars: DotStar[] = figure.stars.map(([x, y], i) => ({ x, y, label: text[i] }));
  const last = text[text.length - 1];
  const prompt =
    labels.kind === 'abc'
      ? T.sky.abc(text[0], last)
      : labels.by === 1
        ? T.sky.order(text[0], last)
        : T.sky.skip(labels.by, text.slice(0, 3).join(', '), last);
  return templateTask(
    // What is asked, not how it is lettered: the same in every language.
    `sky:${figure.name}:${labels.kind === 'abc' ? `abc${labels.start}` : `${labels.start}+${labels.by}`}`,
    prompt,
    {
      template: Mechanics.DotToDot,
      stars,
      figure: { name: T.figure(at).name, emoji: figure.emoji },
      hint:
        labels.kind === 'abc'
          ? T.sky.hintAbc(text[0], text.slice(0, 4).join(', '))
          : T.sky.hint(text[0], text.slice(1, 4).join(', ')),
    },
    step,
    // About this very constellation — never a general fact about the sky.
    factPool(T.sky.is(at), T.figure(at).fact),
  );
}

/** A small generator with a seed: a figure's sky must be the same every time it is drawn. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Other stars of the sky around a figure: never close to one of its stars or to each other. */
function decoysFor(figure: Figure, count: number, seed: number): { x: number; y: number }[] {
  const random = seeded(seed);
  const taken = figure.stars.map(([x, y]) => ({ x, y, gap: 11 }));
  const out: { x: number; y: number }[] = [];
  for (let tries = 0; out.length < count && tries < 4000; tries += 1) {
    const star = { x: 6 + random() * 88, y: 6 + random() * 88 };
    if (taken.some((t) => Math.hypot(t.x - star.x, t.y - star.y) < t.gap)) continue;
    taken.push({ ...star, gap: 8 });
    out.push(star);
  }
  return out;
}

/** «Знайди сузір’я»: the figure without labels, among other stars. */
function findTask(figure: Figure, tier: number, step: number, T: Texts) {
  const at = FIGURES.indexOf(figure);
  const { decoys, ratio } = FIND_TIERS[tier];
  return templateTask(
    `find:${figure.name}:${tier}`,
    T.find.ask(at),
    {
      template: Mechanics.DotToDot,
      stars: figure.stars.map(([x, y], i) => ({ x, y, label: String(i + 1) })),
      figure: { name: T.figure(at).name, emoji: figure.emoji },
      find: { decoys: decoysFor(figure, decoys, (FIGURES.indexOf(figure) + 1) * 97 + tier * 13), ratio },
      hint: T.find.hint(at, figure.stars.length),
    },
    step,
    factPool(T.sky.is(at), T.figure(at).fact),
  );
}

/**
 * «Космічний Навігатор»: every step draws three new constellations — first by
 * the labels on their stars, then (after the last labelled step) by finding
 * them in a sky full of other stars.
 */
function sky(step: number, config: Config): Tasks {
  const T = astronomyTexts(config.lang);
  const labelled = SKY_STEPS.slice(0, step).flatMap((tasks) => tasks.map(([figure, labels]) => skyTask(figure, labels, step, T)));
  const found = FIND_STEPS.slice(0, Math.max(0, step - SKY_STEPS.length)).flatMap((tasks) => tasks.map(([figure, tier]) => findTask(figure, tier, step, T)));
  return [...labelled, ...found];
}

/** Task generators of every game, by game id (the cards are in `config.ts`). */
export const TASKS: Record<string, GameTasks> = {
  planets: { pool: planets },
  constellations: { pool: sky },
};
