import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import type { GridChoicePayload } from '@/core/game/templates/types';
import type { Gender } from '@/core/lang/uk';
import { hourAt, num, say, spoken, written, type NumCase } from '@/core/lang/numbers';
import { currencyOf, type CurrencyDef } from '@/core/game/content/currency';
import { pick, randInt, uid } from '@/core/utils/random';
import { rewardForStep } from '../difficulty';
import { buildNumberOptions } from './options';

/**
 * «Задачі» — story problems. A problem is a FRAME (what happens with the
 * numbers: two heaps are joined, something is shared equally, a thing is
 * bought and change is given…) told in one of its SKINS (who, where, what:
 * birds on a branch, cars in a car park, stamps in an album). A frame with a
 * skin is one KIND of problem; the path opens five new kinds on every step —
 * 250 over its fifty steps — and the numbers of a kind change on every draw.
 *
 * Every number is written through `C` / `N` (`core/lang/numbers`): the screen
 * shows the digit, the voice says the word in the right gender and case —
 * «дві машинки», «між трьома друзями», never «два машинки».
 */

/** A thing that is counted: «1 кулька», «3 кульки», «5 кульок». */
interface Item {
  one: string;
  few: string;
  many: string;
  g: Gender;
  emoji: string;
}
const it = (one: string, few: string, many: string, g: Gender, emoji: string): Item => ({ one, few, many, g, emoji });

const I = {
  apple: it('яблуко', 'яблука', 'яблук', 'n', '🍎'),
  pear: it('груша', 'груші', 'груш', 'f', '🍐'),
  candy: it('цукерка', 'цукерки', 'цукерок', 'f', '🍬'),
  pencil: it('олівець', 'олівці', 'олівців', 'm', '✏️'),
  marker: it('фломастер', 'фломастери', 'фломастерів', 'm', '🖍️'),
  book: it('книжка', 'книжки', 'книжок', 'f', '📚'),
  ball: it('м’яч', 'м’ячі', 'м’ячів', 'm', '⚽'),
  balloon: it('кулька', 'кульки', 'кульок', 'f', '🎈'),
  sticker: it('наліпка', 'наліпки', 'наліпок', 'f', '⭐'),
  nut: it('горіх', 'горіхи', 'горіхів', 'm', '🌰'),
  car: it('машинка', 'машинки', 'машинок', 'f', '🚗'),
  auto: it('машина', 'машини', 'машин', 'f', '🚙'),
  cube: it('кубик', 'кубики', 'кубиків', 'm', '🧱'),
  shell: it('мушля', 'мушлі', 'мушель', 'f', '🐚'),
  bird: it('пташка', 'пташки', 'пташок', 'f', '🐦'),
  duck: it('качка', 'качки', 'качок', 'f', '🦆'),
  rabbit: it('кролик', 'кролики', 'кроликів', 'm', '🐇'),
  butterfly: it('метелик', 'метелики', 'метеликів', 'm', '🦋'),
  kitten: it('кошеня', 'кошенята', 'кошенят', 'n', '🐱'),
  bee: it('бджола', 'бджоли', 'бджіл', 'f', '🐝'),
  star: it('зірка', 'зірки', 'зірок', 'f', '🌟'),
  cake: it('тістечко', 'тістечка', 'тістечок', 'n', '🧁'),
  page: it('сторінка', 'сторінки', 'сторінок', 'f', '📖'),
  fish: it('рибка', 'рибки', 'рибок', 'f', '🐟'),
  bigFish: it('рибина', 'рибини', 'рибин', 'f', '🐟'),
  flower: it('квітка', 'квітки', 'квіток', 'f', '🌷'),
  coin: it('монета', 'монети', 'монет', 'f', '🪙'),
  stamp: it('марка', 'марки', 'марок', 'f', '📮'),
  tomato: it('помідор', 'помідори', 'помідорів', 'm', '🍅'),
  cucumber: it('огірок', 'огірки', 'огірків', 'm', '🥒'),
  carrot: it('морквина', 'морквини', 'морквин', 'f', '🥕'),
  egg: it('яйце', 'яйця', 'яєць', 'n', '🥚'),
  mushroom: it('гриб', 'гриби', 'грибів', 'm', '🍄'),
  tree: it('дерево', 'дерева', 'дерев', 'n', '🌳'),
  appleTree: it('яблуня', 'яблуні', 'яблунь', 'f', '🌳'),
  bush: it('кущ', 'кущі', 'кущів', 'm', '🌿'),
  cup: it('чашка', 'чашки', 'чашок', 'f', '☕'),
  plate: it('тарілка', 'тарілки', 'тарілок', 'f', '🍽️'),
  notebook: it('зошит', 'зошити', 'зошитів', 'm', '📓'),
  bun: it('булочка', 'булочки', 'булочок', 'f', '🥐'),
  pie: it('пиріжок', 'пиріжки', 'пиріжків', 'm', '🥟'),
  ticket: it('квиток', 'квитки', 'квитків', 'm', '🎟️'),
  postcard: it('листівка', 'листівки', 'листівок', 'f', '💌'),
  chair: it('стілець', 'стільці', 'стільців', 'm', '🪑'),
  desk: it('парта', 'парти', 'парт', 'f', '🪑'),
  doll: it('лялька', 'ляльки', 'ляльок', 'f', '🪆'),
  robot: it('робот', 'роботи', 'роботів', 'm', '🤖'),
  puzzle: it('пазл', 'пазли', 'пазлів', 'm', '🧩'),
  bike: it('велосипед', 'велосипеди', 'велосипедів', 'm', '🚲'),
  card: it('картка', 'картки', 'карток', 'f', '🃏'),
  photo: it('світлина', 'світлини', 'світлин', 'f', '🖼️'),
  goal: it('гол', 'голи', 'голів', 'm', '🥅'),
  lap: it('коло', 'кола', 'кіл', 'n', '🏃'),
  passenger: it('пасажир', 'пасажири', 'пасажирів', 'm', '🧍'),
  pupil: it('учень', 'учні', 'учнів', 'm', '🧒'),
  visitor: it('відвідувач', 'відвідувачі', 'відвідувачів', 'm', '🧑'),
  athlete: it('спортсмен', 'спортсмени', 'спортсменів', 'm', '🏃'),
  boy: it('хлопчик', 'хлопчики', 'хлопчиків', 'm', '👦'),
  girl: it('дівчинка', 'дівчинки', 'дівчаток', 'f', '👧'),
  cow: it('корова', 'корови', 'корів', 'f', '🐄'),
  horse: it('кінь', 'коні', 'коней', 'm', '🐴'),
  monkey: it('мавпа', 'мавпи', 'мавп', 'f', '🐒'),
  parrot: it('папуга', 'папуги', 'папуг', 'm', '🦜'),
  row: it('ряд', 'ряди', 'рядів', 'm', '➖'),
  line: it('шеренга', 'шеренги', 'шеренг', 'f', '➖'),
  time: it('раз', 'рази', 'разів', 'm', '✖️'),
  km: it('кілометр', 'кілометри', 'кілометрів', 'm', '📏'),
  hour: it('година', 'години', 'годин', 'f', '⏱️'),
};

