/**
 * Polish numbers in words. A Polish numeral answers to more than a Ukrainian
 * one: besides the case it has a form of its own for men («dwaj chłopcy»,
 * «pięciu chłopców»), for women and feminine things («dwie gwiazdy»), and a
 * separate collective series for children and the young of animals («dwoje
 * dzieci», «pięcioro kurcząt»). Ordinals bend like adjectives, and in a
 * compound one both the tens and the units do («dwudziestego czwartego»).
 *
 * Deliberately free of React and of `@/` imports so it runs under `node --test`.
 */
import { say } from '../marks.ts';

/** `mp` — men («dwaj», «pięciu»); `m` — every other masculine noun. */
export type Gender = 'mp' | 'm' | 'f' | 'n';
export type NumCase = 'nom' | 'gen' | 'dat' | 'acc' | 'ins' | 'loc';

/** A numeral from five up has three shapes: «pięć», «pięciu» (every other case, and with men), «pięcioma». */
type Shape = 0 | 1 | 2;
type Shapes = [plain: string, bent: string, ins: string];

const TEENS: Shapes[] = [
  ['zero', 'zera', 'zerem'], ['', '', ''], ['', '', ''], ['', '', ''], ['', '', ''],
  ['pięć', 'pięciu', 'pięcioma'], ['sześć', 'sześciu', 'sześcioma'], ['siedem', 'siedmiu', 'siedmioma'], ['osiem', 'ośmiu', 'ośmioma'], ['dziewięć', 'dziewięciu', 'dziewięcioma'],
  ['dziesięć', 'dziesięciu', 'dziesięcioma'], ['jedenaście', 'jedenastu', 'jedenastoma'], ['dwanaście', 'dwunastu', 'dwunastoma'], ['trzynaście', 'trzynastu', 'trzynastoma'],
  ['czternaście', 'czternastu', 'czternastoma'], ['piętnaście', 'piętnastu', 'piętnastoma'], ['szesnaście', 'szesnastu', 'szesnastoma'], ['siedemnaście', 'siedemnastu', 'siedemnastoma'],
  ['osiemnaście', 'osiemnastu', 'osiemnastoma'], ['dziewiętnaście', 'dziewiętnastu', 'dziewiętnastoma'],
];
const TENS: Shapes[] = [
  ['', '', ''], ['', '', ''], ['dwadzieścia', 'dwudziestu', 'dwudziestoma'], ['trzydzieści', 'trzydziestu', 'trzydziestoma'], ['czterdzieści', 'czterdziestu', 'czterdziestoma'],
  ['pięćdziesiąt', 'pięćdziesięciu', 'pięćdziesięcioma'], ['sześćdziesiąt', 'sześćdziesięciu', 'sześćdziesięcioma'], ['siedemdziesiąt', 'siedemdziesięciu', 'siedemdziesięcioma'],
  ['osiemdziesiąt', 'osiemdziesięciu', 'osiemdziesięcioma'], ['dziewięćdziesiąt', 'dziewięćdziesięciu', 'dziewięćdziesięcioma'],
];
/** Hundreds know two shapes only: «pięćset», «pięciuset». */
const HUNDREDS: [plain: string, bent: string][] = [['', ''], ['sto', 'stu'], ['dwieście', 'dwustu'], ['trzysta', 'trzystu'], ['czterysta', 'czterystu'], ['pięćset', 'pięciuset'], ['sześćset', 'sześciuset'], ['siedemset', 'siedmiuset'], ['osiemset', 'ośmiuset'], ['dziewięćset', 'dziewięciuset']];

/** Men take the bent shape even as the subject: «pięciu chłopców przyszło». */
const shapeOf = (gender: Gender, c: NumCase): Shape => (c === 'ins' ? 2 : c === 'nom' || c === 'acc' ? (gender === 'mp' ? 1 : 0) : 1);

const ONE: Record<NumCase, [m: string, f: string, n: string]> = {
  nom: ['jeden', 'jedna', 'jedno'], gen: ['jednego', 'jednej', 'jednego'], dat: ['jednemu', 'jednej', 'jednemu'],
  acc: ['jeden', 'jedną', 'jedno'], ins: ['jednym', 'jedną', 'jednym'], loc: ['jednym', 'jednej', 'jednym'],
};
/** 2, 3, 4: the subject form for men, for everything else, then genitive (= locative), dative, instrumental. */
const FEW: Record<number, [men: string, other: string, gen: string, dat: string, ins: string]> = {
  2: ['dwaj', 'dwa', 'dwóch', 'dwóm', 'dwoma'],
  3: ['trzej', 'trzy', 'trzech', 'trzem', 'trzema'],
  4: ['czterej', 'cztery', 'czterech', 'czterem', 'czterema'],
};

