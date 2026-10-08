/**
 * Numbers and letters as the VOICE says them. A text shows «2 машинки», but a
 * speech engine handed the digit guesses the gender and the case — and says
 * «два машинки». So a text that will be read aloud writes its numbers through
 * `num` / `counted` below: the same string then gives the written form
 * (`written`) and the spoken one (`spoken`), where every number is a word in
 * the right gender and case: «дві машинки», «між трьома друзями».
 *
 * Deliberately free of React and of `@/` imports so it runs under `node --test`.
 */
import type { Gender } from './uk.ts';

/** The cases a number is said in here: «два», «двох» (also «у двох»), «двома». */
export type NumCase = 'nom' | 'gen' | 'ins';

const ONES: Record<NumCase, string[]> = {
  nom: ['нуль', 'один', 'два', 'три', 'чотири', 'п’ять', 'шість', 'сім', 'вісім', 'дев’ять', 'десять', 'одинадцять', 'дванадцять', 'тринадцять', 'чотирнадцять', 'п’ятнадцять', 'шістнадцять', 'сімнадцять', 'вісімнадцять', 'дев’ятнадцять'],
  gen: ['нуля', 'одного', 'двох', 'трьох', 'чотирьох', 'п’яти', 'шести', 'семи', 'восьми', 'дев’яти', 'десяти', 'одинадцяти', 'дванадцяти', 'тринадцяти', 'чотирнадцяти', 'п’ятнадцяти', 'шістнадцяти', 'сімнадцяти', 'вісімнадцяти', 'дев’ятнадцяти'],
  ins: ['нулем', 'одним', 'двома', 'трьома', 'чотирма', 'п’ятьма', 'шістьма', 'сьома', 'вісьма', 'дев’ятьма', 'десятьма', 'одинадцятьма', 'дванадцятьма', 'тринадцятьма', 'чотирнадцятьма', 'п’ятнадцятьма', 'шістнадцятьма', 'сімнадцятьма', 'вісімнадцятьма', 'дев’ятнадцятьма'],
};
const TENS: Record<NumCase, string[]> = {
  nom: ['', '', 'двадцять', 'тридцять', 'сорок', 'п’ятдесят', 'шістдесят', 'сімдесят', 'вісімдесят', 'дев’яносто'],
  gen: ['', '', 'двадцяти', 'тридцяти', 'сорока', 'п’ятдесяти', 'шістдесяти', 'сімдесяти', 'вісімдесяти', 'дев’яноста'],
  ins: ['', '', 'двадцятьма', 'тридцятьма', 'сорока', 'п’ятдесятьма', 'шістдесятьма', 'сімдесятьма', 'вісімдесятьма', 'дев’яноста'],
};
const HUNDREDS: Record<NumCase, string[]> = {
  nom: ['', 'сто', 'двісті', 'триста', 'чотириста', 'п’ятсот', 'шістсот', 'сімсот', 'вісімсот', 'дев’ятсот'],
  gen: ['', 'ста', 'двохсот', 'трьохсот', 'чотирьохсот', 'п’ятисот', 'шестисот', 'семисот', 'восьмисот', 'дев’ятисот'],
  ins: ['', 'ста', 'двомастами', 'трьомастами', 'чотирмастами', 'п’ятьмастами', 'шістьмастами', 'сьомастами', 'вісьмастами', 'дев’ятьмастами'],
};

/** «один / одна / одне», «два / дві» — only these two change with the gender. */
function unit(n: number, gender: Gender, c: NumCase): string {
  if (n === 1) {
    if (c === 'nom') return gender === 'f' ? 'одна' : gender === 'n' ? 'одне' : 'один';
    if (c === 'gen') return gender === 'f' ? 'однієї' : 'одного';
    return gender === 'f' ? 'однією' : 'одним';
  }
  if (n === 2 && c === 'nom') return gender === 'f' ? 'дві' : 'два';
  return ONES[c][n];
}

