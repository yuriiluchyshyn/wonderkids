import type { TaskInstance } from '@/core/kernel/types';
import type { TemplatePayload } from '@/core/templates/types';
import { shuffle } from '@/core/utils/random';
import { factPool } from '../shared/facts';
import { card, defineTemplateModule, templateTask, withDistractors } from '../shared/templateModule';
import { MONTHS, SEASONS, SEASON_FACTS, SIGNS, type Month, type SeasonId } from './data';

type Tasks = TaskInstance<TemplatePayload>[];
const RELEASE = '2026-10-06T00:00:00Z';
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

  for (const [i, [emoji, label, season, fact]] of SIGNS.slice(0, step === 1 ? 12 : SIGNS.length).entries()) {
    tasks.push(
      templateTask(
        `season:sign:${i}`,
        `Коли це буває: ${label.toLowerCase()}?`,
        { template: 'UI_SORTER_BINS', item: card(`sign${i}`, emoji, label), bins, correctBinId: season, wrongSay, hint: fact },
        step,
        factPool(fact, SEASON_FACTS[season]),
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
            template: 'UI_SORTER_BINS',
            item: card(m.id, m.emoji, m.name),
            bins,
            correctBinId: m.season,
            wrongSay,
            hint: `${m.name} — це ${seasonName(m.season).toLowerCase()}. ${SEASON_FACTS[m.season][0]}`,
          },
          step,
          factPool(m.fact, SEASON_FACTS[m.season]),
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
            template: 'UI_GRID_CHOICE',
            cols: 2,
            stimulus: { emoji: m.emoji, caption: m.name },
            options: monthOptions(next),
            correctId: next.id,
            hint: `Згадай місяці по порядку: ${MONTHS[(i + 11) % 12].name.toLowerCase()}, ${m.name.toLowerCase()}, а далі…`,
          },
          step,
          factPool(`Після ${m.after} настає ${next.name.toLowerCase()}.`, next.fact, SEASON_FACTS[next.season]),
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
            template: 'UI_GRID_CHOICE',
            cols: 2,
            stimulus: { emoji: m.emoji, caption: m.name },
            options: monthOptions(prev),
            correctId: prev.id,
            hint: `Згадай місяці по порядку. Після якого місяця настає ${m.name.toLowerCase()}?`,
          },
          step,
          factPool(`Перед ${m.before} був ${prev.name.toLowerCase()}.`, prev.fact, SEASON_FACTS[prev.season]),
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
          `Постав місяці по порядку: ${s.name.toLowerCase()}. Перший місяць — на місце 1.`,
          {
            template: 'UI_CHRONO_SEQUENCE',
            cards: months.map((m) => card(m.id, m.emoji, m.name)),
            initial: scramble(months.map((m) => m.id)),
            orientation: 'horizontal',
            ends: ['спочатку', 'наприкінці'],
            hint: `${s.name} починається з місяця ${months[0].name.toLowerCase()}. Торкнись двох карток, щоб поміняти їх місцями.`,
          },
          step,
          factPool(`${s.name} — це ${months.map((m) => m.name.toLowerCase()).join(', ')}.`, SEASON_FACTS[s.id]),
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
            template: 'UI_GRID_CHOICE',
            cols: 2,
            stimulus: { glyphs: [String(i + 1)] },
            options: monthOptions(m),
            correctId: m.id,
            hint: 'Рік починається із січня. Порахуй місяці по порядку: січень — перший, лютий — другий, березень — третій…',
          },
          step,
          factPool(`${m.name} — ${ORDINAL[i]} місяць року.`, m.fact, SEASON_FACTS[m.season]),
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
          `Постав пори року по порядку. Почни з: ${first.name.toLowerCase()}.`,
          {
            template: 'UI_CHRONO_SEQUENCE',
            cards: order.map((s) => card(s.id, s.emoji, s.name)),
            initial: scramble(order.map((s) => s.id)),
            orientation: 'horizontal',
            ends: ['спочатку', 'наприкінці'],
            hint: 'Пори року йдуть по колу: зима, весна, літо, осінь — і знову зима.',
          },
          step,
          factPool('Пори року йдуть по колу: зима, весна, літо, осінь — і знову зима.', SEASON_FACTS[first.id]),
        ),
      );
    }
  }

  return tasks;
}

/** The Nature subject: what happens around us and when. */
export const natureModule = defineTemplateModule({
  id: 'nature',
  title: 'Природа',
  icon: '🌿',
  accent: '#16a34a',
  games: [
    {
      id: 'seasons',
      landmark: { name: 'Сад чотирьох пір року', emoji: '🌳', stages: [['❄️', 'Зимовий сад'], ['🌷', 'Весняний сад'], ['☀️', 'Літній сад'], ['🍂', 'Осінній сад']] },
      gameId: 'nature_seasons_months',
      label: 'Пори року і місяці',
      icon: '🍂',
      blurb: 'Що коли буває в природі й дванадцять місяців по порядку',
      intro:
        'У році чотири пори: зима, весна, літо й осінь, а в кожній — по три місяці. Подивись на картинку і покажи, коли це буває!',
      introFor: (step) => {
        if (step === 3) return 'Тепер познайомимось із місяцями. Їх у році дванадцять, і кожен належить до своєї пори року.';
        if (step === 4 || step === 5) return 'Місяці завжди йдуть один за одним. Згадай, який місяць сусідній!';
        if (step === 6 || step === 8) return 'Розстав картки по порядку. Торкнись двох карток, щоб поміняти їх місцями.';
        if (step === 7) return 'У кожного місяця є свій номер: січень — перший, а грудень — дванадцятий.';
        return undefined;
      },
      steps: 8,
      difficulty: 1,
      publishDate: RELEASE,
      mechanics: ['UI_SORTER_BINS', 'UI_GRID_CHOICE', 'UI_CHRONO_SEQUENCE'],
      hasText: true,
      pool: seasons,
    },
  ],
});
