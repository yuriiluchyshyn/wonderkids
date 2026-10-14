/**
 * Small pure helpers for hint scripts (`types.ts`) — how a generator writes
 * one, how a board fills one in, and how long a beat may take.
 *
 * Free of React and of `@/` imports so it runs under `node --test`.
 */
import type { HintBeat, HintScript } from './types.ts';

/** A beat: `beat('Довга стрілка — хвилини.', ['hand:minute'])`. */
export const beat = (text: string, focus?: string[], extra?: Omit<HintBeat, 'text' | 'focus'>): HintBeat => ({
  text,
  ...(focus && focus.length > 0 ? { focus } : {}),
  ...extra,
});

/** A row of focus ids: `ids('slice', 3)` → `slice:0`, `slice:1`, `slice:2`; `ids('slice', 3, 5)` → `slice:3`, `slice:4`. */
export function ids(prefix: string, from: number, to?: number): string[] {
  const [start, end] = to === undefined ? [0, from] : [from, to];
  return Array.from({ length: Math.max(0, end - start) }, (_, i) => `${prefix}:${start + i}`);
}

const fillText = (text: string, holes: Record<string, string | number>): string =>
  text.replace(/\{(\w+)\}/g, (all, name: string) => (name in holes ? String(holes[name]) : all));

/**
 * A board's script with its `{holes}` filled — in the beats' words and in
 * their focus ids alike (`abc:{next}` → `abc:T`). What is not given stays as
 * it is written.
 */
export function fillScript(script: HintScript, holes: Record<string, string | number>): HintScript {
  const has = (name: string) => Boolean(holes[name]);
  return {
    ...script,
    beats: script.beats
      .filter((b) => (b.if === undefined || has(b.if)) && (b.unless === undefined || !has(b.unless)))
      .map((b) => {
        const out = { ...b, text: fillText(b.text, holes), ...(b.focus ? { focus: b.focus.map((id) => fillText(id, holes)) } : {}) };
        // Settled: a filled script carries no conditions any more.
        delete out.if;
        delete out.unless;
        return out;
      }),
  };
}

/** The script a task's payload carries for its help, if any. */
export const helpOf = (payload: unknown): HintScript | undefined => (payload as { help?: HintScript } | null | undefined)?.help;

/** The script read out once the task is solved, if any. */
export const toldOf = (payload: unknown): HintScript | undefined => (payload as { told?: HintScript } | null | undefined)?.told;

/** After how many wrong answers the shell opens a task's help: its own rule, or the game's (`fallback`). */
export const helpAfter = (payload: unknown, fallback: number): number => helpOf(payload)?.after?.mistakes ?? fallback;

/** Does the shell open this task's help after a long while with no answer? */
export const helpOnIdle = (payload: unknown): boolean => {
  const help = helpOf(payload);
  return Boolean(help && help.by !== 'board' && help.after?.idle);
};

/**
 * Time to read a beat on the screen when it is not said aloud. A beat of a
 * help is a sentence to take in; a part of a sentence read out over a solved
 * board (`told`) is only a few words of it, and gets time by its length alone.
 */
export const readingMs = (text: string, kind: 'help' | 'told' = 'help'): number =>
  kind === 'told' ? Math.max(500, text.length * 50) : Math.max(1500, text.length * 60);

/** However the voice ends, a beat is never held longer than this. */
export const beatCeilingMs = (text: string): number => Math.max(9000, text.length * 160);
