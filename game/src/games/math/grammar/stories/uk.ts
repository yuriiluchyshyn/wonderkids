import { currencyOf, type CurrencyId } from '@/core/game/content/currency';
import { hourAt, num, say, written, type Gender, type NumCase } from '@/core/language/uk';
import type { Frame, StoryHero, StoryTold, StoryWords } from '@/games/math/grammar/stories/types';
import { fill } from '@/core/language/fill';
import TEXTS from '@/locales/app/uk/games/math.json';

const J = TEXTS.stories;

/**
 * «Задачі» in Ukrainian — the words the stories were first written in. Every
 * list keeps the order of the skins in `generators/wordProblems.ts`.
 */

interface Item {
  one: string;
  few: string;
  many: string;
  g: Gender;
  emoji: string;
}

const it = (one: string, few: string, many: string, g: Gender, emoji: string): Item => ({ one, few, many, g, emoji });

const I = {
  apple: it(J.I.apple[1], J.I.apple[2], J.I.apple[3], 'n', '🍎'),
  pear: it(J.I.pear[1], J.I.pear[2], J.I.pear[3], 'f', '🍐'),
  candy: it(J.I.candy[1], J.I.candy[2], J.I.candy[3], 'f', '🍬'),
  pencil: it(J.I.pencil[1], J.I.pencil[2], J.I.pencil[3], 'm', '✏️'),
  marker: it(J.I.marker[1], J.I.marker[2], J.I.marker[3], 'm', '🖍️'),
  book: it(J.I.book[1], J.I.book[2], J.I.book[3], 'f', '📚'),
  ball: it(J.I.ball[1], J.I.ball[2], J.I.ball[3], 'm', '⚽'),
  balloon: it(J.I.balloon[1], J.I.balloon[2], J.I.balloon[3], 'f', '🎈'),
  sticker: it(J.I.sticker[1], J.I.sticker[2], J.I.sticker[3], 'f', '⭐'),
  nut: it(J.I.nut[1], J.I.nut[2], J.I.nut[3], 'm', '🌰'),
  car: it(J.I.car[1], J.I.car[2], J.I.car[3], 'f', '🚗'),
  auto: it(J.I.auto[1], J.I.auto[2], J.I.auto[3], 'f', '🚙'),
  cube: it(J.I.cube[1], J.I.cube[2], J.I.cube[3], 'm', '🧱'),
  shell: it(J.I.shell[1], J.I.shell[2], J.I.shell[3], 'f', '🐚'),
  bird: it(J.I.bird[1], J.I.bird[2], J.I.bird[3], 'f', '🐦'),
  duck: it(J.I.duck[1], J.I.duck[2], J.I.duck[3], 'f', '🦆'),
  rabbit: it(J.I.rabbit[1], J.I.rabbit[2], J.I.rabbit[3], 'm', '🐇'),
  butterfly: it(J.I.butterfly[1], J.I.butterfly[2], J.I.butterfly[3], 'm', '🦋'),
  kitten: it(J.I.kitten[1], J.I.kitten[2], J.I.kitten[3], 'n', '🐱'),
  bee: it(J.I.bee[1], J.I.bee[2], J.I.bee[3], 'f', '🐝'),
  star: it(J.I.star[1], J.I.star[2], J.I.star[3], 'f', '🌟'),
  cake: it(J.I.cake[1], J.I.cake[2], J.I.cake[3], 'n', '🧁'),
  page: it(J.I.page[1], J.I.page[2], J.I.page[3], 'f', '📖'),
  fish: it(J.I.fish[1], J.I.fish[2], J.I.fish[3], 'f', '🐟'),
  bigFish: it(J.I.bigFish[1], J.I.bigFish[2], J.I.bigFish[3], 'f', '🐟'),
  flower: it(J.I.flower[1], J.I.flower[2], J.I.flower[3], 'f', '🌷'),
  coin: it(J.I.coin[1], J.I.coin[2], J.I.coin[3], 'f', '🪙'),
  stamp: it(J.I.stamp[1], J.I.stamp[2], J.I.stamp[3], 'f', '📮'),
  tomato: it(J.I.tomato[1], J.I.tomato[2], J.I.tomato[3], 'm', '🍅'),
  cucumber: it(J.I.cucumber[1], J.I.cucumber[2], J.I.cucumber[3], 'm', '🥒'),
  carrot: it(J.I.carrot[1], J.I.carrot[2], J.I.carrot[3], 'f', '🥕'),
  egg: it(J.I.egg[1], J.I.egg[2], J.I.egg[3], 'n', '🥚'),
  mushroom: it(J.I.mushroom[1], J.I.mushroom[2], J.I.mushroom[3], 'm', '🍄'),
  tree: it(J.I.tree[1], J.I.tree[2], J.I.tree[3], 'n', '🌳'),
  appleTree: it(J.I.appleTree[1], J.I.appleTree[2], J.I.appleTree[3], 'f', '🌳'),
  bush: it(J.I.bush[1], J.I.bush[2], J.I.bush[3], 'm', '🌿'),
  cup: it(J.I.cup[1], J.I.cup[2], J.I.cup[3], 'f', '☕'),
  plate: it(J.I.plate[1], J.I.plate[2], J.I.plate[3], 'f', '🍽️'),
  notebook: it(J.I.notebook[1], J.I.notebook[2], J.I.notebook[3], 'm', '📓'),
  bun: it(J.I.bun[1], J.I.bun[2], J.I.bun[3], 'f', '🥐'),
  pie: it(J.I.pie[1], J.I.pie[2], J.I.pie[3], 'm', '🥟'),
  ticket: it(J.I.ticket[1], J.I.ticket[2], J.I.ticket[3], 'm', '🎟️'),
  postcard: it(J.I.postcard[1], J.I.postcard[2], J.I.postcard[3], 'f', '💌'),
  chair: it(J.I.chair[1], J.I.chair[2], J.I.chair[3], 'm', '🪑'),
  desk: it(J.I.desk[1], J.I.desk[2], J.I.desk[3], 'f', '🪑'),
  doll: it(J.I.doll[1], J.I.doll[2], J.I.doll[3], 'f', '🪆'),
  robot: it(J.I.robot[1], J.I.robot[2], J.I.robot[3], 'm', '🤖'),
  puzzle: it(J.I.puzzle[1], J.I.puzzle[2], J.I.puzzle[3], 'm', '🧩'),
  bike: it(J.I.bike[1], J.I.bike[2], J.I.bike[3], 'm', '🚲'),
  card: it(J.I.card[1], J.I.card[2], J.I.card[3], 'f', '🃏'),
  photo: it(J.I.photo[1], J.I.photo[2], J.I.photo[3], 'f', '🖼️'),
  goal: it(J.I.goal[1], J.I.goal[2], J.I.goal[3], 'm', '🥅'),
  lap: it(J.I.lap[1], J.I.lap[2], J.I.lap[3], 'n', '🏃'),
  passenger: it(J.I.passenger[1], J.I.passenger[2], J.I.passenger[3], 'm', '🧍'),
  pupil: it(J.I.pupil[1], J.I.pupil[2], J.I.pupil[3], 'm', '🧒'),
  visitor: it(J.I.visitor[1], J.I.visitor[2], J.I.visitor[3], 'm', '🧑'),
  athlete: it(J.I.athlete[1], J.I.athlete[2], J.I.athlete[3], 'm', '🏃'),
  boy: it(J.I.boy[1], J.I.boy[2], J.I.boy[3], 'm', '👦'),
  girl: it(J.I.girl[1], J.I.girl[2], J.I.girl[3], 'f', '👧'),
  cow: it(J.I.cow[1], J.I.cow[2], J.I.cow[3], 'f', '🐄'),
  horse: it(J.I.horse[1], J.I.horse[2], J.I.horse[3], 'm', '🐴'),
  monkey: it(J.I.monkey[1], J.I.monkey[2], J.I.monkey[3], 'f', '🐒'),
  parrot: it(J.I.parrot[1], J.I.parrot[2], J.I.parrot[3], 'm', '🦜'),
  row: it(J.I.row[1], J.I.row[2], J.I.row[3], 'm', '➖'),
  line: it(J.I.line[1], J.I.line[2], J.I.line[3], 'f', '➖'),
  time: it(J.I.time[1], J.I.time[2], J.I.time[3], 'm', '✖️'),
  km: it(J.I.km[1], J.I.km[2], J.I.km[3], 'm', '📏'),
  hour: it(J.I.hour[1], J.I.hour[2], J.I.hour[3], 'f', '⏱️'),
};

