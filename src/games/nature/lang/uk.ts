import { capitalise, clause, from, inflect, list, phrase } from '@/core/lang/uk';
import { MONTHS, MONTH_WORD, SEASONS, SEASON_FACTS, SIGNS, type SeasonId } from '../content/data';
import type { NatureTexts } from './types';

/**
 * The Nature galaxy in Ukrainian — its original sentences, word for word,
 * built with the phrase engine from the words written with the content itself
 * (`content/data.ts`).
 */

const seasonOf = (id: SeasonId) => SEASONS.find((s) => s.id === id) ?? SEASONS[0];
const low = (at: number) => MONTHS[at].name.toLowerCase();
const ORDINAL = ['перший', 'другий', 'третій', 'четвертий', 'п’ятий', 'шостий', 'сьомий', 'восьмий', 'дев’ятий', 'десятий', 'одинадцятий', 'дванадцятий'];

export const uk: NatureTexts = {
  introFor: (step) => {
    if (step === 3) return 'Тепер познайомимось із місяцями. Їх у році дванадцять, і кожен належить до своєї пори року.';
    if (step === 4 || step === 5) return 'Місяці завжди йдуть один за одним. Згадай, який місяць сусідній!';
    if (step === 6 || step === 8) return 'Розстав картки по порядку. Торкнись двох карток, щоб поміняти їх місцями.';
    if (step === 7) return 'У кожного місяця є свій номер: січень — перший, а грудень — дванадцятий.';
    return undefined;
  },
  season: (id) => ({ name: seasonOf(id).name, no: seasonOf(id).no, facts: SEASON_FACTS[id] }),
  month: (at) => ({ name: MONTHS[at].name, fact: MONTHS[at].fact }),
  sign: (at) => ({ ask: `Коли ${clause(SIGNS[at].what, 'present', { we: true })}?`, label: capitalise(clause(SIGNS[at].what)), fact: SIGNS[at].fact }),
  monthSeason: {
    ask: (m) => `До якої пори року належить ${low(m)}?`,
    hint: (m, season) => `${MONTHS[m].name} — це ${seasonOf(season).name.toLowerCase()}. ${SEASON_FACTS[season][0]}`,
  },
  after: {
    ask: (m) => `Який місяць настає після ${MONTHS[m].after}?`,
    hint: (m) => `Згадай місяці по порядку: ${low((m + 11) % 12)}, ${low(m)}, а далі…`,
    fact: (m) => `Після ${MONTHS[m].after} настає ${low((m + 1) % 12)}.`,
  },
  before: {
    ask: (m) => `Який місяць був перед ${MONTHS[m].before}?`,
    hint: (m) => `Згадай місяці по порядку. Після якого місяця настає ${low(m)}?`,
    fact: (m) => `Перед ${MONTHS[m].before} був ${low((m + 11) % 12)}.`,
  },
  orderMonths: {
    ask: (season) => phrase('Постав {of~months} {months} по порядку. Перший місяць — на місце 1.', { of: seasonOf(season).of, months: MONTH_WORD }),
    hint: (season, first) => `${seasonOf(season).name} починається ${from(MONTHS[first].after)}. Торкнись двох карток, щоб поміняти їх місцями.`,
    fact: (season, months) => `${seasonOf(season).name} — це ${list(months.map(low))}.`,
  },
  ends: ['спочатку', 'наприкінці'],
  nth: {
    ask: (m) => `Який місяць ${ORDINAL[m]} у році?`,
    hint: 'Рік починається із січня. Порахуй місяці по порядку: січень — перший, лютий — другий, березень — третій…',
    fact: (m) => `${MONTHS[m].name} — ${ORDINAL[m]} місяць року.`,
  },
  orderSeasons: {
    ask: (first) => `Постав пори року по порядку. Почни ${from(inflect(seasonOf(first).word, 'gen'))}.`,
    circle: 'Пори року йдуть по колу: зима, весна, літо, осінь — і знову зима.',
  },
};
