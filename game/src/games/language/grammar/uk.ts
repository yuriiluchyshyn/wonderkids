import type { LangCode } from '@/core/language';
import type { LanguageTexts, PackView } from '@/games/language/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/uk/games/language.json';

/** The Language galaxy in Ukrainian. */

/** «англійські літери», «англійську літеру», «англійське слово», «англійського слова», «англійських слів», «англійська абетка» */
const ADJECTIVE: Record<LangCode, [string, string, string, string, string, string]> = {
  uk: [J.ADJECTIVE.uk[0], J.ADJECTIVE.uk[1], J.ADJECTIVE.uk[2], J.ADJECTIVE.uk[3], J.ADJECTIVE.uk[4], J.ADJECTIVE.uk[5]],
  en: [J.ADJECTIVE.en[0], J.ADJECTIVE.en[1], J.ADJECTIVE.en[2], J.ADJECTIVE.en[3], J.ADJECTIVE.en[4], J.ADJECTIVE.en[5]],
  pl: [J.ADJECTIVE.pl[0], J.ADJECTIVE.pl[1], J.ADJECTIVE.pl[2], J.ADJECTIVE.pl[3], J.ADJECTIVE.pl[4], J.ADJECTIVE.pl[5]],
};
/** The adjective with a space after it for a foreign pack, nothing for the child's own language. */
const of = (p: PackView, form: 0 | 1 | 2 | 3 | 4 | 5) => (p.native ? '' : `${ADJECTIVE[p.lang][form]} `);
const foreign = (p: PackView, form: 0 | 1 | 2 | 3 | 4) => ADJECTIVE[p.lang][form];
const whole = (p: PackView) => (p.syllables ? J.whole[1] : J.whole[2]);

export const uk: LanguageTexts = {
  title: J.title,
  packName: (lang) => (J.packName)[lang],
  card: () => undefined,
  stage: (at, p) => {
    switch (at) {
      case 'abcPlain':
        return J.stage[1];
      case 'abcLong':
        return J.stage[2];
      case 'abcSpot':
        return J.stage[3];
      case 'abcWhole':
        return fill(J.stage[4], { p: of(p, 5) });
      case 'parts':
        if (p.native) return J.stage[5];
        return p.syllables
          ? fill(J.stage[6], { p: foreign(p, 0) })
          : fill(J.stage[7], { p: foreign(p, 0) });
      case 'spell':
        return p.native ? J.stage[8] : J.stage[9];
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
  swapAsk: (p) => fill(J.swapAsk, { p: of(p, 0) }),
  swapHint: (p, order) => (p.native ? fill(J.swapHint[1], { order }) : fill(J.swapHint[2], { p: foreign(p, 1) })),
  after: (prev, letter) => fill(J.after, { prev, letter }),
  before: (next, letter) => fill(J.before, { next, letter }),
  fillAsk: (p, how) =>
    how === 'all'
      ? fill(J.fillAsk[1], { p: of(p, 1) })
      : how === 'one'
        ? fill(J.fillAsk[2], { p: of(p, 1) })
        : fill(J.fillAsk[3], { p: of(p, 0) }),
  fillHint: (p, neighbour) =>
    p.native ? fill(J.fillHint[1], { neighbour }) : fill(J.fillHint[2], { p: foreign(p, 1) }),

  runAsk: (p, from, to) => (p.native ? fill(J.runAsk[1], { from, to }) : fill(J.runAsk[2], { p: foreign(p, 0) })),
  runHint: (p, letters) => (p.native ? fill(J.runHint[1], { letters: letters.join(', ') }) : fill(J.runHint[2], { p: foreign(p, 1) })),
  partsAsk: (p, word) => (p.native ? fill(J.partsAsk[1], { word }) : fill(J.partsAsk[2], { p: foreign(p, 2), p2: whole(p) })),
  partsHint: (p, word, parts) =>
    p.native ? fill(J.partsHint[1], { word, parts: parts.join(' — ') }) : fill(J.partsHint[2], { p: p.syllables ? J.partsHint[3] : J.partsHint[4] }),
  spellAsk: (p, word, byEar) => {
    if (p.native) return byEar ? J.spellAsk[1] : fill(J.spellAsk[2], { word });
    return byEar ? fill(J.spellAsk[3], { p: foreign(p, 2) }) : fill(J.spellAsk[4], { p: foreign(p, 2) });
  },
  spellHint: (p, word, letters, byEar) => {
    if (p.native) return fill(J.spellHint[1], { word, letters: letters.join(', ') });
    return byEar
      ? J.spellHint[2]
      : J.spellHint[3];
  },

  firstAsk: (p) => (p.native ? J.firstAsk[1] : fill(J.firstAsk[2], { p: foreign(p, 2) })),
  firstHint: (p, word, letter) =>
    p.native ? fill(J.firstHint[1], { word, letter }) : J.firstHint[2],
  sameAsk: (p) => fill(J.sameAsk, { p: of(p, 0) }),
  sameHint: (p, a, b, letter) => (p.native ? fill(J.sameHint[1], { a, b, letter }) : J.sameHint[2]),
  halfAsk: (p) => fill(J.halfAsk, { p: of(p, 3) }),
  halfHint: (p, head, tail) =>
    p.native ? fill(J.halfHint[1], { head, tail }) : J.halfHint[2],
  assocAsk: (p) => fill(J.assocAsk, { p: of(p, 0) }),
  assocHint: (p, a, b) => (p.native ? fill(J.assocHint[1], { a, b }) : J.assocHint[2]),

  rhymeAsk: (p) => fill(J.rhymeAsk, { p: of(p, 4) }),
  rhymeHint: (p, a, b) =>
    p.native ? fill(J.rhymeHint[1], { a, b }) : J.rhymeHint[2],
  rhymeYes: (a, b) => fill(J.rhymeYes, { a, b }),

  sentenceAsk: (p) => fill(J.sentenceAsk, { p: of(p, 0) }),
  sentenceHint: (p, first) =>
    p.native ? fill(J.sentenceHint[1], { first }) : J.sentenceHint[2],
  ends: [J.ends[0], J.ends[1]],
};
