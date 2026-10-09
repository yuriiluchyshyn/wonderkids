import type { LangCode } from '@/core/language';
import type { GameKind } from '@/games/language/tasks';
import type { LanguageTexts, PackView } from '@/games/language/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/pl/games/language.json';

/** The Language galaxy in Polish. */

/** «angielskie litery», «angielską literę», «angielskiego słowa», «angielskich słów», «angielski alfabet», «w angielskim alfabecie», «po angielsku» */
type Forms = { name: string; some: string; one: string; ofOne: string; ofMany: string; abc: string; inAbc: string; way: string };
const FORMS: Record<LangCode, Forms> = J.FORMS;
/** The adjective with a space after it for a foreign pack, nothing for the child's own language. */
const of = (p: PackView, form: keyof Forms) => (p.native ? '' : `${FORMS[p.lang][form]} `);
const f = (p: PackView) => FORMS[p.lang];

const OWN: Record<GameKind, { blurb: string; intro: string }> = J.OWN;

const other = (w: Forms): Record<GameKind, { blurb: string; intro: string }> => ({
  alphabet: {
    blurb: fill(J.other.alphabet.blurb, { name: w.name }),
    intro: fill(J.other.alphabet.intro, { ofOne: w.ofOne }),
  },
  bubbles: {
    blurb: fill(J.other.bubbles.blurb, { name: w.name }),
    intro: fill(J.other.bubbles.intro, { ofOne: w.ofOne, some: w.some, inAbc: w.inAbc }),
  },
  chain: {
    blurb: fill(J.other.chain.blurb, { name: w.name }),
    intro: fill(J.other.chain.intro, { ofMany: w.ofMany }),
  },
  rhymes: {
    blurb: fill(J.other.rhymes.blurb, { name: w.name }),
    intro: fill(J.other.rhymes.intro, { inAbc: w.inAbc }),
  },
  sentences: {
    blurb: fill(J.other.sentences.blurb, { name: w.name }),
    intro: fill(J.other.sentences.intro, { way: w.way }),
  },
});

export const pl: LanguageTexts = {
  title: J.title,
  packName: (lang) => (J.packName)[lang],
  card: (p, kind) => (p.native ? OWN[kind] : other(f(p))[kind]),
  stage: (at, p) => {
    switch (at) {
      case 'abcPlain':
        return J.stage[1];
      case 'abcLong':
        return J.stage[2];
      case 'abcSpot':
        return J.stage[3];
      case 'abcWhole':
        return fill(J.stage[4], { p: of(p, 'abc') });
      case 'parts':
        return p.syllables
          ? p.native
            ? J.stage[5]
            : fill(J.stage[6], { some: f(p).some })
          : fill(J.stage[7], { p: of(p, 'some') });
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
  swapAsk: (p) => fill(J.swapAsk, { p: of(p, 'some') }),
  swapHint: (p, order) => (p.native ? fill(J.swapHint[1], { order }) : fill(J.swapHint[2], { abc: f(p).abc })),
  after: (prev, letter) => fill(J.after, { prev, letter }),
  before: (next, letter) => fill(J.before, { next, letter }),
  fillAsk: (p, how) =>
    how === 'all'
      ? fill(J.fillAsk[1], { p: of(p, 'abc') })
      : how === 'one'
        ? fill(J.fillAsk[2], { p: of(p, 'one') })
        : fill(J.fillAsk[3], { p: of(p, 'some') }),
  fillHint: (p, neighbour) =>
    p.native ? fill(J.fillHint[1], { neighbour }) : fill(J.fillHint[2], { abc: f(p).abc }),

  runAsk: (p, from, to) => (p.native ? fill(J.runAsk[1], { from, to }) : fill(J.runAsk[2], { some: f(p).some })),
  runHint: (p, letters) => (p.native ? fill(J.runHint[1], { letters: letters.join(', ') }) : fill(J.runHint[2], { abc: f(p).abc })),
  partsAsk: (p, word) =>
    p.native ? fill(J.partsAsk[1], { p: p.syllables ? J.partsAsk[2] : J.partsAsk[3], word }) : fill(J.partsAsk[4], { some: f(p).some, p: p.syllables ? J.partsAsk[5] : J.partsAsk[6] }),
  partsHint: (p, word, parts) =>
    p.native ? fill(J.partsHint[1], { word, parts: parts.join(' — ') }) : fill(J.partsHint[2], { p: p.syllables ? J.partsHint[3] : J.partsHint[4] }),
  spellAsk: (p, word, byEar) => {
    if (p.native) return byEar ? J.spellAsk[1] : fill(J.spellAsk[2], { word });
    return byEar ? fill(J.spellAsk[3], { ofOne: f(p).ofOne }) : fill(J.spellAsk[4], { some: f(p).some });
  },
  spellHint: (p, word, letters, byEar) => {
    if (p.native) return fill(J.spellHint[1], { word, letters: letters.join(', ') });
    return byEar
      ? J.spellHint[2]
      : J.spellHint[3];
  },

  firstAsk: (p) => (p.native ? J.firstAsk[1] : fill(J.firstAsk[2], { some: f(p).some })),
  firstHint: (p, word, letter) =>
    p.native ? fill(J.firstHint[1], { word, letter }) : J.firstHint[2],
  sameAsk: (p) => fill(J.sameAsk, { p: of(p, 'some') }),
  sameHint: (p, a, b, letter) => (p.native ? fill(J.sameHint[1], { a, b, letter }) : J.sameHint[2]),
  halfAsk: (p) => fill(J.halfAsk, { p: of(p, 'ofOne') }),
  halfHint: (p, head, tail) =>
    p.native ? fill(J.halfHint[1], { head, tail }) : J.halfHint[2],
  assocAsk: (p) => fill(J.assocAsk, { p: of(p, 'some') }),
  assocHint: (p, a, b) => (p.native ? fill(J.assocHint[1], { a, b }) : J.assocHint[2]),

  rhymeAsk: (p) => fill(J.rhymeAsk, { p: of(p, 'ofMany') }),
  rhymeHint: (p, a, b) =>
    p.native ? fill(J.rhymeHint[1], { a, b }) : J.rhymeHint[2],
  rhymeYes: (a, b) => fill(J.rhymeYes, { a, b }),

  sentenceAsk: (p) => fill(J.sentenceAsk, { p: of(p, 'some') }),
  sentenceHint: (p, first) =>
    p.native ? fill(J.sentenceHint[1], { first }) : J.sentenceHint[2],
  ends: [J.ends[0], J.ends[1]],
};
