/** Inclusive integer in [min, max]. */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Random element of a non-empty array. */
export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** Returns a shuffled copy (Fisher–Yates). */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Short unique-ish id for task instances. */
export function uid(prefix = 't'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Runs `make` with chance tamed: every draw inside it (`randInt`, `pick`,
 * `shuffle`, `uid`, a bare `Math.random()`) follows from `seed`, so running it
 * twice with the same seed makes the same thing twice. That is how a task is
 * made once more in another language — the same numbers, the same cards, the
 * same ids, other words (`core/game/kernel/languages.ts`). `make` must be
 * synchronous: chance is given back the moment it returns.
 */
export function seeded<T>(seed: number, make: () => T): T {
  const chance = Math.random;
  let state = seed >>> 0;
  // mulberry32
  Math.random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  try {
    return make();
  } finally {
    Math.random = chance;
  }
}
