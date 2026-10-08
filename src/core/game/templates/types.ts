import { Mechanics } from '@/core/game/kernel/mechanics';
import type { CurrencyId } from '@/core/game/content/currency';
/**
 * Declarative task payloads for the CORE UI templates (PRD v4.0 §3.2).
 *
 * A game built on a template is pure data: its module produces one of these
 * payloads per task and uses `TemplateGameView` as its `GameView`. The
 * template (Presentation Layer) renders it and reports right/wrong attempts;
 * queueing and repeats stay in the Engine Layer.
 */

/** A simple fraction, drawn vertically (numerator over denominator). */
export interface FractionValue {
  n: number;
  d: number;
}

/**
 * A number of a sum drawn in the colour of its group of cubes in the counting
 * helper: the first number (`a`) or the second (`b`).
 */
export interface TonedGlyph {
  text: string;
  tone: 'a' | 'b';
}

/** A piece of a math line: plain text ("+", "=", "7"), a toned number or a fraction. */
export type Glyph = string | TonedGlyph | FractionValue;

/** A food cut into `denom` equal slices with `filled` of them highlighted. */
export interface PieValue {
  food: string;
  denom: number;
  filled: number;
}

/**
 * Something to count by touch, offered in the helper panel when the child
 * needs it: cubes in towers of ten (two colours for the two numbers of a sum)
 * or equal rows of dots (multiplication and division).
 */
export type Counting = { kind: 'towers'; count: number; split?: { a: number; b: number } } | { kind: 'groups'; rows: number; cols: number };

/** A time shown on an analogue clock face (`h` 1–12, `m` 0–59). */
export interface ClockTime {
  h: number;
  m: number;
}

/** Anything a child can look at, tap or drag. */
export interface Card {
  id: string;
  /** Big pictogram — the primary, pre-reader-friendly face of the card. */
  emoji?: string;
  /**
   * A real picture (a portrait) shown instead of `emoji`, which stays as the
   * stand-in if the file does not load. A light square WebP from `public/`.
   */
  image?: string;
  /** Short text label. Cards with a label get a tap-to-hear speaker button. */
  label?: string;
  /** Math content rendered instead of `label` (numbers, fractions). */
  glyphs?: Glyph[];
  /** What the speaker button says. Defaults to `label`. */
  speak?: string;
  /** A drawn, turning planet shown instead of `emoji` — its id (`'mars'`, see `PlanetArt`). */
  planet?: string;
  /** A figure drawn on a small cell grid (geometry answers). */
  shape?: { cols: number; rows: number; cells: number[] };
  /** A drawn clock face showing this time. */
  clock?: ClockTime;
  /** Draw the pictogram as a black shadow of itself (shadow lotto). */
  silhouette?: boolean;
  /** How soft the edge of that shadow is, in pixels — softer is harder to recognise. */
  blur?: number;
  /** Language the speaker reads this card in. Default: Ukrainian. */
  lang?: SpeechLang;
}

/** Languages the voice can read a card in. */
export type SpeechLang = 'uk' | 'en';

interface TemplateBase {
  /** Picture / math line shown above the answers. */
  stimulus?: {
    emoji?: string;
    /** A real picture shown instead of `emoji` (see `Card.image`). */
    image?: string;
    /** Id of a drawn illustration (see LandmarkArt) — shown instead of `emoji`. */
    art?: string;
    glyphs?: Glyph[];
    /** A drawn clock face showing this time. */
    clock?: ClockTime;
    /** A figure drawn on a small cell grid. */
    shape?: { cols: number; rows: number; cells: number[] };
    /** A finished tangram figure, drawn in colour (100×100 canvas). */
    pieces?: TangramPiece[];
    /**
     * A word problem laid out as a row of picture chips — what is known and
     * what is asked: [🍎🍎 «7 грн»] [💵 «10 грн»] [❓ «здача»].
     */
    scene?: { emoji: string; label?: string }[];
    /** A food cut into slices, some highlighted (fractions). */
    pie?: PieValue;
    caption?: string;
  };
  /** Spoken how-to, played when the helper appears. */
  hint?: string;
  /** Short spoken fact that rewards a correct answer. */
  fact?: string;
  /**
   * A tap-to-count model shown below the board once the child needs help. A
   * task that has one keeps all its answers on the board — counting is the help.
   */
  counting?: Counting;
  /**
   * A picture of the task's own clues, shown below the board once the child
   * needs help (riddles): the three animals stood in their row, the week with
   * today marked. Like `counting`, it keeps every answer on the board — the
   * help is something to think with, not fewer answers to guess from.
   */
  clue?: Clue;
}

