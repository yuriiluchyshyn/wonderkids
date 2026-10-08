import type { Gender } from '@/core/lang/uk';
import { num, say, type NumCase } from '@/core/lang/numbers';
import { pick, randInt, shuffle } from '@/core/utils/random';
import type { Clue, ClueCell } from '@/core/game/templates/types';

/**
 * «Логічні задачі» — little stories that are solved by thinking, not by
 * counting: who is the tallest, who sits in the middle, what day comes after
 * tomorrow, how many cuts make five pieces. Like the story problems of Math,
 * a riddle is a FRAME told in one of its SKINS; a frame with a skin is one
 * KIND, the path opens three new kinds a step (150 over fifty steps), and the
 * names, things and numbers of a kind change on every draw.
 *
 * Numbers go through `num` (`core/lang/numbers`), so the voice says them in
 * the right gender and case.
 */

/** An answer on the board. */
export interface Answer {
  id: string;
  label: string;
  emoji?: string;
}

export interface Riddle {
  /** What makes this draw different from another of its kind. */
  variant: string;
  text: string;
  /** A number to find, or the cards to choose from with the id of the right one. */
  answer: number | { options: Answer[]; correct: string };
  /** What to think about, said after mistakes. */
  how: string;
  /** The same thought as a picture: the story's clues laid out, the answer left to the child. */
  clue: Clue;
  /** A picture above the answers. */
  emoji?: string;
}

/** `r` is how far along its band of steps a kind stands, 0…1: the riddle grows with it. */
type Make = (r: number) => Riddle;

const N = (n: number, g: Gender = 'm', c: NumCase = 'nom') => num(n, g, c);
const grow = (r: number, from: number, to: number) => Math.round(from + (to - from) * r);
const cap = (text: string) => text.charAt(0).toLocaleUpperCase('uk') + text.slice(1);
const cards = (labels: readonly (string | [string, string])[], right: string) => ({
  options: shuffle(labels.map((l): Answer => (typeof l === 'string' ? { id: l, label: cap(l) } : { id: l[0], label: cap(l[0]), emoji: l[1] }))),
  correct: right,
});

// Clue pictures. Numbers in them are plain digits: a picture is looked at, not read out.
const one = (cells: ClueCell[], more: Omit<Clue, 'rows'> = {}): Clue => ({ rows: [{ cells }], ...more });
const times = (n: number, glyph: string): ClueCell[] => Array.from({ length: n }, () => ({ glyph }));
/** Stations of a chain: [what stands there, its caption, the step that leads to it]. */
const line = (parts: [string | number, string?, string?][], asked = parts.length - 1): ClueCell[] =>
  parts.map(([glyph, note, link], i) => ({ glyph: String(glyph), note, link, mark: i === asked }));
const signed = (d: number) => (d > 0 ? `+${d}` : `−${-d}`);

/** Children of a story: nominative and the form after «за» / «від» / «у». */
const BOYS: [string, string][] = [['Тарас', 'Тараса'], ['Марко', 'Марка'], ['Остап', 'Остапа'], ['Назар', 'Назара'], ['Данило', 'Данила'], ['Максим', 'Максима'], ['Андрій', 'Андрія'], ['Василь', 'Василя']];
const GIRLS: [string, string][] = [['Оля', 'Олю'], ['Софія', 'Софію'], ['Злата', 'Злату'], ['Леся', 'Лесю'], ['Марійка', 'Марійку'], ['Соломія', 'Соломію'], ['Ганнуся', 'Ганнусю'], ['Даринка', 'Даринку']];

// ====================================================================== Band 1
// Steps 1–10: one thought is enough.

/** «або … або»: everything but one is ruled out. */
const ONE_OF: [string, string, [string, string][]][] = [
  ['У коробці лежить', 'Що лежить у коробці?', [['м’яч', '⚽'], ['лялька', '🪆'], ['кубик', '🧱'], ['машинка', '🚗']]],
  ['У кошику лежить', 'Що лежить у кошику?', [['яблуко', '🍎'], ['груша', '🍐'], ['банан', '🍌'], ['лимон', '🍋']]],
  ['У будці сховався', 'Хто сховався в будці?', [['кіт', '🐱'], ['пес', '🐶'], ['їжак', '🦔'], ['кролик', '🐇']]],
  ['На тарілці лежить', 'Що лежить на тарілці?', [['булочка', '🥐'], ['пиріжок', '🥟'], ['млинець', '🥞'], ['бублик', '🥯']]],
  ['У пеналі лежить', 'Що лежить у пеналі?', [['олівець', '✏️'], ['ручка', '🖊️'], ['пензлик', '🖌️'], ['лінійка', '📏']]],
  ['За дверима стоїть', 'Хто стоїть за дверима?', [['тато', '👨'], ['мама', '👩'], ['дідусь', '👴'], ['бабуся', '👵']]],
  ['У шафі висить', 'Що висить у шафі?', [['куртка', '🧥'], ['сукня', '👗'], ['сорочка', '👔'], ['шарф', '🧣']]],
  ['У гаражі стоїть', 'Що стоїть у гаражі?', [['велосипед', '🚲'], ['самокат', '🛴'], ['мотоцикл', '🏍️'], ['трактор', '🚜']]],
  ['На гілці сидить', 'Хто сидить на гілці?', [['сова', '🦉'], ['папуга', '🦜'], ['білка', '🐿️'], ['ворона', '🐦‍⬛']]],
  ['У подарунку лежить', 'Що лежить у подарунку?', [['книжка', '📕'], ['робот', '🤖'], ['пазл', '🧩'], ['ведмедик', '🧸']]],
];
const oneOf = ([lies, ask, things]: (typeof ONE_OF)[number]): Make => (r) => {
  const set = shuffle(things).slice(0, r < 0.5 ? 3 : 4);
  const [right, ...out] = shuffle(set);
  return {
    variant: `${set.map((t) => t[0]).sort().join('+')}=${right[0]}`,
    text: `${lies} ${set.slice(0, -1).map((t) => t[0]).join(', ')} або ${set[set.length - 1][0]}. Це ${out.slice(0, -1).map((t) => `не ${t[0]}`).join(', ')}${out.length > 1 ? ' і ' : ''}не ${out[out.length - 1][0]}. ${ask}`,
    answer: cards(set, right[0]),
    how: `Викресли те, чого там немає: ${out.map((t) => t[0]).join(', ')}. Лишається одне.`,
    clue: one(set.map((t) => ({ glyph: t[1], note: t[0], crossed: out.includes(t) }))),
  };
};

