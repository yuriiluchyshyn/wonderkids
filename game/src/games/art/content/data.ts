import type { Paint } from '@/core/game/templates/types';
import TEXTS from '@/locales/app/uk/games/art.json';

const J = TEXTS.content.data;

/** `name` — the colour as a paint; `paint` — «… фарба», for hints. */
export const PAINTS = {
  red: { id: 'red', name: J.PAINTS.red.name, color: '#ef4444', paint: J.PAINTS.red.paint },
  yellow: { id: 'yellow', name: J.PAINTS.yellow.name, color: '#facc15', paint: J.PAINTS.yellow.paint },
  blue: { id: 'blue', name: J.PAINTS.blue.name, color: '#2563eb', paint: J.PAINTS.blue.paint },
  white: { id: 'white', name: J.PAINTS.white.name, color: '#ffffff', paint: J.PAINTS.white.paint },
  black: { id: 'black', name: J.PAINTS.black.name, color: '#111827', paint: J.PAINTS.black.paint },
  green: { id: 'green', name: J.PAINTS.green.name, color: '#22c55e', paint: J.PAINTS.green.paint },
  orange: { id: 'orange', name: J.PAINTS.orange.name, color: '#f97316', paint: J.PAINTS.orange.paint },
} satisfies Record<string, Paint & { paint: string }>;
export type PaintId = keyof typeof PAINTS;

/** What two paints give together. */
export const MIXES = {
  green: { name: J.MIXES.green.name, color: '#22c55e', recipe: ['yellow', 'blue'] },
  orange: { name: J.MIXES.orange.name, color: '#f97316', recipe: ['red', 'yellow'] },
  purple: { name: J.MIXES.purple.name, color: '#8b5cf6', recipe: ['red', 'blue'] },
  pink: { name: J.MIXES.pink.name, color: '#f9a8d4', recipe: ['red', 'white'] },
  grey: { name: J.MIXES.grey.name, color: '#9ca3af', recipe: ['black', 'white'] },
  sky: { name: J.MIXES.sky.name, color: '#7dd3fc', recipe: ['blue', 'white'] },
  navy: { name: J.MIXES.navy.name, color: '#1e3a8a', recipe: ['blue', 'black'] },
  peach: { name: J.MIXES.peach.name, color: '#fdba74', recipe: ['orange', 'white'] },
  brown: { name: J.MIXES.brown.name, color: '#92400e', recipe: ['red', 'green'] },
  lime: { name: J.MIXES.lime.name, color: '#a3e635', recipe: ['yellow', 'green'] },
  forest: { name: J.MIXES.forest.name, color: '#166534', recipe: ['green', 'black'] },
} satisfies Record<string, { name: string; color: string; recipe: [PaintId, PaintId] }>;
export type MixId = keyof typeof MIXES;

export const PRIMARY: PaintId[] = ['red', 'yellow', 'blue'];
export const WITH_WHITE: PaintId[] = [...PRIMARY, 'white'];
export const SHADES: PaintId[] = [...PRIMARY, 'white', 'black'];
export const PEACH: PaintId[] = ['red', 'yellow', 'white', 'orange', 'blue'];
export const RICH: PaintId[] = ['red', 'yellow', 'blue', 'green', 'black'];

/**
 * One path step: the tubes on the table and the things to paint —
 * [picture, name, «… має стати …», colour]. Steps 1–3 the basic mixes,
 * 4–7 tints with white and black, 8–10 mixes with a ready-mixed colour.
 */
export const STEPS: { tubes: PaintId[]; things: [emoji: string, name: string, need: string, mix: MixId][] }[] = [
  { tubes: PRIMARY, things: [['🐸', J.STEPS[0].things[0][1], J.STEPS[0].things[0][2], 'green'], ['🍊', J.STEPS[0].things[1][1], J.STEPS[0].things[1][2], 'orange'], ['🍃', J.STEPS[0].things[2][1], J.STEPS[0].things[2][2], 'green'], ['🥕', J.STEPS[0].things[3][1], J.STEPS[0].things[3][2], 'orange']] },
  { tubes: PRIMARY, things: [['🍇', J.STEPS[1].things[0][1], J.STEPS[1].things[0][2], 'purple'], ['🍆', J.STEPS[1].things[1][1], J.STEPS[1].things[1][2], 'purple'], ['🐊', J.STEPS[1].things[2][1], J.STEPS[1].things[2][2], 'green'], ['🎃', J.STEPS[1].things[3][1], J.STEPS[1].things[3][2], 'orange']] },
  { tubes: WITH_WHITE, things: [['🥒', J.STEPS[2].things[0][1], J.STEPS[2].things[0][2], 'green'], ['🦊', J.STEPS[2].things[1][1], J.STEPS[2].things[1][2], 'orange'], ['☂️', J.STEPS[2].things[2][1], J.STEPS[2].things[2][2], 'purple']] },
  { tubes: SHADES, things: [['🐷', J.STEPS[3].things[0][1], J.STEPS[3].things[0][2], 'pink'], ['🐘', J.STEPS[3].things[1][1], J.STEPS[3].things[1][2], 'grey'], ['🌸', J.STEPS[3].things[2][1], J.STEPS[3].things[2][2], 'pink']] },
  { tubes: SHADES, things: [['🐭', J.STEPS[4].things[0][1], J.STEPS[4].things[0][2], 'grey'], ['🐳', J.STEPS[4].things[1][1], J.STEPS[4].things[1][2], 'sky'], ['🦩', J.STEPS[4].things[2][1], J.STEPS[4].things[2][2], 'pink']] },
  { tubes: SHADES, things: [['🫐', J.STEPS[5].things[0][1], J.STEPS[5].things[0][2], 'navy'], ['👖', J.STEPS[5].things[1][1], J.STEPS[5].things[1][2], 'navy'], ['🐺', J.STEPS[5].things[2][1], J.STEPS[5].things[2][2], 'grey']] },
  { tubes: PEACH, things: [['🍑', J.STEPS[6].things[0][1], J.STEPS[6].things[0][2], 'peach'], ['🦋', J.STEPS[6].things[1][1], J.STEPS[6].things[1][2], 'sky'], ['🎀', J.STEPS[6].things[2][1], J.STEPS[6].things[2][2], 'pink']] },
  { tubes: RICH, things: [['🐻', J.STEPS[7].things[0][1], J.STEPS[7].things[0][2], 'brown'], ['🌰', J.STEPS[7].things[1][1], J.STEPS[7].things[1][2], 'brown'], ['🍫', J.STEPS[7].things[2][1], J.STEPS[7].things[2][2], 'brown']] },
  { tubes: RICH, things: [['🍏', J.STEPS[8].things[0][1], J.STEPS[8].things[0][2], 'lime'], ['🍐', J.STEPS[8].things[1][1], J.STEPS[8].things[1][2], 'lime'], ['🥬', J.STEPS[8].things[2][1], J.STEPS[8].things[2][2], 'lime']] },
  { tubes: RICH, things: [['🌲', J.STEPS[9].things[0][1], J.STEPS[9].things[0][2], 'forest'], ['🥦', J.STEPS[9].things[1][1], J.STEPS[9].things[1][2], 'forest'], ['🥔', J.STEPS[9].things[2][1], J.STEPS[9].things[2][2], 'brown']] },
];

export const COLOR_FACTS = J.COLOR_FACTS;
