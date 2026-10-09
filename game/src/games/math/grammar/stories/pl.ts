import type { CurrencyId } from '@/core/game/content/currency';
import { voiced } from '@/core/language';
import { say } from '@/core/language/marks';
import { MONEY } from '../pl';
import { filler, type Grammar, type Holes, type StoryItem } from '@/games/math/grammar/stories/fill';
import type { Frame, StoryTold, StoryWords } from '@/games/math/grammar/stories/types';
import { fill as put } from '@/core/language/fill';
import TEXTS from '@/locales/app/pl/games/math.json';

const J = TEXTS.stories;

/**
 * «Задачі» in Polish. Every list keeps the order of the skins in
 * `generators/wordProblems.ts`; the holes of a line are explained in `fill.ts`.
 *
 * Polish counts in three ways — «1 jabłko», «3 jabłka», «5 jabłek» — and the
 * verb follows: «leżą 3 jabłka», but «leży 5 jabłek». So a line names both
 * verbs, `{a?leżą|leży}`, and the number picks. Men are counted in their own
 * way («jechało 3 pasażerów», «Ilu pasażerów?»): such a thing is `virile`.
 */

const it = (one: string, few: string, many: string): StoryItem => ({ forms: [one, few, many] });
/** A thing counted the way men are: always «pasażerów», and the verb never plural. */
const men = (one: string, many: string): StoryItem => ({ forms: [one, many, many], virile: true });
const I = {
  apple: it(J.I.apple[1], J.I.apple[2], J.I.apple[3]), pear: it(J.I.pear[1], J.I.pear[2], J.I.pear[3]), candy: it(J.I.candy[1], J.I.candy[2], J.I.candy[3]), pencil: it(J.I.pencil[1], J.I.pencil[2], J.I.pencil[3]),
  marker: it(J.I.marker[1], J.I.marker[2], J.I.marker[3]), book: it(J.I.book[1], J.I.book[2], J.I.book[3]), ball: it(J.I.ball[1], J.I.ball[2], J.I.ball[3]), balloon: it(J.I.balloon[1], J.I.balloon[2], J.I.balloon[3]),
  sticker: it(J.I.sticker[1], J.I.sticker[2], J.I.sticker[3]), nut: it(J.I.nut[1], J.I.nut[2], J.I.nut[3]), car: it(J.I.car[1], J.I.car[2], J.I.car[3]), auto: it(J.I.auto[1], J.I.auto[2], J.I.auto[3]),
  cube: it(J.I.cube[1], J.I.cube[2], J.I.cube[3]), shell: it(J.I.shell[1], J.I.shell[2], J.I.shell[3]), bird: it(J.I.bird[1], J.I.bird[2], J.I.bird[3]), duck: it(J.I.duck[1], J.I.duck[2], J.I.duck[3]),
  rabbit: it(J.I.rabbit[1], J.I.rabbit[2], J.I.rabbit[3]), butterfly: it(J.I.butterfly[1], J.I.butterfly[2], J.I.butterfly[3]), kitten: it(J.I.kitten[1], J.I.kitten[2], J.I.kitten[3]), bee: it(J.I.bee[1], J.I.bee[2], J.I.bee[3]),
  star: it(J.I.star[1], J.I.star[2], J.I.star[3]), cake: it(J.I.cake[1], J.I.cake[2], J.I.cake[3]), page: it(J.I.page[1], J.I.page[2], J.I.page[3]), fish: it(J.I.fish[1], J.I.fish[2], J.I.fish[3]),
  bigFish: it(J.I.bigFish[1], J.I.bigFish[2], J.I.bigFish[3]), flower: it(J.I.flower[1], J.I.flower[2], J.I.flower[3]), coin: it(J.I.coin[1], J.I.coin[2], J.I.coin[3]), stamp: it(J.I.stamp[1], J.I.stamp[2], J.I.stamp[3]),
  tomato: it(J.I.tomato[1], J.I.tomato[2], J.I.tomato[3]), cucumber: it(J.I.cucumber[1], J.I.cucumber[2], J.I.cucumber[3]), carrot: it(J.I.carrot[1], J.I.carrot[2], J.I.carrot[3]), egg: it(J.I.egg[1], J.I.egg[2], J.I.egg[3]),
  mushroom: it(J.I.mushroom[1], J.I.mushroom[2], J.I.mushroom[3]), tree: it(J.I.tree[1], J.I.tree[2], J.I.tree[3]), appleTree: it(J.I.appleTree[1], J.I.appleTree[2], J.I.appleTree[3]), pearTree: it(J.I.pearTree[1], J.I.pearTree[2], J.I.pearTree[3]),
  bush: it(J.I.bush[1], J.I.bush[2], J.I.bush[3]), cup: it(J.I.cup[1], J.I.cup[2], J.I.cup[3]), plate: it(J.I.plate[1], J.I.plate[2], J.I.plate[3]), notebook: it(J.I.notebook[1], J.I.notebook[2], J.I.notebook[3]),
  bun: it(J.I.bun[1], J.I.bun[2], J.I.bun[3]), pie: it(J.I.pie[1], J.I.pie[2], J.I.pie[3]), ticket: it(J.I.ticket[1], J.I.ticket[2], J.I.ticket[3]), postcard: it(J.I.postcard[1], J.I.postcard[2], J.I.postcard[3]),
  chair: it(J.I.chair[1], J.I.chair[2], J.I.chair[3]), desk: it(J.I.desk[1], J.I.desk[2], J.I.desk[3]), doll: it(J.I.doll[1], J.I.doll[2], J.I.doll[3]), robot: it(J.I.robot[1], J.I.robot[2], J.I.robot[3]),
  puzzle: it(J.I.puzzle[1], J.I.puzzle[2], J.I.puzzle[3]), bike: it(J.I.bike[1], J.I.bike[2], J.I.bike[3]), card: it(J.I.card[1], J.I.card[2], J.I.card[3]), photo: it(J.I.photo[1], J.I.photo[2], J.I.photo[3]),
  goal: it(J.I.goal[1], J.I.goal[2], J.I.goal[3]), lap: it(J.I.lap[1], J.I.lap[2], J.I.lap[3]), passenger: men(J.I.passenger[1], J.I.passenger[2]), pupil: men(J.I.pupil[1], J.I.pupil[2]), visitor: men(J.I.visitor[1], J.I.visitor[2]),
  athlete: men(J.I.athlete[1], J.I.athlete[2]), boy: men(J.I.boy[1], J.I.boy[2]), girl: it(J.I.girl[1], J.I.girl[2], J.I.girl[3]), cow: it(J.I.cow[1], J.I.cow[2], J.I.cow[3]),
  horse: it(J.I.horse[1], J.I.horse[2], J.I.horse[3]), monkey: it(J.I.monkey[1], J.I.monkey[2], J.I.monkey[3]), parrot: it(J.I.parrot[1], J.I.parrot[2], J.I.parrot[3]), row: it(J.I.row[1], J.I.row[2], J.I.row[3]), line: it(J.I.line[1], J.I.line[2], J.I.line[3]),
  km: it(J.I.km[1], J.I.km[2], J.I.km[3]), hour: it(J.I.hour[1], J.I.hour[2], J.I.hour[3]),
  // Those something is shared among.
  friend: men(J.I.friend[1], J.I.friend[2]), child: it(J.I.child[1], J.I.child[2], J.I.child[3]), squirrel: it(J.I.squirrel[1], J.I.squirrel[2], J.I.squirrel[3]), sister: it(J.I.sister[1], J.I.sister[2], J.I.sister[3]),
  guest: men(J.I.guest[1], J.I.guest[2]), little: it(J.I.little[1], J.I.little[2], J.I.little[3]), cat: it(J.I.cat[1], J.I.cat[2], J.I.cat[3]), player: men(J.I.player[1], J.I.player[2]),
};

