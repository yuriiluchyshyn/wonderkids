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
  /** Short text label. Cards with a label get a tap-to-hear speaker button. */
  label?: string;
  /** Math content rendered instead of `label` (numbers, fractions). */
  glyphs?: Glyph[];
  /** What the speaker button says. Defaults to `label`. */
  speak?: string;
  /** A figure drawn on a small cell grid (geometry answers). */
  shape?: { cols: number; rows: number; cells: number[] };
  /** A drawn clock face showing this time. */
  clock?: ClockTime;
  /** Draw the pictogram as a black shadow of itself (shadow lotto). */
  silhouette?: boolean;
  /** Language the speaker reads this card in. Default: Ukrainian. */
  lang?: SpeechLang;
}

/** Languages the voice can read a card in. */
export type SpeechLang = 'uk' | 'en';

interface TemplateBase {
  /** Picture / math line shown above the answers. */
  stimulus?: {
    emoji?: string;
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
}

/** UI_GRID_CHOICE — tap one card out of N. */
export interface GridChoicePayload extends TemplateBase {
  template: 'UI_GRID_CHOICE';
  cols: 2 | 3;
  options: Card[];
  correctId: string;
}

/** UI_DRAG_MATCH — drag every item onto its slot. */
export interface DragMatchPayload extends TemplateBase {
  template: 'UI_DRAG_MATCH';
  items: Card[];
  slots: Card[];
  /** itemId → slotId. */
  pairs: Record<string, string>;
}

/** UI_CHRONO_SEQUENCE — put the cards in order. */
export interface SequencePayload extends TemplateBase {
  template: 'UI_CHRONO_SEQUENCE';
  /** Cards in the CORRECT order. */
  cards: Card[];
  /** Card ids in the shuffled order they start in. */
  initial: string[];
  orientation: 'horizontal' | 'vertical';
  /** Labels of the first and last place. Default: «найдавніше» / «найновіше». */
  ends?: [string, string];
}

/** UI_MAP_PUZZLE — tap a region, or drag a marker onto it. */
export interface MapPuzzlePayload extends TemplateBase {
  template: 'UI_MAP_PUZZLE';
  /** Which layer of the world map is interactive. */
  layer: 'continents' | 'oceans';
  mode: 'tap' | 'drag';
  /** The thing being placed (drag mode) or travelling (tap mode). */
  marker: Card;
  targetId: string;
}

/** UI_BALANCE_SCALE — find the weight that balances the left pan. */
export interface BalanceScalePayload extends TemplateBase {
  template: 'UI_BALANCE_SCALE';
  left: { glyphs: Glyph[]; value: number };
  weights: (Card & { value: number })[];
  /** Coloured dot groups for the helper cloud (e.g. [3, 4] for 3 + 4). */
  hintDots?: number[];
}

/** UI_SORTER_BINS — send the object to the right container. */
export interface SorterBinsPayload extends TemplateBase {
  template: 'UI_SORTER_BINS';
  item: Card;
  bins: Card[];
  correctBinId: string;
  /** binId → friendly line that bin "says" when the object does not belong
   *  there (e.g. «Бр-р-р, тут занадто холодно!»). */
  wrongSay?: Record<string, string>;
}

/** Cash tray (UI_DRAG_MATCH family) — put coins down until they add up. */
export interface CashTrayPayload extends TemplateBase {
  template: 'UI_CASH_TRAY';
  item: Card;
  price: number;
  /** Coins and notes on offer, in hryvnias. */
  wallet: number[];
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
  template: 'UI_TANGRAM';
  figure: string;
  pieces: TangramPiece[];
}

/** Grid overlay — build a pen of a given area by colouring cells. */
export interface GridAreaPayload extends TemplateBase {
  template: 'UI_GRID_AREA';
  cols: number;
  rows: number;
  targetArea: number;
}

/** Number maze — walk the grid stepping only on cells that fit the rule. */
export interface NumberMazePayload extends TemplateBase {
  template: 'UI_NUMBER_MAZE';
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
  template: 'UI_BUBBLE_POP';
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
  template: 'UI_DOT_TO_DOT';
  /** Stars in the CORRECT joining order. */
  stars: DotStar[];
  /** What the finished drawing turns out to be. */
  figure: { name: string; emoji: string };
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
  template: 'UI_COLOR_MIX';
  /** The object to paint: drawn grey until the right colour is mixed. */
  object: Card;
  /** The colour to get. */
  result: Paint;
  /** Tubes on offer. */
  paints: Paint[];
  /** Ids of the two paints that give `result`. */
  recipe: [string, string];
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
  | ColorMixPayload;

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
