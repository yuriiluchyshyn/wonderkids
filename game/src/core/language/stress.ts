/**
 * Word stress for the natural (cloud) voice.
 *
 * A speech engine guesses where a word is stressed, and in Ukrainian it guesses
 * wrong often enough to be heard («ко́лесо» for «колесо́»). The fix is a
 * dictionary: every word the app says, written once with its stress marked by
 * U+0301 COMBINING ACUTE ACCENT after the stressed vowel («колесо́»). Just before
 * a phrase goes to the cloud voice, `stressed` marks each word of it that the
 * dictionary knows. The screen never sees the marks: they are added to the
 * phrase on its way to the voice and nowhere else — and the browser's own voice
 * (the fallback) gets the phrase without them, because it does not read them.
 *
 * A language brings its dictionary as a JSON file of its own
 * (`<code>/stress.json`): `words` — the words, each with its stress marked;
 * `phrases` — a few words together, for a word whose stress depends on its
 * neighbours. A word written twice with different stresses («за́мок», «замо́к»)
 * is ambiguous and is left alone unless a phrase settles it — the voice decides.
 * The file is loaded only when a phrase is first stressed, so whoever never
 * hears the cloud voice never downloads it.
 *
 * Deliberately free of React and of `@/` imports so it runs under `node --test`.
 */

/** The stress mark, written after the stressed vowel. */
export const STRESS = '́';

/** A language's dictionary of stress, as its `stress.json` holds it. */
export interface StressFile {
  /** Every word with its stress marked: «колесо́», «ма́ма». */
  words: readonly string[];
  /** Words whose stress depends on their neighbours, marked in context: «на за́мку». */
  phrases?: readonly string[];
}

/** A dictionary of stress, ready to be looked up. */
export interface StressBook {
  /** A word without marks, in lower case → the same word marked (only words with one known stress). */
  words: ReadonlyMap<string, string>;
  /** The same for whole phrases, longest first. */
  phrases: readonly (readonly [plain: string, marked: string])[];
  /** The phrases as one pattern, or null when there are none. */
  phrasePattern: RegExp | null;
}

/** What a language says about stress: how to mark a text, and which of its words the dictionary lacks. */
export interface Stress {
  /** The text with every word the dictionary knows marked — for the cloud voice only. */
  stressed(text: string): Promise<string>;
  /** The words of a text that need a stress (more than one vowel) and that the dictionary does not know, in lower case. */
  missing(text: string): Promise<string[]>;
}

const LETTER = '\\p{L}';
/** One part of a word: starts with a letter, ends with a letter or its stress mark, may hold apostrophes («п’ять»). */
const PART = `[${LETTER}](?:[${LETTER}’'${STRESS}]*[${LETTER}${STRESS}])?`;
/** A word; a hyphenated one is one word («будь-який»), and its halves are tried too. */
const WORD_RE = new RegExp(`${PART}(?:-${PART})*`, 'gu');
const MARKS_RE = new RegExp(STRESS, 'g');

