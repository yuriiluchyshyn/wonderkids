/** Small helpers for the per-language geography data, which is written as «a|b|c» strings. */

export const split = (rows: Record<string, string>): Record<string, string[]> =>
  Object.fromEntries(Object.entries(rows).map(([id, text]) => [id, text.split('|')]));

/** «id: Name» pairs written one after another: `ua Kyiv, us Washington`. */
export const pairs = (text: string): Record<string, string> =>
  Object.fromEntries(text.trim().split(/,\s*/).map((pair) => [pair.slice(0, pair.indexOf(' ')), pair.slice(pair.indexOf(' ') + 1)]));

export const cap = (text: string) => `${text[0].toUpperCase()}${text.slice(1)}`;
