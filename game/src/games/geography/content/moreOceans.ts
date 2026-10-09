import { own } from '@/core/language/marks';
import type { OceanPart } from './data';
import TEXTS from '@/locales/app/uk/games/geography.json';

const J = TEXTS.content.moreOceans;

/**
 * The second, bigger half of «Моря та Океани»: more riddles about each ocean,
 * more seas and gulfs, more famous places, the countries an ocean washes and
 * the rivers that run into it. Every entry carries its own fact — what the
 * child is told after sailing there is about THIS sea, river or island.
 */

/** Five more riddles an ocean («Пливи до …!»), after the three in `OCEAN_RIDDLES`. */
export const MORE_OCEAN_RIDDLES: Record<string, string[]> = J.MORE_OCEAN_RIDDLES;

/**
 * What is told after each riddle about an ocean — one fact per riddle, in the
 * order of `OCEAN_RIDDLES` (three) and then `MORE_OCEAN_RIDDLES` (five).
 */
export const RIDDLE_FACTS: Record<string, string[]> = J.RIDDLE_FACTS;

const part = (id: string, name: string, ocean: string, fact: string): OceanPart => ({ id, name, ocean, fact });

/** More seas and gulfs, after the seventeen in `SEAS`. */
export const MORE_SEAS: OceanPart[] = [
  part('azov', J.MORE_SEAS[0][1], 'atlantic', J.MORE_SEAS[0][2]),
  part('adriatic', J.MORE_SEAS[1][1], 'atlantic', J.MORE_SEAS[1][2]),
  part('aegean', J.MORE_SEAS[2][1], 'atlantic', J.MORE_SEAS[2][2]),
  part('marmara', J.MORE_SEAS[3][1], 'atlantic', J.MORE_SEAS[3][2]),
  part('irish', J.MORE_SEAS[4][1], 'atlantic', J.MORE_SEAS[4][2]),
  part('sargasso', J.MORE_SEAS[5][1], 'atlantic', J.MORE_SEAS[5][2]),
  part('labrador', J.MORE_SEAS[6][1], 'atlantic', J.MORE_SEAS[6][2]),
  part('mexico', J.MORE_SEAS[7][1], 'atlantic', J.MORE_SEAS[7][2]),
  part('biscay', J.MORE_SEAS[8][1], 'atlantic', J.MORE_SEAS[8][2]),
  part('guinea', J.MORE_SEAS[9][1], 'atlantic', J.MORE_SEAS[9][2]),
  part('okhotsk', J.MORE_SEAS[10][1], 'pacific', J.MORE_SEAS[10][2]),
  part('yellow', J.MORE_SEAS[11][1], 'pacific', J.MORE_SEAS[11][2]),
  part('east_china', J.MORE_SEAS[12][1], 'pacific', J.MORE_SEAS[12][2]),
  part('philippine', J.MORE_SEAS[13][1], 'pacific', J.MORE_SEAS[13][2]),
  part('tasman', J.MORE_SEAS[14][1], 'pacific', J.MORE_SEAS[14][2]),
  part('java', J.MORE_SEAS[15][1], 'pacific', J.MORE_SEAS[15][2]),
  part('fiji', J.MORE_SEAS[16][1], 'pacific', J.MORE_SEAS[16][2]),
  part('california', J.MORE_SEAS[17][1], 'pacific', J.MORE_SEAS[17][2]),
  part('bengal', J.MORE_SEAS[18][1], 'indian', J.MORE_SEAS[18][2]),
  part('persian', J.MORE_SEAS[19][1], 'indian', J.MORE_SEAS[19][2]),
  part('timor', J.MORE_SEAS[20][1], 'indian', J.MORE_SEAS[20][2]),
  part('laccadive', J.MORE_SEAS[21][1], 'indian', J.MORE_SEAS[21][2]),
  part('aden', J.MORE_SEAS[22][1], 'indian', J.MORE_SEAS[22][2]),
  part('mozambique', J.MORE_SEAS[23][1], 'indian', J.MORE_SEAS[23][2]),
  part('kara', J.MORE_SEAS[24][1], 'arctic', J.MORE_SEAS[24][2]),
  part('laptev', J.MORE_SEAS[25][1], 'arctic', J.MORE_SEAS[25][2]),
  part('white', J.MORE_SEAS[26][1], 'arctic', J.MORE_SEAS[26][2]),
  part('chukchi', J.MORE_SEAS[27][1], 'arctic', J.MORE_SEAS[27][2]),
  part('amundsen', J.MORE_SEAS[28][1], 'southern', J.MORE_SEAS[28][2]),
  part('bellingshausen', J.MORE_SEAS[29][1], 'southern', J.MORE_SEAS[29][2]),
];

