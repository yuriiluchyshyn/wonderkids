import { ASSOC_UK } from './assoc';
import { conjugate, noun, verb, type Tense } from '@/core/language/uk';
import type { LangPack, Sentence, Word } from '../tasks';
import TEXTS from '@/locales/app/uk/games/language.json';

const J = TEXTS.content.uk;

/** Words by syllables, simplest first: «ма-ма», then closed syllables, then three and four syllables. */
const SYLLABLES = J.SYLLABLES;

/** More words by syllables — sorted in with the ones above by their length. */
const SYLLABLES_MORE = J.SYLLABLES_MORE;

/** Short words to spell letter by letter: three letters first, then four and five. */
const SPELL = J.SPELL;

/** More words to spell — sorted in with the ones above by their length. */
const SPELL_MORE = J.SPELL_MORE;

/** Extra words for the families below: `first word of the family: more words that rhyme with it`. */
const RHYMES_MORE = J.RHYMES_MORE;

/** Rhyme families (every word rhymes with the others of its line), concrete and pictured first. */
const RHYMES = J.RHYMES;

const cells = (raw: string) => raw.trim().split(/\s+/);
const lines = (raw: string) => raw.trim().split('\n');

/** Each word once, shortest first — the order within one length is the order they were written in. */
function byLength<T>(items: T[], wordOf: (item: T) => string, sizeOf: (item: T) => number): T[] {
  const seen = new Set<string>();
  const unique = items.filter((item) => !seen.has(wordOf(item)) && seen.add(wordOf(item)));
  return unique.map((item, at) => ({ item, at })).sort((a, b) => sizeOf(a.item) - sizeOf(b.item) || a.at - b.at).map(({ item }) => item);
}

const PART_WORDS = byLength(
  cells(SYLLABLES + SYLLABLES_MORE).map((cell) => {
    const [word, emoji] = cell.split('|');
    return { parts: word.split('-'), emoji };
  }),
  (w) => w.parts.join(''),
  (w) => w.parts.length,
);
const SPELL_WORDS = byLength(
  cells(SPELL + SPELL_MORE).map((cell) => cell.split('|') as Word),
  (w) => w[0],
  (w) => [...w[0]].length,
).filter((w) => [...w[0]].length <= 6);

/** The rhyme families, each with its extra words from `RHYMES_MORE`. */
const RHYME_FAMILIES = (() => {
  const more = new Map(lines(RHYMES_MORE).map((line) => line.split(':').map((part) => part.trim()) as [string, string]));
  return lines(RHYMES).map(cells).map((family) => [...family, ...cells(more.get(family[0].split('|')[0]) ?? '')].filter(Boolean));
})();

// ---- Sentences: built from parts by the phrase engine, so every combination
// is a correct one — in the present, the past and the future, with the verb
// agreeing with who it is about («Кіт спав.», «Пташка співала.»). ----