/** 2, 3, 4 (but not 12, 13, 14): «3 jabłka», «23 jabłka». */
const few = (n: number) => n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14);
const count = (n: number, item: StoryItem) => `${n} ${item.forms[n === 1 ? 0 : !item.virile && few(n) ? 1 : 2]}`;
const grammar: Grammar = {
  count,
  plural: (n, item) => !item.virile && few(n),
  many: (item) => item.forms[2],
  howMany: (item) => (item.virile ? J.grammar.howMany[1] : J.grammar.howMany[2]),
  cap: (text) => text.charAt(0).toLocaleUpperCase('pl') + text.slice(1),
  names: J.grammar.names,
  heroWords: { mu: [J.grammar.heroWords.mu[0], J.grammar.heroWords.mu[1]] },
  // «jeszcze 2» of the stickers is «dwie», of the passengers — «dwóch»: the voice knows how to
  // say a number next to its thing, so it is asked for the pair and the thing is dropped.
  bare: (n, item) => {
    const thing = item.forms[n === 1 ? 0 : !item.virile && few(n) ? 1 : 2];
    const said = voiced(`${n} ${thing}`, 'pl');
    return thing && said.endsWith(` ${thing}`) ? say(n, said.slice(0, -thing.length - 1)) : String(n);
  },
};
const fill = filler(grammar);
const coinOf = (money: CurrencyId): StoryItem => ({ forms: MONEY[money].forms });
const price = (n: number, money: CurrencyId) => `${n} ${MONEY[money].short}`;