function form(n: number, item: Item): string {
  const ones = n % 10;
  const tens = n % 100;
  if (ones === 1 && tens !== 11) return item.one;
  return ones >= 2 && ones <= 4 && !(tens >= 12 && tens <= 14) ? item.few : item.many;
}

const BOYS = J.BOYS;

const GIRLS = J.GIRLS;

const JOIN: [string, string, Item][] = [
  [J.JOIN[0][0], J.JOIN[0][1], I.car], [J.JOIN[1][0], J.JOIN[1][1], I.book], [J.JOIN[2][0], J.JOIN[2][1], I.candy], [J.JOIN[3][0], J.JOIN[3][1], I.bird],
  [J.JOIN[4][0], J.JOIN[4][1], I.fish], [J.JOIN[5][0], J.JOIN[5][1], I.flower], [J.JOIN[6][0], J.JOIN[6][1], I.pencil], [J.JOIN[7][0], J.JOIN[7][1], I.bike],
];

const GOT_MORE: [string, Item][] = [
  [J.GOT_MORE[0][0], I.sticker], [J.GOT_MORE[1][0], I.balloon], [J.GOT_MORE[2][0], I.cube], [J.GOT_MORE[3][0], I.nut],
  [J.GOT_MORE[4][0], I.stamp], [J.GOT_MORE[5][0], I.doll], [J.GOT_MORE[6][0], I.robot], [J.GOT_MORE[7][0], I.puzzle],
];

const CAME_IN: [string, string, string, Item][] = [
  [J.CAME_IN[0][0], J.CAME_IN[0][1], J.CAME_IN[0][2], I.bird], [J.CAME_IN[1][0], J.CAME_IN[1][1], J.CAME_IN[1][2], I.duck],
  [J.CAME_IN[2][0], J.CAME_IN[2][1], J.CAME_IN[2][2], I.rabbit], [J.CAME_IN[3][0], J.CAME_IN[3][1], J.CAME_IN[3][2], I.butterfly],
  [J.CAME_IN[4][0], J.CAME_IN[4][1], J.CAME_IN[4][2], I.kitten], [J.CAME_IN[5][0], J.CAME_IN[5][1], J.CAME_IN[5][2], I.bee],
  [J.CAME_IN[6][0], J.CAME_IN[6][1], J.CAME_IN[6][2], I.auto], [J.CAME_IN[7][0], J.CAME_IN[7][1], J.CAME_IN[7][2], I.star],
];

const GAVE: [string, string, string, Item][] = [
  [J.GAVE[0][0], J.GAVE[0][1], J.GAVE[0][2], I.candy], [J.GAVE[1][0], J.GAVE[1][1], J.GAVE[1][2], I.sticker], [J.GAVE[2][0], J.GAVE[2][1], '', I.apple],
  [J.GAVE[3][0], J.GAVE[3][1], '', I.cube], [J.GAVE[4][0], J.GAVE[4][1], J.GAVE[4][2], I.balloon], [J.GAVE[5][0], J.GAVE[5][1], J.GAVE[5][2], I.pencil],
  [J.GAVE[6][0], J.GAVE[6][1], J.GAVE[6][2], I.flower], [J.GAVE[7][0], J.GAVE[7][1], J.GAVE[7][2], I.car],
];

const WENT_AWAY: [string, string, string, Item][] = [
  [J.WENT_AWAY[0][0], J.WENT_AWAY[0][1], J.WENT_AWAY[0][2], I.bird], [J.WENT_AWAY[1][0], J.WENT_AWAY[1][1], J.WENT_AWAY[1][2], I.cake],
  [J.WENT_AWAY[2][0], J.WENT_AWAY[2][1], J.WENT_AWAY[2][2], I.mushroom], [J.WENT_AWAY[3][0], J.WENT_AWAY[3][1], J.WENT_AWAY[3][2], I.duck],
  [J.WENT_AWAY[4][0], J.WENT_AWAY[4][1], J.WENT_AWAY[4][2], I.auto], [J.WENT_AWAY[5][0], J.WENT_AWAY[5][1], J.WENT_AWAY[5][2], I.book],
  [J.WENT_AWAY[6][0], J.WENT_AWAY[6][1], J.WENT_AWAY[6][2], I.balloon], [J.WENT_AWAY[7][0], J.WENT_AWAY[7][1], J.WENT_AWAY[7][2], I.cup],
];

