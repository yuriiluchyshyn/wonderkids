import { Mechanics } from '@/core/game/kernel/mechanics';
import type { ModuleTexts } from '@/core/game/kernel/types';
import { DEFAULT_LANG, type LangCode } from '@/core/language';
import { I18N_RELEASE, V6_RELEASE, type GameCard, type SubjectDef } from '../shared/templateModule';
import { EN } from './content/en';
import { PL } from './content/pl';
import { UK } from './content/uk';
import { languageTexts } from './grammar';
import type { PackView, Stage } from './grammar/types';
import { GAME_KINDS, LANGUAGE_STEPS, STAGE, type GameKind, type LangPack } from './tasks';
import { WORD_SEARCH, WORD_SEARCH_STAGE, WORD_SEARCH_STEPS } from './wordSearch';
import TEXTS from '@/locales/app/uk/games/language.json';

const J = TEXTS.config;
/** «Пошук слів»: its name in each pack's own language. */
const J_WS = TEXTS.wordSearch;

export const PACKS: LangPack[] = [UK, EN, PL];

const view = (pack: LangPack, lang: LangCode = DEFAULT_LANG): PackView => ({ lang: pack.lang, native: pack.lang === lang, syllables: pack.syllables, byEar: pack.byEar });

/** The cards of every pack in a language of the screen; a card's name stays in the pack's own language. */
const textsIn = (lang: LangCode): ModuleTexts => {
  const T = languageTexts(lang);
  return {
    title: T.title,
    games: Object.fromEntries(
      PACKS.flatMap((pack) => [
        ...GAME_KINDS.map((kind) => [`${pack.prefix}${kind}`, { blurb: pack.cards[kind].blurb, ...T.card(view(pack, lang), kind), label: pack.cards[kind].label }]),
        [`${pack.prefix}${WORD_SEARCH}`, { ...T.wordSearch.card(view(pack, lang)), label: J_WS.label[pack.lang] }],
      ]),
    ),
    groups: Object.fromEntries(PACKS.map((pack) => [pack.lang, T.packName(pack.lang)])),
  };
};

/** The subject as the hub shows it. */
export const SUBJECT: SubjectDef = {
  id: 'language',
  texts: { en: textsIn('en'), pl: textsIn('pl') },
  title: J.SUBJECT.title,
  icon: '🔤',
  accent: '#f59e0b',
};

const COMMON: Record<GameKind, Pick<GameCard, 'mechanics' | 'tasksPerLevel'>> = {
  // A table with many letters to place is a long task: five to a level.
  alphabet: { mechanics: Mechanics.LetterGrid, tasksPerLevel: 5 },
  // Every other one is several moves a task too (a word to spell, three pairs
  // to join, a sentence to build), so ten made a level drag: five, in both languages.
  bubbles: { mechanics: Mechanics.BubblePop, tasksPerLevel: 5 },
  chain: { mechanics: Mechanics.DragMatch, tasksPerLevel: 5 },
  rhymes: { mechanics: Mechanics.DragMatch, tasksPerLevel: 5 },
  sentences: { mechanics: Mechanics.ChronoSequence, tasksPerLevel: 5 },
};

/** The steps of a path where a new kind of task begins, and what is said there. */
const STAGES: Record<GameKind, Stage[]> = {
  alphabet: ['abcPlain', 'abcLong', 'abcSpot', 'abcWhole'],
  bubbles: ['parts', 'spell', 'strays'],
  chain: ['sameLetter', 'halves', 'assoc'],
  rhymes: [],
  sentences: ['three', 'long'],
};

function cardsOf(pack: LangPack): GameCard[] {
  return GAME_KINDS.map((kind) => ({
    id: `${pack.prefix}${kind}`,
    // The words about a pack are there in every language of the screen (`grammar/`).
    langs: languageTexts.langs,
    gameId: `language_${pack.lang}_${kind}`,
    ...pack.cards[kind],
    ...COMMON[kind],
    introFor: (step: number, lang?: LangCode) => {
      const at = STAGES[kind].find((stage) => STAGE[stage] === step);
      return at && languageTexts(lang).stage(at, view(pack, lang));
    },
    steps: LANGUAGE_STEPS,
    group: { id: pack.lang, icon: pack.flag, label: pack.name },
    publishDate: pack.lang === 'pl' ? I18N_RELEASE : V6_RELEASE,
    hasText: true,
  }));
}

/** «Пошук слів» came out after the other language games. */
const WORD_SEARCH_RELEASE = '2026-10-12T00:00:00Z';

/** «Пошук слів» of a pack: its card, in the pack's own name and in Ukrainian words about it. */
function wordSearchCard(pack: LangPack): GameCard {
  const card = languageTexts('uk').wordSearch.card(view(pack));
  return {
    id: `${pack.prefix}${WORD_SEARCH}`,
    langs: languageTexts.langs,
    gameId: `language_${pack.lang}_${WORD_SEARCH}`,
    label: J_WS.label[pack.lang],
    icon: '🔎',
    blurb: card.blurb,
    intro: card.intro,
    difficulty: [1, 3],
    mechanics: Mechanics.WordSearch,
    // A table holds several words to find: five tables a level.
    tasksPerLevel: 5,
    introFor: (step: number, lang?: LangCode) => {
      const at = (Object.keys(WORD_SEARCH_STAGE) as (keyof typeof WORD_SEARCH_STAGE)[]).find((stage) => WORD_SEARCH_STAGE[stage] === step);
      return at && languageTexts(lang).wordSearch.stage(at);
    },
    steps: WORD_SEARCH_STEPS,
    group: { id: pack.lang, icon: pack.flag, label: pack.name },
    publishDate: WORD_SEARCH_RELEASE,
    hasText: true,
  };
}

export const GAMES: GameCard[] = PACKS.flatMap((pack) => [...cardsOf(pack), wordSearchCard(pack)]);
