export type MathOp = '+' | '-' | '×' | '÷';

/** Sub-category ids exposed by the Math module (one adventure each). */
export const MATH_SUB = {
  add: 'add',
  sub: 'sub',
  mul: 'mul',
  div: 'div',
  mixed: 'mixed',
  fractions: 'fractions',
  fractionOps: 'fraction_ops',
  balance: 'balance',
  geometry: 'geometry',
  maze: 'maze',
  shop: 'shop',
  compare: 'compare',
  clock: 'clock',
  wordProblems: 'word_problems',
} as const;