/** «яблуко», «яблука», «яблук» — the form a count asks for. */
function form(n: number, item: Item): string {
  const ones = n % 10;
  const tens = n % 100;
  if (ones === 1 && tens !== 11) return item.one;
  return ones >= 2 && ones <= 4 && !(tens >= 12 && tens <= 14) ? item.few : item.many;
}
/**
 * Set when a story has counted «21 цукерка»: a count ending in one makes the
 * noun singular and the sentence around it wrong («21 цукерка поділили»,
 * «має 41 гривня»). Such a draw is thrown away and made again.
 */
let awkward = false;
/** A count with its thing: shown «3 кульки», said «три кульки». */
const C = (n: number, item: Item): string => {
  if (n % 10 === 1 && n % 100 !== 11) awkward = true;
  return `${num(n, item.g)} ${form(n, item)}`;
};
/** A number that stands for things named earlier: shown «ще 2», said «ще дві». */
const N = (n: number, of: Item | Gender = 'm', c: NumCase = 'nom'): string => num(n, typeof of === 'string' ? of : of.g, c);
/**
 * The money of the stories: the parent's currency (`TaskConfig.currency`),
 * set for the draw being made. Hryvnias unless they chose otherwise.
 */
let money$: CurrencyDef = currencyOf(undefined);
/** That money as a thing to count: «1 гривня», «3 долари», «5 злотих». */
const coin = (): Item => it(money$.counted[0], money$.counted[1], money$.counted[2], money$.gender, '💵');

/** A child in the story. Names are only ever used as the subject. */
interface Hero {
  name: string;
  he: string;
  him: string;
  /** «у нього» / «у неї». */
  has: string;
  /** Picks the verb form: `v('купив', 'купила')`. */
  v: (m: string, f: string) => string;
}
const BOYS = ['Василь', 'Андрій', 'Тарас', 'Максим', 'Остап', 'Назар', 'Данило', 'Марко'];
const GIRLS = ['Оля', 'Софія', 'Марійка', 'Злата', 'Соломія', 'Даринка', 'Ганнуся', 'Леся'];
function hero(): Hero {
  const boy = Math.random() < 0.5;
  return { name: pick(boy ? BOYS : GIRLS), he: boy ? 'він' : 'вона', him: boy ? 'йому' : 'їй', has: boy ? 'у нього' : 'у неї', v: (m, f) => (boy ? m : f) };
}

type Chip = { emoji: string; label?: string };
/** A row of pictures for small amounts, «🍎×12» for big ones. */
const many = (emoji: string, n: number): string => (n <= 6 ? emoji.repeat(n) : `${emoji}×${n}`);
const chip = (emoji: string, label?: string | number): Chip => ({ emoji, label: label === undefined ? undefined : String(label) });
const ASK: Chip = { emoji: '❓' };
const money = (n: number): Chip => chip('💵', `${n} ${money$.short}`);

interface Problem {
  /** The story and the question, numbers written through `C` / `N`. */
  text: string;
  /** What is known and what is asked, as pictures. */
  scene: Chip[];
  answer: number;
  /** What to do, said after mistakes. */
  how: string;
  /** The numbers that make this variant unique. */
  nums: number[];
}

/** `r` is how far along its band of steps a kind stands, 0…1: numbers grow with it. */
type Make = (r: number) => Problem;
/** A whole number between `lo` and `hi`, both of which grow from their easy value to their hard one. */
const span = (r: number, lo: [number, number], hi: [number, number]) => randInt(Math.round(lo[0] + (lo[1] - lo[0]) * r), Math.round(hi[0] + (hi[1] - hi[0]) * r));
const cap = (text: string) => text.charAt(0).toLocaleUpperCase('uk') + text.slice(1);

// ====================================================================== Band 1
// Steps 1–8: adding and taking away within ten.

const JOIN: [string, string, Item][] = [
  ['На столі', 'в кошику', I.car], ['На полиці', 'в шухляді', I.book], ['У вазі', 'на тарілці', I.candy], ['На гілці', 'на даху', I.bird],
  ['В акваріумі', 'в банці', I.fish], ['На клумбі', 'у вазоні', I.flower], ['У пеналі', 'на парті', I.pencil], ['У гаражі', 'на подвір’ї', I.bike],
];
const join = ([here, there, t]: (typeof JOIN)[number]): Make => (r) => {
  const a = span(r, [2, 3], [4, 5]); const b = span(r, [2, 3], [4, 5]);
  return { text: `${here} ${C(a, t)}, а ${there} — ще ${N(b, t)}. Скільки всього ${t.many}?`,
    scene: [chip(many(t.emoji, a), here.toLowerCase()), chip(many(t.emoji, b), there), ASK], answer: a + b,
    how: 'Слово «всього» підказує: треба скласти разом обидві купки. Додай.', nums: [a, b] };
};

const GOT_MORE: [string, Item][] = [
  ['Мама дала', I.sticker], ['Тато купив', I.balloon], ['Бабуся подарувала', I.cube], ['Дідусь приніс', I.nut],
  ['Друг подарував', I.stamp], ['Сестра віддала', I.doll], ['Брат приніс', I.robot], ['Тітка надіслала', I.puzzle],
];
const gotMore = ([gave, t]: (typeof GOT_MORE)[number]): Make => (r) => {
  const h = hero(); const a = span(r, [2, 3], [4, 6]); const b = span(r, [2, 2], [3, 4]);
  return { text: `${h.name} ${h.v('мав', 'мала')} ${C(a, t)}. ${gave} ${h.him} ще ${N(b, t)}. Скільки ${t.many} тепер ${h.has}?`,
    scene: [chip(many(t.emoji, a), a), chip('➕'), chip(many(t.emoji, b), b), ASK], answer: a + b,
    how: `Було ${N(a, t)}, стало більше ще на ${N(b, t)}. Коли дають ще — додаємо.`, nums: [a, b] };
};

const CAME_IN: [string, string, string, Item][] = [
  ['На гілці сиділо', 'Прилетіло', 'на гілці', I.bird], ['На ставку плавало', 'Припливло', 'на ставку', I.duck],
  ['На галявині гралося', 'Прибігло', 'на галявині', I.rabbit], ['На квітці сиділо', 'Прилетіло', 'на квітці', I.butterfly],
  ['У дворі гралося', 'Прибігло', 'у дворі', I.kitten], ['Біля вулика літало', 'Прилетіло', 'біля вулика', I.bee],
  ['На стоянці стояло', 'Приїхало', 'на стоянці', I.auto], ['У небі сяяло', 'Засяяло', 'у небі', I.star],
];
const cameIn = ([was, came, where, t]: (typeof CAME_IN)[number]): Make => (r) => {
  const a = span(r, [2, 3], [4, 6]); const b = span(r, [2, 2], [3, 4]);
  return { text: `${was} ${C(a, t)}. ${came} ще ${N(b, t)}. Скільки ${t.many} стало ${where}?`,
    scene: [chip(many(t.emoji, a), a), chip('➕'), chip(many(t.emoji, b), b), ASK], answer: a + b,
    how: `${cap(t.many)} стало більше. Додай тих, що були, і тих, що з’явилися.`, nums: [a, b] };
};

