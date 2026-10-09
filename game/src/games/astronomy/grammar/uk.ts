import { ALPHABET, FEATURES, FIGURES, PLANETS } from '@/games/astronomy/content/data';
import { PLANET_QUIZ } from '@/games/astronomy/content/planetQuiz';
import type { AstronomyTexts } from '@/games/astronomy/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/uk/games/astronomy.json';

/**
 * The Astronomy galaxy in Ukrainian — its original sentences, word for word.
 * The names of planets and constellations, the clues and the hundred quiz
 * questions are those written with the content itself (`content/`).
 */

const PLACE = J.PLACE;
const quiz = new Map(PLANET_QUIZ.map((q) => [q.id, q]));

export const uk: AstronomyTexts = {
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
  planet: (id) => PLANETS.find((p) => p.id === id)?.name ?? id,
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
  feature: (id) => FEATURES.find((f) => f[0] === id)?.[3] ?? id,
  features: {
    ask: J.features.ask,
    hint: (feature, planet) => fill(J.features.hint, { feature, planet }),
    fact: (feature, planet) => fill(J.features.fact, { feature, planet }),
  },
  quiz: (id) => ({ question: quiz.get(id)?.question ?? '', fact: quiz.get(id)?.fact ?? '' }),
  quizHint: (planet, place) => fill(J.quizHint, { planet: planet[0], place: PLACE[place] }),
  alphabet: ALPHABET,
  figure: (at) => ({ name: FIGURES[at].name, fact: FIGURES[at].fact }),
  sky: {
    abc: (first, last) => fill(J.sky.abc, { first, last }),
    order: (first, last) => fill(J.sky.order, { first, last }),
    skip: (by, firstThree, last) => fill(J.sky.skip[1], { by: by === 2 ? J.sky.skip[2] : J.sky.skip[3], firstThree, last }),
    hintAbc: (first, firstFour) => fill(J.sky.hintAbc, { first, firstFour }),
    hint: (first, nextThree) => fill(J.sky.hint, { first, nextThree }),
    is: (at) => fill(J.sky.is, { name: FIGURES[at].name }),
  },
  find: {
    ask: (at) => fill(J.find.ask, { name: FIGURES[at].name }),
    hint: (at, stars) => fill(J.find.hint, { name: FIGURES[at].name, stars }),
  },
};
