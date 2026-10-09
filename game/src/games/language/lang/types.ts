import type { LangCode } from '@/core/lang';
import type { GameKind } from '../tasks';

/**
 * A pack of language games as the words about it need to know it: whose
 * language it teaches, and whether that is the language the child plays in.
 *
 * A NATIVE pack is talked about from the inside — its hints quote the very
 * words and letters on the board («„кіт” починається на літеру „К”»). A
 * FOREIGN one is talked about from the outside («англійські літери»), and its
 * hints never quote: a sentence in one language read with a word of another
 * in the middle is what the voice cannot do.
 */
export interface PackView {
  lang: LangCode;
  native: boolean;
  /** Its first words are put together from syllables (not letter by letter). */
  syllables: boolean;
  /** Its hardest words are spelled by ear, with nothing written under the picture. */
  byEar: boolean;
}

export type Stage = 'abcPlain' | 'abcLong' | 'abcSpot' | 'abcWhole' | 'parts' | 'spell' | 'strays' | 'sameLetter' | 'halves' | 'assoc' | 'three' | 'long';

/** Everything the Language galaxy says about its packs, in one language of the screen. */
export interface LanguageTexts {
  title: string;
  /** The name of a pack: «Англійська мова». */
  packName(lang: LangCode): string;
  /** A card of the hub. Ukrainian keeps the words written in the pack itself and returns nothing. */
  card(p: PackView, kind: GameKind): { blurb: string; intro: string } | undefined;
  /** What is said when a path reaches a new kind of task. */
  stage(at: Stage, p: PackView): string;

  /** «В абетці літера „А” стоїть раніше, ніж літера „Б”.» — native packs only. */
  order(a: string, b: string): string;
  swapAsk(p: PackView): string;
  swapHint(p: PackView, order: string): string;
  /** «Після літери „А” в абетці стоїть літера „Б”.» / «Перед літерою „Б” …» — native packs only. */
  after(prev: string, letter: string): string;
  before(next: string, letter: string): string;
  fillAsk(p: PackView, how: 'all' | 'one' | 'many'): string;
  fillHint(p: PackView, neighbour: string): string;

  runAsk(p: PackView, from: string, to: string): string;
  runHint(p: PackView, letters: string[]): string;
  partsAsk(p: PackView, word: string): string;
  partsHint(p: PackView, word: string, parts: string[]): string;
  spellAsk(p: PackView, word: string, byEar: boolean): string;
  spellHint(p: PackView, word: string, letters: string[], byEar: boolean): string;

  firstAsk(p: PackView): string;
  firstHint(p: PackView, word: string, letter: string): string;
  sameAsk(p: PackView): string;
  sameHint(p: PackView, a: string, b: string, letter: string): string;
  halfAsk(p: PackView): string;
  halfHint(p: PackView, head: string, tail: string): string;
  assocAsk(p: PackView): string;
  assocHint(p: PackView, a: string, b: string): string;

  rhymeAsk(p: PackView): string;
  rhymeHint(p: PackView, a: string, b: string): string;
  /** «„кіт” — „пліт”. Це рима!» — native packs only. */
  rhymeYes(a: string, b: string): string;

  sentenceAsk(p: PackView): string;
  sentenceHint(p: PackView, first: string): string;
  /** The two ends of the row of words: «початок», «кінець». */
  ends: [string, string];
}