/** Three in a row: who is in the middle, who at an end. */
const ROWS_OF_THREE: [verb: string, what: string, three: [string, string, string][]][] = [
  ['сидить', 'Хто', [['кіт', 'кота', '🐱'], ['пес', 'пса', '🐶'], ['миша', 'миші', '🐭']]],
  ['стоїть', 'Хто', [['слон', 'слона', '🐘'], ['жирафа', 'жирафи', '🦒'], ['зебра', 'зебри', '🦓']]],
  ['сидить', 'Хто', [['сова', 'сови', '🦉'], ['папуга', 'папуги', '🦜'], ['голуб', 'голуба', '🕊️']]],
  ['пливе', 'Хто', [['качка', 'качки', '🦆'], ['лебідь', 'лебедя', '🦢'], ['жаба', 'жаби', '🐸']]],
  ['лежить', 'Хто', [['лев', 'лева', '🦁'], ['тигр', 'тигра', '🐯'], ['ведмідь', 'ведмедя', '🐻']]],
  ['стоїть', 'Хто', [['корова', 'корови', '🐄'], ['кінь', 'коня', '🐴'], ['вівця', 'вівці', '🐑']]],
  ['сидить', 'Хто', [['їжак', 'їжака', '🦔'], ['білка', 'білки', '🐿️'], ['заєць', 'зайця', '🐇']]],
  ['стоїть', 'Що', [['робот', 'робота', '🤖'], ['лялька', 'ляльки', '🪆'], ['ведмедик', 'ведмедика', '🧸']]],
  ['росте', 'Що', [['дуб', 'дуба', '🌳'], ['ялинка', 'ялинки', '🌲'], ['пальма', 'пальми', '🌴']]],
  ['стоїть', 'Що', [['автобус', 'автобуса', '🚌'], ['трамвай', 'трамвая', '🚋'], ['вантажівка', 'вантажівки', '🚚']]],
];
const rowOfThree = ([verb, what, three]: (typeof ROWS_OF_THREE)[number]): Make => (r) => {
  const [left, middle, right] = shuffle(three);
  const asks: [string, string][] = [['посередині', middle[0]], ...(r >= 0.4 ? ([['скраю ліворуч', left[0]], ['скраю праворуч', right[0]]] as [string, string][]) : [])];
  const [where, who] = pick(asks);
  // Told in either order, so the middle one is not always named second.
  const told = Math.random() < 0.5
    ? `${cap(left[0])} ${verb} ліворуч від ${middle[1]}, а ${right[0]} — праворуч від ${middle[1]}.`
    : `${cap(right[0])} ${verb} праворуч від ${middle[1]}, а ${left[0]} — ліворуч від ${middle[1]}.`;
  return {
    variant: `${left[0]}|${middle[0]}|${right[0]}:${where}`,
    text: `${told} ${what} ${verb} ${where}?`,
    answer: cards(three.map((t): [string, string] => [t[0], t[2]]), who),
    how: `Постав їх у ряд у думках: ліворуч — ${left[0]}, далі — ${middle[0]}, праворуч — ${right[0]}.`,
    clue: one([left, middle, right].map((t) => ({ glyph: t[2], note: t[0] })), { ends: ['ліворуч', 'праворуч'] }),
  };
};

/** «вищий за», «вища за» — and how the first and the last of the row are asked about. */
const COMPARE: [string, string, string, string, string, string][] = [
  ['вищий', 'вища', 'найвищий', 'найвища', 'найнижчий', 'найнижча'], ['старший', 'старша', 'найстарший', 'найстарша', 'наймолодший', 'наймолодша'],
  ['сильніший', 'сильніша', 'найсильніший', 'найсильніша', 'найслабший', 'найслабша'], ['швидший', 'швидша', 'найшвидший', 'найшвидша', 'найповільніший', 'найповільніша'],
  ['важчий', 'важча', 'найважчий', 'найважча', 'найлегший', 'найлегша'], ['веселіший', 'веселіша', 'найвеселіший', 'найвеселіша', 'найсумніший', 'найсумніша'],
  ['спритніший', 'спритніша', 'найспритніший', 'найспритніша', 'найменш спритний', 'найменш спритна'], ['сміливіший', 'сміливіша', 'найсміливіший', 'найсміливіша', 'найменш сміливий', 'найменш смілива'],
  ['терплячіший', 'терплячіша', 'найтерплячіший', 'найтерплячіша', 'найменш терплячий', 'найменш терпляча'], ['уважніший', 'уважніша', 'найуважніший', 'найуважніша', 'найменш уважний', 'найменш уважна'],
];
/** A row of `size` children, the first being "the most": told link by link, asked about an end. */
const chain = (size: 3 | 4) => ([m, f, topM, topF, lowM, lowF]: (typeof COMPARE)[number]): Make => (r) => {
  const girls = Math.random() < 0.5;
  const row = shuffle(girls ? GIRLS : BOYS).slice(0, size);
  const more = girls ? f : m;
  const links = row.slice(0, -1).map((who, i) => `${who[0]} ${more} за ${row[i + 1][1]}`);
  // Further along the path the links are told out of order, and the last of the row is asked for too.
  const told = r >= 0.5 ? shuffle(links) : links;
  const low = r >= 0.3 && Math.random() < 0.5;
  return {
    variant: `${row.map((w) => w[0]).join('>')}:${low ? 'low' : 'top'}:${told[0]}`,
    text: `${told.slice(0, -1).join(', ')}, а ${told[told.length - 1]}. Хто ${low ? (girls ? lowF : lowM) : girls ? topF : topM}?`,
    answer: cards(row.map((w) => w[0]), low ? row[size - 1][0] : row[0][0]),
    how: `Вишикуй їх у ряд: ${row.map((w) => w[0]).join(', ')}. Перше ім’я — ${girls ? topF : topM}, останнє — ${girls ? lowF : lowM}.`,
    // A staircase: whoever is "more" stands on the higher step.
    clue: one(row.map((w, i) => ({ glyph: girls ? '👧' : '👦', note: w[0], level: size - i }))),
  };
};

// ====================================================================== Band 2
// Steps 11–20: a rule to notice, a thing to count.

