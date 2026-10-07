import type { ComponentType } from 'react';
import type { Theme } from '@/core/theme/theme.types';

/**
 * Core kernel contracts for the WonderKids micro-kernel plugin architecture.
 *
 * The PRD specifies an imperative `LearningModule` contract with
 * `renderGameView(container: HTMLElement, ...)`. In a React codebase we adapt
 * that contract so a module exposes a React component instead of imperatively
 * writing to a DOM node. The registry concept (register a module once, the Hub
 * discovers it) is preserved verbatim — a new subject can be added in isolation
 * without touching the core.
 */

/** Shared "all" filter presentation for the subject picker. */
export const ALL_META = {
  icon: '✨',
  subjectLabel: 'Усі',
} as const;

/**
 * Configuration passed to a module when generating a new task instance.
 *
 * `step` is the difficulty coefficient from the learning path (1..TOTAL_STEPS):
 * the module scales the task's hardness relative to it, so one mechanic covers
 * the whole ladder from easiest to mega-hard.
 */
export interface TaskConfig {
  subCategoryId: string;
  /** Path step / difficulty coefficient (1-based). */
  step: number;
  /** Monotonic index of the task within the current session (0-based). */
  index: number;
  /**
   * Number of multiple-choice answers to present (anti-guessing grid size).
   * Defaults to 9 (3×3) when a module ignores it.
   */
  choicesCount?: number;
}

/**
 * A single generated task. Modules extend `payload` with their own typed data.
 * The shell treats a task opaquely except for `prompt` (spoken aloud) and the
 * reward accrued on success.
 */
export interface TaskInstance<TPayload = unknown> {
  id: string;
  /**
   * Stable identity of the question itself (e.g. "3+4", "flag:jp"). Two tasks
   * with the same key never appear in one level. Defaults to `prompt`.
   */
  key?: string;
  /** Short natural-language prompt, read aloud via TTS for pre-readers. */
  prompt: string;
  /**
   * Short spoken (and shown) fact that rewards a correct answer — "Це прапор
   * Японії!". The shell gives it time to play before the next task. A list is
   * a pool: every time the task is solved the child hears the next text from
   * it (`core/game/content/outro.ts`), so a replay tells a new story.
   */
  outro?: string | string[];
  /** Artifacts awarded for completing this task. */
  reward: number;
  payload: TPayload;
}

/** Callbacks the shell hands to a module's game view. */
export interface TaskCallbacks {
  /** Child produced the correct answer. */
  onSuccess: () => void;
  /**
   * Child produced a wrong answer. Zero-aggression: this never penalises, it
   * only lets the shell count attempts and raise a scaffolding hint.
   */
  onMistake: () => void;
  /** Ask the shell to (re)speak the current prompt. */
  speakPrompt: () => void;
}

/** Props every module game view receives from the game shell. */
export interface GameViewProps<TPayload = unknown> {
  task: TaskInstance<TPayload>;
  callbacks: TaskCallbacks;
  /**
   * True once the shell wants a visual helper. Only mistakes turn it on: two
   * on a task (one on the repeat of a task missed earlier) — never a pause.
   */
  hintActive: boolean;
}

/** `path`: steps of rising difficulty. `free`: open play, no levels. */
export type Progression = 'path' | 'free';

/** Difficulty marking shown as 1–3 stars (PRD v4.0 §1.2). */
export type Difficulty = 1 | 2 | 3;

/** Core UI templates a game can be built from (PRD v4.0 §3.2). */
export type MechanicsType =
  | 'UI_GRID_CHOICE'
  | 'UI_DRAG_MATCH'
  | 'UI_CHRONO_SEQUENCE'
  | 'UI_MAP_PUZZLE'
  | 'UI_BALANCE_SCALE'
  | 'UI_SORTER_BINS';

/** Age band each difficulty targets. */
export const DIFFICULTY_AGES: Record<Difficulty, string> = {
  1: '6–7 років',
  2: '7–8 років',
  3: '9–10 років',
};

/**
 * A short animated picture shown before a game begins, next to its spoken
 * intro: a row of pictures ('*' = the collectible of the active theme), equal
 * groups of dots, or a food cut into slices with its fraction.
 */
export type IntroDemo =
  | { kind: 'row'; items: string[] }
  | { kind: 'groups'; groups: number[]; caption: string }
  | { kind: 'pie'; food: string; denom: number; filled: number };