/**
 * «między 4 przyjaciół», «między 3 siostry», «między 4 dzieci»: those something is shared among
 * stand in the accusative, and the number is said in the way of its own — «czterech», «trzy», «czworo».
 */
const PLAIN = J.PLAIN;
const MEN = J.MEN;
const TOGETHER = J.TOGETHER;
function among(n: number, whom: StoryItem): string {
  const word = whom.virile ? MEN[n] : whom === I.child ? TOGETHER[n] : n === 2 && whom.forms[0].endsWith('a') ? J.among.word : PLAIN[n];
  return `${word ? say(n, word) : n} ${whom.forms[!whom.virile && few(n) ? 1 : 2]}`;
}

/** A skin: its line (or the words that go into the frame's line), and the things it counts. */
type Skin = [line: string | Record<string, string>, t?: StoryItem, u?: StoryItem];
interface Told {
  /** The frame's own line, when its skins only hand over words. */
  line?: string;
  how: string | ((skin: number) => string);
  skins: Skin[];
}

const JOIN: [here: string, there: string, verbs: string, t: StoryItem][] = [
  [J.JOIN[0][0], J.JOIN[0][1], J.JOIN[0][2], I.car], [J.JOIN[1][0], J.JOIN[1][1], J.JOIN[1][2], I.book], [J.JOIN[2][0], J.JOIN[2][1], J.JOIN[2][2], I.candy], [J.JOIN[3][0], J.JOIN[3][1], J.JOIN[3][2], I.bird],
  [J.JOIN[4][0], J.JOIN[4][1], J.JOIN[4][2], I.fish], [J.JOIN[5][0], J.JOIN[5][1], J.JOIN[5][2], I.flower], [J.JOIN[6][0], J.JOIN[6][1], J.JOIN[6][2], I.pencil], [J.JOIN[7][0], J.JOIN[7][1], J.JOIN[7][2], I.bike],
];

const THOUGHT: [did: string, undo: string][] = [
  [J.THOUGHT[0][0], J.THOUGHT[0][1]],
  [J.THOUGHT[1][0], J.THOUGHT[1][1]],
  [J.THOUGHT[2][0], J.THOUGHT[2][1]],
  [J.THOUGHT[3][0], J.THOUGHT[3][1]],
  [J.THOUGHT[4][0], J.THOUGHT[4][1]],
  [J.THOUGHT[5][0], J.THOUGHT[5][1]],
  [J.THOUGHT[6][0], J.THOUGHT[6][1]],
  [J.THOUGHT[7][0], J.THOUGHT[7][1]],
];

