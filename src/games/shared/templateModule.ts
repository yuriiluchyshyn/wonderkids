import { moduleRegistry } from '@/core/game/kernel/ModuleRegistry';
import type { LearningModule, SubCategory, TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import type { Card, TemplatePayload } from '@/core/game/templates/types';
import { pick, shuffle, uid } from '@/core/utils/random';
import { TemplateGameView } from '@/components/templates/TemplateGameView';
import { TemplateHelper, hasHelper } from '@/components/templates/TemplateHelper';
import { RECALL_WINDOW, composeLevel } from '@/core/game/engine/recall';
import { taskKey } from '@/core/game/engine/LevelEngine';

/** Publication date of the PRD v4.0 game pack (drives the 60-day "NEW" badge). */
export const V4_RELEASE = '2026-10-06T00:00:00Z';
/** Publication date of the Tech Spec v6 game pack (language, logic, astronomy, art). */
export const V6_RELEASE = '2026-10-07T00:00:00Z';

/** Artifacts per task — grows gently along the path. */
export function rewardFor(step: number): number {
  return 1 + Math.floor(step / 6);
}

/** A template task: `key` is the question's identity within a level. */
export function templateTask(
  key: string,
  prompt: string,
  payload: TemplatePayload,
  step: number,
  /** One fact, or a pool of them — see `core/game/content/outro.ts`. */
  outro?: string | string[],
): TaskInstance<TemplatePayload> {
  return { id: uid('tt'), key, prompt, payload, reward: rewardFor(step), outro };
}

/** `correct` plus `count - 1` random others from `pool`, shuffled. */
export function withDistractors<T>(correct: T, pool: readonly T[], count: number, same: (a: T, b: T) => boolean): T[] {
  const others = shuffle(pool.filter((p) => !same(p, correct))).slice(0, Math.max(0, count - 1));
  return shuffle([correct, ...others]);
}

type Tasks = TaskInstance<TemplatePayload>[];

/**
 * A level of a path game from its step-by-step pool (docs/level-design.md):
 * the questions this step unlocked are the new half, the ones unlocked during
 * the previous `RECALL_WINDOW` steps are the recall half, and anything older
 * tops the level up when either half is short.
 */
export function recallLevel(poolAt: (step: number) => Tasks, step: number, count: number): Tasks {
  const pool = shuffle(poolAt(step));
  if (step <= 1) return composeLevel(pool, [], count, taskKey);

  const keysAt = (s: number) => (s >= 1 ? new Set(poolAt(s).map(taskKey)) : new Set<string>());
  const before = keysAt(step - 1);
  const longAgo = keysAt(step - 1 - RECALL_WINDOW);
  const fresh = pool.filter((t) => !before.has(taskKey(t)));
  const recent = pool.filter((t) => before.has(taskKey(t)) && !longAgo.has(taskKey(t)));
  const older = pool.filter((t) => longAgo.has(taskKey(t)));
  return composeLevel(fresh, [...recent, ...older], count, taskKey);
}

/**
 * Ranked content (people by fame, flags by familiarity): which path step
 * introduces each item. The first `atStart` items open the path, then
 * `perStep` more arrive on every step. Returns 1-based steps, in list order.
 */
export function introSteps(total: number, atStart: number, perStep: number): number[] {
  return Array.from({ length: total }, (_, i) => (i < atStart ? 1 : 2 + Math.floor((i - atStart) / perStep)));
}

/** How far along its path a game is, 0..1 — content tiers key off this. */
export function progressOf(step: number, steps: number): number {
  return steps <= 1 ? 1 : Math.min(1, Math.max(0, (step - 1) / (steps - 1)));
}

/** Items available at this point of the path: easy ones first, all by the end. */
export function unlocked<T>(items: readonly T[], step: number, steps: number, atStart: number): T[] {
  const n = Math.round(atStart + (items.length - atStart) * progressOf(step, steps));
  return items.slice(0, Math.max(atStart, Math.min(items.length, n)));
}

export const card = (id: string, emoji: string | undefined, label?: string, speak?: string): Card => ({
  id,
  emoji,
  label,
  speak,
});

/**
 * One game of a template-based subject: catalog metadata plus a pure function
 * returning every task the game can ask at a given path step.
 */
export interface TemplateGame extends SubCategory {
  /** Path length. Omit for `progression: 'free'` games (no ladder). */
  steps?: number;
  /** All candidate tasks for a level at `step`. Must be side-effect free. */
  pool: (step: number, config: Omit<TaskConfig, 'index'>) => TaskInstance<TemplatePayload>[];
  /**
   * Optional: compose one level yourself, in the order tasks should be asked.
   * Without it a path game gets `recallLevel` (new + recalled questions worked
   * out from how `pool` grows step by step) and a free game a random draw.
   */
  level?: (step: number, count: number) => TaskInstance<TemplatePayload>[];
  /** Child-level explanation; a function when it changes along the path. */
  introFor?: (step: number) => string | undefined;
}

/** A subject as the hub shows it (`config.ts` of every subject folder). */
export interface SubjectDef {
  id: string;
  title: string;
  icon: string;
  accent: string;
}

/** A game's catalog card: everything about it except how its tasks are made (`config.ts`). */
export type GameCard = Omit<TemplateGame, 'pool' | 'level'>;
/** How a game's tasks are made (`tasks.ts`), keyed by the game's id. */
export type GameTasks = Pick<TemplateGame, 'pool' | 'level'>;

interface TemplateModuleDef extends SubjectDef {
  games: TemplateGame[];
}

/**
 * The screens every subject plays on: the shared template board, the shared
 * counting helper below it, and the hint read from the task itself. No subject
 * brings screens of its own.
 */
const SHARED_SCREENS: Pick<LearningModule, 'GameView' | 'VisualHelper' | 'showsHelper' | 'getHintSpeech'> = {
  GameView: TemplateGameView,
  VisualHelper: TemplateHelper,
  showsHelper: hasHelper,
  getHintSpeech: (task) => (task.payload as TemplatePayload).hint ?? '',
};

/**
 * Builds and registers a subject whose games are pure data on the CORE UI
 * templates (PRD v4.0 §3) — adding a game means adding a `TemplateGame`, no
 * view code.
 */
export function defineTemplateModule(def: TemplateModuleDef): LearningModule {
  const game = (subId: string) => def.games.find((g) => g.id === subId);

  const module: LearningModule = {
    id: def.id,
    title: def.title,
    icon: def.icon,
    accent: def.accent,
    subCategories: def.games,
    ...SHARED_SCREENS,
    generateTask: (config) => {
      const g = game(config.subCategoryId);
      if (!g) throw new Error(`Unknown game ${def.id}:${config.subCategoryId}`);
      return pick(g.pool(config.step, config));
    },
    buildLevel: (config, count) => {
      const g = game(config.subCategoryId);
      if (!g) return [];
      if (g.level) return g.level(config.step, count);
      if (g.progression === 'free') return shuffle(g.pool(config.step, config));
      return recallLevel((step) => g.pool(step, { ...config, step }), config.step, count);
    },
    // Counted at the top of the path, where every item is unlocked.
    taskCount: (subId) => {
      const g = game(subId);
      return g ? g.pool(g.steps ?? 1, { subCategoryId: subId, step: g.steps ?? 1 }).length : 0;
    },
    tasksAt: (subId, step) => {
      const g = game(subId);
      return g ? new Set(g.pool(step, { subCategoryId: subId, step }).map(taskKey)).size : 0;
    },
    getIntro: (subId, _theme, step) => {
      const g = game(subId);
      return g?.introFor?.(step) ?? g?.intro;
    },
  };

  moduleRegistry.register(module);
  return module;
}

/**
 * Registers a subject from the two halves every subject folder keeps apart:
 * the cards of its games (`config.ts`) and their task generators (`tasks.ts`).
 */
export function defineSubject(subject: SubjectDef, games: GameCard[], tasks: Record<string, GameTasks>): LearningModule {
  return defineTemplateModule({
    ...subject,
    games: games.map((game) => {
      const made = tasks[game.id];
      if (!made) throw new Error(`Game ${subject.id}:${game.id} has a card but no tasks`);
      return { ...game, ...made };
    }),
  });
}

/**
 * Registers a subject whose tasks are generated one at a time rather than
 * drawn from a pool (Math: sums with random numbers). It plays on the same
 * shared screens; the shell builds its levels from repeated `generateTask`.
 */
export function defineGeneratedSubject(
  subject: SubjectDef,
  games: SubCategory[],
  made: Pick<LearningModule, 'generateTask' | 'getIntro'>,
): LearningModule {
  const module: LearningModule = { ...subject, subCategories: games, ...SHARED_SCREENS, ...made };
  moduleRegistry.register(module);
  return module;
}
