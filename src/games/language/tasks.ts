import type { TaskInstance } from '@/core/game/kernel/types';
import type { Card, DragMatchPayload, SpeechLang, TemplatePayload } from '@/core/game/templates/types';
import { shuffle } from '@/core/utils/random';
import { factPool } from '../shared/facts';
import { templateTask, type GameTasks, type TemplateGame } from '../shared/templateModule';

type Tasks = TaskInstance<TemplatePayload>[];

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
 * The content of the four language games in one language (Tech Spec v6 §2.1).
 * The mechanics are identical for every language — only this pack differs.
 */
export interface LangPack {
  lang: SpeechLang;
  /** Prefix of game ids: '' for the native language, 'en_' for English. */
  prefix: string;
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
  cards: Record<GameKind, Pick<TemplateGame, 'label' | 'icon' | 'blurb' | 'intro' | 'landmark' | 'difficulty'>>;
  facts: Record<'general' | GameKind, string[]>;
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
} as const;

/** The four games of a language, in catalog order. */
export const GAME_KINDS = ['bubbles', 'chain', 'rhymes', 'sentences'] as const;
export type GameKind = (typeof GAME_KINDS)[number];
/** New questions a step opens (the other half of a level is recall). */
const PER_STEP = 5;

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

function match(pairs: { item: Card; slot: Card }[], hint: string): DragMatchPayload {
  return {
    template: 'UI_DRAG_MATCH',
    items: shuffle(pairs.map((p) => p.item)),
    slots: shuffle(pairs.map((p) => p.slot)),
    pairs: Object.fromEntries(pairs.map((p) => [p.item.id, p.slot.id])),
    hint,
  };
}

/** Runs of neighbouring letters: twenty of three, fifteen of four, fifteen of five, spread over the alphabet. */
function alphabetRuns(alphabet: string[]): string[][] {
  const spread = (length: number, count: number) =>
    Array.from({ length: count }, (_, i) => {
      const start = Math.round((i * (alphabet.length - length)) / (count - 1));
      return alphabet.slice(start, start + length);
    });
  return [...spread(3, 20), ...spread(4, 15), ...spread(5, 15)];
}