/** A whole number 0…999 999 in words: `numberWords(22, 'f')` → «двадцять дві». */
export function numberWords(value: number, gender: Gender = 'm', c: NumCase = 'nom'): string {
  const n = Math.abs(Math.trunc(value));
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    const rest = n % 1000;
    const form = thousands % 10 === 1 && thousands % 100 !== 11 ? 'тисяча' : thousands % 10 >= 2 && thousands % 10 <= 4 && (thousands % 100 < 12 || thousands % 100 > 14) ? 'тисячі' : 'тисяч';
    return [thousands === 1 ? '' : numberWords(thousands, 'f'), form, rest ? numberWords(rest, gender, c) : ''].filter(Boolean).join(' ');
  }
  const parts: string[] = [];
  if (n >= 100) parts.push(HUNDREDS[c][Math.floor(n / 100)]);
  const below = n % 100;
  if (below >= 20) {
    parts.push(TENS[c][Math.floor(below / 10)]);
    if (below % 10) parts.push(unit(below % 10, gender, c));
  } else if (below > 0 || n === 0) {
    parts.push(unit(below, gender, c));
  }
  return parts.join(' ');
}

/** «о сьомій», «о дванадцятій» — the hour a clock shows, 1…12, as it follows «о». */
const HOUR_AT = ['', 'першій', 'другій', 'третій', 'четвертій', 'п’ятій', 'шостій', 'сьомій', 'восьмій', 'дев’ятій', 'десятій', 'одинадцятій', 'дванадцятій'];
export const hourAt = (h: number): string => HOUR_AT[((Math.trunc(h) + 11) % 12) + 1];

// ---- One string, two readings ------------------------------------------------

const OPEN = '⁣⟦';
const CLOSE = '⟧⁣';
const TOKEN = /⁣⟦([^|⟧]*)\|([^⟧]*)⟧⁣/g;

/** A piece of text that is written one way and said another: `say('7:00', 'сьома година')`. */
export const say = (shown: string | number, said: string): string => `${OPEN}${shown}|${said}${CLOSE}`;

/** A number inside a text: the digit is shown, the word — in this gender and case — is said. */
export const num = (n: number, gender: Gender = 'm', c: NumCase = 'nom'): string => say(n, numberWords(n, gender, c));

/** The text as it is printed. */
export const written = (text: string): string => text.replace(TOKEN, '$1');
/** The text as the voice reads it. */
export const spoken = (text: string): string => text.replace(TOKEN, '$2');

// ---- Letters -----------------------------------------------------------------

const LETTER_NAMES: Record<string, string> = {
  а: 'а', б: 'бе', в: 'ве', г: 'ге', ґ: 'ґе', д: 'де', е: 'е', є: 'є', ж: 'же', з: 'зе', и: 'и', і: 'і', ї: 'ї', й: 'йот', к: 'ка', л: 'ел', м: 'ем',
  н: 'ен', о: 'о', п: 'пе', р: 'ер', с: 'ес', т: 'те', у: 'у', ф: 'еф', х: 'ха', ц: 'це', ч: 'че', ш: 'ша', щ: 'ща', ь: 'м’який знак', ю: 'ю', я: 'я',
};

/**
 * How a Ukrainian letter is called aloud: «бе», «же», «м’який знак». A lone
 * letter handed to a speech engine is read unpredictably (or not at all).
 */
export const letterName = (letter: string): string => LETTER_NAMES[letter.toLocaleLowerCase('uk')] ?? letter;

// ---- Any text, made ready for the voice -------------------------------------
//
// `num` / `say` are for a text whose author knows the gender and the case. But
// most of what the app says was written as plain text with digits in it — a
// fact («Нептун відкрили 1846 року»), a sum («Скільки буде 2 плюс 4?»), a
// price. `voiced` is the last stop before the speech engine for ALL of it: it
// reads the marked numbers as their author said, and works the rest out from
// the words around them.

