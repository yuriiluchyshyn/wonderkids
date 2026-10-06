import { BaseGameEngine, type EngineConfig, type EngineTask } from './BaseGameEngine.ts';

/** A task that may carry a content key identifying "the same question". */
export interface KeyedTask extends EngineTask {
  /** Stable content identity (e.g. "3+4"); falls back to `prompt`, then `id`. */
  key?: string;
  prompt?: string;
}

export function taskKey(task: KeyedTask): string {
  return task.key ?? task.prompt ?? task.id;
}

/**
 * The engine every learning module plays through. Modules validate inside
 * their own view (they know their payload), so the "answer" the shell submits
 * is simply whether the child's attempt was right.
 */
export class LevelEngine<TTask extends KeyedTask = KeyedTask> extends BaseGameEngine<TTask, boolean> {
  constructor(config: EngineConfig<TTask>) {
    super(config);
  }

  validate(_taskId: string, answer: boolean): boolean {
    return answer === true;
  }

  /** Drop tasks that ask the same thing twice — a level never repeats itself. */
  prepareQueue(tasks: TTask[]): TTask[] {
    const seen = new Set<string>();
    const ids = new Set<string>();
    const unique: TTask[] = [];
    for (const task of tasks) {
      const key = taskKey(task);
      if (seen.has(key) || ids.has(task.id)) continue;
      seen.add(key);
      ids.add(task.id);
      unique.push(task);
    }
    return unique;
  }
}
