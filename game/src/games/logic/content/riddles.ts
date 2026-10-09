import type { LangCode } from '@/core/lang';
import { pick, randInt, shuffle } from '@/core/utils/random';
import type { Clue, ClueCell } from '@/core/game/templates/types';
import { riddleWords } from '../lang/riddles';
import type { RiddleWords, Rule } from '../lang/riddles/types';

/**
 * «Логічні задачі» — riddles to reason out, not to calculate.
 *
 * A riddle is a FRAME (what kind of thinking it asks for) dressed in a SKIN
 * (who and what it is about). Each frame × skin is one kind of riddle; a kind
 * is dealt out to a step, and every time it is played the names and numbers
 * are drawn anew.
 *
 * This file only DRAWS a riddle — which things, which names, which numbers,
 * in what order — and builds the picture of its hint. It holds no words: a
 * riddle is told by `lang/riddles/<language>.ts`. That is what lets the same
 * draw be told in the language on the screen and in the voice's (see
 * `core/game/kernel/languages.ts`): every roll of the dice is made here, in
 * the same order whatever the language, and a card's id is its place in the
 * skin's list — never a word.
 */

export interface Answer {
  id: string;
  label: string;
  emoji?: string;
}

export interface Riddle {
  /** What tells one draw of a kind from another — a part of the task key, the same in every language. */
  variant: string;
  text: string;
  /** A number to find, or cards to choose from. */
  answer: number | { options: Answer[]; correct: string };
  /** How to think about it — the hint. */
  how: string;
  /** The same hint as a picture. */
  clue: Clue;
  emoji?: string;
}

/** `r` runs from 0 (the first kinds of a band) to 1 (the last): how far the numbers may grow. */
type Make = (r: number, W: RiddleWords) => Riddle;

const grow = (r: number, from: number, to: number) => Math.round(from + (to - from) * r);
const upTo = (n: number) => Array.from({ length: n }, (_, i) => i);
/**
 * Cards to choose from. `ids` come in the order the cards were always dealt
 * in, so the shuffle lands the same way in every language.
 */
const cards = (W: RiddleWords, ids: readonly number[], label: (i: number) => string, right: number, emoji?: (i: number) => string | undefined) => ({
  options: shuffle(ids.map((i): Answer => ({ id: `o${i}`, label: W.cap(label(i)), ...(emoji ? { emoji: emoji(i) } : {}) }))),
  correct: `o${right}`,
});

const one = (cells: ClueCell[], more: Omit<Clue, 'rows'> = {}): Clue => ({ rows: [{ cells }], ...more });
const times = (n: number, glyph: string): ClueCell[] => Array.from({ length: n }, () => ({ glyph }));
const line = (parts: [string | number, string?, string?][], asked = parts.length - 1): ClueCell[] =>
  parts.map(([glyph, note, link], i) => ({ glyph: String(glyph), note, link, mark: i === asked }));
const signed = (d: number) => (d > 0 ? `+${d}` : `−${-d}`);

/** How many names there are to draw from (`boys`, `girls` of a language). */
const NAMES = 8;

// ------------------------------------------------------------ one of several
const ONE_OF: string[][] = [
  ['⚽', '🪆', '🧱', '🚗'],
  ['🍎', '🍐', '🍌', '🍋'],
  ['🐱', '🐶', '🦔', '🐇'],
  ['🥐', '🥟', '🥞', '🥯'],
  ['✏️', '🖊️', '🖌️', '📏'],
  ['👨', '👩', '👴', '👵'],
  ['🧥', '👗', '👔', '🧣'],
  ['🚲', '🛴', '🏍️', '🚜'],
  ['🦉', '🦜', '🐿️', '🐦‍⬛'],
  ['📕', '🤖', '🧩', '🧸'],
];
const oneOf = (emoji: string[], skin: number): Make => (r, W) => {
  const words = W.oneOf(skin);
  const set = shuffle(upTo(emoji.length)).slice(0, r < 0.5 ? 3 : 4);
  const [right, ...out] = shuffle(set);
  return {
    variant: `${[...set].sort().join('+')}=${right}`,
    ...words.tell(set, out),
    answer: cards(W, set, (i) => words.things[i], right, (i) => emoji[i]),
    clue: one(set.map((i) => ({ glyph: emoji[i], note: words.things[i], crossed: out.includes(i) }))),
  };
};

