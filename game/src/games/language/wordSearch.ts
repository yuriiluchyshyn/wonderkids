import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import type { HiddenWord, TemplatePayload } from '@/core/game/templates/types';
import { pick, randInt, seeded, shuffle } from '@/core/utils/random';
import { templateTask, type GameTasks } from '../shared/templateModule';
import { languageTexts } from './grammar';
import type { WordSearchStage } from './grammar/types';
import type { LangPack } from './tasks';

type Config = Pick<TaskConfig, 'lang'>;

/** The game id of «Пошук слів» within a pack (after the pack's prefix). */
export const WORD_SEARCH = 'wordsearch';

/** Path length of «Пошук слів» — the same ladder as every language game. */
export const WORD_SEARCH_STEPS = 50;

/** The path step on which each new way of hiding words begins (`config.ts` introduces them there). */
export const WORD_SEARCH_STAGE: Record<WordSearchStage, number> = { down: 7, slant: 15, back: 35, byEar: 41 };

/** A direction a word runs in: [rows, columns] per letter. */
type Dir = readonly [number, number];
const RIGHT: Dir = [0, 1];
const DOWN: Dir = [1, 0];
const SLANT_DOWN: Dir = [1, 1];
const SLANT_UP: Dir = [-1, 1];

/**
 * What a path step asks — the table grows, more words hide in it, they get
 * longer, and they run in more directions:
 *  1–6   a 5×5 table, two or three short words, left to right only;
 *  7–14  top to bottom too; 9+ a 6×6 table;
 *  15–34 slanting down, from 25 slanting up as well; 21+ a 7×7 table;
 *  35–50 backwards in every direction; 36+ an 8×8 table;
 *  41–50 the words are no longer written — only their pictures (and a speaker).
 */
export function wordSearchLevel(step: number) {
  const size = step <= 8 ? 5 : step <= 20 ? 6 : step <= 35 ? 7 : 8;
  const count = step <= 4 ? 2 : step <= 14 ? 3 : step <= 30 ? 4 : 5;
  const maxLen = Math.min(size, 3 + Math.floor((step - 1) / 5));
  const minLen = Math.max(3, maxLen - 2);
  const ahead: Dir[] = [RIGHT];
  if (step >= WORD_SEARCH_STAGE.down) ahead.push(DOWN);
  if (step >= WORD_SEARCH_STAGE.slant) ahead.push(SLANT_DOWN);
  if (step >= 25) ahead.push(SLANT_UP);
  const dirs = step >= WORD_SEARCH_STAGE.back ? [...ahead, ...ahead.map(([r, c]) => [-r, -c] as const)] : ahead;
  return { size, count, minLen, maxLen, dirs, anyWay: step >= WORD_SEARCH_STAGE.slant, shown: step < WORD_SEARCH_STAGE.byEar };
}

/** FNV-1a — a pack and a step turned into the seed of its sample tables. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * The words of a pack that have a picture and are written with letters alone
 * (no spaces, apostrophes or hyphens), each word and each picture once, in
 * the pack's order — its simplest words come first.
 */
function wordsOf(pack: LangPack): [word: string, emoji: string][] {
  const all: [string, string | undefined][] = [
    ...pack.spellWords,
    ...pack.partWords.map(({ parts, emoji }) => [parts.join(''), emoji] as [string, string]),
    ...pack.halves.map(([a, b, emoji]) => [a + b, emoji] as [string, string]),
    ...pack.rhymes.flat().map((entry) => entry.split('|') as [string, string | undefined]),
  ];
  const words = new Set<string>();
  const pictures = new Set<string>();
  const out: [string, string][] = [];
  for (const [raw, emoji] of all) {
    const word = raw.toLocaleUpperCase(pack.lang);
    if (!emoji || !/^\p{L}+$/u.test(word) || words.has(word) || pictures.has(emoji)) continue;
    words.add(word);
    pictures.add(emoji);
    out.push([word, emoji]);
  }
  return out;
}

