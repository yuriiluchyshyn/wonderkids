import { publishStatus, type PublishStatus } from '@/core/engine/publish';
import { PATH_TASKS_PER_LEVEL } from '@/core/engine/recall';
import {
  DEFAULT_TASKS_PER_LEVEL,
  type Difficulty,
  type LearningModule,
  type MechanicsType,
  type Progression,
  type SubCategory,
} from './types';

/**
 * The declarative game config from PRD v4.0 §1.2, in the wire shape a CMS /
 * database would store. Today it is derived from the code-defined modules; the
 * same shape lets the catalog move server-side later without touching games.
 */
export interface GameConfig {
  game_id: string;
  module: string;
  title_key: string;
  /** 1 – easy (6–7 y), 2 – medium (7–8 y), 3 – hard (9–10 y). */
  difficulty: Difficulty;
  /** Upper bound when the game spans difficulty bands. */
  difficulty_max: Difficulty;
  /** 'path' — a ladder of rising difficulty; 'free' — open play, no levels. */
  progression: Progression;
  publish_date: string | null;
  steps_count_default: number;
  mechanics_type: MechanicsType | null;
  assets: { icon: string };
}

export function difficultyRange(sub: Pick<SubCategory, 'difficulty'>): [Difficulty, Difficulty] {
  const d = sub.difficulty ?? 1;
  return Array.isArray(d) ? d : [d, d];
}

/** A game without a difficulty ladder: opens straight into unlimited play. */
export function isFreePlay(sub: Pick<SubCategory, 'progression'>): boolean {
  return sub.progression === 'free';
}

/**
 * Tasks in one level. A path game always asks `PATH_TASKS_PER_LEVEL` (half
 * new, half recall); only free-play games choose their own length.
 */
export function tasksPerLevel(sub: Pick<SubCategory, 'tasksPerLevel' | 'progression'>): number {
  if (!isFreePlay(sub)) return PATH_TASKS_PER_LEVEL;
  return sub.tasksPerLevel ?? DEFAULT_TASKS_PER_LEVEL;
}

export function gameStatus(sub: Pick<SubCategory, 'publishDate'>, now?: number): PublishStatus {
  return publishStatus(sub.publishDate, now);
}

export function toGameConfig(module: LearningModule, sub: SubCategory): GameConfig {
  const [min, max] = difficultyRange(sub);
  const gameId = sub.gameId ?? `${module.id}_${sub.id}`;
  const mechanics = Array.isArray(sub.mechanics) ? sub.mechanics[0] : sub.mechanics;
  return {
    game_id: gameId,
    module: module.id,
    title_key: `GAME_${gameId.toUpperCase()}_TITLE`,
    difficulty: min,
    difficulty_max: max,
    progression: sub.progression ?? 'path',
    publish_date: sub.publishDate ?? null,
    steps_count_default: tasksPerLevel(sub),
    mechanics_type: mechanics ?? null,
    assets: { icon: sub.icon },
  };
}
