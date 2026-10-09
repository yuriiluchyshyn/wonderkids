import type { LangCode } from '@/core/language';
import type { Theme, ThemeId } from '@/core/theme/theme.types';
import { worldWords } from './words';
import { DREAM_ID, SPACEPORT_ID, itemCost, itemId, type Inhabitant, type ItemKind, type ShopItem } from './world';
import TEXTS from '../../../locales/app/uk/world.json' with { type: 'json' };

const J = TEXTS.themeWorlds;

/**
 * What each theme's world is made of: its name, nine buildings, eight small
 * decorations, and the residents that gifts bring (its own ten, then the
 * shared `VISITORS`). The tenth and final building
 * is always the theme's own "dream build".
 */
interface ThemeWorldDef {
  name: string;
  /** [emoji, name] in building order. */
  buildings: [string, string][];
  /** [emoji, name] of the eight small decorations, cheapest first. */
  decor: [string, string][];
  /** [emoji, name] in the order they move in. */
  residents: [string, string][];
}

const WORLDS: Record<ThemeId, ThemeWorldDef> = {
  galaxy: {
    name: J.WORLDS.galaxy.name,
    buildings: [['🌟', J.WORLDS.galaxy.buildings[0][1]], ['🌙', J.WORLDS.galaxy.buildings[1][1]], ['☄️', J.WORLDS.galaxy.buildings[2][1]], ['🔭', J.WORLDS.galaxy.buildings[3][1]], ['🪐', J.WORLDS.galaxy.buildings[4][1]], ['🛸', J.WORLDS.galaxy.buildings[5][1]], ['📡', J.WORLDS.galaxy.buildings[6][1]], ['🌌', J.WORLDS.galaxy.buildings[7][1]], ['🌠', J.WORLDS.galaxy.buildings[8][1]]],
    decor: [['🌠', J.WORLDS.galaxy.decor[0][1]], ['🪨', J.WORLDS.galaxy.decor[1][1]], ['🌙', J.WORLDS.galaxy.decor[2][1]], ['🚩', J.WORLDS.galaxy.decor[3][1]], ['🔦', J.WORLDS.galaxy.decor[4][1]], ['🌵', J.WORLDS.galaxy.decor[5][1]], ['💫', J.WORLDS.galaxy.decor[6][1]], ['🎆', J.WORLDS.galaxy.decor[7][1]]],
    residents: [['👽', J.WORLDS.galaxy.residents[0][1]], ['🤖', J.WORLDS.galaxy.residents[1][1]], ['👨‍🚀', J.WORLDS.galaxy.residents[2][1]], ['👾', J.WORLDS.galaxy.residents[3][1]], ['🐕', J.WORLDS.galaxy.residents[4][1]], ['🛸', J.WORLDS.galaxy.residents[5][1]], ['🐈', J.WORLDS.galaxy.residents[6][1]], ['🧑‍🔬', J.WORLDS.galaxy.residents[7][1]], ['🐉', J.WORLDS.galaxy.residents[8][1]], ['🦄', J.WORLDS.galaxy.residents[9][1]]],
  },
  unicorns: {
    name: J.WORLDS.unicorns.name,
    buildings: [['🌈', J.WORLDS.unicorns.buildings[0][1]], ['⛲', J.WORLDS.unicorns.buildings[1][1]], ['🏡', J.WORLDS.unicorns.buildings[2][1]], ['🧁', J.WORLDS.unicorns.buildings[3][1]], ['🎠', J.WORLDS.unicorns.buildings[4][1]], ['🏪', J.WORLDS.unicorns.buildings[5][1]], ['🗼', J.WORLDS.unicorns.buildings[6][1]], ['🎡', J.WORLDS.unicorns.buildings[7][1]], ['🏟️', J.WORLDS.unicorns.buildings[8][1]]],
    decor: [['🌷', J.WORLDS.unicorns.decor[0][1]], ['🍄', J.WORLDS.unicorns.decor[1][1]], ['🌸', J.WORLDS.unicorns.decor[2][1]], ['🦩', J.WORLDS.unicorns.decor[3][1]], ['⭐', J.WORLDS.unicorns.decor[4][1]], ['🎀', J.WORLDS.unicorns.decor[5][1]], ['🪄', J.WORLDS.unicorns.decor[6][1]], ['🎆', J.WORLDS.unicorns.decor[7][1]]],
    residents: [['🦄', J.WORLDS.unicorns.residents[0][1]], ['🐎', J.WORLDS.unicorns.residents[1][1]], ['🧚', J.WORLDS.unicorns.residents[2][1]], ['🦋', J.WORLDS.unicorns.residents[3][1]], ['🐇', J.WORLDS.unicorns.residents[4][1]], ['🦢', J.WORLDS.unicorns.residents[5][1]], ['🧙‍♀️', J.WORLDS.unicorns.residents[6][1]], ['🐉', J.WORLDS.unicorns.residents[7][1]], ['👸', J.WORLDS.unicorns.residents[8][1]], ['🦉', J.WORLDS.unicorns.residents[9][1]]],
  },
  cars: {
    name: J.WORLDS.cars.name,
    buildings: [['⛽', J.WORLDS.cars.buildings[0][1]], ['🔧', J.WORLDS.cars.buildings[1][1]], ['🅿️', J.WORLDS.cars.buildings[2][1]], ['🚦', J.WORLDS.cars.buildings[3][1]], ['🏪', J.WORLDS.cars.buildings[4][1]], ['🚿', J.WORLDS.cars.buildings[5][1]], ['🌉', J.WORLDS.cars.buildings[6][1]], ['🏭', J.WORLDS.cars.buildings[7][1]], ['🏟️', J.WORLDS.cars.buildings[8][1]]],
    decor: [['🚧', J.WORLDS.cars.decor[0][1]], ['🛞', J.WORLDS.cars.decor[1][1]], ['🚥', J.WORLDS.cars.decor[2][1]], ['🏁', J.WORLDS.cars.decor[3][1]], ['🌴', J.WORLDS.cars.decor[4][1]], ['🛢️', J.WORLDS.cars.decor[5][1]], ['🏆', J.WORLDS.cars.decor[6][1]], ['🎆', J.WORLDS.cars.decor[7][1]]],
    residents: [['🚓', J.WORLDS.cars.residents[0][1]], ['🚒', J.WORLDS.cars.residents[1][1]], ['🚕', J.WORLDS.cars.residents[2][1]], ['🚜', J.WORLDS.cars.residents[3][1]], ['🚌', J.WORLDS.cars.residents[4][1]], ['🏍️', J.WORLDS.cars.residents[5][1]], ['🚚', J.WORLDS.cars.residents[6][1]], ['👨‍🔧', J.WORLDS.cars.residents[7][1]], ['🚁', J.WORLDS.cars.residents[8][1]], ['🚑', J.WORLDS.cars.residents[9][1]]],
  },
  space: {
    name: J.WORLDS.space.name,
    buildings: [['🛰️', J.WORLDS.space.buildings[0][1]], ['🏠', J.WORLDS.space.buildings[1][1]], ['🌱', J.WORLDS.space.buildings[2][1]], ['🔋', J.WORLDS.space.buildings[3][1]], ['🧪', J.WORLDS.space.buildings[4][1]], ['🔭', J.WORLDS.space.buildings[5][1]], ['📡', J.WORLDS.space.buildings[6][1]], ['🛸', J.WORLDS.space.buildings[7][1]], ['🌉', J.WORLDS.space.buildings[8][1]]],
    decor: [['🌠', J.WORLDS.space.decor[0][1]], ['🪨', J.WORLDS.space.decor[1][1]], ['🚩', J.WORLDS.space.decor[2][1]], ['🌙', J.WORLDS.space.decor[3][1]], ['🔦', J.WORLDS.space.decor[4][1]], ['🌵', J.WORLDS.space.decor[5][1]], ['🤖', J.WORLDS.space.decor[6][1]], ['🎆', J.WORLDS.space.decor[7][1]]],
    residents: [['👨‍🚀', J.WORLDS.space.residents[0][1]], ['🤖', J.WORLDS.space.residents[1][1]], ['👽', J.WORLDS.space.residents[2][1]], ['🐕', J.WORLDS.space.residents[3][1]], ['👾', J.WORLDS.space.residents[4][1]], ['🐈', J.WORLDS.space.residents[5][1]], ['🧑‍🔬', J.WORLDS.space.residents[6][1]], ['🐒', J.WORLDS.space.residents[7][1]], ['🛸', J.WORLDS.space.residents[8][1]], ['🦜', J.WORLDS.space.residents[9][1]]],
  },
  dinos: {
    name: J.WORLDS.dinos.name,
    buildings: [['🥚', J.WORLDS.dinos.buildings[0][1]], ['🌴', J.WORLDS.dinos.buildings[1][1]], ['⛰️', J.WORLDS.dinos.buildings[2][1]], ['🌋', J.WORLDS.dinos.buildings[3][1]], ['🦴', J.WORLDS.dinos.buildings[4][1]], ['🏕️', J.WORLDS.dinos.buildings[5][1]], ['🌉', J.WORLDS.dinos.buildings[6][1]], ['🏞️', J.WORLDS.dinos.buildings[7][1]], ['🗿', J.WORLDS.dinos.buildings[8][1]]],
    decor: [['🌿', J.WORLDS.dinos.decor[0][1]], ['🪨', J.WORLDS.dinos.decor[1][1]], ['🦴', J.WORLDS.dinos.decor[2][1]], ['🌴', J.WORLDS.dinos.decor[3][1]], ['🥥', J.WORLDS.dinos.decor[4][1]], ['🌺', J.WORLDS.dinos.decor[5][1]], ['🦋', J.WORLDS.dinos.decor[6][1]], ['🍖', J.WORLDS.dinos.decor[7][1]]],
    residents: [['🦕', J.WORLDS.dinos.residents[0][1]], ['🦖', J.WORLDS.dinos.residents[1][1]], ['🐊', J.WORLDS.dinos.residents[2][1]], ['🦎', J.WORLDS.dinos.residents[3][1]], ['🐢', J.WORLDS.dinos.residents[4][1]], ['🦅', J.WORLDS.dinos.residents[5][1]], ['🦣', J.WORLDS.dinos.residents[6][1]], ['🐍', J.WORLDS.dinos.residents[7][1]], ['🦤', J.WORLDS.dinos.residents[8][1]], ['🧑‍🔬', J.WORLDS.dinos.residents[9][1]]],
  },
  underwater: {
    name: J.WORLDS.underwater.name,
    buildings: [['🐚', J.WORLDS.underwater.buildings[0][1]], ['🪸', J.WORLDS.underwater.buildings[1][1]], ['🫧', J.WORLDS.underwater.buildings[2][1]], ['⚓', J.WORLDS.underwater.buildings[3][1]], ['🏝️', J.WORLDS.underwater.buildings[4][1]], ['🏪', J.WORLDS.underwater.buildings[5][1]], ['🔱', J.WORLDS.underwater.buildings[6][1]], ['🗼', J.WORLDS.underwater.buildings[7][1]], ['🤿', J.WORLDS.underwater.buildings[8][1]]],
    decor: [['🌿', J.WORLDS.underwater.decor[0][1]], ['🐚', J.WORLDS.underwater.decor[1][1]], ['🪼', J.WORLDS.underwater.decor[2][1]], ['🌊', J.WORLDS.underwater.decor[3][1]], ['🪨', J.WORLDS.underwater.decor[4][1]], ['💎', J.WORLDS.underwater.decor[5][1]], ['🧰', J.WORLDS.underwater.decor[6][1]], ['🫧', J.WORLDS.underwater.decor[7][1]]],
    residents: [['🐠', J.WORLDS.underwater.residents[0][1]], ['🐙', J.WORLDS.underwater.residents[1][1]], ['🐬', J.WORLDS.underwater.residents[2][1]], ['🐢', J.WORLDS.underwater.residents[3][1]], ['🦀', J.WORLDS.underwater.residents[4][1]], ['🐳', J.WORLDS.underwater.residents[5][1]], ['🦈', J.WORLDS.underwater.residents[6][1]], ['🧜‍♀️', J.WORLDS.underwater.residents[7][1]], ['🦑', J.WORLDS.underwater.residents[8][1]], ['🐡', J.WORLDS.underwater.residents[9][1]]],
  },
  forest: {
    name: J.WORLDS.forest.name,
    buildings: [['🍄', J.WORLDS.forest.buildings[0][1]], ['🪵', J.WORLDS.forest.buildings[1][1]], ['🛖', J.WORLDS.forest.buildings[2][1]], ['🌻', J.WORLDS.forest.buildings[3][1]], ['🐝', J.WORLDS.forest.buildings[4][1]], ['🌉', J.WORLDS.forest.buildings[5][1]], ['🏕️', J.WORLDS.forest.buildings[6][1]], ['⛲', J.WORLDS.forest.buildings[7][1]], ['🌳', J.WORLDS.forest.buildings[8][1]]],
    decor: [['🌼', J.WORLDS.forest.decor[0][1]], ['🌲', J.WORLDS.forest.decor[1][1]], ['🪨', J.WORLDS.forest.decor[2][1]], ['🍓', J.WORLDS.forest.decor[3][1]], ['🌳', J.WORLDS.forest.decor[4][1]], ['🪺', J.WORLDS.forest.decor[5][1]], ['🦋', J.WORLDS.forest.decor[6][1]], ['🔥', J.WORLDS.forest.decor[7][1]]],
    residents: [['🦊', J.WORLDS.forest.residents[0][1]], ['🐻', J.WORLDS.forest.residents[1][1]], ['🦉', J.WORLDS.forest.residents[2][1]], ['🐿️', J.WORLDS.forest.residents[3][1]], ['🦔', J.WORLDS.forest.residents[4][1]], ['🦌', J.WORLDS.forest.residents[5][1]], ['🐇', J.WORLDS.forest.residents[6][1]], ['🐺', J.WORLDS.forest.residents[7][1]], ['🦡', J.WORLDS.forest.residents[8][1]], ['🐝', J.WORLDS.forest.residents[9][1]]],
  },
  lego: {
    name: J.WORLDS.lego.name,
    buildings: [['🧱', J.WORLDS.lego.buildings[0][1]], ['🏠', J.WORLDS.lego.buildings[1][1]], ['🚒', J.WORLDS.lego.buildings[2][1]], ['🚓', J.WORLDS.lego.buildings[3][1]], ['🏪', J.WORLDS.lego.buildings[4][1]], ['🏥', J.WORLDS.lego.buildings[5][1]], ['🚉', J.WORLDS.lego.buildings[6][1]], ['🎢', J.WORLDS.lego.buildings[7][1]], ['🏙️', J.WORLDS.lego.buildings[8][1]]],
    decor: [['🌼', J.WORLDS.lego.decor[0][1]], ['🚧', J.WORLDS.lego.decor[1][1]], ['🌳', J.WORLDS.lego.decor[2][1]], ['🚦', J.WORLDS.lego.decor[3][1]], ['🚏', J.WORLDS.lego.decor[4][1]], ['🪑', J.WORLDS.lego.decor[5][1]], ['⛲', J.WORLDS.lego.decor[6][1]], ['🎆', J.WORLDS.lego.decor[7][1]]],
    residents: [['👷', J.WORLDS.lego.residents[0][1]], ['👮', J.WORLDS.lego.residents[1][1]], ['🧑‍🚒', J.WORLDS.lego.residents[2][1]], ['🧑‍⚕️', J.WORLDS.lego.residents[3][1]], ['🧑‍🍳', J.WORLDS.lego.residents[4][1]], ['🧑‍🚀', J.WORLDS.lego.residents[5][1]], ['🤖', J.WORLDS.lego.residents[6][1]], ['🏴‍☠️', J.WORLDS.lego.residents[7][1]], ['🤴', J.WORLDS.lego.residents[8][1]], ['🐕', J.WORLDS.lego.residents[9][1]]],
  },
  frozen: {
    name: J.WORLDS.frozen.name,
    buildings: [['⛄', J.WORLDS.frozen.buildings[0][1]], ['🛷', J.WORLDS.frozen.buildings[1][1]], ['🛖', J.WORLDS.frozen.buildings[2][1]], ['⛸️', J.WORLDS.frozen.buildings[3][1]], ['🧊', J.WORLDS.frozen.buildings[4][1]], ['🎿', J.WORLDS.frozen.buildings[5][1]], ['🌲', J.WORLDS.frozen.buildings[6][1]], ['🏔️', J.WORLDS.frozen.buildings[7][1]], ['❄️', J.WORLDS.frozen.buildings[8][1]]],
    decor: [['❄️', J.WORLDS.frozen.decor[0][1]], ['🌲', J.WORLDS.frozen.decor[1][1]], ['☃️', J.WORLDS.frozen.decor[2][1]], ['🧣', J.WORLDS.frozen.decor[3][1]], ['🔥', J.WORLDS.frozen.decor[4][1]], ['🎁', J.WORLDS.frozen.decor[5][1]], ['🌟', J.WORLDS.frozen.decor[6][1]], ['🎆', J.WORLDS.frozen.decor[7][1]]],
    residents: [['🐧', J.WORLDS.frozen.residents[0][1]], ['🐻‍❄️', J.WORLDS.frozen.residents[1][1]], ['🦌', J.WORLDS.frozen.residents[2][1]], ['🦭', J.WORLDS.frozen.residents[3][1]], ['🦊', J.WORLDS.frozen.residents[4][1]], ['🐺', J.WORLDS.frozen.residents[5][1]], ['🧝‍♀️', J.WORLDS.frozen.residents[6][1]], ['🦉', J.WORLDS.frozen.residents[7][1]], ['🐇', J.WORLDS.frozen.residents[8][1]], ['⛄', J.WORLDS.frozen.residents[9][1]]],
  },
  minecraft: {
    name: J.WORLDS.minecraft.name,
    buildings: [['🟫', J.WORLDS.minecraft.buildings[0][1]], ['🛏️', J.WORLDS.minecraft.buildings[1][1]], ['⛏️', J.WORLDS.minecraft.buildings[2][1]], ['🌾', J.WORLDS.minecraft.buildings[3][1]], ['⚒️', J.WORLDS.minecraft.buildings[4][1]], ['🐑', J.WORLDS.minecraft.buildings[5][1]], ['🌉', J.WORLDS.minecraft.buildings[6][1]], ['🗼', J.WORLDS.minecraft.buildings[7][1]], ['🟪', J.WORLDS.minecraft.buildings[8][1]]],
    decor: [['🌻', J.WORLDS.minecraft.decor[0][1]], ['🔥', J.WORLDS.minecraft.decor[1][1]], ['🌳', J.WORLDS.minecraft.decor[2][1]], ['🪵', J.WORLDS.minecraft.decor[3][1]], ['🌵', J.WORLDS.minecraft.decor[4][1]], ['🎃', J.WORLDS.minecraft.decor[5][1]], ['💧', J.WORLDS.minecraft.decor[6][1]], ['🧨', J.WORLDS.minecraft.decor[7][1]]],
    residents: [['🐷', J.WORLDS.minecraft.residents[0][1]], ['🐑', J.WORLDS.minecraft.residents[1][1]], ['🐔', J.WORLDS.minecraft.residents[2][1]], ['🐄', J.WORLDS.minecraft.residents[3][1]], ['🐺', J.WORLDS.minecraft.residents[4][1]], ['🐈', J.WORLDS.minecraft.residents[5][1]], ['🐴', J.WORLDS.minecraft.residents[6][1]], ['🧑‍🌾', J.WORLDS.minecraft.residents[7][1]], ['🐝', J.WORLDS.minecraft.residents[8][1]], ['🦜', J.WORLDS.minecraft.residents[9][1]]],
  },
};

