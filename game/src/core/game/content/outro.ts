import type { TaskInstance } from '@/core/game/kernel/types';
import { common } from '@/core/lang';

const STORE_KEY = 'wk-outro-v1';

type Cursor = Record<string, number>;

function load(): Cursor {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}') as Cursor;
  } catch {
    return {};
  }
}

function save(cursor: Cursor): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(cursor));
  } catch {
    /* private mode — the rotation simply restarts next time */
  }
}

/**
 * The fact to tell after this task is solved. A task may carry a whole pool of
 * texts; each solve takes the next one, starting from a random place, so the
 * child hears every text of the pool before any of them comes round again.
 * The position is remembered per pool on the device.
 */
export function pickOutro(task: Pick<TaskInstance, 'outro'>): string | undefined {
  return pickFrom(listOf(task.outro));
}

const listOf = (outro: string | readonly string[] | undefined): string[] =>
  outro === undefined ? [] : typeof outro === 'string' ? [outro] : [...outro];

/** A fact as it is told: what the screen shows and what the voice says. */
export interface ToldFact {
  text: string;
  /**
   * The same fact in the voice's language. Absent when the voice has nothing
   * to pair it with (a story of the screen's language alone): then the
   * screen's own text is read, in the screen's language.
   */
  said?: string;
}

/**
 * Picks the fact to tell from the pool of the task on the screen (`shown`),
 * and finds the same fact in the pool of its twin in the voice's language
 * (`said`; leave it out when the voice speaks the screen's language).
 *
 * The facts of one thing are written in every language in the same order, but
 * not all of them are translations: a language may tell its own story at a
 * place (the highest mountain of Poland where the Ukrainian names Hoverla) or
 * add a sentence of its own — those are marked `own` (`core/lang/marks.ts`).
 * With one language the whole pool is told, own stories too. With two, only
 * what both tell is, with the own pieces cut out, and the n-th such fact of
 * the screen is the n-th of the voice. A pool of nothing but own stories is
 * still told, in the screen's language.
 */
export function tellFact(
  shown: string | readonly string[] | undefined,
  said?: string | readonly string[],
  pick: (pool: readonly string[]) => string | undefined = pickFrom,
): ToldFact | undefined {
  const pool = listOf(shown);
  if (said === undefined) {
    const text = pick(pool);
    return text === undefined ? undefined : { text, said: text };
  }
  const ours = pool.map(common).filter(Boolean);
  if (ours.length === 0) {
    const text = pick(pool);
    return text === undefined ? undefined : { text };
  }
  const theirs = listOf(said).map(common).filter(Boolean);
  const text = pick(ours)!;
  return { text, said: theirs[ours.indexOf(text)] };
}

/** The next text of a pool — see `pickOutro`. */
export function pickFrom(outro: readonly string[]): string | undefined {
  if (outro.length === 0) return undefined;
  if (outro.length === 1) return outro[0];

  // The cursor belongs to the pool, not the task: tasks sharing a pool (every
  // paper item of «Еко-патруль») then never tell the same text twice in a row.
  const key = `${outro.length}:${outro[0]}`;
  const cursor = load();
  const at = (cursor[key] ?? Math.floor(Math.random() * outro.length)) % outro.length;
  cursor[key] = (at + 1) % outro.length;
  save(cursor);
  return outro[at];
}
