import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskInstance } from '@/core/game/kernel/types';
import type { TemplatePayload } from '@/core/game/templates/types';
import { shuffle } from '@/core/utils/random';
import { factPool } from '../shared/facts';
import { card, templateTask, withDistractors, type GameTasks } from '../shared/templateModule';
import { capitalise, clause, from, inflect, list, phrase } from '@/core/lang/uk';
import { MONTHS, MONTH_WORD, SEASONS, SEASON_FACTS, SIGNS, type Month, type SeasonId } from './content/data';

type Tasks = TaskInstance<TemplatePayload>[];
export const RELEASE = '2026-10-06T00:00:00Z';
const byId = <T extends { id: string }>(a: T, b: T) => a.id === b.id;
const seasonName = (id: SeasonId) => SEASONS.find((s) => s.id === id)?.name ?? '';
const monthsOf = (id: SeasonId) =>
  // In calendar order within the season: winter runs December → February.
  id === 'winter' ? [MONTHS[11], MONTHS[0], MONTHS[1]] : MONTHS.filter((m) => m.season === id);

/** A shuffled order that is guaranteed not to be already solved. */
function scramble(ids: string[]): string[] {
  for (let i = 0; i < 12; i += 1) {
    const order = shuffle(ids);
    if (order.some((id, at) => id !== ids[at])) return order;
  }
  return [...ids].reverse();
}

const monthOptions = (month: Month) => withDistractors(month, MONTHS, 4, byId).map((m) => card(m.id, m.emoji, m.name));

/**
 * «Пори року і місяці». The path adds one kind of question at a time:
 *   1  signs of the seasons (the first twelve)      UI_SORTER_BINS
 *   2  all signs                                    UI_SORTER_BINS
 *   3  which season is this month in                UI_SORTER_BINS
 *   4  which month comes next                       UI_GRID_CHOICE
 *   5  which month came before                      UI_GRID_CHOICE
 *   6  put a season's months in order               UI_CHRONO_SEQUENCE
 *   7  which month is the N-th of the year          UI_GRID_CHOICE
 *   8  the seasons in order, starting anywhere      UI_CHRONO_SEQUENCE
 * `recallLevel` turns that growth into "new + recalled" levels by itself.
 */
function seasons(step: number): Tasks {
  const bins = SEASONS.map((s) => card(s.id, s.emoji, s.name));
  const wrongSay = Object.fromEntries(SEASONS.map((s) => [s.id, s.no]));
  const tasks: Tasks = [];

  for (const [i, { emoji, what, season, fact }] of SIGNS.slice(0, step === 1 ? 12 : SIGNS.length).entries()) {
    tasks.push(
      templateTask(
        `season:sign:${i}`,
        // «Коли достигають кавуни?», «Коли ми ліпимо сніговика?»
        `Коли ${clause(what, 'present', { we: true })}?`,
        { template: Mechanics.SorterBins, item: card(`sign${i}`, emoji, capitalise(clause(what))), bins, correctBinId: season, wrongSay, hint: fact },
        step,
        fact,
      ),
    );
  }

  if (step >= 3) {
    for (const m of MONTHS) {
      tasks.push(
        templateTask(
          `season:month:${m.id}`,
          `До якої пори року належить ${m.name.toLowerCase()}?`,
          {
            template: Mechanics.SorterBins,
            item: card(m.id, m.emoji, m.name),
            bins,
            correctBinId: m.season,
            wrongSay,
            hint: `${m.name} — це ${seasonName(m.season).toLowerCase()}. ${SEASON_FACTS[m.season][0]}`,
          },
          step,
          m.fact,
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
          `Який місяць настає після ${m.after}?`,
          {
            template: Mechanics.GridChoice,
            cols: 2,
            stimulus: { emoji: m.emoji, caption: m.name },
            options: monthOptions(next),
            correctId: next.id,
            hint: `Згадай місяці по порядку: ${MONTHS[(i + 11) % 12].name.toLowerCase()}, ${m.name.toLowerCase()}, а далі…`,
          },
          step,
          factPool(`Після ${m.after} настає ${next.name.toLowerCase()}.`, next.fact),
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
          `Який місяць був перед ${m.before}?`,
          {
            template: Mechanics.GridChoice,
            cols: 2,
            stimulus: { emoji: m.emoji, caption: m.name },
            options: monthOptions(prev),
            correctId: prev.id,
            hint: `Згадай місяці по порядку. Після якого місяця настає ${m.name.toLowerCase()}?`,
          },
          step,
          factPool(`Перед ${m.before} був ${prev.name.toLowerCase()}.`, prev.fact),
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
          phrase('Постав {of~months} {months} по порядку. Перший місяць — на місце 1.', { of: s.of, months: MONTH_WORD }),
          {
            template: Mechanics.ChronoSequence,
            cards: months.map((m) => card(m.id, m.emoji, m.name)),
            initial: scramble(months.map((m) => m.id)),
            orientation: 'horizontal',
            ends: ['спочатку', 'наприкінці'],
            hint: `${s.name} починається ${from(months[0].after)}. Торкнись двох карток, щоб поміняти їх місцями.`,
          },
          step,
          factPool(`${s.name} — це ${list(months.map((m) => m.name.toLowerCase()))}.`, SEASON_FACTS[s.id]),
        ),
      );
    }
  }

  if (step >= 7) {
    const ORDINAL = ['перший', 'другий', 'третій', 'четвертий', 'п’ятий', 'шостий', 'сьомий', 'восьмий', 'дев’ятий', 'десятий', 'одинадцятий', 'дванадцятий'];
    for (const [i, m] of MONTHS.entries()) {
      tasks.push(
        templateTask(
          `month:number:${m.id}`,
          `Який місяць ${ORDINAL[i]} у році?`,
          {
            template: Mechanics.GridChoice,
            cols: 2,
            stimulus: { glyphs: [String(i + 1)] },
            options: monthOptions(m),
            correctId: m.id,
            hint: 'Рік починається із січня. Порахуй місяці по порядку: січень — перший, лютий — другий, березень — третій…',
          },
          step,
          factPool(`${m.name} — ${ORDINAL[i]} місяць року.`, m.fact),
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
          `Постав пори року по порядку. Почни ${from(inflect(first.word, 'gen'))}.`,
          {
            template: Mechanics.ChronoSequence,
            cards: order.map((s) => card(s.id, s.emoji, s.name)),
            initial: scramble(order.map((s) => s.id)),
            orientation: 'horizontal',
            ends: ['спочатку', 'наприкінці'],
            hint: 'Пори року йдуть по колу: зима, весна, літо, осінь — і знову зима.',
          },
          step,
          'Пори року йдуть по колу: зима, весна, літо, осінь — і знову зима.',
        ),
      );
    }
  }

  return tasks;
}

/** Task generators of every game, by game id (the cards are in `config.ts`). */
export const TASKS: Record<string, GameTasks> = {
  seasons: { pool: seasons },
};
