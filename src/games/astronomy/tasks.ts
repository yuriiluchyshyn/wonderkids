import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskInstance } from '@/core/game/kernel/types';
import type { DotStar, TemplatePayload } from '@/core/game/templates/types';
import { shuffle } from '@/core/utils/random';
import { factPool } from '../shared/facts';
import { card, templateTask, type GameTasks } from '../shared/templateModule';
import { type Planet, PLANETS, SOLAR_FACTS, LINE_UPS, BY_SIZE, FEATURES, FEATURES_PER_STEP, planet, type Figure, type Labels, ALPHABET, SKY_FACTS, SKY_STEPS } from './content/data';

type Tasks = TaskInstance<TemplatePayload>[];

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
      cards: row.map((p) => card(p.id, p.emoji, p.name)),
      initial: scramble(row.map((p) => p.id)),
      orientation: 'horizontal',
      ends: kind === 'sun' ? ['біля Сонця', 'найдалі'] : ['найменша', 'найбільша'],
      hint:
        kind === 'sun'
          ? `Першою стоїть планета, найближча до Сонця: ${row[0].name}. Усі планети по порядку: ${PLANETS.map((p) => p.name).join(', ')}.`
          : `Найменша тут — ${row[0].name}, а найбільша — ${row[row.length - 1].name}.`,
    },
    step,
    factPool(kind === 'sun' ? `Від Сонця ці планети стоять так: ${names}.` : `Від найменшої до найбільшої: ${names}.`, SOLAR_FACTS),
  );
}

/**
 * «Парад Планет»: 1–3 the order from the Sun, 4–6 the order by size,
 * 7–10 what each planet is known for.
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
          slots: shuffle(slots.map((p) => card(p.id, p.emoji, p.name))),
          pairs: Object.fromEntries(set.map((f) => [`f:${f[0]}`, f[1]])),
          hint: `«${lead[3]}» — це ${planet(lead[1]).name}.`,
        },
        step,
        factPool(`${lead[3]} — це ${planet(lead[1]).name}.`, SOLAR_FACTS),
      ),
    );
  }
  return tasks;
}

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
    factPool(`Це сузір’я ${figure.name}!`, figure.fact, SKY_FACTS),
  );
}

/** «Космічний Навігатор»: every step draws three new constellations. */
function sky(step: number): Tasks {
  return SKY_STEPS.slice(0, step).flatMap((tasks) => tasks.map(([figure, labels]) => skyTask(figure, labels, step)));
}

/** Task generators of every game, by game id (the cards are in `config.ts`). */
export const TASKS: Record<string, GameTasks> = {
  planets: { pool: planets },
  constellations: { pool: sky },
};
