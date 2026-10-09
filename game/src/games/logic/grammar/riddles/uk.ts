import { num, say, type Gender, type NumCase } from '@/core/language/uk';
import type { RiddleWords, Rule } from '@/games/logic/grammar/riddles/types';
import { fill } from '@/core/language/fill';
import TEXTS from '@/locales/app/uk/games/logic.json';

const J = TEXTS.riddles;

/**
 * «Логічні задачі» in Ukrainian — the words the riddles were first written in.
 * Every list keeps the order of the skins in `content/riddles.ts`.
 */

/** A number inside a sentence: the digit on the screen, the right word in the voice. */
const N = (n: number, g: Gender = 'm', c: NumCase = 'nom') => num(n, g, c);
const cap = (text: string) => text.charAt(0).toLocaleUpperCase('uk') + text.slice(1);

const BOYS: [string, string][] = [[J.BOYS[0][0], J.BOYS[0][1]], [J.BOYS[1][0], J.BOYS[1][1]], [J.BOYS[2][0], J.BOYS[2][1]], [J.BOYS[3][0], J.BOYS[3][1]], [J.BOYS[4][0], J.BOYS[4][1]], [J.BOYS[5][0], J.BOYS[5][1]], [J.BOYS[6][0], J.BOYS[6][1]], [J.BOYS[7][0], J.BOYS[7][1]]];

const GIRLS: [string, string][] = [[J.GIRLS[0][0], J.GIRLS[0][1]], [J.GIRLS[1][0], J.GIRLS[1][1]], [J.GIRLS[2][0], J.GIRLS[2][1]], [J.GIRLS[3][0], J.GIRLS[3][1]], [J.GIRLS[4][0], J.GIRLS[4][1]], [J.GIRLS[5][0], J.GIRLS[5][1]], [J.GIRLS[6][0], J.GIRLS[6][1]], [J.GIRLS[7][0], J.GIRLS[7][1]]];

const ONE_OF: [string, string, [string, string][]][] = [
  [J.ONE_OF[0][0], J.ONE_OF[0][1], [[J.ONE_OF[0][2][0][0], '⚽'], [J.ONE_OF[0][2][1][0], '🪆'], [J.ONE_OF[0][2][2][0], '🧱'], [J.ONE_OF[0][2][3][0], '🚗']]],
  [J.ONE_OF[1][0], J.ONE_OF[1][1], [[J.ONE_OF[1][2][0][0], '🍎'], [J.ONE_OF[1][2][1][0], '🍐'], [J.ONE_OF[1][2][2][0], '🍌'], [J.ONE_OF[1][2][3][0], '🍋']]],
  [J.ONE_OF[2][0], J.ONE_OF[2][1], [[J.ONE_OF[2][2][0][0], '🐱'], [J.ONE_OF[2][2][1][0], '🐶'], [J.ONE_OF[2][2][2][0], '🦔'], [J.ONE_OF[2][2][3][0], '🐇']]],
  [J.ONE_OF[3][0], J.ONE_OF[3][1], [[J.ONE_OF[3][2][0][0], '🥐'], [J.ONE_OF[3][2][1][0], '🥟'], [J.ONE_OF[3][2][2][0], '🥞'], [J.ONE_OF[3][2][3][0], '🥯']]],
  [J.ONE_OF[4][0], J.ONE_OF[4][1], [[J.ONE_OF[4][2][0][0], '✏️'], [J.ONE_OF[4][2][1][0], '🖊️'], [J.ONE_OF[4][2][2][0], '🖌️'], [J.ONE_OF[4][2][3][0], '📏']]],
  [J.ONE_OF[5][0], J.ONE_OF[5][1], [[J.ONE_OF[5][2][0][0], '👨'], [J.ONE_OF[5][2][1][0], '👩'], [J.ONE_OF[5][2][2][0], '👴'], [J.ONE_OF[5][2][3][0], '👵']]],
  [J.ONE_OF[6][0], J.ONE_OF[6][1], [[J.ONE_OF[6][2][0][0], '🧥'], [J.ONE_OF[6][2][1][0], '👗'], [J.ONE_OF[6][2][2][0], '👔'], [J.ONE_OF[6][2][3][0], '🧣']]],
  [J.ONE_OF[7][0], J.ONE_OF[7][1], [[J.ONE_OF[7][2][0][0], '🚲'], [J.ONE_OF[7][2][1][0], '🛴'], [J.ONE_OF[7][2][2][0], '🏍️'], [J.ONE_OF[7][2][3][0], '🚜']]],
  [J.ONE_OF[8][0], J.ONE_OF[8][1], [[J.ONE_OF[8][2][0][0], '🦉'], [J.ONE_OF[8][2][1][0], '🦜'], [J.ONE_OF[8][2][2][0], '🐿️'], [J.ONE_OF[8][2][3][0], '🐦‍⬛']]],
  [J.ONE_OF[9][0], J.ONE_OF[9][1], [[J.ONE_OF[9][2][0][0], '📕'], [J.ONE_OF[9][2][1][0], '🤖'], [J.ONE_OF[9][2][2][0], '🧩'], [J.ONE_OF[9][2][3][0], '🧸']]],
];

