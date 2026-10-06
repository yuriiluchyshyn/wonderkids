/**
 * Helpers for the pools of "what happens next" texts a task tells after it is
 * solved (`TaskInstance.outro`). Rule of thumb (docs/level-design.md): every
 * task should have at least ten, so replaying it brings a new story.
 */

/** Ways to lead into the same fact, for content that has only one. */
const OPENERS = [
  '',
  'Саме так! ',
  'Чудово! ',
  'Молодець! ',
  'Так тримати! ',
  'А ти знаєш? ',
  'Цікавий факт: ',
  'Запам’ятай: ',
  'Ось що варто знати: ',
  'Розкажи про це вдома: ',
];

/** One fact told ten ways. Use only until the content has ten real facts. */
export function framed(fact: string): string[] {
  return OPENERS.map((opener) => `${opener}${fact}`);
}

/** Merge facts into one pool: the item's own first, then the shared ones. */
export function factPool(...parts: (string | readonly string[] | undefined)[]): string[] {
  return [...new Set(parts.flatMap((part) => (part === undefined ? [] : typeof part === 'string' ? [part] : [...part])))];
}