/** The task generators of the four games of one language, by game id. */
export function languageTasks(pack: LangPack): Record<string, GameTasks> {
  const { lang } = pack;
  const uk = lang === 'uk';
  const upper = (s: string) => s.toLocaleUpperCase(lang);
  const outro = (game: keyof LangPack['facts'], own?: string) => factPool(own, pack.facts[game], pack.facts.general);

  /** A text card read aloud in the pack's language. */
  const word = (id: string, label: string, emoji?: string): Card => ({ id, label, emoji, speak: label, lang });
  const letterCard = (id: string, letter: string): Card => ({ id, label: upper(letter), speak: letter, lang });

  // ---------------------------------------------------------------- Game 1 —
  // Bubble pop: 1–10 the alphabet, 11–25 syllables / phonics, 26–50 words.
  const abcTier: Tier<string[]> = { from: 1, to: STAGE.parts - 1, items: alphabetRuns(pack.alphabet) };
  const partTier: Tier<LangPack['partWords'][number]> = { from: STAGE.parts, to: STAGE.spell - 1, items: pack.partWords };
  const spellTier: Tier<Word> = { from: STAGE.spell, to: LANGUAGE_STEPS, items: pack.spellWords };
  // From `STAGE.strays` the Ukrainian word is no longer written out and stray letters float about.

  function bubbles(step: number): Tasks {
    const tasks: Tasks = [];

    for (const run of opened(abcTier, step)) {
      const shown = run.map(upper);
      tasks.push(
        templateTask(
          `abc:${run.join('')}`,
          uk ? `Лопай літери за абеткою: від ${shown[0]} до ${shown[shown.length - 1]}.` : 'Лопай англійські літери за абеткою — від першої до останньої.',
          {
            template: 'UI_BUBBLE_POP',
            bubbles: run.map((l, i) => letterCard(`b${i}`, l)),
            hint: uk ? `Згадай абетку: ${shown.join(', ')}.` : 'Згадай англійську абетку. Потрібна бульбашка блимає.',
          },
          step,
          outro('bubbles', uk ? `В абетці ці літери стоять так: ${shown.join(', ')}.` : undefined),
        ),
      );
    }

    for (const { parts, emoji } of opened(partTier, step)) {
      const whole = parts.join('');
      tasks.push(
        templateTask(
          `parts:${whole}`,
          uk ? `Збери слово зі складів: ${whole}.` : 'Збери англійське слово з літер. Воно написане під малюнком.',
          {
            template: 'UI_BUBBLE_POP',
            target: { id: 'target', emoji, label: upper(whole), speak: whole, lang },
            bubbles: parts.map((part, i) => ({ id: `b${i}`, label: upper(part), speak: part, lang })),
            hint: uk ? `Слово «${whole}» складається так: ${parts.join(' — ')}.` : 'Подивись на слово під малюнком і лопай літери зліва направо.',
          },
          step,
          outro('bubbles', uk ? `У слові «${whole}» ${parts.length} склади: ${parts.join('-')}.` : undefined),
        ),
      );
    }

    for (const [whole, emoji] of opened(spellTier, step)) {
      const letters = [...whole];
      // Ukrainian only: an English learner always needs to see the word.
      const byEar = uk && step >= STAGE.strays;
      const strays = step >= STAGE.strays ? shuffle(pack.alphabet.filter((l) => !letters.includes(l))).slice(0, 2) : [];
      tasks.push(
        templateTask(
          `spell:${whole}`,
          uk ? `Склади слово з літер: ${whole}.` : 'Склади англійське слово з літер. Воно написане під малюнком.',
          {
            template: 'UI_BUBBLE_POP',
            target: { id: 'target', emoji, label: byEar ? undefined : upper(whole), speak: whole, lang },
            bubbles: letters.map((l, i) => letterCard(`b${i}`, l)),
            extras: strays.map((l, i) => letterCard(`x${i}`, l)),
            hint: uk ? `Вимов слово повільно: ${letters.map(upper).join(', ')}.` : 'Подивись на слово під малюнком і лопай літери зліва направо. Зайві літери не лопаються.',
          },
          step,
          outro('bubbles', uk ? `У слові «${whole}» ${letters.length} ${letters.length < 5 ? 'літери' : 'літер'}.` : undefined),
        ),
      );
    }

    return tasks;
  }

  // ---------------------------------------------------------------- Game 2 —
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

  function chain(step: number): Tasks {
    const tasks: Tasks = [];

    const firsts = opened(firstTier, step);
    for (const lead of firsts) {
      const set = withOthers(lead, firsts, 3, first);
      tasks.push(
        templateTask(
          `first:${lead[0]}`,
          uk ? 'З’єднай кожне слово з літерою, на яку воно починається.' : 'З’єднай кожне англійське слово з його першою літерою.',
          match(
            set.map((w) => ({ item: word(`w:${w[0]}`, w[0], w[1]), slot: letterCard(`l:${first(w)}`, first(w)) })),
            uk ? `Вимов слово вголос і послухай перший звук. «${lead[0]}» починається на літеру «${first(lead)}».` : 'Подивись, з якої літери починається кожне слово.',
          ),
          step,
          outro('chain', uk ? `Слово «${lead[0]}» починається на літеру «${first(lead)}».` : undefined),
        ),
      );
    }

    const sames = opened(sameTier, step);
    for (const lead of sames) {
      const set = withOthers(lead, sames, 3, (p) => first(p[0]));
      tasks.push(
        templateTask(
          `same:${lead[0][0]}|${lead[1][0]}`,
          uk ? 'З’єднай слова, які починаються на однакову літеру.' : 'З’єднай англійські слова, які починаються на однакову літеру.',
          match(
            set.map(([a, b]) => ({ item: word(`a:${a[0]}`, a[0], a[1]), slot: word(`b:${b[0]}`, b[0], b[1]) })),
            uk ? `«${lead[0][0]}» і «${lead[1][0]}» починаються на однакову літеру — «${first(lead[0])}».` : 'Порівняй перші літери слів: у пари вони однакові.',
          ),
          step,
          outro('chain', uk ? `«${lead[0][0]}» і «${lead[1][0]}» починаються на літеру «${first(lead[0])}».` : undefined),
        ),
      );
    }

    const halves = opened(halfTier, step);
    for (const lead of halves) {
      const set = withOthers(lead, halves, 3, (h) => h[0]);
      tasks.push(
        templateTask(
          `half:${lead[0]}${lead[1]}`,
          uk ? 'З’єднай початок слова з його закінченням.' : 'З’єднай початок англійського слова з його закінченням.',
          match(
            set.map(([head, tail, emoji]) => ({
              item: { id: `h:${head}${tail}`, label: `${upper(head)}…`, speak: head, lang },
              // The picture says which word the ending belongs to.
              slot: { id: `t:${head}${tail}`, emoji, label: `…${upper(tail)}`, speak: head + tail, lang },
            })),
            uk ? `Подивись на малюнок: це «${lead[0]}${lead[1]}». Слово починається зі складу «${lead[0]}».` : 'Натисни на динамік біля малюнка, послухай слово і знайди його початок.',
          ),
          step,
          outro('chain', uk ? `«${lead[0]}» і «${lead[1]}» — разом це слово «${lead[0]}${lead[1]}».` : undefined),
        ),
      );
    }

    const assocs = opened(assocTier, step);
    for (const lead of assocs) {
      const set = withOthers(lead, assocs, 3, (a) => a.group);
      tasks.push(
        templateTask(
          `assoc:${lead.a}|${lead.b}`,
          uk ? 'З’єднай слова, які пов’язані за змістом.' : 'З’єднай англійські слова, які пов’язані за змістом.',
          match(
            set.map((a) => ({ item: word(`a:${a.a}`, a.a, a.ea), slot: word(`b:${a.b}`, a.b, a.eb) })),
            uk ? `Подумай, що буває разом. «${lead.a}» — «${lead.b}».` : 'Натисни на динамік, щоб почути слово. Шукай те, що буває з ним разом.',
          ),
          step,
          outro('chain', uk ? `«${lead.a}» і «${lead.b}» — ці слова завжди поруч.` : undefined),
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
    const PAIRS = [[0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2]];
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

  function rhymes(step: number): Tasks {
    const known = opened(rhymeTier, step);
    return known.map((lead) => {
      const set = withOthers(lead, known, 3, (r) => String(r.family));
      return templateTask(
        `rhyme:${lead.a[0]}|${lead.b[0]}`,
        uk ? 'Знайди пари слів, які римуються.' : 'Знайди пари англійських слів, які римуються.',
        match(
          set.map((r) => ({ item: word(`a:${r.a[0]}`, r.a[0], r.a[1] || undefined), slot: word(`b:${r.b[0]}`, r.b[0], r.b[1] || undefined) })),
          uk
            ? `Слова римуються, коли закінчуються однаково: «${lead.a[0]}» — «${lead.b[0]}».`
            : 'Натисни на динаміки й послухай: слова, що римуються, звучать наприкінці однаково.',
        ),
        step,
        outro('rhymes', uk ? `«${lead.a[0]}» — «${lead.b[0]}». Це рима!` : undefined),
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

  function sentences(step: number): Tasks {
    return sentenceTiers.flatMap((tier) =>
      opened(tier, step).map(([text, emoji]) => {
        const words = text.split(' ');
        const cards = words.map((w, i) => word(`w${i}`, w));
        return templateTask(
          `sentence:${text}`,
          uk ? 'Постав слова по порядку, щоб вийшло речення.' : 'Постав англійські слова по порядку, щоб вийшло речення.',
          {
            template: 'UI_CHRONO_SEQUENCE',
            stimulus: { emoji },
            cards,
            initial: scramble(cards.map((c) => c.id)),
            orientation: 'horizontal',
            ends: ['початок', 'кінець'],
            hint: uk
              ? `Речення починається зі слова з великої літери: «${words[0]}». Останнє слово — з крапкою.`
              : 'Речення починається зі слова з великої літери, а закінчується словом із крапкою.',
          },
          step,
          outro('sentences', uk ? text : undefined),
        );
      }),
    );
  }

  return {
    [`${pack.prefix}bubbles`]: { pool: bubbles },
    [`${pack.prefix}chain`]: { pool: chain },
    [`${pack.prefix}rhymes`]: { pool: rhymes },
    [`${pack.prefix}sentences`]: { pool: sentences },
  };
}
