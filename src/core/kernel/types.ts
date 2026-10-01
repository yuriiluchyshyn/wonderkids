import type { ComponentType } from 'react';

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
}

/**
 * A single generated task. Modules extend `payload` with their own typed data.
 * The shell treats a task opaquely except for `prompt` (spoken aloud) and the
 * reward accrued on success.
 */
export interface TaskInstance<TPayload = unknown> {
  id: string;
  /** Short natural-language prompt, read aloud via TTS for pre-readers. */
  prompt: string;
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
  /** True once the shell has detected 2+ mistakes and wants a visual helper. */
  hintActive: boolean;
}

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
  /** React component that renders the interactive game for a task. */
  GameView: ComponentType<GameViewProps>;
  /**
   * Optional visual helper rendered beside/over the game when the
   * Zero-Aggression Scaffolding Engine activates. If omitted the shell shows a
   * generic encouraging helper.
   */
  VisualHelper?: ComponentType<GameViewProps>;
  /**
   * Optional animated demo shown in the pre-task intro (e.g. a pie splitting
   * for fractions). Receives the sub-category being introduced.
   */
  IntroView?: ComponentType<{ subCategoryId: string }>;
  /**
   * Optional spoken, task-aware explanation of HOW to solve the current task,
   * played when the scaffolding hint appears. Keep it short and encouraging.
   */
  getHintSpeech?: (task: TaskInstance) => string;
}
