import { MIXES, PAINTS, STEPS, type MixId, type PaintId } from '@/games/art/content/data';
import type { ArtTexts } from '@/games/art/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/uk/games/art.json';

/**
 * The Art galaxy in Ukrainian — its original sentences, word for word. The
 * names of the paints, of the colours and of the things to paint are those
 * written with the content itself (`content/data.ts`).
 */

const THINGS = STEPS.flatMap((step) => step.things);
const names = <K extends string>(of: Record<K, { name: string }>) => Object.fromEntries(Object.entries<{ name: string }>(of).map(([id, { name }]) => [id, name])) as Record<K, string>;

export const uk: ArtTexts = {
  introFor: (step) => {
    if (step === 4) return J.introFor[1];
    if (step === 8) return J.introFor[2];
    return undefined;
  },
  paints: names<PaintId>(PAINTS),
  mixes: names<MixId>(MIXES),
  thing: (at) => THINGS[at][1],
  prompt: (at) => fill(J.prompt, { at: THINGS[at][2] }),
  hint: (mix, a, b) => fill(J.hint, { name: MIXES[mix].name, paint: PAINTS[a].paint, paint2: PAINTS[b].paint }),
  outro: (mix, a, b) => fill(J.outro, { name: PAINTS[a].name, b: PAINTS[b].name.toLowerCase(), mix: MIXES[mix].name.toLowerCase() }),
};
