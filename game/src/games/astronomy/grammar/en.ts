import { ordinalWords } from '@/core/language/en';
import type { AstronomyTexts } from '@/games/astronomy/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/en/games/astronomy.json';

/** The Astronomy galaxy in English. */

const PLANETS: Record<string, string> = J.PLANETS;

const FEATURES: Record<string, string> = J.FEATURES;

/** The constellations, in the order of `FIGURES`: as it stands in a sentence, and what is told about it. */
const FIGURES: [name: string, fact: string][] = [
  [J.FIGURES[0][0], J.FIGURES[0][1]],
  [J.FIGURES[1][0], J.FIGURES[1][1]],
  [J.FIGURES[2][0], J.FIGURES[2][1]],
  [J.FIGURES[3][0], J.FIGURES[3][1]],
  [J.FIGURES[4][0], J.FIGURES[4][1]],
  [J.FIGURES[5][0], J.FIGURES[5][1]],
  [J.FIGURES[6][0], J.FIGURES[6][1]],
  [J.FIGURES[7][0], J.FIGURES[7][1]],
  [J.FIGURES[8][0], J.FIGURES[8][1]],
  [J.FIGURES[9][0], J.FIGURES[9][1]],
  [J.FIGURES[10][0], J.FIGURES[10][1]],
  [J.FIGURES[11][0], J.FIGURES[11][1]],
  [J.FIGURES[12][0], J.FIGURES[12][1]],
  [J.FIGURES[13][0], J.FIGURES[13][1]],
  [J.FIGURES[14][0], J.FIGURES[14][1]],
  [J.FIGURES[15][0], J.FIGURES[15][1]],
  [J.FIGURES[16][0], J.FIGURES[16][1]],
];

