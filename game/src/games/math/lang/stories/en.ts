import type { CurrencyId } from '@/core/game/content/currency';
import { MONEY } from '../en';
import { filler, type Grammar, type Holes, type StoryItem } from './fill';
import type { Frame, StoryTold, StoryWords } from './types';

/**
 * «Задачі» in English. Every list keeps the order of the skins in
 * `generators/wordProblems.ts`; the holes of a line are explained in `fill.ts`.
 */

const it = (one: string, many = `${one}s`): StoryItem => ({ forms: [one, many] });
const I = {
  apple: it('apple'), pear: it('pear'), candy: it('candy', 'candies'), pencil: it('pencil'), marker: it('marker'), book: it('book'), ball: it('ball'),
  balloon: it('balloon'), sticker: it('sticker'), nut: it('nut'), car: it('toy car'), auto: it('car'), cube: it('block'), shell: it('shell'), bird: it('bird'),
  duck: it('duck'), rabbit: it('rabbit'), butterfly: it('butterfly', 'butterflies'), kitten: it('kitten'), bee: it('bee'), star: it('star'), cake: it('cupcake'),
  page: it('page'), fish: it('little fish', 'little fish'), bigFish: it('fish', 'fish'), flower: it('flower'), coin: it('coin'), stamp: it('stamp'),
  tomato: it('tomato', 'tomatoes'), cucumber: it('cucumber'), carrot: it('carrot'), egg: it('egg'), mushroom: it('mushroom'), tree: it('tree'),
  appleTree: it('apple tree'), pearTree: it('pear tree'), bush: it('bush', 'bushes'), cup: it('cup'), plate: it('plate'), notebook: it('notebook'), bun: it('roll'),
  pie: it('little pie'), ticket: it('ticket'), postcard: it('postcard'), chair: it('chair'), desk: it('desk'), doll: it('doll'), robot: it('robot'),
  puzzle: it('puzzle'), bike: it('bicycle'), card: it('card'), photo: it('photo'), goal: it('goal'), lap: it('lap'), passenger: it('passenger'),
  pupil: it('student'), visitor: it('visitor'), athlete: it('athlete'), boy: it('boy'), girl: it('girl'), cow: it('cow'), horse: it('horse'),
  monkey: it('monkey'), parrot: it('parrot'), km: it('kilometer'), hour: it('hour'),
};

const count = (n: number, item: StoryItem) => `${n} ${item.forms[n === 1 ? 0 : 1]}`;
const grammar: Grammar = {
  count,
  plural: (n) => n !== 1,
  many: (item) => item.forms[1],
  howMany: () => 'How many',
  cap: (text) => text.charAt(0).toUpperCase() + text.slice(1),
  names: { boys: ['Victor', 'Andrew', 'Tom', 'Max', 'Oscar', 'Nate', 'Daniel', 'Mark'], girls: ['Olivia', 'Sophie', 'Mary', 'Zoe', 'Stella', 'Daria', 'Hannah', 'Lucy'] },
  heroWords: { he: ['he', 'she'], He: ['He', 'She'], him: ['him', 'her'], his: ['his', 'her'] },
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
  ['on the table', 'in the basket', I.car], ['on the shelf', 'in the drawer', I.book], ['in the bowl', 'on the plate', I.candy], ['on the branch', 'on the roof', I.bird],
  ['in the aquarium', 'in the jar', I.fish], ['in the flower bed', 'in the flowerpot', I.flower], ['in the pencil case', 'on the desk', I.pencil], ['in the garage', 'in the yard', I.bike],
];

const THOUGHT: [did: string, undo: string][] = [
  ['added {b} to it', 'take away {b}'],
  ['took {b} away from it', 'add {b}'],
  ['multiplied it by {b}', 'divide by {b}'],
  ['divided it by {b}', 'multiply by {b}'],
  ['added {b} to it, and then {c} more', 'take away {c}, and then {b} more'],
  ['multiplied it by {b} and added {c}', 'take away {c}, and then divide by {b}'],
  ['took {b} away from it, and then added {c}', 'take away {c}, and then add {b}'],
  ['doubled it and took away {b}', 'add {b}, and then divide by two'],
];

