import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import type { GridChoicePayload } from '@/core/game/templates/types';
import { spoken, written } from '@/core/language/marks';
import { currencyOf, type CurrencyId } from '@/core/game/content/currency';
import { pick, randInt, uid } from '@/core/utils/random';
import { rewardForStep } from '../difficulty';
import { storyWords } from '../grammar/stories';
import type { Frame, StoryHero, StoryWords } from '../grammar/stories/types';
import { buildNumberOptions } from './options';

/**
 * Story problems. A problem is a FRAME (what has to be done with the numbers)
 * dressed in a SKIN (who and what the story is about); every frame × skin is
 * one kind, dealt out to a step.
 *
 * This file only DRAWS a problem — the numbers, the hero, the pictures — and
 * holds no words: a problem is told by `grammar/stories/<language>.ts`. Every
 * roll of the dice is made here, in the same order whatever the language, so
 * one draw can be told on the screen in one language and by the voice in
 * another (`core/game/kernel/languages.ts`) and stay one problem.
 */

/** The picture of a thing a story counts. */
const E = {
  apple: '🍎', pear: '🍐', candy: '🍬', pencil: '✏️', marker: '🖍️', book: '📚', ball: '⚽', balloon: '🎈', sticker: '⭐', nut: '🌰',
  car: '🚗', auto: '🚙', cube: '🧱', shell: '🐚', bird: '🐦', duck: '🦆', rabbit: '🐇', butterfly: '🦋', kitten: '🐱', bee: '🐝',
  star: '🌟', cake: '🧁', page: '📖', fish: '🐟', bigFish: '🐟', flower: '🌷', coin: '🪙', stamp: '📮', tomato: '🍅', cucumber: '🥒',
  carrot: '🥕', egg: '🥚', mushroom: '🍄', tree: '🌳', appleTree: '🌳', bush: '🌿', cup: '☕', plate: '🍽️', notebook: '📓', bun: '🥐',
  pie: '🥟', ticket: '🎟️', postcard: '💌', chair: '🪑', desk: '🪑', doll: '🪆', robot: '🤖', puzzle: '🧩', bike: '🚲', card: '🃏',
  photo: '🖼️', goal: '🥅', lap: '🏃', passenger: '🧍', pupil: '🧒', visitor: '🧑', athlete: '🏃', boy: '👦', girl: '👧', cow: '🐄',
  horse: '🐴', monkey: '🐒', parrot: '🦜',
} as const;
type Thing = keyof typeof E;

/** How many names a hero is drawn from (the boys' and the girls' of a language). */
const NAMES = 8;
function hero(): StoryHero {
  const boy = Math.random() < 0.5;
  return { boy, name: pick(Array.from({ length: NAMES }, (_, i) => i)) };
}

type Chip = { emoji: string; label?: string };
/** Small counts are shown as the things themselves; bigger ones as «🍎×9». */
const many = (emoji: string, n: number): string => (n <= 6 ? emoji.repeat(n) : `${emoji}×${n}`);
const chip = (emoji: string, label?: string | number): Chip => ({ emoji, label: label === undefined ? undefined : String(label) });
const ASK: Chip = { emoji: '❓' };

/** What a frame draws: the numbers its story is told with, the pictures, the answer. */
interface Drawn {
  /** The numbers, in the order the words of the frame take them. */
  n: number[];
  hero?: StoryHero;
  scene: Chip[];
  answer: number;
  /** What tells one draw of a kind from another (a part of the task key). */
  nums: number[];
  /**
   * The numbers the story names together with a thing («21 яблуко»). A number
   * that ends in one reads awkwardly there, so such a draw is thrown again.
   */
  counted: number[];
}

interface Told {
  money: CurrencyId;
  W: StoryWords;
}
type Draw = (r: number, t: Told) => Drawn;

/** A number between a floor and a ceiling that both grow with `r` (0…1 within a band). */
const span = (r: number, lo: [number, number], hi: [number, number]) => randInt(Math.round(lo[0] + (lo[1] - lo[0]) * r), Math.round(hi[0] + (hi[1] - hi[0]) * r));

