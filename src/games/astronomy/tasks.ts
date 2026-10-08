import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskInstance } from '@/core/game/kernel/types';
import type { Card, DotStar, TemplatePayload } from '@/core/game/templates/types';
import { shuffle } from '@/core/utils/random';
import { factPool } from '../shared/facts';
import { card, templateTask, withDistractors, type GameTasks } from '../shared/templateModule';
import { type Planet, PLANETS, LINE_UPS, BY_SIZE, FEATURES, FEATURES_PER_STEP, planet, type Figure, type Labels, ALPHABET, SKY_STEPS, FIND_STEPS, FIND_TIERS, FIGURES } from './content/data';
import { PLANET_QUIZ, QUIZ_PER_STEP } from './content/planetQuiz';

type Tasks = TaskInstance<TemplatePayload>[];

/** A planet's card: drawn as it really looks and turning (the emoji is only the stand-in). */
const planetCard = (p: Planet): Card => ({ ...card(p.id, p.emoji, p.name), planet: p.id });

/** The Sun, at the head of the row of planets shown as a hint. */
const SUN: Card = card('sun', '☀️', 'Сонце');
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

function lineUp(kind: 'sun' | 'size', order: Planet[], places: number[], step: number) {
  const row = places.map((i) => order[i]);
  const names = row.map((p) => p.name).join(', ');
  return templateTask(
    `${kind}:${row.map((p) => p.id).join('-')}`,
    kind === 'sun' ? 'Розстав планети: від найближчої до Сонця — до найдальшої.' : 'Розстав планети за розміром: від найменшої до найбільшої.',
    {
      template: Mechanics.ChronoSequence,
      cards: row.map((p) => planetCard(p)),
      initial: scramble(row.map((p) => p.id)),
      orientation: 'horizontal',
      ends: kind === 'sun' ? ['біля Сонця', 'найдалі'] : ['найменша', 'найбільша'],
      // The help: the whole row, each planet in its own colours — the Sun first when counting from it.
      guide: kind === 'sun' ? [SUN, ...PLANETS.map(planetCard)] : BY_SIZE.map(planetCard),
      hint:
        kind === 'sun'
          ? `Першою стоїть планета, найближча до Сонця: ${row[0].name}. Усі планети по порядку: ${PLANETS.map((p) => p.name).join(', ')}.`
          : `Найменша тут — ${row[0].name}, а найбільша — ${row[row.length - 1].name}.`,
    },
    step,
    // Only what is about these very planets.
    kind === 'sun' ? `Від Сонця ці планети стоять так: ${names}.` : `Від найменшої до найбільшої: ${names}.`,
  );
}

/**
 * «Парад Планет»: 1–3 the order from the Sun, 4–6 the order by size,
 * 7–10 what each planet is known for, and from 11 on — «На якій планеті…?»:
 * five new questions a step about heat and cold, water, days and years.
 */
function planets(step: number): Tasks {
  const tasks: Tasks = [];
  LINE_UPS.slice(0, step).forEach((sets) => sets.forEach((places) => tasks.push(lineUp('sun', PLANETS, places, step))));
  LINE_UPS.slice(0, Math.max(0, step - 3)).forEach((sets) => sets.forEach((places) => tasks.push(lineUp('size', BY_SIZE, places, step))));

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
        'З’єднай кожну підказку з її планетою.',
        {
          template: Mechanics.DragMatch,
          items: shuffle(set.map((f) => card(`f:${f[0]}`, f[2], f[3]))),
          slots: shuffle(slots.map((p) => planetCard(p))),
          pairs: Object.fromEntries(set.map((f) => [`f:${f[0]}`, f[1]])),
          hint: `«${lead[3]}» — це ${planet(lead[1]).name}.`,
        },
        step,
        `${lead[3]} — це ${planet(lead[1]).name}.`,
      ),
    );
  }
  const planetCards = PLANETS.map(planetCard);
  for (const q of PLANET_QUIZ.slice(0, Math.max(0, step - QUIZ_FROM + 1) * QUIZ_PER_STEP)) {
    const right = planet(q.planet);
    tasks.push(
      templateTask(
        `quiz:${q.id}`,
        q.question,
        {
          template: Mechanics.GridChoice,
          cols: 3,
          options: withDistractors(planetCard(right), planetCards, 6, (a, b) => a.id === b.id),
          correctId: right.id,
          hint: `Назва цієї планети починається на літеру «${right.name[0]}». Від Сонця вона ${PLACE[PLANETS.indexOf(right)]}.`,
        },
        step,
        q.fact,
      ),
    );
  }
  return tasks;
}

