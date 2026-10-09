import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import type { Card, DragMatchPayload, LetterGridPayload, SpeechLang, TemplatePayload } from '@/core/game/templates/types';
import { DEFAULT_LANG, language } from '@/core/lang';
import { say } from '@/core/lang/marks';
import { shuffle } from '@/core/utils/random';
import { templateTask, type GameTasks, type TemplateGame } from '../shared/templateModule';
import { languageTexts } from './lang';
import type { PackView } from './lang/types';

type Tasks = TaskInstance<TemplatePayload>[];
type Config = Pick<TaskConfig, 'lang'>;

/** A word with its picture. */
export type Word = [word: string, emoji: string];
/** A sentence as it is written («Кіт спить.») and a picture of who it is about. */
export type Sentence = [text: string, emoji: string];

export interface Assoc {
  a: string;
  ea: string;
  b: string;
  eb: string;
  /** Pairs of one group could be mixed up, so they never share a task. */
  group: string;
}

/**
 * The content of the language games in one language (Tech Spec v6 §2.1).
 * The mechanics are identical for every language — only this pack differs.
 */
export interface LangPack {
  lang: SpeechLang;
  /** How the hub's language filter names the pack («Українська мова») and its flag. */
  name: string;
  flag: string;
  /** Prefix of game ids: '' for the native language, 'en_' for English. */
  prefix: string;
  /** Its first words are put together from syllables; letter by letter otherwise. */
  syllables: boolean;
  /** Its hardest words are spelled by ear: the language is written the way it sounds. */
  byEar: boolean;
  alphabet: string[];
  /** Words built from parts — syllables (Ukrainian) or single letters (English phonics). */
  partWords: { parts: string[]; emoji: string }[];
  /** Short words spelled letter by letter. */
  spellWords: Word[];
  /** Two halves of a word and its picture. */
  halves: [first: string, second: string, emoji: string][];
  assoc: Assoc[];
  /** Rhyme families: every word of a family rhymes with the others. `word` or `word|emoji`. */
  rhymes: string[][];
  sentences: { two: Sentence[]; three: Sentence[]; long: Sentence[] };
  cards: Record<GameKind, Pick<TemplateGame, 'label' | 'icon' | 'blurb' | 'intro' | 'difficulty'>>;
}

/** Path length of every language game. */
export const LANGUAGE_STEPS = 50;
/** The path step on which each stage of a game begins (`config.ts` introduces them there). */
export const STAGE = {
  /** Bubble pop: syllables / phonics, whole words, words with stray letters. */
  parts: 11,
  spell: 26,
  strays: 38,
  /** Word chain: words on one letter, halves of a word, words linked by meaning. */
  sameLetter: 9,
  halves: 16,
  assoc: 31,
  /** Sentence builder: three words, four and five words. */
  three: 11,
  long: 31,
  /** Alphabet table: no more pale letters, a longer table, two swapped letters to find, the whole alphabet. */
  abcPlain: 4,
  abcLong: 13,
  abcSpot: 21,
  abcWhole: 31,
} as const;

/** The games of a language, in catalog order. */
/** Each pack lays its alphabet tables out in its own (fixed) way. */
const ABC_SEED = { uk: 1, en: 2, pl: 3 } as const;

export const GAME_KINDS = ['alphabet', 'bubbles', 'chain', 'rhymes', 'sentences'] as const;
export type GameKind = (typeof GAME_KINDS)[number];
/** New questions a step opens, where the content allows (the other half of a level is recall). */
const PER_STEP = 25;

interface Tier<T> {
  from: number;
  to: number;
  items: readonly T[];
}

/** What a tier has opened by `step`: its items arrive evenly over its steps, five a step when the content allows. */
function opened<T>(tier: Tier<T>, step: number): T[] {
  if (step < tier.from) return [];
  const steps = tier.to - tier.from + 1;
  const items = tier.items.slice(0, steps * PER_STEP);
  const at = Math.min(step, tier.to) - tier.from + 1;
  return items.slice(0, Math.ceil((items.length * at) / steps));
}

