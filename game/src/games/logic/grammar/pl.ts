import type { LogicTexts } from '@/games/logic/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/pl/games/logic.json';

/** The Logic galaxy in Polish. */

const UNIT_SIZE = J.UNIT_SIZE;

export const pl: LogicTexts = {
  cards: J.cards,
  introFor: {
    patterns: (step) => {
      if (step === 3) return J.introFor.patterns[1];
      if (step === 4) return J.introFor.patterns[2];
      if (step === 7) return J.introFor.patterns[3];
      return undefined;
    },
    shadows: (step) => {
      if (step === 4) return J.introFor.shadows[1];
      if (step === 7) return J.introFor.shadows[2];
      if (step === 9) return J.introFor.shadows[3];
      return undefined;
    },
    mirror: (step) => {
      if (step === 3) return J.introFor.mirror[1];
      if (step === 7) return J.introFor.mirror[2];
      return undefined;
    },
    riddles: (step) => {
      if (step === 11) return J.introFor.riddles[1];
      if (step === 21) return J.introFor.riddles[2];
      if (step === 31) return J.introFor.riddles[3];
      if (step === 41) return J.introFor.riddles[4];
      return undefined;
    },
  },
  patterns: {
    prompt: J.patterns.prompt,
    hint: (unit) => fill(J.patterns.hint, { unit: UNIT_SIZE[unit] }),
  },
  shadows: J.shadows,
  mirror: J.mirror,
};