const ROWS_OF_THREE: [verb: string, what: string, three: [string, string, string][]][] = [
  [J.ROWS_OF_THREE[0][0], J.ROWS_OF_THREE[0][1], [[J.ROWS_OF_THREE[0][2][0][0], J.ROWS_OF_THREE[0][2][0][1], '🐱'], [J.ROWS_OF_THREE[0][2][1][0], J.ROWS_OF_THREE[0][2][1][1], '🐶'], [J.ROWS_OF_THREE[0][2][2][0], J.ROWS_OF_THREE[0][2][2][1], '🐭']]],
  [J.ROWS_OF_THREE[1][0], J.ROWS_OF_THREE[1][1], [[J.ROWS_OF_THREE[1][2][0][0], J.ROWS_OF_THREE[1][2][0][1], '🐘'], [J.ROWS_OF_THREE[1][2][1][0], J.ROWS_OF_THREE[1][2][1][1], '🦒'], [J.ROWS_OF_THREE[1][2][2][0], J.ROWS_OF_THREE[1][2][2][1], '🦓']]],
  [J.ROWS_OF_THREE[2][0], J.ROWS_OF_THREE[2][1], [[J.ROWS_OF_THREE[2][2][0][0], J.ROWS_OF_THREE[2][2][0][1], '🦉'], [J.ROWS_OF_THREE[2][2][1][0], J.ROWS_OF_THREE[2][2][1][1], '🦜'], [J.ROWS_OF_THREE[2][2][2][0], J.ROWS_OF_THREE[2][2][2][1], '🕊️']]],
  [J.ROWS_OF_THREE[3][0], J.ROWS_OF_THREE[3][1], [[J.ROWS_OF_THREE[3][2][0][0], J.ROWS_OF_THREE[3][2][0][1], '🦆'], [J.ROWS_OF_THREE[3][2][1][0], J.ROWS_OF_THREE[3][2][1][1], '🦢'], [J.ROWS_OF_THREE[3][2][2][0], J.ROWS_OF_THREE[3][2][2][1], '🐸']]],
  [J.ROWS_OF_THREE[4][0], J.ROWS_OF_THREE[4][1], [[J.ROWS_OF_THREE[4][2][0][0], J.ROWS_OF_THREE[4][2][0][1], '🦁'], [J.ROWS_OF_THREE[4][2][1][0], J.ROWS_OF_THREE[4][2][1][1], '🐯'], [J.ROWS_OF_THREE[4][2][2][0], J.ROWS_OF_THREE[4][2][2][1], '🐻']]],
  [J.ROWS_OF_THREE[5][0], J.ROWS_OF_THREE[5][1], [[J.ROWS_OF_THREE[5][2][0][0], J.ROWS_OF_THREE[5][2][0][1], '🐄'], [J.ROWS_OF_THREE[5][2][1][0], J.ROWS_OF_THREE[5][2][1][1], '🐴'], [J.ROWS_OF_THREE[5][2][2][0], J.ROWS_OF_THREE[5][2][2][1], '🐑']]],
  [J.ROWS_OF_THREE[6][0], J.ROWS_OF_THREE[6][1], [[J.ROWS_OF_THREE[6][2][0][0], J.ROWS_OF_THREE[6][2][0][1], '🦔'], [J.ROWS_OF_THREE[6][2][1][0], J.ROWS_OF_THREE[6][2][1][1], '🐿️'], [J.ROWS_OF_THREE[6][2][2][0], J.ROWS_OF_THREE[6][2][2][1], '🐇']]],
  [J.ROWS_OF_THREE[7][0], J.ROWS_OF_THREE[7][1], [[J.ROWS_OF_THREE[7][2][0][0], J.ROWS_OF_THREE[7][2][0][1], '🤖'], [J.ROWS_OF_THREE[7][2][1][0], J.ROWS_OF_THREE[7][2][1][1], '🪆'], [J.ROWS_OF_THREE[7][2][2][0], J.ROWS_OF_THREE[7][2][2][1], '🧸']]],
  [J.ROWS_OF_THREE[8][0], J.ROWS_OF_THREE[8][1], [[J.ROWS_OF_THREE[8][2][0][0], J.ROWS_OF_THREE[8][2][0][1], '🌳'], [J.ROWS_OF_THREE[8][2][1][0], J.ROWS_OF_THREE[8][2][1][1], '🌲'], [J.ROWS_OF_THREE[8][2][2][0], J.ROWS_OF_THREE[8][2][2][1], '🌴']]],
  [J.ROWS_OF_THREE[9][0], J.ROWS_OF_THREE[9][1], [[J.ROWS_OF_THREE[9][2][0][0], J.ROWS_OF_THREE[9][2][0][1], '🚌'], [J.ROWS_OF_THREE[9][2][1][0], J.ROWS_OF_THREE[9][2][1][1], '🚋'], [J.ROWS_OF_THREE[9][2][2][0], J.ROWS_OF_THREE[9][2][2][1], '🚚']]],
];

