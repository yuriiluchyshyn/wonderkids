import type { TaskInstance } from '@/core/kernel/types';
import type { DotStar, TemplatePayload } from '@/core/templates/types';
import { shuffle } from '@/core/utils/random';
import { factPool } from '../shared/facts';
import { V6_RELEASE, card, defineTemplateModule, templateTask } from '../shared/templateModule';

type Tasks = TaskInstance<TemplatePayload>[];

/** A shuffled order that is guaranteed not to be already solved. */
function scramble(ids: string[]): string[] {
  for (let i = 0; i < 12; i += 1) {
    const order = shuffle(ids);
    if (order.some((id, at) => id !== ids[at])) return order;
  }
  return [...ids].reverse();
}

// ------------------------------------------------------------ Planet parade —

interface Planet {
  id: string;
  name: string;
  emoji: string;
}

/** In order from the Sun. */
const PLANETS: Planet[] = [
  { id: 'mercury', name: 'Меркурій', emoji: '🌑' },
  { id: 'venus', name: 'Венера', emoji: '🟡' },
  { id: 'earth', name: 'Земля', emoji: '🌍' },
  { id: 'mars', name: 'Марс', emoji: '🔴' },
  { id: 'jupiter', name: 'Юпітер', emoji: '🟠' },
  { id: 'saturn', name: 'Сатурн', emoji: '🪐' },
  { id: 'uranus', name: 'Уран', emoji: '🟢' },
  { id: 'neptune', name: 'Нептун', emoji: '🔵' },
];
const planet = (id: string) => PLANETS.find((p) => p.id === id) as Planet;
/** From the smallest to the biggest. */
const BY_SIZE = ['mercury', 'mars', 'venus', 'earth', 'neptune', 'uranus', 'saturn', 'jupiter'].map(planet);

/** Which places of an ordered list of eight a step asks to arrange: near ones, far ones, then mixed. */
const LINE_UPS: number[][][] = [
  [[0, 1, 2], [1, 2, 3], [0, 2, 3], [0, 1, 3], [0, 1, 2, 3]],
  [[4, 5, 6], [5, 6, 7], [4, 6, 7], [4, 5, 7], [4, 5, 6, 7]],
  [[2, 3, 4, 5], [0, 2, 4, 6], [1, 3, 5, 7], [0, 1, 2, 3, 4], [3, 4, 5, 6, 7]],
];