/**
 * Guests who can move into any world once the theme's own residents are all
 * there — so gifts keep bringing somebody new for a long time. The child never
 * sees this list, only who has arrived (it is meant to be a surprise).
 */
// prettier-ignore
const VISITORS: [string, string][] = [
  ['🐶', J.VISITORS[0][1]], ['🐱', J.VISITORS[1][1]], ['🐹', J.VISITORS[2][1]], ['🐰', J.VISITORS[3][1]], ['🦜', J.VISITORS[4][1]], ['🐢', J.VISITORS[5][1]],
  ['🦔', J.VISITORS[6][1]], ['🐿️', J.VISITORS[7][1]], ['🦊', J.VISITORS[8][1]], ['🐼', J.VISITORS[9][1]], ['🐨', J.VISITORS[10][1]], ['🦁', J.VISITORS[11][1]],
  ['🐯', J.VISITORS[12][1]], ['🐘', J.VISITORS[13][1]], ['🦒', J.VISITORS[14][1]], ['🦓', J.VISITORS[15][1]], ['🦘', J.VISITORS[16][1]], ['🐵', J.VISITORS[17][1]],
  ['🦥', J.VISITORS[18][1]], ['🦦', J.VISITORS[19][1]], ['🦫', J.VISITORS[20][1]], ['🐧', J.VISITORS[21][1]], ['🦩', J.VISITORS[22][1]], ['🦚', J.VISITORS[23][1]],
  ['🦢', J.VISITORS[24][1]], ['🦆', J.VISITORS[25][1]], ['🐓', J.VISITORS[26][1]], ['🦉', J.VISITORS[27][1]], ['🦅', J.VISITORS[28][1]], ['🐬', J.VISITORS[29][1]],
  ['🐳', J.VISITORS[30][1]], ['🐙', J.VISITORS[31][1]], ['🦀', J.VISITORS[32][1]], ['🐠', J.VISITORS[33][1]], ['🦈', J.VISITORS[34][1]], ['🐸', J.VISITORS[35][1]],
  ['🦎', J.VISITORS[36][1]], ['🐝', J.VISITORS[37][1]], ['🦋', J.VISITORS[38][1]], ['🐞', J.VISITORS[39][1]], ['🐌', J.VISITORS[40][1]], ['🦖', J.VISITORS[41][1]],
  ['🧑‍🌾', J.VISITORS[42][1]], ['🧑‍🍳', J.VISITORS[43][1]], ['🧑‍🎨', J.VISITORS[44][1]], ['🧑‍🚒', J.VISITORS[45][1]], ['🧑‍⚕️', J.VISITORS[46][1]], ['🧑‍🏫', J.VISITORS[47][1]],
  ['🧑‍🔧', J.VISITORS[48][1]], ['🧑‍✈️', J.VISITORS[49][1]], ['🧑‍🔬', J.VISITORS[50][1]], ['🧑‍🎤', J.VISITORS[51][1]], ['🤹', J.VISITORS[52][1]], ['🧙', J.VISITORS[53][1]],
  ['🧚', J.VISITORS[54][1]], ['🧜‍♀️', J.VISITORS[55][1]], ['🦸', J.VISITORS[56][1]], ['🤖', J.VISITORS[57][1]], ['👽', J.VISITORS[58][1]], ['🐉', J.VISITORS[59][1]],
];

