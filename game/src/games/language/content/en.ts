import { ASSOC_EN } from './assoc';
import type { LangPack, Sentence, Word } from '../tasks';
import TEXTS from '@/locales/app/en/games/language.json';

const J = TEXTS.pack;

/** Three-letter words for the phonics steps: C-A-T, D-O-G. */
const PHONICS = J.PHONICS;

/** Longer words to spell: four letters first, then five. */
const SPELL = J.SPELL;

/** A word in two halves: compound words first (sun + flower), then two-syllable words. */
const HALVES = J.HALVES;

/** Rhyme families (by sound, not spelling), pictured ones first. */
const RHYMES = J.RHYMES;

const cells = (raw: string) => raw.trim().split(/\s+/);
const lines = (raw: string) => raw.trim().split('\n');

/** Each word once, in the order written. */
const words = (raw: string): Word[] => {
  const seen = new Set<string>();
  return cells(raw)
    .map((cell) => cell.split('|') as Word)
    .filter((w) => !seen.has(w[0]) && seen.add(w[0]));
};
const PHONICS_WORDS = words(PHONICS);

// ---- Sentences: built from parts so every combination is a correct one. ----

/** Who — and five things they do ("Dogs bark."). */
const DOERS: [who: string, emoji: string, does: string[]][] = [
  [J.DOERS[0][0], '🐶', J.DOERS[0][2]],
  [J.DOERS[1][0], '🐱', J.DOERS[1][2]],
  [J.DOERS[2][0], '🐦', J.DOERS[2][2]],
  [J.DOERS[3][0], '🐟', J.DOERS[3][2]],
  [J.DOERS[4][0], '🐸', J.DOERS[4][2]],
  [J.DOERS[5][0], '🐻', J.DOERS[5][2]],
  [J.DOERS[6][0], '🐝', J.DOERS[6][2]],
  [J.DOERS[7][0], '🧒', J.DOERS[7][2]],
  [J.DOERS[8][0], '🐴', J.DOERS[8][2]],
  [J.DOERS[9][0], '👶', J.DOERS[9][2]],
  [J.DOERS[10][0], '🦆', J.DOERS[10][2]],
  [J.DOERS[11][0], '🦁', J.DOERS[11][2]],
  [J.DOERS[12][0], '🐒', J.DOERS[12][2]],
  [J.DOERS[13][0], '🐰', J.DOERS[13][2]],
  [J.DOERS[14][0], '🐄', J.DOERS[14][2]],
  [J.DOERS[15][0], '🐷', J.DOERS[15][2]],
  [J.DOERS[16][0], '🦉', J.DOERS[16][2]],
  [J.DOERS[17][0], '🐺', J.DOERS[17][2]],
  [J.DOERS[18][0], '🐍', J.DOERS[18][2]],
  [J.DOERS[19][0], '🐳', J.DOERS[19][2]],
  [J.DOERS[20][0], '🐭', J.DOERS[20][2]],
  [J.DOERS[21][0], '🐔', J.DOERS[21][2]],
  [J.DOERS[22][0], '🐜', J.DOERS[22][2]],
  [J.DOERS[23][0], '✈️', J.DOERS[23][2]],
  [J.DOERS[24][0], '👦', J.DOERS[24][2]],
];

const PEOPLE = J.PEOPLE;
const ACTIONS: [phrase: string, emoji: string][] = [
  [J.ACTIONS[0][0], '📖'],
  [J.ACTIONS[1][0], '🍎'],
  [J.ACTIONS[2][0], '🧃'],
  [J.ACTIONS[3][0], '🌸'],
  [J.ACTIONS[4][0], '🎂'],
  [J.ACTIONS[5][0], '🍕'],
  [J.ACTIONS[6][0], '🍞'],
  [J.ACTIONS[7][0], '🍽️'],
  [J.ACTIONS[8][0], '⚽'],
  [J.ACTIONS[9][0], '🍲'],
  [J.ACTIONS[10][0], '🐱'],
  [J.ACTIONS[11][0], '🚲'],
  [J.ACTIONS[12][0], '🎩'],
  [J.ACTIONS[13][0], '🎵'],
  [J.ACTIONS[14][0], '🖼️'],
  [J.ACTIONS[15][0], '🌷'],
  [J.ACTIONS[16][0], '🚗'],
  [J.ACTIONS[17][0], '🏠'],
  [J.ACTIONS[18][0], '🐟'],
  [J.ACTIONS[19][0], '🚪'],
  [J.ACTIONS[20][0], '🎶'],
  [J.ACTIONS[21][0], '🤝'],
  [J.ACTIONS[22][0], '🍏'],
  [J.ACTIONS[23][0], '🧸'],
  [J.ACTIONS[24][0], '⭐'],
  [J.ACTIONS[25][0], '🥛'],
  [J.ACTIONS[26][0], '🔑'],
  [J.ACTIONS[27][0], '🎂'],
  [J.ACTIONS[28][0], '🍵'],
  [J.ACTIONS[29][0], '🗺️'],
];