/** Lays the words into an empty `size × size` table; null when they would not fit. */
function lay(words: string[], size: number, dirs: readonly Dir[]): { letters: (string | null)[]; cells: number[][] } | null {
  const letters: (string | null)[] = Array(size * size).fill(null);
  const cells: number[][] = [];
  for (const word of words) {
    let placed: number[] | null = null;
    for (let attempt = 0; attempt < 120 && !placed; attempt += 1) {
      const [dr, dc] = pick(dirs);
      const r0 = randInt(0, size - 1);
      const c0 = randInt(0, size - 1);
      const rEnd = r0 + dr * (word.length - 1);
      const cEnd = c0 + dc * (word.length - 1);
      if (rEnd < 0 || rEnd >= size || cEnd < 0 || cEnd >= size) continue;
      const at = [...word].map((_, i) => (r0 + dr * i) * size + c0 + dc * i);
      // Words may cross where they share a letter.
      if (at.every((cell, i) => letters[cell] === null || letters[cell] === word[i])) placed = at;
    }
    if (!placed) return null;
    placed.forEach((cell, i) => (letters[cell] = word[i]));
    cells.push(placed);
  }
  return { letters, cells };
}

/**
 * «Пошук слів» of one pack (UI_WORD_SEARCH): a table of letters with the
 * words of some pictures hidden in it. The words are the pack's own; what is
 * said about the task is in the language of the screen and quotes none of
 * them — every pack plays with the same sentences.
 */
export function wordSearchTasks(pack: LangPack): GameTasks {
  const vocabulary = wordsOf(pack);
  const alphabet = pack.alphabet.map((letter) => letter.toLocaleUpperCase(pack.lang));

  function board(step: number, config: Config): TaskInstance<TemplatePayload> {
    const T = languageTexts(config.lang).wordSearch;
    const L = wordSearchLevel(step);
    const fitting = vocabulary.filter(([w]) => w.length >= L.minLen && w.length <= L.maxLen);
    for (let tries = 0; ; tries += 1) {
      // Fewer words if the table keeps refusing them.
      const want = Math.max(1, L.count - Math.floor(tries / 20));
      const chosen: [string, string][] = [];
      for (const entry of shuffle(fitting)) {
        if (chosen.length >= want) break;
        // No word inside another: finding «КІТ» in «КІТОК» would be a riddle of its own.
        if (chosen.some(([w]) => w.includes(entry[0]) || entry[0].includes(w))) continue;
        chosen.push(entry);
      }
      const laid = lay([...chosen].sort((a, b) => b[0].length - a[0].length).map(([w]) => w), L.size, L.dirs);
      if (!laid && tries < 80) continue;
      if (!laid) throw new Error(`word search ${pack.lang} step ${step}: no table`);
      const order = [...chosen].sort((a, b) => b[0].length - a[0].length);
      const words: HiddenWord[] = order.map(([word, emoji], i) => ({ id: `w${i}`, word, emoji, cells: laid.cells[i], shown: L.shown }));
      const letters = laid.letters.map((letter) => letter ?? pick(alphabet));
      return templateTask(
        `ws:${pack.lang}:${L.size}:${order.map(([w]) => w).sort().join('|')}`,
        T.ask(L.shown),
        {
          template: Mechanics.WordSearch,
          cols: L.size,
          letters,
          // The list below the table in the pack's order of difficulty: shortest first.
          words: [...words].reverse(),
          lang: pack.lang,
          hint: T.hint(L.anyWay),
        },
        step,
      );
    }
  }

  return {
    // A sample of the tables a step can make — the same ones every time (for counting and single draws).
    pool: (step, config) => seeded(hash(`${pack.lang}:${step}`), () => Array.from({ length: 12 }, () => board(step, config))),
    // A level: fresh tables, under the chance the shell tames for the voice's twin.
    level: (step, count, config) => {
      const out: TaskInstance<TemplatePayload>[] = [];
      for (let i = 0; i < count * 4 && out.length < count; i += 1) {
        const task = board(step, config);
        if (!out.some((t) => t.key === task.key)) out.push(task);
      }
      return out;
    },
  };
}