const GAVE: [string, string, string, Item][] = [
  ['віддав', 'віддала', 'другові', I.candy], ['подарував', 'подарувала', 'сестрі', I.sticker], ['з’їв', 'з’їла', '', I.apple],
  ['загубив', 'загубила', '', I.cube], ['роздав', 'роздала', 'друзям', I.balloon], ['поклав', 'поклала', 'у шухляду', I.pencil],
  ['посадив', 'посадила', 'на клумбі', I.flower], ['віддав', 'віддала', 'братові', I.car],
];
const gave = ([m, f, whom, t]: (typeof GAVE)[number]): Make => (r) => {
  const h = hero(); const a = span(r, [4, 7], [6, 10]); const b = randInt(2, a - 2);
  return { text: `${h.name} ${h.v('мав', 'мала')} ${C(a, t)}. ${N(b, t)} з них ${h.he} ${h.v(m, f)}${whom ? ` ${whom}` : ''}. Скільки ${t.many} лишилось?`,
    scene: [chip(many(t.emoji, a), a), chip('➖', b), ASK], answer: a - b,
    how: `Було ${N(a, t)}, стало менше на ${N(b, t)}. Коли стає менше — віднімаємо.`, nums: [a, b] };
};

const WENT_AWAY: [string, string, string, Item][] = [
  ['На гілці сиділо', 'полетіли', 'на гілці', I.bird], ['На тарілці було', 'з’їли', 'на тарілці', I.cake],
  ['У кошику було', 'забрали', 'у кошику', I.mushroom], ['На ставку плавало', 'відпливли', 'на ставку', I.duck],
  ['На стоянці стояло', 'поїхали', 'на стоянці', I.auto], ['На полиці стояло', 'забрали читати', 'на полиці', I.book],
  ['У небі літало', 'луснули', 'у небі', I.balloon], ['На столі стояло', 'забрали мити', 'на столі', I.cup],
];
const wentAway = ([was, gone, where, t]: (typeof WENT_AWAY)[number]): Make => (r) => {
  const a = span(r, [4, 7], [6, 10]); const b = randInt(2, a - 2);
  return { text: `${was} ${C(a, t)}. ${N(b, t)} з них ${gone}. Скільки ${t.many} лишилось ${where}?`,
    scene: [chip(many(t.emoji, a), a), chip('➖', b), ASK], answer: a - b,
    how: `${cap(t.many)} стало менше. Від усіх відніми тих, яких уже немає.`, nums: [a, b] };
};

// ====================================================================== Band 2
// Steps 9–16: within twenty; "how many more", "how many were added".

const TWO_KINDS: [string, Item, Item, string][] = [
  ['У класі', I.boy, I.girl, 'Скільки дітей у класі?'], ['У саду росте', I.appleTree, I.pear, 'Скільки всього дерев у саду?'],
  ['На фермі живе', I.cow, I.horse, 'Скільки всього тварин на фермі?'], ['У вазі лежить', I.apple, I.pear, 'Скільки всього фруктів у вазі?'],
  ['На грядці достигло', I.tomato, I.cucumber, 'Скільки всього овочів достигло?'], ['У коробці лежить', I.cube, I.ball, 'Скільки всього іграшок у коробці?'],
  ['У вольєрі живе', I.monkey, I.parrot, 'Скільки всього тварин у вольєрі?'], ['На столі стоїть', I.cup, I.plate, 'Скільки всього посуду на столі?'],
];
const twoKinds = ([pre, x, y, ask]: (typeof TWO_KINDS)[number]): Make => (r) => {
  const a = span(r, [5, 7], [8, 11]); const b = span(r, [3, 5], [7, 9]);
  return { text: `${pre} ${C(a, x)} і ${C(b, y)}. ${ask}`,
    scene: [chip(x.emoji, a), chip('➕'), chip(y.emoji, b), ASK], answer: a + b,
    how: 'Тут питають про всіх разом. Додай обидва числа.', nums: [a, b] };
};

const LEFT_20: [string, Item, string, string][] = [
  ['В автобусі їхало', I.passenger, 'На зупинці вийшло', 'Скільки пасажирів лишилось в автобусі?'],
  ['У книжці', I.page, 'Уже прочитано', 'Скільки сторінок ще лишилося прочитати?'],
  ['У наборі було', I.sticker, 'Уже наклеїли', 'Скільки наліпок ще лишилось у наборі?'],
  ['На дереві висіло', I.apple, 'Вітер струсив', 'Скільки яблук лишилось на дереві?'],
  ['У пакеті було', I.candy, 'Діти з’їли', 'Скільки цукерок лишилось у пакеті?'],
  ['У гаражі стояло', I.auto, 'Уранці виїхало', 'Скільки машин лишилось у гаражі?'],
  ['У кошику лежало', I.egg, 'На сніданок узяли', 'Скільки яєць лишилось у кошику?'],
  ['На лузі паслося', I.cow, 'До хліва пішло', 'Скільки корів лишилось на лузі?'],
];
const left20 = ([was, t, event, ask]: (typeof LEFT_20)[number]): Make => (r) => {
  const a = span(r, [11, 14], [15, 20]); const b = span(r, [3, 4], [6, 9]);
  return { text: `${was} ${C(a, t)}. ${event} ${N(b, t)}. ${ask}`,
    scene: [chip(t.emoji, a), chip('➖', b), ASK], answer: a - b,
    how: `Від усіх відніми ${N(b, t)} — стільки вже немає.`, nums: [a, b] };
};

const MORE_PAIRS: [string, string, Item][] = [
  ['В Олі', 'в Тараса', I.sticker], ['У Марка', 'в Софії', I.car], ['У першому кошику', 'в другому', I.mushroom], ['На верхній полиці', 'на нижній', I.book],
  ['У червоній коробці', 'в синій', I.cube], ['У бабусі', 'в дідуся', I.pie], ['У першому акваріумі', 'в другому', I.fish], ['На лівій клумбі', 'на правій', I.flower],
];
const howManyMore = ([x, y, t]: (typeof MORE_PAIRS)[number]): Make => (r) => {
  const a = span(r, [8, 11], [12, 18]); const b = randInt(3, a - 2);
  return { text: `${x} ${C(a, t)}, а ${y} — ${N(b, t)}. На скільки ${t.many} більше ${x.charAt(0).toLocaleLowerCase('uk')}${x.slice(1)}?`,
    scene: [chip(t.emoji, a), chip(t.emoji, b), chip('❓', 'на скільки більше')], answer: a - b,
    how: 'Щоб дізнатися, на скільки одне число більше за інше, від більшого відніми менше.', nums: [a, b] };
};

const FEWER_PAIRS: [string, string, Item][] = [
  ['У Данила', 'в Злати', I.nut], ['У Лесі', 'в Назара', I.balloon], ['У великій вазі', 'в маленькій', I.candy], ['На першому дереві', 'на другому', I.bird],
  ['У зеленому пеналі', 'в жовтому', I.pencil], ['У мами', 'в тата', I.mushroom], ['На першій тарілці', 'на другій', I.cake], ['У старшого брата', 'в молодшого', I.stamp],
];
const howManyFewer = ([x, y, t]: (typeof FEWER_PAIRS)[number]): Make => (r) => {
  const a = span(r, [8, 11], [12, 18]); const b = randInt(3, a - 2);
  return { text: `${x} ${C(a, t)}, а ${y} — ${N(b, t)}. На скільки ${t.many} менше ${y}?`,
    scene: [chip(t.emoji, a), chip(t.emoji, b), chip('❓', 'на скільки менше')], answer: a - b,
    how: 'Щоб дізнатися, на скільки одне число менше за інше, від більшого відніми менше.', nums: [a, b] };
};

