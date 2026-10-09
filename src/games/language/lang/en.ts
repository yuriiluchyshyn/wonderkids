import type { LangCode } from '@/core/lang';
import type { GameKind } from '../tasks';
import type { LanguageTexts, PackView } from './types';

/** The Language galaxy in English. */

const NAME: Record<LangCode, string> = { uk: 'Ukrainian', en: 'English', pl: 'Polish' };
/** «Polish » for a foreign pack, nothing for the child's own language. */
const of = (p: PackView) => (p.native ? '' : `${NAME[p.lang]} `);
const pieces = (p: PackView) => (p.syllables ? 'syllables' : 'letters');

const OWN: Record<GameKind, { blurb: string; intro: string }> = {
  alphabet: {
    blurb: 'Put the letters in their places in the alphabet — all twenty-six of them',
    intro: 'The letters of the alphabet stand one after another, always in the same order. A few letters have gone missing! Drag each one to its place.',
  },
  bubbles: {
    blurb: 'Pop the bubbles in order: the alphabet and words',
    intro: 'Letters are hiding in the soap bubbles! Pop them in order — the way they stand in the alphabet.',
  },
  chain: {
    blurb: 'Join words: the first letter, halves of a word, meaning',
    intro: 'Every word begins with some letter. Join the word with its first letter!',
  },
  rhymes: {
    blurb: 'Find words that sound alike: cat — hat',
    intro: 'Some words end in the same way, as if they were singing together: cat — hat. That is a rhyme! Find the rhyme for every word.',
  },
  sentences: {
    blurb: 'Make a sentence out of words — from two to five',
    intro: 'The words have scattered! Put them in order to make a sentence. The first word is written with a capital letter, and there is a period at the end.',
  },
};

const other = (name: string): Record<GameKind, { blurb: string; intro: string }> => ({
  alphabet: {
    blurb: `${name}: put the letters in their places in the alphabet`,
    intro: `We are learning the ${name} alphabet! Its letters stand one after another, always in the same order. A few letters have gone missing — drag each one to its place.`,
  },
  bubbles: {
    blurb: `${name}: pop the bubbles — the alphabet and words`,
    intro: `We are learning ${name}! There are ${name} letters in the bubbles. Pop them in order, as in the ${name} alphabet. Tap the speaker to hear a letter.`,
  },
  chain: {
    blurb: `${name}: join words with letters and with one another`,
    intro: `We are learning ${name} words! Join every word with the letter it begins with. Tap the speaker to hear the word.`,
  },
  rhymes: {
    blurb: `${name}: find the words that rhyme`,
    intro: `${name} has rhymes too — words that sound alike at the end. Tap the speakers, listen to the words and join the ones that rhyme.`,
  },
  sentences: {
    blurb: `${name}: make a sentence out of words`,
    intro: `We are making sentences in ${name}! Put the words in order. The first word is written with a capital letter, and there is a period at the end.`,
  },
});

