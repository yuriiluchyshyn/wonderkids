import { COLORS, MIXES, MIX_STAGES, PAINTS, mixKind, type ColorId, type MixId, type PaintId, type ThingId } from '@/games/art/content/data';
import type { ArtTexts } from '@/games/art/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/uk/games/art.json';

/**
 * The Art galaxy in Ukrainian — the language it was written in. A thing «має
 * стати» a colour in the instrumental, which agrees with the thing's gender:
 * «Жабка має стати зеленою», «Яблуко — салатовим», «Джинси мають стати
 * темно-синіми»; the forms are written with the colours (`content.data.COLORS`).
 */
const D = J.content.data;
type Gender = 'm' | 'f' | 'n' | 'p';

const names = <K extends string>(ids: readonly K[], of: Record<K, { name: string }>) => Object.fromEntries(ids.map((id) => [id, of[id].name])) as Record<K, string>;
const paintIds = Object.keys(PAINTS) as PaintId[];
const colorIds = Object.keys(COLORS) as ColorId[];
const low = (text: string) => text.toLowerCase();

/** «Жабка має стати зеленою». */
function need(thing: ThingId, mix: MixId): string {
  const { name, g } = D.THINGS[thing] as { name: string; g: Gender };
  const forms = D.COLORS[MIXES[mix].color];
  const color = g === 'f' ? forms.f : g === 'p' ? forms.p : forms.m;
  return fill(g === 'p' ? J.need.many : J.need.one, { thing: name, color });
}

/** The paints of a mix, glitter left out (the sentence names it itself). */
const paintsOf = (mix: MixId) => (MIXES[mix].recipe as readonly PaintId[]).filter((p) => p !== 'glitter');

export const uk: ArtTexts = {
  introFor: (step) => {
    if (step === MIX_STAGES.shades) return J.introFor[1];
    if (step === MIX_STAGES.ready) return J.introFor[2];
    if (step === MIX_STAGES.newColors) return J.introFor[3];
    if (step === MIX_STAGES.three) return J.introFor[4];
    if (step === MIX_STAGES.shine) return J.introFor[5];
    return undefined;
  },
  paints: names(paintIds, D.PAINTS),
  colors: names(colorIds, D.COLORS),
  thing: (id) => D.THINGS[id].name,
  prompt: (thing, mix) => fill(J.prompt[mixKind(mix)], { at: need(thing, mix) }),
  hint: (mix) => {
    const [a, b, c] = paintsOf(mix);
    const name = D.COLORS[MIXES[mix].color].name;
    return fill(J.hint[mixKind(mix)], { name, paint: D.PAINTS[a].paint, paint2: D.PAINTS[b].paint, paint3: c ? D.PAINTS[c].paint : '' });
  },
  outro: (mix) => {
    const [a, b, c] = paintsOf(mix);
    const mixName = low(D.COLORS[MIXES[mix].color].name);
    return fill(J.outro[mixKind(mix)], { name: D.PAINTS[a].name, b: low(D.PAINTS[b].name), c: c ? low(D.PAINTS[c].name) : '', mix: mixName });
  },
  pickColor: (color) => fill(J.colors.pick, { name: low(D.COLORS[color].name) }),
  nameColor: J.colors.name,
};
