import TEXTS from '@/locales/app/uk/games/astronomy.json';

const J = TEXTS.content.data;

export interface Planet {
  id: string;
  name: string;
  emoji: string;
}

/** In order from the Sun. */
export const PLANETS: Planet[] = [
  { id: 'mercury', name: J.PLANETS.mercury.name, emoji: '🌑' },
  { id: 'venus', name: J.PLANETS.venus.name, emoji: '🟡' },
  { id: 'earth', name: J.PLANETS.earth.name, emoji: '🌍' },
  { id: 'mars', name: J.PLANETS.mars.name, emoji: '🔴' },
  { id: 'jupiter', name: J.PLANETS.jupiter.name, emoji: '🟠' },
  { id: 'saturn', name: J.PLANETS.saturn.name, emoji: '🪐' },
  { id: 'uranus', name: J.PLANETS.uranus.name, emoji: '🟢' },
  { id: 'neptune', name: J.PLANETS.neptune.name, emoji: '🔵' },
];
export const planet = (id: string) => PLANETS.find((p) => p.id === id) as Planet;
/** From the smallest to the biggest. */
export const BY_SIZE = ['mercury', 'mars', 'venus', 'earth', 'neptune', 'uranus', 'saturn', 'jupiter'].map(planet);

/** Which places of an ordered list of eight a step asks to arrange: near ones, far ones, then mixed. */
export const LINE_UPS: number[][][] = [
  [[0, 1, 2], [1, 2, 3], [0, 2, 3], [0, 1, 3], [0, 1, 2, 3]],
  [[4, 5, 6], [5, 6, 7], [4, 6, 7], [4, 5, 7], [4, 5, 6, 7]],
  [[2, 3, 4, 5], [0, 2, 4, 6], [1, 3, 5, 7], [0, 1, 2, 3, 4], [3, 4, 5, 6, 7]],
];

/** What each planet is known for — the best-known first, six a step (steps 7–10). */
export const FEATURES: [id: string, planet: string, emoji: string, label: string][] = [
  ['red', 'mars', '🔴', J.FEATURES[0][3]],
  ['rings', 'saturn', '💍', J.FEATURES[1][3]],
  ['home', 'earth', '🏡', J.FEATURES[2][3]],
  ['biggest', 'jupiter', '🏆', J.FEATURES[3][3]],
  ['nearest', 'mercury', '☀️', J.FEATURES[4][3]],
  ['farthest', 'neptune', '🥶', J.FEATURES[5][3]],
  ['hottest', 'venus', '🔥', J.FEATURES[6][3]],
  ['sideways', 'uranus', '🛌', J.FEATURES[7][3]],
  ['moon', 'earth', '🌙', J.FEATURES[8][3]],
  ['smallest', 'mercury', '🤏', J.FEATURES[9][3]],
  ['spot', 'jupiter', '🌀', J.FEATURES[10][3]],
  ['winds', 'neptune', '🌬️', J.FEATURES[11][3]],
  ['olympus', 'mars', '🌋', J.FEATURES[12][3]],
  ['morning', 'venus', '🌅', J.FEATURES[13][3]],
  ['year', 'mercury', '🏃', J.FEATURES[14][3]],
  ['light', 'saturn', '🎈', J.FEATURES[15][3]],
  ['oceans', 'earth', '🌊', J.FEATURES[16][3]],
  ['day', 'jupiter', '⏱️', J.FEATURES[17][3]],
  ['icy', 'uranus', '🧊', J.FEATURES[18][3]],
  ['math', 'neptune', '🧮', J.FEATURES[19][3]],
  ['moons', 'mars', '🥔', J.FEATURES[20][3]],
  ['backwards', 'venus', '🔄', J.FEATURES[21][3]],
  ['titan', 'saturn', '🛰️', J.FEATURES[22][3]],
  ['ganymede', 'jupiter', '🌕', J.FEATURES[23][3]],
];
export const FEATURES_PER_STEP = 6;

export interface Figure {
  name: string;
  emoji: string;
  fact: string;
  /** Stars in joining order, on a 100×100 canvas. */
  stars: [x: number, y: number][];
}