/** `lead` plus up to `count - 1` random others that differ from it — and from each other — by `keyOf`. */
function withOthers<T>(lead: T, pool: readonly T[], count: number, keyOf: (item: T) => string): T[] {
  const seen = new Set([keyOf(lead)]);
  const out = [lead];
  for (const candidate of shuffle(pool)) {
    if (out.length >= count) break;
    const key = keyOf(candidate);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(candidate);
  }
  return out;
}

/** A shuffled order that is guaranteed not to be already solved. */
function scramble(ids: string[]): string[] {
  for (let i = 0; i < 12; i += 1) {
    const order = shuffle(ids);
    if (order.some((id, at) => id !== ids[at])) return order;
  }
  return [...ids].reverse();
}

/** `pairs[0]` is the pair the `hint` speaks of — the board lights that very pair. */
function match(pairs: { item: Card; slot: Card }[], hint: string): DragMatchPayload {
  return {
    template: Mechanics.DragMatch,
    lead: pairs[0].item.id,
    items: shuffle(pairs.map((p) => p.item)),
    slots: shuffle(pairs.map((p) => p.slot)),
    pairs: Object.fromEntries(pairs.map((p) => [p.item.id, p.slot.id])),
    hint,
  };
}

/** Every run of two to six neighbouring letters — short runs first, each length spread over the whole alphabet. */
function alphabetRuns(alphabet: string[]): string[][] {
  return [2, 3, 4, 5, 6].flatMap((length) => {
    const starts = Array.from({ length: alphabet.length - length + 1 }, (_, i) => i);
    // A stride that shares no factor with the count visits every start once, far apart.
    const stride = [7, 5, 3, 2, 1].find((k) => starts.length % k !== 0) ?? 1;
    return starts.map((_, i) => alphabet.slice((i * stride) % starts.length, ((i * stride) % starts.length) + length));
  });
}

/**
 * A small seeded generator. The alphabet tables of a step are made up, not
 * listed — and a step must make up the same ones every time it is asked, or a
 * level could not tell this step's new tables from the recalled ones.
 */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One alphabet table: a run of `length` letters from `start`, with empty places or two letters swapped. */
interface AbcTable {
  key: string;
  start: number;
  length: number;
  cols: number;
  gaps: number[];
  ghosts: boolean;
  swapped?: [number, number];
}

/**
 * The alphabet tables each path step opens (index 0 = step 1), harder step by
 * step: ten letters with one or two places empty and a pale copy of the letter
 * in each → no pale letters, more places → eighteen letters → two letters
 * swapped (far apart first, then neighbours, which is harder to see) → the
 * whole alphabet, with more and more of it empty, until all of it is.
 */
