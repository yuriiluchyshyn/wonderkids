export interface Planet {
  id: string;
  name: string;
  emoji: string;
}

/** In order from the Sun. */
export const PLANETS: Planet[] = [
  { id: 'mercury', name: 'Меркурій', emoji: '🌑' },
  { id: 'venus', name: 'Венера', emoji: '🟡' },
  { id: 'earth', name: 'Земля', emoji: '🌍' },
  { id: 'mars', name: 'Марс', emoji: '🔴' },
  { id: 'jupiter', name: 'Юпітер', emoji: '🟠' },
  { id: 'saturn', name: 'Сатурн', emoji: '🪐' },
  { id: 'uranus', name: 'Уран', emoji: '🟢' },
  { id: 'neptune', name: 'Нептун', emoji: '🔵' },
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
  ['red', 'mars', '🔴', 'Червона планета'],
  ['rings', 'saturn', '💍', 'Має великі кільця'],
  ['home', 'earth', '🏡', 'Тут живемо ми'],
  ['biggest', 'jupiter', '🏆', 'Найбільша планета'],
  ['nearest', 'mercury', '☀️', 'Найближча до Сонця'],
  ['farthest', 'neptune', '🥶', 'Найдальша від Сонця'],
  ['hottest', 'venus', '🔥', 'Найгарячіша планета'],
  ['sideways', 'uranus', '🛌', 'Обертається лежачи на боці'],
  ['moon', 'earth', '🌙', 'Має один супутник — Місяць'],
  ['smallest', 'mercury', '🤏', 'Найменша планета'],
  ['spot', 'jupiter', '🌀', 'Має Велику червону пляму — велетенський вихор'],
  ['winds', 'neptune', '🌬️', 'Тут дмуть найшвидші вітри'],
  ['olympus', 'mars', '🌋', 'Має найвищу гору — Олімп'],
  ['morning', 'venus', '🌅', 'Її називають Ранковою зорею'],
  ['year', 'mercury', '🏃', 'Рік триває лише 88 днів'],
  ['light', 'saturn', '🎈', 'Легша за воду'],
  ['oceans', 'earth', '🌊', 'Блакитна планета з океанами'],
  ['day', 'jupiter', '⏱️', 'Доба триває лише 10 годин'],
  ['icy', 'uranus', '🧊', 'Крижаний велетень бірюзового кольору'],
  ['math', 'neptune', '🧮', 'Її знайшли завдяки математиці'],
  ['moons', 'mars', '🥔', 'Має два крихітні супутники — Фобос і Деймос'],
  ['backwards', 'venus', '🔄', 'Обертається у зворотний бік'],
  ['titan', 'saturn', '🛰️', 'Має супутник Титан із власною атмосферою'],
  ['ganymede', 'jupiter', '🌕', 'Має найбільший супутник — Ганімед'],
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
  { name: 'Кассіопея', emoji: '👸', fact: 'Кассіопея схожа на літеру W. Її названо на честь міфічної цариці.', stars: [[12, 35], [30, 65], [50, 42], [70, 68], [88, 38]] },
  { name: 'Південний Хрест', emoji: '➕', fact: 'Південний Хрест видно лише з південної половини Землі — він є на прапорі Австралії.', stars: [[50, 14], [50, 86], [22, 46], [80, 50]] },
  { name: 'Стріла', emoji: '🏹', fact: 'Стріла — одне з найменших сузір’їв на небі.', stars: [[14, 72], [38, 56], [62, 44], [86, 24]] },
  { name: 'Дельфін', emoji: '🐬', fact: 'Сузір’я Дельфін маленьке, але дуже помітне на літньому небі.', stars: [[20, 82], [42, 60], [60, 44], [80, 34], [64, 18]] },
  { name: 'Овен', emoji: '🐏', fact: 'Овен — це баран із золотим руном із давньогрецького міфу.', stars: [[14, 40], [44, 28], [70, 38], [86, 60]] },
  { name: 'Ворон', emoji: '🐦', fact: 'Чотири яскраві зорі Ворона утворюють на небі чотирикутник.', stars: [[24, 30], [70, 22], [80, 66], [30, 76]] },
];

/** Six to eight stars — steps 11–15, joined counting by twos or tens. */
export const MEDIUM: Figure[] = [
  { name: 'Великий Віз', emoji: '🐻', fact: 'Великий Віз — це сім зір сузір’я Великої Ведмедиці. Він схожий на ківш.', stars: [[10, 30], [26, 24], [42, 30], [56, 38], [60, 58], [82, 62], [86, 40]] },
  { name: 'Мала Ведмедиця', emoji: '🧸', fact: 'На кінці «хвоста» Малої Ведмедиці сяє Полярна зоря — вона завжди показує на північ.', stars: [[88, 14], [74, 24], [60, 30], [46, 40], [48, 58], [30, 62], [28, 44]] },
  { name: 'Цефей', emoji: '🏠', fact: 'Сузір’я Цефей схоже на будиночок із гострим дахом.', stars: [[50, 10], [26, 36], [30, 78], [72, 78], [76, 36], [50, 56]] },
  { name: 'Ліра', emoji: '🎵', fact: 'У сузір’ї Ліри сяє Вега — одна з найяскравіших зір нашого неба.', stars: [[50, 10], [36, 28], [40, 62], [64, 66], [66, 32], [52, 44]] },
  { name: 'Близнята', emoji: '👬', fact: 'Дві найяскравіші зорі Близнят звуться Кастор і Поллукс — як брати з міфу.', stars: [[20, 14], [24, 34], [18, 56], [30, 76], [60, 82], [66, 60], [58, 38], [64, 16]] },
  { name: 'Північна Корона', emoji: '👑', fact: 'Зорі Північної Корони утворюють півколо — наче справжня корона.', stars: [[10, 30], [20, 52], [36, 68], [54, 72], [70, 62], [84, 46], [90, 26]] },
];

/** Ten and more stars — steps 6–10, joined by the alphabet. */
export const LARGE: Figure[] = [
  { name: 'Скорпіон', emoji: '🦂', fact: 'У серці Скорпіона горить червона зоря Антарес.', stars: [[18, 12], [30, 22], [18, 32], [34, 42], [48, 50], [60, 60], [66, 74], [60, 88], [46, 90], [34, 82], [30, 68]] },
  { name: 'Дракон', emoji: '🐉', fact: 'Дракон звивається між Великою і Малою Ведмедицями.', stars: [[85, 12], [72, 20], [80, 34], [66, 42], [52, 34], [40, 44], [48, 58], [34, 68], [20, 60], [12, 74], [24, 86], [40, 88]] },
  { name: 'Оріон', emoji: '🏹', fact: 'Оріон — небесний мисливець. Три зорі посередині — це його пояс.', stars: [[88, 36], [70, 18], [50, 10], [30, 15], [38, 52], [50, 48], [62, 44], [74, 82], [50, 92], [26, 84]] },
  { name: 'Лев', emoji: '🦁', fact: 'Найяскравіша зоря Лева зветься Регул — «маленький цар».', stars: [[18, 34], [26, 18], [42, 12], [54, 24], [46, 40], [62, 52], [80, 48], [90, 62], [72, 70], [50, 68]] },
  { name: 'Гідра', emoji: '🐍', fact: 'Гідра — найдовше сузір’я на всьому небі.', stars: [[10, 20], [22, 12], [34, 22], [26, 36], [38, 48], [52, 42], [64, 52], [58, 66], [70, 78], [84, 72], [90, 86]] },
];

export const ALPHABET = [...'АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ'];

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