/** «Яке число буде наступним?» — the rule and what it does to the number before. */
/** `by` — the step when it is not a plain plus or minus; `pairs` — two rows woven into one. */
const RULES: [string, (r: number) => { row: number[]; next: number; rule: string; by?: string; pairs?: boolean }][] = [
  ['+k', (r) => { const k = pick([2, 5, 10].slice(0, grow(r, 2, 3))); const a = randInt(1, 9); return { row: [0, 1, 2, 3].map((i) => a + k * i), next: a + k * 4, rule: `щоразу додається ${N(k)}` }; }],
  ['-k', (r) => { const k = randInt(1, grow(r, 2, 4)); const a = randInt(20, 40); return { row: [0, 1, 2, 3].map((i) => a - k * i), next: a - k * 4, rule: `щоразу віднімається ${N(k)}` }; }],
  ['+3', () => { const k = pick([3, 4]); const a = randInt(1, 10); return { row: [0, 1, 2, 3].map((i) => a + k * i), next: a + k * 4, rule: `щоразу додається ${N(k)}` }; }],
  ['x2', () => { const a = randInt(1, 4); return { row: [a, a * 2, a * 4, a * 8], next: a * 16, rule: 'кожне число вдвічі більше за попереднє', by: '×2' }; }],
  ['grow', () => { const a = randInt(1, 6); const row = [a, a + 1, a + 3, a + 6]; return { row, next: a + 10, rule: 'спочатку додається один, потім два, потім три, а далі — чотири' }; }],
  ['alt', () => { const a = randInt(1, 9); const k = randInt(2, 4); const j = randInt(5, 7); return { row: [a, a + k, a + k + j, a + 2 * k + j, a + 2 * k + 2 * j], next: a + 3 * k + 2 * j, rule: `додається то ${N(k)}, то ${N(j)} — по черзі` }; }],
  ['half', () => { const a = pick([48, 64, 80, 96]); return { row: [a, a / 2, a / 4], next: a / 8, rule: 'кожне число вдвічі менше за попереднє', by: ':2' }; }],
  ['two', () => { const a = randInt(1, 5); const b = randInt(10, 15); return { row: [a, b, a + 1, b + 1, a + 2], next: b + 2, rule: 'тут переплелися два ряди — дивись через одне число', pairs: true }; }],
  ['x3', () => { const a = randInt(1, 3); return { row: [a, a * 3, a * 9], next: a * 27, rule: 'кожне число втричі більше за попереднє', by: '×3' }; }],
  ['-grow', () => { const a = randInt(30, 50); return { row: [a, a - 1, a - 3, a - 6], next: a - 10, rule: 'спочатку віднімається один, потім два, потім три, а далі — чотири' }; }],
];
const sequence = ([, make]: (typeof RULES)[number]): Make => (r) => {
  const { row, next, rule, by, pairs } = make(r);
  // The step is written on every arrow but the last; of two woven rows, the one being asked about is lit.
  const cells: ClueCell[] = row.map((n, i) => ({ glyph: String(n), link: i === 0 || pairs ? undefined : by ?? signed(n - row[i - 1]), mark: pairs && i % 2 === 1 }));
  return { variant: row.join(','), text: `Яке число буде наступним? ${row.join(', ')}, …`, answer: next, how: `Розгадай правило: ${rule}.`,
    clue: { rows: [{ cells: [...cells, { glyph: '?', mark: true, link: pairs ? undefined : '→' }] }], dense: row.length > 4 } };
};

/** Standing in a line. `both`: the place is told from both ends. */
const QUEUES: [string, string, string, boolean][] = [
  ['Марко стоїть у черзі по морозиво', 'людей', 'Скільки всього людей у черзі?', false], ['Оля стоїть у шерензі на фізкультурі', 'дітей', 'Скільки всього дітей у шерензі?', false],
  ['Червоний вагон їде в потязі', 'вагонів', 'Скільки всього вагонів у потязі?', false], ['Синя машина стоїть у заторі', 'машин', 'Скільки всього машин у заторі?', false],
  ['Леся стоїть у черзі до каси', 'людей', 'Скільки всього людей у черзі?', false],
  ['У черзі по квитки Тарас', 'Скільки всього людей у черзі?', '', true], ['У шерензі Назар', 'Скільки всього дітей у шерензі?', '', true],
  ['У ряду книжок на полиці словник', 'Скільки всього книжок у ряду?', '', true], ['У потязі вагон-ресторан', 'Скільки всього вагонів у потязі?', '', true],
  ['У колоні мурах найбільший мураш', 'Скільки всього мурах у колоні?', '', true],
];
const queue = ([who, x, y, both]: (typeof QUEUES)[number]): Make => (r) => {
  // «5 людей», never «3 людей»: told as a count, there are five or more on each side.
  const a = both ? randInt(2, grow(r, 4, 8)) : randInt(5, grow(r, 6, 9)); const b = both ? randInt(2, grow(r, 4, 8)) : randInt(5, grow(r, 6, 9));
  // The whole line as dots, the one the story is about in another colour.
  const clue: Clue = { rows: [{ cells: [...times(a, '🔵'), { glyph: '🔴', mark: true }, ...times(b, '🔵')] }], ends: ['попереду', 'позаду'], dense: true };
  if (both) {
    return { clue, variant: `${a}:${b}`, text: `${who} — ${ordinal(a + 1)} спереду і ${ordinal(b + 1)} ззаду. ${x}`, answer: a + b + 1,
      how: `Перед ним — ${N(a)}, за ним — ${N(b)}. Додай їх і не забудь його самого: його порахуй один раз, а не двічі.` };
  }
  return { clue, variant: `${a}:${b}`, text: `${who}. Попереду — ${N(a)} ${x}, позаду — ${N(b)}. ${y}`, answer: a + b + 1,
    how: `Додай тих, хто попереду, і тих, хто позаду: ${N(a)} і ${N(b)}. І не забудь порахувати ще одного — того, про кого йдеться.` };
};
const ORDINALS = ['', 'перший', 'другий', 'третій', 'четвертий', 'п’ятий', 'шостий', 'сьомий', 'восьмий', 'дев’ятий', 'десятий'];
/** Shown «3-й», said «третій». */
const ordinal = (n: number) => say(`${n}-й`, ORDINALS[n]);

