/**
 * Ukrainian numbers in words: cardinals in the gender and case they are said
 * in («дві машинки», «між трьома друзями»), ordinals («двадцять четвертого»),
 * the hour of a clock.
 *
 * Deliberately free of React and of `@/` imports so it runs under `node --test`.
 */
import { say } from '../marks.ts';
import type { Gender } from './phrase.ts';

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

/** A number inside a text: the digit is shown, the word — in this gender and case — is said. */
export const num = (n: number, gender: Gender = 'm', c: NumCase = 'nom'): string => say(n, numberWords(n, gender, c));

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
