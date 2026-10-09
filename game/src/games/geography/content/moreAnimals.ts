import { own } from '@/core/language/marks';
import type { BiomeAnimal, BiomeId } from './data';
import TEXTS from '@/locales/app/uk/games/geography.json';

const J = TEXTS.content.moreAnimals;

/**
 * More dwellers of the natural zones — the second, bigger half of «Тварини і
 * Природні Зони». One row per animal:
 *   id, name, picture, home zone, zones it could arguably live in too,
 *   where it lives (said when the child needs a hint), and two more facts.
 * Like the first animals, every fact is about THIS animal.
 */
const ROWS: [id: string, name: string, emoji: string, home: BiomeId, also: BiomeId[], fact: string, more: [string, string]][] = [
  // The jungle.
  ['crocodile', J.ROWS[0][1], '🐊', 'jungle', ['savanna'], J.ROWS[0][5], [J.ROWS[0][6][0], J.ROWS[0][6][1]]],
  ['tree_frog', J.ROWS[1][1], '🐸', 'jungle', ['forest'], J.ROWS[1][5], [J.ROWS[1][6][0], J.ROWS[1][6][1]]],
  ['morpho', J.ROWS[2][1], '🦋', 'jungle', [], J.ROWS[2][5], [J.ROWS[2][6][0], J.ROWS[2][6][1]]],
  ['bat', J.ROWS[3][1], '🦇', 'jungle', ['forest', 'desert', 'mountains', 'savanna'], J.ROWS[3][5], [J.ROWS[3][6][0], J.ROWS[3][6][1]]],
  ['peacock', J.ROWS[4][1], '🦚', 'jungle', ['forest'], J.ROWS[4][5], [J.ROWS[4][6][0], J.ROWS[4][6][1]]],
  ['leafcutter', J.ROWS[5][1], '🐜', 'jungle', [], J.ROWS[5][5], [J.ROWS[5][6][0], J.ROWS[5][6][1]]],
  // The savanna.
  ['hippo', J.ROWS[6][1], '🦛', 'savanna', ['jungle'], J.ROWS[6][5], [J.ROWS[6][6][0], J.ROWS[6][6][1]]],
  ['buffalo', J.ROWS[7][1], '🐃', 'savanna', ['jungle'], J.ROWS[7][5], [J.ROWS[7][6][0], J.ROWS[7][6][1]]],
  ['kangaroo', J.ROWS[8][1], '🦘', 'savanna', ['desert'], J.ROWS[8][5], [J.ROWS[8][6][0], J.ROWS[8][6][1]]],
  ['grasshopper', J.ROWS[9][1], '🦗', 'savanna', ['forest'], J.ROWS[9][5], [J.ROWS[9][6][0], J.ROWS[9][6][1]]],
  ['flamingo', J.ROWS[10][1], '🦩', 'savanna', ['ocean'], J.ROWS[10][5], [J.ROWS[10][6][0], J.ROWS[10][6][1]]],
  // The forest.
  ['panda', J.ROWS[11][1], '🐼', 'forest', ['mountains'], J.ROWS[11][5], [J.ROWS[11][6][0], J.ROWS[11][6][1]]],
  ['koala', J.ROWS[12][1], '🐨', 'forest', [], J.ROWS[12][5], [J.ROWS[12][6][0], J.ROWS[12][6][1]]],
  ['otter', J.ROWS[13][1], '🦦', 'forest', ['ocean'], J.ROWS[13][5], [J.ROWS[13][6][0], J.ROWS[13][6][1]]],
  ['beaver', J.ROWS[14][1], '🦫', 'forest', [], J.ROWS[14][5], [J.ROWS[14][6][0], J.ROWS[14][6][1]]],
  ['badger', J.ROWS[15][1], '🦡', 'forest', [], J.ROWS[15][5], [J.ROWS[15][6][0], J.ROWS[15][6][1]]],
  ['skunk', J.ROWS[16][1], '🦨', 'forest', [], J.ROWS[16][5], [J.ROWS[16][6][0], J.ROWS[16][6][1]]],
  ['raccoon', J.ROWS[17][1], '🦝', 'forest', [], J.ROWS[17][5], [J.ROWS[17][6][0], J.ROWS[17][6][1]]],
  ['forest_mouse', J.ROWS[18][1], '🐭', 'forest', ['savanna', 'mountains'], J.ROWS[18][5], [J.ROWS[18][6][0], J.ROWS[18][6][1]]],
  ['raven', J.ROWS[19][1], '🐦‍⬛', 'forest', ['mountains', 'arctic', 'desert'], J.ROWS[19][5], [J.ROWS[19][6][0], J.ROWS[19][6][1]]],
  ['snail', J.ROWS[20][1], '🐌', 'forest', ['jungle'], J.ROWS[20][5], [J.ROWS[20][6][0], J.ROWS[20][6][1]]],
  ['bee', J.ROWS[21][1], '🐝', 'forest', ['savanna', 'jungle', 'mountains'], J.ROWS[21][5], [J.ROWS[21][6][0], J.ROWS[21][6][1]]],
  ['spider', J.ROWS[22][1], '🕷️', 'forest', [], J.ROWS[22][5], [J.ROWS[22][6][0], J.ROWS[22][6][1]]],
  ['ladybug', J.ROWS[23][1], '🐞', 'forest', ['savanna'], J.ROWS[23][5], [J.ROWS[23][6][0], J.ROWS[23][6][1]]],
  ['moose', J.ROWS[24][1], '🫎', 'forest', ['arctic'], J.ROWS[24][5], [J.ROWS[24][6][0], J.ROWS[24][6][1]]],
  ['wisent', J.ROWS[25][1], '🦬', 'forest', [], J.ROWS[25][5][1] + own(J.ROWS[25][5][2]) + '.', [J.ROWS[25][6][0], J.ROWS[25][6][1]]],
  ['turkey', J.ROWS[26][1], '🦃', 'forest', [], J.ROWS[26][5], [J.ROWS[26][6][0], J.ROWS[26][6][1]]],
  // The ocean.
  ['lobster', J.ROWS[27][1], '🦞', 'ocean', [], J.ROWS[27][5], [J.ROWS[27][6][0], J.ROWS[27][6][1]]],
  ['shrimp', J.ROWS[28][1], '🦐', 'ocean', [], J.ROWS[28][5], [J.ROWS[28][6][0], J.ROWS[28][6][1]]],
  ['puffer', J.ROWS[29][1], '🐡', 'ocean', [], J.ROWS[29][5], [J.ROWS[29][6][0], J.ROWS[29][6][1]]],
  ['tuna', J.ROWS[30][1], '🐟', 'ocean', [], J.ROWS[30][5], [J.ROWS[30][6][0], J.ROWS[30][6][1]]],
  ['sperm_whale', J.ROWS[31][1], '🐳', 'ocean', [], J.ROWS[31][5], [J.ROWS[31][6][0], J.ROWS[31][6][1]]],
  ['penguin', J.ROWS[32][1], '🐧', 'ocean', ['arctic'], J.ROWS[32][5], [J.ROWS[32][6][0], J.ROWS[32][6][1]]],
  ['oyster', J.ROWS[33][1], '🦪', 'ocean', [], J.ROWS[33][5], [J.ROWS[33][6][0], J.ROWS[33][6][1]]],
  ['hermit', J.ROWS[34][1], '🐚', 'ocean', [], J.ROWS[34][5], [J.ROWS[34][6][0], J.ROWS[34][6][1]]],
  ['coral', J.ROWS[35][1], '🪸', 'ocean', [], J.ROWS[35][5], [J.ROWS[35][6][0], J.ROWS[35][6][1]]],
  // The Arctic.
  ['lemming', J.ROWS[36][1], '🐹', 'arctic', [], J.ROWS[36][5], [J.ROWS[36][6][0], J.ROWS[36][6][1]]],
  ['snow_goose', J.ROWS[37][1], '🪿', 'arctic', [], J.ROWS[37][5], [J.ROWS[37][6][0], J.ROWS[37][6][1]]],
  // The desert.
  ['bactrian', J.ROWS[38][1], '🐫', 'desert', [], J.ROWS[38][5], [J.ROWS[38][6][0], J.ROWS[38][6][1]]],
  ['scarab', J.ROWS[39][1], '🪲', 'desert', ['savanna'], J.ROWS[39][5], [J.ROWS[39][6][0], J.ROWS[39][6][1]]],
  ['jerboa', J.ROWS[40][1], '🐁', 'desert', [], J.ROWS[40][5], [J.ROWS[40][6][0], J.ROWS[40][6][1]]],
  // The mountains.
  ['yak', J.ROWS[41][1], '🐂', 'mountains', [], J.ROWS[41][5], [J.ROWS[41][6][0], J.ROWS[41][6][1]]],
  ['snow_leopard', J.ROWS[42][1], '🐆', 'mountains', [], J.ROWS[42][5], [J.ROWS[42][6][0], J.ROWS[42][6][1]]],
];