/** Legs, wheels, wings: two kinds of creatures with a different number each. */
const LEGS: [string, string, number, string, number, string, string][] = [
  ['У дворі гуляють', 'курей', 2, 'собак', 4, 'Скільки в них разом ніг?', '🐔🐶'], ['На лузі пасуться', 'гусей', 2, 'корів', 4, 'Скільки в них разом ніг?', '🪿🐄'],
  ['На подвір’ї стоять', 'півнів', 2, 'коней', 4, 'Скільки в них разом ніг?', '🐓🐴'], ['Біля хати сидять', 'голубів', 2, 'котів', 4, 'Скільки в них разом лап і ніжок?', '🕊️🐱'],
  ['На галявині зустрілися', 'качок', 2, 'овець', 4, 'Скільки в них разом ніг?', '🦆🐑'], ['На стоянці стоять', 'велосипедів', 2, 'машин', 4, 'Скільки в них разом коліс?', '🚲🚗'],
  ['У дворі стоять', 'самокатів', 2, 'триколісних велосипедів', 3, 'Скільки в них разом коліс?', '🛴'], ['У кімнаті стоять', 'табуреток на трьох ніжках', 3, 'стільців на чотирьох', 4, 'Скільки в них разом ніжок?', '🪑'],
  ['На квітці сидять', 'жуків', 6, 'пташок', 2, 'Скільки в них разом ніжок?', '🐞🐦'], ['У кутку зібралися', 'павуків', 8, 'мух', 6, 'Скільки в них разом ніжок?', '🕷️🪰'],
];
const legs = ([where, x, legsX, y, legsY, ask, emoji]: (typeof LEGS)[number]): Make => (r) => {
  const a = randInt(5, grow(r, 5, 6)); const b = randInt(5, grow(r, 5, 7));
  return { variant: `${a}:${b}`, emoji, text: `${where} ${N(a)} ${x} і ${N(b)} ${y}. ${ask}`, answer: a * legsX + b * legsY,
    how: `Порахуй окремо: ${N(a)} по ${N(legsX)} і ${N(b)} по ${N(legsY)}. Потім додай.`,
    // One number a creature: how many legs (wheels) it brings.
    clue: { rows: [{ label: cap(x), cells: times(a, String(legsX)) }, { label: cap(y), cells: times(b, String(legsY)) }], dense: true } };
};

// ====================================================================== Band 3
// Steps 21–30: days, cuts, what repeats.

const DAYS: [string, Gender][] = [['понеділок', 'm'], ['вівторок', 'm'], ['середа', 'f'], ['четвер', 'm'], ['п’ятниця', 'f'], ['субота', 'f'], ['неділя', 'f']];
const day = (i: number) => DAYS[((i % 7) + 7) % 7];
const DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const was = (d: [string, Gender]) => (d[1] === 'f' ? 'була' : 'був');
/** [what is told about today (offset of the day that is named), what is asked (offset from today)]. */
const DAY_ASKS: [number, string, number, string][] = [
  [0, 'Сьогодні', 1, 'Який день тижня буде завтра?'], [0, 'Сьогодні', -1, 'Який день тижня був учора?'], [0, 'Сьогодні', 2, 'Який день тижня буде післязавтра?'],
  [0, 'Сьогодні', -2, 'Який день тижня був позавчора?'], [0, 'Сьогодні', 3, 'Який день тижня буде через три дні?'], [0, 'Сьогодні', 5, 'Який день тижня буде через п’ять днів?'],
  [1, 'Завтра буде', -1, 'Який день тижня був учора?'], [-1, 'Учора', 1, 'Який день тижня буде завтра?'], [-2, 'Позавчора', 0, 'Який день тижня сьогодні?'], [2, 'Післязавтра буде', 0, 'Який день тижня сьогодні?'],
];
const days = ([named, told, asked, ask]: (typeof DAY_ASKS)[number]): Make => () => {
  const today = randInt(0, 6);
  const given = day(today + named);
  const right = day(today + asked);
  const tells = named < 0 ? `${told} ${was(given)} ${given[0]}.` : `${told} ${given[0]}.`;
  const others = shuffle(DAYS.filter((d) => d[0] !== right[0])).slice(0, 5);
  return { variant: `${today}`, emoji: '📅', text: `${tells} ${ask}`, answer: cards([right, ...others].map((d) => d[0]), right[0]),
    how: `Назви дні по порядку: ${DAYS.map((d) => d[0]).join(', ')}. Спочатку знайди, який день сьогодні, а тоді відлічи потрібний.`,
    // Seven days in a row that hold both the day named and the day asked for; only the named one is signed.
    clue: one(Array.from({ length: 7 }, (_, i) => {
      const at = Math.min(named, asked, 0) + i;
      return { glyph: DAYS_SHORT[(((today + at) % 7) + 7) % 7], ...(at === named ? { mark: true, note: told.replace(' буде', '').toLocaleLowerCase('uk') } : {}) };
    }), { dense: true }) };
};

/** Cuts and pieces, posts and gaps: one more of one than of the other. */
const CUTS: [string, string, string, string, 'cuts' | 'pieces'][] = [
  ['Колоду розпиляли на', 'частин', 'Скільки зробили розпилів?', '🪵', 'cuts'], ['Мотузку розрізали на', 'шматків', 'Скільки зробили розрізів?', '🪢', 'cuts'],
  ['Багет розрізали на', 'шматків', 'Скільки зробили розрізів?', '🥖', 'cuts'], ['Стрічку розрізали на', 'частин', 'Скільки зробили розрізів?', '🎀', 'cuts'],
  ['Уздовж доріжки в один ряд посадили', 'дерев', 'Скільки проміжків між ними?', '🌳', 'cuts'],
  ['На дошці зробили', 'розпилів', 'На скільки частин розпалася дошка?', '🪚', 'pieces'], ['На ковбасі зробили', 'розрізів', 'Скільки вийшло шматків?', '🌭', 'pieces'],
  ['На дроті зробили', 'розрізів', 'Скільки вийшло шматків дроту?', '✂️', 'pieces'], ['На шоколадному батончику зробили', 'розламів', 'Скільки вийшло шматочків?', '🍫', 'pieces'],
  ['Між стовпами паркану', 'проміжків', 'Скільки стовпів у паркані?', '🚧', 'pieces'],
];
const cuts = ([told, what, ask, emoji, find]: (typeof CUTS)[number]): Make => (r) => {
  const n = randInt(5, grow(r, 6, 12));
  // The thing itself, piece by piece, with a mark wherever it was cut (or a gap between trees and posts).
  const gaps = emoji === '🌳' || emoji === '🚧';
  const piece = emoji === '🌳' ? '🌳' : emoji === '🚧' ? '🪵' : '🟫';
  const clue: Clue = { rows: [{ cells: times(find === 'cuts' ? n : n + 1, piece).map((cell, i) => ({ ...cell, link: i ? (gaps ? '↔' : '✂️') : undefined })) }], dense: true };
  return { clue, variant: `${n}`, emoji, text: `${told} ${N(n)} ${what}. ${ask}`, answer: find === 'cuts' ? n - 1 : n + 1,
    how: `Спробуй на малому: щоб вийшло два шматки, потрібен один розріз, а щоб три — два розрізи. Так само з деревами і проміжками між ними. ${find === 'cuts' ? 'Тут відповідь на один менша.' : 'Тут відповідь на один більша.'}` };
};