/** What each planet is known for — the best-known first, six a step (steps 7–10). */
const FEATURES: [id: string, planet: string, emoji: string, label: string][] = [
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
const FEATURES_PER_STEP = 6;

const SOLAR_FACTS = [
  'Навколо Сонця обертаються вісім планет.',
  'Сонце — це зоря. Воно таке велике, що в ньому вмістився б мільйон планет Земля.',
  'Меркурій, Венера, Земля і Марс — кам’яні планети: по них можна було б ходити.',
  'Юпітер, Сатурн, Уран і Нептун — велетні з газу та льоду, твердої поверхні в них немає.',
  'Світло від Сонця летить до Землі трохи більше ніж вісім хвилин.',
  'Що далі планета від Сонця, то довше на ній триває рік.',
  'Між Марсом і Юпітером літає пояс астероїдів — кам’яних уламків.',
  'Планети не світяться самі — вони відбивають світло Сонця.',
  'Земля облітає Сонце за один рік, а Нептун — за 165 земних років.',
  'Юпітер такий великий, що всередині нього вмістилося б понад тисячу планет Земля.',
  'Кільця Сатурна складаються з безлічі шматочків льоду й каміння.',
];

function lineUp(kind: 'sun' | 'size', order: Planet[], places: number[], step: number) {
  const row = places.map((i) => order[i]);
  const names = row.map((p) => p.name).join(', ');
  return templateTask(
    `${kind}:${row.map((p) => p.id).join('-')}`,
    kind === 'sun' ? 'Розстав планети: від найближчої до Сонця — до найдальшої.' : 'Розстав планети за розміром: від найменшої до найбільшої.',
    {
      template: 'UI_CHRONO_SEQUENCE',
      cards: row.map((p) => card(p.id, p.emoji, p.name)),
      initial: scramble(row.map((p) => p.id)),
      orientation: 'horizontal',
      ends: kind === 'sun' ? ['біля Сонця', 'найдалі'] : ['найменша', 'найбільша'],
      hint:
        kind === 'sun'
          ? `Першою стоїть планета, найближча до Сонця: ${row[0].name}. Усі планети по порядку: ${PLANETS.map((p) => p.name).join(', ')}.`
          : `Найменша тут — ${row[0].name}, а найбільша — ${row[row.length - 1].name}.`,
    },
    step,
    factPool(kind === 'sun' ? `Від Сонця ці планети стоять так: ${names}.` : `Від найменшої до найбільшої: ${names}.`, SOLAR_FACTS),
  );
}

/**
 * «Парад Планет»: 1–3 the order from the Sun, 4–6 the order by size,
 * 7–10 what each planet is known for.
 */
function planets(step: number): Tasks {
  const tasks: Tasks = [];
  LINE_UPS.slice(0, step).forEach((sets) => sets.forEach((places) => tasks.push(lineUp('sun', PLANETS, places, step))));
  LINE_UPS.slice(0, Math.max(0, step - 3)).forEach((sets) => sets.forEach((places) => tasks.push(lineUp('size', BY_SIZE, places, step))));

  const known = FEATURES.slice(0, Math.max(0, step - 6) * FEATURES_PER_STEP);
  for (const lead of known) {
    // Three features of three different planets.
    const set = [lead];
    for (const other of shuffle(known)) {
      if (set.length < 3 && !set.some((f) => f[1] === other[1])) set.push(other);
    }
    const slots = set.map((f) => planet(f[1]));
    tasks.push(
      templateTask(
        `feature:${lead[0]}`,
        'З’єднай кожну підказку з її планетою.',
        {
          template: 'UI_DRAG_MATCH',
          items: shuffle(set.map((f) => card(`f:${f[0]}`, f[2], f[3]))),
          slots: shuffle(slots.map((p) => card(p.id, p.emoji, p.name))),
          pairs: Object.fromEntries(set.map((f) => [`f:${f[0]}`, f[1]])),
          hint: `«${lead[3]}» — це ${planet(lead[1]).name}.`,
        },
        step,
        factPool(`${lead[3]} — це ${planet(lead[1]).name}.`, SOLAR_FACTS),
      ),
    );
  }
  return tasks;
}

// --------------------------------------------------------- Space navigator —

interface Figure {
  name: string;
  emoji: string;
  fact: string;
  /** Stars in joining order, on a 100×100 canvas. */
  stars: [x: number, y: number][];
}

/** Four or five stars — steps 1–5, joined by numbers. */
const SMALL: Figure[] = [
  { name: 'Кассіопея', emoji: '👸', fact: 'Кассіопея схожа на літеру W. Її названо на честь міфічної цариці.', stars: [[12, 35], [30, 65], [50, 42], [70, 68], [88, 38]] },
  { name: 'Південний Хрест', emoji: '➕', fact: 'Південний Хрест видно лише з південної половини Землі — він є на прапорі Австралії.', stars: [[50, 14], [50, 86], [22, 46], [80, 50]] },
  { name: 'Стріла', emoji: '🏹', fact: 'Стріла — одне з найменших сузір’їв на небі.', stars: [[14, 72], [38, 56], [62, 44], [86, 24]] },
  { name: 'Дельфін', emoji: '🐬', fact: 'Сузір’я Дельфін маленьке, але дуже помітне на літньому небі.', stars: [[20, 82], [42, 60], [60, 44], [80, 34], [64, 18]] },
  { name: 'Овен', emoji: '🐏', fact: 'Овен — це баран із золотим руном із давньогрецького міфу.', stars: [[14, 40], [44, 28], [70, 38], [86, 60]] },
  { name: 'Ворон', emoji: '🐦', fact: 'Чотири яскраві зорі Ворона утворюють на небі чотирикутник.', stars: [[24, 30], [70, 22], [80, 66], [30, 76]] },
];

/** Six to eight stars — steps 11–15, joined counting by twos or tens. */
const MEDIUM: Figure[] = [
  { name: 'Великий Віз', emoji: '🐻', fact: 'Великий Віз — це сім зір сузір’я Великої Ведмедиці. Він схожий на ківш.', stars: [[10, 30], [26, 24], [42, 30], [56, 38], [60, 58], [82, 62], [86, 40]] },
  { name: 'Мала Ведмедиця', emoji: '🧸', fact: 'На кінці «хвоста» Малої Ведмедиці сяє Полярна зоря — вона завжди показує на північ.', stars: [[88, 14], [74, 24], [60, 30], [46, 40], [48, 58], [30, 62], [28, 44]] },
  { name: 'Цефей', emoji: '🏠', fact: 'Сузір’я Цефей схоже на будиночок із гострим дахом.', stars: [[50, 10], [26, 36], [30, 78], [72, 78], [76, 36], [50, 56]] },
  { name: 'Ліра', emoji: '🎵', fact: 'У сузір’ї Ліри сяє Вега — одна з найяскравіших зір нашого неба.', stars: [[50, 10], [36, 28], [40, 62], [64, 66], [66, 32], [52, 44]] },
  { name: 'Близнята', emoji: '👬', fact: 'Дві найяскравіші зорі Близнят звуться Кастор і Поллукс — як брати з міфу.', stars: [[20, 14], [24, 34], [18, 56], [30, 76], [60, 82], [66, 60], [58, 38], [64, 16]] },
  { name: 'Північна Корона', emoji: '👑', fact: 'Зорі Північної Корони утворюють півколо — наче справжня корона.', stars: [[10, 30], [20, 52], [36, 68], [54, 72], [70, 62], [84, 46], [90, 26]] },
];

/** Ten and more stars — steps 6–10, joined by the alphabet. */
const LARGE: Figure[] = [
  { name: 'Скорпіон', emoji: '🦂', fact: 'У серці Скорпіона горить червона зоря Антарес.', stars: [[18, 12], [30, 22], [18, 32], [34, 42], [48, 50], [60, 60], [66, 74], [60, 88], [46, 90], [34, 82], [30, 68]] },
  { name: 'Дракон', emoji: '🐉', fact: 'Дракон звивається між Великою і Малою Ведмедицями.', stars: [[85, 12], [72, 20], [80, 34], [66, 42], [52, 34], [40, 44], [48, 58], [34, 68], [20, 60], [12, 74], [24, 86], [40, 88]] },
  { name: 'Оріон', emoji: '🏹', fact: 'Оріон — небесний мисливець. Три зорі посередині — це його пояс.', stars: [[88, 36], [70, 18], [50, 10], [30, 15], [38, 52], [50, 48], [62, 44], [74, 82], [50, 92], [26, 84]] },
  { name: 'Лев', emoji: '🦁', fact: 'Найяскравіша зоря Лева зветься Регул — «маленький цар».', stars: [[18, 34], [26, 18], [42, 12], [54, 24], [46, 40], [62, 52], [80, 48], [90, 62], [72, 70], [50, 68]] },
  { name: 'Гідра', emoji: '🐍', fact: 'Гідра — найдовше сузір’я на всьому небі.', stars: [[10, 20], [22, 12], [34, 22], [26, 36], [38, 48], [52, 42], [64, 52], [58, 66], [70, 78], [84, 72], [90, 86]] },
];

const ALPHABET = [...'АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ'];

/** How the stars of a figure are labelled: `start` + `by` for numbers, or letters from `start`. */
type Labels = { kind: 'count'; start: number; by: number } | { kind: 'abc'; start: number };

/** Three new constellations a step: [figure, labels]. */
const SKY_STEPS: [Figure, Labels][][] = [
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

const SKY_FACTS = [
  'Сузір’я — це малюнок, який люди уявили, з’єднавши зорі лініями.',
  'На небі налічують 88 сузір’їв.',
  'Зорі однієї фігури насправді дуже далеко одна від одної — вони лише здаються сусідами.',
  'Давні мореплавці знаходили дорогу за зорями.',
  'Удень зорі нікуди не зникають — їх просто затьмарює світло Сонця.',
  'Найближча до нас зоря — це Сонце.',
  'Зорі мерехтять, бо їхнє світло проходить крізь рухливе повітря Землі.',
  'Чумацький Шлях — це наша галактика: у ній сотні мільярдів зір.',
  'Узимку і влітку на вечірньому небі видно різні сузір’я.',
  'Полярна зоря майже не рухається на небі й завжди показує на північ.',
  'Найкраще зорі видно далеко від міських ліхтарів.',
];

function skyTask(figure: Figure, labels: Labels, step: number) {
  const text = figure.stars.map((_, i) => (labels.kind === 'abc' ? ALPHABET[labels.start + i] : String(labels.start + i * labels.by)));
  const stars: DotStar[] = figure.stars.map(([x, y], i) => ({ x, y, label: text[i] }));
  const last = text[text.length - 1];
  const prompt =
    labels.kind === 'abc'
      ? `З’єднай зорі за абеткою: від ${text[0]} до ${last}.`
      : labels.by === 1
        ? `З’єднай зорі по порядку: від ${text[0]} до ${last}.`
        : `З’єднай зорі, рахуючи ${labels.by === 2 ? 'двійками' : 'десятками'}: ${text.slice(0, 3).join(', ')} — і далі до ${last}.`;
  return templateTask(
    `sky:${figure.name}:${text[0]}-${last}`,
    prompt,
    {
      template: 'UI_DOT_TO_DOT',
      stars,
      figure: { name: figure.name, emoji: figure.emoji },
      hint:
        labels.kind === 'abc'
          ? `Почни із зорі ${text[0]}. Далі йди за абеткою: ${text.slice(0, 4).join(', ')}…`
          : `Почни із зорі ${text[0]}. Далі: ${text.slice(1, 4).join(', ')}…`,
    },
    step,
    factPool(`Це сузір’я ${figure.name}!`, figure.fact, SKY_FACTS),
  );
}

/** «Космічний Навігатор»: every step draws three new constellations. */
function sky(step: number): Tasks {
  return SKY_STEPS.slice(0, step).flatMap((tasks) => tasks.map(([figure, labels]) => skyTask(figure, labels, step)));
}

/** The Astronomy subject (Tech Spec v6 §2.3). */
export const astronomyModule = defineTemplateModule({
  id: 'astronomy',
  title: 'Астрономія',
  icon: '🔭',
  accent: '#6366f1',
  games: [
    {
      id: 'planets',
      gameId: 'astro_planet_parade',
      label: 'Парад Планет',
      icon: '🪐',
      blurb: 'Розстав планети від Сонця та за розміром',
      intro: 'Навколо Сонця кружляють вісім планет. Розстав їх по порядку: спершу ту, що найближче до Сонця!',
      introFor: (step) => {
        if (step === 2) return 'Тепер далекі планети-велетні: Юпітер, Сатурн, Уран і Нептун.';
        if (step === 4) return 'Планети бувають маленькі й велетенські. Розстав їх за розміром: від найменшої до найбільшої!';
        if (step === 7) return 'Кожна планета чимось особлива. З’єднай підказку з планетою, про яку вона розповідає.';
        return undefined;
      },
      landmark: { name: 'Планетарій', emoji: '🪐' },
      steps: 10,
      difficulty: [1, 2],
      publishDate: V6_RELEASE,
      tasksPerLevel: 6,
      mechanics: ['UI_CHRONO_SEQUENCE', 'UI_DRAG_MATCH'],
      hasText: true,
      pool: planets,
    },
    {
      id: 'constellations',
      gameId: 'astro_space_navigator',
      label: 'Космічний Навігатор',
      icon: '✨',
      blurb: 'З’єднуй зорі по порядку й малюй сузір’я',
      intro: 'На небі зорі складаються в малюнки — сузір’я. Торкайся зір по порядку, від найменшого числа, — і побачиш, що вийде!',
      introFor: (step) => {
        if (step === 3) return 'Тепер рахунок починається не з одиниці. Знайди найменше число і йди далі по порядку.';
        if (step === 6) return 'Сузір’я стають більшими, а на зорях тепер літери. З’єднуй їх за абеткою!';
        if (step === 11) return 'Тепер рахуємо двійками: два, чотири, шість, вісім…';
        if (step === 13) return 'А тепер — десятками: десять, двадцять, тридцять…';
        return undefined;
      },
      landmark: { name: 'Обсерваторія', emoji: '🔭' },
      steps: SKY_STEPS.length,
      difficulty: [1, 2],
      publishDate: V6_RELEASE,
      tasksPerLevel: 5,
      mechanics: 'UI_CHRONO_SEQUENCE',
      pool: sky,
    },
  ],
});