const COMPARE: [string, string, string, string, string, string][] = [
  [J.COMPARE[0][0], J.COMPARE[0][1], J.COMPARE[0][2], J.COMPARE[0][3], J.COMPARE[0][4], J.COMPARE[0][5]], [J.COMPARE[1][0], J.COMPARE[1][1], J.COMPARE[1][2], J.COMPARE[1][3], J.COMPARE[1][4], J.COMPARE[1][5]],
  [J.COMPARE[2][0], J.COMPARE[2][1], J.COMPARE[2][2], J.COMPARE[2][3], J.COMPARE[2][4], J.COMPARE[2][5]], [J.COMPARE[3][0], J.COMPARE[3][1], J.COMPARE[3][2], J.COMPARE[3][3], J.COMPARE[3][4], J.COMPARE[3][5]],
  [J.COMPARE[4][0], J.COMPARE[4][1], J.COMPARE[4][2], J.COMPARE[4][3], J.COMPARE[4][4], J.COMPARE[4][5]], [J.COMPARE[5][0], J.COMPARE[5][1], J.COMPARE[5][2], J.COMPARE[5][3], J.COMPARE[5][4], J.COMPARE[5][5]],
  [J.COMPARE[6][0], J.COMPARE[6][1], J.COMPARE[6][2], J.COMPARE[6][3], J.COMPARE[6][4], J.COMPARE[6][5]], [J.COMPARE[7][0], J.COMPARE[7][1], J.COMPARE[7][2], J.COMPARE[7][3], J.COMPARE[7][4], J.COMPARE[7][5]],
  [J.COMPARE[8][0], J.COMPARE[8][1], J.COMPARE[8][2], J.COMPARE[8][3], J.COMPARE[8][4], J.COMPARE[8][5]], [J.COMPARE[9][0], J.COMPARE[9][1], J.COMPARE[9][2], J.COMPARE[9][3], J.COMPARE[9][4], J.COMPARE[9][5]],
];

const QUEUES: [string, string, string, boolean][] = [
  [J.QUEUES[0][0], J.QUEUES[0][1], J.QUEUES[0][2], false], [J.QUEUES[1][0], J.QUEUES[1][1], J.QUEUES[1][2], false],
  [J.QUEUES[2][0], J.QUEUES[2][1], J.QUEUES[2][2], false], [J.QUEUES[3][0], J.QUEUES[3][1], J.QUEUES[3][2], false],
  [J.QUEUES[4][0], J.QUEUES[4][1], J.QUEUES[4][2], false],
  [J.QUEUES[5][0], J.QUEUES[5][1], '', true], [J.QUEUES[6][0], J.QUEUES[6][1], '', true],
  [J.QUEUES[7][0], J.QUEUES[7][1], '', true], [J.QUEUES[8][0], J.QUEUES[8][1], '', true],
  [J.QUEUES[9][0], J.QUEUES[9][1], '', true],
];

const ORDINALS = J.ORDINALS;

const ordinal = (n: number) => say(fill(J.ordinal, { n }), ORDINALS[n]);

const LEGS: [string, string, number, string, number, string, string][] = [
  [J.LEGS[0][0], J.LEGS[0][1], 2, J.LEGS[0][3], 4, J.LEGS[0][5], '🐔🐶'], [J.LEGS[1][0], J.LEGS[1][1], 2, J.LEGS[1][3], 4, J.LEGS[1][5], '🪿🐄'],
  [J.LEGS[2][0], J.LEGS[2][1], 2, J.LEGS[2][3], 4, J.LEGS[2][5], '🐓🐴'], [J.LEGS[3][0], J.LEGS[3][1], 2, J.LEGS[3][3], 4, J.LEGS[3][5], '🕊️🐱'],
  [J.LEGS[4][0], J.LEGS[4][1], 2, J.LEGS[4][3], 4, J.LEGS[4][5], '🦆🐑'], [J.LEGS[5][0], J.LEGS[5][1], 2, J.LEGS[5][3], 4, J.LEGS[5][5], '🚲🚗'],
  [J.LEGS[6][0], J.LEGS[6][1], 2, J.LEGS[6][3], 3, J.LEGS[6][5], '🛴'], [J.LEGS[7][0], J.LEGS[7][1], 3, J.LEGS[7][3], 4, J.LEGS[7][5], '🪑'],
  [J.LEGS[8][0], J.LEGS[8][1], 6, J.LEGS[8][3], 2, J.LEGS[8][5], '🐞🐦'], [J.LEGS[9][0], J.LEGS[9][1], 8, J.LEGS[9][3], 6, J.LEGS[9][5], '🕷️🪰'],
];

