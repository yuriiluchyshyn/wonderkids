/**
 * The translation engine: a text is asked for by its key, in a language.
 *
 * A dictionary is one JSON file per language — nested sections, and at the
 * leaves either a text or its plural forms:
 *
 *   "hub":  { "play": "Грати" }                                   t('hub.play')
 *   "hello": "Привіт, {name}!"                                     t('hello', { name })
 *   "tasks": { "one": "{count} завдання", "few": "{count} завдання",
 *              "many": "{count} завдань", "other": "{count} завдання" }
 *                                                                  t('tasks', { count: 5 })
 *
 * The plural form is chosen by the language's own rule (`Intl.PluralRules`:
 * Ukrainian and Polish tell one / few / many, English one / other) from the
 * `count` parameter. A key missing in a language is taken from the fallback
 * language, so an untranslated text shows up in that language — never as a key.
 *
 * The engine knows nothing of what it translates, nor in which languages: each
 * of its users — the public site, the game — brings its own dictionaries and
 * its own list of languages (`L`), and neither knows of the other's.
 *
 * Deliberately free of React and of the DOM so it runs under `node --test`
 * and inside a Vite plugin.
 */
export interface Dict {
  [key: string]: string | Dict;
}
export type Params = Record<string, string | number>;

/** A leaf with plural forms: every one has at least `other`. */
type Plural = { other: string };

/** Every key of a dictionary, dotted: `'hub.play' | 'tasks' | …`. */
export type KeyOf<T> = {
  [K in keyof T & string]: T[K] extends string ? K : T[K] extends Plural ? K : `${K}.${KeyOf<T[K]>}`;
}[keyof T & string];

const PLURAL_FORMS = new Set(['zero', 'one', 'two', 'few', 'many', 'other']);
const isPlural = (node: Dict): boolean => typeof node.other === 'string' && Object.keys(node).every((k) => PLURAL_FORMS.has(k));

type Entry = string | Record<string, string>;

function flatten(dict: Dict, prefix = '', out = new Map<string, Entry>()): Map<string, Entry> {
  for (const [key, node] of Object.entries(dict)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof node === 'string') out.set(path, node);
    else if (isPlural(node)) out.set(path, node as Record<string, string>);
    else flatten(node, path, out);
  }
  return out;
}

const fill = (text: string, params?: Params): string => (params ? text.replace(/\{(\w+)\}/g, (all, name: string) => (name in params ? String(params[name]) : all)) : text);

export interface Translator<K extends string, L extends string = string> {
  /** The text of `key` in `lang`, with `{name}` filled from `params`. */
  (lang: L, key: K, params?: Params): string;
  /** Every key the dictionaries know, and in which languages it is missing. */
  keys(): Map<string, L[]>;
}

export function createTranslator<K extends string, L extends string = string>(dictionaries: Record<L, Dict>, fallback: L): Translator<K, L> {
  const langs = Object.keys(dictionaries) as L[];
  const flat = Object.fromEntries(langs.map((lang) => [lang, flatten(dictionaries[lang])])) as Record<L, Map<string, Entry>>;
  const rules = new Map<L, Intl.PluralRules>();

  const translate = ((lang, key, params) => {
    const entry = flat[lang]?.get(key) ?? flat[fallback].get(key);
    if (entry === undefined) return key;
    if (typeof entry === 'string') return fill(entry, params);
    const from = flat[lang]?.has(key) ? lang : fallback;
    let rule = rules.get(from);
    if (!rule) rules.set(from, (rule = new Intl.PluralRules(from)));
    const form = rule.select(Number(params?.count ?? 0));
    return fill(entry[form] ?? entry.many ?? entry.other, params);
  }) as Translator<K, L>;

  translate.keys = () => {
    const all = new Map<string, L[]>();
    for (const lang of langs) for (const key of flat[lang].keys()) all.set(key, []);
    for (const [key, missing] of all) for (const lang of langs) if (!flat[lang].has(key)) missing.push(lang);
    return all;
  };
  return translate;
}
