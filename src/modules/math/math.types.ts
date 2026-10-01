export type MathOp = '+' | '-' | '×';

/** Payload for a mental-arithmetic task. */
export interface MentalMathPayload {
  kind: 'mental';
  a: number;
  b: number;
  op: MathOp;
  answer: number;
  options: number[];
}

/** A simple fraction value rendered vertically (numerator over denominator). */
export interface Fraction {
  n: number;
  d: number;
}

/** Payload for a visual-fraction task. */
export interface FractionPayload {
  kind: 'fraction';
  food: string;
  foodName: string;
  denom: number;
  filled: number;
  answer: Fraction;
  options: Fraction[];
}

export type MathPayload = MentalMathPayload | FractionPayload;

/** Sub-category ids exposed by the Math module. */
export const MATH_SUB = {
  mental: 'mental',
  fractions: 'fractions',
  multiply: 'multiply',
} as const;