// ------------------------------------------------------------ three in a row
const ROWS_OF_THREE: string[][] = [
  ['🐱', '🐶', '🐭'],
  ['🐘', '🦒', '🦓'],
  ['🦉', '🦜', '🕊️'],
  ['🦆', '🦢', '🐸'],
  ['🦁', '🐯', '🐻'],
  ['🐄', '🐴', '🐑'],
  ['🦔', '🐿️', '🐇'],
  ['🤖', '🪆', '🧸'],
  ['🌳', '🌲', '🌴'],
  ['🚌', '🚋', '🚚'],
];
const rowOfThree = (emoji: string[], skin: number): Make => (r, W) => {
  const words = W.row(skin);
  const [left, middle, right] = shuffle(upTo(3));
  // Who is asked about: the one in the middle first; later the ones at the ends too.
  const asked = pick<0 | 1 | 2>(r >= 0.4 ? [0, 1, 2] : [0]);
  const leftFirst = Math.random() < 0.5;
  return {
    variant: `${left}|${middle}|${right}:${asked}`,
    ...words.tell(left, middle, right, asked, leftFirst),
    answer: cards(W, upTo(3), (i) => words.names[i], [middle, left, right][asked], (i) => emoji[i]),
    clue: one([left, middle, right].map((i) => ({ glyph: emoji[i], note: words.names[i] })), { ends: words.ends }),
  };
};

// ------------------------------------------------------------ who is the most
/** How many ways to compare there are (`COMPARE` of a language): taller, older, stronger… */
const COMPARE = 10;
const chain = (size: 3 | 4) => (_: undefined, skin: number): Make => (r, W) => {
  const girls = Math.random() < 0.5;
  const names = girls ? W.girls : W.boys;
  const row = shuffle(upTo(NAMES)).slice(0, size);
  const links = upTo(size - 1);
  const order = r >= 0.5 ? shuffle(links) : links;
  const low = r >= 0.3 && Math.random() < 0.5;
  return {
    variant: `${girls ? 'g' : 'b'}${row.join('>')}:${low ? 'low' : 'top'}:${order[0]}`,
    ...W.chain(skin, girls).tell(row, order, low),
    answer: cards(W, row, (i) => names[i], low ? row[size - 1] : row[0]),
    clue: one(row.map((w, i) => ({ glyph: girls ? '👧' : '👦', note: names[w], level: size - i }))),
  };
};