const TWO_KINDS: [string, Item, Item, string][] = [
  [J.TWO_KINDS[0][0], I.boy, I.girl, J.TWO_KINDS[0][3]], [J.TWO_KINDS[1][0], I.appleTree, I.pear, J.TWO_KINDS[1][3]],
  [J.TWO_KINDS[2][0], I.cow, I.horse, J.TWO_KINDS[2][3]], [J.TWO_KINDS[3][0], I.apple, I.pear, J.TWO_KINDS[3][3]],
  [J.TWO_KINDS[4][0], I.tomato, I.cucumber, J.TWO_KINDS[4][3]], [J.TWO_KINDS[5][0], I.cube, I.ball, J.TWO_KINDS[5][3]],
  [J.TWO_KINDS[6][0], I.monkey, I.parrot, J.TWO_KINDS[6][3]], [J.TWO_KINDS[7][0], I.cup, I.plate, J.TWO_KINDS[7][3]],
];

const LEFT_20: [string, Item, string, string][] = [
  [J.LEFT_20[0][0], I.passenger, J.LEFT_20[0][2], J.LEFT_20[0][3]],
  [J.LEFT_20[1][0], I.page, J.LEFT_20[1][2], J.LEFT_20[1][3]],
  [J.LEFT_20[2][0], I.sticker, J.LEFT_20[2][2], J.LEFT_20[2][3]],
  [J.LEFT_20[3][0], I.apple, J.LEFT_20[3][2], J.LEFT_20[3][3]],
  [J.LEFT_20[4][0], I.candy, J.LEFT_20[4][2], J.LEFT_20[4][3]],
  [J.LEFT_20[5][0], I.auto, J.LEFT_20[5][2], J.LEFT_20[5][3]],
  [J.LEFT_20[6][0], I.egg, J.LEFT_20[6][2], J.LEFT_20[6][3]],
  [J.LEFT_20[7][0], I.cow, J.LEFT_20[7][2], J.LEFT_20[7][3]],
];

const MORE_PAIRS: [string, string, Item][] = [
  [J.MORE_PAIRS[0][0], J.MORE_PAIRS[0][1], I.sticker], [J.MORE_PAIRS[1][0], J.MORE_PAIRS[1][1], I.car], [J.MORE_PAIRS[2][0], J.MORE_PAIRS[2][1], I.mushroom], [J.MORE_PAIRS[3][0], J.MORE_PAIRS[3][1], I.book],
  [J.MORE_PAIRS[4][0], J.MORE_PAIRS[4][1], I.cube], [J.MORE_PAIRS[5][0], J.MORE_PAIRS[5][1], I.pie], [J.MORE_PAIRS[6][0], J.MORE_PAIRS[6][1], I.fish], [J.MORE_PAIRS[7][0], J.MORE_PAIRS[7][1], I.flower],
];

const FEWER_PAIRS: [string, string, Item][] = [
  [J.FEWER_PAIRS[0][0], J.FEWER_PAIRS[0][1], I.nut], [J.FEWER_PAIRS[1][0], J.FEWER_PAIRS[1][1], I.balloon], [J.FEWER_PAIRS[2][0], J.FEWER_PAIRS[2][1], I.candy], [J.FEWER_PAIRS[3][0], J.FEWER_PAIRS[3][1], I.bird],
  [J.FEWER_PAIRS[4][0], J.FEWER_PAIRS[4][1], I.pencil], [J.FEWER_PAIRS[5][0], J.FEWER_PAIRS[5][1], I.mushroom], [J.FEWER_PAIRS[6][0], J.FEWER_PAIRS[6][1], I.cake], [J.FEWER_PAIRS[7][0], J.FEWER_PAIRS[7][1], I.stamp],
];

const MISSING: [string, Item, string, string][] = [
  [J.MISSING[0][0], I.candy, J.MISSING[0][2], J.MISSING[0][3]], [J.MISSING[1][0], I.book, J.MISSING[1][2], J.MISSING[1][3]],
  [J.MISSING[2][0], I.mushroom, J.MISSING[2][2], J.MISSING[2][3]], [J.MISSING[3][0], I.bird, J.MISSING[3][2], J.MISSING[3][3]],
  [J.MISSING[4][0], I.pencil, J.MISSING[4][2], J.MISSING[4][3]], [J.MISSING[5][0], I.auto, J.MISSING[5][2], J.MISSING[5][3]],
  [J.MISSING[6][0], I.coin, J.MISSING[6][2], J.MISSING[6][3]], [J.MISSING[7][0], I.stamp, J.MISSING[7][2], J.MISSING[7][3]],
];

const PRICE_PAIRS: [string, string, string, string, string][] = [
  [J.PRICE_PAIRS[0][0], J.PRICE_PAIRS[0][1], J.PRICE_PAIRS[0][2], '🧃', '🥐'], [J.PRICE_PAIRS[1][0], J.PRICE_PAIRS[1][1], J.PRICE_PAIRS[1][2], '📓', '🖊️'], [J.PRICE_PAIRS[2][0], J.PRICE_PAIRS[2][1], J.PRICE_PAIRS[2][2], '🍦', '💧'],
  [J.PRICE_PAIRS[3][0], J.PRICE_PAIRS[3][1], J.PRICE_PAIRS[3][2], '🎟️', '🍿'], [J.PRICE_PAIRS[4][0], J.PRICE_PAIRS[4][1], J.PRICE_PAIRS[4][2], '🪆', '⚽'], [J.PRICE_PAIRS[5][0], J.PRICE_PAIRS[5][1], J.PRICE_PAIRS[5][2], '🍞', '🥛'],
  [J.PRICE_PAIRS[6][0], J.PRICE_PAIRS[6][1], J.PRICE_PAIRS[6][2], '✏️', '🧽'], [J.PRICE_PAIRS[7][0], J.PRICE_PAIRS[7][1], J.PRICE_PAIRS[7][2], '🍎', '🍌'],
];

const BOUGHT: [string, string][] = [[J.BOUGHT[0][0], '📕'], [J.BOUGHT[1][0], '🧸'], [J.BOUGHT[2][0], '⚽'], [J.BOUGHT[3][0], '📒'], [J.BOUGHT[4][0], '🍦'], [J.BOUGHT[5][0], '💐'], [J.BOUGHT[6][0], '💌'], [J.BOUGHT[7][0], '🎨']];

const WANTED: [string, string][] = [[J.WANTED[0][0], '🍦'], [J.WANTED[1][0], '🧱'], [J.WANTED[2][0], '📕'], [J.WANTED[3][0], '🛴'], [J.WANTED[4][0], '🪆'], [J.WANTED[5][0], '🎟️'], [J.WANTED[6][0], '⚽'], [J.WANTED[7][0], '🧩']];

