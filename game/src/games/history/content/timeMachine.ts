import TEXTS from '@/locales/app/uk/games/history.json';

const J = TEXTS.content.timeMachine;

/**
 * «Часова Машина» — 100 time tasks of four kinds, drawn at random:
 *
 *   SEQUENCES  put four things in order, oldest first        (UI_CHRONO_SEQUENCE)
 *   EARLIER    which of the two appeared first?              (UI_GRID_CHOICE)
 *   EPOCHS     which age does this belong to?                (UI_SORTER_BINS)
 *   WHEN       how long ago did it happen?                   (UI_GRID_CHOICE)
 *
 * Every task carries a short story the child hears after solving it. Dates are
 * the commonly accepted ones; "years ago" answers are rounded on purpose and
 * the wrong options are an order of magnitude off, so they stay true for years.
 */

/** [topic, [emoji, label] × 4 oldest → newest, story] */
export const SEQUENCES: [string, [string, string][], string][] = [
  [J.SEQUENCES[0][0], [['🪨', J.SEQUENCES[0][1][0][1]], ['🐫', J.SEQUENCES[0][1][1][1]], ['🏰', J.SEQUENCES[0][1][2][1]], ['🏙️', J.SEQUENCES[0][1][3][1]]], J.SEQUENCES[0][2]],
  [J.SEQUENCES[1][0], [['🐎', J.SEQUENCES[1][1][0][1]], ['🚂', J.SEQUENCES[1][1][1][1]], ['🚗', J.SEQUENCES[1][1][2][1]], ['🚀', J.SEQUENCES[1][1][3][1]]], J.SEQUENCES[1][2]],
  [J.SEQUENCES[2][0], [['🪨', J.SEQUENCES[2][1][0][1]], ['📜', J.SEQUENCES[2][1][1][1]], ['📖', J.SEQUENCES[2][1][2][1]], ['💻', J.SEQUENCES[2][1][3][1]]], J.SEQUENCES[2][2]],
  [J.SEQUENCES[3][0], [['⛰️', J.SEQUENCES[3][1][0][1]], ['🛖', J.SEQUENCES[3][1][1][1]], ['🏰', J.SEQUENCES[3][1][2][1]], ['🏢', J.SEQUENCES[3][1][3][1]]], J.SEQUENCES[3][2]],
  [J.SEQUENCES[4][0], [['🔥', J.SEQUENCES[4][1][0][1]], ['🕯️', J.SEQUENCES[4][1][1][1]], ['🪔', J.SEQUENCES[4][1][2][1]], ['💡', J.SEQUENCES[4][1][3][1]]], J.SEQUENCES[4][2]],
  [J.SEQUENCES[5][0], [['🏺', J.SEQUENCES[5][1][0][1]], ['👑', J.SEQUENCES[5][1][1][1]], ['⚔️', J.SEQUENCES[5][1][2][1]], ['🇺🇦', J.SEQUENCES[5][1][3][1]]], J.SEQUENCES[5][2]],
  [J.SEQUENCES[6][0], [['✉️', J.SEQUENCES[6][1][0][1]], ['☎️', J.SEQUENCES[6][1][1][1]], ['📺', J.SEQUENCES[6][1][2][1]], ['📱', J.SEQUENCES[6][1][3][1]]], J.SEQUENCES[6][2]],
  [J.SEQUENCES[7][0], [['🎈', J.SEQUENCES[7][1][0][1]], ['✈️', J.SEQUENCES[7][1][1][1]], ['🚁', J.SEQUENCES[7][1][2][1]], ['🚀', J.SEQUENCES[7][1][3][1]]], J.SEQUENCES[7][2]],
  [J.SEQUENCES[8][0], [['📻', J.SEQUENCES[8][1][0][1]], ['📼', J.SEQUENCES[8][1][1][1]], ['💿', J.SEQUENCES[8][1][2][1]], ['📱', J.SEQUENCES[8][1][3][1]]], J.SEQUENCES[8][2]],
  [J.SEQUENCES[9][0], [['🖐️', J.SEQUENCES[9][1][0][1]], ['🧮', J.SEQUENCES[9][1][1][1]], ['📟', J.SEQUENCES[9][1][2][1]], ['💻', J.SEQUENCES[9][1][3][1]]], J.SEQUENCES[9][2]],
  [J.SEQUENCES[10][0], [['🛶', J.SEQUENCES[10][1][0][1]], ['⛵', J.SEQUENCES[10][1][1][1]], ['🚢', J.SEQUENCES[10][1][2][1]], ['🛳️', J.SEQUENCES[10][1][3][1]]], J.SEQUENCES[10][2]],
  [J.SEQUENCES[11][0], [['🪨', J.SEQUENCES[11][1][0][1]], ['🪓', J.SEQUENCES[11][1][1][1]], ['⚒️', J.SEQUENCES[11][1][2][1]], ['🤖', J.SEQUENCES[11][1][3][1]]], J.SEQUENCES[11][2]],
  [J.SEQUENCES[12][0], [['☀️', J.SEQUENCES[12][1][0][1]], ['⏳', J.SEQUENCES[12][1][1][1]], ['🕰️', J.SEQUENCES[12][1][2][1]], ['⌚', J.SEQUENCES[12][1][3][1]]], J.SEQUENCES[12][2]],
  [J.SEQUENCES[13][0], [['🐚', J.SEQUENCES[13][1][0][1]], ['🪙', J.SEQUENCES[13][1][1][1]], ['💵', J.SEQUENCES[13][1][2][1]], ['💳', J.SEQUENCES[13][1][3][1]]], J.SEQUENCES[13][2]],
  [J.SEQUENCES[14][0], [['🖼️', J.SEQUENCES[14][1][0][1]], ['📷', J.SEQUENCES[14][1][1][1]], ['🎥', J.SEQUENCES[14][1][2][1]], ['📱', J.SEQUENCES[14][1][3][1]]], J.SEQUENCES[14][2]],
  [J.SEQUENCES[15][0], [['🦖', J.SEQUENCES[15][1][0][1]], ['🦣', J.SEQUENCES[15][1][1][1]], ['🐫', J.SEQUENCES[15][1][2][1]], ['🛡️', J.SEQUENCES[15][1][3][1]]], J.SEQUENCES[15][2]],
  [J.SEQUENCES[16][0], [['🛶', J.SEQUENCES[16][1][0][1]], ['⛪', J.SEQUENCES[16][1][1][1]], ['🎓', J.SEQUENCES[16][1][2][1]], ['🚇', J.SEQUENCES[16][1][3][1]]], J.SEQUENCES[16][2]],
  [J.SEQUENCES[17][0], [['🛰️', J.SEQUENCES[17][1][0][1]], ['🧑‍🚀', J.SEQUENCES[17][1][1][1]], ['🌙', J.SEQUENCES[17][1][2][1]], ['🛸', J.SEQUENCES[17][1][3][1]]], J.SEQUENCES[17][2]],
  [J.SEQUENCES[18][0], [['🏹', J.SEQUENCES[18][1][0][1]], ['🌾', J.SEQUENCES[18][1][1][1]], ['🐂', J.SEQUENCES[18][1][2][1]], ['🚜', J.SEQUENCES[18][1][3][1]]], J.SEQUENCES[18][2]],
  [J.SEQUENCES[19][0], [['🥾', J.SEQUENCES[19][1][0][1]], ['🧱', J.SEQUENCES[19][1][1][1]], ['🛤️', J.SEQUENCES[19][1][2][1]], ['🛣️', J.SEQUENCES[19][1][3][1]]], J.SEQUENCES[19][2]],
  [J.SEQUENCES[20][0], [['🌿', J.SEQUENCES[20][1][0][1]], ['🔬', J.SEQUENCES[20][1][1][1]], ['💉', J.SEQUENCES[20][1][2][1]], ['🩻', J.SEQUENCES[20][1][3][1]]], J.SEQUENCES[20][2]],
  [J.SEQUENCES[21][0], [['🧮', J.SEQUENCES[21][1][0][1]], ['🖥️', J.SEQUENCES[21][1][1][1]], ['💻', J.SEQUENCES[21][1][2][1]], ['📱', J.SEQUENCES[21][1][3][1]]], J.SEQUENCES[21][2]],
  [J.SEQUENCES[22][0], [['🐫', J.SEQUENCES[22][1][0][1]], ['🏛️', J.SEQUENCES[22][1][1][1]], ['🏟️', J.SEQUENCES[22][1][2][1]], ['🗼', J.SEQUENCES[22][1][3][1]]], J.SEQUENCES[22][2]],
  [J.SEQUENCES[23][0], [['📜', J.SEQUENCES[23][1][0][1]], ['📖', J.SEQUENCES[23][1][1][1]], ['📕', J.SEQUENCES[23][1][2][1]], ['🌳', J.SEQUENCES[23][1][3][1]]], J.SEQUENCES[23][2]],
  [J.SEQUENCES[24][0], [['🏛️', J.SEQUENCES[24][1][0][1]], ['🐎', J.SEQUENCES[24][1][1][1]], ['🥇', J.SEQUENCES[24][1][2][1]], ['📺', J.SEQUENCES[24][1][3][1]]], J.SEQUENCES[24][2]],
  [J.SEQUENCES[25][0], [['🔥', J.SEQUENCES[25][1][0][1]], ['🌬️', J.SEQUENCES[25][1][1][1]], ['🚂', J.SEQUENCES[25][1][2][1]], ['☀️', J.SEQUENCES[25][1][3][1]]], J.SEQUENCES[25][2]],
  [J.SEQUENCES[26][0], [['🪶', J.SEQUENCES[26][1][0][1]], ['✒️', J.SEQUENCES[26][1][1][1]], ['🖊️', J.SEQUENCES[26][1][2][1]], ['⌨️', J.SEQUENCES[26][1][3][1]]], J.SEQUENCES[26][2]],
  [J.SEQUENCES[27][0], [['⛵', J.SEQUENCES[27][1][0][1]], ['🧭', J.SEQUENCES[27][1][1][1]], ['🏔️', J.SEQUENCES[27][1][2][1]], ['🌙', J.SEQUENCES[27][1][3][1]]], J.SEQUENCES[27][2]],
];

