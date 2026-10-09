import type { CurrencyId } from '@/core/game/content/currency';
import { MONEY } from '../en';
import { filler, type Grammar, type Holes, type StoryItem } from '@/games/math/grammar/stories/fill';
import type { Frame, StoryTold, StoryWords } from '@/games/math/grammar/stories/types';
import { fill as put } from '@/core/language/fill';
import TEXTS from '@/locales/app/en/games/math.json';

const J = TEXTS.stories;

/**
 * «Задачі» in English. Every list keeps the order of the skins in
 * `generators/wordProblems.ts`; the holes of a line are explained in `fill.ts`.
 */

const it = (one: string, many = put(J.it, { one })): StoryItem => ({ forms: [one, many] });
const I = {
  apple: it(J.I.apple), pear: it(J.I.pear), candy: it(J.I.candy[1], J.I.candy[2]), pencil: it(J.I.pencil), marker: it(J.I.marker), book: it(J.I.book), ball: it(J.I.ball),
  balloon: it(J.I.balloon), sticker: it(J.I.sticker), nut: it(J.I.nut), car: it(J.I.car), auto: it(J.I.auto), cube: it(J.I.cube), shell: it(J.I.shell), bird: it(J.I.bird),
  duck: it(J.I.duck), rabbit: it(J.I.rabbit), butterfly: it(J.I.butterfly[1], J.I.butterfly[2]), kitten: it(J.I.kitten), bee: it(J.I.bee), star: it(J.I.star), cake: it(J.I.cake),
  page: it(J.I.page), fish: it(J.I.fish[1], J.I.fish[2]), bigFish: it(J.I.bigFish[1], J.I.bigFish[2]), flower: it(J.I.flower), coin: it(J.I.coin), stamp: it(J.I.stamp),
  tomato: it(J.I.tomato[1], J.I.tomato[2]), cucumber: it(J.I.cucumber), carrot: it(J.I.carrot), egg: it(J.I.egg), mushroom: it(J.I.mushroom), tree: it(J.I.tree),
  appleTree: it(J.I.appleTree), pearTree: it(J.I.pearTree), bush: it(J.I.bush[1], J.I.bush[2]), cup: it(J.I.cup), plate: it(J.I.plate), notebook: it(J.I.notebook), bun: it(J.I.bun),
  pie: it(J.I.pie), ticket: it(J.I.ticket), postcard: it(J.I.postcard), chair: it(J.I.chair), desk: it(J.I.desk), doll: it(J.I.doll), robot: it(J.I.robot),
  puzzle: it(J.I.puzzle), bike: it(J.I.bike), card: it(J.I.card), photo: it(J.I.photo), goal: it(J.I.goal), lap: it(J.I.lap), passenger: it(J.I.passenger),
  pupil: it(J.I.pupil), visitor: it(J.I.visitor), athlete: it(J.I.athlete), boy: it(J.I.boy), girl: it(J.I.girl), cow: it(J.I.cow), horse: it(J.I.horse),
  monkey: it(J.I.monkey), parrot: it(J.I.parrot), km: it(J.I.km), hour: it(J.I.hour),
};

const count = (n: number, item: StoryItem) => `${n} ${item.forms[n === 1 ? 0 : 1]}`;
const grammar: Grammar = {
  count,
  plural: (n) => n !== 1,
  many: (item) => item.forms[1],
  howMany: () => J.grammar.howMany,
  cap: (text) => text.charAt(0).toUpperCase() + text.slice(1),
  names: J.grammar.names,
  heroWords: { he: [J.grammar.heroWords.he[0], J.grammar.heroWords.he[1]], He: [J.grammar.heroWords.He[0], J.grammar.heroWords.He[1]], him: [J.grammar.heroWords.him[0], J.grammar.heroWords.him[1]], his: [J.grammar.heroWords.his[0], J.grammar.heroWords.his[1]] },
};
const fill = filler(grammar);
const coinOf = (money: CurrencyId): StoryItem => ({ forms: [MONEY[money].one, MONEY[money].many] });
/** «$12», «12 zł»: the sign stands where English puts it. */
const price = (n: number, money: CurrencyId) => (/^[$£€]$/.test(MONEY[money].short) ? `${MONEY[money].short}${n}` : `${n} ${MONEY[money].short}`);

