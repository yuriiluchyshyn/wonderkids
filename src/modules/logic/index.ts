import type { TaskInstance } from '@/core/kernel/types';
import type { Card, TemplatePayload } from '@/core/templates/types';
import { shuffle } from '@/core/utils/random';
import { factPool } from '../shared/facts';
import { V6_RELEASE, card, defineTemplateModule, templateTask } from '../shared/templateModule';

type Tasks = TaskInstance<TemplatePayload>[];
const PER_STEP = 5;

// ------------------------------------------------------ Rhythm & patterns —

/** Picture sets a pattern is drawn with — four clearly different things each. */
const SETS: string[][] = [
  ['🔴', '🔵', '🟡', '🟢'],
  ['⭐', '🌙', '☀️', '☁️'],
  ['🚗', '🚌', '🚜', '🚲'],
  ['🍎', '🍌', '🍇', '🍓'],
  ['🐶', '🐱', '🐭', '🐸'],
  ['🔺', '🟦', '🟣', '🔶'],
  ['⚽', '🏀', '🎾', '🏐'],
  ['🌷', '🌻', '🌵', '🍄'],
  ['🧦', '👟', '🧢', '🧤'],
  ['🥕', '🍅', '🥒', '🌽'],
];

/**
 * One path step: the repeating unit (letters = different pictures), how many
 * pictures are shown, and where the gap is (`null` — at the end).
 */
const PATTERN_STEPS: { unit: string; length: number; gap: number | null }[] = [
  { unit: 'AB', length: 4, gap: null },
  { unit: 'AB', length: 6, gap: null },
  { unit: 'AB', length: 6, gap: 3 },
  { unit: 'ABC', length: 6, gap: null },
  { unit: 'ABC', length: 8, gap: null },
  { unit: 'ABC', length: 7, gap: 4 },
  { unit: 'AABB', length: 8, gap: null },
  { unit: 'AAB', length: 6, gap: null },
  { unit: 'ABB', length: 8, gap: 4 },
  { unit: 'ABAC', length: 8, gap: null },
];

const PATTERN_FACTS = [
  'Візерунок — це коли щось повторюється за правилом.',
  'Щоб розгадати візерунок, знайди шматочок, який повторюється.',
  'Смужки зебри, соти бджіл, пелюстки квітів — у природі повно візерунків.',
  'Дні тижня теж ідуть візерунком: сім днів — і знову понеділок.',
  'У музиці візерунок зі звуків називають ритмом.',
  'Українська вишиванка — це візерунок із хрестиків, що повторюються.',
  'День і ніч змінюють одне одного — це найпростіший візерунок: А, Б, А, Б.',
  'Пори року повторюються по колу: зима, весна, літо, осінь.',
  'Плитку на підлозі часто викладають візерунком.',
  'Математики кажуть, що їхня наука — це пошук візерунків.',
  'Серце б’ється у рівному ритмі — тук-тук, тук-тук.',
];

function patterns(step: number): Tasks {
  const tasks: Tasks = [];
  PATTERN_STEPS.slice(0, step).forEach(({ unit, length, gap }, at) => {
    for (let i = 0; i < PER_STEP; i += 1) {
      // Every step takes five other sets, turned so the same pictures play new roles.
      const set = SETS[(at * PER_STEP + i) % SETS.length];
      const turn = Math.floor((at * PER_STEP + i) / SETS.length);
      const picture = (letter: string) => set[(letter.charCodeAt(0) - 65 + turn) % set.length];
      const row = Array.from({ length }, (_, k) => picture(unit[k % unit.length]));
      const hole = gap ?? length - 1;
      const answer = row[hole];
      const shown = row.map((p, k) => (k === hole ? '❓' : p));
      tasks.push(
        templateTask(
          `pattern:${shown.join('')}`,
          'Який малюнок має бути замість знака питання?',
          {
            template: 'UI_GRID_CHOICE',
            cols: 2,
            stimulus: { scene: [{ emoji: shown.join(' ') }] },
            options: shuffle(set).map((p) => card(p, p)),
            correctId: answer,
            hint: `Назви малюнки вголос по порядку. Тут повторюється шматочок із ${unit.length === 2 ? 'двох' : unit.length === 3 ? 'трьох' : 'чотирьох'} малюнків.`,
          },
          step,
          PATTERN_FACTS,
        ),
      );
    }
  });
  return tasks;
}

// ------------------------------------------------------------ Shadow lotto —

type Thing = [emoji: string, name: string];

