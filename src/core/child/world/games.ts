import { moduleRegistry } from '@/core/game/kernel/ModuleRegistry';
import { isFreePlay } from '@/core/game/kernel/gameConfig';
import { pathKey, subSteps } from '@/core/child/progress/path';
import { playsKey } from '@/core/child/progress/plays';
import { keyBalance, keysEarned, type GameProgress } from './world';

/** How far the child is in every game of the catalog — what the world's rules are fed with. */
export function gamesProgress(progress: Record<string, number>): GameProgress[] {
  return moduleRegistry.getAll().flatMap((module) =>
    module.subCategories.map((sub) => ({
      free: isFreePlay(sub),
      steps: subSteps(sub),
      step: progress[pathKey(module.id, sub.id)] ?? 0,
      plays: progress[playsKey(module.id, sub.id)] ?? 0,
    })),
  );
}

/** Keys of knowledge the child can exchange right now: earned in the games minus spent on stations. */
export function keysOf(progress: Record<string, number>, treasures: readonly string[]): number {
  return keyBalance(keysEarned(gamesProgress(progress)), treasures);
}