/** One thing in a clue picture. */
export interface ClueCell {
  /** A pictogram, a number or a short word. */
  glyph: string;
  /** Small text under it (a name, a place number). */
  note?: string;
  /** The one the story is about. */
  mark?: boolean;
  /** Ruled out by the story. */
  crossed?: boolean;
  /** A bar under the thing, this many steps tall: «вищий», «старший». */
  level?: number;
  /** What stands between this cell and the one before it: «+2», «→», «✂️». */
  link?: string;
}

/** Rows of things laid out the way the story tells them. */
export interface Clue {
  rows: { label?: string; cells: ClueCell[] }[];
  /** What the two ends of a row mean: [«ліворуч», «праворуч»]. */
  ends?: [string, string];
  /** Many small things to count (a queue, a string of beads): smaller cells. */
  dense?: boolean;
}

/** UI_GRID_CHOICE — tap one card out of N. */
export interface GridChoicePayload extends TemplateBase {
  template: Mechanics.GridChoice;
  /** 3 — the usual 3×3 board; 1 — a list, for answers that are whole sentences. */
  cols: 1 | 2 | 3;
  options: Card[];
  correctId: string;
}

/** UI_DRAG_MATCH — drag every item onto its slot. */
export interface DragMatchPayload extends TemplateBase {
  template: Mechanics.DragMatch;
  items: Card[];
  slots: Card[];
  /** itemId → slotId. */
  pairs: Record<string, string>;
}

/** UI_CHRONO_SEQUENCE — put the cards in order. */
export interface SequencePayload extends TemplateBase {
  template: Mechanics.ChronoSequence;
  /** Cards in the CORRECT order. */
  cards: Card[];
  /** Card ids in the shuffled order they start in. */
  initial: string[];
  orientation: 'horizontal' | 'vertical';
  /** Labels of the first and last place. Default: «найдавніше» / «найновіше». */
  ends?: [string, string];
  /**
   * The whole row the cards are a part of, in the right order — shown as a
   * small strip below the board once the child needs help (the Sun and all
   * eight planets, for three planets to arrange).
   */
  guide?: Card[];
}

/** UI_MAP_PUZZLE — tap a region, or drag a marker onto it. */
export interface MapPuzzlePayload extends TemplateBase {
  template: Mechanics.MapPuzzle;
  /** Which layer of the world map is interactive. */
  layer: 'continents' | 'oceans';
  mode: 'tap' | 'drag';
  /** The thing being placed (drag mode) or travelling (tap mode). */
  marker: Card;
  targetId: string;
}

/** UI_BALANCE_SCALE — find the weight that balances the left pan. */
export interface BalanceScalePayload extends TemplateBase {
  template: Mechanics.BalanceScale;
  left: { glyphs: Glyph[]; value: number };
  weights: (Card & { value: number })[];
  /** Coloured dot groups for the helper cloud (e.g. [3, 4] for 3 + 4). */
  hintDots?: number[];
}

/** UI_SORTER_BINS — send the object to the right container. */
export interface SorterBinsPayload extends TemplateBase {
  template: Mechanics.SorterBins;
  item: Card;
  bins: Card[];
  correctBinId: string;
  /** binId → friendly line that bin "says" when the object does not belong
   *  there (e.g. «Бр-р-р, тут занадто холодно!»). */
  wrongSay?: Record<string, string>;
}

/** Cash tray (UI_DRAG_MATCH family) — put coins down until they add up. */
export interface CashTrayPayload extends TemplateBase {
  template: Mechanics.CashTray;
  item: Card;
  price: number;
  /** Coins and notes on offer, in whole units of `currency`. */
  wallet: number[];
  /** The money this till takes. Default: hryvnias. */
  currency?: CurrencyId;
}

/** Tangram (UI_DRAG_MATCH family) — rebuild a silhouette from shapes. */
export interface TangramPiece {
  id: string;
  shape: 'triangle' | 'square' | 'circle' | 'rect';
  /** Placement on a 100×100 canvas. */
  x: number;
  y: number;
  size: number;
  rotate?: number;
  color: string;
}

export interface TangramPayload extends TemplateBase {
  template: Mechanics.Tangram;
  figure: string;
  pieces: TangramPiece[];
}

/** Grid overlay — build a pen of a given area by colouring cells. */
export interface GridAreaPayload extends TemplateBase {
  template: Mechanics.GridArea;
  cols: number;
  rows: number;
  targetArea: number;
}