/** Something repeats: what will stand in the n-th place. */
const REPEATS: [string, string, [string, string][]][] = [
  ['Намистинки на нитці йдуть так', 'намистинка', [['червона', '🔴'], ['синя', '🔵'], ['жовта', '🟡']]], ['Прапорці на гірлянді висять так', 'прапорець', [['зелений', '🟢'], ['жовтий', '🟡'], ['синій', '🔵']]],
  ['Кульки на святі висять так', 'кулька', [['червона', '🔴'], ['біла', '⚪'], ['синя', '🔵']]], ['Плитки на підлозі лежать так', 'плитка', [['чорна', '⚫'], ['біла', '⚪'], ['сіра', '🩶']]],
  ['Кубики у вежі стоять так', 'кубик', [['жовтий', '🟡'], ['червоний', '🔴'], ['зелений', '🟢']]], ['Ліхтарики на ялинці горять так', 'ліхтарик', [['синій', '🔵'], ['жовтий', '🟡'], ['червоний', '🔴']]],
  ['Квіти на клумбі ростуть так', 'квітка', [['біла', '⚪'], ['жовта', '🟡'], ['фіолетова', '🟣']]], ['Вагончики в потязі їдуть так', 'вагончик', [['зелений', '🟢'], ['синій', '🔵'], ['помаранчевий', '🟠']]],
  ['Смужки на шарфі йдуть так', 'смужка', [['червона', '🔴'], ['жовта', '🟡'], ['зелена', '🟢']]], ['Ґудзики на стрічці пришиті так', 'ґудзик', [['чорний', '⚫'], ['червоний', '🔴'], ['білий', '⚪']]],
];
const ORDINAL_F = ['', 'перша', 'друга', 'третя', 'четверта', 'п’ята', 'шоста', 'сьома', 'восьма', 'дев’ята', 'десята', 'одинадцята', 'дванадцята', 'тринадцята', 'чотирнадцята', 'п’ятнадцята'];
const ORDINAL_M = ['', 'перший', 'другий', 'третій', 'четвертий', 'п’ятий', 'шостий', 'сьомий', 'восьмий', 'дев’ятий', 'десятий', 'одинадцятий', 'дванадцятий', 'тринадцятий', 'чотирнадцятий', 'п’ятнадцятий'];
const repeats = ([told, thing, colours]: (typeof REPEATS)[number]): Make => (r) => {
  const period = r < 0.5 ? 2 : 3;
  const unit = shuffle(colours).slice(0, period);
  const place = randInt(period * 2 + 1, grow(r, 9, 15));
  const right = unit[(place - 1) % period];
  const fem = thing.endsWith('а');
  const nth = say(`${place}-${fem ? 'ю' : 'м'}`, (fem ? ORDINAL_F : ORDINAL_M)[place].replace(/а$/, 'ою').replace(/я$/, 'ьою').replace(/ий$/, 'им').replace(/ій$/, 'ім'));
  return { variant: `${unit.map((c) => c[0]).join('-')}:${place}`, emoji: [...unit, ...unit].map((c) => c[1]).join('') + '…',
    text: `${told}: ${[...unit, ...unit].map((c) => c[0]).join(', ')} — і так далі. Якого кольору буде ${thing}, що йде ${nth}?`,
    answer: cards(colours, right[0]),
    how: `Кольори повторюються по ${N(period)}. Рахуй по колу: ${unit.map((c) => c[0]).join(', ')} — і знову спочатку, аж до потрібного місця.`,
    // Every place up to the asked one, numbered; the colours told are filled in, the rest are for the child.
    clue: one(Array.from({ length: place }, (_, i) => ({ glyph: i < period * 2 ? unit[i % period][1] : i === place - 1 ? '?' : '▢', note: String(i + 1), mark: i === place - 1 })), { dense: true }) };
};

// ====================================================================== Band 4
// Steps 31–40: two thoughts in a row.

/** «раніше за», «пізніше за»: who was first. */
const RACES = ['прибіг до фінішу', 'прокинувся', 'прийшов до школи', 'закінчив малюнок', 'доїв сніданок', 'зібрав пазл', 'доплив до берега', 'заліз на гірку', 'розв’язав задачу', 'ліг спати'];
const race = (did: string): Make => (r) => {
  const [first, second, third] = shuffle(BOYS).slice(0, 3);
  const last = r >= 0.4 && Math.random() < 0.5;
  const told = pick([
    `${second[0]} ${did} раніше за ${third[1]}, але пізніше за ${first[1]}`,
    `${second[0]} ${did} пізніше за ${first[1]}, але раніше за ${third[1]}`,
    `${first[0]} ${did} раніше за ${second[1]}, а ${third[0]} — пізніше за ${second[1]}`,
  ]);
  return { variant: `${first[0]}>${second[0]}>${third[0]}:${last}:${told.length}`, text: `${told}. Хто ${did} ${last ? 'останнім' : 'першим'}?`,
    answer: cards([first[0], second[0], third[0]], last ? third[0] : first[0]),
    how: `Розстав їх за часом: спершу ${first[0]}, потім ${second[0]}, останнім — ${third[0]}.`,
    clue: one([first, second, third].map((k, i) => ({ glyph: '👦', note: k[0], link: i ? '→' : undefined })), { ends: ['раніше', 'пізніше'] }) };
};