const MISSING: [string, Item, string, string][] = [
  ['У вазі було', I.candy, 'Мама доклала ще кілька', 'доклала мама'], ['На полиці стояло', I.book, 'Тато поставив ще кілька', 'поставив тато'],
  ['У кошику лежало', I.mushroom, 'Дідусь знайшов ще кілька', 'знайшов дідусь'], ['На гілці сиділо', I.bird, 'Прилетіло ще кілька', 'прилетіло'],
  ['У пеналі було', I.pencil, 'Оля поклала ще кілька', 'поклала Оля'], ['На стоянці стояло', I.auto, 'Приїхало ще кілька', 'приїхало'],
  ['У скарбничці було', I.coin, 'Марко вкинув ще кілька', 'вкинув Марко'], ['В альбомі було', I.stamp, 'Сестра вклеїла ще кілька', 'вклеїла сестра'],
];
const missing = ([was, t, event, ask]: (typeof MISSING)[number]): Make => (r) => {
  const a = span(r, [4, 7], [8, 12]); const b = span(r, [2, 3], [5, 8]);
  return { text: `${was} ${C(a, t)}. ${event}, і стало ${N(a + b, t)}. Скільки ${t.many} ${ask}?`,
    scene: [chip(t.emoji, a), chip('➕', '?'), chip('🟰', a + b)], answer: b,
    how: `Від того, що стало, відніми те, що було: від ${N(a + b, t, 'gen')} відніми ${N(a, t)}.`, nums: [a, b] };
};

// ====================================================================== Band 3
// Steps 17–24: money and numbers up to a hundred.

const PRICE_PAIRS: [string, string, string, string, string][] = [
  ['Сік', 'булочка', 'сік і булочка', '🧃', '🥐'], ['Зошит', 'ручка', 'зошит і ручка', '📓', '🖊️'], ['Морозиво', 'вода', 'морозиво і вода', '🍦', '💧'],
  ['Квиток у кіно', 'попкорн', 'квиток і попкорн', '🎟️', '🍿'], ['Лялька', 'м’яч', 'лялька і м’яч', '🪆', '⚽'], ['Хліб', 'молоко', 'хліб і молоко', '🍞', '🥛'],
  ['Олівець', 'гумка', 'олівець і гумка', '✏️', '🧽'], ['Яблуко', 'банан', 'яблуко і банан', '🍎', '🍌'],
];
const totalPrice = ([x, y, both, ex, ey]: (typeof PRICE_PAIRS)[number]): Make => (r) => {
  const p = span(r, [5, 12], [15, 40]); const q = span(r, [4, 8], [12, 30]);
  return { text: `${x} коштує ${C(p, coin())}, а ${y} — ${N(q, coin())}. Скільки ${coin().many} коштують ${both} разом?`,
    scene: [chip(ex, `${p} ${money$.short}`), chip('➕'), chip(ey, `${q} ${money$.short}`), ASK], answer: p + q,
    how: 'Щоб дізнатися, скільки коштує все разом, додай ціни.', nums: [p, q] };
};

const BOUGHT: [string, string][] = [['книжку', '📕'], ['іграшку', '🧸'], ['м’яч', '⚽'], ['альбом', '📒'], ['морозиво', '🍦'], ['квіти', '💐'], ['листівку', '💌'], ['фарби', '🎨']];
const change = ([thing, emoji]: (typeof BOUGHT)[number]): Make => (r) => {
  const h = hero(); const pay = pick(r < 0.5 ? [20, 50] : [50, 100]); const p = randInt(Math.round(pay * 0.3), pay - 3);
  return { text: `${h.name} купує ${thing} за ${C(p, coin())} і дає продавчині ${C(pay, coin())}. Скільки ${coin().many} здачі ${h.he} отримає?`,
    scene: [chip(emoji, `${p} ${money$.short}`), money(pay), chip('❓', 'здача')], answer: pay - p,
    how: `Здача — це гроші, які лишилися. Від ${N(pay, coin(), 'gen')} відніми ціну покупки.`, nums: [p, pay] };
};

const WANTED: [string, string][] = [['Морозиво', '🍦'], ['Конструктор', '🧱'], ['Книжка', '📕'], ['Самокат', '🛴'], ['Лялька', '🪆'], ['Квиток', '🎟️'], ['М’яч', '⚽'], ['Пазл', '🧩']];
const notEnough = ([thing, emoji]: (typeof WANTED)[number]): Make => (r) => {
  const h = hero(); const m = span(r, [5, 20], [15, 50]); const p = m + span(r, [2, 5], [9, 30]);
  return { text: `${h.name} має ${C(m, coin())}. ${thing} коштує ${N(p, coin())}. Скільки ${coin().many} ${h.him} не вистачає?`,
    scene: [money(m), chip(emoji, `${p} ${money$.short}`), chip('❓', 'не вистачає')], answer: p - m,
    how: 'Від ціни відніми гроші, які вже є.', nums: [m, p] };
};

const REPRICED: [string, Gender, boolean, string][] = [
  ['Іграшка', 'f', false, '🧸'], ['Квиток', 'm', true, '🎟️'], ['Книжка', 'f', false, '📕'], ['Сік', 'm', true, '🧃'],
  ['Торт', 'm', false, '🎂'], ['Лялька', 'f', true, '🪆'], ['М’яч', 'm', false, '⚽'], ['Морозиво', 'n', true, '🍦'],
];
const repriced = ([thing, g, up, emoji]: (typeof REPRICED)[number]): Make => (r) => {
  const a = span(r, [12, 30], [25, 80]); const b = span(r, [2, 5], [8, 19]);
  const end = g === 'f' ? 'ла' : g === 'n' ? 'ло' : '';
  const verb = up ? (g === 'm' ? 'подорожчав' : `подорожча${end}`) : g === 'm' ? 'подешевшав' : `подешевша${end}`;
  const was = g === 'm' ? 'коштував' : `коштува${end}`;
  return { text: `${thing} ${was} ${C(a, coin())}, а потім ${verb} на ${N(b, coin())}. Скільки ${coin().many} ${g === 'f' ? 'вона' : g === 'n' ? 'воно' : 'він'} коштує тепер?`,
    scene: [chip(emoji, `${a} ${money$.short}`), chip(up ? '⬆️' : '⬇️', `на ${b}`), ASK], answer: up ? a + b : a - b,
    how: up ? '«Подорожчати» — означає, що ціна стала більшою. Додай.' : '«Подешевшати» — означає, що ціна стала меншою. Відніми.', nums: [a, b] };
};