/** Number maze — walk the grid stepping only on cells that fit the rule. */
export interface NumberMazePayload extends TemplateBase {
  template: Mechanics.NumberMaze;
  cols: number;
  rows: number;
  /** Row-major cell values. */
  cells: number[];
  /** Cell indices of the route, start → finish. */
  path: number[];
  /**
   * Cells of side corridors: they fit the rule too, but lead to a dead end
   * and the child has to walk back. Empty / absent — one way through.
   */
  open?: number[];
  /** The rule, when it is "divisible by" — lets the content check verify the grid. */
  divisor?: number;
}

/**
 * Bubble pop (UI_CHRONO_SEQUENCE family) — soap bubbles float about; the child
 * pops them in the right order (letters of the alphabet, syllables or letters
 * of a word). Two bubbles with the same face are interchangeable.
 */
export interface BubblePopPayload extends TemplateBase {
  template: Mechanics.BubblePop;
  /** Bubbles in the CORRECT popping order. */
  bubbles: Card[];
  /** Decoy bubbles that never pop. */
  extras?: Card[];
  /** What is being built (picture, word, speaker) — shown above the bubbles. */
  target?: Card;
}

/** One star of a dot-to-dot figure, on a 100×100 canvas. */
export interface DotStar {
  x: number;
  y: number;
  label: string;
}

/**
 * Dot-to-dot (UI_CHRONO_SEQUENCE family) — join the stars in the order of
 * their labels; the finished line reveals the figure.
 */
export interface DotToDotPayload extends TemplateBase {
  template: Mechanics.DotToDot;
  /** Stars in the CORRECT joining order. */
  stars: DotStar[];
  /** What the finished drawing turns out to be. */
  figure: { name: string; emoji: string };
  /**
   * «Знайди сузір’я»: the stars carry no labels and are lost among `decoys` —
   * other stars of the sky. The child finds the figure by its slightly bigger
   * stars (`ratio` times a decoy's size) and joins them, in any order.
   */
  find?: { decoys: { x: number; y: number }[]; ratio: number };
}

/** A tube of paint. */
export interface Paint {
  id: string;
  name: string;
  /** CSS colour of the paint. */
  color: string;
}

/**
 * Colour mixer (UI_DRAG_MATCH family) — pour two paints into the cauldron to
 * get the colour the object needs.
 */
export interface ColorMixPayload extends TemplateBase {
  template: Mechanics.ColorMix;
  /** The object to paint: drawn grey until the right colour is mixed. */
  object: Card;
  /** The colour to get. */
  result: Paint;
  /** Tubes on offer. */
  paints: Paint[];
  /** Ids of the two paints that give `result`. */
  recipe: [string, string];
}

/**
 * Letter table (UI_DRAG_MATCH family) — a run of the alphabet laid out in
 * rows. Either some places are empty and their letters wait in a tray to be
 * dragged in, or the table is full but two letters have swapped places and
 * the child taps one of them.
 */
export interface LetterGridPayload extends TemplateBase {
  template: Mechanics.LetterGrid;
  cols: number;
  /** The letters in the CORRECT order, row by row. */
  cells: Card[];
  /** Indices of the cells that start empty; their letters wait in the tray. None in a "find the mistake" task. */
  gaps: number[];
  /** Show a pale copy of the letter in every empty cell — the very first steps. */
  ghosts?: boolean;
  /** "Find the mistake": the two cells whose letters stand in each other's place. Tapping either answers. */
  swapped?: [number, number];
}

export type TemplatePayload =
  | GridChoicePayload
  | DragMatchPayload
  | SequencePayload
  | MapPuzzlePayload
  | BalanceScalePayload
  | SorterBinsPayload
  | CashTrayPayload
  | TangramPayload
  | GridAreaPayload
  | NumberMazePayload
  | BubblePopPayload
  | DotToDotPayload
  | ColorMixPayload
  | LetterGridPayload;

/** Spoken form of a card (for the speaker button). */
export function cardSpeech(card: Card): string {
  if (card.speak) return card.speak;
  if (card.label) return card.label;
  return (card.glyphs ?? []).map(glyphSpeech).join(' ');
}

export function glyphSpeech(g: Glyph): string {
  if (typeof g !== 'string') return 'text' in g ? g.text : `${g.n} з ${g.d}`;
  switch (g) {
    case '+':
      return 'плюс';
    case '−':
    case '-':
      return 'мінус';
    case '×':
      return 'помножити на';
    case '÷':
      return 'поділити на';
    case '=':
      return 'дорівнює';
    case '?':
      return 'скільки';
    default:
      return g;
  }
}
