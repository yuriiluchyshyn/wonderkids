/**
 * Engine Layer (PRD v4.0 §3.1) — game logic with no UI: the task queue of one
 * level, answer checking, and the "repeat a missed task" rule. The Presentation
 * Layer (UI templates) only renders the current task and reports answers.
 *
 * Repeat rule (§2.3): within a level a task is shown at most twice — its first
 * showing plus at most one repeat, queued when the child made a mistake on it.
 *
 * Deliberately free of React and of `@/` imports so it runs under plain
 * `node --test`.
 */

/** Unified sound codes (PRD v4.0 §3.3). */
export type SoundCode =
  | 'SND_SUCCESS'
  | 'SND_ERROR'
  | 'SND_DRAG_START'
  | 'SND_DROP_SLOT'
  | 'SND_TTS_CLICK';

export type AnimationCode = 'CELEBRATE' | 'SHAKE';

export interface AnswerResult {
  status: 'CORRECT' | 'INCORRECT';
  audio: SoundCode;
  animation: AnimationCode;
  /** True when this mistake scheduled a repeat of the task later in the level. */
  requeued: boolean;
}

export interface EngineTask {
  id: string;
}

export interface EngineConfig<TTask> {
  /** How many tasks a level has by default (5–8). */
  steps_count_default: number;
  /** Candidate tasks; the engine keeps the unique ones, up to the limit. */
  tasks: TTask[];
  /** Total showings allowed per task, including the first. Default 2. */
  maxShows?: number;
  /** Turn the repeat rule off (gentle fixed-length mode). Default true. */
  repeatOnError?: boolean;
}

/** Safety cap on tasks appended by `extend` so a level can never balloon. */
export const MAX_EXTRA_TASKS = 3;

export abstract class BaseGameEngine<TTask extends EngineTask, TUserAnswer> {
  protected taskQueue: TTask[] = [];
  protected currentTaskIndex = 0;
  /** taskId → mistakes made on it so far (across both showings). */
  protected errorHistory: Map<string, number> = new Map();
  /** taskId → how many times it sits in the queue. */
  protected showCount: Map<string, number> = new Map();
  protected stepsLimit = 6;
  protected extraCount = 0;
  protected readonly maxShows: number;
  protected readonly repeatOnError: boolean;

  constructor(config: EngineConfig<TTask>) {
    this.maxShows = config.maxShows ?? 2;
    this.repeatOnError = config.repeatOnError ?? true;
    const unique = this.prepareQueue(config.tasks);
    // Dynamic level length (§2.3): when fewer unique tasks exist than the
    // default, the level shrinks to what is available instead of repeating.
    this.stepsLimit = Math.max(0, Math.min(config.steps_count_default, unique.length));
    this.taskQueue = unique.slice(0, this.stepsLimit);
    for (const task of this.taskQueue) this.showCount.set(task.id, 1);
  }

  /** The task on screen, or null once the level is finished. */
  get currentTask(): TTask | null {
    return this.taskQueue[this.currentTaskIndex] ?? null;
  }

  /** The final task of the level (stays on screen during the finish). */
  get lastTask(): TTask | null {
    return this.taskQueue[this.taskQueue.length - 1] ?? null;
  }

  /** 0-based position of the current task in the queue. */
  get position(): number {
    return this.currentTaskIndex;
  }

  /** Current queue length: base tasks + repeats + extensions. */
  get total(): number {
    return this.taskQueue.length;
  }

  /** Length before any repeat/extension was added. */
  get baseTotal(): number {
    return this.stepsLimit;
  }

  get isFinished(): boolean {
    return this.currentTaskIndex >= this.taskQueue.length;
  }

  /** True when the current showing is the repeat of an earlier missed task. */
  get isRepeatShowing(): boolean {
    const task = this.currentTask;
    if (!task) return false;
    return this.taskQueue.findIndex((t) => t.id === task.id) < this.currentTaskIndex;
  }

  errorsFor(taskId: string): number {
    return this.errorHistory.get(taskId) ?? 0;
  }

  public submitAnswer(taskId: string, answer: TUserAnswer): AnswerResult {
    if (this.validate(taskId, answer)) {
      return { status: 'CORRECT', audio: 'SND_SUCCESS', animation: 'CELEBRATE', requeued: false };
    }
    const newErrorCount = this.errorsFor(taskId) + 1;
    this.errorHistory.set(taskId, newErrorCount);
    // Only the first mistake earns a repeat; mistakes on the repeat do not.
    const requeued = newErrorCount < 2 && this.requeueTask(taskId);
    return { status: 'INCORRECT', audio: 'SND_ERROR', animation: 'SHAKE', requeued };
  }

  /** Move on once the current task is solved. Returns the next task (or null). */
  public advance(): TTask | null {
    if (!this.isFinished) this.currentTaskIndex += 1;
    return this.currentTask;
  }

  /** Append a brand-new task (anti-guessing extension). False once capped. */
  public extend(task: TTask): boolean {
    if (this.extraCount >= MAX_EXTRA_TASKS || this.showCount.has(task.id)) return false;
    this.extraCount += 1;
    this.taskQueue.push(task);
    this.showCount.set(task.id, 1);
    return true;
  }

  /** Queue one more showing of a task at the end of the level, if allowed. */
  protected requeueTask(taskId: string): boolean {
    if (!this.repeatOnError) return false;
    const shows = this.showCount.get(taskId) ?? 0;
    if (shows === 0 || shows >= this.maxShows) return false;
    const task = this.taskQueue.find((t) => t.id === taskId);
    if (!task) return false;
    this.taskQueue.push(task);
    this.showCount.set(taskId, shows + 1);
    return true;
  }

  abstract validate(taskId: string, answer: TUserAnswer): boolean;
  /** Returns the unique, playable tasks in the order they should be asked. */
  abstract prepareQueue(tasks: TTask[]): TTask[];
}
