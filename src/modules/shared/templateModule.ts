import { moduleRegistry } from '@/core/kernel/ModuleRegistry';
import type { LearningModule, SubCategory, TaskConfig, TaskInstance } from '@/core/kernel/types';
import type { Card, TemplatePayload } from '@/core/templates/types';
import { pick, shuffle, uid } from '@/core/utils/random';
import { TemplateGameView } from '@/components/templates/TemplateGameView';

/** Publication date of the PRD v4.0 game pack (drives the 60-day "NEW" badge). */
export const V4_RELEASE = '2026-10-06T00:00:00Z';

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
  outro?: string,
): TaskInstance<TemplatePayload> {
  return { id: uid('tt'), key, prompt, payload, reward: rewardFor(step), outro };
}

/** `correct` plus `count - 1` random others from `pool`, shuffled. */
export function withDistractors<T>(correct: T, pool: readonly T[], count: number, same: (a: T, b: T) => boolean): T[] {
  const others = shuffle(pool.filter((p) => !same(p, correct))).slice(0, Math.max(0, count - 1));
  return shuffle([correct, ...others]);
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
  /** Child-level explanation; a function when it changes along the path. */
  introFor?: (step: number) => string | undefined;
}

interface TemplateModuleDef {
  id: string;
  title: string;
  icon: string;
  accent: string;
  games: TemplateGame[];
}

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
    GameView: TemplateGameView,
    generateTask: (config) => {
      const g = game(config.subCategoryId);
      if (!g) throw new Error(`Unknown game ${def.id}:${config.subCategoryId}`);
      return pick(g.pool(config.step, config));
    },
    buildLevel: (config) => {
      const g = game(config.subCategoryId);
      return g ? shuffle(g.pool(config.step, config)) : [];
    },
    // Counted at the top of the path, where every item is unlocked.
    taskCount: (subId) => {
      const g = game(subId);
      return g ? g.pool(g.steps ?? 1, { subCategoryId: subId, step: g.steps ?? 1 }).length : 0;
    },
    getHintSpeech: (task) => (task.payload as TemplatePayload).hint ?? '',
    getIntro: (subId, _theme, step) => {
      const g = game(subId);
      return g?.introFor?.(step) ?? g?.intro;
    },
  };

  moduleRegistry.register(module);
  return module;
}
