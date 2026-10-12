import { fill } from '@/core/language/fill';
import type { ExprToken, MathOp } from '../ids';
import type { MathTexts } from './types';

/** The words of the longer rows, as each language's `math.json` has them under `mental`. */
export interface ChainWords {
  chain: { prompt: string; hint: string };
  order: { title: string; text: string; again: string; hint: string };
  brackets: { title: string; text: string; contrast: string; again: string; hint: string };
  step: Record<MathOp | '()', string>;
  when: { first: string; then: string };
  open: string;
}

type ChainTexts = Omit<MathTexts['mental'], 'prompt' | 'hint'>;

/** The longer rows of mental math in one language: its words and how it says a sign. */
export function chainTexts(J: ChainWords, opWord: (op: MathOp) => string): ChainTexts {
  const shown = (tokens: ExprToken[]) => exprWords(tokens, opWord);
  return {
    chain: (tokens) => fill(J.chain.prompt, { expr: shown(tokens) }),
    chainSaid: (tokens) => fill(J.chain.prompt, { expr: exprWords(tokens, opWord, J.open) }),
    chainHint: (first, r) => fill(J.chain.hint, { first: shown(first), r }),
    orderHint: (first) => fill(J.order.hint, { first: shown(first) }),
    bracketsHint: (first) => fill(J.brackets.hint, { first: shown(first) }),
    lesson: {
      order: { title: J.order.title, text: J.order.text, again: (first) => fill(J.order.again, { first: shown(first) }) },
      brackets: { title: J.brackets.title, text: J.brackets.text, contrast: J.brackets.contrast, again: (first) => fill(J.brackets.again, { first: shown(first) }) },
      step: (part, r, first, inBrackets) => {
        const op = part.find((t): t is MathOp => typeof t === 'string' && t !== '(' && t !== ')') ?? '+';
        return fill(J.step[inBrackets ? '()' : op], { when: first ? J.when.first : J.when.then, expr: shown(part), r });
      },
    },
  };
}

/**
 * A math line in words, the same way in every language: «(2 плюс 3) помножити
 * на 4» on the screen. For the voice, `open` replaces the brackets, which
 * cannot be heard: «у дужках 2 плюс 3, помножити на 4».
 */
export function exprWords(tokens: ExprToken[], opWord: (op: MathOp) => string, open?: string): string {
  const words: string[] = [];
  let opening = false;
  tokens.forEach((t, i) => {
    if (t === '(') {
      if (open) words.push(open);
      else opening = true;
      return;
    }
    if (t === ')') {
      // Heard, a closing bracket is a pause, unless the row ends there anyway.
      if (!open) words[words.length - 1] += ')';
      else if (i < tokens.length - 1) words[words.length - 1] += ',';
      return;
    }
    const word = typeof t === 'number' ? String(t) : opWord(t);
    words.push(opening ? `(${word}` : word);
    opening = false;
  });
  return words.join(' ');
}