const REPRICED: [string, Gender, boolean, string][] = [
  [J.REPRICED[0][0], 'f', false, '🧸'], [J.REPRICED[1][0], 'm', true, '🎟️'], [J.REPRICED[2][0], 'f', false, '📕'], [J.REPRICED[3][0], 'm', true, '🧃'],
  [J.REPRICED[4][0], 'm', false, '🎂'], [J.REPRICED[5][0], 'f', true, '🪆'], [J.REPRICED[6][0], 'm', false, '⚽'], [J.REPRICED[7][0], 'n', true, '🍦'],
];

const THREE: [string, string, string, Item, string][] = [
  [J.THREE[0][0], J.THREE[0][1], J.THREE[0][2], I.apple, J.THREE[0][4]], [J.THREE[1][0], J.THREE[1][1], J.THREE[1][2], I.page, J.THREE[1][4]],
  [J.THREE[2][0], J.THREE[2][1], J.THREE[2][2], I.book, J.THREE[2][4]], [J.THREE[3][0], J.THREE[3][1], J.THREE[3][2], I.bun, J.THREE[3][4]],
  [J.THREE[4][0], J.THREE[4][1], J.THREE[4][2], I.tree, J.THREE[4][4]], [J.THREE[5][0], J.THREE[5][1], J.THREE[5][2], I.passenger, J.THREE[5][4]],
  [J.THREE[6][0], J.THREE[6][1], J.THREE[6][2], I.goal, J.THREE[6][4]], [J.THREE[7][0], J.THREE[7][1], J.THREE[7][2], I.cube, J.THREE[7][4]],
];

const GROUPS: [string, string, string, Gender, Item, string][] = [
  [J.GROUPS[0][0], J.GROUPS[0][1], J.GROUPS[0][2], 'f', I.pencil, '📦'], [J.GROUPS[1][0], J.GROUPS[1][1], J.GROUPS[1][2], 'm', I.apple, '🧺'], [J.GROUPS[2][0], J.GROUPS[2][1], J.GROUPS[2][2], 'f', I.cake, '🍽️'],
  [J.GROUPS[3][0], J.GROUPS[3][1], J.GROUPS[3][2], 'm', I.candy, '🛍️'], [J.GROUPS[4][0], J.GROUPS[4][1], J.GROUPS[4][2], 'f', I.flower, '🏺'], [J.GROUPS[5][0], J.GROUPS[5][1], J.GROUPS[5][2], 'f', I.book, '📚'],
  [J.GROUPS[6][0], J.GROUPS[6][1], J.GROUPS[6][2], 'n', I.egg, '🪺'], [J.GROUPS[7][0], J.GROUPS[7][1], J.GROUPS[7][2], 'm', I.passenger, '🚃'],
];

const PRICED: [string, Item][] = [
  [J.PRICED[0][0], I.notebook], [J.PRICED[1][0], I.bun], [J.PRICED[2][0], I.ticket], [J.PRICED[3][0], I.sticker],
  [J.PRICED[4][0], I.pencil], [J.PRICED[5][0], I.cake], [J.PRICED[6][0], I.postcard], [J.PRICED[7][0], I.balloon],
];

const ROWS: [string, Item, Item, string][] = [
  [J.ROWS[0][0], I.row, I.desk, J.ROWS[0][3]], [J.ROWS[1][0], I.row, I.carrot, J.ROWS[1][3]], [J.ROWS[2][0], I.row, I.chair, J.ROWS[2][3]], [J.ROWS[3][0], I.row, I.candy, J.ROWS[3][3]],
  [J.ROWS[4][0], I.line, I.athlete, J.ROWS[4][3]], [J.ROWS[5][0], I.row, I.tree, J.ROWS[5][3]], [J.ROWS[6][0], I.row, I.sticker, J.ROWS[6][3]], [J.ROWS[7][0], I.row, I.auto, J.ROWS[7][3]],
];

const SHARED: [Item, string, string][] = [
  [I.candy, J.SHARED[0][1], J.SHARED[0][2]], [I.apple, J.SHARED[1][1], J.SHARED[1][2]], [I.nut, J.SHARED[2][1], J.SHARED[2][2]], [I.sticker, J.SHARED[3][1], J.SHARED[3][2]],
  [I.cake, J.SHARED[4][1], J.SHARED[4][2]], [I.carrot, J.SHARED[5][1], J.SHARED[5][2]], [I.balloon, J.SHARED[6][1], J.SHARED[6][2]], [I.fish, J.SHARED[7][1], J.SHARED[7][2]],
];

const PACKED: [Item, string, string][] = [
  [I.pencil, J.PACKED[0][1], J.PACKED[0][2]], [I.egg, J.PACKED[1][1], J.PACKED[1][2]], [I.apple, J.PACKED[2][1], J.PACKED[2][2]],
  [I.book, J.PACKED[3][1], J.PACKED[3][2]], [I.flower, J.PACKED[4][1], J.PACKED[4][2]], [I.candy, J.PACKED[5][1], J.PACKED[5][2]],
  [I.photo, J.PACKED[6][1], J.PACKED[6][2]], [I.bun, J.PACKED[7][1], J.PACKED[7][2]],
];

const BOXES_AND_LOOSE: [string, Gender, Item, string, string][] = [
  [J.BOXES_AND_LOOSE[0][0], 'f', I.pencil, J.BOXES_AND_LOOSE[0][3], '📦'], [J.BOXES_AND_LOOSE[1][0], 'm', I.apple, J.BOXES_AND_LOOSE[1][3], '🧺'], [J.BOXES_AND_LOOSE[2][0], 'm', I.candy, J.BOXES_AND_LOOSE[2][3], '🛍️'],
  [J.BOXES_AND_LOOSE[3][0], 'm', I.stamp, J.BOXES_AND_LOOSE[3][3], '📒'], [J.BOXES_AND_LOOSE[4][0], 'f', I.flower, J.BOXES_AND_LOOSE[4][3], '🏺'], [J.BOXES_AND_LOOSE[5][0], 'm', I.tomato, J.BOXES_AND_LOOSE[5][3], '📦'],
  [J.BOXES_AND_LOOSE[6][0], 'm', I.fish, J.BOXES_AND_LOOSE[6][3], '🫙'], [J.BOXES_AND_LOOSE[7][0], 'm', I.marker, J.BOXES_AND_LOOSE[7][3], '👝'],
];

const BOUGHT_MANY: Item[] = [I.bun, I.notebook, I.sticker, I.pencil, I.balloon, I.ticket, I.postcard, I.cake];

