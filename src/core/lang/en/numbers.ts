/**
 * English numbers in words: cardinals («twenty-two»), ordinals («twenty-
 * second»), and years, which are read in pairs («eighteen forty-six»).
 * American usage, like the voice: no «and» after the hundreds.
 *
 * Deliberately free of React and of `@/` imports so it runs under `node --test`.
 */
import { say } from '../marks.ts';

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
/** The ordinals that are not simply the number with «th». */
const IRREGULAR: Record<string, string> = { one: 'first', two: 'second', three: 'third', five: 'fifth', eight: 'eighth', nine: 'ninth', twelve: 'twelfth' };

const below100 = (n: number): string => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : ''));

function below1000(n: number): string {
  const hundreds = Math.floor(n / 100);
  return [hundreds ? `${ONES[hundreds]} hundred` : '', n % 100 ? below100(n % 100) : ''].filter(Boolean).join(' ');
}

/** A whole number 0…999 999 999 in words: `numberWords(1204)` → «one thousand two hundred four». */
export function numberWords(value: number): string {
  const n = Math.abs(Math.trunc(value));
  if (n === 0) return ONES[0];
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor(n / 1000) % 1000;
  return [millions ? `${below1000(millions)} million` : '', thousands ? `${below1000(thousands)} thousand` : '', n % 1000 ? below1000(n % 1000) : ''].filter(Boolean).join(' ');
}

/** «first», «twenty-second», «one hundredth» — only the last word changes. */
export function ordinalWords(value: number): string {
  return numberWords(value).replace(/[a-z]+$/, (last) => IRREGULAR[last] ?? (last.endsWith('y') ? `${last.slice(0, -1)}ieth` : `${last}th`));
}

/**
 * A year as it is said: «eighteen forty-six», «nineteen hundred», «nineteen oh
 * five», «two thousand», «two thousand five», «twenty twenty-six».
 */
export function yearWords(value: number): string {
  const y = Math.abs(Math.trunc(value));
  if (y < 100 || y > 9999 || y % 1000 === 0 || (y > 2000 && y < 2010)) return numberWords(y);
  const head = below100(Math.floor(y / 100));
  const tail = y % 100;
  if (tail === 0) return `${head} hundred`;
  return `${head} ${tail < 10 ? `oh ${ONES[tail]}` : below100(tail)}`;
}

/** A number inside a text: the digit is shown, the word is said. */
export const num = (n: number): string => say(n, numberWords(n));
/** «3rd» shown, «third» said. */
export const ord = (n: number): string => say(`${n}${['th', 'st', 'nd', 'rd'][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] ?? 'th'}`, ordinalWords(n));
/** A year inside a text: «1846» shown, «eighteen forty-six» said. */
export const year = (y: number): string => say(y, yearWords(y));