const THREE: [string, string, string, Item, string][] = [
  ['У першому кошику', 'в другому', 'в третьому', I.apple, 'у трьох кошиках разом'], ['У понеділок Оля прочитала', 'у вівторок', 'в середу', I.page, 'вона прочитала за три дні'],
  ['На першій полиці', 'на другій', 'на третій', I.book, 'на трьох полицях разом'], ['Уранці продали', 'вдень', 'увечері', I.bun, 'продали за день'],
  ['Перший клас посадив', 'другий', 'третій', I.tree, 'посадили три класи разом'], ['У першому вагоні їде', 'в другому', 'в третьому', I.passenger, 'їде в трьох вагонах'],
  ['Марко забив', 'Данило', 'Остап', I.goal, 'забили хлопці разом'], ['У червоній коробці', 'в синій', 'в зеленій', I.cube, 'у трьох коробках разом'],
];
const threeAdd = ([x, y, z, t, ask]: (typeof THREE)[number]): Make => (r) => {
  const a = span(r, [5, 12], [12, 30]); const b = span(r, [5, 12], [12, 30]); const c = span(r, [5, 12], [12, 30]);
  return { text: `${x} ${C(a, t)}, ${y} — ${N(b, t)}, а ${z} — ${N(c, t)}. Скільки ${t.many} ${ask}?`,
    scene: [chip(t.emoji, a), chip(t.emoji, b), chip(t.emoji, c), ASK], answer: a + b + c,
    how: `Додай усі три числа по черзі: спочатку ${N(a, t)} і ${N(b, t)}, потім — ще ${N(c, t)}.`, nums: [a, b, c] };
};

// ====================================================================== Band 4
// Steps 25–32: equal groups — multiplying and dividing.

const GROUPS: [string, string, string, Gender, Item, string][] = [
  ['У кожній коробці', 'у', 'коробках', 'f', I.pencil, '📦'], ['У кожному кошику', 'у', 'кошиках', 'm', I.apple, '🧺'], ['На кожній тарілці', 'на', 'тарілках', 'f', I.cake, '🍽️'],
  ['У кожному пакеті', 'у', 'пакетах', 'm', I.candy, '🛍️'], ['У кожній вазі', 'у', 'вазах', 'f', I.flower, '🏺'], ['На кожній полиці', 'на', 'полицях', 'f', I.book, '📚'],
  ['У кожному гнізді', 'у', 'гніздах', 'n', I.egg, '🪺'], ['У кожному вагоні', 'у', 'вагонах', 'm', I.passenger, '🚃'],
];
const groups = ([each, prep, boxes, g, t, emoji]: (typeof GROUPS)[number]): Make => (r) => {
  const k = span(r, [2, 4], [5, 9]); const m = span(r, [2, 3], [4, 6]);
  return { text: `${each} — по ${C(k, t)}. Скільки ${t.many} ${prep} ${N(m, g, 'gen')} ${boxes}?`,
    scene: [...Array.from({ length: Math.min(m, 4) }, () => chip(emoji, k)), ...(m > 4 ? [chip('…')] : []), ASK], answer: k * m,
    how: `Це однакові купки — по ${N(k, t)}. Однакові купки множимо: ${N(k, t)} помнож на ${N(m)}.`, nums: [k, m] };
};

const PRICED: [string, Item][] = [
  ['Один зошит', I.notebook], ['Одна булочка', I.bun], ['Один квиток', I.ticket], ['Одна наліпка', I.sticker],
  ['Один олівець', I.pencil], ['Одне тістечко', I.cake], ['Одна листівка', I.postcard], ['Одна кулька', I.balloon],
];
const priceTimes = ([one, t]: (typeof PRICED)[number]): Make => (r) => {
  const p = span(r, [3, 5], [8, 12]); const m = span(r, [2, 3], [5, 7]);
  return { text: `${one} коштує ${C(p, coin())}. Скільки ${coin().many} коштують ${C(m, t)}?`,
    scene: [chip(t.emoji, `${p} ${money$.short}`), chip('✖️', m), ASK], answer: p * m,
    how: `Кожна така річ коштує однаково. Ціну помнож на кількість: ${N(p, coin())} помнож на ${N(m)}.`, nums: [p, m] };
};

const ROWS: [string, Item, Item, string][] = [
  ['У класі', I.row, I.desk, 'кожному'], ['На грядці', I.row, I.carrot, 'кожному'], ['У залі', I.row, I.chair, 'кожному'], ['У коробці', I.row, I.candy, 'кожному'],
  ['На параді йде', I.line, I.athlete, 'кожній'], ['У саду', I.row, I.tree, 'кожному'], ['На аркуші', I.row, I.sticker, 'кожному'], ['На стоянці', I.row, I.auto, 'кожному'],
];
const rows = ([where, row, t, each]: (typeof ROWS)[number]): Make => (r) => {
  const m = span(r, [2, 3], [5, 7]); const k = span(r, [3, 4], [6, 9]);
  return { text: `${where} ${C(m, row)}, по ${C(k, t)} у ${each}. Скільки всього ${t.many}?`,
    scene: [chip(t.emoji, `${m} × ${k}`), ASK], answer: m * k,
    how: `У кожному ряду однаково — по ${N(k, t)}. Помнож на кількість рядів.`, nums: [m, k] };
};

const SHARED: [Item, string, string][] = [
  [I.candy, 'друзями', 'отримав кожен друг'], [I.apple, 'дітьми', 'отримала кожна дитина'], [I.nut, 'білками', 'отримала кожна білка'], [I.sticker, 'сестрами', 'отримала кожна сестра'],
  [I.cake, 'гостями', 'отримав кожен гість'], [I.carrot, 'кроликами', 'отримав кожен кролик'], [I.balloon, 'малюками', 'отримав кожен малюк'], [I.fish, 'котами', 'отримав кожен кіт'],
];
const share = ([t, whom, got]: (typeof SHARED)[number]): Make => (r) => {
  const m = span(r, [2, 3], [4, 6]); const q = span(r, [2, 3], [5, 9]); const total = m * q;
  return { text: `${C(total, t)} порівну поділили між ${N(m, 'm', 'ins')} ${whom}. Скільки ${t.many} ${got}?`,
    scene: [chip(t.emoji, total), chip('➗', m), ASK], answer: q,
    how: `«Порівну» — означає ділити. ${cap(N(total, t))} поділи на ${N(m)}.`, nums: [total, m] };
};

const PACKED: [Item, string, string][] = [
  [I.pencil, 'у кожну коробку', 'Скільки знадобилося коробок?'], [I.egg, 'у кожен лоток', 'Скільки знадобилося лотків?'], [I.apple, 'у кожен пакет', 'Скільки знадобилося пакетів?'],
  [I.book, 'на кожну полицю', 'Скільки знадобилося полиць?'], [I.flower, 'у кожен букет', 'Скільки вийшло букетів?'], [I.candy, 'у кожен подарунок', 'Скільки вийшло подарунків?'],
  [I.photo, 'на кожну сторінку альбому', 'Скільки сторінок зайнято?'], [I.bun, 'на кожну тарілку', 'Скільки знадобилося тарілок?'],
];
const pack = ([t, into, ask]: (typeof PACKED)[number]): Make => (r) => {
  const k = span(r, [2, 3], [5, 8]); const q = span(r, [2, 3], [5, 9]); const total = k * q;
  return { text: `${C(total, t)} розклали по ${N(k, t)} ${into}. ${ask}`,
    scene: [chip(t.emoji, total), chip('📦', `по ${k}`), ASK], answer: q,
    how: `Розкласти порівну — це поділити. ${cap(N(total, t))} поділи на ${N(k)}.`, nums: [total, k] };
};

