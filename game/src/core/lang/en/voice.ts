/**
 * Any English text, made ready for the voice — the English counterpart of
 * `uk/voice.ts`. English has no genders or cases to get wrong, but a speech
 * engine handed digits still reads a year as a quantity («one thousand eight
 * hundred forty-six»), a clock as a ratio, «Henry VIII» as letters and the
 * letter «A» as the article. `voiced` is the last stop before the speech
 * engine: it reads what the author marked (`num` / `ord` / `year` / `say`) as
 * marked, and works the rest out from the words around it.
 *
 * Deliberately free of React and of `@/` imports so it runs under `node --test`.
 */
import { spoken } from '../marks.ts';
import { roman } from '../roman.ts';
import { letterName } from './letters.ts';
import { numberWords, ordinalWords, yearWords } from './numbers.ts';

const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December';
/** After these a four-digit number is a year («in 1846»)… */
const YEAR_AFTER = 'in|since|from|between|until|till|by|before|after|around|during|circa';
/** …unless it counts one of these («in 1500 steps»). */
const COUNTED = new Set(['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds', 'steps', 'times', 'metres', 'meters', 'kilometres', 'kilometers', 'km', 'miles', 'feet', 'grams', 'kilograms', 'kg', 'tons', 'tonnes', 'litres', 'liters', 'degrees', 'points', 'stars', 'coins', 'pieces', 'people', 'words', 'pages', 'more', 'less', 'other']);
/** Names that reign: only after one of these is a lone «I» a number («Elizabeth I») and not the pronoun («Then I ran»). */
const REGNAL = new Set(['Elizabeth', 'Charles', 'James', 'George', 'Henry', 'Edward', 'William', 'Richard', 'Mary', 'Peter', 'Catherine', 'Nicholas', 'Alexander', 'Napoleon', 'Francis', 'Louis', 'Frederick', 'Philip', 'John', 'Paul', 'Stephen', 'Casimir', 'Sigismund', 'Mieszko', 'Volodymyr', 'Yaroslav', 'Danylo', 'Leo']);
/** Things numbered, not ranked: «World War II» is «two», while «Henry VIII» is «the Eighth». */
const NUMBERED = new Set(['War', 'Part', 'Chapter', 'Book', 'Volume', 'Act', 'Scene', 'Level', 'Phase', 'Stage', 'Type', 'Class', 'Group', 'Unit', 'Lesson', 'Step', 'Figure', 'Table', 'Section', 'Round']);
const CURRENCY: Record<string, [one: string, many: string, cent: string]> = { $: ['dollar', 'dollars', 'cent'], '£': ['pound', 'pounds', 'penny'], '€': ['euro', 'euros', 'cent'] };

const isYear = (digits: string): boolean => Number(digits) >= 1000 && Number(digits) <= 2099;
const capital = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1);

/** «7:00» → «seven o'clock», «3:05» → «three oh five», «15:30» → «three thirty p.m.». */
function clock(h: number, m: number, half: string): string {
  if (h === 0 && m === 0 && !half) return 'midnight';
  if (h === 12 && m === 0 && !half) return 'twelve o’clock';
  const suffix = half ? ` ${half.toLowerCase().replace(/[^apm]/g, '').split('').join('.')}.` : h > 12 ? ' p.m.' : h === 0 ? ' a.m.' : '';
  const hour = numberWords(h % 12 || 12);
  if (m === 0) return suffix ? hour + suffix : `${hour} o’clock`;
  return `${hour} ${m < 10 ? `oh ${numberWords(m)}` : numberWords(m)}${suffix}`;
}

/**
 * A plain English text as the voice should read it:
 *   «at 7:00» → «at seven o'clock», «3:40 p.m.» → «three forty p.m.»
 *   «in 1846» → «in eighteen forty-six», «August 1991», «1914–1918» → «… to …», «the 1990s» → «nineteen nineties»
 *   «24 August» → «the twenty-fourth of August», «August 24» → «August twenty-fourth»
 *   «3rd» → «third», «Henry VIII» → «Henry the Eighth», «World War II» → «World War Two»
 *   «1,500» → «one thousand five hundred», «3.5» → «three point five», «50%» → «fifty percent», «$5» → «five dollars»
 * A letter that is being named («the letter A», «from A to Z», «starts with B»,
 * or in quotes) is said by its name. An author who knows better marks the piece
 * with `num` / `ord` / `year` / `say` — a marked one is never touched.
 */
