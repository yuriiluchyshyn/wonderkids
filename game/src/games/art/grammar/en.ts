import { MIXES, MIX_STAGES, mixKind, type ColorId, type MixId, type PaintId, type ThingId } from '@/games/art/content/data';
import type { ArtTexts } from '@/games/art/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/en/games/art.json';

/** The Art galaxy in English. */
const PAINTS: Record<PaintId, string> = J.PAINTS;
const COLORS: Record<ColorId, string> = J.COLORS;
const THINGS: Record<ThingId, string> = J.THINGS;

const low = (text: string) => text.toLowerCase();
const paintsOf = (mix: MixId) => (MIXES[mix].recipe as readonly PaintId[]).filter((p) => p !== 'glitter');
const colorOf = (mix: MixId) => COLORS[MIXES[mix].color];

export const en: ArtTexts = {
  cards: J.cards,
  introFor: (step) => {
    if (step === MIX_STAGES.shades) return J.introFor[1];
    if (step === MIX_STAGES.ready) return J.introFor[2];
    if (step === MIX_STAGES.newColors) return J.introFor[3];
    if (step === MIX_STAGES.three) return J.introFor[4];
    if (step === MIX_STAGES.shine) return J.introFor[5];
    return undefined;
  },
  paints: PAINTS,
  colors: COLORS,
  thing: (id) => THINGS[id],
  prompt: (thing, mix) => fill(J.prompt[mixKind(mix)], { at: low(THINGS[thing]), mix: low(colorOf(mix)) }),
  hint: (mix) => {
    const [a, b, c] = paintsOf(mix);
    return fill(J.hint[mixKind(mix)], { mix: low(colorOf(mix)), a: low(PAINTS[a]), b: low(PAINTS[b]), c: c ? low(PAINTS[c]) : '' });
  },
  outro: (mix) => {
    const [a, b, c] = paintsOf(mix);
    return fill(J.outro[mixKind(mix)], { a: PAINTS[a], b: low(PAINTS[b]), c: c ? low(PAINTS[c]) : '', mix: low(colorOf(mix)) });
  },
  pickColor: (color) => fill(J.colors.pick, { name: low(COLORS[color]) }),
  nameColor: J.colors.name,
};