// ====================================================================== Band 5
// Steps 33–40: two steps, one of them × or ÷.

const BOXES_AND_LOOSE: [string, Gender, Item, string, string][] = [
  ['коробках', 'f', I.pencil, 'лежать окремо', '📦'], ['кошиках', 'm', I.apple, 'лежать на столі', '🧺'], ['пакетах', 'm', I.candy, 'лежать у вазі', '🛍️'],
  ['альбомах', 'm', I.stamp, 'поки не вклеєно', '📒'], ['вазах', 'f', I.flower, 'стоять окремо', '🏺'], ['ящиках', 'm', I.tomato, 'лежать поруч', '📦'],
  ['акваріумах', 'm', I.fish, 'плавають у банці', '🫙'], ['пеналах', 'm', I.marker, 'лежать на парті', '👝'],
];
const timesPlus = ([boxes, g, t, loose, emoji]: (typeof BOXES_AND_LOOSE)[number]): Make => (r) => {
  const m = span(r, [2, 3], [4, 6]); const k = span(r, [3, 5], [6, 9]); const c = span(r, [2, 3], [6, 9]);
  return { text: `У ${N(m, g, 'gen')} ${boxes} — по ${C(k, t)}, і ще ${N(c, t)} ${loose}. Скільки всього ${t.many}?`,
    scene: [chip(emoji, `${m} × ${k}`), chip(t.emoji, `ще ${c}`), ASK], answer: m * k + c,
    how: `Спочатку порахуй ті, що лежать порівну: ${N(k, t)} помнож на ${N(m)}. Потім додай ще ${N(c, t)}.`, nums: [m, k, c] };
};

const BOUGHT_MANY: Item[] = [I.bun, I.notebook, I.sticker, I.pencil, I.balloon, I.ticket, I.postcard, I.cake];
const timesChange = (t: Item): Make => (r) => {
  const h = hero(); const m = span(r, [2, 3], [4, 6]); const p = span(r, [3, 5], [7, 12]); const pay = [20, 50, 100].find((note) => note > m * p) ?? 100;
  return { text: `${h.name} ${h.v('купив', 'купила')} ${C(m, t)} по ${C(p, coin())} і ${h.v('дав', 'дала')} продавчині ${C(pay, coin())}. Скільки ${coin().many} здачі ${h.he} отримає?`,
    scene: [chip(many(t.emoji, m), `по ${p} ${money$.short}`), money(pay), chip('❓', 'здача')], answer: pay - m * p,
    how: `Спочатку дізнайся, скільки коштує покупка: ${N(p, coin())} помнож на ${N(m)}. Потім відніми це від ${N(pay, coin(), 'gen')}.`, nums: [m, p, pay] };
};

const SHARED_THEN: [Item, string, string, string, string][] = [
  [I.candy, 'дітьми', 'Кожна дитина', 'з’їла', 'кожної дитини'], [I.apple, 'друзями', 'Кожен друг', 'з’їв', 'кожного друга'],
  [I.sticker, 'сестрами', 'Кожна сестра', 'наклеїла', 'кожної сестри'], [I.nut, 'білками', 'Кожна білка', 'сховала', 'кожної білки'],
  [I.balloon, 'малюками', 'Кожен малюк', 'відпустив у небо', 'кожного малюка'], [I.cake, 'гостями', 'Кожен гість', 'з’їв', 'кожного гостя'],
  [I.carrot, 'кроликами', 'Кожен кролик', 'з’їв', 'кожного кролика'], [I.card, 'гравцями', 'Кожен гравець', 'поклав на стіл', 'кожного гравця'],
];
const shareMinus = ([t, whom, each, did, whose]: (typeof SHARED_THEN)[number]): Make => (r) => {
  const m = span(r, [2, 3], [4, 6]); const q = span(r, [4, 5], [7, 10]); const e = randInt(2, q - 2); const total = m * q;
  return { text: `${C(total, t)} порівну поділили між ${N(m, 'm', 'ins')} ${whom}. ${each} одразу ${did} ${N(e, t)}. Скільки ${t.many} лишилося в ${whose}?`,
    scene: [chip(t.emoji, total), chip('➗', m), chip('➖', e), ASK], answer: q - e,
    how: `Спочатку поділи: ${N(total, t)} на ${N(m)}. Потім відніми ${N(e, t)}.`, nums: [total, m, e] };
};

const TIMES_MORE: [string, string, string, Item][] = [
  ['На першій грядці росте', 'на другій', 'на другій грядці', I.bush], ['У Марка', 'в Олі', 'в Олі', I.sticker], ['У малому акваріумі', 'у великому', 'у великому акваріумі', I.fish],
  ['У першому класі', 'в другому', 'у другому класі', I.pupil], ['На нижній полиці', 'на верхній', 'на верхній полиці', I.book], ['У суботу в музей прийшло', 'в неділю', 'прийшло в неділю', I.visitor],
  ['У першому кошику', 'в другому', 'у другому кошику', I.mushroom], ['Тато зловив', 'дідусь', 'зловив дідусь', I.bigFish],
];
const timesMore = ([x, y, where, t]: (typeof TIMES_MORE)[number]): Make => (r) => {
  const k = span(r, [3, 5], [7, 12]); const m = span(r, [2, 2], [3, 5]);
  return { text: `${x} ${C(k, t)}, а ${y} — у ${C(m, I.time)} більше. Скільки ${t.many} ${where}?`,
    scene: [chip(t.emoji, k), chip('✖️', `у ${m} більше`), ASK], answer: k * m,
    how: `«У ${N(m)} ${form(m, I.time)} більше» — це множення: ${N(k, t)} помнож на ${N(m)}.`, nums: [k, m] };
};

const TIMES_FEWER: [string, string, string, Item][] = [
  ['У великій коробці', 'в маленькій', 'у маленькій коробці', I.cube], ['У старшого брата', 'в молодшого', 'в молодшого брата', I.car], ['На першому дереві', 'на другому', 'на другому дереві', I.apple],
  ['На першій полиці', 'на другій', 'на другій полиці', I.book], ['Улітку Соня знайшла', 'восени', 'вона знайшла восени', I.shell], ['У першому букеті', 'в другому', 'у другому букеті', I.flower],
  ['Уранці пекар спік', 'увечері', 'він спік увечері', I.bun], ['На великому ставку', 'на малому', 'на малому ставку', I.duck],
];
const timesFewer = ([x, y, where, t]: (typeof TIMES_FEWER)[number]): Make => (r) => {
  const m = span(r, [2, 2], [3, 5]); const q = span(r, [3, 4], [6, 10]); const total = m * q;
  return { text: `${x} ${C(total, t)}, а ${y} — у ${C(m, I.time)} менше. Скільки ${t.many} ${where}?`,
    scene: [chip(t.emoji, total), chip('➗', `у ${m} менше`), ASK], answer: q,
    how: `«У ${N(m)} ${form(m, I.time)} менше» — це ділення: ${N(total, t)} поділи на ${N(m)}.`, nums: [total, m] };
};