// ------------------------------------------------------------ the next number
const RULES: [string, (r: number) => { row: number[]; next: number; rule: Rule; by?: string; pairs?: boolean }][] = [
  ['+k', (r) => { const k = pick([2, 5, 10].slice(0, grow(r, 2, 3))); const a = randInt(1, 9); return { row: [0, 1, 2, 3].map((i) => a + k * i), next: a + k * 4, rule: { kind: 'add', by: k } }; }],
  ['-k', (r) => { const k = randInt(1, grow(r, 2, 4)); const a = randInt(20, 40); return { row: [0, 1, 2, 3].map((i) => a - k * i), next: a - k * 4, rule: { kind: 'sub', by: k } }; }],
  ['+3', () => { const k = pick([3, 4]); const a = randInt(1, 10); return { row: [0, 1, 2, 3].map((i) => a + k * i), next: a + k * 4, rule: { kind: 'add', by: k } }; }],
  ['x2', () => { const a = randInt(1, 4); return { row: [a, a * 2, a * 4, a * 8], next: a * 16, rule: { kind: 'double' }, by: '×2' }; }],
  ['grow', () => { const a = randInt(1, 6); const row = [a, a + 1, a + 3, a + 6]; return { row, next: a + 10, rule: { kind: 'grow' } }; }],
  ['alt', () => { const a = randInt(1, 9); const k = randInt(2, 4); const j = randInt(5, 7); return { row: [a, a + k, a + k + j, a + 2 * k + j, a + 2 * k + 2 * j], next: a + 3 * k + 2 * j, rule: { kind: 'alt', by: k, then: j } }; }],
  ['half', () => { const a = pick([48, 64, 80, 96]); return { row: [a, a / 2, a / 4], next: a / 8, rule: { kind: 'half' }, by: ':2' }; }],
  ['two', () => { const a = randInt(1, 5); const b = randInt(10, 15); return { row: [a, b, a + 1, b + 1, a + 2], next: b + 2, rule: { kind: 'two' }, pairs: true }; }],
  ['x3', () => { const a = randInt(1, 3); return { row: [a, a * 3, a * 9], next: a * 27, rule: { kind: 'triple' }, by: '×3' }; }],
  ['-grow', () => { const a = randInt(30, 50); return { row: [a, a - 1, a - 3, a - 6], next: a - 10, rule: { kind: 'shrink' } }; }],
];
const sequence = ([, make]: (typeof RULES)[number]): Make => (r, W) => {
  const { row, next, rule, by, pairs } = make(r);
  const cells: ClueCell[] = row.map((n, i) => ({ glyph: String(n), link: i === 0 || pairs ? undefined : by ?? signed(n - row[i - 1]), mark: pairs && i % 2 === 1 }));
  return {
    variant: row.join(','),
    ...W.next(row, rule),
    answer: next,
    clue: { rows: [{ cells: [...cells, { glyph: '?', mark: true, link: pairs ? undefined : '→' }] }], dense: row.length > 4 },
  };
};

// ------------------------------------------------------------ a place in a queue
/** Whether the skin tells the place from both ends («третій спереду і п’ятий ззаду»). */
const QUEUES = [false, false, false, false, false, true, true, true, true, true];
const queue = (both: boolean, skin: number): Make => (r, W) => {
  const words = W.queue(skin);
  const a = both ? randInt(2, grow(r, 4, 8)) : randInt(5, grow(r, 6, 9));
  const b = both ? randInt(2, grow(r, 4, 8)) : randInt(5, grow(r, 6, 9));
  return {
    variant: `${a}:${b}`,
    ...words.tell(a, b),
    answer: a + b + 1,
    clue: { rows: [{ cells: [...times(a, '🔵'), { glyph: '🔴', mark: true }, ...times(b, '🔵')] }], ends: words.ends, dense: true },
  };
};

// ------------------------------------------------------------ legs and wheels
const LEGS: [legsX: number, legsY: number, emoji: string][] = [
  [2, 4, '🐔🐶'], [2, 4, '🪿🐄'], [2, 4, '🐓🐴'], [2, 4, '🕊️🐱'], [2, 4, '🦆🐑'], [2, 4, '🚲🚗'], [2, 3, '🛴'], [3, 4, '🪑'], [6, 2, '🐞🐦'], [8, 6, '🕷️🪰'],
];
const legs = ([legsX, legsY, emoji]: (typeof LEGS)[number], skin: number): Make => (r, W) => {
  const words = W.legs(skin);
  const a = randInt(5, grow(r, 5, 6));
  const b = randInt(5, grow(r, 5, 7));
  return {
    variant: `${a}:${b}`,
    emoji,
    ...words.tell(a, b),
    answer: a * legsX + b * legsY,
    clue: { rows: [{ label: words.labels[0], cells: times(a, String(legsX)) }, { label: words.labels[1], cells: times(b, String(legsY)) }], dense: true },
  };
};