const FRAMES: Record<Frame, Told> = {
  join: {
    line: J.FRAMES.join.line,
    how: J.FRAMES.join.how,
    skins: JOIN.map(([here, there, verbs, t]): Skin => [{ here, there, verbs }, t]),
  },
  gotMore: {
    line: J.FRAMES.gotMore.line,
    how: J.FRAMES.gotMore.how,
    skins: [[J.FRAMES.gotMore.skins[0][0], I.sticker], [J.FRAMES.gotMore.skins[1][0], I.balloon], [J.FRAMES.gotMore.skins[2][0], I.cube], [J.FRAMES.gotMore.skins[3][0], I.nut], [J.FRAMES.gotMore.skins[4][0], I.stamp], [J.FRAMES.gotMore.skins[5][0], I.doll], [J.FRAMES.gotMore.skins[6][0], I.robot], [J.FRAMES.gotMore.skins[7][0], I.puzzle]],
  },
  cameIn: {
    line: J.FRAMES.cameIn.line,
    how: J.FRAMES.cameIn.how,
    skins: [
      [J.FRAMES.cameIn.skins[0][0], I.bird],
      [J.FRAMES.cameIn.skins[1][0], I.duck],
      [J.FRAMES.cameIn.skins[2][0], I.rabbit],
      [J.FRAMES.cameIn.skins[3][0], I.butterfly],
      [J.FRAMES.cameIn.skins[4][0], I.kitten],
      [J.FRAMES.cameIn.skins[5][0], I.bee],
      [J.FRAMES.cameIn.skins[6][0], I.auto],
      [J.FRAMES.cameIn.skins[7][0], I.star],
    ],
  },
  gave: {
    line: J.FRAMES.gave.line,
    how: J.FRAMES.gave.how,
    skins: [
      [J.FRAMES.gave.skins[0][0], I.candy], [J.FRAMES.gave.skins[1][0], I.sticker], [J.FRAMES.gave.skins[2][0], I.apple], [J.FRAMES.gave.skins[3][0], I.cube],
      [J.FRAMES.gave.skins[4][0], I.balloon], [J.FRAMES.gave.skins[5][0], I.pencil], [J.FRAMES.gave.skins[6][0], I.flower], [J.FRAMES.gave.skins[7][0], I.car],
    ],
  },
  wentAway: {
    line: J.FRAMES.wentAway.line,
    how: J.FRAMES.wentAway.how,
    skins: [
      [J.FRAMES.wentAway.skins[0][0], I.bird],
      [J.FRAMES.wentAway.skins[1][0], I.cake],
      [J.FRAMES.wentAway.skins[2][0], I.mushroom],
      [J.FRAMES.wentAway.skins[3][0], I.duck],
      [J.FRAMES.wentAway.skins[4][0], I.auto],
      [J.FRAMES.wentAway.skins[5][0], I.book],
      [J.FRAMES.wentAway.skins[6][0], I.balloon],
      [J.FRAMES.wentAway.skins[7][0], I.cup],
    ],
  },
  // Here there are always five or more of the first kind, so the verb stands in one form.
  twoKinds: {
    how: J.FRAMES.twoKinds.how,
    skins: [
      [J.FRAMES.twoKinds.skins[0][0], I.boy, I.girl],
      [J.FRAMES.twoKinds.skins[1][0], I.appleTree, I.pearTree],
      [J.FRAMES.twoKinds.skins[2][0], I.cow, I.horse],
      [J.FRAMES.twoKinds.skins[3][0], I.apple, I.pear],
      [J.FRAMES.twoKinds.skins[4][0], I.tomato, I.cucumber],
      [J.FRAMES.twoKinds.skins[5][0], I.cube, I.ball],
      [J.FRAMES.twoKinds.skins[6][0], I.monkey, I.parrot],
      [J.FRAMES.twoKinds.skins[7][0], I.cup, I.plate],
    ],
  },
  left20: {
    how: J.FRAMES.left20.how,
    skins: [
      [J.FRAMES.left20.skins[0][0], I.passenger],
      [J.FRAMES.left20.skins[1][0], I.page],
      [J.FRAMES.left20.skins[2][0], I.sticker],
      [J.FRAMES.left20.skins[3][0], I.apple],
      [J.FRAMES.left20.skins[4][0], I.candy],
      [J.FRAMES.left20.skins[5][0], I.auto],
      [J.FRAMES.left20.skins[6][0], I.egg],
      [J.FRAMES.left20.skins[7][0], I.cow],
    ],
  },
  // Eight to eighteen of the first: always «naklejek», never «naklejki».
  howManyMore: {
    how: J.FRAMES.howManyMore.how,
    skins: [
      [J.FRAMES.howManyMore.skins[0][0], I.sticker],
      [J.FRAMES.howManyMore.skins[1][0], I.car],
      [J.FRAMES.howManyMore.skins[2][0], I.mushroom],
      [J.FRAMES.howManyMore.skins[3][0], I.book],
      [J.FRAMES.howManyMore.skins[4][0], I.cube],
      [J.FRAMES.howManyMore.skins[5][0], I.pie],
      [J.FRAMES.howManyMore.skins[6][0], I.fish],
      [J.FRAMES.howManyMore.skins[7][0], I.flower],
    ],
  },
  howManyFewer: {
    how: J.FRAMES.howManyFewer.how,
    skins: [
      [J.FRAMES.howManyFewer.skins[0][0], I.nut],
      [J.FRAMES.howManyFewer.skins[1][0], I.balloon],
      [J.FRAMES.howManyFewer.skins[2][0], I.candy],
      [J.FRAMES.howManyFewer.skins[3][0], I.bird],
      [J.FRAMES.howManyFewer.skins[4][0], I.pencil],
      [J.FRAMES.howManyFewer.skins[5][0], I.mushroom],
      [J.FRAMES.howManyFewer.skins[6][0], I.cake],
      [J.FRAMES.howManyFewer.skins[7][0], I.stamp],
    ],
  },
  missing: {
    how: J.FRAMES.missing.how,
    skins: [
      [J.FRAMES.missing.skins[0][0], I.candy],
      [J.FRAMES.missing.skins[1][0], I.book],
      [J.FRAMES.missing.skins[2][0], I.mushroom],
      [J.FRAMES.missing.skins[3][0], I.bird],
      [J.FRAMES.missing.skins[4][0], I.pencil],
      [J.FRAMES.missing.skins[5][0], I.auto],
      [J.FRAMES.missing.skins[6][0], I.coin],
      [J.FRAMES.missing.skins[7][0], I.stamp],
    ],
  },
  totalPrice: {
    line: J.FRAMES.totalPrice.line,
    how: J.FRAMES.totalPrice.how,
    skins: [
      [J.FRAMES.totalPrice.skins[0][0]], [J.FRAMES.totalPrice.skins[1][0]],
      [J.FRAMES.totalPrice.skins[2][0]], [J.FRAMES.totalPrice.skins[3][0]],
      [J.FRAMES.totalPrice.skins[4][0]], [J.FRAMES.totalPrice.skins[5][0]],
      [J.FRAMES.totalPrice.skins[6][0]], [J.FRAMES.totalPrice.skins[7][0]],
    ],
  },
  change: {
    line: J.FRAMES.change.line,
    how: J.FRAMES.change.how,
    skins: J.FRAMES.change.skins.map((thing): Skin => [{ thing }]),
  },
  notEnough: {
    line: J.FRAMES.notEnough.line,
    how: J.FRAMES.notEnough.how,
    skins: J.FRAMES.notEnough.skins.map((thing): Skin => [{ thing }]),
  },
  repriced: {
    line: J.FRAMES.repriced.line,
    how: (skin) => (skin % 2 ? J.FRAMES.repriced.how[1] : J.FRAMES.repriced.how[2]),
    skins: [
      [J.FRAMES.repriced.skins[0][0]], [J.FRAMES.repriced.skins[1][0]], [J.FRAMES.repriced.skins[2][0]], [J.FRAMES.repriced.skins[3][0]],
      [J.FRAMES.repriced.skins[4][0]], [J.FRAMES.repriced.skins[5][0]], [J.FRAMES.repriced.skins[6][0]], [J.FRAMES.repriced.skins[7][0]],
    ],
  },
  threeAdd: {
    how: J.FRAMES.threeAdd.how,
    skins: [
      [J.FRAMES.threeAdd.skins[0][0], I.apple],
      [J.FRAMES.threeAdd.skins[1][0], I.page],
      [J.FRAMES.threeAdd.skins[2][0], I.book],
      [J.FRAMES.threeAdd.skins[3][0], I.bun],
      [J.FRAMES.threeAdd.skins[4][0], I.tree],
      [J.FRAMES.threeAdd.skins[5][0], I.passenger],
      [J.FRAMES.threeAdd.skins[6][0], I.goal],
      [J.FRAMES.threeAdd.skins[7][0], I.cube],
    ],
  },
  groups: {
    how: J.FRAMES.groups.how,
    skins: [
      [J.FRAMES.groups.skins[0][0], I.pencil],
      [J.FRAMES.groups.skins[1][0], I.apple],
      [J.FRAMES.groups.skins[2][0], I.cake],
      [J.FRAMES.groups.skins[3][0], I.candy],
      [J.FRAMES.groups.skins[4][0], I.flower],
      [J.FRAMES.groups.skins[5][0], I.book],
      [J.FRAMES.groups.skins[6][0], I.egg],
      [J.FRAMES.groups.skins[7][0], I.passenger],
    ],
  },
  priceTimes: {
    line: J.FRAMES.priceTimes.line,
    how: J.FRAMES.priceTimes.how,
    skins: [
      [J.FRAMES.priceTimes.skins[0][0], I.notebook], [J.FRAMES.priceTimes.skins[1][0], I.bun], [J.FRAMES.priceTimes.skins[2][0], I.ticket], [J.FRAMES.priceTimes.skins[3][0], I.sticker],
      [J.FRAMES.priceTimes.skins[4][0], I.pencil], [J.FRAMES.priceTimes.skins[5][0], I.cake], [J.FRAMES.priceTimes.skins[6][0], I.postcard], [J.FRAMES.priceTimes.skins[7][0], I.balloon],
    ],
  },
  // The rows are the first thing here (they are what «są» or «jest» answers to), what stands in them — the second.
  rows: {
    line: J.FRAMES.rows.line,
    how: J.FRAMES.rows.how,
    skins: [
      [J.FRAMES.rows.skins[0][0], I.row, I.desk], [J.FRAMES.rows.skins[1][0], I.row, I.carrot], [J.FRAMES.rows.skins[2][0], I.row, I.chair], [J.FRAMES.rows.skins[3][0], I.row, I.candy],
      [J.FRAMES.rows.skins[4][0], I.line, I.athlete], [J.FRAMES.rows.skins[5][0], I.row, I.tree], [J.FRAMES.rows.skins[6][0], I.row, I.sticker], [J.FRAMES.rows.skins[7][0], I.row, I.auto],
    ],
  },
  share: {
    line: J.FRAMES.share.line,
    how: J.FRAMES.share.how,
    skins: [
      [J.FRAMES.share.skins[0][0], I.candy, I.friend], [J.FRAMES.share.skins[1][0], I.apple, I.child], [J.FRAMES.share.skins[2][0], I.nut, I.squirrel], [J.FRAMES.share.skins[3][0], I.sticker, I.sister],
      [J.FRAMES.share.skins[4][0], I.cake, I.guest], [J.FRAMES.share.skins[5][0], I.carrot, I.rabbit], [J.FRAMES.share.skins[6][0], I.balloon, I.little], [J.FRAMES.share.skins[7][0], I.fish, I.cat],
    ],
  },
  pack: {
    how: J.FRAMES.pack.how,
    skins: [
      [J.FRAMES.pack.skins[0][0], I.pencil],
      [J.FRAMES.pack.skins[1][0], I.egg],
      [J.FRAMES.pack.skins[2][0], I.apple],
      [J.FRAMES.pack.skins[3][0], I.book],
      [J.FRAMES.pack.skins[4][0], I.flower],
      [J.FRAMES.pack.skins[5][0], I.candy],
      [J.FRAMES.pack.skins[6][0], I.photo],
      [J.FRAMES.pack.skins[7][0], I.bun],
    ],
  },
  timesPlus: {
    line: J.FRAMES.timesPlus.line,
    how: J.FRAMES.timesPlus.how,
    skins: [
      [J.FRAMES.timesPlus.skins[0][0], I.pencil], [J.FRAMES.timesPlus.skins[1][0], I.apple], [J.FRAMES.timesPlus.skins[2][0], I.candy],
      [J.FRAMES.timesPlus.skins[3][0], I.stamp], [J.FRAMES.timesPlus.skins[4][0], I.flower], [J.FRAMES.timesPlus.skins[5][0], I.tomato],
      [J.FRAMES.timesPlus.skins[6][0], I.fish], [J.FRAMES.timesPlus.skins[7][0], I.marker],
    ],
  },
  timesChange: {
    line: J.FRAMES.timesChange.line,
    how: J.FRAMES.timesChange.how,
    skins: [I.bun, I.notebook, I.sticker, I.pencil, I.balloon, I.ticket, I.postcard, I.cake].map((t): Skin => [{}, t]),
  },
  shareMinus: {
    line: J.FRAMES.shareMinus.line,
    how: J.FRAMES.shareMinus.how,
    skins: [
      [J.FRAMES.shareMinus.skins[0][0], I.candy, I.child], [J.FRAMES.shareMinus.skins[1][0], I.apple, I.friend],
      [J.FRAMES.shareMinus.skins[2][0], I.sticker, I.sister], [J.FRAMES.shareMinus.skins[3][0], I.nut, I.squirrel],
      [J.FRAMES.shareMinus.skins[4][0], I.balloon, I.little], [J.FRAMES.shareMinus.skins[5][0], I.cake, I.guest],
      [J.FRAMES.shareMinus.skins[6][0], I.carrot, I.rabbit], [J.FRAMES.shareMinus.skins[7][0], I.card, I.player],
    ],
  },
  timesMore: {
    how: J.FRAMES.timesMore.how,
    skins: [
      [J.FRAMES.timesMore.skins[0][0], I.bush],
      [J.FRAMES.timesMore.skins[1][0], I.sticker],
      [J.FRAMES.timesMore.skins[2][0], I.fish],
      [J.FRAMES.timesMore.skins[3][0], I.pupil],
      [J.FRAMES.timesMore.skins[4][0], I.book],
      [J.FRAMES.timesMore.skins[5][0], I.visitor],
      [J.FRAMES.timesMore.skins[6][0], I.mushroom],
      [J.FRAMES.timesMore.skins[7][0], I.bigFish],
    ],
  },
  timesFewer: {
    how: J.FRAMES.timesFewer.how,
    skins: [
      [J.FRAMES.timesFewer.skins[0][0], I.cube],
      [J.FRAMES.timesFewer.skins[1][0], I.car],
      [J.FRAMES.timesFewer.skins[2][0], I.apple],
      [J.FRAMES.timesFewer.skins[3][0], I.book],
      [J.FRAMES.timesFewer.skins[4][0], I.shell],
      [J.FRAMES.timesFewer.skins[5][0], I.flower],
      [J.FRAMES.timesFewer.skins[6][0], I.bun],
      [J.FRAMES.timesFewer.skins[7][0], I.duck],
    ],
  },
  moreTotal: {
    how: J.FRAMES.moreTotal.how,
    skins: [
      [J.FRAMES.moreTotal.skins[0][0], I.book],
      [J.FRAMES.moreTotal.skins[1][0], I.apple],
      [J.FRAMES.moreTotal.skins[2][0], I.sticker],
      [J.FRAMES.moreTotal.skins[3][0], I.passenger],
      [J.FRAMES.moreTotal.skins[4][0], I.ticket],
      [J.FRAMES.moreTotal.skins[5][0], I.pupil],
      [J.FRAMES.moreTotal.skins[6][0], I.flower],
      [J.FRAMES.moreTotal.skins[7][0], I.lap],
    ],
  },
  timed: {
    how: J.FRAMES.timed.how,
    skins: J.FRAMES.timed.skins.map((line): Skin => [line, I.hour]),
  },
  speed: {
    line: J.FRAMES.speed.line,
    how: J.FRAMES.speed.how,
    skins: J.FRAMES.speed.skins.map(([mover, will]): Skin => [{ mover, will }, I.km, I.hour]),
  },
  thought: {
    line: J.FRAMES.thought.line,
    how: J.FRAMES.thought.how,
    skins: THOUGHT.map(([did, undo]): Skin => [{ did, undo }]),
  },
  twoBuys: {
    line: J.FRAMES.twoBuys.line,
    how: J.FRAMES.twoBuys.how,
    skins: [
      [J.FRAMES.twoBuys.skins[0][0], I.pencil], [J.FRAMES.twoBuys.skins[1][0], I.bun], [J.FRAMES.twoBuys.skins[2][0], I.sticker], [J.FRAMES.twoBuys.skins[3][0], I.balloon], [J.FRAMES.twoBuys.skins[4][0], I.ticket],
      [J.FRAMES.twoBuys.skins[5][0], I.postcard], [J.FRAMES.twoBuys.skins[6][0], I.notebook], [J.FRAMES.twoBuys.skins[7][0], I.cake], [J.FRAMES.twoBuys.skins[8][0], I.candy],
    ],
  },
  halves: {
    how: J.FRAMES.halves.how,
    skins: [
      [J.FRAMES.halves.skins[0][0], I.candy],
      [J.FRAMES.halves.skins[1][0], I.book],
      [J.FRAMES.halves.skins[2][0], I.pie],
      [J.FRAMES.halves.skins[3][0], I.sticker],
      [J.FRAMES.halves.skins[4][0], I.apple],
      [J.FRAMES.halves.skins[5][0], I.balloon],
      [J.FRAMES.halves.skins[6][0], I.coin],
      [J.FRAMES.halves.skins[7][0], I.tomato],
      [J.FRAMES.halves.skins[8][0], I.cake],
    ],
  },
};