const SHARED_THEN: [Item, string, string, string, string][] = [
  [I.candy, J.SHARED_THEN[0][1], J.SHARED_THEN[0][2], J.SHARED_THEN[0][3], J.SHARED_THEN[0][4]], [I.apple, J.SHARED_THEN[1][1], J.SHARED_THEN[1][2], J.SHARED_THEN[1][3], J.SHARED_THEN[1][4]],
  [I.sticker, J.SHARED_THEN[2][1], J.SHARED_THEN[2][2], J.SHARED_THEN[2][3], J.SHARED_THEN[2][4]], [I.nut, J.SHARED_THEN[3][1], J.SHARED_THEN[3][2], J.SHARED_THEN[3][3], J.SHARED_THEN[3][4]],
  [I.balloon, J.SHARED_THEN[4][1], J.SHARED_THEN[4][2], J.SHARED_THEN[4][3], J.SHARED_THEN[4][4]], [I.cake, J.SHARED_THEN[5][1], J.SHARED_THEN[5][2], J.SHARED_THEN[5][3], J.SHARED_THEN[5][4]],
  [I.carrot, J.SHARED_THEN[6][1], J.SHARED_THEN[6][2], J.SHARED_THEN[6][3], J.SHARED_THEN[6][4]], [I.card, J.SHARED_THEN[7][1], J.SHARED_THEN[7][2], J.SHARED_THEN[7][3], J.SHARED_THEN[7][4]],
];

const TIMES_MORE: [string, string, string, Item][] = [
  [J.TIMES_MORE[0][0], J.TIMES_MORE[0][1], J.TIMES_MORE[0][2], I.bush], [J.TIMES_MORE[1][0], J.TIMES_MORE[1][1], J.TIMES_MORE[1][2], I.sticker], [J.TIMES_MORE[2][0], J.TIMES_MORE[2][1], J.TIMES_MORE[2][2], I.fish],
  [J.TIMES_MORE[3][0], J.TIMES_MORE[3][1], J.TIMES_MORE[3][2], I.pupil], [J.TIMES_MORE[4][0], J.TIMES_MORE[4][1], J.TIMES_MORE[4][2], I.book], [J.TIMES_MORE[5][0], J.TIMES_MORE[5][1], J.TIMES_MORE[5][2], I.visitor],
  [J.TIMES_MORE[6][0], J.TIMES_MORE[6][1], J.TIMES_MORE[6][2], I.mushroom], [J.TIMES_MORE[7][0], J.TIMES_MORE[7][1], J.TIMES_MORE[7][2], I.bigFish],
];

const TIMES_FEWER: [string, string, string, Item][] = [
  [J.TIMES_FEWER[0][0], J.TIMES_FEWER[0][1], J.TIMES_FEWER[0][2], I.cube], [J.TIMES_FEWER[1][0], J.TIMES_FEWER[1][1], J.TIMES_FEWER[1][2], I.car], [J.TIMES_FEWER[2][0], J.TIMES_FEWER[2][1], J.TIMES_FEWER[2][2], I.apple],
  [J.TIMES_FEWER[3][0], J.TIMES_FEWER[3][1], J.TIMES_FEWER[3][2], I.book], [J.TIMES_FEWER[4][0], J.TIMES_FEWER[4][1], J.TIMES_FEWER[4][2], I.shell], [J.TIMES_FEWER[5][0], J.TIMES_FEWER[5][1], J.TIMES_FEWER[5][2], I.flower],
  [J.TIMES_FEWER[6][0], J.TIMES_FEWER[6][1], J.TIMES_FEWER[6][2], I.bun], [J.TIMES_FEWER[7][0], J.TIMES_FEWER[7][1], J.TIMES_FEWER[7][2], I.duck],
];

const MORE_TOTAL: [string, string, string, Item][] = [
  [J.MORE_TOTAL[0][0], J.MORE_TOTAL[0][1], J.MORE_TOTAL[0][2], I.book], [J.MORE_TOTAL[1][0], J.MORE_TOTAL[1][1], J.MORE_TOTAL[1][2], I.apple], [J.MORE_TOTAL[2][0], J.MORE_TOTAL[2][1], J.MORE_TOTAL[2][2], I.sticker],
  [J.MORE_TOTAL[3][0], J.MORE_TOTAL[3][1], J.MORE_TOTAL[3][2], I.passenger], [J.MORE_TOTAL[4][0], J.MORE_TOTAL[4][1], J.MORE_TOTAL[4][2], I.ticket], [J.MORE_TOTAL[5][0], J.MORE_TOTAL[5][1], J.MORE_TOTAL[5][2], I.pupil],
  [J.MORE_TOTAL[6][0], J.MORE_TOTAL[6][1], J.MORE_TOTAL[6][2], I.flower], [J.MORE_TOTAL[7][0], J.MORE_TOTAL[7][1], J.MORE_TOTAL[7][2], I.lap],
];

const TIMED: [string, string, string][] = [
  [J.TIMED[0][0], J.TIMED[0][1], J.TIMED[0][2]], [J.TIMED[1][0], J.TIMED[1][1], J.TIMED[1][2]],
  [J.TIMED[2][0], J.TIMED[2][1], J.TIMED[2][2]], [J.TIMED[3][0], J.TIMED[3][1], J.TIMED[3][2]],
  [J.TIMED[4][0], J.TIMED[4][1], J.TIMED[4][2]], [J.TIMED[5][0], J.TIMED[5][1], J.TIMED[5][2]],
  [J.TIMED[6][0], J.TIMED[6][1], J.TIMED[6][2]], [J.TIMED[7][0], J.TIMED[7][1], J.TIMED[7][2]],
];

const MOVERS: [string, string, string, string, [number, number]][] = [
  [J.MOVERS[0][0], J.MOVERS[0][1], '🚴', J.MOVERS[0][3], [10, 15]], [J.MOVERS[1][0], J.MOVERS[1][1], '🥾', J.MOVERS[1][3], [3, 6]], [J.MOVERS[2][0], J.MOVERS[2][1], '⛵', J.MOVERS[2][3], [6, 10]],
  [J.MOVERS[3][0], J.MOVERS[3][1], '🚆', J.MOVERS[3][3], [40, 90]], [J.MOVERS[4][0], J.MOVERS[4][1], '🚌', J.MOVERS[4][3], [30, 60]], [J.MOVERS[5][0], J.MOVERS[5][1], '🐎', J.MOVERS[5][3], [8, 14]],
  [J.MOVERS[6][0], J.MOVERS[6][1], '⛷️', J.MOVERS[6][3], [7, 12]], [J.MOVERS[7][0], J.MOVERS[7][1], '🚢', J.MOVERS[7][3], [15, 30]],
];

