/**
 * Any Ukrainian text, made ready for the voice.
 *
 * `num` / `say` are for a text whose author knows the gender and the case. But
 * most of what the app says was written as plain text with digits in it — a
 * fact («Нептун відкрили 1846 року»), a sum («Скільки буде 2 плюс 4?»), a
 * price. `voiced` is the last stop before the speech engine for ALL of it: it
 * reads the marked numbers as their author said, and works the rest out from
 * the words around them.
 *
 * Deliberately free of React and of `@/` imports so it runs under `node --test`.
 */
import { spoken } from '../marks.ts';
import { letterName } from './letters.ts';
import { hourAt, numberWords, ordinalWords, type NumCase } from './numbers.ts';
import type { Gender } from './phrase.ts';

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