/** [earlier emoji, earlier label, later emoji, later label, story] */
export const EARLIER: [string, string, string, string, string][] = [
  ['🚲', J.EARLIER[0][1], '🚗', J.EARLIER[0][3], J.EARLIER[0][4]],
  ['☎️', J.EARLIER[1][1], '📻', J.EARLIER[1][3], J.EARLIER[1][4]],
  ['🚂', J.EARLIER[2][1], '✈️', J.EARLIER[2][3], J.EARLIER[2][4]],
  ['📖', J.EARLIER[3][1], '📰', J.EARLIER[3][3], J.EARLIER[3][4]],
  ['🕯️', J.EARLIER[4][1], '💡', J.EARLIER[4][3], J.EARLIER[4][4]],
  ['🏰', J.EARLIER[5][1], '🏙️', J.EARLIER[5][3], J.EARLIER[5][4]],
  ['🦖', J.EARLIER[6][1], '🧑', J.EARLIER[6][3], J.EARLIER[6][4]],
  ['🧮', J.EARLIER[7][1], '📟', J.EARLIER[7][3], J.EARLIER[7][4]],
  ['📷', J.EARLIER[8][1], '🎬', J.EARLIER[8][3], J.EARLIER[8][4]],
  ['📺', J.EARLIER[9][1], '💻', J.EARLIER[9][3], J.EARLIER[9][4]],
  ['🌐', J.EARLIER[10][1], '📱', J.EARLIER[10][3], J.EARLIER[10][4]],
  ['⛵', J.EARLIER[11][1], '🚢', J.EARLIER[11][3], J.EARLIER[11][4]],
  ['🎈', J.EARLIER[12][1], '✈️', J.EARLIER[12][3], J.EARLIER[12][4]],
  ['🔭', J.EARLIER[13][1], '🚀', J.EARLIER[13][3], J.EARLIER[13][4]],
  ['🪙', J.EARLIER[14][1], '💵', J.EARLIER[14][3], J.EARLIER[14][4]],
  ['🪶', J.EARLIER[15][1], '🖊️', J.EARLIER[15][3], J.EARLIER[15][4]],
  ['🐫', J.EARLIER[16][1], '🏟️', J.EARLIER[16][3], J.EARLIER[16][4]],
  ['🧱', J.EARLIER[17][1], '🗼', J.EARLIER[17][3], J.EARLIER[17][4]],
  ['🛞', J.EARLIER[18][1], '🚲', J.EARLIER[18][3], J.EARLIER[18][4]],
  ['🔥', J.EARLIER[19][1], '🛞', J.EARLIER[19][3], J.EARLIER[19][4]],
  ['⚽', J.EARLIER[20][1], '🏀', J.EARLIER[20][3], J.EARLIER[20][4]],
  ['🧊', J.EARLIER[21][1], '♨️', J.EARLIER[21][3], J.EARLIER[21][4]],
  ['🎹', J.EARLIER[22][1], '🎸', J.EARLIER[22][3], J.EARLIER[22][4]],
  ['🚇', J.EARLIER[23][1], '🚁', J.EARLIER[23][3], J.EARLIER[23][4]],
  ['🛰️', J.EARLIER[24][1], '🌙', J.EARLIER[24][3], J.EARLIER[24][4]],
  ['📮', J.EARLIER[25][1], '📧', J.EARLIER[25][3], J.EARLIER[25][4]],
  ['👑', J.EARLIER[26][1], '⚔️', J.EARLIER[26][3], J.EARLIER[26][4]],
  ['📜', J.EARLIER[27][1], '📄', J.EARLIER[27][3], J.EARLIER[27][4]],
  ['👓', J.EARLIER[28][1], '🔭', J.EARLIER[28][3], J.EARLIER[28][4]],
  ['🕰️', J.EARLIER[29][1], '⌚', J.EARLIER[29][3], J.EARLIER[29][4]],
  ['🎻', J.EARLIER[30][1], '🎹', J.EARLIER[30][3], J.EARLIER[30][4]],
  ['🏛️', J.EARLIER[31][1], '🏰', J.EARLIER[31][3], J.EARLIER[31][4]],
];

