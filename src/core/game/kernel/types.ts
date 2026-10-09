import { DEFAULT_LANG, type LangCode } from '@/core/lang';
import type { CurrencyId } from '../content/currency';
import type { ComponentType } from 'react';
import type { Theme } from '@/core/theme/theme.types';
import { Mechanics } from './mechanics';

/**
 * Core kernel contracts for the Pulsar Kids micro-kernel plugin architecture.
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
  /** The money a shop task counts in (the parent's setting). Default: hryvnias. */
  currency?: CurrencyId;
  /**
   * The language the task's words are in. The shell makes every task in the
   * language of the child's game — and, when the voice speaks another one, once
   * more in that (`core/game/kernel/languages.ts`). Default: Ukrainian.
   */
  lang?: LangCode;
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
  /** Short natural-language prompt, shown on screen (and read aloud unless `speak` is set). */
  prompt: string;
  /**
   * How the prompt is said, when the voice needs other words than the screen:
   * a number spelled out, a label turned into a sentence. Read it with
   * `spokenPrompt(task)` — never `task.prompt` — wherever the voice speaks.
   */
  speak?: string;
  /**
   * Short spoken (and shown) fact that rewards a correct answer — "Це прапор
   * Японії!". The shell gives it time to play before the next task. A list is
   * a pool: every time the task is solved the child hears the next text from
   * it (`core/game/content/outro.ts`), so a replay tells a new story.
   */
  outro?: string | string[];
  /**
   * The task is its language's own (a question about that language's country —
   * the longest river of Poland in Polish, of Ukraine in Ukrainian), not a
   * translation: it has no twin, and the voice reads it in the language on the
   * screen. `templateTask` sets it for a prompt with an `own` piece in it.
   * A single FACT of a language's own needs no flag — mark it `own`
   * (`core/lang/marks.ts`, `tellFact`).
   */
  own?: boolean;
  /** Artifacts awarded for completing this task. */
  reward: number;
  payload: TPayload;
  /**
   * The same task in the language of the VOICE, when that is not the language
   * on the screen: what is said about a task — its prompt, its hint, its fact —
   * is read off this one (`saidOf(task)`). Set by the shell, never by a module.
   */
  voice?: TaskInstance<TPayload>;
  /** The language this task's words are in. Set by the shell. */
  lang?: LangCode;
}

/** The task as the voice knows it: its twin in the voice's language, or the task itself. */
export const saidOf = <T extends TaskInstance>(task: T): T => (task.voice as T | undefined) ?? task;

/** What the voice says for a task: its spoken form, or the written prompt. */
export const spokenPrompt = (task: Pick<TaskInstance, 'prompt' | 'speak'>): string => task.speak ?? task.prompt;

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

export { Mechanics };
/** Core UI templates a game can be built from (PRD v4.0 §3.2) — see `mechanics.ts`. */
export type MechanicsType = Mechanics;

/** Age band each difficulty targets. */
export const DIFFICULTY_AGES: Record<Difficulty, [from: number, to: number]> = {
  1: [4, 6],
  2: [6, 8],
  3: [8, 10],
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

/**
 * A set of games inside one galaxy that the hub can narrow the list to — in
 * the Language galaxy, the games of one language. Shown as a chip with `icon`.
 */
export interface GameGroup {
  id: string;
  icon: string;
  label: string;
}

/** The words of one game's card in a language. What is left out stays as the card has it. */
export interface GameTexts {
  label: string;
  blurb: string;
  intro?: string;
  /** The caption of the animated intro picture (`demo.caption`). */
  demoCaption?: string;
}

/** The words of a module's cards in a language: `texts.en`, `texts.pl`. */
export interface ModuleTexts {
  title: string;
  games: Record<string, GameTexts>;
  /** The names of the sets its games come in, by group id. */
  groups?: Record<string, string>;
}

/** Is this game's content there in `lang`? */
export const speaks = (sub: Pick<SubCategory, 'langs'>, lang: LangCode): boolean => (sub.langs ?? [DEFAULT_LANG]).includes(lang);

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
  /** The set this game belongs to; a galaxy with two or more sets gets a filter in the hub. */
  group?: GameGroup;
  /**
   * The languages this game's content exists in. A child whose game is in
   * another language is not shown it. Default: Ukrainian only — a game says so
   * when it has learnt more (`speaks(sub, lang)`).
   */
  langs?: readonly LangCode[];
  /**
   * How many difficulty steps this adventure's path has. Different adventures
   * can be longer or shorter (e.g. mental arithmetic has many steps, fractions
   * fewer). Defaults to DEFAULT_STEPS when omitted.
   */
  steps?: number;

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
  getIntro?: (subCategoryId: string, theme: Theme, step: number, lang?: LangCode) => string | undefined;
  /**
   * The words of the module's cards — its title, each game's name, blurb and
   * intro — in the languages other than Ukrainian (which the cards themselves
   * are written in). `moduleRegistry.get(id, lang)` puts them in place.
   */
  texts?: Partial<Record<LangCode, ModuleTexts>>;
}
