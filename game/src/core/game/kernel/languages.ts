import { DEFAULT_LANG, common, hasOwn, type LangCode } from '@/core/language';
import { seeded } from '@/core/utils/random';
import { speaks, type SubCategory, type TaskInstance } from './types';

/**
 * A task in two languages at once: the one on the screen and the one the voice
 * speaks. A parent may set them apart (the game in English, the voice in
 * Polish), and then the voice must say the SAME phrase, in its own language —
 * not read English words by Polish rules.
 *
 * A module knows nothing of this. It makes a task in the language it is asked
 * for (`TaskConfig.lang`); the shell asks twice, with chance tamed by the same
 * seed (`seeded`), so both makings are one task in different words. The second
 * rides along as `task.voice`, and what is said about a task is read off it
 * (`saidOf(task)`). The cards of a board get their spoken words from it too.
 *
 * Two makings can differ only where a module lets words decide something (a
 * sort by label, a length). Then the twin is dropped and the voice falls back
 * to the language on the screen; `npm run check:content` reports such a game.
 * A task of one language's own (`task.own` — a question about that language's
 * country) is never paired either: it is read in the language it is shown in.
 * Facts are paired when they are told (`tellFact`), not here.
 */

/** The languages a game is played in for a child: what is shown, what is said. */
export interface ContentLangs {
  shown: LangCode;
  said: LangCode;
}

/**
 * A game the child's language has no content for is played in Ukrainian (the
 * hub does not offer it, but a path or a link may still lead here); a voice
 * the game cannot speak says what is shown.
 */
export function contentLangs(sub: Pick<SubCategory, 'langs'> | undefined, gameLang: LangCode, voiceLang: LangCode): ContentLangs {
  const shown = sub && speaks(sub, gameLang) ? gameLang : DEFAULT_LANG;
  const said = sub && speaks(sub, voiceLang) ? voiceLang : shown;
  return { shown, said };
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * A copy of a board to write on. A module may hand out the same card object in
 * many tasks (a constant list of signs, a word of its content): the language
 * marks below must never land on what the module keeps.
 */
function copy<T>(node: T): T {
  if (Array.isArray(node)) return node.map(copy) as T;
  if (isRecord(node) && Object.getPrototypeOf(node) === Object.prototype) return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, copy(value)])) as T;
  return node;
}

/** Marks every card of a board with the language its words are to be read in (unless it names its own). */
function stamp(node: unknown, lang: LangCode): void {
  if (Array.isArray(node)) node.forEach((item) => stamp(item, lang));
  else if (isRecord(node)) {
    if ((typeof node.label === 'string' || typeof node.speak === 'string') && node.lang === undefined) node.lang = lang;
    for (const value of Object.values(node)) stamp(value, lang);
  }
}

/**
 * Gives the cards of `shown` the spoken words of `said`. False when the two
 * are not the same board (the makings parted ways) — nothing is changed then.
 */
function sameShape(shown: unknown, said: unknown): boolean {
  if (Array.isArray(shown)) return Array.isArray(said) && shown.length === said.length && shown.every((item, i) => sameShape(item, said[i]));
  if (!isRecord(shown)) return typeof shown === typeof said;
  if (!isRecord(said)) return false;
  if ('id' in shown && shown.id !== said.id) return false;
  return Object.keys(shown).every((key) => key in said && sameShape(shown[key], said[key]));
}

/** A board whose hint has the pieces of its own language (`own`) cut out. */
function withCommonHint<T>(payload: T): T {
  if (!isRecord(payload) || typeof payload.hint !== 'string' || !hasOwn(payload.hint)) return payload;
  return { ...payload, hint: common(payload.hint) };
}
function voiceCards(shown: unknown, said: unknown, lang: LangCode): void {
  if (Array.isArray(shown) && Array.isArray(said)) shown.forEach((item, i) => voiceCards(item, said[i], lang));
  else if (isRecord(shown) && isRecord(said)) {
    // A card that names its own language (a word of a language lesson) is the same in both makings.
    if (shown.lang === undefined) {
      const spoken = typeof said.speak === 'string' ? said.speak : typeof said.label === 'string' ? said.label : undefined;
      if (spoken !== undefined && (typeof shown.label === 'string' || typeof shown.speak === 'string')) {
        shown.speak = spoken;
        shown.lang = lang;
      }
    }
    for (const key of Object.keys(shown)) voiceCards(shown[key], said[key], lang);
  }
}

/**
 * Makes tasks in the language on the screen and gives each its twin in the
 * voice's. `make(lang)` is the module's own making (a level, or one task in a
 * list); it is called once per language under the same seed.
 */
export function inLanguages(langs: ContentLangs, make: (lang: LangCode) => TaskInstance[]): TaskInstance[] {
  const seed = Math.floor(Math.random() * 0xffffffff);
  // A module may keep its tasks: each is copied before anything is written on it.
  const shown = seeded(seed, () => make(langs.shown)).map((task) => ({ ...task }));
  const twins = langs.said === langs.shown ? null : seeded(seed, () => make(langs.said));
  const same = twins !== null && twins.length === shown.length;
  shown.forEach((task, i) => {
    task.lang = langs.shown;
    task.payload = copy(task.payload);
    // A task of the screen's language alone has no twin: it is read as it is shown.
    const twin = same && !task.own && !twins[i].own ? twins[i] : undefined;
    if (twin && twin.id === task.id && sameShape(task.payload, twin.payload)) {
      // A hint shown in one language and said in another keeps only what both say.
      task.voice = { ...twin, lang: langs.said, payload: withCommonHint(twin.payload) };
      task.payload = withCommonHint(task.payload);
      voiceCards(task.payload, twin.payload, langs.said);
    }
    stamp(task.payload, langs.shown);
  });
  return shown;
}
