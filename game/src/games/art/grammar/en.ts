import type { MixId, PaintId } from '@/games/art/content/data';
import type { ArtTexts } from '@/games/art/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/en/games/art.json';

/** The Art galaxy in English. */

const PAINTS: Record<PaintId, string> = J.PAINTS;
const MIXES: Record<MixId, string> = J.MIXES;
/** The things to colour, in the order of `STEPS`. */
const THINGS = J.THINGS;
const low = (text: string) => text.toLowerCase();

export const en: ArtTexts = {
  cards: J.cards,
  introFor: (step) => {
    if (step === 4) return J.introFor[1];
    if (step === 8) return J.introFor[2];
    return undefined;
  },
  paints: PAINTS,
  mixes: MIXES,
  thing: (at) => THINGS[at],
  prompt: (at, mix) => fill(J.prompt, { at: low(THINGS[at]), mix: low(MIXES[mix]) }),
  hint: (mix, a, b) => fill(J.hint, { mix: low(MIXES[mix]), a: low(PAINTS[a]), b: low(PAINTS[b]) }),
  outro: (mix, a, b) => fill(J.outro, { a: PAINTS[a], b: low(PAINTS[b]), mix: low(MIXES[mix]) }),
};