/** Steps 1–3: things that look nothing alike. */
const MIXED: Thing[] = [
  ['🐘', 'слон'], ['🐍', 'змія'], ['🦒', 'жирафа'], ['🚗', 'машина'], ['🌳', 'дерево'],
  ['🏠', 'будинок'], ['⭐', 'зірка'], ['☂️', 'парасолька'], ['🐢', 'черепаха'], ['✈️', 'літак'],
  ['🎸', 'гітара'], ['🦋', 'метелик'], ['🚲', 'велосипед'], ['🍌', 'банан'], ['🔑', 'ключ'],
];
/** Steps 4–7: one family a step — the shadows are closer to each other. */
const FAMILIES: Thing[][] = [
  [['🐕', 'собака'], ['🐈', 'кішка'], ['🐇', 'заєць'], ['🐎', 'кінь'], ['🐖', 'свиня']],
  [['🦆', 'качка'], ['🦉', 'сова'], ['🦅', 'орел'], ['🦜', 'папуга'], ['🦢', 'лебідь']],
  [['🐟', 'риба'], ['🐙', 'восьминіг'], ['🦀', 'краб'], ['🐬', 'дельфін'], ['🦈', 'акула']],
  [['🚂', 'паровоз'], ['🚁', 'гелікоптер'], ['⛵', 'вітрильник'], ['🚀', 'ракета'], ['🛴', 'самокат']],
];
/** Steps 8–10: look-alikes, four pairs on the board — attention to detail. */
const LOOKALIKES: Thing[][] = [
  [['🚌', 'автобус'], ['🚚', 'вантажівка'], ['🚜', 'трактор'], ['🏍️', 'мотоцикл'], ['🛵', 'скутер']],
  [['🍁', 'кленовий листок'], ['🍀', 'конюшина'], ['🌿', 'гілочка'], ['🌲', 'ялинка'], ['🌴', 'пальма']],
  [['🔨', 'молоток'], ['🔧', 'гайковий ключ'], ['✂️', 'ножиці'], ['🪚', 'пилка'], ['🔪', 'ніж']],
];

const SHADOW_FACTS = [
  'Тінь з’являється там, куди не потрапляє світло.',
  'Опівдні, коли сонце високо, тінь найкоротша.',
  'Увечері й уранці тіні довгі-предовгі.',
  'Тінь завжди повторює обриси предмета — тому за нею його можна впізнати.',
  'Що ближче предмет до лампи, то більша його тінь на стіні.',
  'За тінню від палички можна дізнатися, котра година, — так працює сонячний годинник.',
  'У театрі тіней ляльок не видно — глядачі бачать лише їхні тіні.',
  'Руками можна скласти тінь собаки, зайця чи птаха.',
  'Місячне затемнення — це коли на Місяць падає тінь Землі.',
  'У тіні дерева влітку прохолодніше, ніж на сонці.',
];

/** Pair up coloured things with their shadows; `lead` is the pair the task is about. */
function shadowTask(lead: Thing, others: readonly Thing[], pairs: number, step: number) {
  const things = [lead, ...shuffle(others.filter((t) => t[0] !== lead[0])).slice(0, pairs - 1)];
  const item = (t: Thing): Card => ({ id: t[0], emoji: t[0] });
  const shadow = (t: Thing): Card => ({ id: `shadow:${t[0]}`, emoji: t[0], silhouette: true });
  return templateTask(
    `shadow:${lead[0]}`,
    'Знайди для кожного малюнка його тінь.',
    {
      template: 'UI_DRAG_MATCH',
      items: shuffle(things.map(item)),
      slots: shuffle(things.map(shadow)),
      pairs: Object.fromEntries(things.map((t) => [t[0], `shadow:${t[0]}`])),
      hint: 'Придивись до обрисів: вуха, хвіст, колеса. Тінь має таку саму форму, як і малюнок.',
    },
    step,
    factPool(`Це ${lead[1]} — упізнати можна навіть за тінню!`, SHADOW_FACTS),
  );
}

function shadows(step: number): Tasks {
  const tasks: Tasks = [];
  const mixed = MIXED.slice(0, Math.min(step, 3) * PER_STEP);
  for (const thing of mixed) tasks.push(shadowTask(thing, mixed, 3, step));
  FAMILIES.slice(0, Math.max(0, Math.min(step, 7) - 3)).forEach((family) => {
    for (const thing of family) tasks.push(shadowTask(thing, family, 3, step));
  });
  LOOKALIKES.slice(0, Math.max(0, step - 7)).forEach((family) => {
    for (const thing of family) tasks.push(shadowTask(thing, family, 4, step));
  });
  return tasks;
}