const TWO_BUYS: [Item, string, string][] = [
  [I.pencil, J.TWO_BUYS[0][1], '📓'], [I.bun, J.TWO_BUYS[1][1], '🧃'], [I.sticker, J.TWO_BUYS[2][1], '📒'], [I.balloon, J.TWO_BUYS[3][1], '🎂'], [I.ticket, J.TWO_BUYS[4][1], '🍿'],
  [I.postcard, J.TWO_BUYS[5][1], '✉️'], [I.notebook, J.TWO_BUYS[6][1], '👝'], [I.cake, J.TWO_BUYS[7][1], '🍵'], [I.candy, J.TWO_BUYS[8][1], '🍫'],
];

const HALVES: [string, string, string, Item][] = [
  [J.HALVES[0][0], J.HALVES[0][1], J.HALVES[0][2], I.candy], [J.HALVES[1][0], J.HALVES[1][1], J.HALVES[1][2], I.book],
  [J.HALVES[2][0], J.HALVES[2][1], J.HALVES[2][2], I.pie], [J.HALVES[3][0], J.HALVES[3][1], J.HALVES[3][2], I.sticker],
  [J.HALVES[4][0], J.HALVES[4][1], J.HALVES[4][2], I.apple], [J.HALVES[5][0], J.HALVES[5][1], J.HALVES[5][2], I.balloon],
  [J.HALVES[6][0], J.HALVES[6][1], J.HALVES[6][2], I.coin], [J.HALVES[7][0], J.HALVES[7][1], J.HALVES[7][2], I.tomato],
  [J.HALVES[8][0], J.HALVES[8][1], J.HALVES[8][2], I.cake],
];

/** «5 яблук»: the number and the thing in the form that goes with it. */
const C = (n: number, item: Item): string => `${num(n, item.g)} ${form(n, item)}`;
/** A bare number inside a sentence, in the gender (and case) of what it counts. */
const N = (n: number, of: Item | Gender = 'm', c: NumCase = 'nom'): string => num(n, typeof of === 'string' ? of : of.g, c);
const cap = (text: string) => text.charAt(0).toLocaleUpperCase('uk') + text.slice(1);
const coinOf = (money: CurrencyId): Item => {
  const m = currencyOf(money);
  return it(m.counted[0], m.counted[1], m.counted[2], m.gender, '💵');
};

interface Hero {
  name: string;
  he: string;
  him: string;
  has: string;
  v: (m: string, f: string) => string;
}
const heroOf = ({ boy, name }: StoryHero): Hero => ({ name: (boy ? BOYS : GIRLS)[name], he: boy ? J.heroOf.he[1] : J.heroOf.he[2], him: boy ? J.heroOf.him[1] : J.heroOf.him[2], has: boy ? J.heroOf.has[1] : J.heroOf.has[2], v: (m, f) => (boy ? m : f) });

/** What was done to the number in mind, and how to undo it. */
const THOUGHT: ((h: Hero, n: number[]) => { did: string; undo: string })[] = [
  (h, [a]) => ({ did: fill(J.THOUGHT[0].did[1], { h: h.v(J.THOUGHT[0].did[2], J.THOUGHT[0].did[3]), a: N(a) }), undo: fill(J.THOUGHT[0].undo, { a: N(a) }) }),
  (h, [a]) => ({ did: fill(J.THOUGHT[1].did[1], { h: h.v(J.THOUGHT[1].did[2], J.THOUGHT[1].did[3]), a: N(a) }), undo: fill(J.THOUGHT[1].undo, { a: N(a) }) }),
  (h, [m]) => ({ did: fill(J.THOUGHT[2].did[1], { h: h.v(J.THOUGHT[2].did[2], J.THOUGHT[2].did[3]), m: N(m) }), undo: fill(J.THOUGHT[2].undo, { m: N(m) }) }),
  (h, [m]) => ({ did: fill(J.THOUGHT[3].did[1], { h: h.v(J.THOUGHT[3].did[2], J.THOUGHT[3].did[3]), m: N(m) }), undo: fill(J.THOUGHT[3].undo, { m: N(m) }) }),
  (h, [a, b]) => ({ did: fill(J.THOUGHT[4].did[1], { h: h.v(J.THOUGHT[4].did[2], J.THOUGHT[4].did[3]), a: N(a), b: N(b) }), undo: fill(J.THOUGHT[4].undo, { b: N(b), a: N(a) }) }),
  (h, [m, a]) => ({ did: fill(J.THOUGHT[5].did[1], { h: h.v(J.THOUGHT[5].did[2], J.THOUGHT[5].did[3]), m: N(m), h2: h.v(J.THOUGHT[5].did[4], J.THOUGHT[5].did[5]), a: N(a) }), undo: fill(J.THOUGHT[5].undo, { a: N(a), m: N(m) }) }),
  (h, [a, b]) => ({ did: fill(J.THOUGHT[6].did[1], { h: h.v(J.THOUGHT[6].did[2], J.THOUGHT[6].did[3]), a: N(a), h2: h.v(J.THOUGHT[6].did[4], J.THOUGHT[6].did[5]), b: N(b) }), undo: fill(J.THOUGHT[6].undo, { b: N(b), a: N(a) }) }),
  (h, [a]) => ({ did: fill(J.THOUGHT[7].did[1], { h: h.v(J.THOUGHT[7].did[2], J.THOUGHT[7].did[3]), h2: h.v(J.THOUGHT[7].did[4], J.THOUGHT[7].did[5]), a: N(a) }), undo: fill(J.THOUGHT[7].undo, { a: N(a) }) }),
];

type Tell = (skin: number, n: number[], h: Hero, coin: Item) => StoryTold;

