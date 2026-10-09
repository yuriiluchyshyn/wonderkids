import TEXTS from '@/locales/app/uk/games/astronomy.json';

const J = TEXTS.content.planetQuiz;

/**
 * «На якій планеті…?» — a hundred questions about the eight planets: how far,
 * how hot, how long the day and the year, is there water, who has been there.
 * One row: the planet that is the answer, the question, and what is told
 * afterwards — a fact about exactly what was asked.
 *
 * Every question has ONE defensible answer: nothing is asked that two planets
 * share (a child weighs the same 0.38 of their weight on Mercury and on Mars,
 * so weight is asked only about Jupiter and the Earth).
 */
type Row = [question: string, fact: string];

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

export interface PlanetQuestion {
  id: string;
  planet: string;
  question: string;
  fact: string;
}

/**
 * The questions in path order: one planet after another, round and round, so
 * a step mixes the planets and the best-known fact of each comes first.
 */
export const PLANET_QUIZ: PlanetQuestion[] = (() => {
  const planets = Object.keys(QUIZ);
  const out: PlanetQuestion[] = [];
  for (let i = 0; planets.some((p) => QUIZ[p][i]); i += 1) {
    for (const planet of planets) {
      const row = QUIZ[planet][i];
      if (row) out.push({ id: `${planet}${i}`, planet, question: row[0], fact: row[1] });
    }
  }
  return out;
})();

/** New questions a step opens. */
export const QUIZ_PER_STEP = 5;
/** Steps the quiz adds to «Парад Планет». */
export const QUIZ_STEPS = Math.ceil(PLANET_QUIZ.length / QUIZ_PER_STEP);
