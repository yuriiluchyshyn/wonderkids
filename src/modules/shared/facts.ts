/**
 * Helpers for the pools of "what happens next" texts a task tells after it is
 * solved (`TaskInstance.outro`). Rule of thumb (docs/level-design.md): every
 * task should have at least ten, so replaying it brings a new story.
 */

/** Merge facts into one pool: the item's own first, then the shared ones. */
export function factPool(...parts: (string | readonly string[] | undefined)[]): string[] {
  return [...new Set(parts.flatMap((part) => (part === undefined ? [] : typeof part === 'string' ? [part] : [...part])))];
}
