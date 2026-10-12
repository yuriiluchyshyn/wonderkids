import TEXTS from '@/locales/app/uk/games/art.json';

const J = TEXTS.content.data;

/**
 * Every colour the Art galaxy knows — what it looks like (`hex`) and whether
 * it sparkles (`shine`: the gold, silver and glitter colours). Their names in
 * every language are in `locales/app/<lang>/games/art.json` under the same id.
 */
export const COLORS = {
  red: { hex: '#ef4444' },
  yellow: { hex: '#facc15' },
  blue: { hex: '#2563eb' },
  green: { hex: '#22c55e' },
  orange: { hex: '#f97316' },
  purple: { hex: '#8b5cf6' },
  black: { hex: '#111827' },
  white: { hex: '#ffffff' },
  pink: { hex: '#f9a8d4' },
  brown: { hex: '#92400e' },
  grey: { hex: '#9ca3af' },
  sky: { hex: '#7dd3fc' },
  navy: { hex: '#1e3a8a' },
  lime: { hex: '#a3e635' },
  forest: { hex: '#166534' },
  peach: { hex: '#fdba74' },
  mint: { hex: '#86efac' },
  turquoise: { hex: '#14b8a6' },
  lemon: { hex: '#fef08a' },
  burgundy: { hex: '#7f1d1d' },
  olive: { hex: '#6b7a1f' },
  lilac: { hex: '#c4b5fd' },
  violetDark: { hex: '#4c1d95' },
  crimson: { hex: '#be123c' },
  beige: { hex: '#e7d3b1' },
  chocolate: { hex: '#4a2511' },
  amber: { hex: '#f59e0b' },
  lavender: { hex: '#b4a7e6' },
  coral: { hex: '#fb7f6b' },
  lightGreen: { hex: '#c5ecb4' },
  plum: { hex: '#6b2155' },
  graphite: { hex: '#3f4a5a' },
  sand: { hex: '#dcc48e' },
  brick: { hex: '#a23b24' },
  aqua: { hex: '#7fdcd0' },
  pine: { hex: '#0f3d33' },
  salmon: { hex: '#fa8072' },
  mustard: { hex: '#c9a227' },
  gold: { hex: '#e3b23c', shine: true },
  silver: { hex: '#c0c6cf', shine: true },
  bronze: { hex: '#b4743a', shine: true },
  emerald: { hex: '#10a36b', shine: true },
  ice: { hex: '#a5e3f7', shine: true },
  shinyPink: { hex: '#f472b6', shine: true },
  shinyPurple: { hex: '#a855f7', shine: true },
} satisfies Record<string, { hex: string; shine?: boolean }>;
export type ColorId = keyof typeof COLORS;

/** The tubes on the mixer's table; `glitter` is no paint, but it is poured like one. */
export const PAINTS = {
  red: { color: COLORS.red.hex },
  yellow: { color: COLORS.yellow.hex },
  blue: { color: COLORS.blue.hex },
  white: { color: COLORS.white.hex },
  black: { color: COLORS.black.hex },
  green: { color: COLORS.green.hex },
  orange: { color: COLORS.orange.hex },
  purple: { color: COLORS.purple.hex },
  brown: { color: COLORS.brown.hex },
  glitter: { color: '#e5e7eb', shine: true },
} satisfies Record<string, { color: string; shine?: boolean }>;
export type PaintId = keyof typeof PAINTS;

/**
 * What the paints give together: two of them, three, or two with glitter.
 * A mix is a colour of `COLORS`; one colour may be made two ways (brown from
 * red and green, or from all three primaries), so a mix has an id of its own.
 */