/** One way to write an apostrophe, so «п'ять» and «п’ять» are the same word. */
const normal = (word: string): string => word.replace(/'/g, '’').toLocaleLowerCase();
export const unmarked = (text: string): string => text.replace(MARKS_RE, '');

const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * `original` with the stress marks of `marked` (the same word, maybe in another
 * case) put in the same places — so «Колесо» keeps its capital: «Колесо́».
 */
function carryMarks(original: string, marked: string): string {
  let out = '';
  let at = 0;
  for (const ch of marked) {
    if (ch === STRESS) {
      out += STRESS;
      continue;
    }
    out += original[at] ?? '';
    at += 1;
  }
  return out + original.slice(at);
}

/** Builds the lookup from a language's file. A word given two different stresses is left out: it is ambiguous. */
export function stressBook(file: StressFile): StressBook {
  const words = new Map<string, string>();
  const ambiguous = new Set<string>();
  for (const entry of file.words) {
    const marked = normal(entry.trim());
    const plain = unmarked(marked);
    if (!plain || ambiguous.has(plain)) continue;
    const known = words.get(plain);
    if (known !== undefined && known !== marked) {
      words.delete(plain);
      ambiguous.add(plain);
      continue;
    }
    words.set(plain, marked);
  }
  const phrases = (file.phrases ?? [])
    .map((entry) => normal(entry.trim()))
    .filter(Boolean)
    .map((marked) => [unmarked(marked), marked] as const)
    .sort((a, b) => b[0].length - a[0].length);
  const phrasePattern = phrases.length
    ? new RegExp(`(?<![${LETTER}’'${STRESS}])(${phrases.map(([plain]) => escape(plain).replace(/’/g, "['’]")).join('|')})(?![${LETTER}’'${STRESS}])`, 'giu')
    : null;
  return { words, phrases, phrasePattern };
}

/** One word marked, if the book knows it (whole, or each half of a hyphenated word). */
function stressWord(word: string, book: StressBook): string {
  if (word.includes(STRESS)) return word;
  const known = book.words.get(normal(word));
  if (known) return carryMarks(word, known);
  if (!word.includes('-')) return word;
  return word
    .split('-')
    .map((part) => stressWord(part, book))
    .join('-');
}

/** `text` with every word the book knows marked. Words already marked by the author are left as they are. */
export function markStress(text: string, book: StressBook): string {
  let out = text;
  if (book.phrasePattern) {
    const byPlain = new Map(book.phrases);
    out = out.replace(book.phrasePattern, (found: string) => {
      const marked = byPlain.get(normal(found));
      return marked ? carryMarks(found, marked) : found;
    });
  }
  return out.replace(WORD_RE, (word) => stressWord(word, book));
}

/**
 * The words of `text` that could be stressed wrongly — more than one vowel —
 * and that the book does not know at all (an ambiguous one counts as known).
 */
export function missingStress(text: string, book: StressBook, alphabet: Alphabet, ambiguous: ReadonlySet<string>): string[] {
  const out = new Set<string>();
  const unknown = (word: string) =>
    !word.includes(STRESS) && alphabet.letters.test(word) && (word.match(alphabet.vowels) ?? []).length >= 2 && !book.words.has(word) && !ambiguous.has(word);
  for (const found of text.match(WORD_RE) ?? []) {
    const word = normal(found);
    if (!unknown(word)) continue;
    // A hyphenated word the book does not know whole is known when each of its halves is.
    for (const part of word.includes('-') ? word.split('-') : [word]) if (unknown(part)) out.add(part);
  }
  return [...out];
}

/** How to tell a word of the language, and which of its words need a stress at all. */
export interface Alphabet {
  /** A whole word of the language (lower case, with apostrophes and hyphens) — a stray Latin name is not one. */
  letters: RegExp;
  /** One vowel (global): a word with fewer than two has nothing to stress. */
  vowels: RegExp;
}

/** The stress of a language whose dictionary is `load`ed on first use. */
export function stressOf(load: () => Promise<StressFile>, alphabet: Alphabet): Stress {
  let book: Promise<{ book: StressBook; ambiguous: Set<string> }> | null = null;
  const ready = () =>
    (book ??= load().then((file) => {
      const made = stressBook(file);
      const ambiguous = new Set(file.words.map((w) => unmarked(normal(w))).filter((w) => !made.words.has(w)));
      return { book: made, ambiguous };
    }));
  return {
    async stressed(text) {
      try {
        return markStress(text, (await ready()).book);
      } catch {
        // No dictionary (offline, a failed chunk): the voice reads the text as it is.
        return text;
      }
    },
    async missing(text) {
      const { book: made, ambiguous } = await ready();
      return missingStress(text, made, alphabet, ambiguous);
    },
  };
}

/** A language with no dictionary of stress (its stress is regular, or nobody has written one yet). */
export const NO_STRESS: Stress = {
  stressed: (text) => Promise.resolve(text),
  missing: () => Promise.resolve([]),
};