// ------------------------------------------------------------ band 1: within ten
const JOIN: Thing[] = ['car', 'book', 'candy', 'bird', 'fish', 'flower', 'pencil', 'bike'];
const join = (thing: Thing, skin: number): Draw => (r, { W }) => {
  const a = span(r, [2, 3], [4, 5]);
  const b = span(r, [2, 3], [4, 5]);
  const [here, there] = W.chips.join(skin);
  return { n: [a, b], scene: [chip(many(E[thing], a), here), chip(many(E[thing], b), there), ASK], answer: a + b, nums: [a, b], counted: [a] };
};

const GOT_MORE: Thing[] = ['sticker', 'balloon', 'cube', 'nut', 'stamp', 'doll', 'robot', 'puzzle'];
const gotMore = (thing: Thing): Draw => (r) => {
  const h = hero();
  const a = span(r, [2, 3], [4, 6]);
  const b = span(r, [2, 2], [3, 4]);
  return { n: [a, b], hero: h, scene: [chip(many(E[thing], a), a), chip('➕'), chip(many(E[thing], b), b), ASK], answer: a + b, nums: [a, b], counted: [a] };
};

const CAME_IN: Thing[] = ['bird', 'duck', 'rabbit', 'butterfly', 'kitten', 'bee', 'auto', 'star'];
const cameIn = (thing: Thing): Draw => (r) => {
  const a = span(r, [2, 3], [4, 6]);
  const b = span(r, [2, 2], [3, 4]);
  return { n: [a, b], scene: [chip(many(E[thing], a), a), chip('➕'), chip(many(E[thing], b), b), ASK], answer: a + b, nums: [a, b], counted: [a] };
};

const GAVE: Thing[] = ['candy', 'sticker', 'apple', 'cube', 'balloon', 'pencil', 'flower', 'car'];
const gave = (thing: Thing): Draw => (r) => {
  const h = hero();
  const a = span(r, [4, 7], [6, 10]);
  const b = randInt(2, a - 2);
  return { n: [a, b], hero: h, scene: [chip(many(E[thing], a), a), chip('➖', b), ASK], answer: a - b, nums: [a, b], counted: [a] };
};

const WENT_AWAY: Thing[] = ['bird', 'cake', 'mushroom', 'duck', 'auto', 'book', 'balloon', 'cup'];
const wentAway = (thing: Thing): Draw => (r) => {
  const a = span(r, [4, 7], [6, 10]);
  const b = randInt(2, a - 2);
  return { n: [a, b], scene: [chip(many(E[thing], a), a), chip('➖', b), ASK], answer: a - b, nums: [a, b], counted: [a] };
};

// ------------------------------------------------------------ band 2: within twenty
const TWO_KINDS: [Thing, Thing][] = [['boy', 'girl'], ['appleTree', 'pear'], ['cow', 'horse'], ['apple', 'pear'], ['tomato', 'cucumber'], ['cube', 'ball'], ['monkey', 'parrot'], ['cup', 'plate']];
const twoKinds = ([x, y]: [Thing, Thing]): Draw => (r) => {
  const a = span(r, [5, 7], [8, 11]);
  const b = span(r, [3, 5], [7, 9]);
  return { n: [a, b], scene: [chip(E[x], a), chip('➕'), chip(E[y], b), ASK], answer: a + b, nums: [a, b], counted: [a, b] };
};

const LEFT_20: Thing[] = ['passenger', 'page', 'sticker', 'apple', 'candy', 'auto', 'egg', 'cow'];
const left20 = (thing: Thing): Draw => (r) => {
  const a = span(r, [11, 14], [15, 20]);
  const b = span(r, [3, 4], [6, 9]);
  return { n: [a, b], scene: [chip(E[thing], a), chip('➖', b), ASK], answer: a - b, nums: [a, b], counted: [a] };
};

const MORE_PAIRS: Thing[] = ['sticker', 'car', 'mushroom', 'book', 'cube', 'pie', 'fish', 'flower'];
const howManyMore = (thing: Thing): Draw => (r, { W }) => {
  const a = span(r, [8, 11], [12, 18]);
  const b = randInt(3, a - 2);
  return { n: [a, b], scene: [chip(E[thing], a), chip(E[thing], b), chip('❓', W.chips.howManyMore)], answer: a - b, nums: [a, b], counted: [a] };
};