export const MIXES = {
  green: { color: 'green', recipe: ['yellow', 'blue'] },
  orange: { color: 'orange', recipe: ['red', 'yellow'] },
  purple: { color: 'purple', recipe: ['red', 'blue'] },
  pink: { color: 'pink', recipe: ['red', 'white'] },
  grey: { color: 'grey', recipe: ['black', 'white'] },
  sky: { color: 'sky', recipe: ['blue', 'white'] },
  navy: { color: 'navy', recipe: ['blue', 'black'] },
  peach: { color: 'peach', recipe: ['orange', 'white'] },
  brown: { color: 'brown', recipe: ['red', 'green'] },
  lime: { color: 'lime', recipe: ['yellow', 'green'] },
  forest: { color: 'forest', recipe: ['green', 'black'] },
  // Two paints again, one of them ready-mixed.
  mint: { color: 'mint', recipe: ['green', 'white'] },
  turquoise: { color: 'turquoise', recipe: ['blue', 'green'] },
  lemon: { color: 'lemon', recipe: ['yellow', 'white'] },
  burgundy: { color: 'burgundy', recipe: ['red', 'black'] },
  olive: { color: 'olive', recipe: ['yellow', 'black'] },
  lilac: { color: 'lilac', recipe: ['purple', 'white'] },
  violetDark: { color: 'violetDark', recipe: ['purple', 'black'] },
  crimson: { color: 'crimson', recipe: ['red', 'purple'] },
  beige: { color: 'beige', recipe: ['brown', 'white'] },
  chocolate: { color: 'chocolate', recipe: ['brown', 'black'] },
  amber: { color: 'amber', recipe: ['orange', 'yellow'] },
  // Three paints.
  brownRYB: { color: 'brown', recipe: ['red', 'yellow', 'blue'] },
  lavender: { color: 'lavender', recipe: ['red', 'blue', 'white'] },
  coral: { color: 'coral', recipe: ['red', 'yellow', 'white'] },
  lightGreen: { color: 'lightGreen', recipe: ['yellow', 'blue', 'white'] },
  plum: { color: 'plum', recipe: ['red', 'blue', 'black'] },
  graphite: { color: 'graphite', recipe: ['blue', 'black', 'white'] },
  sand: { color: 'sand', recipe: ['yellow', 'white', 'black'] },
  brick: { color: 'brick', recipe: ['red', 'yellow', 'black'] },
  aqua: { color: 'aqua', recipe: ['blue', 'green', 'white'] },
  pine: { color: 'pine', recipe: ['green', 'blue', 'black'] },
  salmon: { color: 'salmon', recipe: ['orange', 'red', 'white'] },
  mustard: { color: 'mustard', recipe: ['yellow', 'orange', 'black'] },
  // Two paints and glitter.
  gold: { color: 'gold', recipe: ['yellow', 'orange', 'glitter'] },
  silver: { color: 'silver', recipe: ['white', 'black', 'glitter'] },
  shinyPink: { color: 'shinyPink', recipe: ['red', 'white', 'glitter'] },
  bronze: { color: 'bronze', recipe: ['orange', 'brown', 'glitter'] },
  shinyPurple: { color: 'shinyPurple', recipe: ['red', 'blue', 'glitter'] },
  emerald: { color: 'emerald', recipe: ['yellow', 'blue', 'glitter'] },
  ice: { color: 'ice', recipe: ['blue', 'white', 'glitter'] },
} satisfies Record<string, { color: ColorId; recipe: PaintId[] }>;
export type MixId = keyof typeof MIXES;

/** What a mix asks of the child: two paints, three, or two and the glitter. */
export function mixKind(mix: MixId): 'two' | 'three' | 'shine' {
  const { recipe } = MIXES[mix] as { recipe: readonly PaintId[] };
  if (recipe.includes('glitter')) return 'shine';
  return recipe.length === 3 ? 'three' : 'two';
}

/** Things to paint, by id — the picture; their names (and genders) are in the language files. */
export const THINGS = Object.keys(J.THINGS) as ThingId[];
export type ThingId = keyof typeof J.THINGS;

const PRIMARY: PaintId[] = ['red', 'yellow', 'blue'];
const WITH_WHITE: PaintId[] = [...PRIMARY, 'white'];
const SHADES: PaintId[] = [...PRIMARY, 'white', 'black'];

/**
 * One path step of «Змішувач Кольорів»: the tubes on the table and the things
 * to paint — [picture, thing, mix]. Thirty steps, harder and harder:
 *  1–3   the three basic mixes;
 *  4–7   lighter and darker with white and black;
 *  8–10  a ready-mixed colour with another;
 *  11–15 new colours from two paints, among more tubes (mint, burgundy, lilac, beige…);
 *  16–23 colours that need THREE paints (lavender, coral, plum, brick…);
 *  24–30 glitter: gold, silver, bronze and the shiny colours.
 */