type Row = [question: string, fact: string];
/** The hundred questions of the planet quiz, in the order of `content/planetQuiz.ts`. */
const QUIZ: Record<string, Row[]> = {
  mercury: [
    [J.QUIZ.mercury[0][0], J.QUIZ.mercury[0][1]],
    [J.QUIZ.mercury[1][0], J.QUIZ.mercury[1][1]],
    [J.QUIZ.mercury[2][0], J.QUIZ.mercury[2][1]],
    [J.QUIZ.mercury[3][0], J.QUIZ.mercury[3][1]],
    [J.QUIZ.mercury[4][0], J.QUIZ.mercury[4][1]],
    [J.QUIZ.mercury[5][0], J.QUIZ.mercury[5][1]],
    [J.QUIZ.mercury[6][0], J.QUIZ.mercury[6][1]],
    [J.QUIZ.mercury[7][0], J.QUIZ.mercury[7][1]],
    [J.QUIZ.mercury[8][0], J.QUIZ.mercury[8][1]],
    [J.QUIZ.mercury[9][0], J.QUIZ.mercury[9][1]],
    [J.QUIZ.mercury[10][0], J.QUIZ.mercury[10][1]],
    [J.QUIZ.mercury[11][0], J.QUIZ.mercury[11][1]],
  ],
  venus: [
    [J.QUIZ.venus[0][0], J.QUIZ.venus[0][1]],
    [J.QUIZ.venus[1][0], J.QUIZ.venus[1][1]],
    [J.QUIZ.venus[2][0], J.QUIZ.venus[2][1]],
    [J.QUIZ.venus[3][0], J.QUIZ.venus[3][1]],
    [J.QUIZ.venus[4][0], J.QUIZ.venus[4][1]],
    [J.QUIZ.venus[5][0], J.QUIZ.venus[5][1]],
    [J.QUIZ.venus[6][0], J.QUIZ.venus[6][1]],
    [J.QUIZ.venus[7][0], J.QUIZ.venus[7][1]],
    [J.QUIZ.venus[8][0], J.QUIZ.venus[8][1]],
    [J.QUIZ.venus[9][0], J.QUIZ.venus[9][1]],
    [J.QUIZ.venus[10][0], J.QUIZ.venus[10][1]],
    [J.QUIZ.venus[11][0], J.QUIZ.venus[11][1]],
  ],
  earth: [
    [J.QUIZ.earth[0][0], J.QUIZ.earth[0][1]],
    [J.QUIZ.earth[1][0], J.QUIZ.earth[1][1]],
    [J.QUIZ.earth[2][0], J.QUIZ.earth[2][1]],
    [J.QUIZ.earth[3][0], J.QUIZ.earth[3][1]],
    [J.QUIZ.earth[4][0], J.QUIZ.earth[4][1]],
    [J.QUIZ.earth[5][0], J.QUIZ.earth[5][1]],
    [J.QUIZ.earth[6][0], J.QUIZ.earth[6][1]],
    [J.QUIZ.earth[7][0], J.QUIZ.earth[7][1]],
    [J.QUIZ.earth[8][0], J.QUIZ.earth[8][1]],
    [J.QUIZ.earth[9][0], J.QUIZ.earth[9][1]],
    [J.QUIZ.earth[10][0], J.QUIZ.earth[10][1]],
    [J.QUIZ.earth[11][0], J.QUIZ.earth[11][1]],
    [J.QUIZ.earth[12][0], J.QUIZ.earth[12][1]],
  ],
  mars: [
    [J.QUIZ.mars[0][0], J.QUIZ.mars[0][1]],
    [J.QUIZ.mars[1][0], J.QUIZ.mars[1][1]],
    [J.QUIZ.mars[2][0], J.QUIZ.mars[2][1]],
    [J.QUIZ.mars[3][0], J.QUIZ.mars[3][1]],
    [J.QUIZ.mars[4][0], J.QUIZ.mars[4][1]],
    [J.QUIZ.mars[5][0], J.QUIZ.mars[5][1]],
    [J.QUIZ.mars[6][0], J.QUIZ.mars[6][1]],
    [J.QUIZ.mars[7][0], J.QUIZ.mars[7][1]],
    [J.QUIZ.mars[8][0], J.QUIZ.mars[8][1]],
    [J.QUIZ.mars[9][0], J.QUIZ.mars[9][1]],
    [J.QUIZ.mars[10][0], J.QUIZ.mars[10][1]],
    [J.QUIZ.mars[11][0], J.QUIZ.mars[11][1]],
    [J.QUIZ.mars[12][0], J.QUIZ.mars[12][1]],
  ],
  jupiter: [
    [J.QUIZ.jupiter[0][0], J.QUIZ.jupiter[0][1]],
    [J.QUIZ.jupiter[1][0], J.QUIZ.jupiter[1][1]],
    [J.QUIZ.jupiter[2][0], J.QUIZ.jupiter[2][1]],
    [J.QUIZ.jupiter[3][0], J.QUIZ.jupiter[3][1]],
    [J.QUIZ.jupiter[4][0], J.QUIZ.jupiter[4][1]],
    [J.QUIZ.jupiter[5][0], J.QUIZ.jupiter[5][1]],
    [J.QUIZ.jupiter[6][0], J.QUIZ.jupiter[6][1]],
    [J.QUIZ.jupiter[7][0], J.QUIZ.jupiter[7][1]],
    [J.QUIZ.jupiter[8][0], J.QUIZ.jupiter[8][1]],
    [J.QUIZ.jupiter[9][0], J.QUIZ.jupiter[9][1]],
    [J.QUIZ.jupiter[10][0], J.QUIZ.jupiter[10][1]],
    [J.QUIZ.jupiter[11][0], J.QUIZ.jupiter[11][1]],
    [J.QUIZ.jupiter[12][0], J.QUIZ.jupiter[12][1]],
  ],
  saturn: [
    [J.QUIZ.saturn[0][0], J.QUIZ.saturn[0][1]],
    [J.QUIZ.saturn[1][0], J.QUIZ.saturn[1][1]],
    [J.QUIZ.saturn[2][0], J.QUIZ.saturn[2][1]],
    [J.QUIZ.saturn[3][0], J.QUIZ.saturn[3][1]],
    [J.QUIZ.saturn[4][0], J.QUIZ.saturn[4][1]],
    [J.QUIZ.saturn[5][0], J.QUIZ.saturn[5][1]],
    [J.QUIZ.saturn[6][0], J.QUIZ.saturn[6][1]],
    [J.QUIZ.saturn[7][0], J.QUIZ.saturn[7][1]],
    [J.QUIZ.saturn[8][0], J.QUIZ.saturn[8][1]],
    [J.QUIZ.saturn[9][0], J.QUIZ.saturn[9][1]],
    [J.QUIZ.saturn[10][0], J.QUIZ.saturn[10][1]],
    [J.QUIZ.saturn[11][0], J.QUIZ.saturn[11][1]],
    [J.QUIZ.saturn[12][0], J.QUIZ.saturn[12][1]],
  ],
  uranus: [
    [J.QUIZ.uranus[0][0], J.QUIZ.uranus[0][1]],
    [J.QUIZ.uranus[1][0], J.QUIZ.uranus[1][1]],
    [J.QUIZ.uranus[2][0], J.QUIZ.uranus[2][1]],
    [J.QUIZ.uranus[3][0], J.QUIZ.uranus[3][1]],
    [J.QUIZ.uranus[4][0], J.QUIZ.uranus[4][1]],
    [J.QUIZ.uranus[5][0], J.QUIZ.uranus[5][1]],
    [J.QUIZ.uranus[6][0], J.QUIZ.uranus[6][1]],
    [J.QUIZ.uranus[7][0], J.QUIZ.uranus[7][1]],
    [J.QUIZ.uranus[8][0], J.QUIZ.uranus[8][1]],
    [J.QUIZ.uranus[9][0], J.QUIZ.uranus[9][1]],
    [J.QUIZ.uranus[10][0], J.QUIZ.uranus[10][1]],
  ],
  neptune: [
    [J.QUIZ.neptune[0][0], J.QUIZ.neptune[0][1]],
    [J.QUIZ.neptune[1][0], J.QUIZ.neptune[1][1]],
    [J.QUIZ.neptune[2][0], J.QUIZ.neptune[2][1]],
    [J.QUIZ.neptune[3][0], J.QUIZ.neptune[3][1]],
    [J.QUIZ.neptune[4][0], J.QUIZ.neptune[4][1]],
    [J.QUIZ.neptune[5][0], J.QUIZ.neptune[5][1]],
    [J.QUIZ.neptune[6][0], J.QUIZ.neptune[6][1]],
    [J.QUIZ.neptune[7][0], J.QUIZ.neptune[7][1]],
    [J.QUIZ.neptune[8][0], J.QUIZ.neptune[8][1]],
    [J.QUIZ.neptune[9][0], J.QUIZ.neptune[9][1]],
    [J.QUIZ.neptune[10][0], J.QUIZ.neptune[10][1]],
    [J.QUIZ.neptune[11][0], J.QUIZ.neptune[11][1]],
    [J.QUIZ.neptune[12][0], J.QUIZ.neptune[12][1]],
  ],
};