/** Four or five stars — steps 1–5, joined by numbers. */
export const SMALL: Figure[] = [
  { name: J.SMALL[0].name, emoji: '👸', fact: J.SMALL[0].fact, stars: [[12, 35], [30, 65], [50, 42], [70, 68], [88, 38]] },
  { name: J.SMALL[1].name, emoji: '➕', fact: J.SMALL[1].fact, stars: [[50, 14], [50, 86], [22, 46], [80, 50]] },
  { name: J.SMALL[2].name, emoji: '🏹', fact: J.SMALL[2].fact, stars: [[14, 72], [38, 56], [62, 44], [86, 24]] },
  { name: J.SMALL[3].name, emoji: '🐬', fact: J.SMALL[3].fact, stars: [[20, 82], [42, 60], [60, 44], [80, 34], [64, 18]] },
  { name: J.SMALL[4].name, emoji: '🐏', fact: J.SMALL[4].fact, stars: [[14, 40], [44, 28], [70, 38], [86, 60]] },
  { name: J.SMALL[5].name, emoji: '🐦', fact: J.SMALL[5].fact, stars: [[24, 30], [70, 22], [80, 66], [30, 76]] },
];

/** Six to eight stars — steps 11–15, joined counting by twos or tens. */
export const MEDIUM: Figure[] = [
  { name: J.MEDIUM[0].name, emoji: '🐻', fact: J.MEDIUM[0].fact, stars: [[10, 30], [26, 24], [42, 30], [56, 38], [60, 58], [82, 62], [86, 40]] },
  { name: J.MEDIUM[1].name, emoji: '🧸', fact: J.MEDIUM[1].fact, stars: [[88, 14], [74, 24], [60, 30], [46, 40], [48, 58], [30, 62], [28, 44]] },
  { name: J.MEDIUM[2].name, emoji: '🏠', fact: J.MEDIUM[2].fact, stars: [[50, 10], [26, 36], [30, 78], [72, 78], [76, 36], [50, 56]] },
  { name: J.MEDIUM[3].name, emoji: '🎵', fact: J.MEDIUM[3].fact, stars: [[50, 10], [36, 28], [40, 62], [64, 66], [66, 32], [52, 44]] },
  { name: J.MEDIUM[4].name, emoji: '👬', fact: J.MEDIUM[4].fact, stars: [[20, 14], [24, 34], [18, 56], [30, 76], [60, 82], [66, 60], [58, 38], [64, 16]] },
  { name: J.MEDIUM[5].name, emoji: '👑', fact: J.MEDIUM[5].fact, stars: [[10, 30], [20, 52], [36, 68], [54, 72], [70, 62], [84, 46], [90, 26]] },
];

/** Ten and more stars — steps 6–10, joined by the alphabet. */
export const LARGE: Figure[] = [
  { name: J.LARGE[0].name, emoji: '🦂', fact: J.LARGE[0].fact, stars: [[18, 12], [30, 22], [18, 32], [34, 42], [48, 50], [60, 60], [66, 74], [60, 88], [46, 90], [34, 82], [30, 68]] },
  { name: J.LARGE[1].name, emoji: '🐉', fact: J.LARGE[1].fact, stars: [[85, 12], [72, 20], [80, 34], [66, 42], [52, 34], [40, 44], [48, 58], [34, 68], [20, 60], [12, 74], [24, 86], [40, 88]] },
  { name: J.LARGE[2].name, emoji: '🏹', fact: J.LARGE[2].fact, stars: [[88, 36], [70, 18], [50, 10], [30, 15], [38, 52], [50, 48], [62, 44], [74, 82], [50, 92], [26, 84]] },
  { name: J.LARGE[3].name, emoji: '🦁', fact: J.LARGE[3].fact, stars: [[18, 34], [26, 18], [42, 12], [54, 24], [46, 40], [62, 52], [80, 48], [90, 62], [72, 70], [50, 68]] },
  { name: J.LARGE[4].name, emoji: '🐍', fact: J.LARGE[4].fact, stars: [[10, 20], [22, 12], [34, 22], [26, 36], [38, 48], [52, 42], [64, 52], [58, 66], [70, 78], [84, 72], [90, 86]] },
];