const DAYS: [string, Gender][] = [[J.DAYS[0][0], 'm'], [J.DAYS[1][0], 'm'], [J.DAYS[2][0], 'f'], [J.DAYS[3][0], 'm'], [J.DAYS[4][0], 'f'], [J.DAYS[5][0], 'f'], [J.DAYS[6][0], 'f']];

const DAYS_SHORT = J.DAYS_SHORT;

const was = (d: [string, Gender]) => (d[1] === 'f' ? J.was[1] : J.was[2]);

const DAY_ASKS: [number, string, number, string][] = [
  [0, J.DAY_ASKS[0][1], 1, J.DAY_ASKS[0][3]], [0, J.DAY_ASKS[1][1], -1, J.DAY_ASKS[1][3]], [0, J.DAY_ASKS[2][1], 2, J.DAY_ASKS[2][3]],
  [0, J.DAY_ASKS[3][1], -2, J.DAY_ASKS[3][3]], [0, J.DAY_ASKS[4][1], 3, J.DAY_ASKS[4][3]], [0, J.DAY_ASKS[5][1], 5, J.DAY_ASKS[5][3]],
  [1, J.DAY_ASKS[6][1], -1, J.DAY_ASKS[6][3]], [-1, J.DAY_ASKS[7][1], 1, J.DAY_ASKS[7][3]], [-2, J.DAY_ASKS[8][1], 0, J.DAY_ASKS[8][3]], [2, J.DAY_ASKS[9][1], 0, J.DAY_ASKS[9][3]],
];

const CUTS: [string, string, string, string, 'cuts' | 'pieces'][] = [
  [J.CUTS[0][0], J.CUTS[0][1], J.CUTS[0][2], '🪵', 'cuts'], [J.CUTS[1][0], J.CUTS[1][1], J.CUTS[1][2], '🪢', 'cuts'],
  [J.CUTS[2][0], J.CUTS[2][1], J.CUTS[2][2], '🥖', 'cuts'], [J.CUTS[3][0], J.CUTS[3][1], J.CUTS[3][2], '🎀', 'cuts'],
  [J.CUTS[4][0], J.CUTS[4][1], J.CUTS[4][2], '🌳', 'cuts'],
  [J.CUTS[5][0], J.CUTS[5][1], J.CUTS[5][2], '🪚', 'pieces'], [J.CUTS[6][0], J.CUTS[6][1], J.CUTS[6][2], '🌭', 'pieces'],
  [J.CUTS[7][0], J.CUTS[7][1], J.CUTS[7][2], '✂️', 'pieces'], [J.CUTS[8][0], J.CUTS[8][1], J.CUTS[8][2], '🍫', 'pieces'],
  [J.CUTS[9][0], J.CUTS[9][1], J.CUTS[9][2], '🚧', 'pieces'],
];

const REPEATS: [string, string, [string, string][]][] = [
  [J.REPEATS[0][0], J.REPEATS[0][1], [[J.REPEATS[0][2][0][0], '🔴'], [J.REPEATS[0][2][1][0], '🔵'], [J.REPEATS[0][2][2][0], '🟡']]], [J.REPEATS[1][0], J.REPEATS[1][1], [[J.REPEATS[1][2][0][0], '🟢'], [J.REPEATS[1][2][1][0], '🟡'], [J.REPEATS[1][2][2][0], '🔵']]],
  [J.REPEATS[2][0], J.REPEATS[2][1], [[J.REPEATS[2][2][0][0], '🔴'], [J.REPEATS[2][2][1][0], '⚪'], [J.REPEATS[2][2][2][0], '🔵']]], [J.REPEATS[3][0], J.REPEATS[3][1], [[J.REPEATS[3][2][0][0], '⚫'], [J.REPEATS[3][2][1][0], '⚪'], [J.REPEATS[3][2][2][0], '🩶']]],
  [J.REPEATS[4][0], J.REPEATS[4][1], [[J.REPEATS[4][2][0][0], '🟡'], [J.REPEATS[4][2][1][0], '🔴'], [J.REPEATS[4][2][2][0], '🟢']]], [J.REPEATS[5][0], J.REPEATS[5][1], [[J.REPEATS[5][2][0][0], '🔵'], [J.REPEATS[5][2][1][0], '🟡'], [J.REPEATS[5][2][2][0], '🔴']]],
  [J.REPEATS[6][0], J.REPEATS[6][1], [[J.REPEATS[6][2][0][0], '⚪'], [J.REPEATS[6][2][1][0], '🟡'], [J.REPEATS[6][2][2][0], '🟣']]], [J.REPEATS[7][0], J.REPEATS[7][1], [[J.REPEATS[7][2][0][0], '🟢'], [J.REPEATS[7][2][1][0], '🔵'], [J.REPEATS[7][2][2][0], '🟠']]],
  [J.REPEATS[8][0], J.REPEATS[8][1], [[J.REPEATS[8][2][0][0], '🔴'], [J.REPEATS[8][2][1][0], '🟡'], [J.REPEATS[8][2][2][0], '🟢']]], [J.REPEATS[9][0], J.REPEATS[9][1], [[J.REPEATS[9][2][0][0], '⚫'], [J.REPEATS[9][2][1][0], '🔴'], [J.REPEATS[9][2][2][0], '⚪']]],
];

