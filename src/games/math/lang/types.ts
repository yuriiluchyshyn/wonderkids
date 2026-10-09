import type { ModuleTexts } from '@/core/game/kernel/types';
import type { ClockTime } from '@/core/game/templates/types';
import type { CurrencyId } from '@/core/game/content/currency';
import type { MathOp } from '../ids';
import type { FractionOpsTier } from '../generators/fractionOps';

/**
 * Everything the Math galaxy says, in one language. The generators hold the
 * numbers and the boards and no words at all: every sentence is asked of the
 * `MathTexts` of the language the task is made in (`mathTexts(config.lang)`).
 * A language is one file here — `uk.ts` (the original), `en.ts`, `pl.ts` —
 * and a new one is one more.
 *
 * Numbers inside a sentence are digits; the voice of the language turns them
 * into words (`core/lang/<code>/voice.ts`). Where the word depends on what is
 * counted — «дві купки», «dwie kupki» — the sentence marks it with `num`.
 */
export interface MathTexts {
  /** The words of the galaxy's cards (the Ukrainian ones are the cards themselves). */
  cards?: ModuleTexts;

  /** The first words of a game: `it` is the pictogram of what the child's theme collects. */
  intro: {
    add(it: string): string;
    sub(it: string): string;
    mul(it: string): string;
    div(it: string): string;
    mixed: string;
    fractions: string;
    other: string;
  };

  /** «3 однакові купки» — a count of equal heaps. */
  heaps(n: number): string;

  mental: {
    prompt(a: number, b: number, op: MathOp): string;
    hint(a: number, b: number, op: MathOp): string;
  };

  balance: {
    prompt: string;
    reduce(n: number, d: number, simpleN: number, simpleD: number): string;
    add(a: number, b: number): string;
    sub(a: number, b: number): string;
    mul(a: number, b: number): string;
  };

  fractions: {
    /** Seven foods, in the form the question needs («піци», «the pizza», «pizzy»). */
    foods: readonly string[];
    prompt(food: string): string;
    hint(filled: number, denom: number): string;
  };

  fractionOps: {
    intro: Record<FractionOpsTier, string>;
    /** The sum as it is said: «Обчисли: 1 з 2 плюс 1 з 4». */
    prompt(a: Fraction, op: string, b: Fraction): string;
  };

  compare: {
    plus(a: number, b: number): string;
    minus(a: number, b: number): string;
    times(a: number, b: number): string;
    /** Five pairs of measures, in the order of the generator's own list (m, kg, h, cm, l). */
    units: readonly MeasureWords[];
    signs: { lt: string; eq: string; gt: string };
    rule: string;
    verdict(left: string, right: string, sign: 'lt' | 'eq' | 'gt'): string;
    prompt(left: string, right: string): string;
    yes(verdict: string): string;
    hint(rule: string, left: number, right: number): string;
  };

  clock: {
    say(time: ClockTime): string;
    intro: { hours: string; half: string; quarter: string; minutes: string };
    hint(time: ClockTime): string;
    yes(time: string): string;
    find(time: string): string;
    read: string;
  };

  maze: {
    negatives: string;
    deadEnds: string;
    table(k: number): string;
    divisible(k: number): string;
    hint(k: number, deadEnds: boolean, negative: boolean): string;
  };

  shop: {
    /** Ten toys, in the order of the generator's own list. */
    toys: readonly string[];
    change(toy: string, price: string, paid: string): string;
    buy(toy: string, price: string): string;
    changeHint(paid: number, price: number): string;
    payHint(price: number): string;
  };

  geometry: {
    /** The twenty-four pictures, in the order of the generator's own list: a name and what to tell about it. */
    figures: readonly (readonly [name: string, say: string])[];
    build(name: string): string;
    buildHint: string;
    count(name: string, shape: Shape): string;
    countHint(shape: Shape): string;
    areaRead: string;
    areaIs(area: number): string;
    areaHint: string;
    /** Six animals to build a pen for, in the form the sentence needs. */
    pens: readonly string[];
    pen(animal: string, area: number): string;
    penDone(area: number): string;
    penHint(area: number): string;
    perimeterRead: string;
    perimeterIs(length: number): string;
    perimeterHint: string;
    longest: string;
    longestIs(length: number): string;
    longestHint: string;
    intro: { figures: string; area: string; perimeter: string };
  };

  /** The money of a task, in this language's words. */
  money(id: CurrencyId): MoneyWords;
}

/** A fraction: `n` parts of `d`. */
export interface Fraction {
  n: number;
  d: number;
}

export type Shape = 'triangle' | 'square' | 'circle' | 'rect';

/** A bigger and a smaller measure: «1 м» and «100 см». */
export interface MeasureWords {
  big: string;
  /** «3 метри» — the count of the bigger one, as it is said. */
  bigSaid(n: number): string;
  small: string;
  /** «120 сантиметрів». */
  smallSaid(n: number): string;
  rule: string;
}

export interface MoneyWords {
  /** On a price tag: «грн», «€», «zł». */
  short: string;
  /** A sum as it is shown and said (a marked number): «12 гривень». */
  sum(n: number): string;
  /** The money and its small change as a pair of measures. */
  measure: MeasureWords;
}