export const ALPHABET = [...J.ALPHABET[0]];

/** How the stars of a figure are labelled: `start` + `by` for numbers, or letters from `start`. */
export type Labels = { kind: 'count'; start: number; by: number } | { kind: 'abc'; start: number };

/** Three new constellations a step: [figure, labels]. */
export const SKY_STEPS: [Figure, Labels][][] = [
  // 1–5: four or five stars by numbers, later from a number other than one.
  [0, 1, 2].map((i) => [SMALL[i], { kind: 'count', start: 1, by: 1 }]),
  [3, 4, 5].map((i) => [SMALL[i], { kind: 'count', start: 1, by: 1 }]),
  [0, 1, 2].map((i) => [SMALL[i], { kind: 'count', start: 6, by: 1 }]),
  [3, 4, 5].map((i) => [SMALL[i], { kind: 'count', start: 11, by: 1 }]),
  [0, 2, 4].map((i) => [SMALL[i], { kind: 'count', start: 16, by: 1 }]),
  // 6–10: ten and more stars by the alphabet, later from the middle of it.
  [[LARGE[0], { kind: 'abc', start: 0 }], [LARGE[1], { kind: 'abc', start: 0 }], [LARGE[2], { kind: 'abc', start: 0 }]],
  [[LARGE[3], { kind: 'abc', start: 0 }], [LARGE[4], { kind: 'abc', start: 0 }], [LARGE[0], { kind: 'abc', start: 5 }]],
  [[LARGE[1], { kind: 'abc', start: 7 }], [LARGE[2], { kind: 'abc', start: 10 }], [LARGE[3], { kind: 'abc', start: 12 }]],
  [[LARGE[4], { kind: 'abc', start: 15 }], [LARGE[0], { kind: 'abc', start: 18 }], [LARGE[1], { kind: 'abc', start: 20 }]],
  [[LARGE[2], { kind: 'abc', start: 21 }], [LARGE[3], { kind: 'abc', start: 22 }], [LARGE[4], { kind: 'abc', start: 20 }]],
  // 11–15: counting by twos and by tens.
  [0, 1, 2].map((i) => [MEDIUM[i], { kind: 'count', start: 2, by: 2 }]),
  [3, 4, 5].map((i) => [MEDIUM[i], { kind: 'count', start: 2, by: 2 }]),
  [0, 2, 3].map((i) => [MEDIUM[i], { kind: 'count', start: 10, by: 10 }]),
  [1, 4, 5].map((i) => [MEDIUM[i], { kind: 'count', start: 10, by: 10 }]),
  [0, 4, 5].map((i) => [MEDIUM[i], { kind: 'count', start: 20, by: 2 }]),
];

/** Every figure of the sky, the small ones first. */
export const FIGURES: Figure[] = [...SMALL, ...MEDIUM, ...LARGE];

/**
 * «Знайди сузір’я» — the steps after the labelled ones. A figure is asked
 * three times along them, each time harder to pick out: more stars around it
 * and its own stars less and less bigger than they are.
 */
export const FIND_TIERS: { decoys: number; ratio: number }[] = [
  { decoys: 10, ratio: 2 },
  { decoys: 18, ratio: 1.7 },
  { decoys: 28, ratio: 1.45 },
];
/** Figures a step of the search opens. */
export const FIND_PER_STEP = 3;
/** [figure, tier] in path order: all figures at the first tier, then all at the second… trimmed to whole steps. */
export const FIND_STEPS: [Figure, number][][] = (() => {
  const all = FIND_TIERS.flatMap((_, tier) => FIGURES.map((figure): [Figure, number] => [figure, tier]));
  const steps: [Figure, number][][] = [];
  for (let i = 0; i + FIND_PER_STEP <= all.length; i += FIND_PER_STEP) steps.push(all.slice(i, i + FIND_PER_STEP));
  return steps;
})();