const ORDINAL_F = J.ORDINAL_F;

const ORDINAL_M = J.ORDINAL_M;

const RACES = J.RACES;

const HAVE: [string, string, string, Gender][] = [
  [J.HAVE[0][0], J.HAVE[0][1], '🍎', 'n'], [J.HAVE[1][0], J.HAVE[1][1], '⭐', 'f'], [J.HAVE[2][0], J.HAVE[2][1], '🌰', 'm'], [J.HAVE[3][0], J.HAVE[3][1], '🎈', 'f'], [J.HAVE[4][0], J.HAVE[4][1], '✏️', 'm'],
  [J.HAVE[5][0], J.HAVE[5][1], '🍬', 'f'], [J.HAVE[6][0], J.HAVE[6][1], '🐚', 'f'], [J.HAVE[7][0], J.HAVE[7][1], '📮', 'f'], [J.HAVE[8][0], J.HAVE[8][1], '🧱', 'm'], [J.HAVE[9][0], J.HAVE[9][1], '🪙', 'f'],
];

const OWNERS: [string, [string, string, string][]][] = [
  [J.OWNERS[0][0], [[J.OWNERS[0][1][0][0], J.OWNERS[0][1][0][1], '🐱'], [J.OWNERS[0][1][1][0], J.OWNERS[0][1][1][1], '🐶'], [J.OWNERS[0][1][2][0], J.OWNERS[0][1][2][1], '🦜']]], [J.OWNERS[1][0], [[J.OWNERS[1][1][0][0], J.OWNERS[1][1][0][1], '🍎'], [J.OWNERS[1][1][1][0], J.OWNERS[1][1][1][1], '🍐'], [J.OWNERS[1][1][2][0], J.OWNERS[1][1][2][1], '🍌']]],
  [J.OWNERS[2][0], [[J.OWNERS[2][1][0][0], J.OWNERS[2][1][0][1], '⚽'], [J.OWNERS[2][1][1][0], J.OWNERS[2][1][1][1], '🏊'], [J.OWNERS[2][1][2][0], J.OWNERS[2][1][2][1], '🎾']]], [J.OWNERS[3][0], [[J.OWNERS[3][1][0][0], J.OWNERS[3][1][0][1], '🎻'], [J.OWNERS[3][1][1][0], J.OWNERS[3][1][1][1], '🥁'], [J.OWNERS[3][1][2][0], J.OWNERS[3][1][2][1], '🎸']]],
  [J.OWNERS[4][0], [[J.OWNERS[4][1][0][0], J.OWNERS[4][1][0][1], '📕'], [J.OWNERS[4][1][1][0], J.OWNERS[4][1][1][1], '🤖'], [J.OWNERS[4][1][2][0], J.OWNERS[4][1][2][1], '🧩']]], [J.OWNERS[5][0], [[J.OWNERS[5][1][0][0], J.OWNERS[5][1][0][1], '🚲'], [J.OWNERS[5][1][1][0], J.OWNERS[5][1][1][1], '🛴'], [J.OWNERS[5][1][2][0], J.OWNERS[5][1][2][1], '🚌']]],
  [J.OWNERS[6][0], [[J.OWNERS[6][1][0][0], J.OWNERS[6][1][0][1], '🔴'], [J.OWNERS[6][1][1][0], J.OWNERS[6][1][1][1], '🔵'], [J.OWNERS[6][1][2][0], J.OWNERS[6][1][2][1], '🟢']]], [J.OWNERS[7][0], [[J.OWNERS[7][1][0][0], J.OWNERS[7][1][0][1], '🏠'], [J.OWNERS[7][1][1][0], J.OWNERS[7][1][1][1], '🌳'], [J.OWNERS[7][1][2][0], J.OWNERS[7][1][2][1], '⛵']]],
  [J.OWNERS[8][0], [[J.OWNERS[8][1][0][0], J.OWNERS[8][1][0][1], '🧃'], [J.OWNERS[8][1][1][0], J.OWNERS[8][1][1][1], '🍵'], [J.OWNERS[8][1][2][0], J.OWNERS[8][1][2][1], '🥛']]], [J.OWNERS[9][0], [[J.OWNERS[9][1][0][0], J.OWNERS[9][1][0][1], '🍫'], [J.OWNERS[9][1][1][0], J.OWNERS[9][1][1][1], '🍓'], [J.OWNERS[9][1][2][0], J.OWNERS[9][1][2][1], '🍦']]],
];

