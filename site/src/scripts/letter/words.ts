/**
 * The form's own words, in the language of the page: the «js» section of the
 * site's dictionary (`src/locales/<lang>.json`), written into the page by the
 * build as JSON (`#letter-words`).
 */
export type Words = (typeof import('../../locales/uk.json'))['js'];

export function readWords(): Words | null {
  try {
    return JSON.parse(document.getElementById('letter-words')?.textContent ?? '') as Words;
  } catch {
    return null;
  }
}

/** A text with its `{holes}` filled. */
export const say = (text: string, values: Record<string, string | number>): string => text.replace(/\{(\w+)\}/g, (all, name: string) => (name in values ? String(values[name]) : all));
