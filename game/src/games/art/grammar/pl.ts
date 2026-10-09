import type { MixId, PaintId } from '@/games/art/content/data';
import type { ArtTexts } from '@/games/art/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/pl/games/art.json';

/** The Art galaxy in Polish. */

/** A paint: its colour («Czerwony») and the paint itself in the accusative («farbę czerwoną»). */
const PAINTS: Record<PaintId, [name: string, paint: string]> = {
  red: [J.PAINTS.red[0], J.PAINTS.red[1]], yellow: [J.PAINTS.yellow[0], J.PAINTS.yellow[1]], blue: [J.PAINTS.blue[0], J.PAINTS.blue[1]], white: [J.PAINTS.white[0], J.PAINTS.white[1]], black: [J.PAINTS.black[0], J.PAINTS.black[1]], green: [J.PAINTS.green[0], J.PAINTS.green[1]], orange: [J.PAINTS.orange[0], J.PAINTS.orange[1]],
};
/** A mixed colour: its name, and what a thing is painted («na zielono»). */
const MIXES: Record<MixId, [name: string, how: string]> = {
  green: [J.MIXES.green[0], J.MIXES.green[1]], orange: [J.MIXES.orange[0], J.MIXES.orange[1]], purple: [J.MIXES.purple[0], J.MIXES.purple[1]], pink: [J.MIXES.pink[0], J.MIXES.pink[1]], grey: [J.MIXES.grey[0], J.MIXES.grey[1]],
  sky: [J.MIXES.sky[0], J.MIXES.sky[1]], navy: [J.MIXES.navy[0], J.MIXES.navy[1]], peach: [J.MIXES.peach[0], J.MIXES.peach[1]], brown: [J.MIXES.brown[0], J.MIXES.brown[1]], lime: [J.MIXES.lime[0], J.MIXES.lime[1]],
  forest: [J.MIXES.forest[0], J.MIXES.forest[1]],
};
/**
 * The things to colour, in the order of `STEPS`: the name, and the accusative
 * the sentence needs («Pomaluj żabkę na zielono») — the colour then needs no
 * gender of its own.
 */
const THINGS: [name: string, whom: string][] = [
  [J.THINGS[0][0], J.THINGS[0][1]], [J.THINGS[1][0], J.THINGS[1][1]], [J.THINGS[2][0], J.THINGS[2][1]], [J.THINGS[3][0], J.THINGS[3][1]],
  [J.THINGS[4][0], J.THINGS[4][1]], [J.THINGS[5][0], J.THINGS[5][1]], [J.THINGS[6][0], J.THINGS[6][1]], [J.THINGS[7][0], J.THINGS[7][1]],
  [J.THINGS[8][0], J.THINGS[8][1]], [J.THINGS[9][0], J.THINGS[9][1]], [J.THINGS[10][0], J.THINGS[10][1]],
  [J.THINGS[11][0], J.THINGS[11][1]], [J.THINGS[12][0], J.THINGS[12][1]], [J.THINGS[13][0], J.THINGS[13][1]],
  [J.THINGS[14][0], J.THINGS[14][1]], [J.THINGS[15][0], J.THINGS[15][1]], [J.THINGS[16][0], J.THINGS[16][1]],
  [J.THINGS[17][0], J.THINGS[17][1]], [J.THINGS[18][0], J.THINGS[18][1]], [J.THINGS[19][0], J.THINGS[19][1]],
  [J.THINGS[20][0], J.THINGS[20][1]], [J.THINGS[21][0], J.THINGS[21][1]], [J.THINGS[22][0], J.THINGS[22][1]],
  [J.THINGS[23][0], J.THINGS[23][1]], [J.THINGS[24][0], J.THINGS[24][1]], [J.THINGS[25][0], J.THINGS[25][1]],
  [J.THINGS[26][0], J.THINGS[26][1]], [J.THINGS[27][0], J.THINGS[27][1]], [J.THINGS[28][0], J.THINGS[28][1]],
  [J.THINGS[29][0], J.THINGS[29][1]], [J.THINGS[30][0], J.THINGS[30][1]], [J.THINGS[31][0], J.THINGS[31][1]],
];
const low = (text: string) => text.toLocaleLowerCase('pl');
const first = <K extends string>(of: Record<K, [string, string]>) => Object.fromEntries(Object.entries<[string, string]>(of).map(([id, [name]]) => [id, name])) as Record<K, string>;

export const pl: ArtTexts = {
  cards: J.cards,
  introFor: (step) => {
    if (step === 4) return J.introFor[1];
    if (step === 8) return J.introFor[2];
    return undefined;
  },
  paints: first(PAINTS),
  mixes: first(MIXES),
  thing: (at) => THINGS[at][0],
  prompt: (at, mix) => fill(J.prompt, { at: THINGS[at][1], mix: MIXES[mix][1] }),
  hint: (mix, a, b) => fill(J.hint, { mix: low(MIXES[mix][0]), a: PAINTS[a][1], b: PAINTS[b][1] }),
  outro: (mix, a, b) => fill(J.outro, { a: PAINTS[a][0], b: low(PAINTS[b][0]), mix: low(MIXES[mix][0]) }),
};