/** A skin: its line (or the words that go into the frame's line), and the things it counts. */
type Skin = [line: string | Record<string, string>, t?: StoryItem, u?: StoryItem];
interface Told {
  /** The frame's own line, when its skins only hand over words. */
  line?: string;
  how: string | ((skin: number) => string);
  skins: Skin[];
}

const JOIN: [string, string, StoryItem][] = [
  [J.JOIN[0][0], J.JOIN[0][1], I.car], [J.JOIN[1][0], J.JOIN[1][1], I.book], [J.JOIN[2][0], J.JOIN[2][1], I.candy], [J.JOIN[3][0], J.JOIN[3][1], I.bird],
  [J.JOIN[4][0], J.JOIN[4][1], I.fish], [J.JOIN[5][0], J.JOIN[5][1], I.flower], [J.JOIN[6][0], J.JOIN[6][1], I.pencil], [J.JOIN[7][0], J.JOIN[7][1], I.bike],
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
    skins: JOIN.map(([here, there, t]): Skin => [{ here, there }, t]),
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
  twoKinds: {
    line: J.FRAMES.twoKinds.line,
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
    skins: J.FRAMES.repriced.skins._.map((thing, i): Skin => [{ thing, way: i % 2 ? J.FRAMES.repriced.skins[0].way[1] : J.FRAMES.repriced.skins[0].way[2] }]),
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
    skins: [I.notebook, I.bun, I.ticket, I.sticker, I.pencil, I.cake, I.postcard, I.balloon].map((t): Skin => [{ one: t.forms[0] }, t]),
  },
  rows: {
    line: J.FRAMES.rows.line,
    how: J.FRAMES.rows.how,
    skins: [
      [J.FRAMES.rows.skins[0][0], undefined, I.desk], [J.FRAMES.rows.skins[1][0], undefined, I.carrot],
      [J.FRAMES.rows.skins[2][0], undefined, I.chair], [J.FRAMES.rows.skins[3][0], undefined, I.candy],
      [J.FRAMES.rows.skins[4][0], undefined, I.athlete], [J.FRAMES.rows.skins[5][0], undefined, I.tree],
      [J.FRAMES.rows.skins[6][0], undefined, I.sticker], [J.FRAMES.rows.skins[7][0], undefined, I.auto],
    ],
  },
  share: {
    line: J.FRAMES.share.line,
    how: J.FRAMES.share.how,
    skins: [
      [J.FRAMES.share.skins[0][0], I.candy], [J.FRAMES.share.skins[1][0], I.apple], [J.FRAMES.share.skins[2][0], I.nut], [J.FRAMES.share.skins[3][0], I.sticker],
      [J.FRAMES.share.skins[4][0], I.cake], [J.FRAMES.share.skins[5][0], I.carrot], [J.FRAMES.share.skins[6][0], I.balloon], [J.FRAMES.share.skins[7][0], I.fish],
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
      [J.FRAMES.shareMinus.skins[0][0], I.candy], [J.FRAMES.shareMinus.skins[1][0], I.apple], [J.FRAMES.shareMinus.skins[2][0], I.sticker],
      [J.FRAMES.shareMinus.skins[3][0], I.nut], [J.FRAMES.shareMinus.skins[4][0], I.balloon], [J.FRAMES.shareMinus.skins[5][0], I.cake],
      [J.FRAMES.shareMinus.skins[6][0], I.carrot], [J.FRAMES.shareMinus.skins[7][0], I.card],
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
    skins: J.FRAMES.speed.skins.map(([mover, will]): Skin => [{ mover, it: will }, I.km, I.hour]),
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
  const holes: Holes = { n, t, u, hero, coin: coinOf(money), extra: { ...(typeof words === 'string' ? {} : words), umany: u ? grammar.many(u) : '' } };
  return { text: fill(typeof words === 'string' ? words : told.line ?? '', holes), how: fill(typeof told.how === 'string' ? told.how : told.how(skin), holes) };
}

export const en: StoryWords = {
  tell,
  chips: {
    join: (skin) => [JOIN[skin][0], JOIN[skin][1]],
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
