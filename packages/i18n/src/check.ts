/**
 * What is wrong with a set of dictionaries — the check every user of the
 * engine runs over its own texts in its tests: every language says the same
 * things, with the same `{placeholders}`, in every plural form it needs.
 */
import { createTranslator, type Dict } from './engine.ts';

const PLURAL_LEAF = /\.(zero|one|two|few|many)$/;

function leaves(dict: Dict, prefix = '', out = new Map<string, string>()): Map<string, string> {
  for (const [key, node] of Object.entries(dict)) {
    if (typeof node === 'string') out.set(`${prefix}${key}`, node);
    else leaves(node, `${prefix}${key}.`, out);
  }
  return out;
}

const holes = (text: string): string => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

/** One line per fault; an empty list means the dictionaries agree. `fallback` is the language they were written in. */
export function dictionaryProblems<L extends string>(dictionaries: Record<L, Dict>, fallback: L): string[] {
  const langs = Object.keys(dictionaries) as L[];
  const problems: string[] = [];

  for (const [key, missing] of createTranslator<string, L>(dictionaries, fallback).keys()) {
    if (missing.length > 0) problems.push(`${key} — not in ${missing.join(', ')}`);
  }

  const original = leaves(dictionaries[fallback]);
  const texts = Object.fromEntries(langs.map((lang) => [lang, leaves(dictionaries[lang])])) as Record<L, Map<string, string>>;

  // The same {placeholders} everywhere: a translation that drops one loses a name or a number.
  for (const lang of langs) {
    for (const [key, text] of texts[lang]) {
      if (!text.trim()) problems.push(`${lang}: ${key} is empty`);
      // Plural leaves differ between languages (English has no «few»): compare against the same key's «other».
      const twin = original.get(key) ?? original.get(key.replace(PLURAL_LEAF, '.other'));
      // «one» may leave the number out («одне завдання»).
      if (twin !== undefined && holes(twin) !== holes(text) && !key.endsWith('.one')) {
        problems.push(`${lang}: ${key} has {${holes(text)}}, ${fallback} has {${holes(twin)}}`);
      }
    }
  }

  // Every plural has the forms its language asks for.
  const plurals = [...original.keys()].filter((key) => key.endsWith('.other') && original.has(`${key.slice(0, -'.other'.length)}.one`)).map((key) => key.slice(0, -'.other'.length));
  for (const lang of langs) {
    const forms = new Intl.PluralRules(lang).resolvedOptions().pluralCategories;
    for (const key of plurals) for (const form of forms) if (!texts[lang].has(`${key}.${form}`)) problems.push(`${lang}: ${key} lacks «${form}»`);
  }
  return problems;
}