/**
 * 1…4 — the numerals that answer to the gender. `inside` — the last word of a
 * longer number: there «jeden» never changes («dwadzieścia jeden gwiazd») and
 * men take «dwóch», not «dwaj» («dwudziestu dwóch chłopców»).
 */
function unit(n: number, gender: Gender, c: NumCase, inside: boolean): string {
  if (n === 1) {
    if (inside) return 'jeden';
    if (c === 'acc' && gender === 'mp') return 'jednego';
    return ONE[c][gender === 'f' ? 1 : gender === 'n' ? 2 : 0];
  }
  const [men, other, gen, dat, ins] = FEW[n];
  if (c === 'ins') return n === 2 && gender === 'f' ? 'dwiema' : ins;
  if (c === 'gen' || c === 'loc') return gen;
  if (c === 'dat') return dat;
  if (gender === 'mp') return c === 'acc' || inside ? gen : men;
  return n === 2 && gender === 'f' ? 'dwie' : other;
}

function below1000(n: number, gender: Gender, c: NumCase, inside: boolean): string {
  const shape = shapeOf(gender, c);
  const parts: string[] = [];
  const hundreds = Math.floor(n / 100);
  if (hundreds) parts.push(HUNDREDS[hundreds][shape === 0 ? 0 : 1]);
  const below = n % 100;
  const tens = below >= 20 ? Math.floor(below / 10) : 0;
  if (tens) parts.push(TENS[tens][shape]);
  const last = tens ? below % 10 : below;
  if (last >= 1 && last <= 4) parts.push(unit(last, gender, c, inside || hundreds > 0 || tens > 0));
  else if (last >= 5) parts.push(TEENS[last][shape]);
  return parts.join(' ');
}

/** «tysiąc» and «milion» are nouns: they are counted and declined themselves. */
interface Big {
  one: Record<NumCase, string>;
  few: Record<NumCase, string>;
  many: string;
}
const THOUSAND: Big = {
  one: { nom: 'tysiąc', gen: 'tysiąca', dat: 'tysiącowi', acc: 'tysiąc', ins: 'tysiącem', loc: 'tysiącu' },
  few: { nom: 'tysiące', gen: 'tysięcy', dat: 'tysiącom', acc: 'tysiące', ins: 'tysiącami', loc: 'tysiącach' },
  many: 'tysięcy',
};
const MILLION: Big = {
  one: { nom: 'milion', gen: 'miliona', dat: 'milionowi', acc: 'milion', ins: 'milionem', loc: 'milionie' },
  few: { nom: 'miliony', gen: 'milionów', dat: 'milionom', acc: 'miliony', ins: 'milionami', loc: 'milionach' },
  many: 'milionów',
};

const isFew = (n: number): boolean => n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14);

function big(count: number, word: Big, c: NumCase): string {
  if (count === 1) return word.one[c];
  const said = below1000(count, 'm', c, false);
  if (isFew(count) || (c !== 'nom' && c !== 'acc')) return `${said} ${word.few[c]}`;
  return `${said} ${word.many}`;
}

/** A whole number 0…999 999 999 in words: `numberWords(22, 'f')` → «dwadzieścia dwie», `numberWords(5, 'mp')` → «pięciu». */
export function numberWords(value: number, gender: Gender = 'm', c: NumCase = 'nom'): string {
  const n = Math.abs(Math.trunc(value));
  if (n === 0) return TEENS[0][shapeOf('m', c)];
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor(n / 1000) % 1000;
  const rest = n % 1000;
  return [millions ? big(millions, MILLION, c) : '', thousands ? big(thousands, THOUSAND, c) : '', rest ? below1000(rest, gender, c, n >= 1000) : ''].filter(Boolean).join(' ');
}

// ---- Collective numerals -----------------------------------------------------

const COLLECTIVE = ['', '', 'dwoje', 'troje', 'czworo', 'pięcioro', 'sześcioro', 'siedmioro', 'ośmioro', 'dziewięcioro', 'dziesięcioro', 'jedenaścioro', 'dwanaścioro', 'trzynaścioro', 'czternaścioro', 'piętnaścioro', 'szesnaścioro', 'siedemnaścioro', 'osiemnaścioro', 'dziewiętnaścioro'];

function collective(n: number, c: NumCase): string {
  const stem = COLLECTIVE[n].slice(0, -1);
  return c === 'nom' || c === 'acc' ? COLLECTIVE[n] : `${stem}${c === 'gen' ? 'ga' : c === 'ins' ? 'giem' : 'gu'}`;
}

/**
 * The count of children, of the young of animals, of things that have no
 * singular: «dwoje dzieci», «pięcioro kurcząt», «troje drzwi», «dwadzieścia
 * dwoje dzieci». Where the language has no collective form («jedno», «sto»)
 * the plain numeral is said.
 */