// ------------------------------------------------------------ days of the week
/** Which day is named (0 — today, 1 — tomorrow, −1 — yesterday…) and which is asked about. */
const DAY_ASKS: [named: number, asked: number][] = [[0, 1], [0, -1], [0, 2], [0, -2], [0, 3], [0, 5], [1, -1], [-1, 1], [-2, 0], [2, 0]];
const weekday = (i: number) => ((i % 7) + 7) % 7;
const days = ([named, asked]: (typeof DAY_ASKS)[number], skin: number): Make => (_, W) => {
  const today = randInt(0, 6);
  const given = weekday(today + named);
  const right = weekday(today + asked);
  const others = shuffle(upTo(7).filter((d) => d !== right)).slice(0, 5);
  return {
    variant: `${today}`,
    emoji: '📅',
    ...W.days.tell(skin, given),
    answer: cards(W, [right, ...others], (d) => W.days.names[d], right),
    clue: one(
      Array.from({ length: 7 }, (__, i) => {
        const at = Math.min(named, asked, 0) + i;
        return { glyph: W.days.short[weekday(today + at)], ...(at === named ? { mark: true, note: W.days.note(skin) } : {}) };
      }),
      { dense: true },
    ),
  };
};

// ------------------------------------------------------------ cuts and pieces
const CUTS: [emoji: string, find: 'cuts' | 'pieces'][] = [
  ['🪵', 'cuts'], ['🪢', 'cuts'], ['🥖', 'cuts'], ['🎀', 'cuts'], ['🌳', 'cuts'], ['🪚', 'pieces'], ['🌭', 'pieces'], ['✂️', 'pieces'], ['🍫', 'pieces'], ['🚧', 'pieces'],
];
const cuts = ([emoji, find]: (typeof CUTS)[number], skin: number): Make => (r, W) => {
  const n = randInt(5, grow(r, 6, 12));
  const gaps = emoji === '🌳' || emoji === '🚧';
  const piece = emoji === '🌳' ? '🌳' : emoji === '🚧' ? '🪵' : '🟫';
  return {
    variant: `${n}`,
    emoji,
    ...W.cuts(skin).tell(n),
    answer: find === 'cuts' ? n - 1 : n + 1,
    clue: { rows: [{ cells: times(find === 'cuts' ? n : n + 1, piece).map((cell, i) => ({ ...cell, link: i ? (gaps ? '↔' : '✂️') : undefined })) }], dense: true },
  };
};

// ------------------------------------------------------------ a repeating row
const REPEATS: string[][] = [
  ['🔴', '🔵', '🟡'], ['🟢', '🟡', '🔵'], ['🔴', '⚪', '🔵'], ['⚫', '⚪', '🩶'], ['🟡', '🔴', '🟢'], ['🔵', '🟡', '🔴'], ['⚪', '🟡', '🟣'], ['🟢', '🔵', '🟠'], ['🔴', '🟡', '🟢'], ['⚫', '🔴', '⚪'],
];
const repeats = (emoji: string[], skin: number): Make => (r, W) => {
  const words = W.repeats(skin);
  const period = r < 0.5 ? 2 : 3;
  const unit = shuffle(upTo(3)).slice(0, period);
  const place = randInt(period * 2 + 1, grow(r, 9, 15));
  const right = unit[(place - 1) % period];
  return {
    variant: `${unit.join('-')}:${place}`,
    emoji: [...unit, ...unit].map((c) => emoji[c]).join('') + '…',
    ...words.tell(unit, place),
    answer: cards(W, upTo(3), (c) => words.colours[c], right, (c) => emoji[c]),
    clue: one(
      Array.from({ length: place }, (_, i) => ({ glyph: i < period * 2 ? emoji[unit[i % period]] : i === place - 1 ? '?' : '▢', note: String(i + 1), mark: i === place - 1 })),
      { dense: true },
    ),
  };
};