const FRAMES: Record<Frame, Tell> = {
  join: (s, [a, b]) => {
    const [here, there, t] = JOIN[s];
    return { text: fill(J.FRAMES.join.text, { here, a: C(a, t), there, b: N(b, t), many: t.many }), how: J.FRAMES.join.how };
  },
  gotMore: (s, [a, b], h) => {
    const [gave, t] = GOT_MORE[s];
    return { text: fill(J.FRAMES.gotMore.text[1], { name: h.name, h: h.v(J.FRAMES.gotMore.text[2], J.FRAMES.gotMore.text[3]), a: C(a, t), gave, him: h.him, b: N(b, t), many: t.many, has: h.has }), how: fill(J.FRAMES.gotMore.how, { a: N(a, t), b: N(b, t) }) };
  },
  cameIn: (s, [a, b]) => {
    const [was, came, where, t] = CAME_IN[s];
    return { text: fill(J.FRAMES.cameIn.text, { was, a: C(a, t), came, b: N(b, t), many: t.many, where }), how: fill(J.FRAMES.cameIn.how, { t: cap(t.many) }) };
  },
  gave: (s, [a, b], h) => {
    const [m, f, whom, t] = GAVE[s];
    return { text: fill(J.FRAMES.gave.text[1], { name: h.name, h: h.v(J.FRAMES.gave.text[2], J.FRAMES.gave.text[3]), a: C(a, t), b: N(b, t), he: h.he, h2: h.v(m, f), whom: whom ? ` ${whom}` : '', many: t.many }), how: fill(J.FRAMES.gave.how, { a: N(a, t), b: N(b, t) }) };
  },
  wentAway: (s, [a, b]) => {
    const [was, gone, where, t] = WENT_AWAY[s];
    return { text: fill(J.FRAMES.wentAway.text, { was, a: C(a, t), b: N(b, t), gone, many: t.many, where }), how: fill(J.FRAMES.wentAway.how, { t: cap(t.many) }) };
  },
  twoKinds: (s, [a, b]) => {
    const [pre, x, y, ask] = TWO_KINDS[s];
    return { text: fill(J.FRAMES.twoKinds.text, { pre, a: C(a, x), b: C(b, y), ask }), how: J.FRAMES.twoKinds.how };
  },
  left20: (s, [a, b]) => {
    const [was, t, event, ask] = LEFT_20[s];
    return { text: `${was} ${C(a, t)}. ${event} ${N(b, t)}. ${ask}`, how: fill(J.FRAMES.left20.how, { b: N(b, t) }) };
  },
  howManyMore: (s, [a, b]) => {
    const [x, y, t] = MORE_PAIRS[s];
    return { text: fill(J.FRAMES.howManyMore.text, { x, a: C(a, t), y, b: N(b, t), many: t.many, x2: x.charAt(0).toLocaleLowerCase('uk'), x3: x.slice(1) }), how: J.FRAMES.howManyMore.how };
  },
  howManyFewer: (s, [a, b]) => {
    const [x, y, t] = FEWER_PAIRS[s];
    return { text: fill(J.FRAMES.howManyFewer.text, { x, a: C(a, t), y, b: N(b, t), many: t.many }), how: J.FRAMES.howManyFewer.how };
  },
  missing: (s, [a, b]) => {
    const [was, t, event, ask] = MISSING[s];
    return { text: fill(J.FRAMES.missing.text, { was, a: C(a, t), event, a2: N(a + b, t), many: t.many, ask }), how: fill(J.FRAMES.missing.how, { a: N(a + b, t, 'gen'), a2: N(a, t) }) };
  },
  totalPrice: (s, [p, q], _, coin) => {
    const [x, y, both] = PRICE_PAIRS[s];
    return { text: fill(J.FRAMES.totalPrice.text, { x, p: C(p, coin), y, q: N(q, coin), many: coin.many, both }), how: J.FRAMES.totalPrice.how };
  },
  change: (s, [p, pay], h, coin) => {
    const [thing] = BOUGHT[s];
    return { text: fill(J.FRAMES.change.text, { name: h.name, thing, p: C(p, coin), pay: C(pay, coin), many: coin.many, he: h.he }), how: fill(J.FRAMES.change.how, { pay: N(pay, coin, 'gen') }) };
  },
  notEnough: (s, [m, p], h, coin) => {
    const [thing] = WANTED[s];
    return { text: fill(J.FRAMES.notEnough.text, { name: h.name, m: C(m, coin), thing, p: N(p, coin), many: coin.many, him: h.him }), how: J.FRAMES.notEnough.how };
  },
  repriced: (s, [a, b], _, coin) => {
    const [thing, g, up] = REPRICED[s];
    const end = g === 'f' ? J.FRAMES.repriced.end[1] : g === 'n' ? J.FRAMES.repriced.end[2] : '';
    const verb = up ? (g === 'm' ? J.FRAMES.repriced.verb[1] : fill(J.FRAMES.repriced.verb[2], { end })) : g === 'm' ? J.FRAMES.repriced.verb[3] : fill(J.FRAMES.repriced.verb[4], { end });
    const was = g === 'm' ? J.FRAMES.repriced.was[1] : fill(J.FRAMES.repriced.was[2], { end });
    return {
      text: fill(J.FRAMES.repriced.text[1], { thing, was, a: C(a, coin), verb, b: N(b, coin), many: coin.many, g: g === 'f' ? J.FRAMES.repriced.text[2] : g === 'n' ? J.FRAMES.repriced.text[3] : J.FRAMES.repriced.text[4] }),
      how: up ? J.FRAMES.repriced.how[1] : J.FRAMES.repriced.how[2],
    };
  },
  threeAdd: (s, [a, b, c]) => {
    const [x, y, z, t, ask] = THREE[s];
    return { text: fill(J.FRAMES.threeAdd.text, { x, a: C(a, t), y, b: N(b, t), z, c: N(c, t), many: t.many, ask }), how: fill(J.FRAMES.threeAdd.how, { a: N(a, t), b: N(b, t), c: N(c, t) }) };
  },
  groups: (s, [k, m]) => {
    const [each, prep, boxes, g, t] = GROUPS[s];
    return { text: fill(J.FRAMES.groups.text, { each, k: C(k, t), many: t.many, prep, m: N(m, g, 'gen'), boxes }), how: fill(J.FRAMES.groups.how, { k: N(k, t), m: N(m) }) };
  },
  priceTimes: (s, [p, m], _, coin) => {
    const [one, t] = PRICED[s];
    return { text: fill(J.FRAMES.priceTimes.text, { one, p: C(p, coin), many: coin.many, m: C(m, t) }), how: fill(J.FRAMES.priceTimes.how, { p: N(p, coin), m: N(m) }) };
  },
  rows: (s, [m, k]) => {
    const [where, row, t, each] = ROWS[s];
    return { text: fill(J.FRAMES.rows.text, { where, m: C(m, row), k: C(k, t), each, many: t.many }), how: fill(J.FRAMES.rows.how, { k: N(k, t) }) };
  },
  share: (s, [total, m]) => {
    const [t, whom, got] = SHARED[s];
    return { text: fill(J.FRAMES.share.text, { total: C(total, t), m: N(m, 'm', 'ins'), whom, many: t.many, got }), how: fill(J.FRAMES.share.how, { total: cap(N(total, t)), m: N(m) }) };
  },
  pack: (s, [total, k]) => {
    const [t, into, ask] = PACKED[s];
    return { text: fill(J.FRAMES.pack.text, { total: C(total, t), k: N(k, t), into, ask }), how: fill(J.FRAMES.pack.how, { total: cap(N(total, t)), k: N(k) }) };
  },
  timesPlus: (s, [m, k, c]) => {
    const [boxes, g, t, loose] = BOXES_AND_LOOSE[s];
    return { text: fill(J.FRAMES.timesPlus.text, { m: N(m, g, 'gen'), boxes, k: C(k, t), c: N(c, t), loose, many: t.many }), how: fill(J.FRAMES.timesPlus.how, { k: N(k, t), m: N(m), c: N(c, t) }) };
  },
  timesChange: (s, [m, p, pay], h, coin) => {
    const t = BOUGHT_MANY[s];
    return {
      text: fill(J.FRAMES.timesChange.text[1], { name: h.name, h: h.v(J.FRAMES.timesChange.text[2], J.FRAMES.timesChange.text[3]), m: C(m, t), p: C(p, coin), h2: h.v(J.FRAMES.timesChange.text[4], J.FRAMES.timesChange.text[5]), pay: C(pay, coin), many: coin.many, he: h.he }),
      how: fill(J.FRAMES.timesChange.how, { p: N(p, coin), m: N(m), pay: N(pay, coin, 'gen') }),
    };
  },
  shareMinus: (s, [total, m, e]) => {
    const [t, whom, each, did, whose] = SHARED_THEN[s];
    return { text: fill(J.FRAMES.shareMinus.text, { total: C(total, t), m: N(m, 'm', 'ins'), whom, each, did, e: N(e, t), many: t.many, whose }), how: fill(J.FRAMES.shareMinus.how, { total: N(total, t), m: N(m), e: N(e, t) }) };
  },
  timesMore: (s, [k, m]) => {
    const [x, y, where, t] = TIMES_MORE[s];
    return { text: fill(J.FRAMES.timesMore.text, { x, k: C(k, t), y, m: C(m, I.time), many: t.many, where }), how: fill(J.FRAMES.timesMore.how, { m: N(m), m2: form(m, I.time), k: N(k, t) }) };
  },
  timesFewer: (s, [total, m]) => {
    const [x, y, where, t] = TIMES_FEWER[s];
    return { text: fill(J.FRAMES.timesFewer.text, { x, total: C(total, t), y, m: C(m, I.time), many: t.many, where }), how: fill(J.FRAMES.timesFewer.how, { m: N(m), m2: form(m, I.time), total: N(total, t) }) };
  },
  moreTotal: (s, [a, b]) => {
    const [x, y, both, t] = MORE_TOTAL[s];
    return { text: fill(J.FRAMES.moreTotal.text, { x, a: C(a, t), y, b: N(b, t), many: t.many, both }), how: fill(J.FRAMES.moreTotal.how, { a: N(a, t, 'gen'), b: N(b, t) }) };
  },
  timed: (s, [start, d]) => {
    const [started, lasted, ask] = TIMED[s];
    return { text: fill(J.FRAMES.timed.text, { started, start: say(start, hourAt(start)), lasted, d: C(d, I.hour), ask }), how: fill(J.FRAMES.timed.how, { start: N(start), d: N(d, I.hour) }) };
  },
  speed: (s, [k, m]) => {
    const [goes, will] = MOVERS[s];
    return { text: fill(J.FRAMES.speed.text, { goes, k: C(k, I.km), will, m: C(m, I.hour) }), how: fill(J.FRAMES.speed.how, { k: N(k, I.km), m: N(m) }) };
  },
  thought: (s, [out, ...n], h) => {
    const t = THOUGHT[s](h, n);
    return {
      text: fill(J.FRAMES.thought.text[1], { name: h.name, h: h.v(J.FRAMES.thought.text[2], J.FRAMES.thought.text[3]), did: t.did, h2: h.v(J.FRAMES.thought.text[4], J.FRAMES.thought.text[5]), out: N(out) }),
      how: fill(J.FRAMES.thought.how, { out: N(out), undo: t.undo }),
    };
  },
  twoBuys: (s, [m, p, q], h, coin) => {
    const [t, other] = TWO_BUYS[s];
    return {
      text: fill(J.FRAMES.twoBuys.text[1], { name: h.name, h: h.v(J.FRAMES.twoBuys.text[2], J.FRAMES.twoBuys.text[3]), m: C(m, t), p: C(p, coin), other, q: C(q, coin), many: coin.many, he: h.he, h2: h.v(J.FRAMES.twoBuys.text[4], J.FRAMES.twoBuys.text[5]) }),
      how: fill(J.FRAMES.twoBuys.how, { p: N(p, coin), m: N(m), q: N(q, coin) }),
    };
  },
  halves: (s, [half, b]) => {
    const [was, first, then, t] = HALVES[s];
    return { text: fill(J.FRAMES.halves.text, { was, half: C(half * 2, t), first, b: N(b, t), then, many: t.many }), how: fill(J.FRAMES.halves.how, { half: N(half, t), b: N(b, t) }) };
  },
};