export const STEPS: { tubes: PaintId[]; things: [emoji: string, thing: ThingId, mix: MixId][] }[] = [
  { tubes: PRIMARY, things: [['🐸', 'frog', 'green'], ['🍊', 'orange', 'orange'], ['🍃', 'leaf', 'green'], ['🥕', 'carrot', 'orange']] },
  { tubes: PRIMARY, things: [['🍇', 'grapes', 'purple'], ['🍆', 'eggplant', 'purple'], ['🐊', 'crocodile', 'green'], ['🎃', 'pumpkin', 'orange']] },
  { tubes: WITH_WHITE, things: [['🥒', 'cucumber', 'green'], ['🦊', 'fox', 'orange'], ['☂️', 'umbrella', 'purple']] },
  { tubes: SHADES, things: [['🐷', 'pig', 'pink'], ['🐘', 'elephant', 'grey'], ['🌸', 'flower', 'pink']] },
  { tubes: SHADES, things: [['🐭', 'mouse', 'grey'], ['🐳', 'whale', 'sky'], ['🦩', 'flamingo', 'pink']] },
  { tubes: SHADES, things: [['🫐', 'blueberry', 'navy'], ['👖', 'jeans', 'navy'], ['🐺', 'wolf', 'grey']] },
  { tubes: ['red', 'yellow', 'white', 'orange', 'blue'], things: [['🍑', 'peach', 'peach'], ['🦋', 'butterfly', 'sky'], ['🎀', 'bow', 'pink']] },
  { tubes: ['red', 'yellow', 'blue', 'green', 'black'], things: [['🐻', 'bear', 'brown'], ['🌰', 'chestnut', 'brown'], ['🍫', 'chocolate', 'brown']] },
  { tubes: ['red', 'yellow', 'blue', 'green', 'black'], things: [['🍏', 'apple', 'lime'], ['🍐', 'pear', 'lime'], ['🥬', 'lettuce', 'lime']] },
  { tubes: ['red', 'yellow', 'blue', 'green', 'black'], things: [['🌲', 'fir', 'forest'], ['🥦', 'broccoli', 'forest'], ['🥔', 'potato', 'brown']] },
  // 11–15: new colours of two paints, more tubes to choose from.
  { tubes: ['yellow', 'blue', 'white', 'black', 'green'], things: [['🍦', 'icecream', 'mint'], ['🐠', 'fish', 'turquoise'], ['🍋', 'lemon', 'lemon']] },
  { tubes: ['red', 'yellow', 'white', 'black', 'green'], things: [['🍒', 'cherries', 'burgundy'], ['🫒', 'olive', 'olive'], ['🪥', 'toothbrush', 'mint']] },
  { tubes: ['red', 'blue', 'white', 'black', 'purple'], things: [['🪻', 'hyacinth', 'lilac'], ['🔮', 'crystal', 'violetDark'], ['💄', 'lipstick', 'crimson']] },
  { tubes: ['red', 'yellow', 'white', 'black', 'orange', 'brown'], things: [['🐪', 'camel', 'beige'], ['🪵', 'log', 'chocolate'], ['🍯', 'honey', 'amber']] },
  { tubes: ['red', 'yellow', 'blue', 'white', 'black', 'green', 'purple', 'brown'], things: [['🌊', 'wave', 'turquoise'], ['🦄', 'unicorn', 'lilac'], ['🥜', 'peanut', 'beige']] },
  // 16–23: three paints.
  { tubes: WITH_WHITE, things: [['🦔', 'hedgehog', 'brownRYB'], ['🧸', 'teddy', 'lavender'], ['🎈', 'balloon', 'lavender']] },
  { tubes: WITH_WHITE, things: [['🪸', 'coral', 'coral'], ['🐛', 'caterpillar', 'lightGreen'], ['🐿️', 'squirrel', 'brownRYB']] },
  { tubes: SHADES, things: [['👜', 'handbag', 'plum'], ['✏️', 'pencil', 'graphite'], ['🧦', 'socks', 'lavender']] },
  { tubes: SHADES, things: [['🏖️', 'beach', 'sand'], ['🧱', 'brick', 'brick'], ['🩰', 'balletShoes', 'coral']] },
  { tubes: SHADES, things: [['🐙', 'octopus', 'plum'], ['🏠', 'house', 'brick'], ['🦎', 'lizard', 'lightGreen']] },
  { tubes: [...SHADES, 'green'], things: [['🐬', 'dolphin', 'aqua'], ['🌵', 'cactus', 'pine'], ['🧁', 'cupcake', 'mint']] },
  { tubes: ['red', 'yellow', 'white', 'black', 'orange'], things: [['🐟', 'salmonFish', 'salmon'], ['🌭', 'hotdog', 'mustard'], ['🐚', 'shell', 'peach']] },
  { tubes: [...SHADES, 'green', 'orange'], things: [['🫧', 'bubbles', 'aqua'], ['🌷', 'tulip', 'salmon'], ['🧀', 'cheese', 'mustard']] },
  // 24–30: glitter.
  { tubes: ['red', 'yellow', 'white', 'black', 'orange', 'glitter'], things: [['👑', 'crown', 'gold'], ['🥄', 'spoon', 'silver'], ['🏆', 'trophy', 'gold']] },
  { tubes: ['red', 'yellow', 'white', 'black', 'orange', 'glitter'], things: [['🔑', 'key', 'silver'], ['👛', 'purse', 'shinyPink'], ['🔔', 'bell', 'gold']] },
  { tubes: ['red', 'yellow', 'blue', 'orange', 'brown', 'glitter'], things: [['🥉', 'medal', 'bronze'], ['👗', 'dress', 'shinyPurple'], ['🪙', 'coin', 'bronze']] },
  { tubes: ['yellow', 'blue', 'white', 'black', 'green', 'glitter'], things: [['💍', 'ring', 'emerald'], ['❄️', 'snowflake', 'ice'], ['🧊', 'icecube', 'ice']] },
  { tubes: ['red', 'yellow', 'blue', 'white', 'black', 'orange', 'brown', 'glitter'], things: [['⭐', 'star', 'gold'], ['🤖', 'robot', 'bronze'], ['🐉', 'dragon', 'emerald']] },
  { tubes: [...SHADES, 'glitter'], things: [['💖', 'heart', 'shinyPink'], ['🌙', 'moon', 'silver'], ['🎩', 'hat', 'plum']] },
  { tubes: ['red', 'yellow', 'blue', 'white', 'black', 'orange', 'brown', 'glitter'], things: [['🎺', 'trumpet', 'gold'], ['🧚', 'fairy', 'lavender'], ['🏔️', 'mountain', 'ice'], ['🚂', 'train', 'brick']] },
];

