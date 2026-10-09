import type { ModuleTexts } from '@/core/game/kernel/types';

/** Everything the Logic galaxy says, in one language (see `games/math/grammar/types.ts` for how this works). */
export interface LogicTexts {
  /** The words of the galaxy's cards (the Ukrainian ones are the cards themselves). */
  cards?: ModuleTexts;
  /** What is new on a step of a game's path, by game id. */
  introFor: Record<'patterns' | 'shadows' | 'mirror' | 'riddles', (step: number) => string | undefined>;
  patterns: { prompt: string; hint(unit: number): string };
  shadows: { prompt: string; hint: string };
  mirror: {
    prompt: string;
    hint: string;
    /** The ten drawn pictures, in the order of `DRAWN` (`content/data.ts`). */
    figures: readonly string[];
  };
}