const NOBODY: Hero = { name: '', he: '', him: '', has: '', v: (m) => m };

export const uk: StoryWords = {
  tell: (frame, skin, n, hero, money) => FRAMES[frame](skin, n, hero ? heroOf(hero) : NOBODY, coinOf(money)),
  chips: {
    join: (skin) => [JOIN[skin][0].toLowerCase(), JOIN[skin][1]],
    howManyMore: J.chips.howManyMore,
    howManyFewer: J.chips.howManyFewer,
    change: J.chips.change,
    lack: J.chips.lack,
    half: J.chips.half,
    when: J.chips.when,
    price: (n, money) => `${n} ${currencyOf(money).short}`,
    eachPrice: (n, money) => fill(J.chips.eachPrice, { n, short: currencyOf(money).short }),
    by: (n) => fill(J.chips.by, { n }),
    each: (n) => fill(J.chips.each, { n }),
    extra: (n) => fill(J.chips.extra, { n }),
    timesMore: (n) => fill(J.chips.timesMore, { n }),
    timesFewer: (n) => fill(J.chips.timesFewer, { n }),
    moreBy: (n) => fill(J.chips.moreBy, { n }),
    at: (hour) => fill(J.chips.at, { hour }),
    hours: (n) => written(C(n, I.hour)),
    speed: (km) => fill(J.chips.speed, { km }),
  },
};