export const en: LanguageTexts = {
  title: 'Language',
  packName: (lang) => NAME[lang],
  card: (p, kind) => (p.native ? OWN[kind] : other(NAME[p.lang])[kind]),
  stage: (at, p) => {
    switch (at) {
      case 'abcPlain':
        return 'Now there are no clues in the empty squares. Remember which letter comes after which!';
      case 'abcLong':
        return 'The table has grown: now it has three rows of letters.';
      case 'abcSpot':
        return 'Now all the letters are in place — but two of them have swapped places. Find one of them and tap it!';
      case 'abcWhole':
        return `Here is the whole ${of(p)}alphabet! Put all the missing letters in their places.`;
      case 'parts':
        return p.syllables
          ? p.native
            ? 'Now there are syllables in the bubbles. Pop them in order to make a word!'
            : `Now we put ${NAME[p.lang]} words together from syllables. Pop the syllables in the order they stand in the word!`
          : `Now we put short ${of(p)}words together. Pop the letters in the order they stand in the word!`;
      case 'spell':
        return p.native && p.syllables ? 'And now we spell words from single letters. Pop letter after letter!' : 'The words are getting longer. Pop letter after letter — from left to right!';
      case 'strays':
        return p.byEar
          ? 'Now the word is not written — listen to it and spell it yourself. Careful: there are extra letters among the bubbles!'
          : 'Careful: there are extra letters among the bubbles now. They do not pop!';
      case 'sameLetter':
        return 'Now we join two words that begin with the same letter.';
      case 'halves':
        return 'The word has fallen into two halves! Find the ending for every beginning.';
      case 'assoc':
        return 'Now we look for words that belong together in meaning: what goes with what?';
      case 'three':
        return 'The sentences are getting longer: now they have three words.';
      case 'long':
        return 'And now — real big sentences of four and five words!';
    }
  },

  order: (a, b) => `In the alphabet the letter “${a}” comes before the letter “${b}.”`,
  swapAsk: (p) => `Two ${of(p)}letters have swapped places. Tap a letter that is not in its own place.`,
  swapHint: (p, order) => (p.native ? `${order} These two letters are blinking.` : `Sing the ${NAME[p.lang]} alphabet in order. The two letters that swapped places are blinking.`),
  after: (prev, letter) => `After the letter “${prev}” in the alphabet comes the letter “${letter}.”`,
  before: (next, letter) => `Before the letter “${next}” in the alphabet comes the letter “${letter}.”`,
  fillAsk: (p, how) =>
    how === 'all'
      ? `Put the whole ${of(p)}alphabet together: put every letter in its place.`
      : how === 'one'
        ? `Put the ${of(p)}letter in its place in the alphabet.`
        : `Put the ${of(p)}letters in their places in the alphabet.`,
  fillHint: (p, neighbour) =>
    p.native ? `${neighbour} Its place is blinking.` : `Remember the ${NAME[p.lang]} alphabet. The place for the next letter is blinking, and there are clues in the empty squares.`,

  runAsk: (p, from, to) => (p.native ? `Pop the letters in alphabet order: from ${from} to ${to}.` : `Pop the ${NAME[p.lang]} letters in alphabet order — from the first to the last.`),
  runHint: (p, letters) => (p.native ? `Remember the alphabet: ${letters.join(', ')}.` : `Remember the ${NAME[p.lang]} alphabet. The bubble you need is blinking.`),
  partsAsk: (p, word) => (p.native ? `Put the word together from ${pieces(p)}: ${word}.` : `Put the ${NAME[p.lang]} word together from ${pieces(p)}. It is written under the picture.`),
  partsHint: (p, word, parts) => (p.native ? `The word “${word}” goes together like this: ${parts.join(' — ')}.` : `Look at the word under the picture and pop the ${pieces(p)} from left to right.`),
  spellAsk: (p, word, byEar) => {
    if (p.native) return byEar ? 'Listen to the word and spell it from the letters.' : `Spell the word from the letters: ${word}.`;
    return byEar ? `Listen to the ${NAME[p.lang]} word and spell it from the letters.` : `Spell the ${NAME[p.lang]} word from the letters. It is written under the picture.`;
  },
  spellHint: (p, word, letters, byEar) => {
    if (p.native) return `Say the word slowly: ${word}. Its letters: ${letters.join(', ')}.`;
    return byEar
      ? 'Tap the speaker by the picture, listen to the word again and pop the letters from left to right. The extra letters do not pop.'
      : 'Look at the word under the picture and pop the letters from left to right. The extra letters do not pop.';
  },

  firstAsk: (p) => (p.native ? 'Join every word with the letter it begins with.' : `Join every ${NAME[p.lang]} word with its first letter.`),
  firstHint: (p, word, letter) => (p.native ? `Say the word out loud and listen to the first sound. “${word}” begins with the letter “${letter}.”` : 'Look which letter every word begins with.'),
  sameAsk: (p) => `Join the ${of(p)}words that begin with the same letter.`,
  sameHint: (p, a, b, letter) => (p.native ? `“${a}” and “${b}” begin with the same letter — “${letter}.”` : 'Compare the first letters of the words: in a pair they are the same.'),
  halfAsk: (p) => `Join the beginning of each ${of(p)}word with its ending.`,
  halfHint: (p, head, tail) => (p.native ? `Look at the picture: it is “${head}${tail}.” The word begins with “${head}.”` : 'Tap the speaker by the picture, listen to the word and find its beginning.'),
  assocAsk: (p) => `Join the ${of(p)}words that belong together in meaning.`,
  assocHint: (p, a, b) => (p.native ? `Think what goes together. “${a}” — “${b}.”` : 'Tap the speaker to hear the word. Look for what goes with it.'),

  rhymeAsk: (p) => `Find the pairs of ${of(p)}words that rhyme.`,
  rhymeHint: (p, a, b) => (p.native ? `Words rhyme when they sound the same at the end: “${a}” — “${b}.”` : 'Tap the speakers and listen: words that rhyme sound the same at the end.'),
  rhymeYes: (a, b) => `“${a}” — “${b}.” That’s a rhyme!`,

  sentenceAsk: (p) => `Put the ${of(p)}words in order to make a sentence.`,
  sentenceHint: (p, first) =>
    p.native ? `A sentence begins with a word with a capital letter: “${first}.” The last word has a period.` : 'A sentence begins with a word with a capital letter and ends with a word with a period.',
  ends: ['beginning', 'end'],
};
