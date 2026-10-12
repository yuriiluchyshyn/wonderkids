export type MathOp = '+' | '-' | '×' | '÷';

/** One piece of a math line: a number, a sign or a bracket — «(2 + 3) × 4». */
export type ExprToken = number | MathOp | '(' | ')';

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