/** «на 2 більше, ніж у…» twice over. */
const HAVE: [string, string, string, Gender][] = [
  ['яблука', 'яблук', '🍎', 'n'], ['наліпки', 'наліпок', '⭐', 'f'], ['горіхи', 'горіхів', '🌰', 'm'], ['кульки', 'кульок', '🎈', 'f'], ['олівці', 'олівців', '✏️', 'm'],
  ['цукерки', 'цукерок', '🍬', 'f'], ['мушлі', 'мушель', '🐚', 'f'], ['марки', 'марок', '📮', 'f'], ['кубики', 'кубиків', '🧱', 'm'], ['монети', 'монет', '🪙', 'f'],
];
const more = ([, many, emoji, g]: (typeof HAVE)[number]): Make => (r) => {
  // «5 наліпок»: the known amount is five or more, so one form of the word fits every draw.
  const c = randInt(5, 9); const b = randInt(2, grow(r, 3, 6)); const a = randInt(2, grow(r, 3, 6));
  const fewer = r >= 0.5 && Math.random() < 0.5;
  return { variant: `${c}:${b}:${a}:${fewer}`, emoji,
    text: fewer
      ? `У Лесі ${N(c + a + b, g)} ${many}. У Тараса на ${N(b, g)} менше, ніж у Лесі, а в Олі на ${N(a, g)} менше, ніж у Тараса. Скільки ${many} в Олі?`
      : `У Лесі ${N(c, g)} ${many}. У Тараса на ${N(b, g)} більше, ніж у Лесі, а в Олі на ${N(a, g)} більше, ніж у Тараса. Скільки ${many} в Олі?`,
    answer: fewer ? c : c + b + a,
    how: 'Іди ланцюжком: спочатку дізнайся, скільки в Тараса, а тоді — скільки в Олі.',
    clue: one(line([[fewer ? c + a + b : c, 'Леся'], ['?', 'Тарас', signed(fewer ? -b : b)], ['?', 'Оля', signed(fewer ? -a : a)]])) };
};

/** Brothers, sisters and years. */
const FAMILY: Make[] = [
  (r) => { const a = randInt(1, grow(r, 2, 4)); const b = randInt(1, grow(r, 2, 4)); return { variant: `${a}:${b}`, emoji: '👨‍👩‍👧‍👦', text: `У Марка ${N(a, 'f')} ${a === 1 ? 'сестра' : a < 5 ? 'сестри' : 'сестер'} і ${N(b, 'm')} ${b === 1 ? 'брат' : b < 5 ? 'брати' : 'братів'}. Скільки всього дітей у цій сім’ї?`, answer: a + b + 1, how: 'Порахуй сестер, братів — і не забудь самого Марка.', clue: one([...times(a, '👧'), ...times(b, '👦'), { glyph: '👦', note: 'Марко', mark: true }], { dense: true }) }; },
  (r) => { const k = randInt(2, grow(r, 3, 6)); return { variant: `${k}`, emoji: '👨‍👩‍👧‍👦', text: `У сім’ї ${N(k)} ${k < 5 ? 'брати' : 'братів'}. У кожного з них є одна сестра. Скільки всього дітей у сім’ї?`, answer: k + 1, how: 'Сестра в усіх братів одна й та сама. Порахуй братів і додай її одну.', clue: one([...times(k, '👦'), { glyph: '👧', note: 'сестра', mark: true }], { dense: true }) }; },
  (r) => { const k = randInt(2, grow(r, 3, 6)); return { variant: `${k}`, emoji: '👨‍👩‍👧‍👦', text: `У сім’ї ${N(k, 'f')} ${k < 5 ? 'сестри' : 'сестер'}. У кожної з них є один брат. Скільки всього дітей у сім’ї?`, answer: k + 1, how: 'Брат у всіх сестер один і той самий. Порахуй сестер і додай його одного.', clue: one([...times(k, '👧'), { glyph: '👦', note: 'брат', mark: true }], { dense: true }) }; },
  (r) => { const n = randInt(2, grow(r, 2, 4)); return { variant: `${n}`, emoji: '👨‍👩‍👧‍👦', text: `В Олі братів стільки само, скільки й сестер: і тих, і тих — по ${N(n)}. Скільки всього дітей у цій сім’ї?`, answer: n * 2 + 1, how: 'Порахуй братів, стільки ж сестер — і не забудь саму Олю.', clue: one([...times(n, '👦'), ...times(n, '👧'), { glyph: '👧', note: 'Оля', mark: true }], { dense: true }) }; },
  (r) => { const k = randInt(2, grow(r, 3, 5)); return { variant: `${k}`, emoji: '👨‍👩‍👧‍👦', text: `У бабусі ${N(k, 'f')} ${k < 5 ? 'доньки' : 'доньок'}. У кожної доньки — по двоє дітей. Скільки онуків у бабусі?`, answer: k * 2, how: 'У кожної доньки двоє дітей. Порахуй по двоє стільки разів, скільки доньок.', clue: { rows: Array.from({ length: k }, () => ({ cells: [{ glyph: '👩' }, { glyph: '🧒', link: '→' }, { glyph: '🧒' }] })), dense: true } }; },
];
const AGES: Make[] = [
  () => { const a = randInt(5, 9); const d = randInt(2, 5); return { variant: `${a}:${d}`, emoji: '🎂', text: `Олі ${N(a)} років. Її брат на ${N(d)} ${d < 5 ? 'роки' : 'років'} старший. Скільки років братові?`, answer: a + d, how: '«Старший» — означає, що років більше. Додай.', clue: one(line([[a, 'Оля'], ['?', 'брат', signed(d)]])) }; },
  () => { const a = randInt(6, 10); const d = randInt(2, 4); return { variant: `${a}:${d}`, emoji: '🎂', text: `Через ${N(d)} роки Маркові буде ${N(a + d)} років. Скільки років Маркові зараз?`, answer: a, how: 'Зараз йому менше, ніж буде потім. Відніми роки, які ще не минули.', clue: one(line([['?', 'зараз'], [a + d, 'потім', signed(d)]], 0)) }; },
  () => { const a = randInt(3, 6); return { variant: `${a}`, emoji: '🎂', text: `Сестра вдвічі старша за Олю. Олі ${N(a)} ${a < 5 ? 'роки' : 'років'}. Скільки років сестрі?`, answer: a * 2, how: '«Вдвічі старша» — означає два рази по стільки.', clue: { rows: [{ label: 'Оля', cells: [{ glyph: String(a) }] }, { label: 'Сестра', cells: [{ glyph: String(a) }, { glyph: String(a), link: '+' }] }] } }; },
  () => { const a = randInt(5, 8); const d = randInt(2, 3); const e = randInt(1, 3); return { variant: `${a}:${d}:${e}`, emoji: '🎂', text: `${cap(d === 2 ? 'два' : 'три')} роки тому Данилові було ${N(a - d)} ${a - d < 5 ? 'роки' : 'років'}. Скільки років йому буде через ${N(e)} ${e === 1 ? 'рік' : 'роки'}?`, answer: a + e, how: 'Спочатку дізнайся, скільки йому зараз, а потім додай роки, які ще минуть.', clue: one(line([[a - d, 'тоді'], ['?', 'зараз', signed(d)], ['?', 'потім', signed(e)]])) }; },
  () => { const son = randInt(4, 9); const mum = randInt(27, 36); return { variant: `${son}:${mum}`, emoji: '🎂', text: `Мамі ${N(mum)} років, а синові — ${N(son)}. Скільки років було мамі, коли народився син?`, answer: mum - son, how: 'Коли син народився, мама була молодша рівно на стільки років, скільки зараз синові. Відніми.', clue: { rows: [{ label: 'Син', cells: line([[0, 'тоді'], [son, 'зараз', signed(son)]], -1) }, { label: 'Мама', cells: line([['?', 'тоді'], [mum, 'зараз', signed(son)]], 0) }] } }; },
];