export function collectiveWords(value: number, c: NumCase = 'nom'): string {
  const n = Math.abs(Math.trunc(value));
  if (n >= 2 && n <= 19) return collective(n, c);
  if (n > 20 && n < 100 && n % 10 >= 2) return `${TENS[Math.floor(n / 10)][shapeOf('m', c)]} ${collective(n % 10, c)}`;
  return numberWords(n, 'n', c);
}

// ---- Ordinals ----------------------------------------------------------------

const ORDINAL_ONES = ['zerowy', 'pierwszy', 'drugi', 'trzeci', 'czwarty', 'piąty', 'szósty', 'siódmy', 'ósmy', 'dziewiąty', 'dziesiąty', 'jedenasty', 'dwunasty', 'trzynasty', 'czternasty', 'piętnasty', 'szesnasty', 'siedemnasty', 'osiemnasty', 'dziewiętnasty'];
const ORDINAL_TENS = ['', '', 'dwudziesty', 'trzydziesty', 'czterdziesty', 'pięćdziesiąty', 'sześćdziesiąty', 'siedemdziesiąty', 'osiemdziesiąty', 'dziewięćdziesiąty'];
const ORDINAL_HUNDREDS = ['', 'setny', 'dwusetny', 'trzechsetny', 'czterechsetny', 'pięćsetny', 'sześćsetny', 'siedemsetny', 'osiemsetny', 'dziewięćsetny'];
/** «dwutysięczny», «trzytysięczny» … */
const THOUSANDTH = ['', '', 'dwu', 'trzy', 'cztero', 'pięcio', 'sześcio', 'siedmio', 'ośmio', 'dziewięcio', 'dziesięcio'];

/**
 * The forms an ordinal is said in here: «pierwszy», «pierwsza», «pierwsze»;
 * `gen` — «pierwszego» (maja, roku); `loc` — «pierwszym» (w … roku, wieku);
 * `f-obl` — «pierwszej» (o, do, po … godzinie); `f-acc` — «pierwszą» (na, przed).
 */
export type OrdinalForm = 'm' | 'f' | 'n' | 'gen' | 'loc' | 'f-obl' | 'f-acc';

function bend(ordinal: string, form: OrdinalForm): string {
  if (form === 'm') return ordinal;
  const stem = ordinal.slice(0, -1);
  if (ordinal.endsWith('y')) return stem + { f: 'a', n: 'e', gen: 'ego', loc: 'ym', 'f-obl': 'ej', 'f-acc': 'ą' }[form];
  // «drugi» keeps its hard «g» before «a» and «ą»; «trzeci» stays soft throughout.
  const soft = !/[gk]$/.test(stem);
  return stem + { f: soft ? 'ia' : 'a', n: 'ie', gen: 'iego', loc: 'im', 'f-obl': 'iej', 'f-acc': soft ? 'ią' : 'ą' }[form];
}

/** «dwudziesty czwarty», «tysiąc dziewięćset dziewięćdziesiątego pierwszego» (roku), «dwutysięczny». */
export function ordinalWords(value: number, form: OrdinalForm = 'm'): string {
  const n = Math.abs(Math.trunc(value));
  if (n === 0) return bend(ORDINAL_ONES[0], form);
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    const rest = n % 1000;
    if (rest) return `${numberWords(thousands * 1000)} ${ordinalWords(rest, form)}`;
    return thousands === 1 ? bend('tysięczny', form) : thousands <= 10 ? bend(`${THOUSANDTH[thousands]}tysięczny`, form) : `${numberWords(thousands)} ${bend('tysięczny', form)}`;
  }
  const hundreds = Math.floor(n / 100);
  const below = n % 100;
  if (below === 0) return bend(ORDINAL_HUNDREDS[hundreds], form);
  const head = hundreds ? `${HUNDREDS[hundreds][0]} ` : '';
  if (below < 20) return head + bend(ORDINAL_ONES[below], form);
  const tens = bend(ORDINAL_TENS[Math.floor(below / 10)], form);
  return below % 10 === 0 ? head + tens : `${head}${tens} ${bend(ORDINAL_ONES[below % 10], form)}`;
}

// ---- Marks -------------------------------------------------------------------

/** A number inside a text: the digit is shown, the word — in this gender and case — is said. */
export const num = (n: number, gender: Gender = 'm', c: NumCase = 'nom'): string => say(n, numberWords(n, gender, c));
/** A count of children or of young animals: «5» shown, «pięcioro» said. */
export const numCollective = (n: number, c: NumCase = 'nom'): string => say(n, collectiveWords(n, c));
/** «3.» shown, «trzeci» — in this form — said. */
export const ord = (n: number, form: OrdinalForm = 'm'): string => say(`${n}.`, ordinalWords(n, form));
/** A year inside a text: «1846» shown, «tysiąc osiemset czterdziestego szóstego» said. */
export const year = (y: number, form: OrdinalForm = 'gen'): string => say(y, ordinalWords(y, form));