/** More famous places, after the twelve in `OCEAN_PLACES`. `name` completes «У якому океані …?». */
export const MORE_OCEAN_PLACES: OceanPart[] = [
  part('japan_isles', J.MORE_OCEAN_PLACES[0][1], 'pacific', J.MORE_OCEAN_PLACES[0][2]),
  part('new_zealand', J.MORE_OCEAN_PLACES[1][1], 'pacific', J.MORE_OCEAN_PLACES[1][2]),
  part('philippines', J.MORE_OCEAN_PLACES[2][1], 'pacific', J.MORE_OCEAN_PLACES[2][2]),
  part('tahiti', J.MORE_OCEAN_PLACES[3][1], 'pacific', J.MORE_OCEAN_PLACES[3][2]),
  part('new_guinea', J.MORE_OCEAN_PLACES[4][1], 'pacific', J.MORE_OCEAN_PLACES[4][2]),
  part('ring_of_fire', J.MORE_OCEAN_PLACES[5][1], 'pacific', J.MORE_OCEAN_PLACES[5][2]),
  part('kamchatka', J.MORE_OCEAN_PLACES[6][1], 'pacific', J.MORE_OCEAN_PLACES[6][2]),
  part('britain', J.MORE_OCEAN_PLACES[7][1], 'atlantic', J.MORE_OCEAN_PLACES[7][2]),
  part('cuba_isle', J.MORE_OCEAN_PLACES[8][1], 'atlantic', J.MORE_OCEAN_PLACES[8][2]),
  part('canary', J.MORE_OCEAN_PLACES[9][1], 'atlantic', J.MORE_OCEAN_PLACES[9][2]),
  part('bahamas', J.MORE_OCEAN_PLACES[10][1], 'atlantic', J.MORE_OCEAN_PLACES[10][2]),
  part('azores', J.MORE_OCEAN_PLACES[11][1], 'atlantic', J.MORE_OCEAN_PLACES[11][2]),
  part('st_helena', J.MORE_OCEAN_PLACES[12][1], 'atlantic', J.MORE_OCEAN_PLACES[12][2]),
  part('falklands', J.MORE_OCEAN_PLACES[13][1], 'atlantic', J.MORE_OCEAN_PLACES[13][2]),
  part('ireland', J.MORE_OCEAN_PLACES[14][1], 'atlantic', J.MORE_OCEAN_PLACES[14][2]),
  part('seychelles', J.MORE_OCEAN_PLACES[15][1], 'indian', J.MORE_OCEAN_PLACES[15][2]),
  part('mauritius', J.MORE_OCEAN_PLACES[16][1], 'indian', J.MORE_OCEAN_PLACES[16][2]),
  part('zanzibar', J.MORE_OCEAN_PLACES[17][1], 'indian', J.MORE_OCEAN_PLACES[17][2]),
  part('comoros', J.MORE_OCEAN_PLACES[18][1], 'indian', J.MORE_OCEAN_PLACES[18][2]),
  part('socotra', J.MORE_OCEAN_PLACES[19][1], 'indian', J.MORE_OCEAN_PLACES[19][2]),
  part('andaman_isles', J.MORE_OCEAN_PLACES[20][1], 'indian', J.MORE_OCEAN_PLACES[20][2]),
  part('north_pole', J.MORE_OCEAN_PLACES[21][1], 'arctic', J.MORE_OCEAN_PLACES[21][2]),
  part('novaya_zemlya', J.MORE_OCEAN_PLACES[22][1], 'arctic', J.MORE_OCEAN_PLACES[22][2]),
  part('wrangel', J.MORE_OCEAN_PLACES[23][1], 'arctic', J.MORE_OCEAN_PLACES[23][2]),
  part('ellesmere', J.MORE_OCEAN_PLACES[24][1], 'arctic', J.MORE_OCEAN_PLACES[24][2]),
  part('icebergs', J.MORE_OCEAN_PLACES[25][1], 'southern', J.MORE_OCEAN_PLACES[25][2]),
  part('ross_shelf', J.MORE_OCEAN_PLACES[26][1], 'southern', J.MORE_OCEAN_PLACES[26][2]),
  part('south_shetland', J.MORE_OCEAN_PLACES[27][1], 'southern', J.MORE_OCEAN_PLACES[27][2] + own(J.MORE_OCEAN_PLACES[27][3])),
];