const ORDINAL_ONES = ['', 'перший', 'другий', 'третій', 'четвертий', 'п’ятий', 'шостий', 'сьомий', 'восьмий', 'дев’ятий', 'десятий', 'одинадцятий', 'дванадцятий', 'тринадцятий', 'чотирнадцятий', 'п’ятнадцятий', 'шістнадцятий', 'сімнадцятий', 'вісімнадцятий', 'дев’ятнадцятий'];
const ORDINAL_TENS = ['', '', 'двадцятий', 'тридцятий', 'сороковий', 'п’ятдесятий', 'шістдесятий', 'сімдесятий', 'вісімдесятий', 'дев’яностий'];
const ORDINAL_HUNDREDS = ['', 'сотий', 'двохсотий', 'трьохсотий', 'чотирьохсотий', 'п’ятисотий', 'шестисотий', 'семисотий', 'восьмисотий', 'дев’ятисотий'];

/** The forms an ordinal is said in here: «перший», «перша», «першого» (року, серпня), «першому» (році), «першій» (годині). */
export type OrdinalForm = 'm' | 'f' | 'gen' | 'loc' | 'f-loc';

function bend(ordinal: string, form: OrdinalForm): string {
  const soft = ordinal.endsWith('ій');
  const stem = ordinal.slice(0, -2);
  if (form === 'm') return ordinal;
  if (form === 'f') return `${stem}${soft ? 'я' : 'а'}`;
  if (form === 'gen') return `${stem}${soft ? 'ього' : 'ого'}`;
  if (form === 'loc') return `${stem}${soft ? 'ьому' : 'ому'}`;
  return `${stem}ій`;
}

/** «двадцять четвертий», «тисяча вісімсот шістдесят третього» (року), «двохтисячний». */
export function ordinalWords(value: number, form: OrdinalForm = 'm'): string {
  const n = Math.abs(Math.trunc(value));
  if (n === 0) return bend('нульовий', form);
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    const rest = n % 1000;
    if (rest === 0) return bend(thousands === 1 ? 'тисячний' : `${numberWords(thousands, 'm', 'gen')}тисячний`, form);
    return `${numberWords(thousands * 1000)} ${ordinalWords(rest, form)}`;
  }
  const hundreds = Math.floor(n / 100);
  const below = n % 100;
  if (below === 0) return bend(ORDINAL_HUNDREDS[hundreds], form);
  const head = hundreds ? `${HUNDREDS.nom[hundreds]} ` : '';
  if (below < 20) return head + bend(ORDINAL_ONES[below], form);
  if (below % 10 === 0) return head + bend(ORDINAL_TENS[below / 10], form);
  return `${head}${TENS.nom[Math.floor(below / 10)]} ${bend(ORDINAL_ONES[below % 10], form)}`;
}