const FRAMES: Record<Frame, Told> = {
  join: {
    line: 'There are {A} {here}, and {b} more {there}. How many {many} are there altogether?',
    how: 'The word “altogether” is a clue: put both piles together. Add.',
    skins: JOIN.map(([here, there, t]): Skin => [{ here, there }, t]),
  },
  gotMore: {
    line: '{N} had {A}. {gave} {him} {b} more. How many {many} does {he} have now?',
    how: 'There were {a}, and then {b} more. When more are given — we add.',
    skins: [[{ gave: 'Mom gave' }, I.sticker], [{ gave: 'Dad bought' }, I.balloon], [{ gave: 'Grandma gave' }, I.cube], [{ gave: 'Grandpa brought' }, I.nut], [{ gave: 'A friend gave' }, I.stamp], [{ gave: 'A sister gave' }, I.doll], [{ gave: 'A brother brought' }, I.robot], [{ gave: 'An aunt sent' }, I.puzzle]],
  },
  cameIn: {
    line: 'There were {A} {doing}. Then {b} more {came}. How many {many} are {where} now?',
    how: 'There are more {many} now. Add the ones that were there and the ones that came.',
    skins: [
      [{ doing: 'sitting on the branch', came: 'flew in', where: 'on the branch' }, I.bird],
      [{ doing: 'swimming on the pond', came: 'swam up', where: 'on the pond' }, I.duck],
      [{ doing: 'playing in the clearing', came: 'ran up', where: 'in the clearing' }, I.rabbit],
      [{ doing: 'sitting on the flower', came: 'flew in', where: 'on the flower' }, I.butterfly],
      [{ doing: 'playing in the yard', came: 'ran up', where: 'in the yard' }, I.kitten],
      [{ doing: 'flying by the hive', came: 'flew in', where: 'by the hive' }, I.bee],
      [{ doing: 'parked in the lot', came: 'drove up', where: 'in the lot' }, I.auto],
      [{ doing: 'shining in the sky', came: 'lit up', where: 'in the sky' }, I.star],
    ],
  },
  gave: {
    line: '{N} had {A}. {He} {did} {b} of them{whom}. How many {many} are left?',
    how: 'There were {a}, and now there are {b} fewer. When there are fewer — we subtract.',
    skins: [
      [{ did: 'gave', whom: ' to a friend' }, I.candy], [{ did: 'gave', whom: ' to a sister' }, I.sticker], [{ did: 'ate', whom: '' }, I.apple], [{ did: 'lost', whom: '' }, I.cube],
      [{ did: 'gave out', whom: ' to friends' }, I.balloon], [{ did: 'put', whom: ' in a drawer' }, I.pencil], [{ did: 'planted', whom: ' in the flower bed' }, I.flower], [{ did: 'gave', whom: ' to a brother' }, I.car],
    ],
  },
  wentAway: {
    line: 'There were {A} {doing}. {b} of them {gone}. How many {many} are left {where}?',
    how: 'There are fewer {many} now. From all of them take away the ones that are gone.',
    skins: [
      [{ doing: 'sitting on the branch', gone: 'flew away', where: 'on the branch' }, I.bird],
      [{ doing: 'on the plate', gone: 'were eaten', where: 'on the plate' }, I.cake],
      [{ doing: 'in the basket', gone: 'were taken', where: 'in the basket' }, I.mushroom],
      [{ doing: 'swimming on the pond', gone: 'swam away', where: 'on the pond' }, I.duck],
      [{ doing: 'parked in the lot', gone: 'drove away', where: 'in the lot' }, I.auto],
      [{ doing: 'on the shelf', gone: 'were taken to be read', where: 'on the shelf' }, I.book],
      [{ doing: 'flying in the sky', gone: 'popped', where: 'in the sky' }, I.balloon],
      [{ doing: 'on the table', gone: 'were taken to be washed', where: 'on the table' }, I.cup],
    ],
  },
  twoKinds: {
    line: '{lead} {A} and {Bu}. {ask}',
    how: 'This asks about all of them together. Add both numbers.',
    skins: [
      [{ lead: 'In the class there are', ask: 'How many children are in the class?' }, I.boy, I.girl],
      [{ lead: 'In the orchard there are', ask: 'How many trees are in the orchard altogether?' }, I.appleTree, I.pearTree],
      [{ lead: 'On the farm there are', ask: 'How many animals are on the farm altogether?' }, I.cow, I.horse],
      [{ lead: 'In the bowl there are', ask: 'How many pieces of fruit are in the bowl altogether?' }, I.apple, I.pear],
      [{ lead: 'Ripe in the garden bed are', ask: 'How many vegetables are ripe altogether?' }, I.tomato, I.cucumber],
      [{ lead: 'In the box there are', ask: 'How many toys are in the box altogether?' }, I.cube, I.ball],
      [{ lead: 'In the enclosure there are', ask: 'How many animals are in the enclosure altogether?' }, I.monkey, I.parrot],
      [{ lead: 'On the table there are', ask: 'How many dishes are on the table altogether?' }, I.cup, I.plate],
    ],
  },
  left20: {
    how: 'From all of them take away {b} — that many are gone.',
    skins: [
      ['There were {A} riding in the bus. {b} got off at the stop. How many passengers are left in the bus?', I.passenger],
      ['The book has {A}. {b} have been read already. How many pages are still left to read?', I.page],
      ['There were {A} in the set. {b} have been stuck on already. How many stickers are still left in the set?', I.sticker],
      ['There were {A} hanging on the tree. The wind shook down {b}. How many apples are left on the tree?', I.apple],
      ['There were {A} in the bag. The children ate {b}. How many candies are left in the bag?', I.candy],
      ['There were {A} in the garage. In the morning {b} drove out. How many cars are left in the garage?', I.auto],
      ['There were {A} in the basket. {b} were taken for breakfast. How many eggs are left in the basket?', I.egg],
      ['There were {A} grazing in the meadow. {b} went to the barn. How many cows are left in the meadow?', I.cow],
    ],
  },
  howManyMore: {
    how: 'To find how much bigger one number is than another, take the smaller from the bigger.',
    skins: [
      ['Olivia has {A}, and Tom has {b}. How many more {many} does Olivia have?', I.sticker],
      ['Mark has {A}, and Sophie has {b}. How many more {many} does Mark have?', I.car],
      ['There are {A} in the first basket, and {b} in the second. How many more {many} are in the first basket?', I.mushroom],
      ['There are {A} on the top shelf, and {b} on the bottom one. How many more {many} are on the top shelf?', I.book],
      ['There are {A} in the red box, and {b} in the blue one. How many more {many} are in the red box?', I.cube],
      ['Grandma has {A}, and Grandpa has {b}. How many more {many} does Grandma have?', I.pie],
      ['There are {A} in the first aquarium, and {b} in the second. How many more {many} are in the first aquarium?', I.fish],
      ['There are {A} in the left flower bed, and {b} in the right one. How many more {many} are in the left flower bed?', I.flower],
    ],
  },
  howManyFewer: {
    how: 'To find how much smaller one number is than another, take the smaller from the bigger.',
    skins: [
      ['Daniel has {A}, and Zoe has {b}. How many fewer {many} does Zoe have?', I.nut],
      ['Lucy has {A}, and Nate has {b}. How many fewer {many} does Nate have?', I.balloon],
      ['There are {A} in the big bowl, and {b} in the little one. How many fewer {many} are in the little bowl?', I.candy],
      ['There are {A} in the first tree, and {b} in the second. How many fewer {many} are in the second tree?', I.bird],
      ['There are {A} in the green pencil case, and {b} in the yellow one. How many fewer {many} are in the yellow pencil case?', I.pencil],
      ['Mom has {A}, and Dad has {b}. How many fewer {many} does Dad have?', I.mushroom],
      ['There are {A} on the first plate, and {b} on the second. How many fewer {many} are on the second plate?', I.cake],
      ['The big brother has {A}, and the little brother has {b}. How many fewer {many} does the little brother have?', I.stamp],
    ],
  },
  missing: {
    how: 'From what there is now, take away what there was: take {a} from {a+b}.',
    skins: [
      ['There were {A} in the bowl. Mom added a few more, and then there were {a+b}. How many {many} did Mom add?', I.candy],
      ['There were {A} on the shelf. Dad put a few more there, and then there were {a+b}. How many {many} did Dad put there?', I.book],
      ['There were {A} in the basket. Grandpa found a few more, and then there were {a+b}. How many {many} did Grandpa find?', I.mushroom],
      ['There were {A} sitting on the branch. A few more flew in, and then there were {a+b}. How many {many} flew in?', I.bird],
      ['There were {A} in the pencil case. Olivia put in a few more, and then there were {a+b}. How many {many} did Olivia put in?', I.pencil],
      ['There were {A} parked in the lot. A few more drove up, and then there were {a+b}. How many {many} drove up?', I.auto],
      ['There were {A} in the piggy bank. Mark dropped in a few more, and then there were {a+b}. How many {many} did Mark drop in?', I.coin],
      ['There were {A} in the album. A sister stuck in a few more, and then there were {a+b}. How many {many} did the sister stick in?', I.stamp],
    ],
  },
  totalPrice: {
    line: '{x} costs {$a}, and {y} costs {$b}. How many {coins} do {both} cost together?',
    how: 'To find how much everything costs together, add the prices.',
    skins: [
      [{ x: 'Juice', y: 'a roll', both: 'the juice and the roll' }], [{ x: 'A notebook', y: 'a pen', both: 'the notebook and the pen' }],
      [{ x: 'Ice cream', y: 'water', both: 'the ice cream and the water' }], [{ x: 'A movie ticket', y: 'popcorn', both: 'the ticket and the popcorn' }],
      [{ x: 'A doll', y: 'a ball', both: 'the doll and the ball' }], [{ x: 'Bread', y: 'milk', both: 'the bread and the milk' }],
      [{ x: 'A pencil', y: 'an eraser', both: 'the pencil and the eraser' }], [{ x: 'An apple', y: 'a banana', both: 'the apple and the banana' }],
    ],
  },
  change: {
    line: '{N} is buying {thing} for {$a} and gives the saleswoman {$b}. How many {coins} of change will {he} get?',
    how: 'Change is the money that is left. From {b} take away the price of what was bought.',
    skins: ['a book', 'a toy', 'a ball', 'an album', 'ice cream', 'flowers', 'a postcard', 'paints'].map((thing): Skin => [{ thing }]),
  },
  notEnough: {
    line: '{N} has {$a}. {thing} costs {$b}. How many {coins} is {he} short?',
    how: 'From the price take away the money there already is.',
    skins: ['Ice cream', 'A building set', 'A book', 'A scooter', 'A doll', 'A ticket', 'A ball', 'A puzzle'].map((thing): Skin => [{ thing }]),
  },
  repriced: {
    line: '{thing} cost {$a}, and then the price went {way} by {$b}. How many {coins} does it cost now?',
    how: (skin) => (skin % 2 ? '“The price went up” means it got bigger. Add.' : '“The price went down” means it got smaller. Subtract.'),
    skins: ['A toy', 'A ticket', 'A book', 'Juice', 'A cake', 'A doll', 'A ball', 'Ice cream'].map((thing, i): Skin => [{ thing, way: i % 2 ? 'up' : 'down' }]),
  },
  threeAdd: {
    how: 'Add all three numbers one after another: first {a} and {b}, then {c} more.',
    skins: [
      ['There are {A} in the first basket, {b} in the second, and {c} in the third. How many {many} are in the three baskets together?', I.apple],
      ['On Monday Olivia read {A}, on Tuesday {b}, and on Wednesday {c}. How many {many} did she read in the three days?', I.page],
      ['There are {A} on the first shelf, {b} on the second, and {c} on the third. How many {many} are on the three shelves together?', I.book],
      ['In the morning {A} were sold, in the afternoon {b}, and in the evening {c}. How many {many} were sold that day?', I.bun],
      ['The first grade planted {A}, the second {b}, and the third {c}. How many {many} did the three grades plant together?', I.tree],
      ['There are {A} riding in the first train car, {b} in the second, and {c} in the third. How many {many} are riding in the three cars?', I.passenger],
      ['Mark scored {A}, Daniel {b}, and Oscar {c}. How many {many} did the boys score together?', I.goal],
      ['There are {A} in the red box, {b} in the blue one, and {c} in the green one. How many {many} are in the three boxes together?', I.cube],
    ],
  },
  groups: {
    how: 'These are equal groups — {a} in each. Equal groups are multiplied: multiply {a} by {b}.',
    skins: [
      ['There are {A} in each box. How many {many} are in {b} boxes?', I.pencil],
      ['There are {A} in each basket. How many {many} are in {b} baskets?', I.apple],
      ['There are {A} on each plate. How many {many} are on {b} plates?', I.cake],
      ['There are {A} in each bag. How many {many} are in {b} bags?', I.candy],
      ['There are {A} in each vase. How many {many} are in {b} vases?', I.flower],
      ['There are {A} on each shelf. How many {many} are on {b} shelves?', I.book],
      ['There are {A} in each nest. How many {many} are in {b} nests?', I.egg],
      ['There are {A} in each train car. How many {many} are in {b} train cars?', I.passenger],
    ],
  },
  priceTimes: {
    line: 'One {one} costs {$a}. How many {coins} do {B} cost?',
    how: 'Each one costs the same. Multiply the price by how many there are: {a} times {b}.',
    skins: [I.notebook, I.bun, I.ticket, I.sticker, I.pencil, I.cake, I.postcard, I.balloon].map((t): Skin => [{ one: t.forms[0] }, t]),
  },
  rows: {
    line: '{where} there are {a} {rows} with {Bu} in each. How many {umany} are there altogether?',
    how: 'Every row has the same — {b}. Multiply by the number of rows.',
    skins: [
      [{ where: 'In the classroom', rows: 'rows' }, undefined, I.desk], [{ where: 'In the garden bed', rows: 'rows' }, undefined, I.carrot],
      [{ where: 'In the hall', rows: 'rows' }, undefined, I.chair], [{ where: 'In the box', rows: 'rows' }, undefined, I.candy],
      [{ where: 'In the parade', rows: 'lines' }, undefined, I.athlete], [{ where: 'In the orchard', rows: 'rows' }, undefined, I.tree],
      [{ where: 'On the sheet', rows: 'rows' }, undefined, I.sticker], [{ where: 'In the parking lot', rows: 'rows' }, undefined, I.auto],
    ],
  },
  share: {
    line: '{A} were shared equally among {b} {whom}. How many {many} did each {one} get?',
    how: '“Equally” means to divide. Divide {a} by {b}.',
    skins: [
      [{ whom: 'friends', one: 'friend' }, I.candy], [{ whom: 'children', one: 'child' }, I.apple], [{ whom: 'squirrels', one: 'squirrel' }, I.nut], [{ whom: 'sisters', one: 'sister' }, I.sticker],
      [{ whom: 'guests', one: 'guest' }, I.cake], [{ whom: 'rabbits', one: 'rabbit' }, I.carrot], [{ whom: 'little ones', one: 'little one' }, I.balloon], [{ whom: 'cats', one: 'cat' }, I.fish],
    ],
  },
  pack: {
    how: 'To put things out equally is to divide. Divide {a} by {b}.',
    skins: [
      ['{A} were put {b} into each box. How many boxes were needed?', I.pencil],
      ['{A} were put {b} into each tray. How many trays were needed?', I.egg],
      ['{A} were put {b} into each bag. How many bags were needed?', I.apple],
      ['{A} were put {b} on each shelf. How many shelves were needed?', I.book],
      ['{A} were put {b} into each bouquet. How many bouquets came out?', I.flower],
      ['{A} were put {b} into each present. How many presents came out?', I.candy],
      ['{A} were put {b} on each page of the album. How many pages were filled?', I.photo],
      ['{A} were put {b} on each plate. How many plates were needed?', I.bun],
    ],
  },
  timesPlus: {
    line: 'There are {B} in each of {a} {boxes}, and {c} more {loose}. How many {many} are there altogether?',
    how: 'First count the ones that lie in equal groups: multiply {b} by {a}. Then add {c} more.',
    skins: [
      [{ boxes: 'boxes', loose: 'lie loose' }, I.pencil], [{ boxes: 'baskets', loose: 'lie on the table' }, I.apple], [{ boxes: 'bags', loose: 'are in the bowl' }, I.candy],
      [{ boxes: 'albums', loose: 'are not stuck in yet' }, I.stamp], [{ boxes: 'vases', loose: 'stand apart' }, I.flower], [{ boxes: 'crates', loose: 'lie beside them' }, I.tomato],
      [{ boxes: 'aquariums', loose: 'swim in a jar' }, I.fish], [{ boxes: 'pencil cases', loose: 'lie on the desk' }, I.marker],
    ],
  },
  timesChange: {
    line: '{N} bought {A} for {$b} each and gave the saleswoman {$c}. How many {coins} of change will {he} get?',
    how: 'First find out how much was spent: multiply {b} by {a}. Then take that away from {c}.',
    skins: [I.bun, I.notebook, I.sticker, I.pencil, I.balloon, I.ticket, I.postcard, I.cake].map((t): Skin => [{}, t]),
  },
  shareMinus: {
    line: '{A} were shared equally among {b} {whom}. Each {one} {did} {c} right away. How many {many} does each {one} have left?',
    how: 'First divide: {a} by {b}. Then take away {c}.',
    skins: [
      [{ whom: 'children', one: 'child', did: 'ate' }, I.candy], [{ whom: 'friends', one: 'friend', did: 'ate' }, I.apple], [{ whom: 'sisters', one: 'sister', did: 'stuck on' }, I.sticker],
      [{ whom: 'squirrels', one: 'squirrel', did: 'hid' }, I.nut], [{ whom: 'little ones', one: 'little one', did: 'let go of' }, I.balloon], [{ whom: 'guests', one: 'guest', did: 'ate' }, I.cake],
      [{ whom: 'rabbits', one: 'rabbit', did: 'ate' }, I.carrot], [{ whom: 'players', one: 'player', did: 'laid down' }, I.card],
    ],
  },
  timesMore: {
    how: '“{b} times as many” is multiplication: multiply {a} by {b}.',
    skins: [
      ['There are {A} growing in the first garden bed, and {b} times as many in the second. How many {many} are in the second garden bed?', I.bush],
      ['Mark has {A}, and Olivia has {b} times as many. How many {many} does Olivia have?', I.sticker],
      ['There are {A} in the little aquarium, and {b} times as many in the big one. How many {many} are in the big aquarium?', I.fish],
      ['There are {A} in the first class, and {b} times as many in the second. How many {many} are in the second class?', I.pupil],
      ['There are {A} on the bottom shelf, and {b} times as many on the top one. How many {many} are on the top shelf?', I.book],
      ['On Saturday {A} came to the museum, and on Sunday {b} times as many. How many {many} came on Sunday?', I.visitor],
      ['There are {A} in the first basket, and {b} times as many in the second. How many {many} are in the second basket?', I.mushroom],
      ['Dad caught {A}, and Grandpa caught {b} times as many. How many {many} did Grandpa catch?', I.bigFish],
    ],
  },
  timesFewer: {
    how: '“{b} times fewer” is division: divide {a} by {b}.',
    skins: [
      ['There are {A} in the big box, and {b} times fewer in the little one. How many {many} are in the little box?', I.cube],
      ['The big brother has {A}, and the little brother has {b} times fewer. How many {many} does the little brother have?', I.car],
      ['There are {A} on the first tree, and {b} times fewer on the second. How many {many} are on the second tree?', I.apple],
      ['There are {A} on the first shelf, and {b} times fewer on the second. How many {many} are on the second shelf?', I.book],
      ['In the summer Sophie found {A}, and in the fall {b} times fewer. How many {many} did she find in the fall?', I.shell],
      ['There are {A} in the first bouquet, and {b} times fewer in the second. How many {many} are in the second bouquet?', I.flower],
      ['In the morning the baker baked {A}, and in the evening {b} times fewer. How many {many} did he bake in the evening?', I.bun],
      ['There are {A} on the big pond, and {b} times fewer on the little one. How many {many} are on the little pond?', I.duck],
    ],
  },
  moreTotal: {
    how: 'First find out how many there are where there are more: add {b} to {a}. Then add the two numbers together.',
    skins: [
      ['There are {A} on the first shelf, and {b} more on the second. How many {many} are on the two shelves together?', I.book],
      ['There are {A} in the first basket, and {b} more in the second. How many {many} are in the two baskets together?', I.apple],
      ['Tom has {A}, and Lucy has {b} more. How many {many} do they have together?', I.sticker],
      ['There are {A} in the first train car, and {b} more in the second. How many {many} are in the two cars together?', I.passenger],
      ['In the morning {A} were sold, and in the evening {b} more. How many {many} were sold that day?', I.ticket],
      ['There are {A} in the first class, and {b} more in the second. How many {many} are in the two classes together?', I.pupil],
      ['There are {A} in the first flower bed, and {b} more in the second. How many {many} are in the two flower beds together?', I.flower],
      ['On Saturday Daniel ran {A}, and on Sunday {b} more. How many {many} did he run in the two days?', I.lap],
    ],
  },
  timed: {
    how: 'Add how much time went by to the starting hour: {a} and {b} more.',
    skins: [
      'The train left at {a}:00 and was on its way for {B}. At what time did it arrive?',
      'The show began at {a}:00 and lasted {B}. At what time did it end?',
      'The tour began at {a}:00 and lasted {B}. At what time did it end?',
      'The plane took off at {a}:00 and flew for {B}. At what time did it land?',
      'The contest began at {a}:00 and lasted {B}. At what time did it end?',
      'Dad went to work at {a}:00 and worked for {B}. At what time did he finish work?',
      'The hikers set out at {a}:00 and walked for {B}. At what time did they reach the camp?',
      'The ship set sail at {a}:00 and sailed for {B}. At what time did it arrive?',
    ].map((line): Skin => [line, I.hour]),
  },
  speed: {
    line: 'In one hour {mover} {A}. How many kilometers will {it} in {Bu}?',
    how: 'Every hour it is the same — {a} kilometers. Multiply by the number of hours: by {b}.',
    skins: [
      ['a cyclist rides', 'he ride'], ['a hiker walks', 'he walk'], ['a boat sails', 'it sail'], ['a train travels', 'it travel'],
      ['a bus travels', 'it travel'], ['a horseman rides', 'he ride'], ['a skier skis', 'he ski'], ['a ship sails', 'it sail'],
    ].map(([mover, will]): Skin => [{ mover, it: will }, I.km, I.hour]),
  },
  thought: {
    line: '{N} thought of a number, {did}, and got {a}. What number did {N} think of?',
    how: 'Go backwards, from the end to the start: take {a} and {undo}.',
    skins: THOUGHT.map(([did, undo]): Skin => [{ did, undo }]),
  },
  twoBuys: {
    line: '{N} bought {A} for {$b} each and {other} for {$c}. How many {coins} did {he} pay?',
    how: 'First count the things that cost the same: multiply {b} by {a}. Then add {c} more.',
    skins: [
      [{ other: 'a notebook' }, I.pencil], [{ other: 'juice' }, I.bun], [{ other: 'an album' }, I.sticker], [{ other: 'a cake' }, I.balloon], [{ other: 'popcorn' }, I.ticket],
      [{ other: 'an envelope' }, I.postcard], [{ other: 'a pencil case' }, I.notebook], [{ other: 'tea' }, I.cake], [{ other: 'a chocolate bar' }, I.candy],
    ],
  },
  halves: {
    how: 'Half means to divide by two: {a} are left. Then take away {b} more.',
    skins: [
      ['Olivia had {T}. She gave half to a friend, and then gave {b} more to her brother. How many {many} are left?', I.candy],
      ['There were {T} on the shelf. Half were taken to be read, and then {b} more were given to the library. How many {many} are left?', I.book],
      ['There were {T} in the basket. Half were eaten for lunch, and then {b} more for dinner. How many {many} are left?', I.pie],
      ['There were {T} in the pack. Half were stuck in the album, and then {b} more were given away. How many {many} are left?', I.sticker],
      ['There were {T} hanging on the tree. Half were picked in the morning, and then {b} more in the evening. How many {many} are left?', I.apple],
      ['There were {T} in the shop. Half were sold before lunch, and then {b} more after lunch. How many {many} are left?', I.balloon],
      ['There were {T} in the piggy bank. Half were spent on a book, and then {b} more on ice cream. How many {many} are left?', I.coin],
      ['There were {T} growing in the garden bed. Half were picked on Saturday, and then {b} more on Sunday. How many {many} are left?', I.tomato],
      ['There were {T} on the tray. Half were handed out to the guests, and then the children ate {b} more. How many {many} are left?', I.cake],
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
    howManyMore: 'how many more',
    howManyFewer: 'how many fewer',
    change: 'change',
    lack: 'short by',
    half: 'half',
    when: 'at what time',
    price,
    eachPrice: (n, money) => `${price(n, money)} each`,
    by: (n) => `by ${n}`,
    each: (n) => `${n} each`,
    extra: (n) => `${n} more`,
    timesMore: (n) => `${n} times as many`,
    timesFewer: (n) => `${n} times fewer`,
    moreBy: (n) => `${n} more`,
    at: (hour) => `at ${hour}:00`,
    hours: (n) => count(n, I.hour),
    speed: (km) => `${km} km an hour`,
  },
};