const FEWER_PAIRS: Thing[] = ['nut', 'balloon', 'candy', 'bird', 'pencil', 'mushroom', 'cake', 'stamp'];
const howManyFewer = (thing: Thing): Draw => (r, { W }) => {
  const a = span(r, [8, 11], [12, 18]);
  const b = randInt(3, a - 2);
  return { n: [a, b], scene: [chip(E[thing], a), chip(E[thing], b), chip('❓', W.chips.howManyFewer)], answer: a - b, nums: [a, b], counted: [a] };
};

const MISSING: Thing[] = ['candy', 'book', 'mushroom', 'bird', 'pencil', 'auto', 'coin', 'stamp'];
const missing = (thing: Thing): Draw => (r) => {
  const a = span(r, [4, 7], [8, 12]);
  const b = span(r, [2, 3], [5, 8]);
  return { n: [a, b], scene: [chip(E[thing], a), chip('➕', '?'), chip('🟰', a + b)], answer: b, nums: [a, b], counted: [a] };
};

// ------------------------------------------------------------ band 3: money and three numbers
const PRICE_PAIRS: [string, string][] = [['🧃', '🥐'], ['📓', '🖊️'], ['🍦', '💧'], ['🎟️', '🍿'], ['🪆', '⚽'], ['🍞', '🥛'], ['✏️', '🧽'], ['🍎', '🍌']];
const totalPrice = ([ex, ey]: [string, string]): Draw => (r, { W, money }) => {
  const p = span(r, [5, 12], [15, 40]);
  const q = span(r, [4, 8], [12, 30]);
  return { n: [p, q], scene: [chip(ex, W.chips.price(p, money)), chip('➕'), chip(ey, W.chips.price(q, money)), ASK], answer: p + q, nums: [p, q], counted: [p] };
};

const BOUGHT = ['📕', '🧸', '⚽', '📒', '🍦', '💐', '💌', '🎨'];
const change = (emoji: string): Draw => (r, { W, money }) => {
  const h = hero();
  const pay = pick(r < 0.5 ? [20, 50] : [50, 100]);
  const p = randInt(Math.round(pay * 0.3), pay - 3);
  return { n: [p, pay], hero: h, scene: [chip(emoji, W.chips.price(p, money)), chip('💵', W.chips.price(pay, money)), chip('❓', W.chips.change)], answer: pay - p, nums: [p, pay], counted: [p, pay] };
};

const WANTED = ['🍦', '🧱', '📕', '🛴', '🪆', '🎟️', '⚽', '🧩'];
const notEnough = (emoji: string): Draw => (r, { W, money }) => {
  const h = hero();
  const m = span(r, [5, 20], [15, 50]);
  const p = m + span(r, [2, 5], [9, 30]);
  return { n: [m, p], hero: h, scene: [chip('💵', W.chips.price(m, money)), chip(emoji, W.chips.price(p, money)), chip('❓', W.chips.lack)], answer: p - m, nums: [m, p], counted: [m] };
};

/** Whether the price went up, and the thing. */
const REPRICED: [up: boolean, emoji: string][] = [[false, '🧸'], [true, '🎟️'], [false, '📕'], [true, '🧃'], [false, '🎂'], [true, '🪆'], [false, '⚽'], [true, '🍦']];
const repriced = ([up, emoji]: [boolean, string]): Draw => (r, { W, money }) => {
  const a = span(r, [12, 30], [25, 80]);
  const b = span(r, [2, 5], [8, 19]);
  return { n: [a, b], scene: [chip(emoji, W.chips.price(a, money)), chip(up ? '⬆️' : '⬇️', W.chips.by(b)), ASK], answer: up ? a + b : a - b, nums: [a, b], counted: [a] };
};

const THREE: Thing[] = ['apple', 'page', 'book', 'bun', 'tree', 'passenger', 'goal', 'cube'];
const threeAdd = (thing: Thing): Draw => (r) => {
  const a = span(r, [5, 12], [12, 30]);
  const b = span(r, [5, 12], [12, 30]);
  const c = span(r, [5, 12], [12, 30]);
  return { n: [a, b, c], scene: [chip(E[thing], a), chip(E[thing], b), chip(E[thing], c), ASK], answer: a + b + c, nums: [a, b, c], counted: [a] };
};

