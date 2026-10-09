/**
 * Puts the words into a sentence kept as a text with `{holes}`:
 * `fill('The {thing} must turn {mix}.', { thing, mix })`. A hole that is not
 * given stays as it is written.
 *
 * Deliberately free of React and of `@/` imports so it runs under `node --test`.
 */
export const fill = (text: string, holes: Record<string, string | number>): string =>
  text.replace(/\{(\w+)\}/g, (all, name: string) => (name in holes ? String(holes[name]) : all));
