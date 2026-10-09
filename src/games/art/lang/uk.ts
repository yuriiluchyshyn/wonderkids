import { MIXES, PAINTS, STEPS, type MixId, type PaintId } from '../content/data';
import type { ArtTexts } from './types';

/**
 * The Art galaxy in Ukrainian — its original sentences, word for word. The
 * names of the paints, of the colours and of the things to paint are those
 * written with the content itself (`content/data.ts`).
 */

const THINGS = STEPS.flatMap((step) => step.things);
const names = <K extends string>(of: Record<K, { name: string }>) => Object.fromEntries(Object.entries<{ name: string }>(of).map(([id, { name }]) => [id, name])) as Record<K, string>;

export const uk: ArtTexts = {
  introFor: (step) => {
    if (step === 4) return 'Тепер є біла й чорна фарби. Біла робить колір світлішим, а чорна — темнішим.';
    if (step === 8) return 'Найскладніші кольори виходять, коли змішати вже готовий колір з іншим. Спробуй!';
    return undefined;
  },
  paints: names<PaintId>(PAINTS),
  mixes: names<MixId>(MIXES),
  thing: (at) => THINGS[at][1],
  prompt: (at) => `${THINGS[at][2]}. Які дві фарби треба змішати?`,
  hint: (mix, a, b) => `${MIXES[mix].name} колір вийде, якщо змішати ${PAINTS[a].paint} і ${PAINTS[b].paint} фарби.`,
  outro: (mix, a, b) => `${PAINTS[a].name} і ${PAINTS[b].name.toLowerCase()} разом дають ${MIXES[mix].name.toLowerCase()}!`,
};