/** «перша», «друга»… — a planet's place counting from the Sun. */
const PLACE = ['перша', 'друга', 'третя', 'четверта', 'п’ята', 'шоста', 'сьома', 'восьма'];

// --------------------------------------------------------- Space navigator —

function skyTask(figure: Figure, labels: Labels, step: number) {
  const text = figure.stars.map((_, i) => (labels.kind === 'abc' ? ALPHABET[labels.start + i] : String(labels.start + i * labels.by)));
  const stars: DotStar[] = figure.stars.map(([x, y], i) => ({ x, y, label: text[i] }));
  const last = text[text.length - 1];
  const prompt =
    labels.kind === 'abc'
      ? `З’єднай зорі за абеткою: від ${text[0]} до ${last}.`
      : labels.by === 1
        ? `З’єднай зорі по порядку: від ${text[0]} до ${last}.`
        : `З’єднай зорі, рахуючи ${labels.by === 2 ? 'двійками' : 'десятками'}: ${text.slice(0, 3).join(', ')} — і далі до ${last}.`;
  return templateTask(
    `sky:${figure.name}:${text[0]}-${last}`,
    prompt,
    {
      template: Mechanics.DotToDot,
      stars,
      figure: { name: figure.name, emoji: figure.emoji },
      hint:
        labels.kind === 'abc'
          ? `Почни із зорі ${text[0]}. Далі йди за абеткою: ${text.slice(0, 4).join(', ')}…`
          : `Почни із зорі ${text[0]}. Далі: ${text.slice(1, 4).join(', ')}…`,
    },
    step,
    // About this very constellation — never a general fact about the sky.
    factPool(`Це сузір’я ${figure.name}!`, figure.fact),
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
function findTask(figure: Figure, tier: number, step: number) {
  const { decoys, ratio } = FIND_TIERS[tier];
  return templateTask(
    `find:${figure.name}:${tier}`,
    `Знайди на небі сузір’я ${figure.name}. Його зорі трохи більші за інші — з’єднай їх пальцем.`,
    {
      template: Mechanics.DotToDot,
      stars: figure.stars.map(([x, y], i) => ({ x, y, label: String(i + 1) })),
      figure: { name: figure.name, emoji: figure.emoji },
      find: { decoys: decoysFor(figure, decoys, (FIGURES.indexOf(figure) + 1) * 97 + tier * 13), ratio },
      hint: `У сузір’ї ${figure.name} ${figure.stars.length} зір. Вони блимають — торкнись кожної.`,
    },
    step,
    factPool(`Це сузір’я ${figure.name}!`, figure.fact),
  );
}

/**
 * «Космічний Навігатор»: every step draws three new constellations — first by
 * the labels on their stars, then (after the last labelled step) by finding
 * them in a sky full of other stars.
 */
function sky(step: number): Tasks {
  const labelled = SKY_STEPS.slice(0, step).flatMap((tasks) => tasks.map(([figure, labels]) => skyTask(figure, labels, step)));
  const found = FIND_STEPS.slice(0, Math.max(0, step - SKY_STEPS.length)).flatMap((tasks) => tasks.map(([figure, tier]) => findTask(figure, tier, step)));
  return [...labelled, ...found];
}

/** Task generators of every game, by game id (the cards are in `config.ts`). */
export const TASKS: Record<string, GameTasks> = {
  planets: { pool: planets },
  constellations: { pool: sky },
};