/** The steps on which a new kind of mixing begins (`introFor`): white and black, ready colours, new colours, three paints, glitter. */
export const MIX_STAGES = { shades: 4, ready: 8, newColors: 11, three: 16, shine: 24 } as const;

/**
 * «Вивчаємо кольори»: the colours each path step opens, easiest first — the
 * rainbow, then black and white, the light and dark ones, the in-between
 * shades with names of their own, the three-paint colours, and last the
 * shiny ones. Twenty steps.
 */
export const LEARN_STEPS: ColorId[][] = [
  ['red', 'yellow', 'blue', 'green', 'orange', 'purple'],
  ['black', 'white'],
  ['pink', 'brown'],
  ['grey', 'sky'],
  ['lime', 'navy'],
  ['peach', 'forest'],
  ['mint', 'turquoise'],
  ['lemon', 'burgundy'],
  ['olive', 'lilac'],
  ['crimson', 'beige'],
  ['violetDark', 'chocolate', 'amber'],
  ['lavender', 'coral'],
  ['lightGreen', 'plum'],
  ['graphite', 'sand'],
  ['brick', 'aqua'],
  ['pine', 'salmon'],
  ['mustard', 'gold'],
  ['silver', 'bronze'],
  ['emerald', 'ice'],
  ['shinyPink', 'shinyPurple'],
];