const DO = {
  sleep: verb(J.DO.sleep._, [J.DO.sleep[0], J.DO.sleep[1]]),
  eat: verb(J.DO.eat[1][1], [J.DO.eat[0], J.DO.eat[1][2]], J.DO.eat[2] as { past: [string, string, string, string] }),
  play: verb(J.DO.play._, [J.DO.play[0], J.DO.play[1]]),
  jump: verb(J.DO.jump._, [J.DO.jump[0], J.DO.jump[1]]),
  run: verb(J.DO.run[1][1], [J.DO.run[0], J.DO.run[1][2]], J.DO.run[2] as { past: [string, string, string, string] }),
  purr: verb(J.DO.purr._, [J.DO.purr[0], J.DO.purr[1]]),
  bark: verb(J.DO.bark._, [J.DO.bark[0], J.DO.bark[1]]),
  hide: verb(J.DO.hide._, [J.DO.hide[0], J.DO.hide[1]]),
  fly: verb(J.DO.fly._, [J.DO.fly[0], J.DO.fly[1]]),
  sing: verb(J.DO.sing._, [J.DO.sing[0], J.DO.sing[1]]),
  swim: verb(J.DO.swim[1][1], [J.DO.swim[0], J.DO.swim[1][2]], J.DO.swim[2] as { past: [string, string, string, string] }),
  neigh: verb(J.DO.neigh._, [J.DO.neigh[0], J.DO.neigh[1]]),
  croak: verb(J.DO.croak._, [J.DO.croak[0], J.DO.croak[1]]),
  squeak: verb(J.DO.squeak._, [J.DO.squeak[0], J.DO.squeak[1]]),
  roar: verb(J.DO.roar._, [J.DO.roar[0], J.DO.roar[1]]),
  go: verb(J.DO.go[1][1], [J.DO.go[0], J.DO.go[1][2]], J.DO.go[2] as { past: [string, string, string, string] }),
  walk: verb(J.DO.walk._, [J.DO.walk[0], J.DO.walk[1]]),
  howl: verb(J.DO.howl._, [J.DO.howl[0], J.DO.howl[1]]),
  cluck: verb(J.DO.cluck._, [J.DO.cluck[0], J.DO.cluck[1]]),
  quack: verb(J.DO.quack._, [J.DO.quack[0], J.DO.quack[1]]),
  hurry: verb(J.DO.hurry._, [J.DO.hurry[0], J.DO.hurry[1]]),
  sit: verb(J.DO.sit._, [J.DO.sit[0], J.DO.sit[1]]),
  read: verb(J.DO.read._, [J.DO.read[0], J.DO.read[1]]),
  drink: verb(J.DO.drink._, [J.DO.drink[0], J.DO.drink[1]]),
  draw: verb(J.DO.draw._, [J.DO.draw[0], J.DO.draw[1]]),
  bake: verb(J.DO.bake[1][1], [J.DO.bake[0], J.DO.bake[1][2]], J.DO.bake[2] as { past: [string, string, string, string] }),
  carry: verb(J.DO.carry[1][1], [J.DO.carry[0], J.DO.carry[1][2]], J.DO.carry[2] as { past: [string, string, string, string] }),
  buy: verb(J.DO.buy._, [J.DO.buy[0], J.DO.buy[1]]),
  wash: verb(J.DO.wash._, [J.DO.wash[0], J.DO.wash[1]]),
  catch: verb(J.DO.catch._, [J.DO.catch[0], J.DO.catch[1]]),
  cook: verb(J.DO.cook._, [J.DO.cook[0], J.DO.cook[1]]),
  water: verb(J.DO.water._, [J.DO.water[0], J.DO.water[1]]),
  feed: verb(J.DO.feed._, [J.DO.feed[0], J.DO.feed[1]]),
  seek: verb(J.DO.seek._, [J.DO.seek[0], J.DO.seek[1]]),
  hold: verb(J.DO.hold._, [J.DO.hold[0], J.DO.hold[1]]),
  build: verb(J.DO.build._, [J.DO.build[0], J.DO.build[1]]),
  learn: verb(J.DO.learn._, [J.DO.learn[0], J.DO.learn[1]]),
};
type Does = keyof typeof DO;
type G = 'm' | 'f' | 'n';
const TENSES: Tense[] = ['present', 'past', 'future'];
/** Someone a sentence is about: the verb only needs their gender. */
const someone = (gender: G) => noun('', gender, { animate: true });
const said = (does: Does, gender: G, tense: Tense) => conjugate(DO[does], tense, someone(gender));

