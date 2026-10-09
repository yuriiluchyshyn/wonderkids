import { ASSOC_PL } from './assoc';
import type { LangPack, Sentence, Word } from '../tasks';
import TEXTS from '@/locales/app/pl/games/language.json';

const J = TEXTS.pack;

/**
 * The Polish pack: the same five games as the Ukrainian one, on Polish
 * letters and words. Like Ukrainian, Polish is read the way it is written, so
 * the first words are put together from syllables and the hardest are spelled
 * by ear.
 */

/** Words by syllables, shortest first: `sy-la-by|emoji`. */
const SYLLABLES = J.SYLLABLES;

/** Words to spell letter by letter, shortest first: `word|emoji`, then words without a picture. */
const SPELL = J.SPELL;

/** Rhyming families — every family ends in its own way, so a pair can be found by ear alone. */
const RHYMES = J.RHYMES;

const cells = (raw: string) => raw.trim().split(/\s+/);
const lines = (raw: string) => raw.trim().split('\n');

const words = (raw: string): Word[] => {
  const seen = new Set<string>();
  return cells(raw)
    .map((cell): Word => [cell.split('|')[0], cell.split('|')[1] ?? ''])
    .filter((w) => !seen.has(w[0]) && seen.add(w[0]));
};

const PART_WORDS = words(SYLLABLES).map(([word, emoji]) => ({ parts: word.split('-'), emoji }));
/** The words to spell must not repeat the ones put together from syllables. */
/** A board holds six bubbles, so a word to spell has six letters at most. */
const SPELL_WORDS = words(SPELL).filter(([word]) => word.length <= 6 && !PART_WORDS.some(({ parts }) => parts.join('') === word));

// ---- Sentences: built from parts so every combination is a correct one. ----

/** «Psy szczekają.» — a plural doer and what it does; any verb fits its own doer only. */
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
  [J.DOERS[9][0], '🦆', J.DOERS[9][2]],
  [J.DOERS[10][0], '🦁', J.DOERS[10][2]],
  [J.DOERS[11][0], '🐒', J.DOERS[11][2]],
  [J.DOERS[12][0], '🐰', J.DOERS[12][2]],
  [J.DOERS[13][0], '🐄', J.DOERS[13][2]],
  [J.DOERS[14][0], '🦉', J.DOERS[14][2]],
  [J.DOERS[15][0], '🐺', J.DOERS[15][2]],
  [J.DOERS[16][0], '🐭', J.DOERS[16][2]],
  [J.DOERS[17][0], '🐔', J.DOERS[17][2]],
  [J.DOERS[18][0], '🐜', J.DOERS[18][2]],
  [J.DOERS[19][0], '✈️', J.DOERS[19][2]],
];

/** «Mama czyta książkę.» — the present tense does not care who is a he and who is a she. */
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
  [J.ACTIONS[8][0], '🍲'],
  [J.ACTIONS[9][0], '🐱'],
  [J.ACTIONS[10][0], '🚲'],
  [J.ACTIONS[11][0], '🎩'],
  [J.ACTIONS[12][0], '🎵'],
  [J.ACTIONS[13][0], '🖼️'],
  [J.ACTIONS[14][0], '🌷'],
  [J.ACTIONS[15][0], '🚗'],
  [J.ACTIONS[16][0], '🏠'],
  [J.ACTIONS[17][0], '🐟'],
  [J.ACTIONS[18][0], '🚪'],
  [J.ACTIONS[19][0], '🎶'],
  [J.ACTIONS[20][0], '🐶'],
  [J.ACTIONS[21][0], '⭐'],
  [J.ACTIONS[22][0], '🥛'],
  [J.ACTIONS[23][0], '🔑'],
  [J.ACTIONS[24][0], '🍰'],
  [J.ACTIONS[25][0], '🍵'],
  [J.ACTIONS[26][0], '🗺️'],
  [J.ACTIONS[27][0], '🍦'],
  [J.ACTIONS[28][0], '⚽'],
  [J.ACTIONS[29][0], '🌳'],
];

/** «Mały piesek biegnie przez łąkę.» — the adjective already answers to its noun. */
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
const ENDINGS = J.ENDINGS;

const TWO: Sentence[] = DOERS[0][2].flatMap((_, i) => DOERS.map(([who, emoji, does]): Sentence => [`${who} ${does[i]}.`, emoji]));
const THREE: Sentence[] = ACTIONS.flatMap(([phrase, emoji], i) => PEOPLE.map((_, j): Sentence => [`${PEOPLE[(i + j) % PEOPLE.length]} ${phrase}.`, emoji]));
const LONG: Sentence[] = ENDINGS.flatMap((ending, i) => HEROES.map((_, j): Sentence => {
  const [who, emoji] = HEROES[(i + j) % HEROES.length];
  return [`${who} ${ending}.`, emoji];
}));

export const PL: LangPack = {
  lang: 'pl',
  name: J.PL.name,
  flag: '🇵🇱',
  prefix: 'pl_',
  syllables: true,
  byEar: true,
  alphabet: [...J.PL.alphabet[0]],
  partWords: PART_WORDS,
  spellWords: SPELL_WORDS,
  halves: PART_WORDS.map(({ parts, emoji }) => [parts[0], parts.slice(1).join(''), emoji]),
  assoc: ASSOC_PL,
  rhymes: lines(RHYMES).map(cells),
  sentences: { two: TWO, three: THREE, long: LONG },
  // The cards as a Ukrainian-speaking child sees them; English and Polish are in `grammar/`.
  cards: {
    alphabet: {
      label: J.PL.cards.alphabet.label,
      icon: '🔠',
      blurb: J.PL.cards.alphabet.blurb,
      intro: J.PL.cards.alphabet.intro,
      difficulty: [1, 2],
    },
    bubbles: {
      label: J.PL.cards.bubbles.label,
      icon: '🫧',
      blurb: J.PL.cards.bubbles.blurb,
      intro: J.PL.cards.bubbles.intro,
      difficulty: [1, 2],
    },
    chain: {
      label: J.PL.cards.chain.label,
      icon: '🔗',
      blurb: J.PL.cards.chain.blurb,
      intro: J.PL.cards.chain.intro,
      difficulty: [1, 3],
    },
    rhymes: {
      label: J.PL.cards.rhymes.label,
      icon: '🎶',
      blurb: J.PL.cards.rhymes.blurb,
      intro: J.PL.cards.rhymes.intro,
      difficulty: [2, 3],
    },
    sentences: {
      label: J.PL.cards.sentences.label,
      icon: '🧱',
      blurb: J.PL.cards.sentences.blurb,
      intro: J.PL.cards.sentences.intro,
      difficulty: [2, 3],
    },
  },
};