export function voiceNumbers(text: string): string {
  if (!/\d|[A-Z]/.test(text)) return text;
  let out = text;

  // Clock times.
  out = out.replace(/(?<![\d:])(\d{1,2}):(\d{2})(?![\d:])(?:\s?([ap]\.?m\.?)(?![a-z]))?/gi, (_, h: string, m: string, half = '') => clock(Number(h), Number(m), half));
  // «…at 15:30.» — the full stop of «p.m.» also ends the sentence.
  out = out.replace(/([ap]\.m\.)\./g, '$1');

  // Years: decades, eras, «the year …», ranges, after a month, after a preposition, in brackets.
  out = out.replace(/(?<![\d,.])(\d{1,3}0)s\b/g, (_, y: string) => yearWords(Number(y)).replace(/y$/, 'ie') + 's');
  out = out.replace(/(?<![\d,.])(\d{1,4})\s?(AD|BCE|BC|CE)\b/g, (_, y: string, era: string) => `${yearWords(Number(y))} ${era}`);
  out = out.replace(/\b(year)\s(\d{3,4})(?![\d,.]\d)/gi, (_, word: string, y: string) => `${word} ${yearWords(Number(y))}`);
  out = out.replace(/(?<![\d,.])(\d{4})(?:\s?[–—]\s?|-)(\d{4})(?!\d)/g, (all: string, a: string, b: string) => (isYear(a) && isYear(b) ? `${yearWords(Number(a))} to ${yearWords(Number(b))}` : all));
  out = out.replace(new RegExp(`\\b((?:${MONTHS})(?:\\s\\d{1,2}(?:st|nd|rd|th)?,?)?\\s)(\\d{4})(?!\\d)`, 'g'), (all: string, lead: string, y: string) => (isYear(y) ? lead + yearWords(Number(y)) : all));
  out = out.replace(new RegExp(`\\b(${YEAR_AFTER}|and|to)\\s(\\d{4})(?![\\d,.]\\d|\\d)(?=(?:\\s([a-z]+))?)`, 'gi'), (all: string, lead: string, y: string, next = '', at: number, whole: string) => {
    // «and» / «to» only carry on a year already read: «from 1914 to 1918», «between 1939 and 1945».
    const carriesOn = /^(and|to)$/i.test(lead);
    if (!isYear(y) || COUNTED.has(next) || (carriesOn && !/\d{4}\s$/.test(whole.slice(0, at)))) return all;
    return `${lead} ${yearWords(Number(y))}`;
  });
  out = out.replace(/\((\d{4})\)/g, (all: string, y: string) => (isYear(y) ? `(${yearWords(Number(y))})` : all));

  // Dates.
  out = out.replace(new RegExp(`(\\bthe\\s)?(?<![\\d,.])(\\d{1,2})(?:st|nd|rd|th)?\\s(?:of\\s)?(${MONTHS})\\b`, 'g'), (_, _the: string, d: string, month: string) => `the ${ordinalWords(Number(d))} of ${month}`);
  out = out.replace(new RegExp(`\\b(${MONTHS})\\s(\\d{1,2})(?:st|nd|rd|th)?(?![\\d:]|[,.]\\d)`, 'g'), (_, month: string, d: string) => `${month} ${ordinalWords(Number(d))}`);

  // Ordinals: «3rd», and the numbers of kings and of things.
  out = out.replace(/(?<![\d,.])(\d+)(?:st|nd|rd|th)\b/g, (_, n: string) => ordinalWords(Number(n)));
  out = out.replace(/\b([A-Z][a-z]+)\s([IVX]+)\b(?!['’])/g, (all: string, name: string, numeral: string) => {
    const n = roman(numeral);
    if (!n || numeral === 'X' || (numeral === 'I' && !REGNAL.has(name))) return all;
    return NUMBERED.has(name) ? `${name} ${capital(numberWords(n))}` : `${name} the ${capital(ordinalWords(n))}`;
  });

  // Money, percentages, decimals.
  out = out.replace(/([$£€])(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{2}))?(?!\d)/g, (_, sign: string, whole: string, cents?: string) => {
    const [one, many, cent] = CURRENCY[sign];
    const n = Number(whole.replace(/,/g, ''));
    const c = Number(cents ?? 0);
    const small = c === 0 ? '' : ` and ${numberWords(c)} ${c === 1 ? cent : cent === 'penny' ? 'pence' : `${cent}s`}`;
    return `${numberWords(n)} ${n === 1 ? one : many}${small}`;
  });
  out = out.replace(/(?<![\d,.])(\d+)\.(\d+)(?!\d|[.,]\d)/g, (_, whole: string, part: string) => `${numberWords(Number(whole))} point ${part.split('').map((d) => numberWords(Number(d))).join(' ')}`);
  out = out.replace(/(?<=[a-z])\s?%/g, ' percent');

  // Every other whole number.
  out = out.replace(/(?<![\d,.])(\d{1,3}(?:,\d{3})+|\d+)(?!\d|[,.]\d)(\s?%)?/g, (all: string, digits: string, percent?: string) => {
    const n = Number(digits.replace(/,/g, ''));
    if (!Number.isFinite(n) || n > 999_999_999) return all;
    return numberWords(n) + (percent ? ' percent' : '');
  });

  // Letters being named.
  const names = (letters: string) => letters.replace(/\b[A-Z]\b/g, (letter) => letterName(letter));
  out = out.replace(/(['‘“"«])([A-Za-z])(['’”"»])/g, (_, open: string, letter: string, close: string) => `${open}${letterName(letter)}${close}`);
  out = out.replace(/\b((?:[Ll]etters?|[Vv]owels?|[Cc]onsonants?)\s)((?:[A-Z](?:,\s(?:and\s|or\s)?|\s(?:and|or|to)\s|\s?[–-]\s?))*[A-Z])\b(?!['’])/g, (_, lead: string, letters: string) => lead + names(letters));
  out = out.replace(/\b([Ff]rom\s)([A-Z])(\sto\s)([A-Z])\b(?!['’])/g, (_, from: string, a: string, to: string, b: string) => `${from}${letterName(a)}${to}${letterName(b)}`);
  out = out.replace(/\b((?:[Ss]tart|[Bb]egin|[Ee]nd)(?:s|ing)?\s(?:with|in)\s(?:the\s|an?\s)?)([A-Z])\b(?!['’])/g, (_, lead: string, letter: string) => lead + letterName(letter));
  return out;
}

/** What the speech engine is handed for an English text. */
export const voiced = (text: string): string => voiceNumbers(spoken(text));
