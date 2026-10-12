import type { ExprToken, MathOp } from '../ids';

/**
 * A math line as a row of tokens: «(2 + 3) × 4» is `['(', 2, '+', 3, ')', '×', 4]`.
 * It is worked out the way school teaches it: brackets first, then × and ÷,
 * then + and −, each left to right. `solve` keeps every step (the lessons
 * and hints show them). `leftToRight` and `withoutBrackets` give the answers
 * a child gets by skipping a rule: they are the traps on the answer board.
 */

const isOp = (t: ExprToken): t is MathOp => t === '+' || t === '-' || t === '×' || t === '÷';
const high = (op: MathOp) => op === '×' || op === '÷';

function apply(a: number, op: MathOp, b: number): number {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '×') return a * b;
  return a / b;
}

/** One step of working out: the row before it, the tokens worked out, the result. */
export interface SolveStep {
  tokens: ExprToken[];
  /** Inclusive token range worked out in this step (a bracket pair included when it closes). */
  focus: [number, number];
  /** The three tokens worked out: `a op b`. */
  part: [number, MathOp, number];
  result: number;
  /** This step is inside brackets. */
  inBrackets: boolean;
}

/** The innermost bracket group: indices of '(' and ')', or the whole row. */
function innermost(tokens: ExprToken[]): { from: number; to: number; bracketed: boolean } {
  let open = -1;
  for (let i = 0; i < tokens.length; i += 1) {
    if (tokens[i] === '(') open = i;
    if (tokens[i] === ')') return { from: open + 1, to: i - 1, bracketed: true };
  }
  return { from: 0, to: tokens.length - 1, bracketed: false };
}

/**
 * Works the row out step by step. `null` when it is not friendly for a child:
 * a step goes below zero or a division is not whole.
 */
export function solve(start: ExprToken[]): { steps: SolveStep[]; answer: number } | null {
  let tokens = [...start];
  const steps: SolveStep[] = [];
  for (let guard = 0; guard < 20 && tokens.length > 1; guard += 1) {
    const { from, to, bracketed } = innermost(tokens);
    // A bracket around a lone number: just drop it.
    if (bracketed && from === to) {
      tokens = [...tokens.slice(0, from - 1), tokens[from], ...tokens.slice(to + 2)];
      continue;
    }
    let at = -1;
    for (let i = from; i <= to; i += 1) if (isOp(tokens[i]) && high(tokens[i] as MathOp)) { at = i; break; }
    if (at < 0) for (let i = from; i <= to; i += 1) if (isOp(tokens[i])) { at = i; break; }
    if (at < 0) return null;
    const a = tokens[at - 1];
    const op = tokens[at] as MathOp;
    const b = tokens[at + 1];
    if (typeof a !== 'number' || typeof b !== 'number') return null;
    const result = apply(a, op, b);
    if (result < 0 || !Number.isInteger(result)) return null;
    // The bracket closes with this step: it is part of what is worked out.
    const closes = bracketed && from === at - 1 && to === at + 1;
    const focus: [number, number] = closes ? [at - 2, at + 2] : [at - 1, at + 1];
    steps.push({ tokens, focus, part: [a, op, b], result, inBrackets: bracketed });
    tokens = [...tokens.slice(0, focus[0]), result, ...tokens.slice(focus[1] + 1)];
  }
  const answer = tokens[0];
  return typeof answer === 'number' && tokens.length === 1 ? { steps, answer } : null;
}

/** The answer of a child who works strictly left to right, ignoring every rule. */
export function leftToRight(tokens: ExprToken[]): number | null {
  const flat = tokens.filter((t) => t !== '(' && t !== ')');
  let acc = flat[0];
  if (typeof acc !== 'number') return null;
  for (let i = 1; i + 1 < flat.length; i += 2) {
    const op = flat[i];
    const b = flat[i + 1];
    if (!isOp(op) || typeof b !== 'number') return null;
    acc = apply(acc, op, b);
    if (acc < 0 || !Number.isInteger(acc)) return null;
  }
  return acc;
}

/** The answer of a child who does × and ÷ first but does not see the brackets. */
export function withoutBrackets(tokens: ExprToken[]): number | null {
  return solve(tokens.filter((t) => t !== '(' && t !== ')'))?.answer ?? null;
}

/** Answers a child gets by skipping a rule: whole, not negative, and not the answer. */
export function trapsOf(tokens: ExprToken[], answer: number): number[] {
  const values = [leftToRight(tokens), tokens.includes('(') ? withoutBrackets(tokens) : null];
  return [...new Set(values.filter((v): v is number => v !== null && v !== answer && v >= 0 && Number.isInteger(v)))];
}

/** «4+6×3», «(2+3)×4»: the task's key, the same in every language. */
export function keyOf(tokens: ExprToken[]): string {
  return tokens.join('');
}

/** The tokens as the board writes them. */
export function written(tokens: ExprToken[]): string[] {
  return tokens.map(String);
}