/** «у Тараса», «в Остапа» */
const at = (whose: string) => `${/^[АЕЄИІЇОУЮЯ]/.test(whose) ? J.at[1] : J.at[2]} ${whose}`;

const MEETINGS: [who: [string, string, string, string], did: string, ask: string, emoji: string, both: boolean][] = [
  [[J.MEETINGS[0][0][0], J.MEETINGS[0][0][1], J.MEETINGS[0][0][2], J.MEETINGS[0][0][3]], J.MEETINGS[0][1], J.MEETINGS[0][2], '🤝', false],
  [[J.MEETINGS[1][0][0], J.MEETINGS[1][0][1], J.MEETINGS[1][0][2], J.MEETINGS[1][0][3]], J.MEETINGS[1][1], J.MEETINGS[1][2], '⚽', false],
  [[J.MEETINGS[2][0][0], J.MEETINGS[2][0][1], J.MEETINGS[2][0][2], J.MEETINGS[2][0][3]], J.MEETINGS[2][1], J.MEETINGS[2][2], '🛣️', false],
  [[J.MEETINGS[3][0][0], J.MEETINGS[3][0][1], J.MEETINGS[3][0][2], J.MEETINGS[3][0][3]], J.MEETINGS[3][1], J.MEETINGS[3][2], '💌', true],
  [[J.MEETINGS[4][0][0], J.MEETINGS[4][0][1], J.MEETINGS[4][0][2], J.MEETINGS[4][0][3]], J.MEETINGS[4][1], J.MEETINGS[4][2], '♟️', false],
];

const rule = (r: Rule): string => {
  switch (r.kind) {
    case 'add':
      return fill(J.rule[1], { r: N(r.by) });
    case 'sub':
      return fill(J.rule[2], { r: N(r.by) });
    case 'alt':
      return fill(J.rule[3], { r: N(r.by), r2: N(r.then) });
    case 'double':
      return J.rule[4];
    case 'triple':
      return J.rule[5];
    case 'half':
      return J.rule[6];
    case 'grow':
      return J.rule[7];
    case 'shrink':
      return J.rule[8];
    case 'two':
      return J.rule[9];
  }
};