export const EPOCHS = [
  { id: 'stone', emoji: '🪨', name: J.EPOCHS.stone.name, no: J.EPOCHS.stone.no },
  { id: 'ancient', emoji: '🏛️', name: J.EPOCHS.ancient.name, no: J.EPOCHS.ancient.no },
  { id: 'medieval', emoji: '🏰', name: J.EPOCHS.medieval.name, no: J.EPOCHS.medieval.no },
  { id: 'modern', emoji: '🏙️', name: J.EPOCHS.modern.name, no: J.EPOCHS.modern.no },
] as const;

/** [emoji, label, epoch id, story] */
export const EPOCH_ITEMS: [string, string, (typeof EPOCHS)[number]['id'], string][] = [
  ['🦣', J.EPOCH_ITEMS[0][1], 'stone', J.EPOCH_ITEMS[0][3]],
  ['🔥', J.EPOCH_ITEMS[1][1], 'stone', J.EPOCH_ITEMS[1][3]],
  ['🪨', J.EPOCH_ITEMS[2][1], 'stone', J.EPOCH_ITEMS[2][3]],
  ['🎨', J.EPOCH_ITEMS[3][1], 'stone', J.EPOCH_ITEMS[3][3]],
  ['🏹', J.EPOCH_ITEMS[4][1], 'stone', J.EPOCH_ITEMS[4][3]],
  ['🦴', J.EPOCH_ITEMS[5][1], 'stone', J.EPOCH_ITEMS[5][3]],
  ['🐫', J.EPOCH_ITEMS[6][1], 'ancient', J.EPOCH_ITEMS[6][3]],
  ['🏛️', J.EPOCH_ITEMS[7][1], 'ancient', J.EPOCH_ITEMS[7][3]],
  ['🏟️', J.EPOCH_ITEMS[8][1], 'ancient', J.EPOCH_ITEMS[8][3]],
  ['📜', J.EPOCH_ITEMS[9][1], 'ancient', J.EPOCH_ITEMS[9][3]],
  ['🏺', J.EPOCH_ITEMS[10][1], 'ancient', J.EPOCH_ITEMS[10][3]],
  ['👑', J.EPOCH_ITEMS[11][1], 'ancient', J.EPOCH_ITEMS[11][3]],
  ['🏃', J.EPOCH_ITEMS[12][1], 'ancient', J.EPOCH_ITEMS[12][3]],
  ['🏰', J.EPOCH_ITEMS[13][1], 'medieval', J.EPOCH_ITEMS[13][3]],
  ['🛡️', J.EPOCH_ITEMS[14][1], 'medieval', J.EPOCH_ITEMS[14][3]],
  ['🤴', J.EPOCH_ITEMS[15][1], 'medieval', J.EPOCH_ITEMS[15][3]],
  ['⛪', J.EPOCH_ITEMS[16][1], 'medieval', J.EPOCH_ITEMS[16][3]],
  ['📖', J.EPOCH_ITEMS[17][1], 'medieval', J.EPOCH_ITEMS[17][3]],
  ['🛶', J.EPOCH_ITEMS[18][1], 'medieval', J.EPOCH_ITEMS[18][3]],
  ['🚀', J.EPOCH_ITEMS[19][1], 'modern', J.EPOCH_ITEMS[19][3]],
  ['📱', J.EPOCH_ITEMS[20][1], 'modern', J.EPOCH_ITEMS[20][3]],
  ['✈️', J.EPOCH_ITEMS[21][1], 'modern', J.EPOCH_ITEMS[21][3]],
  ['💻', J.EPOCH_ITEMS[22][1], 'modern', J.EPOCH_ITEMS[22][3]],
  ['🚇', J.EPOCH_ITEMS[23][1], 'modern', J.EPOCH_ITEMS[23][3]],
  ['🤖', J.EPOCH_ITEMS[24][1], 'modern', J.EPOCH_ITEMS[24][3]],
];