/** Feminine words a number is often said with: singular, plural. Everything else is taken for masculine — the usual case. */
const FEMININE: [string, string][] = [
  ['година', 'години'], ['хвилина', 'хвилини'], ['секунда', 'секунди'], ['доба', 'доби'], ['гривня', 'гривні'], ['копійка', 'копійки'], ['тисяча', 'тисячі'],
  ['планета', 'планети'], ['зоря', 'зорі'], ['зірка', 'зірки'], ['клітинка', 'клітинки'], ['смуга', 'смуги'], ['сторона', 'сторони'], ['частина', 'частини'],
  ['половина', 'половини'], ['нога', 'ноги'], ['рука', 'руки'], ['лапа', 'лапи'], ['машина', 'машини'], ['машинка', 'машинки'], ['книжка', 'книжки'],
  ['літера', 'літери'], ['цифра', 'цифри'], ['крапка', 'крапки'], ['купка', 'купки'], ['група', 'групи'], ['пара', 'пари'], ['ніч', 'ночі'], ['країна', 'країни'],
  ['мова', 'мови'], ['річка', 'річки'], ['гора', 'гори'], ['квітка', 'квітки'], ['кулька', 'кульки'], ['сторінка', 'сторінки'], ['цукерка', 'цукерки'],
  ['наліпка', 'наліпки'], ['тварина', 'тварини'], ['пташка', 'пташки'], ['рибка', 'рибки'], ['коробка', 'коробки'], ['тарілка', 'тарілки'], ['полиця', 'полиці'],
  ['сестра', 'сестри'], ['донька', 'доньки'], ['подруга', 'подруги'], ['команда', 'команди'], ['монета', 'монети'], ['марка', 'марки'], ['груша', 'груші'],
  ['лялька', 'ляльки'], ['чашка', 'чашки'], ['булочка', 'булочки'], ['листівка', 'листівки'], ['качка', 'качки'], ['корова', 'корови'], ['бджола', 'бджоли'],
  ['крапля', 'краплі'], ['сходинка', 'сходинки'], ['спроба', 'спроби'], ['лінія', 'лінії'], ['фігура', 'фігури'], ['фарба', 'фарби'], ['кістка', 'кістки'],
  ['ніжка', 'ніжки'], ['хвиля', 'хвилі'], ['тонна', 'тонни'], ['ложка', 'ложки'], ['склянка', 'склянки'], ['пляшка', 'пляшки'], ['будівля', 'будівлі'],
  ['прикраса', 'прикраси'], ['станція', 'станції'], ['зупинка', 'зупинки'], ['купюра', 'купюри'], ['цеглинка', 'цеглинки'], ['сніжинка', 'сніжинки'],
  ['перлина', 'перлини'], ['мушля', 'мушлі'], ['шестерня', 'шестерні'], ['відповідь', 'відповіді'], ['помилка', 'помилки'], ['гра', 'гри'], ['задача', 'задачі'],
];
const NEUTER = ['число', 'місце', 'серце', 'яйце', 'око', 'коло', 'море', 'озеро', 'вікно', 'колесо', 'яблуко', 'дерево', 'слово', 'речення', 'завдання', 'питання', 'тістечко', 'сонце', 'євро', 'зернятко', 'печиво'];
const WORD_GENDER = new Map<string, Gender>([...FEMININE.flatMap(([one, few]): [string, Gender][] => [[one, 'f'], [few, 'f']]), ...NEUTER.map((w): [string, Gender] => [w, 'n'])]);

/** Words after which a number stands in the genitive («до п’яти», «з чотирьох») or the instrumental («між двома»). */
const GENITIVE_AFTER = new Set(['до', 'від', 'з', 'із', 'зі', 'близько', 'без', 'після', 'біля', 'серед', 'крім', 'замість', 'проти']);
const INSTRUMENTAL_AFTER = new Set(['між', 'поміж']);
const MONTHS_GEN = 'січня|лютого|березня|квітня|травня|червня|липня|серпня|вересня|жовтня|листопада|грудня';
const WORD = 'A-Za-zА-Яа-яІіЇїЄєҐґ’\'';

const minutesWord = (m: number) => (m % 10 === 1 && m % 100 !== 11 ? 'хвилина' : m % 10 >= 2 && m % 10 <= 4 && (m % 100 < 12 || m % 100 > 14) ? 'хвилини' : 'хвилин');

/**
 * A plain Ukrainian text as the voice should read it: every number left in
 * digits becomes a word. What kind of word is read off its neighbours:
 *   «о 7:00» → «о сьомій», «12:00» → «дванадцята година», «3:40» → «третя година сорок хвилин»
 *   «1846 року» → «тисяча вісімсот сорок шостого року», «у 1991 році», «2011-го»
 *   «24 серпня» → «двадцять четвертого серпня», «11 година» → «одинадцята година»
 *   «2 машинки» → «дві машинки», «1 яблуко» → «одне яблуко» (a short list of feminine and neuter words)
 *   «до 20 годин» → «до двадцяти годин», «3 з 4» → «три з чотирьох», «між 5 друзями» → «між п’ятьма друзями»
 * A lone capital letter named in a sentence («на літеру „Л“», «від И до П») is
 * said by its name. An author who knows better marks the number with `num` /
 * `say` — a marked one is never touched.
 */
