import { fill } from '@/core/language/fill';

/**
 * The words of the Math galaxy's helps that are put together the same way in
 * every language — a language brings only its sentences (`games/math.json`)
 * and the numbers already in its own words. Free of React.
 */

/** «Більше, менше, дорівнює»: the sentences of its help, as `compare.help` has them. */
export interface CompareHelpJson {
  left: string;
  leftWorth: string;
  right: string;
  rightWorth: string;
  more: string;
  same: string;
  sign: string;
  signSame: string;
}

export interface CompareHelpTexts {
  /** «Ліворуч 3 + 4 — це 7.» — what the left side is, and what it comes to when that is not plain. */
  left(left: string, worth?: string): string;
  right(right: string, worth?: string): string;
  /** «10 більше: його стовпчик вищий.» */
  more(big: string): string;
  same: string;
  /** «Широкий бік знака — до більшого: 10 > 4.» */
  sign(left: string, sign: string, right: string): string;
  signSame(left: string, right: string): string;
}

export const compareHelp = (J: CompareHelpJson): CompareHelpTexts => ({
  left: (left, worth) => (worth ? fill(J.leftWorth, { left, worth }) : fill(J.left, { left })),
  right: (right, worth) => (worth ? fill(J.rightWorth, { right, worth }) : fill(J.right, { right })),
  more: (big) => fill(J.more, { big }),
  same: J.same,
  sign: (left, sign, right) => fill(J.sign, { left, sign, right }),
  signSame: (left, right) => fill(J.signSame, { left, right }),
});

/** «Смачні дроби»: the three beats of its help, as `fractions.help` has them. */
export interface FractionsHelpJson {
  count: string;
  all: string;
  so: string;
}

/** The slices counted (`length` — «один, два, три» in the language's words), all of them, and what that makes. */
export const fractionsHelp = (J: FractionsHelpJson, length: string, filled: number, denom: number): [count: string, all: string, so: string] => [
  fill(J.count, { length }),
  fill(J.all, { denom }),
  fill(J.so, { filled, denom }),
];