function alphabetTables(size: number, seed: number): AbcTable[][] {
  const seen = new Set<string>();
  const between = (rand: () => number, min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
  /** From `from` up to `to` over the steps `first`…`last`. */
  const grow = (step: number, first: number, last: number, from: number, to: number) => Math.round(from + ((to - from) * (step - first)) / Math.max(1, last - first));

  return Array.from({ length: LANGUAGE_STEPS }, (_, at) => {
    const step = at + 1;
    const rand = seeded(seed * 1000 + step);
    const tables: AbcTable[] = [];

    const fill = (length: number, cols: number, count: number, ghosts: boolean): AbcTable => {
      const start = between(rand, 0, size - length);
      const places = Array.from({ length }, (_, i) => i);
      // A seeded shuffle: the first `count` places are the empty ones.
      for (let i = places.length - 1; i > 0; i -= 1) {
        const j = between(rand, 0, i);
        [places[i], places[j]] = [places[j], places[i]];
      }
      const gaps = places.slice(0, Math.max(1, Math.min(length, count))).sort((a, b) => a - b);
      return { key: `abc:${start}:${length}:${gaps.join('.')}`, start, length, cols, gaps, ghosts };
    };
    const spot = (length: number, cols: number, apart: [number, number]): AbcTable => {
      const start = between(rand, 0, size - length);
      const gap = between(rand, apart[0], apart[1]);
      const a = between(rand, 0, length - 1 - gap);
      return { key: `abc:swap:${start}:${length}:${a}.${a + gap}`, start, length, cols, gaps: [], ghosts: false, swapped: [a, a + gap] };
    };

    // Up to `PER_STEP` different tables; a few spare tries, since a made-up one may repeat an earlier one.
    for (let n = 0; tables.length < PER_STEP && n < PER_STEP * 4; n += 1) {
      let table: AbcTable;
      if (step < STAGE.abcPlain) table = fill(10, 5, step === 1 ? 1 : 2, true);
      else if (step < STAGE.abcLong) table = fill(10, 5, grow(step, STAGE.abcPlain, STAGE.abcLong - 1, 2, 5), false);
      else if (step < STAGE.abcSpot) table = fill(18, 6, grow(step, STAGE.abcLong, STAGE.abcSpot - 1, 4, 8) - (n % 2), false);
      else if (step < STAGE.abcWhole) {
        const late = step >= STAGE.abcSpot + 5;
        table = spot(late ? 18 : 12, 6, late ? [1, 2] : [3, 8]);
      } else if (n % 5 === 4) table = spot(size, 6, [1, 2]);
      else table = fill(size, 6, grow(step, STAGE.abcWhole, LANGUAGE_STEPS, 6, size) - (n % 3), false);

      if (seen.has(table.key)) continue;
      seen.add(table.key);
      tables.push(table);
    }
    return tables;
  });
}

/** The task generators of the games of one language, by game id. */
export function languageTasks(pack: LangPack): Record<string, GameTasks> {
  const { lang } = pack;
  const upper = (s: string) => s.toLocaleUpperCase(lang);

  /** A text card read aloud in the pack's language. */
  const word = (id: string, label: string, emoji?: string): Card => ({ id, label, emoji, speak: label, lang });
  // A lone letter is read unpredictably: the voice gets its name in the pack's language («же», «ay», «żet»).
  const letterCard = (id: string, letter: string): Card => ({ id, label: upper(letter), speak: language(lang).letterName(letter), lang });
  /**
   * The words ABOUT the pack are in the language of the screen (`config.lang`);
   * the words OF the pack never change. A pack in the child's own language is
   * talked about from the inside — see `PackView`. `said` is a letter inside
   * such a spoken sentence: «літера „же“».
   */
  const told = (config: Config) => {
    const T = languageTexts(config.lang);
    const p: PackView = { lang, native: lang === (config.lang ?? DEFAULT_LANG), syllables: pack.syllables, byEar: pack.byEar };
    const said = (letter: string) => (p.native ? say(upper(letter), language(lang).letterName(letter)) : upper(letter));
    return { T, p, said };
  };

  // ---------------------------------------------------------------- Game 0 —
  // Alphabet table: put the missing letters in their places; later — find the
  // two letters that swapped places.
  const abcSteps = alphabetTables(pack.alphabet.length, ABC_SEED[lang]);

  function alphabet(step: number, config: Config): Tasks {
    const { T, p, said } = told(config);
    return abcSteps.slice(0, Math.max(1, Math.min(LANGUAGE_STEPS, step))).flatMap((tables) =>
      tables.map(({ key, start, length, cols, gaps, ghosts, swapped }) => {
        const letters = pack.alphabet.slice(start, start + length);
        const payload: LetterGridPayload = {
          template: Mechanics.LetterGrid,
          cols,
          cells: letters.map((l, i) => letterCard(`c${start + i}`, l)),
          gaps,
          ghosts,
          swapped,
        };

        if (swapped) {
          const [a, b] = swapped;
          const order = T.order(said(letters[a]), said(letters[b]));
          return templateTask(key, T.swapAsk(p), { ...payload, hint: T.swapHint(p, order) }, step, p.native ? order : undefined);
        }

        // What the hint and the fact say about the first empty place: the letter and its neighbour.
        const at = gaps[0];
        const neighbour = at > 0 ? T.after(said(letters[at - 1]), said(letters[at])) : T.before(said(letters[1]), said(letters[0]));
        const prompt = T.fillAsk(p, gaps.length === pack.alphabet.length ? 'all' : gaps.length === 1 ? 'one' : 'many');
        return templateTask(key, prompt, { ...payload, hint: T.fillHint(p, neighbour) }, step, p.native ? neighbour : undefined);
      }),
    );
  }

  // ---------------------------------------------------------------- Game 1 —
  // Bubble pop: 1–10 the alphabet, 11–25 syllables / phonics, 26–50 words.
  const abcTier: Tier<string[]> = { from: 1, to: STAGE.parts - 1, items: alphabetRuns(pack.alphabet) };
  const partTier: Tier<LangPack['partWords'][number]> = { from: STAGE.parts, to: STAGE.spell - 1, items: pack.partWords };
  // The words to spell are shared out between the two halves of the stage in
  // proportion to their length in steps — shorter words first, each asked once.
  // From `STAGE.strays` on, stray letters float about and the Ukrainian word is
  // no longer written out.
  const shownSteps = STAGE.strays - STAGE.spell;
  const shownCount = Math.min(shownSteps * PER_STEP, Math.ceil((pack.spellWords.length * shownSteps) / (LANGUAGE_STEPS - STAGE.spell + 1)));
  const spellTier: Tier<Word> = { from: STAGE.spell, to: STAGE.strays - 1, items: pack.spellWords.slice(0, shownCount) };
  const strayTier: Tier<Word> = { from: STAGE.strays, to: LANGUAGE_STEPS, items: pack.spellWords.slice(shownCount) };

  function bubbles(step: number, config: Config): Tasks {
    const { T, p, said } = told(config);
    const tasks: Tasks = [];

    for (const run of opened(abcTier, step)) {
      tasks.push(
        templateTask(
          `abc:${run.join('')}`,
          T.runAsk(p, said(run[0]), said(run[run.length - 1])),
          {
            template: Mechanics.BubblePop,
            bubbles: run.map((l, i) => letterCard(`b${i}`, l)),
            hint: T.runHint(p, run.map(said)),
          },
          step,
        ),
      );
    }

    for (const { parts, emoji } of opened(partTier, step)) {
      const whole = parts.join('');
      tasks.push(
        templateTask(
          `parts:${whole}`,
          T.partsAsk(p, whole),
          {
            template: Mechanics.BubblePop,
            target: { id: 'target', emoji, label: upper(whole), speak: whole, lang },
            bubbles: parts.map((part, i) => ({ id: `b${i}`, label: upper(part), speak: part, lang })),
            hint: T.partsHint(p, whole, parts),
          },
          step,
        ),
      );
    }

    const spell = ([whole, emoji]: Word, hard: boolean) => {
      const letters = [...whole];
      // Ukrainian only: an English learner always needs to see the word.
      const byEar = pack.byEar && hard;
      const strays = hard ? shuffle(pack.alphabet.filter((l) => !letters.includes(l))).slice(0, 2) : [];
      return templateTask(
        `spell:${whole}`,
        T.spellAsk(p, whole, byEar),
        {
          template: Mechanics.BubblePop,
          target: { id: 'target', emoji, label: byEar ? undefined : upper(whole), speak: whole, lang },
          bubbles: letters.map((l, i) => letterCard(`b${i}`, l)),
          extras: strays.map((l, i) => letterCard(`x${i}`, l)),
          hint: T.spellHint(p, whole, letters.map(said), byEar),
        },
        step,
      );
    };
    for (const w of opened(spellTier, step)) tasks.push(spell(w, false));
    for (const w of opened(strayTier, step)) tasks.push(spell(w, true));

    return tasks;
  }

  // ---------------------------------------------------------------- Game 2 —
  // No fact after a task: there is nothing to tell about joining three pairs.
  // Word chain: 1–8 word → its first letter, 9–15 word → a word on the same
  // letter, 16–30 two halves of a word, 31–50 words linked by meaning.
  const pictures: Word[] = [...pack.spellWords, ...pack.partWords.map((w): Word => [w.parts.join(''), w.emoji])];
  const first = (w: Word) => upper([...w[0]][0]);
  const firstTier: Tier<Word> = { from: 1, to: STAGE.sameLetter - 1, items: pictures };

  /** Pairs of words on one letter, ordered so neighbours start differently. */
  const sameLetter: [Word, Word][] = (() => {
    const byLetter = new Map<string, Word[]>();
    for (const w of pictures) byLetter.set(first(w), [...(byLetter.get(first(w)) ?? []), w]);
    const groups = [...byLetter.values()].filter((g) => g.length >= 2);
    const pairs: [Word, Word][] = [];
    for (let round = 0; pairs.length < 7 * PER_STEP && groups.some((g) => g.length >= round * 2 + 2); round += 1) {
      for (const g of groups) if (g.length >= round * 2 + 2) pairs.push([g[round * 2], g[round * 2 + 1]]);
    }
    return pairs;
  })();
  const sameTier: Tier<[Word, Word]> = { from: STAGE.sameLetter, to: STAGE.halves - 1, items: sameLetter };
  const halfTier: Tier<LangPack['halves'][number]> = { from: STAGE.halves, to: STAGE.assoc - 1, items: pack.halves };
  const assocTier: Tier<Assoc> = { from: STAGE.assoc, to: LANGUAGE_STEPS, items: pack.assoc };

  function chain(step: number, config: Config): Tasks {
    const { T, p } = told(config);
    const tasks: Tasks = [];

    const firsts = opened(firstTier, step);
    for (const lead of firsts) {
      const set = withOthers(lead, firsts, 3, first);
      tasks.push(
        templateTask(
          `first:${lead[0]}`,
          T.firstAsk(p),
          match(
            set.map((w) => ({ item: word(`w:${w[0]}`, w[0], w[1]), slot: letterCard(`l:${first(w)}`, first(w)) })),
            T.firstHint(p, lead[0], first(lead)),
          ),
          step,
        ),
      );
    }

    const sames = opened(sameTier, step);
    for (const lead of sames) {
      const set = withOthers(lead, sames, 3, (p) => first(p[0]));
      tasks.push(
        templateTask(
          `same:${lead[0][0]}|${lead[1][0]}`,
          T.sameAsk(p),
          match(
            set.map(([a, b]) => ({ item: word(`a:${a[0]}`, a[0], a[1]), slot: word(`b:${b[0]}`, b[0], b[1]) })),
            T.sameHint(p, lead[0][0], lead[1][0], first(lead[0])),
          ),
          step,
        ),
      );
    }

    const halves = opened(halfTier, step);
    for (const lead of halves) {
      const set = withOthers(lead, halves, 3, (h) => h[0]);
      tasks.push(
        templateTask(
          `half:${lead[0]}${lead[1]}`,
          T.halfAsk(p),
          match(
            set.map(([head, tail, emoji]) => ({
              item: { id: `h:${head}${tail}`, label: `${upper(head)}…`, speak: head, lang },
              // The picture says which word the ending belongs to.
              slot: { id: `t:${head}${tail}`, emoji, label: `…${upper(tail)}`, speak: head + tail, lang },
            })),
            T.halfHint(p, lead[0], lead[1]),
          ),
          step,
        ),
      );
    }

    const assocs = opened(assocTier, step);
    for (const lead of assocs) {
      const set = withOthers(lead, assocs, 3, (a) => a.group);
      tasks.push(
        templateTask(
          `assoc:${lead.a}|${lead.b}`,
          T.assocAsk(p),
          match(
            set.map((a) => ({ item: word(`a:${a.a}`, a.a, a.ea), slot: word(`b:${a.b}`, a.b, a.eb) })),
            T.assocHint(p, lead.a, lead.b),
          ),
          step,
        ),
      );
    }

    return tasks;
  }

  // ---------------------------------------------------------------- Game 3 —
  // Rhyme matcher. Families come in blocks of five; inside a block every step
  // asks one new pair from each family, so the other pairs on the board always
  // belong to different families (and so never rhyme with the lead pair).
  interface Rhyme {
    a: Word;
    b: Word;
    family: number;
  }
  const rhymeLeads: Rhyme[] = (() => {
    // Every pair a family can make, nearest neighbours first: a family of six gives fifteen.
    const PAIRS: [number, number][] = [];
    for (let gap = 1; gap < 8; gap += 1) for (let i = 0; i + gap < 8; i += 1) PAIRS.push([i, i + gap]);
    const parse = (entry: string): Word => {
      const [text, emoji] = entry.split('|');
      return [text, emoji ?? ''];
    };
    const leads: Rhyme[] = [];
    for (let block = 0; block < pack.rhymes.length; block += PER_STEP) {
      for (const [i, j] of PAIRS) {
        pack.rhymes.slice(block, block + PER_STEP).forEach((family, offset) => {
          if (family[i] && family[j]) leads.push({ a: parse(family[i]), b: parse(family[j]), family: block + offset });
        });
      }
    }
    return leads;
  })();
  const rhymeTier: Tier<Rhyme> = { from: 1, to: LANGUAGE_STEPS, items: rhymeLeads };

  function rhymes(step: number, config: Config): Tasks {
    const { T, p } = told(config);
    const known = opened(rhymeTier, step);
    return known.map((lead) => {
      const set = withOthers(lead, known, 3, (r) => String(r.family));
      return templateTask(
        `rhyme:${lead.a[0]}|${lead.b[0]}`,
        T.rhymeAsk(p),
        match(
          set.map((r) => ({ item: word(`a:${r.a[0]}`, r.a[0], r.a[1] || undefined), slot: word(`b:${r.b[0]}`, r.b[0], r.b[1] || undefined) })),
          T.rhymeHint(p, lead.a[0], lead.b[0]),
        ),
        step,
        p.native ? T.rhymeYes(lead.a[0], lead.b[0]) : undefined,
      );
    });
  }

  // ---------------------------------------------------------------- Game 4 —
  // Sentence builder: 1–10 two words, 11–30 three, 31–50 four or five.
  const sentenceTiers: Tier<Sentence>[] = [
    { from: 1, to: STAGE.three - 1, items: pack.sentences.two },
    { from: STAGE.three, to: STAGE.long - 1, items: pack.sentences.three },
    { from: STAGE.long, to: LANGUAGE_STEPS, items: pack.sentences.long },
  ];

  function sentences(step: number, config: Config): Tasks {
    const { T, p } = told(config);
    return sentenceTiers.flatMap((tier) =>
      opened(tier, step).map(([text, emoji]) => {
        const words = text.split(' ');
        const cards = words.map((w, i) => word(`w${i}`, w));
        return templateTask(
          `sentence:${text}`,
          T.sentenceAsk(p),
          {
            template: Mechanics.ChronoSequence,
            stimulus: { emoji },
            cards,
            initial: scramble(cards.map((c) => c.id)),
            orientation: 'horizontal',
            ends: T.ends,
            hint: T.sentenceHint(p, words[0]),
          },
          step,
          p.native ? text : undefined,
        );
      }),
    );
  }

  return {
    [`${pack.prefix}alphabet`]: { pool: alphabet },
    [`${pack.prefix}bubbles`]: { pool: bubbles },
    [`${pack.prefix}chain`]: { pool: chain },
    [`${pack.prefix}rhymes`]: { pool: rhymes },
    [`${pack.prefix}sentences`]: { pool: sentences },
  };
}