// -------------------------------------------------------- Mirror symmetry —

/** The left half of a figure: rows of '#' (filled) and '.' (empty); the mirror stands on its right edge. */
interface Half {
  name?: string;
  rows: string[];
}

/** Hand-drawn halves of familiar things (steps 3–4). */
const DRAWN: Half[] = [
  { name: 'Метелик', rows: ['##.', '###', '.##', '###', '#..'] },
  { name: 'Сердечко', rows: ['.##', '###', '###', '.##', '..#'] },
  { name: 'Ялинка', rows: ['..#', '.##', '###', '.##', '..#'] },
  { name: 'Будиночок', rows: ['..#', '.##', '###', '#.#', '###'] },
  { name: 'Ракета', rows: ['..#', '.##', '.##', '###', '#..'] },
  { name: 'Гриб', rows: ['.##', '###', '###', '..#', '.##'] },
  { name: 'Кубок', rows: ['###', '###', '.##', '..#', '.##'] },
  { name: 'Корона', rows: ['#..', '#.#', '###', '###', '.##'] },
  { name: 'Робот', rows: ['.##', '.#.', '###', '#.#', '.#.'] },
  { name: 'Ключ', rows: ['.##', '#..', '.##', '..#', '.##'] },
];

/** Half-figure size per path step: [cols, rows]. Steps 3–4 use the drawn ones (3×5). */
const HALF_SIZE: [number, number][] = [[2, 3], [2, 4], [3, 5], [3, 5], [3, 3], [3, 4], [4, 3], [4, 4], [4, 5], [5, 4]];

/** Small deterministic generator, so a step always holds the same figures. */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const mirrorRow = (row: string) => [...row].reverse().join('');
const flipH = (rows: string[]) => rows.map(mirrorRow);
const flipV = (rows: string[]) => [...rows].reverse();
const sameRows = (a: string[], b: string[]) => a.join('|') === b.join('|');

/** The halves of one step — drawn or generated — always the same five. */
function halvesOf(step: number): Half[] {
  if (step === 3) return DRAWN.slice(0, PER_STEP);
  if (step === 4) return DRAWN.slice(PER_STEP);
  const [cols, rows] = HALF_SIZE[step - 1];
  const random = seeded(step * 7919);
  const halves: Half[] = [];
  while (halves.length < PER_STEP) {
    const half = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (random() < 0.55 ? '#' : '.')).join(''));
    const filled = half.join('').split('#').length - 1;
    // A fair figure: neither nearly empty nor full, not its own mirror image, not met before.
    if (filled < (cols * rows) / 3 || filled > cols * rows - 2) continue;
    if (sameRows(flipH(half), half) || halves.some((h) => sameRows(h.rows, half))) continue;
    halves.push({ rows: half });
  }
  return halves;
}

const toShape = (rows: string[]) => ({
  cols: rows[0].length,
  rows: rows.length,
  cells: [...rows.join('')].flatMap((c, i) => (c === '#' ? [i] : [])),
});

const MIRROR_FACTS = [
  'У дзеркалі ліве і праве міняються місцями.',
  'Фігуру, обидві половинки якої однакові, називають симетричною.',
  'Крила метелика симетричні — їхні візерунки віддзеркалюють один одного.',
  'Обличчя людини майже симетричне: два ока, два вуха, дві брови.',
  'Сніжинки симетричні — у кожної шість однакових промінців.',
  'Якщо скласти аркуш навпіл і вирізати половинку серця, вийде ціле серце.',
  'Літери А, М, О, Т симетричні: їхні половинки однакові.',
  'Спокійна вода в озері працює як дзеркало — у ній відбиваються дерева й хмари.',
  'Напис на машині швидкої допомоги іноді дзеркальний — щоб водії читали його у дзеркалі.',
  'Будівельники люблять симетрію: палаци й храми часто мають однакові крила.',
  'Листок дерева можна скласти навпіл по жилці — половинки збігаються.',
];