// ------------------------------------------------------------ who was first
/** How many things there are to be first at (`RACES` of a language). */
const RACES = 10;
const race = (_: undefined, skin: number): Make => (r, W) => {
  const words = W.race(skin);
  const [first, second, third] = shuffle(upTo(NAMES)).slice(0, 3);
  const last = r >= 0.4 && Math.random() < 0.5;
  const told = pick<0 | 1 | 2>([0, 1, 2]);
  return {
    variant: `${first}>${second}>${third}:${last}:${told}`,
    ...words.tell(first, second, third, last, told),
    answer: cards(W, [first, second, third], (i) => W.boys[i], last ? third : first),
    clue: one([first, second, third].map((k, i) => ({ glyph: '👦', note: W.boys[k], link: i ? '→' : undefined })), { ends: words.ends }),
  };
};

// ------------------------------------------------------------ more and fewer
const HAVE = ['🍎', '⭐', '🌰', '🎈', '✏️', '🍬', '🐚', '📮', '🧱', '🪙'];
const more = (emoji: string, skin: number): Make => (r, W) => {
  const words = W.more(skin);
  const c = randInt(5, 9);
  const b = randInt(2, grow(r, 3, 6));
  const a = randInt(2, grow(r, 3, 6));
  const fewer = r >= 0.5 && Math.random() < 0.5;
  return {
    variant: `${c}:${b}:${a}:${fewer}`,
    emoji,
    ...words.tell(c, b, a, fewer),
    answer: fewer ? c : c + b + a,
    clue: one(line([[fewer ? c + a + b : c, words.names[0]], ['?', words.names[1], signed(fewer ? -b : b)], ['?', words.names[2], signed(fewer ? -a : a)]])),
  };
};

// ------------------------------------------------------------ families and ages
const FAMILY: Make[] = [
  (r, W) => { const a = randInt(1, grow(r, 2, 4)); const b = randInt(1, grow(r, 2, 4)); return { variant: `${a}:${b}`, emoji: '👨‍👩‍👧‍👦', ...W.family(0, [a, b]), answer: a + b + 1, clue: one([...times(a, '👧'), ...times(b, '👦'), { glyph: '👦', note: W.note.mark, mark: true }], { dense: true }) }; },
  (r, W) => { const k = randInt(2, grow(r, 3, 6)); return { variant: `${k}`, emoji: '👨‍👩‍👧‍👦', ...W.family(1, [k]), answer: k + 1, clue: one([...times(k, '👦'), { glyph: '👧', note: W.note.sister, mark: true }], { dense: true }) }; },
  (r, W) => { const k = randInt(2, grow(r, 3, 6)); return { variant: `${k}`, emoji: '👨‍👩‍👧‍👦', ...W.family(2, [k]), answer: k + 1, clue: one([...times(k, '👧'), { glyph: '👦', note: W.note.brother, mark: true }], { dense: true }) }; },
  (r, W) => { const n = randInt(2, grow(r, 2, 4)); return { variant: `${n}`, emoji: '👨‍👩‍👧‍👦', ...W.family(3, [n]), answer: n * 2 + 1, clue: one([...times(n, '👦'), ...times(n, '👧'), { glyph: '👧', note: W.note.olia, mark: true }], { dense: true }) }; },
  (r, W) => { const k = randInt(2, grow(r, 3, 5)); return { variant: `${k}`, emoji: '👨‍👩‍👧‍👦', ...W.family(4, [k]), answer: k * 2, clue: { rows: Array.from({ length: k }, () => ({ cells: [{ glyph: '👩' }, { glyph: '🧒', link: '→' }, { glyph: '🧒' }] })), dense: true } }; },
];
const AGES: Make[] = [
  (_, W) => { const a = randInt(5, 9); const d = randInt(2, 5); return { variant: `${a}:${d}`, emoji: '🎂', ...W.ages(0, [a, d]), answer: a + d, clue: one(line([[a, W.note.olia], ['?', W.note.brother, signed(d)]])) }; },
  (_, W) => { const a = randInt(6, 10); const d = randInt(2, 4); return { variant: `${a}:${d}`, emoji: '🎂', ...W.ages(1, [a, d]), answer: a, clue: one(line([['?', W.note.now], [a + d, W.note.later, signed(d)]], 0)) }; },
  (_, W) => { const a = randInt(3, 6); return { variant: `${a}`, emoji: '🎂', ...W.ages(2, [a]), answer: a * 2, clue: { rows: [{ label: W.note.olia, cells: [{ glyph: String(a) }] }, { label: W.note.olderSister, cells: [{ glyph: String(a) }, { glyph: String(a), link: '+' }] }] } }; },
  (_, W) => { const a = randInt(5, 8); const d = randInt(2, 3); const e = randInt(1, 3); return { variant: `${a}:${d}:${e}`, emoji: '🎂', ...W.ages(3, [a, d, e]), answer: a + e, clue: one(line([[a - d, W.note.then], ['?', W.note.now, signed(d)], ['?', W.note.later, signed(e)]])) }; },
  (_, W) => { const son = randInt(4, 9); const mum = randInt(27, 36); return { variant: `${son}:${mum}`, emoji: '🎂', ...W.ages(4, [son, mum]), answer: mum - son, clue: { rows: [{ label: W.note.son, cells: line([[0, W.note.then], [son, W.note.now, signed(son)]], -1) }, { label: W.note.mum, cells: line([['?', W.note.then], [mum, W.note.now, signed(son)]], 0) }] } }; },
];