// ------------------------------------------------------------ band 4: equal groups
const GROUPS: [Thing, string][] = [['pencil', '📦'], ['apple', '🧺'], ['cake', '🍽️'], ['candy', '🛍️'], ['flower', '🏺'], ['book', '📚'], ['egg', '🪺'], ['passenger', '🚃']];
const groups = ([, emoji]: [Thing, string]): Draw => (r) => {
  const k = span(r, [2, 4], [5, 9]);
  const m = span(r, [2, 3], [4, 6]);
  return { n: [k, m], scene: [...Array.from({ length: Math.min(m, 4) }, () => chip(emoji, k)), ...(m > 4 ? [chip('…')] : []), ASK], answer: k * m, nums: [k, m], counted: [k] };
};

const PRICED: Thing[] = ['notebook', 'bun', 'ticket', 'sticker', 'pencil', 'cake', 'postcard', 'balloon'];
const priceTimes = (thing: Thing): Draw => (r, { W, money }) => {
  const p = span(r, [3, 5], [8, 12]);
  const m = span(r, [2, 3], [5, 7]);
  return { n: [p, m], scene: [chip(E[thing], W.chips.price(p, money)), chip('✖️', m), ASK], answer: p * m, nums: [p, m], counted: [p, m] };
};

const ROWS: Thing[] = ['desk', 'carrot', 'chair', 'candy', 'athlete', 'tree', 'sticker', 'auto'];
const rows = (thing: Thing): Draw => (r) => {
  const m = span(r, [2, 3], [5, 7]);
  const k = span(r, [3, 4], [6, 9]);
  return { n: [m, k], scene: [chip(E[thing], `${m} × ${k}`), ASK], answer: m * k, nums: [m, k], counted: [m, k] };
};

const SHARED: Thing[] = ['candy', 'apple', 'nut', 'sticker', 'cake', 'carrot', 'balloon', 'fish'];
const share = (thing: Thing): Draw => (r) => {
  const m = span(r, [2, 3], [4, 6]);
  const q = span(r, [2, 3], [5, 9]);
  const total = m * q;
  return { n: [total, m], scene: [chip(E[thing], total), chip('➗', m), ASK], answer: q, nums: [total, m], counted: [total] };
};

const PACKED: Thing[] = ['pencil', 'egg', 'apple', 'book', 'flower', 'candy', 'photo', 'bun'];
const pack = (thing: Thing): Draw => (r, { W }) => {
  const k = span(r, [2, 3], [5, 8]);
  const q = span(r, [2, 3], [5, 9]);
  const total = k * q;
  return { n: [total, k], scene: [chip(E[thing], total), chip('📦', W.chips.each(k)), ASK], answer: q, nums: [total, k], counted: [total] };
};

// ------------------------------------------------------------ band 5: two steps
const BOXES_AND_LOOSE: [Thing, string][] = [['pencil', '📦'], ['apple', '🧺'], ['candy', '🛍️'], ['stamp', '📒'], ['flower', '🏺'], ['tomato', '📦'], ['fish', '🫙'], ['marker', '👝']];
const timesPlus = ([thing, emoji]: [Thing, string]): Draw => (r, { W }) => {
  const m = span(r, [2, 3], [4, 6]);
  const k = span(r, [3, 5], [6, 9]);
  const c = span(r, [2, 3], [6, 9]);
  return { n: [m, k, c], scene: [chip(emoji, `${m} × ${k}`), chip(E[thing], W.chips.extra(c)), ASK], answer: m * k + c, nums: [m, k, c], counted: [k] };
};

const BOUGHT_MANY: Thing[] = ['bun', 'notebook', 'sticker', 'pencil', 'balloon', 'ticket', 'postcard', 'cake'];
const timesChange = (thing: Thing): Draw => (r, { W, money }) => {
  const h = hero();
  const m = span(r, [2, 3], [4, 6]);
  const p = span(r, [3, 5], [7, 12]);
  const pay = [20, 50, 100].find((note) => note > m * p) ?? 100;
  return {
    n: [m, p, pay],
    hero: h,
    scene: [chip(many(E[thing], m), W.chips.eachPrice(p, money)), chip('💵', W.chips.price(pay, money)), chip('❓', W.chips.change)],
    answer: pay - m * p,
    nums: [m, p, pay],
    counted: [m, p, pay],
  };
};

