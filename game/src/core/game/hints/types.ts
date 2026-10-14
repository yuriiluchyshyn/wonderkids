/**
 * A hint, described as data: what is said, beat by beat, what lights up while
 * each beat is said, and which picture it is drawn on.
 *
 * A generator writes one of these into its task (`payload.help`, or
 * `payload.told` for what is read out once the task is solved). The shell
 * plays it (`components/hints/HintStage`): it speaks one beat, waits for the
 * voice to reach its last word, and only then goes on to the next — so a
 * picture never runs ahead of what is being said. Whatever is on the screen
 * and has an id — a hand of the board's clock, a slice of the pie, a bubble,
 * a letter of the alphabet strip — blinks while a beat names it
 * (`useHintFocus`).
 *
 * Pure types, no React: generators import them under `node --test`.
 */
import type { ClockTime, FractionValue } from '@/core/game/templates/types';

/** One beat of a hint: a sentence, and what is shown while it is said. */
export interface HintBeat {
  /** What is said and shown. May carry `say` marks (`core/language/marks`) and, in a board's script, `{holes}`. */
  text: string;
  /**
   * The parts of the screen that blink while this beat is being said, by id:
   * `hand:hour`, `slice:3`, `glyph:0`, `piece:p2`, `bubble:b4`, `abc:T`,
   * `cmp:sign`. Several blink one after another, in the order given — so
   * «one, two, three» lights the slices as they are counted.
   */
  focus?: string[];
  /** Which part of the scene appears with this beat (and stays): `sign`, `cut`, `total`… */
  show?: string;
  /** A colour mark in front of the line, the colour of what it speaks of (the clock's hands). */
  tone?: 'hour' | 'minute' | 'day' | 'sum';
  /**
   * In a board's script: the beat is said only when this hole is filled with
   * something (`if`), or only when it is not (`unless`) — «what is left over»
   * only when something is. Settled by `fillScript`.
   */
  if?: string;
  unless?: string;
}

/** When the shell opens a help script. Absent fields keep the game's usual rule. */
export interface HintWhen {
  /** After this many wrong answers to the task (the shell's own default is two). */
  mistakes?: number;
  /** Also after a long while with no answer (`GameScreen`'s `EXPLAIN_IDLE_MS`), counted as no mistake. */
  idle?: boolean;
}

/**
 * A whole hint. `by: 'board'` — the board plays it itself, because what it
 * says depends on something only the board knows (the tile just stepped on,
 * the letter due next); the board fills the script's `{holes}` first
 * (`fillScript`). Otherwise the shell plays it when help is due (`after`).
 */
export interface HintScript {
  /** The picture the help is drawn on, under the board. None: the board itself is the picture. */
  scene?: HintScene;
  beats: HintBeat[];
  by?: 'board';
  after?: HintWhen;
  /** Hold the board still while the beats are being said (default: yes) — there is nothing to guess at yet. */
  lock?: boolean;
}

// ------------------------------------------------------------------ Scenes —

/** The clock the hint reads, drawn in the help (when the board shows none of its own). */
export interface ClockScene {
  kind: 'clock';
  time: ClockTime;
}

/**
 * A sum of fractions on strips of one length: each cut into as many parts as
 * its bottom number says, as many coloured as its top one. Each beat `show`s
 * one stage: `first`, `second`, `cut` (both re-cut into the same parts),
 * `total`, `reduced`.
 */
export interface StripsScene {
  kind: 'strips';
  op: '+' | '−';
  a: FractionValue;
  b: FractionValue;
  /** The same two fractions on one bottom, when the task's bottoms differ. */
  same?: { a: FractionValue; b: FractionValue };
  total: FractionValue;
  /** The answer as the board writes it, when it is simpler than `total`. */
  reduced?: FractionValue;
}

/**
 * How a multiple of a number gives itself away:
 *
 *   `ending`  it ends in one of a few digits (2, 5, 10)
 *   `digits`  its digits add up to a multiple of the number (3, 9)
 *   `twice`   halve it, and halve what is left (4, 8)
 *   `pair`    it divides by both of two smaller numbers (6)
 *   `count`   there is no short rule (7) — count it out
 */
export type DivisibleRule = 'ending' | 'digits' | 'twice' | 'pair' | 'count';

/**
 * Why a number is, or is not, a multiple of `by` — drawn about the number the
 * child stepped on, which the board passes as the hole `{n}`. Focus ids:
 * `div:groups`, `div:left` (what is left over), `div:mark` (what the rule looks at).
 */
export interface DivisibleScene {
  kind: 'divisible';
  by: number;
  how: DivisibleRule;
  /** `ending`: the digits a multiple ends in. `pair`: the two numbers. `twice`: the halvings. */
  marks: number[];
}

/**
 * Two amounts side by side as bars — the longer is the bigger — with the sign
 * between them opening its wide side towards the bigger one. Focus ids:
 * `cmp:left`, `cmp:right`, `cmp:sign`; `show: 'sign'` brings the sign in.
 */
export interface CompareScene {
  kind: 'compare';
  left: CompareSide;
  right: CompareSide;
  sign: 'lt' | 'eq' | 'gt';
}

/** One side of a comparison: how it is written, what it is worth (the bar's height). */
export interface CompareSide {
  text: string;
  value: number;
  /** What it comes to, written under it when that is not plain from `text`: «7», «200 см». */
  worth?: string;
}

/**
 * The whole alphabet in a strip, so the child can find where the letters of
 * the task stand in it. Focus ids: `abc:<LETTER>`.
 */
export interface AlphabetScene {
  kind: 'alphabet';
  /** As they are written, in order. */
  letters: string[];
  /** How each is said, when the voice reads the letters by name (the child's own alphabet). */
  names?: string[];
}

export type HintScene = ClockScene | StripsScene | DivisibleScene | CompareScene | AlphabetScene;