function mirrors(step: number): Tasks {
  const tasks: Tasks = [];
  for (let s = 1; s <= step; s += 1) {
    for (const half of halvesOf(s)) {
      const right = flipH(half.rows);
      // Traps: the half copied without turning, upside-down ones, and one with a single cell moved.
      const nudged = (seed: number) => {
        const cells = [...right.join('')];
        const at = seed % cells.length;
        cells[at] = cells[at] === '#' ? '.' : '#';
        return half.rows.map((_, r) => cells.slice(r * right[0].length, (r + 1) * right[0].length).join(''));
      };
      const traps: string[][] = [];
      for (const trap of [half.rows, flipV(right), nudged(1), nudged(right[0].length + 1), nudged(right.join('').length - 1), flipV(half.rows)]) {
        if (traps.length < 3 && !sameRows(trap, right) && !traps.some((t) => sameRows(t, trap))) traps.push(trap);
      }
      const width = right[0].length;
      tasks.push(
        templateTask(
          `mirror:${half.rows.join('|')}`,
          'Це ліва половинка малюнка. Знайди праву — таку, як у дзеркалі.',
          {
            template: 'UI_GRID_CHOICE',
            cols: 2,
            // The whole canvas with its right half still empty.
            stimulus: { shape: toShape(half.rows.map((row) => row + '.'.repeat(width))), caption: half.name },
            options: shuffle([{ id: 'mirror', shape: toShape(right) }, ...traps.map((trap, i) => ({ id: `trap${i}`, shape: toShape(trap) }))]),
            correctId: 'mirror',
            hint: 'Уяви дзеркало посередині. Клітинка, що стоїть біля дзеркала зліва, буде біля нього і справа.',
          },
          step,
          factPool(half.name ? `${half.name} — симетричний малюнок: половинки однакові.` : undefined, MIRROR_FACTS),
        ),
      );
    }
  }
  return tasks;
}

/** The Logic subject (Tech Spec v6 §2.2): patterns, shadows, symmetry. */
export const logicModule = defineTemplateModule({
  id: 'logic',
  title: 'Логіка',
  icon: '🧩',
  accent: '#8b5cf6',
  games: [
    {
      id: 'patterns',
      gameId: 'logic_patterns',
      label: 'Ритм і Візерунки',
      icon: '🔁',
      blurb: 'Розгадай правило і продовж візерунок',
      intro: 'Малюнки стоять у рядку за правилом і повторюються. Розгадай це правило і скажи, що має бути замість знака питання!',
      introFor: (step) => {
        if (step === 3) return 'Тепер знак питання стоїть посередині рядка. Подивись, що повторюється до нього і після нього.';
        if (step === 4) return 'Візерунки стають довшими: тепер повторюються три різні малюнки.';
        if (step === 7) return 'Обережно: тепер малюнки можуть стояти парами — два однакові поспіль.';
        return undefined;
      },
      landmark: { name: 'Майстерня візерунків', emoji: '🧵' },
      steps: PATTERN_STEPS.length,
      difficulty: [1, 2],
      publishDate: V6_RELEASE,
      tasksPerLevel: 10,
      mechanics: 'UI_GRID_CHOICE',
      pool: patterns,
    },
    {
      id: 'shadows',
      gameId: 'logic_shadow_lotto',
      label: 'Тіньове Лото',
      icon: '👤',
      blurb: 'Знайди для кожного малюнка його тінь',
      intro: 'У кожного предмета є тінь — чорний силует такої самої форми. Перетягни кожен малюнок на його тінь!',
      introFor: (step) => {
        if (step === 4) return 'Тепер тіні більше схожі одна на одну. Придивляйся до дрібниць!';
        if (step === 8) return 'Найскладніше: чотири схожі тіні одразу. Будь дуже уважним!';
        return undefined;
      },
      landmark: { name: 'Театр тіней', emoji: '🎭' },
      steps: 10,
      difficulty: 1,
      publishDate: V6_RELEASE,
      tasksPerLevel: 10,
      mechanics: 'UI_DRAG_MATCH',
      pool: shadows,
    },
    {
      id: 'mirror',
      gameId: 'logic_mirror_symmetry',
      label: 'Дзеркальний Симетрик',
      icon: '🪞',
      blurb: 'Домалюй другу половинку — як у дзеркалі',
      intro: 'Тут намальована лише ліва половинка малюнка. Права має бути такою самою, тільки віддзеркаленою. Знайди її!',
      introFor: (step) => (step === 3 ? 'А тепер половинки справжніх малюнків: метелика, сердечка, ялинки. Знайди другу половинку!' : undefined),
      landmark: { name: 'Дзеркальний палац', emoji: '🏰' },
      steps: HALF_SIZE.length,
      difficulty: [1, 3],
      publishDate: V6_RELEASE,
      tasksPerLevel: 10,
      mechanics: 'UI_GRID_CHOICE',
      pool: mirrors,
    },
  ],
});
