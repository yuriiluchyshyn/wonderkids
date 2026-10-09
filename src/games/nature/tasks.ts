import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import type { TemplatePayload } from '@/core/game/templates/types';
import { shuffle } from '@/core/utils/random';
import { factPool } from '../shared/facts';
import { card, templateTask, withDistractors, type GameTasks } from '../shared/templateModule';
import { MONTHS, SEASONS, SIGNS, type Month, type SeasonId } from './content/data';
import { natureTexts } from './lang';

type Tasks = TaskInstance<TemplatePayload>[];
export const RELEASE = '2026-10-06T00:00:00Z';
const byId = <T extends { id: string }>(a: T, b: T) => a.id === b.id;
const monthsOf = (id: SeasonId) =>
  id === 'winter' ? [MONTHS[11], MONTHS[0], MONTHS[1]] : MONTHS.filter((m) => m.season === id);

/** A wrong order to start from — never the right one. */
function scramble(ids: string[]): string[] {
  for (let i = 0; i < 12; i += 1) {
    const order = shuffle(ids);
    if (order.some((id, at) => id !== ids[at])) return order;
  }
  return [...ids].reverse();
}

/**
 * «Пори року і місяці»: what happens when, then the twelve months — their
 * season, their neighbours, their order, their number — and the seasons in a
 * circle. Every word comes from the language of the task (`lang/`).
 */
function seasons(step: number, config: Pick<TaskConfig, 'lang'>): Tasks {
  const T = natureTexts(config.lang);
  const at = (m: Month) => MONTHS.indexOf(m);
  const monthCard = (m: Month) => card(m.id, m.emoji, T.month(at(m)).name);
  const monthOptions = (month: Month) => withDistractors(month, MONTHS, 4, byId).map(monthCard);
  const bins = SEASONS.map((s) => card(s.id, s.emoji, T.season(s.id).name));
  const wrongSay = Object.fromEntries(SEASONS.map((s) => [s.id, T.season(s.id).no]));
  const tasks: Tasks = [];

  // Signs of a season — step 1 uses the twelve clearest ones.
  for (const [i, { emoji, season }] of SIGNS.slice(0, step === 1 ? 12 : SIGNS.length).entries()) {
    const { ask, label, fact } = T.sign(i);
    tasks.push(
      templateTask(
        `season:sign:${i}`,
        ask,
        { template: Mechanics.SorterBins, item: card(`sign${i}`, emoji, label), bins, correctBinId: season, wrongSay, hint: fact },
        step,
        fact,
      ),
    );
  }

  if (step >= 3) {
    for (const [i, m] of MONTHS.entries()) {
      tasks.push(
        templateTask(
          `season:month:${m.id}`,
          T.monthSeason.ask(i),
          { template: Mechanics.SorterBins, item: monthCard(m), bins, correctBinId: m.season, wrongSay, hint: T.monthSeason.hint(i, m.season) },
          step,
          T.month(i).fact,
        ),
      );
    }
  }

  if (step >= 4) {
    for (const [i, m] of MONTHS.entries()) {
      const next = MONTHS[(i + 1) % 12];
      tasks.push(
        templateTask(
          `month:next:${m.id}`,
          T.after.ask(i),
          {
            template: Mechanics.GridChoice,
            cols: 2,
            stimulus: { emoji: m.emoji, caption: T.month(i).name },
            options: monthOptions(next),
            correctId: next.id,
            hint: T.after.hint(i),
          },
          step,
          factPool(T.after.fact(i), T.month(at(next)).fact),
        ),
      );
    }
  }

  if (step >= 5) {
    for (const [i, m] of MONTHS.entries()) {
      const prev = MONTHS[(i + 11) % 12];
      tasks.push(
        templateTask(
          `month:prev:${m.id}`,
          T.before.ask(i),
          {
            template: Mechanics.GridChoice,
            cols: 2,
            stimulus: { emoji: m.emoji, caption: T.month(i).name },
            options: monthOptions(prev),
            correctId: prev.id,
            hint: T.before.hint(i),
          },
          step,
          factPool(T.before.fact(i), T.month(at(prev)).fact),
        ),
      );
    }
  }

  if (step >= 6) {
    for (const s of SEASONS) {
      const months = monthsOf(s.id);
      tasks.push(
        templateTask(
          `season:order:${s.id}`,
          T.orderMonths.ask(s.id),
          {
            template: Mechanics.ChronoSequence,
            cards: months.map(monthCard),
            initial: scramble(months.map((m) => m.id)),
            orientation: 'horizontal',
            ends: T.ends,
            hint: T.orderMonths.hint(s.id, at(months[0])),
          },
          step,
          // The season's first fact names its months — what this very sentence already says.
          factPool(T.orderMonths.fact(s.id, months.map(at)), T.season(s.id).facts.slice(1)),
        ),
      );
    }
  }

  if (step >= 7) {
    for (const [i, m] of MONTHS.entries()) {
      tasks.push(
        templateTask(
          `month:number:${m.id}`,
          T.nth.ask(i),
          {
            template: Mechanics.GridChoice,
            cols: 2,
            stimulus: { glyphs: [String(i + 1)] },
            options: monthOptions(m),
            correctId: m.id,
            hint: T.nth.hint,
          },
          step,
          factPool(T.nth.fact(i), T.month(i).fact),
        ),
      );
    }
  }

  if (step >= 8) {
    for (const [i, first] of SEASONS.entries()) {
      const order = [0, 1, 2, 3].map((k) => SEASONS[(i + k) % 4]);
      tasks.push(
        templateTask(
          `seasons:order:${first.id}`,
          T.orderSeasons.ask(first.id),
          {
            template: Mechanics.ChronoSequence,
            cards: order.map((s) => card(s.id, s.emoji, T.season(s.id).name)),
            initial: scramble(order.map((s) => s.id)),
            orientation: 'horizontal',
            ends: T.ends,
            hint: T.orderSeasons.circle,
          },
          step,
          T.orderSeasons.circle,
        ),
      );
    }
  }

  return tasks;
}

export const TASKS: Record<string, GameTasks> = {
  seasons: { pool: seasons },
};