/** Who — and five things each of them does. */
const DOERS: [who: string, gender: G, emoji: string, does: Does[]][] = [
  [J.DOERS[0][0], 'm', '🐱', ['sleep', 'purr', 'eat', 'play', 'jump']],
  [J.DOERS[1][0], 'm', '🐶', ['bark', 'run', 'sleep', 'eat', 'play']],
  [J.DOERS[2][0], 'm', '🐰', ['jump', 'run', 'eat', 'sleep', 'hide']],
  [J.DOERS[3][0], 'f', '🐦', ['fly', 'sing', 'eat', 'sleep', 'jump']],
  [J.DOERS[4][0], 'f', '🐟', ['swim', 'eat', 'sleep', 'play', 'hide']],
  [J.DOERS[5][0], 'm', '🐴', ['run', 'jump', 'eat', 'sleep', 'neigh']],
  [J.DOERS[6][0], 'f', '🐸', ['jump', 'croak', 'swim', 'sleep', 'eat']],
  [J.DOERS[7][0], 'f', '🐭', ['run', 'squeak', 'eat', 'sleep', 'hide']],
  [J.DOERS[8][0], 'm', '🐻', ['sleep', 'roar', 'eat', 'go', 'walk']],
  [J.DOERS[9][0], 'f', '🦊', ['run', 'hide', 'sleep', 'eat', 'walk']],
  [J.DOERS[10][0], 'm', '🦔', ['sleep', 'run', 'eat', 'hide', 'walk']],
  [J.DOERS[11][0], 'f', '🐿️', ['jump', 'run', 'eat', 'hide', 'play']],
  [J.DOERS[12][0], 'm', '🐺', ['howl', 'run', 'sleep', 'eat', 'go']],
  [J.DOERS[13][0], 'f', '🐔', ['cluck', 'run', 'eat', 'sleep', 'walk']],
  [J.DOERS[14][0], 'f', '🦆', ['quack', 'swim', 'fly', 'eat', 'sleep']],
  [J.DOERS[15][0], 'm', '🐘', ['go', 'eat', 'sleep', 'walk', 'run']],
  [J.DOERS[16][0], 'n', '🐈', ['play', 'purr', 'sleep', 'eat', 'jump']],
];
const PEOPLE: [who: string, gender: G][] = [[J.PEOPLE[0][0], 'f'], [J.PEOPLE[1][0], 'm'], [J.PEOPLE[2][0], 'f'], [J.PEOPLE[3][0], 'm'], [J.PEOPLE[4][0], 'f'], [J.PEOPLE[5][0], 'm'], [J.PEOPLE[6][0], 'f'], [J.PEOPLE[7][0], 'f'], [J.PEOPLE[8][0], 'm'], [J.PEOPLE[9][0], 'm']];
const ACTIONS: [does: Does, what: string, emoji: string][] = [
  ['read', J.ACTIONS[0][1], '📖'],
  ['eat', J.ACTIONS[1][1], '🍎'],
  ['drink', J.ACTIONS[2][1], '🧃'],
  ['draw', J.ACTIONS[3][1], '☀️'],
  ['bake', J.ACTIONS[4][1], '🥧'],
  ['carry', J.ACTIONS[5][1], '🎂'],
  ['buy', J.ACTIONS[6][1], '🍞'],
  ['wash', J.ACTIONS[7][1], '☕'],
  ['catch', J.ACTIONS[8][1], '🐟'],
  ['cook', J.ACTIONS[9][1], '🍲'],
  ['water', J.ACTIONS[10][1], '🌷'],
  ['feed', J.ACTIONS[11][1], '🐱'],
  ['seek', J.ACTIONS[12][1], '🔑'],
  ['hold', J.ACTIONS[13][1], '☂️'],
  ['build', J.ACTIONS[14][1], '🏠'],
  ['learn', J.ACTIONS[15][1], '📜'],
  ['sing', J.ACTIONS[16][1], '🎶'],
];
const HEROES: [who: string, gender: G, emoji: string][] = [
  [J.HEROES[0][0], 'm', '🐶'],
  [J.HEROES[1][0], 'm', '🐘'],
  [J.HEROES[2][0], 'm', '🐺'],
  [J.HEROES[3][0], 'm', '🐱'],
  [J.HEROES[4][0], 'm', '👦'],
  [J.HEROES[5][0], 'f', '👧'],
  [J.HEROES[6][0], 'f', '🦊'],
  [J.HEROES[7][0], 'f', '🦆'],
  [J.HEROES[8][0], 'f', '🐭'],
  [J.HEROES[9][0], 'f', '🐿️'],
  [J.HEROES[10][0], 'm', '🐻'],
  [J.HEROES[11][0], 'm', '🦔'],
  [J.HEROES[12][0], 'm', '🐴'],
  [J.HEROES[13][0], 'f', '🐦'],
  [J.HEROES[14][0], 'n', '🐥'],
  [J.HEROES[15][0], 'n', '🐇'],
  [J.HEROES[16][0], 'n', '🐈'],
];
/** What a hero does: a word before the verb, the verb, words after it. A two-word ending makes a four-word sentence, a three-word one — five. */
const ENDINGS: [lead: string, does: Does, tail: string][] = [
  [J.ENDINGS[0][0], 'run', ''],
  [J.ENDINGS[1][0], 'sleep', ''],
  [J.ENDINGS[2][0], 'play', ''],
  ['', 'run', J.ENDINGS[3][2]],
  ['', 'go', J.ENDINGS[4][2]],
  ['', 'hurry', J.ENDINGS[5][2]],
  ['', 'jump', J.ENDINGS[6][2]],
  ['', 'walk', J.ENDINGS[7][2]],
  ['', 'sleep', J.ENDINGS[8][2]],
  ['', 'sit', J.ENDINGS[9][2]],
];
const sentence = (...words: string[]) => `${words.filter(Boolean).join(' ')}.`;
// The present comes first: the first steps of a path never meet another tense.
const TWO: Sentence[] = TENSES.flatMap((tense) => DOERS[0][3].flatMap((_, i) => DOERS.map(([who, gender, emoji, does]): Sentence => [sentence(who, said(does[i], gender, tense)), emoji])));
const THREE: Sentence[] = TENSES.flatMap((tense) =>
  ACTIONS.flatMap(([does, what, emoji], i) =>
    PEOPLE.map((_, j): Sentence => {
      const [who, gender] = PEOPLE[(i + j) % PEOPLE.length];
      return [sentence(who, said(does, gender, tense), what), emoji];
    }),
  ),
);
const LONG: Sentence[] = TENSES.flatMap((tense) =>
  ENDINGS.flatMap(([lead, does, tail], i) =>
    HEROES.map((_, j): Sentence => {
      const [who, gender, emoji] = HEROES[(i + j) % HEROES.length];
      return [sentence(who, lead, said(does, gender, tense), tail), emoji];
    }),
  ),
);

