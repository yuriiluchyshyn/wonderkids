import { numberWords, ordinalWords } from './numbers.ts';

/** The signs of arithmetic and a fraction, as Polish says them. */
const SIGNS: Record<string, string> = { '+': 'plus', '−': 'minus', '-': 'minus', '×': 'razy', '÷': 'podzielić przez', '=': 'równa się', '?': 'ile' };

export const sign = (s: string): string => SIGNS[s] ?? s;

/**
 * «jedna druga», «dwie trzecie», «pięć szóstych»: the parts are feminine
 * («części»), and from five up they stand in the genitive plural.
 */
export function fraction(n: number, d: number): string {
  const few = n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14);
  if (n === 1) return `jedna ${ordinalWords(d, 'f')}`;
  if (few) return `${numberWords(n, 'f')} ${ordinalWords(d, 'n')}`;
  // «szóstym» → «szóstych», «trzecim» → «trzecich».
  return `${numberWords(n, 'f')} ${ordinalWords(d, 'loc').replace(/m$/, 'ch')}`;
}