export const uk: RiddleWords = {
  cap,
  boys: BOYS.map((b) => b[0]),
  girls: GIRLS.map((g) => g[0]),
  note: J.note,

  oneOf: (skin) => {
    const [lies, ask, things] = ONE_OF[skin];
    const name = (i: number) => things[i][0];
    return {
      things: things.map((t) => t[0]),
      tell: (set, out) => ({
        text: fill(J.oneOf.tell.text[1], { lies, set: set.slice(0, -1).map(name).join(', '), set2: name(set[set.length - 1]), out: out.slice(0, -1).map((i) => fill(J.oneOf.tell.text[2], { i: name(i) })).join(', '), out2: out.length > 1 ? J.oneOf.tell.text[3] : '', out3: name(out[out.length - 1]), ask }),
        how: fill(J.oneOf.tell.how, { out: out.map(name).join(', ') }),
      }),
    };
  },

  row: (skin) => {
    const [verb, what, three] = ROWS_OF_THREE[skin];
    return {
      names: three.map((t) => t[0]),
      ends: [J.row.ends[0], J.row.ends[1]],
      tell: (l, m, r, asked, leftFirst) => {
        const [left, middle, right] = [three[l], three[m], three[r]];
        const told = leftFirst
          ? fill(J.row.tell.told[1], { left: cap(left[0]), verb, middle: middle[1], right: right[0] })
          : fill(J.row.tell.told[2], { right: cap(right[0]), verb, middle: middle[1], left: left[0] });
        return {
          text: `${told} ${what} ${verb} ${J.row.tell.text[asked]}?`,
          how: fill(J.row.tell.how, { left: left[0], middle: middle[0], right: right[0] }),
        };
      },
    };
  },

  chain: (skin, girls) => {
    const [m, f, topM, topF, lowM, lowF] = COMPARE[skin];
    const names = girls ? GIRLS : BOYS;
    const more = girls ? f : m;
    return {
      tell: (row, order, low) => {
        const links = row.slice(0, -1).map((who, i) => fill(J.chain.tell.links, { names: names[who][0], more, names2: names[row[i + 1]][1] }));
        const told = order.map((i) => links[i]);
        return {
          text: fill(J.chain.tell.text, { told: told.slice(0, -1).join(', '), told2: told[told.length - 1], low: low ? (girls ? lowF : lowM) : girls ? topF : topM }),
          how: fill(J.chain.tell.how, { row: row.map((w) => names[w][0]).join(', '), girls: girls ? topF : topM, girls2: girls ? lowF : lowM }),
        };
      },
    };
  },

  next: (row, r) => ({ text: fill(J.next.text, { row: row.join(', ') }), how: fill(J.next.how, { r: rule(r) }) }),

  queue: (skin) => {
    const [who, x, y, both] = QUEUES[skin];
    return {
      ends: [J.queue.ends[0], J.queue.ends[1]],
      tell: (a, b) =>
        both
          ? {
              text: fill(J.queue.tell.text[1], { who, a: ordinal(a + 1), b: ordinal(b + 1), x }),
              how: fill(J.queue.tell.how[1], { a: N(a), b: N(b) }),
            }
          : {
              text: fill(J.queue.tell.text[2], { who, a: N(a), x, b: N(b), y }),
              how: fill(J.queue.tell.how[2], { a: N(a), b: N(b) }),
            },
    };
  },

  legs: (skin) => {
    const [where, x, legsX, y, legsY, ask] = LEGS[skin];
    return {
      labels: [cap(x), cap(y)],
      tell: (a, b) => ({ text: fill(J.legs.tell.text, { where, a: N(a), x, b: N(b), y, ask }), how: fill(J.legs.tell.how, { a: N(a), legsX: N(legsX), b: N(b), legsY: N(legsY) }) }),
    };
  },

  days: {
    names: DAYS.map((d) => d[0]),
    short: DAYS_SHORT,
    tell: (ask, given) => {
      const [named, told, , question] = DAY_ASKS[ask];
      const d = DAYS[given];
      const tells = named < 0 ? `${told} ${was(d)} ${d[0]}.` : `${told} ${d[0]}.`;
      return {
        text: `${tells} ${question}`,
        how: fill(J.days.tell.how, { x: DAYS.map((x) => x[0]).join(', ') }),
      };
    },
    note: (ask) => DAY_ASKS[ask][1].replace(' буде', '').toLocaleLowerCase('uk'),
  },

  cuts: (skin) => {
    const [told, what, ask, , find] = CUTS[skin];
    return {
      tell: (n) => ({
        text: `${told} ${N(n)} ${what}. ${ask}`,
        how: fill(J.cuts.tell.how[1], { find: find === 'cuts' ? J.cuts.tell.how[2] : J.cuts.tell.how[3] }),
      }),
    };
  },

  repeats: (skin) => {
    const [told, thing, colours] = REPEATS[skin];
    const name = (i: number) => colours[i][0];
    return {
      colours: colours.map((c) => c[0]),
      tell: (unit, place) => {
        const fem = thing.endsWith('а');
        const nth = say(`${place}-${fem ? J.repeats.tell.nth[1] : J.repeats.tell.nth[2]}`, (fem ? ORDINAL_F : ORDINAL_M)[place].replace(/а$/, J.repeats.tell.nth[3]).replace(/я$/, J.repeats.tell.nth[4]).replace(/ий$/, J.repeats.tell.nth[5]).replace(/ій$/, J.repeats.tell.nth[6]));
        return {
          text: fill(J.repeats.tell.text, { told, unit: [...unit, ...unit].map(name).join(', '), thing, nth }),
          how: fill(J.repeats.tell.how, { unit: N(unit.length), unit2: unit.map(name).join(', ') }),
        };
      },
    };
  },

  race: (skin) => {
    const did = RACES[skin];
    return {
      ends: [J.race.ends[0], J.race.ends[1]],
      tell: (f, s, t, last, told) => {
        const [first, second, third] = [BOYS[f], BOYS[s], BOYS[t]];
        const tells = [
          fill(J.race.tell.tells[0], { second: second[0], did, third: third[1], first: first[1] }),
          fill(J.race.tell.tells[1], { second: second[0], did, first: first[1], third: third[1] }),
          fill(J.race.tell.tells[2], { first: first[0], did, second: second[1], third: third[0] }),
        ][told];
        return { text: fill(J.race.tell.text[1], { tells, did, last: last ? J.race.tell.text[2] : J.race.tell.text[3] }), how: fill(J.race.tell.how, { first: first[0], second: second[0], third: third[0] }) };
      },
    };
  },

  more: (skin) => {
    const [, many, , g] = HAVE[skin];
    return {
      names: [J.more.names[0], J.more.names[1], J.more.names[2]],
      tell: (c, b, a, fewer) => ({
        text: fewer
          ? fill(J.more.tell.text[1], { c: N(c + a + b, g), many, b: N(b, g), a: N(a, g) })
          : fill(J.more.tell.text[2], { c: N(c, g), many, b: N(b, g), a: N(a, g) }),
        how: J.more.tell.how,
      }),
    };
  },

  family: (at, [a, b]) =>
    [
      () => ({ text: fill(J.family[0].text[1], { a: N(a, 'f'), a2: a === 1 ? J.family[0].text[2] : a < 5 ? J.family[0].text[3] : J.family[0].text[4], b: N(b, 'm'), b2: b === 1 ? J.family[0].text[5] : b < 5 ? J.family[0].text[6] : J.family[0].text[7] }), how: J.family[0].how }),
      () => ({ text: fill(J.family[1].text[1], { a: N(a), a2: a < 5 ? J.family[1].text[2] : J.family[1].text[3] }), how: J.family[1].how }),
      () => ({ text: fill(J.family[2].text[1], { a: N(a, 'f'), a2: a < 5 ? J.family[2].text[2] : J.family[2].text[3] }), how: J.family[2].how }),
      () => ({ text: fill(J.family[3].text, { a: N(a) }), how: J.family[3].how }),
      () => ({ text: fill(J.family[4].text[1], { a: N(a, 'f'), a2: a < 5 ? J.family[4].text[2] : J.family[4].text[3] }), how: J.family[4].how }),
    ][at](),

  ages: (at, [a, d, e]) =>
    [
      () => ({ text: fill(J.ages[0].text[1], { a: N(a), d: N(d), d2: d < 5 ? J.ages[0].text[2] : J.ages[0].text[3] }), how: J.ages[0].how }),
      () => ({ text: fill(J.ages[1].text, { d: N(d), a: N(a + d) }), how: J.ages[1].how }),
      () => ({ text: fill(J.ages[2].text[1], { a: N(a), a2: a < 5 ? J.ages[2].text[2] : J.ages[2].text[3] }), how: J.ages[2].how }),
      () => ({ text: fill(J.ages[3].text[1], { d: cap(d === 2 ? J.ages[3].text[2] : J.ages[3].text[3]), a: N(a - d), a2: a - d < 5 ? J.ages[3].text[4] : J.ages[3].text[5], e: N(e), e2: e === 1 ? J.ages[3].text[6] : J.ages[3].text[7] }), how: J.ages[3].how }),
      () => ({ text: fill(J.ages[4].text, { d: N(d), a: N(a) }), how: J.ages[4].how }),
    ][at](),

  hidden: (at, [a, b]) =>
    [
      () => ({ text: fill(J.hidden[0].text, { a: N(a), b: N(b) }), how: fill(J.hidden[0].how, { a: N(a), b: N(b) }) }),
      () => ({ text: fill(J.hidden[1].text, { a: N(a), b: N(b) }), how: fill(J.hidden[1].how, { a: N(a), b: N(b) }) }),
      () => ({ text: fill(J.hidden[2].text, { a: N(a), b: N(b) }), how: J.hidden[2].how }),
      () => ({ text: fill(J.hidden[3].text, { a: N(a), b: N(b) }), how: fill(J.hidden[3].how, { a: N(a, 'm', 'gen'), b: N(b) }) }),
      () => ({ text: fill(J.hidden[4].text, { b: N(b), a: N(a) }), how: fill(J.hidden[4].how, { a: N(a), b: N(b) }) }),
    ][at](),

  owners: (skin) => {
    const [what, things] = OWNERS[skin];
    return {
      things: things.map((t) => t[1]),
      tell: (who, got, hard) => {
        const kids = who.map((k) => BOYS[k]);
        const has = got.map((t) => things[t]);
        const asked = hard ? 1 : 0;
        const clues = hard
          ? fill(J.owners.tell.clues[1], { kids: cap(at(kids[0][1])), has: has[1][1], has2: has[2][1], kids2: cap(at(kids[2][1])) })
          : fill(J.owners.tell.clues[2], { kids: cap(at(kids[0][1])), has: has[1][1], has2: has[2][1] });
        return {
          text: fill(J.owners.tell.text, { kids: kids[0][0], kids2: kids[1][0], kids3: kids[2][0], what, things: things.map((t) => t[1]).join(', '), clues, kids4: at(kids[asked][1]) }),
          how: hard
            ? fill(J.owners.tell.how[1], { kids: at(kids[0][1]), kids2: at(kids[2][1]), kids3: kids[1][1] })
            : J.owners.tell.how[2],
        };
      },
    };
  },

  meetings: (skin) => {
    const [who, did, ask, , both] = MEETINGS[skin];
    return {
      tell: (n) => ({
        text: `${who[n - 3]} ${did}. ${ask}`,
        how: both
          ? J.meetings.tell.how[1]
          : fill(J.meetings.tell.how[2], { length: Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(' + ') }),
      }),
    };
  },
};