/** [question, emoji, correct answer, wrong, wrong, story] */
export const WHEN: [string, string, string, string, string, string][] = [
  [J.WHEN[0][0], '🦖', J.WHEN[0][2], J.WHEN[0][3], J.WHEN[0][4], J.WHEN[0][5]],
  [J.WHEN[1][0], '🐫', J.WHEN[1][2], J.WHEN[1][3], J.WHEN[1][4], J.WHEN[1][5]],
  [J.WHEN[2][0], '⛵', J.WHEN[2][2], J.WHEN[2][3], J.WHEN[2][4], J.WHEN[2][5]],
  [J.WHEN[3][0], '🧑‍🚀', J.WHEN[3][2], J.WHEN[3][3], J.WHEN[3][4], J.WHEN[3][5]],
  [J.WHEN[4][0], '🇺🇦', J.WHEN[4][2], J.WHEN[4][3], J.WHEN[4][4], J.WHEN[4][5]],
  [J.WHEN[5][0], '🤴', J.WHEN[5][2], J.WHEN[5][3], J.WHEN[5][4], J.WHEN[5][5]],
  [J.WHEN[6][0], '✈️', J.WHEN[6][2], J.WHEN[6][3], J.WHEN[6][4], J.WHEN[6][5]],
  [J.WHEN[7][0], '📖', J.WHEN[7][2], J.WHEN[7][3], J.WHEN[7][4], J.WHEN[7][5]],
  [J.WHEN[8][0], '🌙', J.WHEN[8][2], J.WHEN[8][3], J.WHEN[8][4], J.WHEN[8][5]],
  [J.WHEN[9][0], '⚔️', J.WHEN[9][2], J.WHEN[9][3], J.WHEN[9][4], J.WHEN[9][5]],
  [J.WHEN[10][0], '🏺', J.WHEN[10][2], J.WHEN[10][3], J.WHEN[10][4], J.WHEN[10][5]],
  [J.WHEN[11][0], '🏛️', J.WHEN[11][2], J.WHEN[11][3], J.WHEN[11][4], J.WHEN[11][5]],
  [J.WHEN[12][0], '🗼', J.WHEN[12][2], J.WHEN[12][3], J.WHEN[12][4], J.WHEN[12][5]],
  [J.WHEN[13][0], '🖥️', J.WHEN[13][2], J.WHEN[13][3], J.WHEN[13][4], J.WHEN[13][5]],
  [J.WHEN[14][0], '🛞', J.WHEN[14][2], J.WHEN[14][3], J.WHEN[14][4], J.WHEN[14][5]],
];