const SHARED_THEN: Thing[] = ['candy', 'apple', 'sticker', 'nut', 'balloon', 'cake', 'carrot', 'card'];
const shareMinus = (thing: Thing): Draw => (r) => {
  const m = span(r, [2, 3], [4, 6]);
  const q = span(r, [4, 5], [7, 10]);
  const e = randInt(2, q - 2);
  const total = m * q;
  return { n: [total, m, e], scene: [chip(E[thing], total), chip('➗', m), chip('➖', e), ASK], answer: q - e, nums: [total, m, e], counted: [total] };
};

const TIMES_MORE: Thing[] = ['bush', 'sticker', 'fish', 'pupil', 'book', 'visitor', 'mushroom', 'bigFish'];
const timesMore = (thing: Thing): Draw => (r, { W }) => {
  const k = span(r, [3, 5], [7, 12]);
  const m = span(r, [2, 2], [3, 5]);
  return { n: [k, m], scene: [chip(E[thing], k), chip('✖️', W.chips.timesMore(m)), ASK], answer: k * m, nums: [k, m], counted: [k, m] };
};

const TIMES_FEWER: Thing[] = ['cube', 'car', 'apple', 'book', 'shell', 'flower', 'bun', 'duck'];
const timesFewer = (thing: Thing): Draw => (r, { W }) => {
  const m = span(r, [2, 2], [3, 5]);
  const q = span(r, [3, 4], [6, 10]);
  const total = m * q;
  return { n: [total, m], scene: [chip(E[thing], total), chip('➗', W.chips.timesFewer(m)), ASK], answer: q, nums: [total, m], counted: [total, m] };
};

// ------------------------------------------------------------ band 6: time, speed, working backwards
const MORE_TOTAL: Thing[] = ['book', 'apple', 'sticker', 'passenger', 'ticket', 'pupil', 'flower', 'lap'];
const moreTotal = (thing: Thing): Draw => (r, { W }) => {
  const a = span(r, [12, 20], [25, 40]);
  const b = span(r, [3, 5], [9, 15]);
  return { n: [a, b], scene: [chip(E[thing], a), chip(E[thing], W.chips.moreBy(b)), ASK], answer: a * 2 + b, nums: [a, b], counted: [a] };
};

/** How many things there are to start and to last (`TIMED` of a language). */
const TIMED = 8;
const timed = (): Draw => (_, { W }) => {
  const start = randInt(7, 12);
  const d = randInt(2, 8);
  return { n: [start, d], scene: [chip('🕐', W.chips.at(start)), chip('⏱️', W.chips.hours(d)), chip('❓', W.chips.when)], answer: start + d, nums: [start, d], counted: [d, d] };
};

/** Who moves, and how many kilometres an hour it may cover. */
const MOVERS: [emoji: string, range: [number, number]][] = [['🚴', [10, 15]], ['🥾', [3, 6]], ['⛵', [6, 10]], ['🚆', [40, 90]], ['🚌', [30, 60]], ['🐎', [8, 14]], ['⛷️', [7, 12]], ['🚢', [15, 30]]];
const speed = ([emoji, [lo, hi]]: (typeof MOVERS)[number]): Draw => (_, { W }) => {
  const k = hi > 20 ? randInt(lo / 10, hi / 10) * 10 : randInt(lo, hi);
  const m = randInt(2, 5);
  return { n: [k, m], scene: [chip(emoji, W.chips.speed(k)), chip('⏱️', W.chips.hours(m)), ASK], answer: k * m, nums: [k, m], counted: [k, m, m] };
};

