/**
 * Where on a game's path the keys of knowledge lie. Not on every step: a key
 * waits every 3–5 steps, the gaps drawn at random — but from the game's own
 * id, so a path keeps its keys where they were across sessions, reloads and
 * devices, and the path modal can show them in advance.
 *
 * Pure (no imports) so it runs under `node --test`.
 */

/** The shortest and the longest walk from one key to the next. */
export const KEY_GAP = { min: 3, max: 5 } as const;

/** FNV-1a: a game's id turned into a seed. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 — the same draw for the same seed, everywhere. */
function chance(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const cache = new Map<string, number[]>();

/**
 * The steps of a path that carry a key, ascending — a key is earned when its
 * step is passed for the first time. `game` is the game's path key
 * (`module:sub`); `until` the last step that may carry one. The final step of
 * a path is never passed (the frontier stays on it), so a path asks for keys
 * up to `steps - 1`.
 */
export function keySteps(game: string, until: number): number[] {
  const id = `${game}#${until}`;
  const known = cache.get(id);
  if (known) return known;
  const next = chance(hash(game));
  const gap = () => KEY_GAP.min + Math.floor(next() * (KEY_GAP.max - KEY_GAP.min + 1));
  const out: number[] = [];
  for (let step = gap(); step <= until; step += gap()) out.push(step);
  cache.set(id, out);
  return out;
}

/** Does this step of a path of `total` steps carry a key? */
export function hasKey(game: string, step: number, total: number): boolean {
  return keySteps(game, total - 1).includes(step);
}

/** How many keys a path has given: its key steps below the frontier. */
export function keysOnPath(game: string, frontier: number, total: number): number {
  const passed = Math.min(total, frontier) - 1;
  return keySteps(game, total - 1).filter((s) => s <= passed).length;
}