/**
 * Countries whose shores one ocean washes — only those where the answer is
 * not in doubt (a country on two oceans is not asked). Country ids are those
 * of `countries.ts`; asked best-known first.
 */
export const SHORES: Record<string, string[]> = {
  atlantic: ['gb', 'fr', 'es', 'br', 'pt', 'ar', 'nl', 'ie', 'is', 'cu', 'jm', 'ma', 'ng', 'gh', 'sn', 've', 'uy', 'ao', 'na', 'lr', 'ci', 'cm', 'ga'],
  pacific: ['jp', 'cn', 'kr', 'nz', 'cl', 'pe', 'vn', 'ph', 'ec', 'kp'],
  indian: ['in', 'lk', 'mv', 'ke', 'tz', 'mg', 'pk', 'bd', 'mz', 'so', 'om', 'ye', 'mm', 'ir', 'ae', 'qa', 'kw', 'bh'],
};

/** Rivers and the ocean their water ends up in. `name` completes «У який океан тече річка …?». */
export const RIVERS: OceanPart[] = [
  part('dnipro', J.RIVERS[0][1], 'atlantic', J.RIVERS[0][2]),
  part('amazon', J.RIVERS[1][1], 'atlantic', J.RIVERS[1][2]),
  part('nile', J.RIVERS[2][1], 'atlantic', J.RIVERS[2][2]),
  part('danube', J.RIVERS[3][1], 'atlantic', J.RIVERS[3][2]),
  part('mississippi', J.RIVERS[4][1], 'atlantic', J.RIVERS[4][2]),
  part('congo', J.RIVERS[5][1], 'atlantic', J.RIVERS[5][2]),
  part('rhine', J.RIVERS[6][1], 'atlantic', J.RIVERS[6][2]),
  part('thames', J.RIVERS[7][1], 'atlantic', J.RIVERS[7][2]),
  part('yangtze', J.RIVERS[8][1], 'pacific', J.RIVERS[8][2]),
  part('huanghe', J.RIVERS[9][1], 'pacific', J.RIVERS[9][2]),
  part('mekong', J.RIVERS[10][1], 'pacific', J.RIVERS[10][2]),
  part('amur', J.RIVERS[11][1], 'pacific', J.RIVERS[11][2]),
  part('colorado', J.RIVERS[12][1], 'pacific', J.RIVERS[12][2]),
  part('yukon', J.RIVERS[13][1], 'pacific', J.RIVERS[13][2]),
  part('ganges', J.RIVERS[14][1], 'indian', J.RIVERS[14][2]),
  part('indus', J.RIVERS[15][1], 'indian', J.RIVERS[15][2]),
  part('zambezi', J.RIVERS[16][1], 'indian', J.RIVERS[16][2]),
  part('ob', J.RIVERS[17][1], 'arctic', J.RIVERS[17][2]),
  part('yenisei', J.RIVERS[18][1], 'arctic', J.RIVERS[18][2]),
  part('lena', J.RIVERS[19][1], 'arctic', J.RIVERS[19][2]),
  part('mackenzie', J.RIVERS[20][1], 'arctic', J.RIVERS[20][2]),
];
