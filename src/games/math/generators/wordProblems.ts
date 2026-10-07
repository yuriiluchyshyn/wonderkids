import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import type { GridChoicePayload } from '@/core/game/templates/types';
import { countForm } from '@/core/lang/uk';
import { pick, randInt, uid } from '@/core/utils/random';
import { rewardForStep } from '../difficulty';
import { buildNumberOptions } from './options';

/** Noun forms after a number: 2–4 («яблука»), 5 and more («яблук»). */
type Forms = readonly [few: string, many: string];

/** «3 яблука», «5 яблук», «21 яблуко» is avoided: problems never use 1. */
function count(n: number, [few, many]: Forms): string {
  const tens = n % 100;
  const ones = n % 10;
  return `${n} ${ones >= 2 && ones <= 4 && !(tens >= 12 && tens <= 14) ? few : many}`;
}

/** «лежать 3 кульки», but «лежить 5 кульок»: the verb follows the count. */
const lies = (n: number) => (countForm(n) === 1 ? 'лежать' : 'лежить');

interface Thing {
  forms: Forms;
  emoji: string;
}
const thing = (few: string, many: string, emoji: string): Thing => ({ forms: [few, many], emoji });

const THINGS = [
  thing('яблука', 'яблук', '🍎'),
  thing('груші', 'груш', '🍐'),
  thing('цукерки', 'цукерок', '🍬'),
  thing('олівці', 'олівців', '✏️'),
  thing('книжки', 'книжок', '📚'),
  thing('м’ячі', 'м’ячів', '⚽'),
  thing('кульки', 'кульок', '🎈'),
  thing('наліпки', 'наліпок', '⭐'),
  thing('горіхи', 'горіхів', '🌰'),
  thing('машинки', 'машинок', '🚗'),
  thing('кубики', 'кубиків', '🧱'),
  thing('банани', 'бананів', '🍌'),
  thing('мушлі', 'мушель', '🐚'),
];
const HRYVNIA: Forms = ['гривні', 'гривень'];
const PAGES: Forms = ['сторінки', 'сторінок'];
const BIRDS: Forms = ['пташки', 'пташок'];
const CAKES: Forms = ['тістечка', 'тістечок'];
const PENCILS: Forms = ['олівці', 'олівців'];
const NOTEBOOKS: Forms = ['зошити', 'зошитів'];
const HOURS: Forms = ['години', 'годин'];
const DAYS: Forms = ['дні', 'днів'];
const TIMES: Forms = ['рази', 'разів'];
const PLATES: Forms = ['тарілки', 'тарілок'];
const BASKETS: Forms = ['кошики', 'кошиків'];
const ROWS: Forms = ['ряди', 'рядів'];

/** A child in the story. Names are only ever used as the subject. */
interface Hero {
  name: string;
  he: string;
  his: string;
  him: string;
  /** Picks the verb form: `v('купив', 'купила')`. */
  v: (m: string, f: string) => string;
}
const BOYS = ['Василь', 'Андрій', 'Тарас', 'Максим', 'Остап', 'Назар', 'Данило', 'Марко'];
const GIRLS = ['Оля', 'Софія', 'Марійка', 'Злата', 'Соломія', 'Даринка', 'Ганнуся', 'Леся'];
function hero(): Hero {
  const boy = Math.random() < 0.5;
  return {
    name: pick(boy ? BOYS : GIRLS),
    he: boy ? 'він' : 'вона',
    his: boy ? 'його' : 'її',
    him: boy ? 'йому' : 'їй',
    v: (m, f) => (boy ? m : f),
  };
}

type Chip = { emoji: string; label?: string };
/** A row of pictures for small amounts, «🍎×12» for big ones. */
const many = (emoji: string, n: number): string => (n <= 6 ? emoji.repeat(n) : `${emoji}×${n}`);
const chip = (emoji: string, label?: string | number): Chip => ({ emoji, label: label === undefined ? undefined : String(label) });
const ASK: Chip = { emoji: '❓' };
const money = (n: number): Chip => chip('💵', `${n} грн`);

interface Problem {
  /** The story and the question, as read to the child. */
  text: string;
  /** What is known and what is asked, as pictures. */
  scene: Chip[];
  answer: number;
  /** What to do, said after mistakes. */
  how: string;
  /** The solution in words: «10 мінус 7 — це 3». */
  solution: string;
  /** The numbers that make this variant unique. */
  nums: number[];
}

const plus = (a: number, b: number) => `${a} плюс ${b} — це ${a + b}`;
const minus = (a: number, b: number) => `${a} мінус ${b} — це ${a - b}`;
const times = (a: number, b: number) => `${a} помножити на ${b} — це ${a * b}`;
const divided = (a: number, b: number) => `${a} поділити на ${b} — це ${a / b}`;