export interface ThemeWorld {
  name: string;
  /** Everything that can be built: ten buildings, then eight decorations. */
  items: ShopItem[];
  residents: Inhabitant[];
}

/**
 * The world of a theme on a planet, named in `lang` (Ukrainian when none is
 * asked for). `theme` brings its own words — the dream build — so it must be
 * the theme in the same language (`useActiveTheme(lang)`).
 */
export function themeWorld(theme: Theme, planet = 1, lang?: LangCode): ThemeWorld {
  const def = WORLDS[theme.id] ?? WORLDS.galaxy;
  const words = worldWords(lang);
  const own = words?.themes[WORLDS[theme.id] ? theme.id : 'galaxy'];
  const make = (kind: ItemKind, names?: readonly string[]) => ([emoji, name]: [string, string], index: number): ShopItem => {
    const id = itemId(kind, index);
    return { id, name: names?.[index] ?? name, emoji, kind, cost: itemCost(id, planet) };
  };
  const spaceport: ShopItem = { id: SPACEPORT_ID, name: words?.spaceport ?? J.themeWorld.spaceport.name, emoji: '🚀', kind: 'building', cost: itemCost(SPACEPORT_ID, planet) };
  const dream: ShopItem = { id: DREAM_ID, name: theme.dreamBuild.name, emoji: theme.dreamBuild.emoji, kind: 'building', cost: itemCost(DREAM_ID, planet) };
  // The theme's own residents first, then the guests of every world — each with the name of its own list.
  const residents: [emoji: string, name: string][] = [
    ...def.residents.map(([emoji, name], i): [string, string] => [emoji, own?.residents[i] ?? name]),
    ...VISITORS.map(([emoji, name], i): [string, string] => [emoji, words?.visitors[i] ?? name]).filter(([emoji]) => !def.residents.some(([mine]) => mine === emoji)),
  ];
  return {
    name: own?.name ?? def.name,
    items: [...def.buildings.map(make('building', own?.buildings)), spaceport, dream, ...def.decor.map(make('decor', own?.decor))],
    residents: residents.map(([emoji, name], i) => ({ id: `r${i}`, name, emoji })),
  };
}
