import { numberWords, ordinalWords } from './numbers.ts';

/** The signs of arithmetic and a fraction, as English says them. */
const SIGNS: Record<string, string> = { '+': 'plus', '−': 'minus', '-': 'minus', '×': 'times', '÷': 'divided by', '=': 'equals', '?': 'what' };

export const sign = (s: string): string => SIGNS[s] ?? s;

/** «one half», «three quarters», «two fifths». */
export function fraction(n: number, d: number): string {
  const part = d === 2 ? (n === 1 ? 'half' : 'halves') : d === 4 ? 'quarter' : ordinalWords(d);
  return `${numberWords(n)} ${part}${n === 1 || d === 2 ? '' : 's'}`;
}