// ====================================================================== Band 6
// Steps 41–50: several steps, time, speed, a number thought of.

const MORE_TOTAL: [string, string, string, Item][] = [
  ['На першій полиці', 'на другій', 'на двох полицях разом', I.book], ['У першому кошику', 'в другому', 'у двох кошиках разом', I.apple], ['У Тараса', 'в Лесі', 'у них разом', I.sticker],
  ['У першому вагоні', 'в другому', 'у двох вагонах разом', I.passenger], ['Уранці продали', 'ввечері', 'продали за день', I.ticket], ['У першому класі', 'в другому', 'у двох класах разом', I.pupil],
  ['На першій клумбі', 'на другій', 'на двох клумбах разом', I.flower], ['У суботу Данило пробіг', 'у неділю', 'він пробіг за два дні', I.lap],
];
const moreTotal = ([x, y, both, t]: (typeof MORE_TOTAL)[number]): Make => (r) => {
  const a = span(r, [12, 20], [25, 40]); const b = span(r, [3, 5], [9, 15]);
  return { text: `${x} ${C(a, t)}, а ${y} — на ${N(b, t)} більше. Скільки ${t.many} ${both}?`,
    scene: [chip(t.emoji, a), chip(t.emoji, `на ${b} більше`), ASK], answer: a * 2 + b,
    how: `Спочатку дізнайся, скільки там, де більше: до ${N(a, t, 'gen')} додай ${N(b, t)}. Потім склади обидва числа.`, nums: [a, b] };
};

const TIMED: [string, string, string][] = [
  ['Потяг виїхав', 'був у дорозі', 'О котрій годині він приїхав?'], ['Вистава почалася', 'тривала', 'О котрій годині вона закінчилась?'],
  ['Екскурсія почалася', 'тривала', 'О котрій годині вона закінчилась?'], ['Літак злетів', 'летів', 'О котрій годині він приземлився?'],
  ['Змагання почалися', 'тривали', 'О котрій годині вони закінчились?'], ['Тато пішов на роботу', 'працював', 'О котрій годині він закінчив роботу?'],
  ['Мандрівники вирушили в похід', 'йшли', 'О котрій годині вони дійшли до табору?'], ['Корабель відплив', 'плив', 'О котрій годині він приплив?'],
];
const timed = ([started, lasted, ask]: (typeof TIMED)[number]): Make => () => {
  const start = randInt(7, 12); const d = randInt(2, 8);
  return { text: `${started} о ${say(start, hourAt(start))} годині і ${lasted} ${C(d, I.hour)}. ${ask}`,
    scene: [chip('🕐', `о ${start}:00`), chip('⏱️', written(C(d, I.hour))), chip('❓', 'о котрій')], answer: start + d,
    how: `До години початку додай, скільки минуло: ${N(start)} і ще ${N(d, I.hour)}.`, nums: [start, d] };
};

const MOVERS: [string, string, string, string, [number, number]][] = [
  ['велосипедист проїжджає', 'він проїде', '🚴', 'проїжджає', [10, 15]], ['турист проходить', 'він пройде', '🥾', 'проходить', [3, 6]], ['човен пропливає', 'він пропливе', '⛵', 'пропливає', [6, 10]],
  ['потяг проїжджає', 'він проїде', '🚆', 'проїжджає', [40, 90]], ['автобус проїжджає', 'він проїде', '🚌', 'проїжджає', [30, 60]], ['вершник проїжджає', 'він проїде', '🐎', 'проїжджає', [8, 14]],
  ['лижник пробігає', 'він пробіжить', '⛷️', 'пробігає', [7, 12]], ['корабель пропливає', 'він пропливе', '🚢', 'пропливає', [15, 30]],
];
const speed = ([goes, will, emoji, , [lo, hi]]: (typeof MOVERS)[number]): Make => () => {
  const k = hi > 20 ? randInt(lo / 10, hi / 10) * 10 : randInt(lo, hi); const m = randInt(2, 5);
  return { text: `За одну годину ${goes} ${C(k, I.km)}. Скільки кілометрів ${will} за ${C(m, I.hour)}?`,
    scene: [chip(emoji, `${k} км за годину`), chip('⏱️', written(C(m, I.hour))), ASK], answer: k * m,
    how: `Щогодини — однаково, по ${N(k, I.km)}. Помнож на кількість годин: на ${N(m)}.`, nums: [k, m] };
};

/** «задумав число» — what was done with it, what came out, and how to undo it. */
const THOUGHT: ((h: Hero) => { did: string; out: number; answer: number; undo: string; nums: number[] })[] = [
  (h) => { const x = randInt(12, 60); const a = randInt(8, 30); return { did: `${h.v('додав', 'додала')} до нього ${N(a)}`, out: x + a, answer: x, undo: `відніми ${N(a)}`, nums: [1, x, a] }; },
  (h) => { const x = randInt(30, 90); const a = randInt(8, 25); return { did: `${h.v('відняв', 'відняла')} від нього ${N(a)}`, out: x - a, answer: x, undo: `додай ${N(a)}`, nums: [2, x, a] }; },
  (h) => { const x = randInt(3, 12); const m = randInt(2, 6); return { did: `${h.v('помножив', 'помножила')} його на ${N(m)}`, out: x * m, answer: x, undo: `поділи на ${N(m)}`, nums: [3, x, m] }; },
  (h) => { const m = randInt(2, 6); const x = m * randInt(3, 12); return { did: `${h.v('поділив', 'поділила')} його на ${N(m)}`, out: x / m, answer: x, undo: `помнож на ${N(m)}`, nums: [4, x, m] }; },
  (h) => { const x = randInt(10, 40); const a = randInt(5, 20); const b = randInt(5, 20); return { did: `${h.v('додав', 'додала')} до нього ${N(a)}, а потім ще ${N(b)}`, out: x + a + b, answer: x, undo: `відніми ${N(b)}, а потім ще ${N(a)}`, nums: [5, x, a, b] }; },
  (h) => { const x = randInt(3, 10); const m = randInt(2, 5); const a = randInt(3, 12); return { did: `${h.v('помножив', 'помножила')} його на ${N(m)} і ${h.v('додав', 'додала')} ${N(a)}`, out: x * m + a, answer: x, undo: `відніми ${N(a)}, а потім поділи на ${N(m)}`, nums: [6, x, m, a] }; },
  (h) => { const x = randInt(25, 60); const a = randInt(5, 20); const b = randInt(5, 20); return { did: `${h.v('відняв', 'відняла')} від нього ${N(a)}, а потім ${h.v('додав', 'додала')} ${N(b)}`, out: x - a + b, answer: x, undo: `відніми ${N(b)}, а потім додай ${N(a)}`, nums: [7, x, a, b] }; },
  (h) => { const x = randInt(8, 30); const a = randInt(3, 12); return { did: `${h.v('подвоїв', 'подвоїла')} його і ${h.v('відняв', 'відняла')} ${N(a)}`, out: x * 2 - a, answer: x, undo: `додай ${N(a)}, а потім поділи на два`, nums: [8, x, a] }; },
];
const thought = (make: (typeof THOUGHT)[number]): Make => () => {
  const h = hero(); const t = make(h);
  return { text: `${h.name} ${h.v('задумав', 'задумала')} число, ${t.did} і ${h.v('отримав', 'отримала')} ${N(t.out)}. Яке число ${h.v('задумав', 'задумала')} ${h.name}?`,
    scene: [chip('💭', '?'), chip('➡️'), chip('🟰', t.out)], answer: t.answer,
    how: `Іди назад, від кінця до початку: візьми ${N(t.out)} і ${t.undo}.`, nums: t.nums };
};

