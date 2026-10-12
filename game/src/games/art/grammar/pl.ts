import { MIXES, MIX_STAGES, mixKind, type ColorId, type MixId, type PaintId, type ThingId } from '@/games/art/content/data';
import type { ArtTexts } from '@/games/art/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/pl/games/art.json';

/**
 * The Art galaxy in Polish. A thing is painted «na» a colour («Pomaluj żabkę
 * na zielono»): the thing in the accusative and the colour as an adverb, so
 * the colour needs no gender of its own; a paint is named in the accusative
 * («farbę czerwoną»).
 */
const PAINTS: Record<PaintId, { name: string; acc: string }> = J.PAINTS;
const COLORS: Record<ColorId, { name: string; how: string }> = J.COLORS;
const THINGS: Record<ThingId, { name: string; whom: string }> = J.THINGS;

const low = (text: string) => text.toLocaleLowerCase('pl');
const paintsOf = (mix: MixId) => (MIXES[mix].recipe as readonly PaintId[]).filter((p) => p !== 'glitter');
const colorOf = (mix: MixId) => COLORS[MIXES[mix].color];
const pick = <K extends string>(of: Record<K, { name: string }>) => Object.fromEntries(Object.entries<{ name: string }>(of).map(([id, { name }]) => [id, name])) as Record<K, string>;

export const pl: ArtTexts = {
  cards: J.cards,
  introFor: (step) => {
    if (step === MIX_STAGES.shades) return J.introFor[1];
    if (step === MIX_STAGES.ready) return J.introFor[2];
    if (step === MIX_STAGES.newColors) return J.introFor[3];
    if (step === MIX_STAGES.three) return J.introFor[4];
    if (step === MIX_STAGES.shine) return J.introFor[5];
    return undefined;
  },
  paints: pick(PAINTS),
  colors: pick(COLORS),
  thing: (id) => THINGS[id].name,
  prompt: (thing, mix) => fill(J.prompt[mixKind(mix)], { at: THINGS[thing].whom, mix: colorOf(mix).how }),
  hint: (mix) => {
    const [a, b, c] = paintsOf(mix);
    return fill(J.hint[mixKind(mix)], { mix: low(colorOf(mix).name), a: PAINTS[a].acc, b: PAINTS[b].acc, c: c ? PAINTS[c].acc : '' });
  },
  outro: (mix) => {
    const [a, b, c] = paintsOf(mix);
    return fill(J.outro[mixKind(mix)], { a: PAINTS[a].name, b: low(PAINTS[b].name), c: c ? low(PAINTS[c].name) : '', mix: low(colorOf(mix).name) });
  },
  pickColor: (color) => fill(J.colors.pick, { name: low(COLORS[color].name) }),
  nameColor: J.colors.name,
};