// ====================================================================== Band 5
// Steps 41–50: several clues at once.

/** Three children, three things: who has what. */
const OWNERS: [string, [string, string, string][]][] = [
  ['мають домашніх улюбленців', [['кота', 'кіт', '🐱'], ['пса', 'пес', '🐶'], ['папугу', 'папуга', '🦜']]], ['їдять фрукти', [['яблуко', 'яблуко', '🍎'], ['грушу', 'груша', '🍐'], ['банан', 'банан', '🍌']]],
  ['займаються спортом', [['футбол', 'футбол', '⚽'], ['плавання', 'плавання', '🏊'], ['теніс', 'теніс', '🎾']]], ['грають на інструментах', [['скрипку', 'скрипка', '🎻'], ['барабан', 'барабан', '🥁'], ['гітару', 'гітара', '🎸']]],
  ['отримали подарунки', [['книжку', 'книжка', '📕'], ['робота', 'робот', '🤖'], ['пазл', 'пазл', '🧩']]], ['приїхали до школи', [['велосипед', 'велосипед', '🚲'], ['самокат', 'самокат', '🛴'], ['автобус', 'автобус', '🚌']]],
  ['вдягли шапки', [['червону', 'червона', '🔴'], ['синю', 'синя', '🔵'], ['зелену', 'зелена', '🟢']]], ['малюють', [['будинок', 'будинок', '🏠'], ['дерево', 'дерево', '🌳'], ['корабель', 'корабель', '⛵']]],
  ['замовили напої', [['сік', 'сік', '🧃'], ['чай', 'чай', '🍵'], ['молоко', 'молоко', '🥛']]], ['обрали морозиво', [['шоколадне', 'шоколадне', '🍫'], ['полуничне', 'полуничне', '🍓'], ['ванільне', 'ванільне', '🍦']]],
];
/** «у Тараса», «в Остапа»: «в» before a vowel. */
const at = (whose: string) => `${/^[АЕЄИІЇОУЮЯ]/.test(whose) ? 'в' : 'у'} ${whose}`;
const owners = ([what, things]: (typeof OWNERS)[number]): Make => (r) => {
  // Boys only: «у Тараса» is the same form as «за Тараса».
  const kids = shuffle(BOYS).slice(0, 3);
  // kids[i] has has[i].
  const has = shuffle(things);
  // Further along the path the asked one is found in two moves: first what the other two cannot have.
  const hard = r >= 0.5;
  const asked = hard ? 1 : 0;
  const clues = hard
    ? `${cap(at(kids[0][1]))} — не ${has[1][1]} і не ${has[2][1]}. ${cap(at(kids[2][1]))} — не ${has[1][1]}.`
    : `${cap(at(kids[0][1]))} — не ${has[1][1]} і не ${has[2][1]}.`;
  return { variant: `${kids.map((k) => k[0]).join('+')}:${has.map((t) => t[1]).join('+')}:${asked}`,
    text: `${kids[0][0]}, ${kids[1][0]} і ${kids[2][0]} ${what}. У кожного — своє: ${things.map((t) => t[1]).join(', ')}. ${clues} Що ${at(kids[asked][1])}?`,
    answer: cards(things.map((t): [string, string] => [t[1], t[2]]), has[asked][1]),
    how: hard ? `Спочатку знайди, що ${at(kids[0][1])}: лишається одне. Потім подивись, чого немає ${at(kids[2][1])}, — і дізнаєшся, що лишилося для ${kids[1][1]}.` : 'Викресли те, чого там точно немає. Лишається одне.',
    // A row a child: every thing, with a cross on what the story says is not theirs.
    clue: { rows: kids.map((kid, k) => ({ label: kid[0], cells: things.map((t) => ({ glyph: t[2], crossed: (k === 0 && t !== has[0]) || (hard && k === 2 && t === has[1]) })) })) } };
};

