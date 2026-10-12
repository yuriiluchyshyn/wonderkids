import type { LangCode } from '@/core/language';
import { fill } from '@/core/language/fill';
import type { PackView, WordSearchStage, WordSearchTexts } from './types';

/** The words of «Пошук слів» as every language's `language.json` keeps them under `wordSearch`. */
interface WordSearchWords {
  own: { blurb: string; intro: string };
  other: { blurb: string; intro: string };
  ask: string;
  askByEar: string;
  hint: { straight: string; any: string };
  stage: Record<WordSearchStage, string>;
}

/**
 * What a language of the screen says about the word search. Its sentences
 * never quote the pack's words — the table and the pictures hold those — so
 * one set serves every pack; a foreign pack is only named on its card.
 */
export function wordSearchTexts(J: WordSearchWords, packName: (lang: LangCode) => string): WordSearchTexts {
  return {
    card: (p: PackView) => (p.native ? J.own : { blurb: fill(J.other.blurb, { name: packName(p.lang) }), intro: fill(J.other.intro, { name: packName(p.lang) }) }),
    ask: (shown) => (shown ? J.ask : J.askByEar),
    hint: (anyWay) => (anyWay ? J.hint.any : J.hint.straight),
    stage: (at) => J.stage[at],
  };
}
