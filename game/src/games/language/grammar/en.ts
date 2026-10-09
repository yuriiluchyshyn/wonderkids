import type { LangCode } from '@/core/language';
import type { GameKind } from '@/games/language/tasks';
import type { LanguageTexts, PackView } from '@/games/language/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/en/games/language.json';

/** The Language galaxy in English. */

const NAME: Record<LangCode, string> = J.NAME;
/** «Polish » for a foreign pack, nothing for the child's own language. */
const of = (p: PackView) => (p.native ? '' : `${NAME[p.lang]} `);
const pieces = (p: PackView) => (p.syllables ? J.pieces[1] : J.pieces[2]);

const OWN: Record<GameKind, { blurb: string; intro: string }> = J.OWN;

const other = (name: string): Record<GameKind, { blurb: string; intro: string }> => ({
  alphabet: {
    blurb: fill(J.other.alphabet.blurb, { name }),
    intro: fill(J.other.alphabet.intro, { name }),
  },
  bubbles: {
    blurb: fill(J.other.bubbles.blurb, { name }),
    intro: fill(J.other.bubbles.intro, { name }),
  },
  chain: {
    blurb: fill(J.other.chain.blurb, { name }),
    intro: fill(J.other.chain.intro, { name }),
  },
  rhymes: {
    blurb: fill(J.other.rhymes.blurb, { name }),
    intro: fill(J.other.rhymes.intro, { name }),
  },
  sentences: {
    blurb: fill(J.other.sentences.blurb, { name }),
    intro: fill(J.other.sentences.intro, { name }),
  },
});

export const en: LanguageTexts = {
  title: J.title,
  packName: (lang) => NAME[lang],
  card: (p, kind) => (p.native ? OWN[kind] : other(NAME[p.lang])[kind]),
  stage: (at, p) => {
    switch (at) {
      case 'abcPlain':
        return J.stage[1];
      case 'abcLong':
        return J.stage[2];
      case 'abcSpot':
        return J.stage[3];
      case 'abcWhole':
        return fill(J.stage[4], { p: of(p) });
      case 'parts':
        return p.syllables
          ? p.native
            ? J.stage[5]
            : fill(J.stage[6], { p: NAME[p.lang] })
          : fill(J.stage[7], { p: of(p) });
      case 'spell':
        return p.native && p.syllables ? J.stage[8] : J.stage[9];
      case 'strays':
        return p.byEar
          ? J.stage[10]
          : J.stage[11];
      case 'sameLetter':
        return J.stage[12];
      case 'halves':
        return J.stage[13];
      case 'assoc':
        return J.stage[14];
      case 'three':
        return J.stage[15];
      case 'long':
        return J.stage[16];
    }
  },

  order: (a, b) => fill(J.order, { a, b }),
  swapAsk: (p) => fill(J.swapAsk, { p: of(p) }),
  swapHint: (p, order) => (p.native ? fill(J.swapHint[1], { order }) : fill(J.swapHint[2], { p: NAME[p.lang] })),
  after: (prev, letter) => fill(J.after, { prev, letter }),
  before: (next, letter) => fill(J.before, { next, letter }),
  fillAsk: (p, how) =>
    how === 'all'
      ? fill(J.fillAsk[1], { p: of(p) })
      : how === 'one'
        ? fill(J.fillAsk[2], { p: of(p) })
        : fill(J.fillAsk[3], { p: of(p) }),
  fillHint: (p, neighbour) =>
    p.native ? fill(J.fillHint[1], { neighbour }) : fill(J.fillHint[2], { p: NAME[p.lang] }),

  runAsk: (p, from, to) => (p.native ? fill(J.runAsk[1], { from, to }) : fill(J.runAsk[2], { p: NAME[p.lang] })),
  runHint: (p, letters) => (p.native ? fill(J.runHint[1], { letters: letters.join(', ') }) : fill(J.runHint[2], { p: NAME[p.lang] })),
  partsAsk: (p, word) => (p.native ? fill(J.partsAsk[1], { p: pieces(p), word }) : fill(J.partsAsk[2], { p: NAME[p.lang], p2: pieces(p) })),
  partsHint: (p, word, parts) => (p.native ? fill(J.partsHint[1], { word, parts: parts.join(' — ') }) : fill(J.partsHint[2], { p: pieces(p) })),
  spellAsk: (p, word, byEar) => {
    if (p.native) return byEar ? J.spellAsk[1] : fill(J.spellAsk[2], { word });
    return byEar ? fill(J.spellAsk[3], { p: NAME[p.lang] }) : fill(J.spellAsk[4], { p: NAME[p.lang] });
  },
  spellHint: (p, word, letters, byEar) => {
    if (p.native) return fill(J.spellHint[1], { word, letters: letters.join(', ') });
    return byEar
      ? J.spellHint[2]
      : J.spellHint[3];
  },

  firstAsk: (p) => (p.native ? J.firstAsk[1] : fill(J.firstAsk[2], { p: NAME[p.lang] })),
  firstHint: (p, word, letter) => (p.native ? fill(J.firstHint[1], { word, letter }) : J.firstHint[2]),
  sameAsk: (p) => fill(J.sameAsk, { p: of(p) }),
  sameHint: (p, a, b, letter) => (p.native ? fill(J.sameHint[1], { a, b, letter }) : J.sameHint[2]),
  halfAsk: (p) => fill(J.halfAsk, { p: of(p) }),
  halfHint: (p, head, tail) => (p.native ? fill(J.halfHint[1], { head, tail }) : J.halfHint[2]),
  assocAsk: (p) => fill(J.assocAsk, { p: of(p) }),
  assocHint: (p, a, b) => (p.native ? fill(J.assocHint[1], { a, b }) : J.assocHint[2]),

  rhymeAsk: (p) => fill(J.rhymeAsk, { p: of(p) }),
  rhymeHint: (p, a, b) => (p.native ? fill(J.rhymeHint[1], { a, b }) : J.rhymeHint[2]),
  rhymeYes: (a, b) => fill(J.rhymeYes, { a, b }),

  sentenceAsk: (p) => fill(J.sentenceAsk, { p: of(p) }),
  sentenceHint: (p, first) =>
    p.native ? fill(J.sentenceHint[1], { first }) : J.sentenceHint[2],
  ends: [J.ends[0], J.ends[1]],
};