// ------------------------------------------------------------ who has what
const OWNERS: string[][] = [
  ['🐱', '🐶', '🦜'], ['🍎', '🍐', '🍌'], ['⚽', '🏊', '🎾'], ['🎻', '🥁', '🎸'], ['📕', '🤖', '🧩'], ['🚲', '🛴', '🚌'], ['🔴', '🔵', '🟢'], ['🏠', '🌳', '⛵'], ['🧃', '🍵', '🥛'], ['🍫', '🍓', '🍦'],
];
const owners = (emoji: string[], skin: number): Make => (r, W) => {
  const words = W.owners(skin);
  const kids = shuffle(upTo(NAMES)).slice(0, 3);
  const has = shuffle(upTo(3));
  const hard = r >= 0.5;
  // Easy: two clues about one child. Hard: the second clue is about another child, and the third is asked about.
  const asked = hard ? 1 : 0;
  return {
    variant: `${kids.join('+')}:${has.join('+')}:${asked}`,
    ...words.tell(kids, has, hard),
    answer: cards(W, upTo(3), (t) => words.things[t], has[asked], (t) => emoji[t]),
    clue: { rows: kids.map((kid, k) => ({ label: W.boys[kid], cells: upTo(3).map((t) => ({ glyph: emoji[t], crossed: (k === 0 && t !== has[0]) || (hard && k === 2 && t === has[1]) })) })) },
  };
};

// ------------------------------------------------------------ everyone with everyone
const MEETINGS: [emoji: string, both: boolean][] = [['🤝', false], ['⚽', false], ['🛣️', false], ['💌', true], ['♟️', false]];
const meetings = ([emoji, both]: (typeof MEETINGS)[number], skin: number): Make => (r, W) => {
  const n = randInt(3, grow(r, 4, 6));
  return {
    variant: `${n}`,
    emoji,
    ...W.meetings(skin).tell(n),
    answer: both ? n * (n - 1) : (n * (n - 1)) / 2,
    clue: { rows: Array.from({ length: both ? n : n - 1 }, (_, i) => ({ label: `${i + 1} →`, cells: upTo(n).filter((j) => (both ? j !== i : j > i)).map((j) => ({ glyph: String(j + 1) })) })), dense: true },
  };
};

// ------------------------------------------------------------ a number in mind
const between = (lo: number, hi: number): Clue =>
  one(Array.from({ length: hi - lo + 1 }, (_, i) => ({ glyph: String(lo + i), crossed: i === 0 || lo + i === hi })), { dense: hi - lo > 5 });