type Template = [level: number, id: string, make: () => Problem];

/**
 * Fifty kinds of story problem, five per level. A template's level is the
 * path step it appears on; names, things and numbers change on every draw, so
 * each kind has dozens of variants.
 *
 *   1  adding within 10            6  equal groups (×)
 *   2  taking away within 10       7  sharing equally (÷)
 *   3  + and − within 20           8  price × amount, then change
 *   4  money, change, "how many more"   9  two steps within 100, time, length
 *   5  two steps within 50        10  several steps with × and ÷
 */
const TEMPLATES: Template[] = [
  // ---------------------------------------------------------------- level 1
  [1, 'more', () => {
    const h = hero(); const t = pick(THINGS); const a = randInt(2, 5); const b = randInt(2, 5);
    return { text: `${h.name} ${h.v('мав', 'мала')} ${count(a, t.forms)}. Мама дала ${h.him} ще ${b}. Скільки ${t.forms[1]} стало?`,
      scene: [chip(many(t.emoji, a), a), chip('➕'), chip(many(t.emoji, b), b), ASK], answer: a + b,
      how: `Було ${a}, дали ще ${b}. Коли дають ще — додаємо.`, solution: plus(a, b), nums: [a, b] };
  }],
  [1, 'table', () => {
    const t = pick(THINGS); const a = randInt(2, 5); const b = randInt(2, 5);
    return { text: `На столі ${lies(a)} ${count(a, t.forms)}, а в кошику — ще ${b}. Скільки всього ${t.forms[1]}?`,
      scene: [chip(many(t.emoji, a), 'на столі'), chip(many(t.emoji, b), 'у кошику'), ASK], answer: a + b,
      how: 'Слово «всього» підказує: треба скласти разом те, що на столі, і те, що в кошику.', solution: plus(a, b), nums: [a, b] };
  }],
  [1, 'found', () => {
    const h = hero(); const t = pick(THINGS); const a = randInt(2, 5); const b = randInt(2, 4);
    return { text: `${h.name} ${h.v('знайшов', 'знайшла')} ${count(a, t.forms)} вранці і ще ${b} — увечері. Скільки ${t.forms[1]} ${h.he} ${h.v('знайшов', 'знайшла')} за день?`,
      scene: [chip(many(t.emoji, a), '🌅 вранці'), chip(many(t.emoji, b), '🌙 увечері'), ASK], answer: a + b,
      how: 'За день — це вранці й увечері разом. Додай обидва числа.', solution: plus(a, b), nums: [a, b] };
  }],
  [1, 'birds', () => {
    const a = randInt(2, 5); const b = randInt(2, 5);
    return { text: `На гілці сиділо ${count(a, BIRDS)}. Прилетіло ще ${b}. Скільки пташок стало на гілці?`,
      scene: [chip(many('🐦', a), a), chip('➕'), chip(many('🐦', b), b), ASK], answer: a + b,
      how: 'Пташок стало більше, бо прилетіли нові. Додай.', solution: plus(a, b), nums: [a, b] };
  }],
  [1, 'pages', () => {
    const h = hero(); const a = randInt(2, 5); const b = randInt(2, 5);
    return { text: `${h.name} ${h.v('прочитав', 'прочитала')} ${count(a, PAGES)} у понеділок і ${b} — у вівторок. Скільки сторінок ${h.he} ${h.v('прочитав', 'прочитала')} за два дні?`,
      scene: [chip('📖', `${a} у понеділок`), chip('📖', `${b} у вівторок`), ASK], answer: a + b,
      how: 'За два дні — це понеділок і вівторок разом. Додай.', solution: plus(a, b), nums: [a, b] };
  }],
  // ---------------------------------------------------------------- level 2
  [2, 'gave', () => {
    const h = hero(); const t = pick(THINGS); const a = randInt(5, 10); const b = randInt(2, a - 2);
    return { text: `${h.name} ${h.v('мав', 'мала')} ${count(a, t.forms)}. ${b} з них ${h.he} ${h.v('віддав', 'віддала')} другові. Скільки ${t.forms[1]} лишилось?`,
      scene: [chip(many(t.emoji, a), a), chip('➖'), chip('🤝', b), ASK], answer: a - b,
      how: `Було ${a}, віддали ${b}. Коли віддають — віднімаємо.`, solution: minus(a, b), nums: [a, b] };
  }],
  [2, 'eaten', () => {
    const a = randInt(5, 10); const b = randInt(2, a - 2);
    return { text: `На тарілці було ${count(a, CAKES)}. ${b} з них з’їли. Скільки тістечок лишилось на тарілці?`,
      scene: [chip(many('🧁', a), a), chip('➖'), chip('😋', b), ASK], answer: a - b,
      how: 'Тістечок стало менше, бо частину з’їли. Відніми.', solution: minus(a, b), nums: [a, b] };
  }],
  [2, 'broken', () => {
    const a = randInt(6, 10); const b = randInt(2, a - 2);
    return { text: `У коробці ${count(a, PENCILS)}. ${b} з них зламалися. Скільки цілих олівців у коробці?`,
      scene: [chip(many('✏️', a), a), chip('➖'), chip('💔', b), ASK], answer: a - b,
      how: 'Цілі — це всі без зламаних. Від усіх відніми зламані.', solution: minus(a, b), nums: [a, b] };
  }],
  [2, 'flew', () => {
    const a = randInt(5, 10); const b = randInt(2, a - 2);
    return { text: `На гілці сиділо ${count(a, BIRDS)}. ${b} полетіли. Скільки пташок лишилось на гілці?`,
      scene: [chip(many('🐦', a), a), chip('➖'), chip('🕊️', b), ASK], answer: a - b,
      how: 'Пташок стало менше, бо частина полетіла. Відніми.', solution: minus(a, b), nums: [a, b] };
  }],
  [2, 'popped', () => {
    const h = hero(); const a = randInt(5, 10); const b = randInt(2, a - 2);
    return { text: `${h.name} ${h.v('надув', 'надула')} ${a} кульок. ${b} з них луснули. Скільки кульок лишилось?`,
      scene: [chip(many('🎈', a), a), chip('➖'), chip('💥', b), ASK], answer: a - b,
      how: `Було ${a} кульок, ${b} луснули. Відніми ті, що луснули.`, solution: minus(a, b), nums: [a, b] };
  }],
  // ---------------------------------------------------------------- level 3
  [3, 'class', () => {
    const a = randInt(6, 12); const b = randInt(5, 8);
    return { text: `У класі ${a} хлопчиків і ${b} дівчаток. Скільки дітей у класі?`,
      scene: [chip('👦', a), chip('➕'), chip('👧', b), ASK], answer: a + b,
      how: 'Діти — це хлопчики й дівчатка разом. Додай.', solution: plus(a, b), nums: [a, b] };
  }],
  [3, 'bus', () => {
    const a = randInt(11, 20); const b = randInt(3, 9);
    return { text: `В автобусі їхало ${a} пасажирів. На зупинці вийшло ${b}. Скільки пасажирів лишилось в автобусі?`,
      scene: [chip('🚌', a), chip('➖'), chip('🚶', b), ASK], answer: a - b,
      how: 'Пасажирів стало менше, бо частина вийшла. Відніми.', solution: minus(a, b), nums: [a, b] };
  }],
  [3, 'mushrooms', () => {
    const a = randInt(5, 10); const b = randInt(5, 10);
    return { text: `Тато зібрав ${a} грибів, а мама — ${b}. Скільки грибів вони зібрали разом?`,
      scene: [chip('🍄', `тато: ${a}`), chip('🍄', `мама: ${b}`), ASK], answer: a + b,
      how: 'Слово «разом» підказує: треба додати.', solution: plus(a, b), nums: [a, b] };
  }],
  [3, 'book', () => {
    const h = hero(); const a = randInt(12, 20); const b = randInt(3, 9);
    return { text: `У книжці ${a} сторінок. ${h.name} уже ${h.v('прочитав', 'прочитала')} ${b}. Скільки сторінок ще лишилося прочитати?`,
      scene: [chip('📖', `усього ${a}`), chip('✅', b), ASK], answer: a - b,
      how: 'Від усіх сторінок відніми ті, що вже прочитано.', solution: minus(a, b), nums: [a, b] };
  }],
  [3, 'garden', () => {
    const a = randInt(5, 10); const b = randInt(5, 10);
    return { text: `У саду росте ${a} яблунь і ${b} груш. Скільки всього дерев у саду?`,
      scene: [chip('🌳', `яблунь: ${a}`), chip('🌳', `груш: ${b}`), ASK], answer: a + b,
      how: 'І яблуні, і груші — дерева. Додай їх.', solution: plus(a, b), nums: [a, b] };
  }],
  // ---------------------------------------------------------------- level 4
  [4, 'change', () => {
    const h = hero(); const t = pick(THINGS); const k = randInt(2, 4); const pay = pick([10, 20]); const p = randInt(3, pay - 2);
    return { text: `${h.name} ${h.v('пішов', 'пішла')} в магазин і хоче купити ${count(k, t.forms)}. Вони коштують ${count(p, HRYVNIA)}. ${h.name} дає продавчині ${count(pay, HRYVNIA)}. Скільки гривень здачі дасть продавчиня?`,
      scene: [chip(many(t.emoji, k), `${p} грн`), money(pay), chip('🪙', 'здача?')], answer: pay - p,
      how: `Здача — це гроші, які лишилися. Від ${pay} відніми ціну покупки.`, solution: minus(pay, p), nums: [k, p, pay] };
  }],
  [4, 'together', () => {
    const p = randInt(5, 12); const q = randInt(5, 12);
    return { text: `Сік коштує ${count(p, HRYVNIA)}, а булочка — ${q}. Скільки гривень коштують сік і булочка разом?`,
      scene: [chip('🧃', `${p} грн`), chip('➕'), chip('🥐', `${q} грн`), ASK], answer: p + q,
      how: 'Щоб дізнатися, скільки коштує все разом, додай ціни.', solution: plus(p, q), nums: [p, q] };
  }],
  [4, 'howManyMore', () => {
    const h = hero(); const a = randInt(8, 15); const b = randInt(3, a - 2);
    return { text: `${h.name} має ${a} наліпок, а ${h.his} подруга — ${b}. На скільки наліпок більше має ${h.name}?`,
      scene: [chip('⭐', `${h.name}: ${a}`), chip('⭐', `подруга: ${b}`), chip('❓', 'на скільки більше')], answer: a - b,
      how: 'Щоб дізнатися, на скільки одне число більше за інше, від більшого відніми менше.', solution: minus(a, b), nums: [a, b] };
  }],
  [4, 'notEnough', () => {
    const h = hero(); const m = randInt(5, 12); const p = m + randInt(2, 8);
    return { text: `${h.name} має ${count(m, HRYVNIA)}. Морозиво коштує ${p}. Скільки гривень ${h.him} не вистачає?`,
      scene: [money(m), chip('🍦', `${p} грн`), chip('❓', 'не вистачає')], answer: p - m,
      how: 'Від ціни морозива відніми гроші, які вже є.', solution: minus(p, m), nums: [m, p] };
  }],
  [4, 'cheaper', () => {
    const a = randInt(12, 20); const b = randInt(2, 6);
    return { text: `Іграшка коштувала ${count(a, HRYVNIA)}, а потім подешевшала на ${b}. Скільки гривень вона коштує тепер?`,
      scene: [chip('🧸', `${a} грн`), chip('⬇️', `на ${b}`), ASK], answer: a - b,
      how: '«Подешевшала» — означає, що ціна стала меншою. Відніми.', solution: minus(a, b), nums: [a, b] };
  }],
  // ---------------------------------------------------------------- level 5
  [5, 'gaveFound', () => {
    const h = hero(); const t = pick(THINGS); const a = randInt(10, 20); const b = randInt(3, 8); const c = randInt(2, 9);
    return { text: `${h.name} ${h.v('мав', 'мала')} ${count(a, t.forms)}. ${b} ${h.he} ${h.v('віддав', 'віддала')} другові, а потім ${h.v('знайшов', 'знайшла')} ще ${c}. Скільки ${t.forms[1]} стало?`,
      scene: [chip(t.emoji, a), chip('➖', b), chip('➕', c), ASK], answer: a - b + c,
      how: `Спочатку відніми те, що віддали: ${minus(a, b)}. Потім додай те, що знайшли.`, solution: `${minus(a, b)}, а ${plus(a - b, c)}`, nums: [a, b, c] };
  }],
  [5, 'busTwo', () => {
    const a = randInt(12, 25); const b = randInt(3, 8); const c = randInt(2, 9);
    return { text: `В автобусі їхало ${a} пасажирів. На зупинці ${b} вийшло, а ${c} зайшло. Скільки пасажирів стало в автобусі?`,
      scene: [chip('🚌', a), chip('🚶➖', b), chip('🚶➕', c), ASK], answer: a - b + c,
      how: `Спочатку відніми тих, хто вийшов: ${minus(a, b)}. Потім додай тих, хто зайшов.`, solution: `${minus(a, b)}, а ${plus(a - b, c)}`, nums: [a, b, c] };
  }],
  [5, 'twoThings', () => {
    const h = hero(); const p = randInt(8, 15); const q = randInt(5, 12); const pay = p + q < 28 ? 30 : 50;
    return { text: `${h.name} ${h.v('купив', 'купила')} зошит за ${count(p, HRYVNIA)} і ручку за ${count(q, HRYVNIA)}. Продавчині ${h.he} ${h.v('дав', 'дала')} ${count(pay, HRYVNIA)}. Скільки гривень здачі ${h.he} отримає?`,
      scene: [chip('📓', `${p} грн`), chip('🖊️', `${q} грн`), money(pay), chip('🪙', 'здача?')], answer: pay - p - q,
      how: `Спочатку дізнайся, скільки коштує все разом: ${plus(p, q)}. Потім відніми це від ${pay}.`, solution: `${plus(p, q)}, а ${minus(pay, p + q)}`, nums: [p, q, pay] };
  }],
  [5, 'threeBaskets', () => {
    const t = pick(THINGS); const a = randInt(5, 12); const b = randInt(5, 12); const c = randInt(5, 12);
    return { text: `У першому кошику ${count(a, t.forms)}, у другому — ${b}, а в третьому — ${c}. Скільки ${t.forms[1]} у трьох кошиках разом?`,
      scene: [chip('🧺', a), chip('🧺', b), chip('🧺', c), ASK], answer: a + b + c,
      how: `Додай усі три числа по черзі: спочатку ${plus(a, b)}, потім додай ще ${c}.`, solution: `${plus(a, b)}, а ${plus(a + b, c)}`, nums: [a, b, c] };
  }],
  [5, 'pies', () => {
    const a = randInt(15, 25); const b = randInt(3, 6); const c = randInt(3, 6);
    return { text: `Бабуся спекла ${a} пиріжків. Діти з’їли ${b} на обід і ${c} на вечерю. Скільки пиріжків лишилось?`,
      scene: [chip('🥟', a), chip('🍽️➖', b), chip('🌙➖', c), ASK], answer: a - b - c,
      how: `Спочатку дізнайся, скільки з’їли всього: ${plus(b, c)}. Потім відніми це від ${a}.`, solution: `${plus(b, c)}, а ${minus(a, b + c)}`, nums: [a, b, c] };
  }],
  // ---------------------------------------------------------------- level 6
  [6, 'boxes', () => {
    const k = randInt(2, 6); const m = randInt(2, 5);
    return { text: `У кожній коробці ${lies(k)} ${count(k, PENCILS)}. Скільки олівців у ${m} коробках?`,
      scene: [...Array.from({ length: Math.min(m, 4) }, () => chip('📦', k)), ...(m > 4 ? [chip('…')] : []), ASK], answer: k * m,
      how: `Це ${m} однакові купки по ${k}. Однакові купки множимо.`, solution: times(k, m), nums: [k, m] };
  }],
  [6, 'price', () => {
    const p = randInt(3, 9); const m = randInt(2, 5);
    return { text: `Один зошит коштує ${count(p, HRYVNIA)}. Скільки гривень коштують ${count(m, NOTEBOOKS)}?`,
      scene: [chip('📓', `${p} грн`), chip('✖️', m), ASK], answer: p * m,
      how: `Кожен зошит коштує однаково. Ціну помнож на кількість зошитів.`, solution: times(p, m), nums: [p, m] };
  }],
  [6, 'platesOf', () => {
    const k = randInt(2, 5); const m = randInt(2, 5);
    return { text: `На столі ${count(m, PLATES)}. На кожній — по ${count(k, CAKES)}. Скільки тістечок на столі?`,
      scene: [...Array.from({ length: Math.min(m, 4) }, () => chip('🍽️', many('🧁', k))), ...(m > 4 ? [chip('…')] : []), ASK], answer: k * m,
      how: `На кожній тарілці однаково — по ${k}. Помнож ${k} на кількість тарілок.`, solution: times(k, m), nums: [k, m] };
  }],
  [6, 'wheels', () => {
    const m = randInt(2, 6);
    return { text: `У машини 4 колеса. Скільки коліс у ${m} машин?`,
      scene: [chip('🚗', '4 колеса'), chip('✖️', m), ASK], answer: 4 * m,
      how: 'У кожної машини по 4 колеса. Помнож 4 на кількість машин.', solution: times(4, m), nums: [m] };
  }],
  [6, 'reading', () => {
    const h = hero(); const k = randInt(5, 10); const m = randInt(2, 7);
    return { text: `${h.name} щодня читає ${k} сторінок. Скільки сторінок ${h.he} прочитає за ${count(m, DAYS)}?`,
      scene: [chip('📖', `${k} щодня`), chip('📅', count(m, DAYS)), ASK], answer: k * m,
      how: `Щодня однаково — по ${k}. Помнож на кількість днів.`, solution: times(k, m), nums: [k, m] };
  }],
  // ---------------------------------------------------------------- level 7
  [7, 'share', () => {
    const h = hero(); const m = randInt(2, 5); const q = randInt(2, 6); const t = m * q;
    return { text: `${h.name} має ${t} цукерок і хоче порівну поділити їх між ${m} друзями. Скільки цукерок отримає кожен друг?`,
      scene: [chip('🍬', t), chip('➗'), chip('🧒', m), ASK], answer: q,
      how: '«Порівну» — означає ділити. Поділи цукерки на кількість друзів.', solution: divided(t, m), nums: [t, m] };
  }],
  [7, 'intoBaskets', () => {
    const th = pick(THINGS); const m = randInt(2, 6); const q = randInt(2, 6); const t = m * q;
    return { text: `${t} ${th.forms[1]} розклали порівну в ${count(m, BASKETS)}. Скільки ${th.forms[1]} у кожному кошику?`,
      scene: [chip(th.emoji, t), chip('➗'), chip('🧺', m), ASK], answer: q,
      how: 'Розкласти порівну — це поділити. Поділи на кількість кошиків.', solution: divided(t, m), nums: [t, m] };
  }],
  [7, 'onePrice', () => {
    const m = randInt(2, 6); const p = randInt(3, 9); const t = m * p;
    return { text: `${count(m, NOTEBOOKS)} коштують ${count(t, HRYVNIA)}. Усі зошити однакові. Скільки гривень коштує один зошит?`,
      scene: [chip(many('📓', m), `${t} грн`), chip('📓', 'один — ?')], answer: p,
      how: 'Усі зошити коштують однаково. Поділи всю суму на кількість зошитів.', solution: divided(t, m), nums: [t, m] };
  }],
  [7, 'desks', () => {
    const q = randInt(6, 15); const t = q * 2;
    return { text: `У класі ${t} учнів. Вони сіли по двоє за кожну парту. Скільки парт зайнято?`,
      scene: [chip('🧒', t), chip('🪑', 'по 2'), ASK], answer: q,
      how: 'За кожною партою двоє. Поділи кількість учнів на 2.', solution: divided(t, 2), nums: [t] };
  }],
  [7, 'ribbon', () => {
    const m = randInt(5, 8); const q = randInt(2, 6); const t = m * q;
    return { text: `Стрічку завдовжки ${t} метрів розрізали на ${m} рівних частин. Скільки метрів в одній частині?`,
      scene: [chip('🎀', `${t} м`), chip('✂️', `${m} частин`), ASK], answer: q,
      how: 'Рівні частини — це ділення. Поділи довжину на кількість частин.', solution: divided(t, m), nums: [t, m] };
  }],
  // ---------------------------------------------------------------- level 8
  [8, 'buyMany', () => {
    const h = hero(); const th = pick(THINGS); const m = randInt(2, 5); const p = randInt(3, 9); const pay = m * p < 18 ? 20 : 50;
    return { text: `${h.name} ${h.v('купив', 'купила')} ${count(m, th.forms)} по ${count(p, HRYVNIA)} за штуку. Продавчині ${h.he} ${h.v('дав', 'дала')} ${count(pay, HRYVNIA)}. Скільки гривень здачі?`,
      scene: [chip(many(th.emoji, m), `по ${p} грн`), money(pay), chip('🪙', 'здача?')], answer: pay - m * p,
      how: `Спочатку дізнайся, скільки коштує покупка: ${times(p, m)}. Потім відніми це від ${pay}.`, solution: `${times(p, m)}, а ${minus(pay, m * p)}`, nums: [m, p, pay] };
  }],
  [8, 'boxesAndLoose', () => {
    const m = randInt(2, 5); const k = randInt(4, 8); const c = randInt(2, 9);
    return { text: `У ${m} коробках по ${count(k, PENCILS)}, і ще ${c} лежать окремо. Скільки всього олівців?`,
      scene: [chip('📦', `${m} × ${k}`), chip('✏️', `ще ${c}`), ASK], answer: m * k + c,
      how: `Спочатку порахуй олівці в коробках: ${times(k, m)}. Потім додай ті, що окремо.`, solution: `${times(k, m)}, а ${plus(m * k, c)}`, nums: [m, k, c] };
  }],
  [8, 'tickets', () => {
    const adult = pick([20, 25, 30, 35, 40]); const child = pick([10, 12, 15]);
    return { text: `Квиток у зоопарк для дорослого коштує ${adult} гривень, а дитячий — ${child}. Скільки гривень заплатять за квитки тато, мама і одна дитина?`,
      scene: [chip('🧑', `${adult} грн`), chip('🧑', `${adult} грн`), chip('🧒', `${child} грн`), ASK], answer: adult * 2 + child,
      how: `Дорослих двоє: ${times(adult, 2)}. До цього додай дитячий квиток.`, solution: `${times(adult, 2)}, а ${plus(adult * 2, child)}`, nums: [adult, child] };
  }],
  [8, 'left', () => {
    const h = hero(); const m = randInt(2, 4); const p = randInt(4, 9); const have = pick([40, 50]);
    return { text: `${h.name} ${h.v('мав', 'мала')} ${have} гривень і ${h.v('купив', 'купила')} ${m} булочки по ${count(p, HRYVNIA)}. Скільки гривень у ${h.v('нього', 'неї')} лишилось?`,
      scene: [money(have), chip(many('🥐', m), `по ${p} грн`), chip('❓', 'лишилось')], answer: have - m * p,
      how: `Спочатку порахуй, скільки коштують булочки: ${times(p, m)}. Потім відніми це від ${have}.`, solution: `${times(p, m)}, а ${minus(have, m * p)}`, nums: [m, p, have] };
  }],
  [8, 'shelf', () => {
    const m = randInt(2, 5); const k = randInt(5, 9); const b = randInt(3, 9);
    return { text: `Книжки стоять у ${count(m, ROWS)}, по ${k} у кожному. ${b} книжок забрали читати. Скільки книжок лишилось?`,
      scene: [chip('📚', `${m} × ${k}`), chip('➖', b), ASK], answer: m * k - b,
      how: `Спочатку порахуй усі книжки: ${times(k, m)}. Потім відніми ті, що забрали.`, solution: `${times(k, m)}, а ${minus(m * k, b)}`, nums: [m, k, b] };
  }],
  // ---------------------------------------------------------------- level 9
  [9, 'train', () => {
    const start = randInt(7, 12); const d = randInt(2, 6);
    return { text: `Потяг виїхав о ${start} годині і був у дорозі ${count(d, HOURS)}. О котрій годині він приїхав?`,
      scene: [chip('🚆', `о ${start}:00`), chip('⏱️', count(d, HOURS)), chip('🏁', 'о котрій?')], answer: start + d,
      how: 'До години, коли потяг виїхав, додай час у дорозі.', solution: plus(start, d), nums: [start, d] };
  }],
  [9, 'lesson', () => {
    const lesson = pick([35, 40, 45]); const rest = pick([10, 15, 20]);
    return { text: `Урок триває ${lesson} хвилин, а перерва після нього — ${rest} хвилин. Скільки хвилин тривають урок і перерва разом?`,
      scene: [chip('🏫', `${lesson} хв`), chip('➕'), chip('🤸', `${rest} хв`), ASK], answer: lesson + rest,
      how: 'Разом — значить додати хвилини уроку і перерви.', solution: plus(lesson, rest), nums: [lesson, rest] };
  }],
  [9, 'cutTwice', () => {
    const a = randInt(6, 10) * 10; const b = randInt(10, 25); const c = randInt(10, 25);
    return { text: `Стрічка була завдовжки ${a} сантиметрів. Від неї відрізали ${b} сантиметрів, а потім ще ${c}. Скільки сантиметрів стрічки лишилось?`,
      scene: [chip('🎀', `${a} см`), chip('✂️', b), chip('✂️', c), ASK], answer: a - b - c,
      how: `Спочатку дізнайся, скільки відрізали всього: ${plus(b, c)}. Потім відніми це від ${a}.`, solution: `${plus(b, c)}, а ${minus(a, b + c)}`, nums: [a, b, c] };
  }],
  [9, 'twoShelves', () => {
    const a = randInt(20, 40); const b = randInt(5, 15);
    return { text: `На першій полиці ${a} книжок, а на другій — на ${b} більше. Скільки книжок на двох полицях разом?`,
      scene: [chip('📚', a), chip('📚', `на ${b} більше`), ASK], answer: a * 2 + b,
      how: `Спочатку дізнайся, скільки книжок на другій полиці: ${plus(a, b)}. Потім додай обидві полиці.`, solution: `${plus(a, b)}, а ${plus(a, a + b)}`, nums: [a, b] };
  }],
  [9, 'thought', () => {
    const h = hero(); const a = randInt(12, 30); const s = a + randInt(15, 60);
    return { text: `${h.name} ${h.v('задумав', 'задумала')} число, ${h.v('додав', 'додала')} до нього ${a} і ${h.v('отримав', 'отримала')} ${s}. Яке число ${h.v('задумав', 'задумала')} ${h.name}?`,
      scene: [chip('💭', '?'), chip('➕', a), chip('🟰', s)], answer: s - a,
      how: `Щоб знайти задумане число, зроби навпаки: від ${s} відніми ${a}.`, solution: minus(s, a), nums: [a, s] };
  }],
  // --------------------------------------------------------------- level 10
  [10, 'crates', () => {
    const m = randInt(3, 6); const k = randInt(5, 10); const sold = randInt(5, m * k - 5);
    return { text: `У ${m} ящиках по ${k} кілограмів яблук. ${sold} кілограмів продали. Скільки кілограмів яблук лишилось?`,
      scene: [chip('📦', `${m} × ${k} кг`), chip('🛒➖', `${sold} кг`), ASK], answer: m * k - sold,
      how: `Спочатку порахуй усі яблука: ${times(k, m)}. Потім відніми продані.`, solution: `${times(k, m)}, а ${minus(m * k, sold)}`, nums: [m, k, sold] };
  }],
  [10, 'pencilsAndBook', () => {
    const h = hero(); const m = randInt(2, 6); const p = randInt(3, 8); const q = randInt(10, 25);
    return { text: `${h.name} ${h.v('купив', 'купила')} ${count(m, PENCILS)} по ${count(p, HRYVNIA)} і зошит за ${count(q, HRYVNIA)}. Скільки гривень ${h.he} ${h.v('заплатив', 'заплатила')}?`,
      scene: [chip(many('✏️', m), `по ${p} грн`), chip('📓', `${q} грн`), ASK], answer: m * p + q,
      how: `Спочатку порахуй олівці: ${times(p, m)}. Потім додай ціну зошита.`, solution: `${times(p, m)}, а ${plus(m * p, q)}`, nums: [m, p, q] };
  }],
  [10, 'shareAndEat', () => {
    const m = randInt(2, 6); const q = randInt(4, 9); const t = m * q;
    return { text: `${t} цукерок поділили порівну між ${m} дітьми. Кожна дитина одразу з’їла дві цукерки. Скільки цукерок лишилося в кожної дитини?`,
      scene: [chip('🍬', t), chip('➗', m), chip('😋➖', 2), ASK], answer: q - 2,
      how: `Спочатку поділи: ${divided(t, m)}. Потім відніми дві з’їдені цукерки.`, solution: `${divided(t, m)}, а ${minus(q, 2)}`, nums: [t, m] };
  }],
  [10, 'cyclist', () => {
    const k = randInt(10, 15); const m = randInt(2, 5);
    return { text: `За одну годину велосипедист проїжджає ${k} кілометрів. Скільки кілометрів він проїде за ${count(m, HOURS)}?`,
      scene: [chip('🚴', `${k} км за годину`), chip('⏱️', count(m, HOURS)), ASK], answer: k * m,
      how: 'Щогодини він проїжджає однаково. Помнож кілометри на кількість годин.', solution: times(k, m), nums: [k, m] };
  }],
  [10, 'timesMore', () => {
    const k = randInt(4, 9); const m = randInt(2, 5);
    return { text: `На першій грядці росте ${k} кущів полуниці, а на другій — у ${count(m, TIMES)} більше. Скільки кущів на двох грядках разом?`,
      scene: [chip('🍓', k), chip('🍓', `у ${count(m, TIMES)} більше`), ASK], answer: k + k * m,
      how: `«У ${count(m, TIMES)} більше» — це множення: ${times(k, m)}. Потім додай першу грядку.`, solution: `${times(k, m)}, а ${plus(k, k * m)}`, nums: [k, m] };
  }],
];

/** Path length: one step per level of difficulty. */
export const WORD_PROBLEM_STEPS = Math.max(...TEMPLATES.map(([level]) => level));
/** How many kinds of problem exist (each has many variants). */
export const WORD_PROBLEM_KINDS = TEMPLATES.length;

/**
 * «Задачі» (UI_GRID_CHOICE): a short story with a question, pictured as a row
 * of chips (what is known, what is asked); the child taps the answer. A step
 * asks the problem kinds of its own level — earlier levels return through the
 * shell's recall draw (`core/game/engine/recall`).
 */
export function generateWordProblem(config: TaskConfig): TaskInstance<GridChoicePayload> {
  const { step } = config;
  const level = Math.min(WORD_PROBLEM_STEPS, Math.max(1, step));
  const [, id, make] = pick(TEMPLATES.filter(([l]) => l === level));
  const problem = make();
  return {
    id: uid('wp'),
    key: `wp:${id}:${problem.nums.join(',')}`,
    prompt: problem.text,
    reward: rewardForStep(step) + 1,
    outro: `Так! ${problem.solution[0].toUpperCase()}${problem.solution.slice(1)}.`,
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