export function voiceNumbers(text: string): string {
  if (!/\d|[А-ЯІЇЄҐ]/.test(text)) return text;
  let out = text;

  // Clock times.
  out = out.replace(/(^|\s)(о|об)\s(\d{1,2}):00(?!\d)/gi, (_, lead: string, at: string, h: string) => `${lead}${at} ${hourAt(Number(h))}`);
  out = out.replace(/(?<!\d)(\d{1,2}):(\d{2})(?!\d)/g, (_, h: string, m: string) => {
    const hour = `${ordinalWords(Number(h), 'f')} година`;
    return Number(m) === 0 ? hour : `${hour} ${numberWords(Number(m), 'f')} ${minutesWord(Number(m))}`;
  });
  out = out.replace(/(^|\s)(о|об)\s(\d{1,2})\s(годині)/gi, (_, lead: string, at: string, h: string, word: string) => `${lead}${at} ${ordinalWords(Number(h), 'f-loc')} ${word}`);
  out = out.replace(/(?<![\d,.])(\d{1,2})\s(година)(?![${WORD}])/g, (_, h: string, word: string) => `${ordinalWords(Number(h), 'f')} ${word}`);

  // Years and dates.
  out = out.replace(/(?<![\d,.])(\d{3,4})(?:-го)?\s(року)(?![${WORD}])/g, (_, y: string, word: string) => `${ordinalWords(Number(y), 'gen')} ${word}`);
  out = out.replace(/(?<![\d,.])(\d{3,4})(?:-му)?\s(році)(?![${WORD}])/g, (_, y: string, word: string) => `${ordinalWords(Number(y), 'loc')} ${word}`);
  out = out.replace(new RegExp(`(?<![\\d,.])(\\d{1,2})\\s(${MONTHS_GEN})(?![${WORD}])`, 'g'), (_, d: string, month: string) => `${ordinalWords(Number(d), 'gen')} ${month}`);

  // Ordinals written with an ending: «3-й», «5-та», «2011-го», «1-му».
  out = out.replace(/(?<![\d,.])(\d+)-(го|му|й|ий|ій|я|а|та|ша|тя|ма)(?![${WORD}])/g, (_, n: string, end: string) =>
    ordinalWords(Number(n), end === 'го' ? 'gen' : end === 'му' ? 'loc' : /^(я|а|та|ша|тя|ма)$/.test(end) ? 'f' : 'm'),
  );

  // Every other whole number: its case from the word before, its gender from the word after.
  const wordBefore = new RegExp(`([${WORD}]+)\\s$`);
  // The counted word, or the one after an adjective: «2 однакові купки».
  const wordAfter = new RegExp(`^\\s([${WORD}]+)(?:\\s([${WORD}]+))?`);
  out = out.replace(/(?<![\d,.])(\d{1,3}(?: \d{3})+|\d+)(?!\d|[,.]\d)/g, (digits: string, _n: string, at: number, all: string) => {
    const n = Number(digits.replace(/ /g, ''));
    if (!Number.isFinite(n) || n > 999_999) return digits;
    const prev = (wordBefore.exec(all.slice(Math.max(0, at - 24), at))?.[1] ?? '').toLocaleLowerCase('uk');
    const [, next = '', further = ''] = wordAfter.exec(all.slice(at + digits.length, at + digits.length + 48)) ?? [];
    const c: NumCase = GENITIVE_AFTER.has(prev) ? 'gen' : INSTRUMENTAL_AFTER.has(prev) ? 'ins' : 'nom';
    const gender = WORD_GENDER.get(next.toLocaleLowerCase('uk')) ?? WORD_GENDER.get(further.toLocaleLowerCase('uk')) ?? 'm';
    return numberWords(n, gender, c);
  });

  // Letters named in a sentence: in quotes always; bare — unless the sentence begins with it («У лісі…», «А тепер…»).
  out = out.replace(/«([А-ЯІЇЄҐа-яіїєґ])»/g, (_, letter: string) => `«${letterName(letter)}»`);
  // (An initial — «Г. С. Сковорода» — is not a letter being named.)
  out = out.replace(new RegExp(`(?<=[${WORD},:;—–-]\\s)([А-ЯІЇЄҐ])(?![${WORD}]|\\.\\s?[А-ЯІЇЄҐ])`, 'g'), (_, letter: string) => letterName(letter));
  return out;
}

/** What the speech engine is handed for a Ukrainian text: marked numbers as their author said them, the rest read off the context. */
export const voiced = (text: string): string => voiceNumbers(spoken(text));