const HIDDEN: Make[] = [
  (_, W) => { const even = randInt(2, 15) * 2; const lo = even - 2; const hi = even + 2; return { variant: `${lo}:${hi}`, emoji: '🔢', ...W.hidden(0, [lo, hi]), answer: even, clue: between(lo, hi) }; },
  (_, W) => { const odd = randInt(2, 15) * 2 + 1; return { variant: `${odd}`, emoji: '🔢', ...W.hidden(1, [odd - 2, odd + 2]), answer: odd, clue: between(odd - 2, odd + 2) }; },
  (_, W) => { const five = randInt(2, 9) * 5; return { variant: `${five}`, emoji: '🔢', ...W.hidden(2, [five - 3, five + 4]), answer: five, clue: between(five - 3, five + 4) }; },
  (_, W) => { const tens = randInt(1, 8); const ones = randInt(tens + 1, 9); return { variant: `${tens}${ones}`, emoji: '🔢', ...W.hidden(3, [tens, ones - tens]), answer: tens * 10 + ones, clue: one(line([[tens, W.note.tens], ['?', W.note.ones, signed(ones - tens)]])) }; },
  (_, W) => { const a = randInt(3, 9); const b = randInt(2, 9); return { variant: `${a}:${b}`, emoji: '🔢', ...W.hidden(4, [a, b]), answer: a * 2 - b, clue: one(line([['?', W.note.thought], [`${a} + ${a}`, undefined, `+${b} =`]], 0)) }; },
];

// ------------------------------------------------------------ the kinds, by step

/** One kind of riddle: a frame in a skin, with how far its numbers may grow. */
export interface RiddleKind {
  id: string;
  /** Draws the riddle anew and tells it in `lang` (Ukrainian when none is asked for). */
  make: (r: number, lang?: LangCode) => Riddle;
  r: number;
}
const kind = (id: string, make: Make): Omit<RiddleKind, 'r'> => ({ id, make: (r, lang) => make(r, riddleWords(lang)) });
const kindsOf = <S>(name: string, skins: readonly S[], frame: (skin: S, at: number) => Make) => skins.map((skin, i) => kind(`${name}${i}`, frame(skin, i)));
const made = (name: string, makes: readonly Make[]) => makes.map((make, i) => kind(`${name}${i}`, make));
const blank = (n: number): undefined[] => Array.from({ length: n }, () => undefined);

/** Five bands of difficulty, three frames in each; the frames of a band take turns. */
const BANDS = [
  [kindsOf('one', ONE_OF, oneOf), kindsOf('row', ROWS_OF_THREE, rowOfThree), kindsOf('chain', blank(COMPARE), chain(3))],
  [kindsOf('next', RULES, sequence), kindsOf('queue', QUEUES, queue), kindsOf('legs', LEGS, legs)],
  [kindsOf('day', DAY_ASKS, days), kindsOf('cut', CUTS, cuts), kindsOf('repeat', REPEATS, repeats)],
  [kindsOf('race', blank(RACES), race), kindsOf('more', HAVE, more), [...made('family', FAMILY), ...made('age', AGES)]],
  [kindsOf('own', OWNERS, owners), kindsOf('four', blank(COMPARE), chain(4)), [...made('meet', MEETINGS.map(meetings)), ...made('hidden', HIDDEN)]],
];

export const RIDDLE_KINDS: RiddleKind[] = BANDS.flatMap((frames) => {
  const longest = Math.max(...frames.map((f) => f.length));
  const band: Omit<RiddleKind, 'r'>[] = [];
  for (let i = 0; i < longest; i += 1) for (const frame of frames) if (frame[i]) band.push(frame[i]);
  return band.map((k, i) => ({ ...k, r: band.length > 1 ? i / (band.length - 1) : 0 }));
});

/** Three kinds are new on every step. */
export const RIDDLES_PER_STEP = 3;
export const RIDDLE_STEPS = Math.ceil(RIDDLE_KINDS.length / RIDDLES_PER_STEP);