export const UK: LangPack = {
  lang: 'uk',
  name: J.UK.name,
  flag: '🇺🇦',
  prefix: '',
  syllables: true,
  byEar: true,
  alphabet: [...J.UK.alphabet[0]],
  partWords: PART_WORDS,
  spellWords: SPELL_WORDS,
  halves: PART_WORDS.map(({ parts, emoji }) => [parts[0], parts.slice(1).join(''), emoji]),
  assoc: ASSOC_UK,
  rhymes: RHYME_FAMILIES,
  sentences: { two: TWO, three: THREE, long: LONG },
  cards: {
    alphabet: {
      label: J.UK.cards.alphabet.label,
      icon: '🔠',
      blurb: J.UK.cards.alphabet.blurb,
      intro: J.UK.cards.alphabet.intro,
      difficulty: [1, 2],
    },
    bubbles: {
      label: J.UK.cards.bubbles.label,
      icon: '🫧',
      blurb: J.UK.cards.bubbles.blurb,
      intro: J.UK.cards.bubbles.intro,
      difficulty: [1, 2],
    },
    chain: {
      label: J.UK.cards.chain.label,
      icon: '🔗',
      blurb: J.UK.cards.chain.blurb,
      intro: J.UK.cards.chain.intro,
      difficulty: [1, 2],
    },
    rhymes: {
      label: J.UK.cards.rhymes.label,
      icon: '🎶',
      blurb: J.UK.cards.rhymes.blurb,
      intro: J.UK.cards.rhymes.intro,
      difficulty: [1, 3],
    },
    sentences: {
      label: J.UK.cards.sentences.label,
      icon: '🧱',
      blurb: J.UK.cards.sentences.blurb,
      intro: J.UK.cards.sentences.intro,
      difficulty: [1, 2],
    },
  },
};