function tell(frame: Frame, skin: number, n: number[], hero: Holes['hero'], money: CurrencyId): StoryTold {
  const told = FRAMES[frame];
  const [words, t, u] = told.skins[skin];
  const holes: Holes = { n, t, u, hero, coin: coinOf(money), extra: { ...(typeof words === 'string' ? {} : words), umany: u ? grammar.many(u) : '', among: u ? among(n[1], u) : '' } };
  return { text: fill(typeof words === 'string' ? words : told.line ?? '', holes), how: fill(typeof told.how === 'string' ? told.how : told.how(skin), holes) };
}

export const pl: StoryWords = {
  tell,
  chips: {
    join: (skin) => [JOIN[skin][0].toLocaleLowerCase('pl'), JOIN[skin][1]],
    howManyMore: J.chips.howManyMore,
    howManyFewer: J.chips.howManyFewer,
    change: J.chips.change,
    lack: J.chips.lack,
    half: J.chips.half,
    when: J.chips.when,
    price,
    eachPrice: (n, money) => put(J.chips.eachPrice, { n: price(n, money) }),
    by: (n) => put(J.chips.by, { n }),
    each: (n) => put(J.chips.each, { n }),
    extra: (n) => put(J.chips.extra, { n }),
    timesMore: (n) => put(J.chips.timesMore, { n }),
    timesFewer: (n) => put(J.chips.timesFewer, { n }),
    moreBy: (n) => put(J.chips.moreBy, { n }),
    at: (hour) => put(J.chips.at, { hour }),
    hours: (n) => count(n, I.hour),
    speed: (km) => put(J.chips.speed, { km }),
  },
};
