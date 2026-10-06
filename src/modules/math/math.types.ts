export type MathOp = '+' | '-' | '×' | '÷';

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

/** Sub-category ids exposed by the Math module (one adventure each). */
export const MATH_SUB = {
  add: 'add',
  sub: 'sub',
  mul: 'mul',
  div: 'div',
  mixed: 'mixed',
  fractions: 'fractions',
  // PRD v4.0 game pack — built on the CORE UI templates.
  fractionOps: 'fraction_ops',
  balance: 'balance',
  geometry: 'geometry',
  maze: 'maze',
  shop: 'shop',
} as const;

/** The original games with their own views and helper panel. */
export function isClassicPayload(payload: unknown): payload is MathPayload {
  return typeof payload === 'object' && payload !== null && 'kind' in payload;
}