const HEROES: [who: string, emoji: string][] = [
  [J.HEROES[0][0], '🐶'],
  [J.HEROES[1][0], '🐻'],
  [J.HEROES[2][0], '🐒'],
  [J.HEROES[3][0], '🐭'],
  [J.HEROES[4][0], '👧'],
  [J.HEROES[5][0], '👦'],
  [J.HEROES[6][0], '🐱'],
  [J.HEROES[7][0], '🐸'],
  [J.HEROES[8][0], '🐴'],
  [J.HEROES[9][0], '🐤'],
  [J.HEROES[10][0], '🦊'],
  [J.HEROES[11][0], '🐺'],
  [J.HEROES[12][0], '🐷'],
  [J.HEROES[13][0], '🦒'],
  [J.HEROES[14][0], '🐰'],
  [J.HEROES[15][0], '🐑'],
  [J.HEROES[16][0], '🦁'],
  [J.HEROES[17][0], '🦆'],
  [J.HEROES[18][0], '🐨'],
  [J.HEROES[19][0], '🦉'],
];
/** One-word endings make four-word sentences, two-word ones — five. */
const ENDINGS = J.ENDINGS;

const TWO: Sentence[] = DOERS[0][2].flatMap((_, i) => DOERS.map(([who, emoji, does]): Sentence => [`${who} ${does[i]}.`, emoji]));
const THREE: Sentence[] = ACTIONS.flatMap(([phrase, emoji], i) => PEOPLE.map((_, j): Sentence => [`${PEOPLE[(i + j) % PEOPLE.length]} ${phrase}.`, emoji]));
const LONG: Sentence[] = ENDINGS.flatMap((ending, i) => HEROES.map((_, j): Sentence => {
  const [who, emoji] = HEROES[(i + j) % HEROES.length];
  return [`${who} ${ending}.`, emoji];
}));

export const EN: LangPack = {
  lang: 'en',
  name: J.EN.name,
  flag: '🇬🇧',
  prefix: 'en_',
  syllables: false,
  byEar: false,
  alphabet: [...J.EN.alphabet[0]],
  partWords: PHONICS_WORDS.map(([word, emoji]) => ({ parts: [...word], emoji })),
  spellWords: words(SPELL),
  halves: cells(HALVES).map((cell) => cell.split('|') as [string, string, string]),
  assoc: ASSOC_EN,
  rhymes: lines(RHYMES).map(cells),
  sentences: { two: TWO, three: THREE, long: LONG },
  cards: {
    alphabet: {
      label: J.EN.cards.alphabet.label,
      icon: '🔠',
      blurb: J.EN.cards.alphabet.blurb,
      intro: J.EN.cards.alphabet.intro,
      difficulty: [1, 2],
    },
    bubbles: {
      label: J.EN.cards.bubbles.label,
      icon: '🫧',
      blurb: J.EN.cards.bubbles.blurb,
      intro: J.EN.cards.bubbles.intro,
      difficulty: [1, 2],
    },
    chain: {
      label: J.EN.cards.chain.label,
      icon: '🔗',
      blurb: J.EN.cards.chain.blurb,
      intro: J.EN.cards.chain.intro,
      difficulty: [1, 3],
    },
    rhymes: {
      label: J.EN.cards.rhymes.label,
      icon: '🎶',
      blurb: J.EN.cards.rhymes.blurb,
      intro: J.EN.cards.rhymes.intro,
      difficulty: [2, 3],
    },
    sentences: {
      label: J.EN.cards.sentences.label,
      icon: '🧱',
      blurb: J.EN.cards.sentences.blurb,
      intro: J.EN.cards.sentences.intro,
      difficulty: [2, 3],
    },
  },
};