const TWO_BUYS: [Item, string, string][] = [
  [I.pencil, 'зошит', '📓'], [I.bun, 'сік', '🧃'], [I.sticker, 'альбом', '📒'], [I.balloon, 'торт', '🎂'], [I.ticket, 'попкорн', '🍿'],
  [I.postcard, 'конверт', '✉️'], [I.notebook, 'пенал', '👝'], [I.cake, 'чай', '🍵'], [I.candy, 'шоколадку', '🍫'],
];
const twoBuys = ([t, other, emoji]: (typeof TWO_BUYS)[number]): Make => () => {
  const h = hero(); const m = randInt(2, 6); const p = randInt(3, 9); const q = randInt(10, 35);
  return { text: `${h.name} ${h.v('купив', 'купила')} ${C(m, t)} по ${C(p, coin())} і ${other} за ${C(q, coin())}. Скільки ${coin().many} ${h.he} ${h.v('заплатив', 'заплатила')}?`,
    scene: [chip(many(t.emoji, m), `по ${p} ${money$.short}`), chip(emoji, `${q} ${money$.short}`), ASK], answer: m * p + q,
    how: `Спочатку порахуй однакові покупки: ${N(p, coin())} помнож на ${N(m)}. Потім додай ще ${N(q, coin())}.`, nums: [m, p, q] };
};

const HALVES: [string, string, string, Item][] = [
  ['В Олі було', 'вона подарувала подрузі', 'віддала братові', I.candy], ['На полиці стояло', 'забрали читати', 'віддали в бібліотеку', I.book],
  ['У кошику було', 'з’їли на обід', 'з’їли на вечерю', I.pie], ['У пачці було', 'наклеїли в альбом', 'подарували', I.sticker],
  ['На дереві висіло', 'зірвали вранці', 'зірвали ввечері', I.apple], ['У крамниці було', 'продали до обіду', 'продали після обіду', I.balloon],
  ['У скарбничці було', 'витратили на книжку', 'витратили на морозиво', I.coin], ['На грядці росло', 'зібрали в суботу', 'зібрали в неділю', I.tomato],
  ['На таці було', 'роздали гостям', 'з’їли діти', I.cake],
];
const halves = ([was, first, then, t]: (typeof HALVES)[number]): Make => () => {
  const half = randInt(6, 20); const b = randInt(2, half - 2);
  return { text: `${was} ${C(half * 2, t)}. Половину ${first}, а потім ще ${N(b, t)} ${then}. Скільки ${t.many} лишилось?`,
    scene: [chip(t.emoji, half * 2), chip('➗', 'половина'), chip('➖', b), ASK], answer: half - b,
    how: `Половина — це поділити на два: лишилося ${N(half, t)}. Потім відніми ще ${N(b, t)}.`, nums: [half, b] };
};

// ======================================================================= Path

/** One kind of problem: a frame told in one of its skins. */
interface Kind {
  id: string;
  make: Make;
  /** Where in its band the kind stands, 0…1. */
  r: number;
}
const kindsOf = <S>(name: string, skins: readonly S[], frame: (skin: S) => Make) => skins.map((skin, i) => ({ id: `${name}${i}`, make: frame(skin) }));

/** The bands of the path, easiest first; inside a band a step takes one skin of every frame. */
const BANDS = [
  [kindsOf('join', JOIN, join), kindsOf('got', GOT_MORE, gotMore), kindsOf('came', CAME_IN, cameIn), kindsOf('gave', GAVE, gave), kindsOf('away', WENT_AWAY, wentAway)],
  [kindsOf('two', TWO_KINDS, twoKinds), kindsOf('left', LEFT_20, left20), kindsOf('more', MORE_PAIRS, howManyMore), kindsOf('fewer', FEWER_PAIRS, howManyFewer), kindsOf('miss', MISSING, missing)],
  [kindsOf('sum', PRICE_PAIRS, totalPrice), kindsOf('change', BOUGHT, change), kindsOf('lack', WANTED, notEnough), kindsOf('price', REPRICED, repriced), kindsOf('three', THREE, threeAdd)],
  [kindsOf('groups', GROUPS, groups), kindsOf('cost', PRICED, priceTimes), kindsOf('rows', ROWS, rows), kindsOf('share', SHARED, share), kindsOf('pack', PACKED, pack)],
  [kindsOf('boxes', BOXES_AND_LOOSE, timesPlus), kindsOf('buy', BOUGHT_MANY, timesChange), kindsOf('ate', SHARED_THEN, shareMinus), kindsOf('xmore', TIMES_MORE, timesMore), kindsOf('xfewer', TIMES_FEWER, timesFewer)],
  [kindsOf('total', MORE_TOTAL, moreTotal), kindsOf('time', TIMED, timed), kindsOf('speed', MOVERS, speed), kindsOf('thought', THOUGHT, thought), kindsOf('buys', TWO_BUYS, twoBuys), kindsOf('half', HALVES, halves)],
];

/** Every kind in path order: round-robin over the frames of a band, band after band. */
const KINDS: Kind[] = BANDS.flatMap((frames) => {
  const longest = Math.max(...frames.map((f) => f.length));
  const band: Omit<Kind, 'r'>[] = [];
  for (let i = 0; i < longest; i += 1) for (const frame of frames) if (frame[i]) band.push(frame[i]);
  return band.map((kind, i) => ({ ...kind, r: band.length > 1 ? i / (band.length - 1) : 0 }));
});

/** New kinds a step opens. */
const KINDS_PER_STEP = 5;
/** Path length: five new kinds of problem on every step. */
export const WORD_PROBLEM_STEPS = Math.ceil(KINDS.length / KINDS_PER_STEP);
/** How many kinds of problem exist (each has many variants). */
export const WORD_PROBLEM_KINDS = KINDS.length;

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
  money$ = currencyOf(config.currency);
  let problem = kind.make(kind.r);
  for (let tries = 0; tries < 30; tries += 1) {
    awkward = false;
    problem = kind.make(kind.r);
    if (!awkward) break;
  }
  return {
    id: uid('wp'),
    key: `wp:${kind.id}:${problem.nums.join(',')}`,
    prompt: written(problem.text),
    speak: spoken(problem.text),
    reward: rewardForStep(config.step) + 1,
    payload: {
      template: Mechanics.GridChoice,
      cols: 3,
      stimulus: { scene: problem.scene },
      options: buildNumberOptions(problem.answer, 6, 6).map((n) => ({ id: `n${n}`, glyphs: [String(n)] })),
      correctId: `n${problem.answer}`,
      hint: problem.how,
    },
  };
}