/** A number in mind: what was done to it. Each gives the result, the number, and what the words need. */
const THOUGHT: (() => { out: number; answer: number; told: number[]; nums: number[] })[] = [
  () => { const x = randInt(12, 60); const a = randInt(8, 30); return { out: x + a, answer: x, told: [a], nums: [1, x, a] }; },
  () => { const x = randInt(30, 90); const a = randInt(8, 25); return { out: x - a, answer: x, told: [a], nums: [2, x, a] }; },
  () => { const x = randInt(3, 12); const m = randInt(2, 6); return { out: x * m, answer: x, told: [m], nums: [3, x, m] }; },
  () => { const m = randInt(2, 6); const x = m * randInt(3, 12); return { out: x / m, answer: x, told: [m], nums: [4, x, m] }; },
  () => { const x = randInt(10, 40); const a = randInt(5, 20); const b = randInt(5, 20); return { out: x + a + b, answer: x, told: [a, b], nums: [5, x, a, b] }; },
  () => { const x = randInt(3, 10); const m = randInt(2, 5); const a = randInt(3, 12); return { out: x * m + a, answer: x, told: [m, a], nums: [6, x, m, a] }; },
  () => { const x = randInt(25, 60); const a = randInt(5, 20); const b = randInt(5, 20); return { out: x - a + b, answer: x, told: [a, b], nums: [7, x, a, b] }; },
  () => { const x = randInt(8, 30); const a = randInt(3, 12); return { out: x * 2 - a, answer: x, told: [a], nums: [8, x, a] }; },
];
const thought = (make: (typeof THOUGHT)[number]): Draw => () => {
  const h = hero();
  const t = make();
  return { n: [t.out, ...t.told], hero: h, scene: [chip('💭', '?'), chip('➡️'), chip('🟰', t.out)], answer: t.answer, nums: t.nums, counted: [] };
};

const TWO_BUYS: [Thing, string][] = [['pencil', '📓'], ['bun', '🧃'], ['sticker', '📒'], ['balloon', '🎂'], ['ticket', '🍿'], ['postcard', '✉️'], ['notebook', '👝'], ['cake', '🍵'], ['candy', '🍫']];
const twoBuys = ([thing, emoji]: [Thing, string]): Draw => (_, { W, money }) => {
  const h = hero();
  const m = randInt(2, 6);
  const p = randInt(3, 9);
  const q = randInt(10, 35);
  return { n: [m, p, q], hero: h, scene: [chip(many(E[thing], m), W.chips.eachPrice(p, money)), chip(emoji, W.chips.price(q, money)), ASK], answer: m * p + q, nums: [m, p, q], counted: [m, p, q] };
};

const HALVES: Thing[] = ['candy', 'book', 'pie', 'sticker', 'apple', 'balloon', 'coin', 'tomato', 'cake'];
const halves = (thing: Thing): Draw => (_, { W }) => {
  const half = randInt(6, 20);
  const b = randInt(2, half - 2);
  return { n: [half, b], scene: [chip(E[thing], half * 2), chip('➗', W.chips.half), chip('➖', b), ASK], answer: half - b, nums: [half, b], counted: [half * 2] };
};

// ------------------------------------------------------------ the kinds, by step

/** One kind of problem: a frame in a skin, with how far its numbers may grow. */
interface Kind {
  id: string;
  frame: Frame;
  skin: number;
  draw: Draw;
  r: number;
}
const kindsOf = <S>(name: string, frame: Frame, skins: readonly S[], draw: (skin: S, at: number) => Draw) => skins.map((skin, i) => ({ id: `${name}${i}`, frame, skin: i, draw: draw(skin, i) }));
const blank = (n: number): undefined[] => Array.from({ length: n }, () => undefined);