/** Everyone with everyone. */
const MEETINGS: [who: [string, string, string, string], did: string, ask: string, emoji: string, both: boolean][] = [
  [['Троє друзів', 'Четверо друзів', 'П’ятеро друзів', 'Шестеро друзів'], 'зустрілися, і кожен потис руку кожному', 'Скільки було рукостискань?', '🤝', false],
  [['Три команди', 'Чотири команди', 'П’ять команд', 'Шість команд'], 'зіграли між собою: кожна з кожною по одному разу', 'Скільки було матчів?', '⚽', false],
  [['Три міста', 'Чотири міста', 'П’ять міст', 'Шість міст'], 'з’єднали дорогами: між кожними двома містами — своя дорога', 'Скільки доріг збудували?', '🛣️', false],
  [['Три подруги', 'Чотири подруги', 'П’ять подруг', 'Шість подруг'], 'подарували одна одній листівки: кожна — кожній', 'Скільки листівок подаровано?', '💌', true],
  [['Троє шахістів', 'Четверо шахістів', 'П’ятеро шахістів', 'Шестеро шахістів'], 'зіграли між собою: кожен із кожним по одній партії', 'Скільки було партій?', '♟️', false],
];
const meetings = ([who, did, ask, emoji, both]: (typeof MEETINGS)[number]): Make => (r) => {
  const n = randInt(3, grow(r, 4, 6));
  return { variant: `${n}`, emoji, text: `${who[n - 3]} ${did}. ${ask}`, answer: both ? n * (n - 1) : (n * (n - 1)) / 2,
    how: both
      ? 'Кожна дарує листівку всім, крім себе. Порахуй, скільки дарує одна, і помнож на кількість подруг.'
      : `Перший зустрічається з усіма іншими, другий — з усіма, крім першого, і так далі. Додай: ${Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(' + ')}.`,
    // Everyone has a number; a row lists whom that one meets (and has not met in a row above).
    clue: { rows: Array.from({ length: both ? n : n - 1 }, (_, i) => ({ label: `${i + 1} →`, cells: Array.from({ length: n }, (_, j) => j).filter((j) => (both ? j !== i : j > i)).map((j) => ({ glyph: String(j + 1) })) })), dense: true } };
};

/** Every number from `lo` to `hi`; the two ends are crossed — the number lies between them. */
const between = (lo: number, hi: number): Clue =>
  one(Array.from({ length: hi - lo + 1 }, (_, i) => ({ glyph: String(lo + i), crossed: i === 0 || lo + i === hi })), { dense: hi - lo > 5 });

/** A number hidden behind two conditions. */
const HIDDEN: Make[] = [
  () => { const even = randInt(2, 15) * 2; const lo = even - 2; const hi = even + 2; return { variant: `${lo}:${hi}`, emoji: '🔢', text: `Я задумав число. Воно більше за ${N(lo)}, але менше за ${N(hi)}, і воно парне — ділиться на два. Яке це число?`, answer: even, how: `Назви всі числа між ${N(lo)} і ${N(hi)}. Парне серед них — те, що ділиться на два.`, clue: between(lo, hi) }; },
  () => { const odd = randInt(2, 15) * 2 + 1; return { variant: `${odd}`, emoji: '🔢', text: `Я задумав число. Воно більше за ${N(odd - 2)}, але менше за ${N(odd + 2)}, і воно непарне. Яке це число?`, answer: odd, how: `Назви всі числа між ${N(odd - 2)} і ${N(odd + 2)}. Непарне — те, що не ділиться на два порівну.`, clue: between(odd - 2, odd + 2) }; },
  () => { const five = randInt(2, 9) * 5; return { variant: `${five}`, emoji: '🔢', text: `Я задумав число. Воно більше за ${N(five - 3)}, але менше за ${N(five + 4)}, і його можна поділити на п’ять. Яке це число?`, answer: five, how: 'Числа, що діляться на п’ять, закінчуються на нуль або на п’ять.', clue: between(five - 3, five + 4) }; },
  () => { const tens = randInt(1, 8); const ones = randInt(tens + 1, 9); return { variant: `${tens}${ones}`, emoji: '🔢', text: `У двоцифровому числі десятків — ${N(tens)}, а одиниць на ${N(ones - tens)} більше, ніж десятків. Яке це число?`, answer: tens * 10 + ones, how: `Спочатку знайди, скільки одиниць: до ${N(tens, 'm', 'gen')} додай ${N(ones - tens)}. Потім запиши десятки й одиниці поруч.`, clue: one(line([[tens, 'десятки'], ['?', 'одиниці', signed(ones - tens)]])) }; },
  () => { const a = randInt(3, 9); const b = randInt(2, 9); return { variant: `${a}:${b}`, emoji: '🔢', text: `Я задумав число, додав до нього ${N(b)} і отримав стільки само, скільки буде ${N(a)} і ще ${N(a)}. Яке число я задумав?`, answer: a * 2 - b, how: `Спочатку порахуй, скільки вийшло: ${N(a)} і ще ${N(a)}. Потім відніми ${N(b)}.`, clue: one(line([['?', 'задумав'], [`${a} + ${a}`, undefined, `+${b} =`]], 0)) }; },
];

// ======================================================================= Path

/** One kind of riddle: a frame told in one of its skins. */
export interface RiddleKind {
  id: string;
  make: Make;
  /** Where in its band the kind stands, 0…1. */
  r: number;
}
const kindsOf = <S>(name: string, skins: readonly S[], frame: (skin: S) => Make) => skins.map((skin, i) => ({ id: `${name}${i}`, make: frame(skin) }));
const made = (name: string, makes: readonly Make[]) => makes.map((make, i) => ({ id: `${name}${i}`, make }));

/** The bands of the path, easiest first; inside a band a step takes one skin of every frame. */
const BANDS = [
  [kindsOf('one', ONE_OF, oneOf), kindsOf('row', ROWS_OF_THREE, rowOfThree), kindsOf('chain', COMPARE, chain(3))],
  [kindsOf('next', RULES, sequence), kindsOf('queue', QUEUES, queue), kindsOf('legs', LEGS, legs)],
  [kindsOf('day', DAY_ASKS, days), kindsOf('cut', CUTS, cuts), kindsOf('repeat', REPEATS, repeats)],
  [kindsOf('race', RACES, race), kindsOf('more', HAVE, more), [...made('family', FAMILY), ...made('age', AGES)]],
  [kindsOf('own', OWNERS, owners), kindsOf('four', COMPARE, chain(4)), [...made('meet', MEETINGS.map(meetings)), ...made('hidden', HIDDEN)]],
];

/** Every kind in path order: round-robin over the frames of a band, band after band. */
export const RIDDLE_KINDS: RiddleKind[] = BANDS.flatMap((frames) => {
  const longest = Math.max(...frames.map((f) => f.length));
  const band: Omit<RiddleKind, 'r'>[] = [];
  for (let i = 0; i < longest; i += 1) for (const frame of frames) if (frame[i]) band.push(frame[i]);
  return band.map((kind, i) => ({ ...kind, r: band.length > 1 ? i / (band.length - 1) : 0 }));
});

/** New kinds a step opens. */
export const RIDDLES_PER_STEP = 3;
/** Path length: three new kinds of riddle on every step. */
export const RIDDLE_STEPS = Math.ceil(RIDDLE_KINDS.length / RIDDLES_PER_STEP);
