import { ALPHABET, FEATURES, FIGURES, PLANETS } from '../content/data';
import { PLANET_QUIZ } from '../content/planetQuiz';
import type { AstronomyTexts } from './types';

/**
 * The Astronomy galaxy in Ukrainian — its original sentences, word for word.
 * The names of planets and constellations, the clues and the hundred quiz
 * questions are those written with the content itself (`content/`).
 */

const PLACE = ['перша', 'друга', 'третя', 'четверта', 'п’ята', 'шоста', 'сьома', 'восьма'];
const quiz = new Map(PLANET_QUIZ.map((q) => [q.id, q]));

export const uk: AstronomyTexts = {
  introFor: {
    planets: (step, quizFrom) => {
      if (step === 2) return 'Тепер далекі планети-велетні: Юпітер, Сатурн, Уран і Нептун.';
      if (step === 4) return 'Планети бувають маленькі й велетенські. Розстав їх за розміром: від найменшої до найбільшої!';
      if (step === 7) return 'Кожна планета чимось особлива. З’єднай підказку з планетою, про яку вона розповідає.';
      if (step === quizFrom) return 'Тепер — запитання про планети: де спекотно, а де холодно, де є вода, скільки триває день і рік. Торкнись планети, про яку йдеться!';
      return undefined;
    },
    constellations: (step, sky) => {
      if (step === 3) return 'Тепер рахунок починається не з одиниці. Знайди найменше число і йди далі по порядку.';
      if (step === 6) return 'Сузір’я стають більшими, а на зорях тепер літери. З’єднуй їх за абеткою!';
      if (step === 11) return 'Тепер рахуємо двійками: два, чотири, шість, вісім…';
      if (step === 13) return 'А тепер — десятками: десять, двадцять, тридцять…';
      if (step === sky + 1) return 'Тепер на небі багато зір, і на них немає чисел. Зорі сузір’я трохи більші за інші. Знайди їх і з’єднай пальцем!';
      if (step === sky + 7) return 'Зір на небі стало більше, а зорі сузір’я вже не такі великі. Придивляйся уважно!';
      if (step === sky + 13) return 'Найскладніше небо: зорі сузір’я лише трохи більші за інші.';
      return undefined;
    },
  },
  planet: (id) => PLANETS.find((p) => p.id === id)?.name ?? id,
  sun: 'Сонце',
  lineUp: {
    sun: {
      ask: 'Розстав планети: від найближчої до Сонця — до найдальшої.',
      ends: ['біля Сонця', 'найдалі'],
      hint: (first, all) => `Першою стоїть планета, найближча до Сонця: ${first}. Усі планети по порядку: ${all}.`,
      fact: (names) => `Від Сонця ці планети стоять так: ${names}.`,
    },
    size: {
      ask: 'Розстав планети за розміром: від найменшої до найбільшої.',
      ends: ['найменша', 'найбільша'],
      hint: (smallest, biggest) => `Найменша тут — ${smallest}, а найбільша — ${biggest}.`,
      fact: (names) => `Від найменшої до найбільшої: ${names}.`,
    },
  },
  feature: (id) => FEATURES.find((f) => f[0] === id)?.[3] ?? id,
  features: {
    ask: 'З’єднай кожну підказку з її планетою.',
    hint: (feature, planet) => `«${feature}» — це ${planet}.`,
    fact: (feature, planet) => `${feature} — це ${planet}.`,
  },
  quiz: (id) => ({ question: quiz.get(id)?.question ?? '', fact: quiz.get(id)?.fact ?? '' }),
  quizHint: (planet, place) => `Назва цієї планети починається на літеру «${planet[0]}». Від Сонця вона ${PLACE[place]}.`,
  alphabet: ALPHABET,
  figure: (at) => ({ name: FIGURES[at].name, fact: FIGURES[at].fact }),
  sky: {
    abc: (first, last) => `З’єднай зорі за абеткою: від ${first} до ${last}.`,
    order: (first, last) => `З’єднай зорі по порядку: від ${first} до ${last}.`,
    skip: (by, firstThree, last) => `З’єднай зорі, рахуючи ${by === 2 ? 'двійками' : 'десятками'}: ${firstThree} — і далі до ${last}.`,
    hintAbc: (first, firstFour) => `Почни із зорі ${first}. Далі йди за абеткою: ${firstFour}…`,
    hint: (first, nextThree) => `Почни із зорі ${first}. Далі: ${nextThree}…`,
    is: (at) => `Це сузір’я ${FIGURES[at].name}!`,
  },
  find: {
    ask: (at) => `Знайди на небі сузір’я ${FIGURES[at].name}. Його зорі трохи більші за інші — з’єднай їх пальцем.`,
    hint: (at, stars) => `У сузір’ї ${FIGURES[at].name} ${stars} зір. Вони блимають — торкнись кожної.`,
  },
};