export const MORE_BIOME_ANIMALS: BiomeAnimal[] = ROWS.map(([id, name, emoji, home, also, fact]) => ({ id, name, emoji, home, fact, also: also.length > 0 ? also : undefined }));

/** The facts of these animals, keyed like `ANIMAL_FACTS`: where it lives, then two more. */
export const MORE_ANIMAL_FACTS: Record<string, string[]> = Object.fromEntries(ROWS.map(([id, , , , , fact, more]) => [id, [fact, ...more]]));

/**
 * «Хто це?» — every animal of the game as a riddle that does not name it.
 * Keyed by animal id.
 */
export const ANIMAL_CLUES: Record<string, string> = J.ANIMAL_CLUES;

/**
 * Four more ways to recognise each zone without naming it — on top of the two
 * in `BIOMES[].signs`, so «Яка це природна зона?» has six questions a zone.
 */
export const MORE_SIGNS: Record<BiomeId, [string, string, string, string]> = {
  arctic: [J.MORE_SIGNS.arctic[0], J.MORE_SIGNS.arctic[1], J.MORE_SIGNS.arctic[2], J.MORE_SIGNS.arctic[3]],
  jungle: [J.MORE_SIGNS.jungle[0], J.MORE_SIGNS.jungle[1], J.MORE_SIGNS.jungle[2], J.MORE_SIGNS.jungle[3]],
  desert: [J.MORE_SIGNS.desert[0], J.MORE_SIGNS.desert[1], J.MORE_SIGNS.desert[2], J.MORE_SIGNS.desert[3]],
  ocean: [J.MORE_SIGNS.ocean[0], J.MORE_SIGNS.ocean[1], J.MORE_SIGNS.ocean[2], J.MORE_SIGNS.ocean[3]],
  savanna: [J.MORE_SIGNS.savanna[0], J.MORE_SIGNS.savanna[1], J.MORE_SIGNS.savanna[2], J.MORE_SIGNS.savanna[3]],
  forest: [J.MORE_SIGNS.forest[0], J.MORE_SIGNS.forest[1], J.MORE_SIGNS.forest[2], J.MORE_SIGNS.forest[3]],
  mountains: [J.MORE_SIGNS.mountains[0], J.MORE_SIGNS.mountains[1], J.MORE_SIGNS.mountains[2], J.MORE_SIGNS.mountains[3]],
};