/** A selectable card category inside a subject (shown in the Hub catalog). */
export interface SubCategory {
  id: string;
  label: string;
  icon: string;
  /** Short child-facing description. */
  blurb: string;
  /**
   * Very short, child-facing explanation spoken (and shown) before play begins
   * — e.g. what fractions are and why they're written that way (PRD §4).
   */
  intro?: string;
  /** Animated picture shown with the intro. */
  demo?: IntroDemo;
  /**
   * How many difficulty steps this adventure's path has. Different adventures
   * can be longer or shorter (e.g. mental arithmetic has many steps, fractions
   * fewer). Defaults to DEFAULT_STEPS when omitted.
   */
  steps?: number;

  /**
   * What this game builds in the child's world («Землі знань»): a landmark
   * that grows in four stages as the child progresses. `stages` names what
   * appears at each stage (e.g. countries for a geography game); without it
   * the same building simply grows.
   */
  landmark?: { name: string; emoji: string; stages?: [string, string][] };

  /**
   * How the game is entered from the Hub:
   * - `path` (default): a Duolingo-style ladder — every next step is harder
   *   than the one before, the child climbs it via «Мій шлях».
   * - `free`: the content has no meaningful difficulty to grow (sort the
   *   rubbish, name the five oceans). No ladder — the card opens straight into
   *   play, all content is available, and it can be replayed without limit.
   */
  progression?: Progression;

  // ---- Declarative game config (PRD v4.0 §1.2) ----
  /** Globally unique game id, e.g. "geo_flags_quiz". Defaults to `${module}_${id}`. */
  gameId?: string;
  /** 1–3 stars; a pair marks a game that grows from one band to another. */
  difficulty?: Difficulty | [Difficulty, Difficulty];
  /**
   * UTC publication date (ISO 8601). Before it the game is listed but locked
   * («Скоро»); for 60 days after it the card carries a "NEW" badge.
   */
  publishDate?: string;
  /**
   * Tasks in one level (`steps_count_default`), 5–10 — required, every game
   * decides for itself: 10 suits a quick tap-the-answer game on a path (half
   * new for the step, half recalled from earlier steps — `core/game/engine/recall`),
   * 6 a free-play game, 5 a game whose single task is long (the number maze).
   * A level shrinks on its own when fewer unique tasks exist. NOT the path
   * length — that is `steps`.
   */
  tasksPerLevel: number;
  /** UI template(s) the game is built on. */
  mechanics?: MechanicsType | MechanicsType[];
  /**
   * The game shows text a child has to read (tasks or answers). Enables the
   * tap-to-hear speaker buttons and the first-run guide pointing at them.
   */
  hasText?: boolean;
}

/**
 * The plugin contract. A learning subject (Math, Geography, ...) implements this
 * and registers itself with the ModuleRegistry.
 */
export interface LearningModule {
  id: string;
  title: string;
  icon: string;
  /** Accent colour used by catalog cards for this subject. */
  accent: string;
  subCategories: SubCategory[];
  /** Pure task generator — no side effects, fully deterministic given config + rng. */
  generateTask: (config: TaskConfig) => TaskInstance;
  /**
   * Optional: build the candidate tasks of a whole level at once. Content-based
   * games (a fixed set of flags, animals, people…) implement this to hand out
   * distinct items; without it the shell calls `generateTask` repeatedly and
   * drops duplicates. May return fewer than `count` — the level then shrinks.
   */
  buildLevel?: (config: Omit<TaskConfig, 'index'>, count: number) => TaskInstance[];
  /** React component that renders the interactive game for a task. */
  GameView: ComponentType<GameViewProps>;
  /**
   * Optional visual helper rendered beside/over the game when the
   * Zero-Aggression Scaffolding Engine activates. If omitted the shell shows a
   * generic encouraging helper.
   */
  VisualHelper?: ComponentType<GameViewProps>;
  /**
   * Optional: how many different tasks a game has in total. Shown on the card
   * of a free-play game («100 завдань»), where there is no path to show.
   */
  taskCount?: (subCategoryId: string) => number;
  /**
   * Optional: how many different tasks a game can ask at a given path step
   * (everything unlocked up to it). Content games know this exactly; without
   * it the admin summary estimates by sampling `generateTask`.
   */
  tasksAt?: (subCategoryId: string, step: number) => number;
  /**
   * Whether `VisualHelper` has something to show for this task. Defaults to
   * true; lets one module mix games with and without a separate helper panel.
   */
  showsHelper?: (task: TaskInstance) => boolean;
  /**
   * Optional spoken, task-aware explanation of HOW to solve the current task,
   * played when the scaffolding hint appears. Keep it short and encouraging.
   */
  getHintSpeech?: (task: TaskInstance) => string;
  /**
   * Optional child-level intro for an adventure, themed to the active skin
   * (e.g. counts in apples / bricks / snowflakes). Overrides SubCategory.intro.
   * `step` lets a game explain each new task type as the path reaches it.
   */
  getIntro?: (subCategoryId: string, theme: Theme, step: number) => string | undefined;
}