/** Six bands of difficulty; the frames of a band take turns, so each step mixes them. */
const BANDS = [
  [kindsOf('join', 'join', JOIN, join), kindsOf('got', 'gotMore', GOT_MORE, gotMore), kindsOf('came', 'cameIn', CAME_IN, cameIn), kindsOf('gave', 'gave', GAVE, gave), kindsOf('away', 'wentAway', WENT_AWAY, wentAway)],
  [kindsOf('two', 'twoKinds', TWO_KINDS, twoKinds), kindsOf('left', 'left20', LEFT_20, left20), kindsOf('more', 'howManyMore', MORE_PAIRS, howManyMore), kindsOf('fewer', 'howManyFewer', FEWER_PAIRS, howManyFewer), kindsOf('miss', 'missing', MISSING, missing)],
  [kindsOf('sum', 'totalPrice', PRICE_PAIRS, totalPrice), kindsOf('change', 'change', BOUGHT, change), kindsOf('lack', 'notEnough', WANTED, notEnough), kindsOf('price', 'repriced', REPRICED, repriced), kindsOf('three', 'threeAdd', THREE, threeAdd)],
  [kindsOf('groups', 'groups', GROUPS, groups), kindsOf('cost', 'priceTimes', PRICED, priceTimes), kindsOf('rows', 'rows', ROWS, rows), kindsOf('share', 'share', SHARED, share), kindsOf('pack', 'pack', PACKED, pack)],
  [kindsOf('boxes', 'timesPlus', BOXES_AND_LOOSE, timesPlus), kindsOf('buy', 'timesChange', BOUGHT_MANY, timesChange), kindsOf('ate', 'shareMinus', SHARED_THEN, shareMinus), kindsOf('xmore', 'timesMore', TIMES_MORE, timesMore), kindsOf('xfewer', 'timesFewer', TIMES_FEWER, timesFewer)],
  [kindsOf('total', 'moreTotal', MORE_TOTAL, moreTotal), kindsOf('time', 'timed', blank(TIMED), timed), kindsOf('speed', 'speed', MOVERS, speed), kindsOf('thought', 'thought', THOUGHT, thought), kindsOf('buys', 'twoBuys', TWO_BUYS, twoBuys), kindsOf('half', 'halves', HALVES, halves)],
];

const KINDS: Kind[] = BANDS.flatMap((frames) => {
  const longest = Math.max(...frames.map((f) => f.length));
  const band: Omit<Kind, 'r'>[] = [];
  for (let i = 0; i < longest; i += 1) for (const frame of frames) if (frame[i]) band.push(frame[i]);
  return band.map((kind, i) => ({ ...kind, r: band.length > 1 ? i / (band.length - 1) : 0 }));
});

/** New kinds a step opens. */
const KINDS_PER_STEP = 5;
export const WORD_PROBLEM_STEPS = Math.ceil(KINDS.length / KINDS_PER_STEP);
export const WORD_PROBLEM_KINDS = KINDS.length;

/** «21 яблуко», «31 гривня»: a count that ends in one (but not eleven) reads awkwardly next to its thing. */
const awkward = (drawn: Drawn) => drawn.counted.some((n) => n % 10 === 1 && n % 100 !== 11);

/**
 * «Задачі» (UI_GRID_CHOICE): a short story with a question, pictured as a row
 * of chips (what is known, what is asked); the child taps the answer and it
 * flies into the ❓. A step asks the kinds it has just opened — earlier ones
 * return through the shell's recall draw (`core/game/engine/recall`). Nothing
 * is told after the answer: the next story starts at once.
 */
export function generateWordProblem(config: TaskConfig): TaskInstance<GridChoicePayload> {
  const step = Math.min(WORD_PROBLEM_STEPS, Math.max(1, config.step));
  const kind = pick(KINDS.slice((step - 1) * KINDS_PER_STEP, step * KINDS_PER_STEP));
  const told: Told = { money: currencyOf(config.currency).id, W: storyWords(config.lang) };
  let drawn = kind.draw(kind.r, told);
  for (let tries = 0; tries < 30; tries += 1) {
    drawn = kind.draw(kind.r, told);
    if (!awkward(drawn)) break;
  }
  const problem = told.W.tell(kind.frame, kind.skin, drawn.n, drawn.hero, told.money);
  return {
    id: uid('wp'),
    key: `wp:${kind.id}:${drawn.nums.join(',')}`,
    prompt: written(problem.text),
    speak: spoken(problem.text),
    reward: rewardForStep(config.step) + 1,
    payload: {
      template: Mechanics.GridChoice,
      cols: 3,
      stimulus: { scene: drawn.scene },
      options: buildNumberOptions(drawn.answer, 6, 6).map((n) => ({ id: `n${n}`, glyphs: [String(n)] })),
      correctId: `n${drawn.answer}`,
      hint: problem.how,
    },
  };
}