const cap = (text: string) => text[0].toUpperCase() + text.slice(1);
/** «the Big Dipper» → «Big Dipper», for a card. */
const bare = (name: string) => cap(name.replace(/^the /, ''));

export const en: AstronomyTexts = {
  cards: J.cards,
  introFor: {
    planets: (step, quizFrom) => {
      if (step === 2) return J.introFor.planets[1];
      if (step === 4) return J.introFor.planets[2];
      if (step === 7) return J.introFor.planets[3];
      if (step === quizFrom) return J.introFor.planets[4];
      return undefined;
    },
    constellations: (step, sky) => {
      if (step === 3) return J.introFor.constellations[1];
      if (step === 6) return J.introFor.constellations[2];
      if (step === 11) return J.introFor.constellations[3];
      if (step === 13) return J.introFor.constellations[4];
      if (step === sky + 1) return J.introFor.constellations[5];
      if (step === sky + 7) return J.introFor.constellations[6];
      if (step === sky + 13) return J.introFor.constellations[7];
      return undefined;
    },
  },
  planet: (id) => PLANETS[id] ?? id,
  sun: J.sun,
  lineUp: {
    sun: {
      ask: J.lineUp.sun.ask,
      ends: [J.lineUp.sun.ends[0], J.lineUp.sun.ends[1]],
      hint: (first, all) => fill(J.lineUp.sun.hint, { first, all }),
      fact: (names) => fill(J.lineUp.sun.fact, { names }),
    },
    size: {
      ask: J.lineUp.size.ask,
      ends: [J.lineUp.size.ends[0], J.lineUp.size.ends[1]],
      hint: (smallest, biggest) => fill(J.lineUp.size.hint, { smallest, biggest }),
      fact: (names) => fill(J.lineUp.size.fact, { names }),
    },
  },
  feature: (id) => FEATURES[id] ?? id,
  features: {
    ask: J.features.ask,
    hint: (feature, planet) => fill(J.features.hint, { feature, planet }),
    fact: (feature, planet) => fill(J.features.fact, { feature, planet }),
  },
  quiz: (id) => {
    const [, planet, at] = /^([a-z]+)(\d+)$/.exec(id) ?? [];
    const [question = '', fact = ''] = QUIZ[planet]?.[Number(at)] ?? [];
    return { question, fact };
  },
  quizHint: (planet, place) => fill(J.quizHint, { planet: planet[0], place: ordinalWords(place + 1) }),
  alphabet: [...J.alphabet[0]],
  figure: (at) => ({ name: bare(FIGURES[at][0]), fact: FIGURES[at][1] }),
  sky: {
    abc: (first, last) => fill(J.sky.abc, { first, last }),
    order: (first, last) => fill(J.sky.order, { first, last }),
    skip: (by, firstThree, last) => fill(J.sky.skip[1], { by: by === 2 ? J.sky.skip[2] : J.sky.skip[3], firstThree, last }),
    hintAbc: (first, firstFour) => fill(J.sky.hintAbc, { first, firstFour }),
    hint: (first, nextThree) => fill(J.sky.hint, { first, nextThree }),
    is: (at) => fill(J.sky.is, { at: FIGURES[at][0] }),
  },
  find: {
    ask: (at) => fill(J.find.ask, { at: FIGURES[at][0] }),
    hint: (at, stars) => fill(J.find.hint, { at: cap(FIGURES[at][0]), stars }),
  },
};
