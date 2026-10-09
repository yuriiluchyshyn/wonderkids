import type { StoryHero } from './types';

/**
 * A story written as a line with holes in it — the way English and Polish
 * tell «Задачі» (Ukrainian builds its sentences in code, as it always did).
 *
 *   {a} {b} {c}      a number of the draw, by its place
 *   {a~} {b~} {c~}   the same number when it counts the thing without naming it («jeszcze 2» of
 *                    the stickers): the voice then says it the way the thing wants («dwie»)
 *   {a+b}            the first two added
 *   {A} {B} {C}      the number with the thing of the skin: «5 apples»
 *   {Au} {Bu}        the same with the skin's second thing
 *   {T}              twice the first number, with the thing
 *   {$a} {$b} {$c}   the number as money: «12 dollars»
 *   {many} {Many}    the thing, many of it: «apples» («jabłek» in Polish)
 *   {coins}          the money, many of it
 *   {Ile}            «how many» as the thing wants it (Polish «Ile» / «Ilu»)
 *   {N}              the hero's name
 *   {h?he|she}       one of two by the hero
 *   {a?are|is}       one of two by a number: the first when the thing takes a
 *                    plural verb after it ({b?…}, {c?…}; {t?…} for twice the first)
 *   {anything else}  a word the frame hands over (`extra`), or one of the hero's
 */

export interface StoryItem {
  /** English: one, many. Polish: one, a few (2–4), many (5 and more). */
  forms: readonly string[];
  /** Polish men: «5 pasażerów jechało» — counted and told in their own way. */
  virile?: boolean;
}

export interface Grammar {
  count(n: number, item: StoryItem): string;
  /** Does the thing, counted `n`, take a plural verb? */
  plural(n: number, item: StoryItem): boolean;
  many(item: StoryItem): string;
  howMany(item: StoryItem): string;
  cap(text: string): string;
  /** A number that counts the thing without naming it; a plain digit when a language has no need. */
  bare?(n: number, item: StoryItem): string;
  names: { boys: readonly string[]; girls: readonly string[] };
  /** Words about the hero: `[for a boy, for a girl]`. */
  heroWords: Record<string, readonly [string, string]>;
}

export interface Holes {
  n: number[];
  t?: StoryItem;
  u?: StoryItem;
  hero?: StoryHero;
  coin: StoryItem;
  extra?: Record<string, string>;
}

const NOTHING: StoryItem = { forms: ['', '', ''] };

export function filler(g: Grammar) {
  const one = (key: string, h: Holes): string | undefined => {
    const t = h.t ?? NOTHING;
    const at = (letter: string) => h.n['abc'.indexOf(letter.toLowerCase())];
    const choice = /^([abcth])\?([^|]*)\|(.*)$/.exec(key);
    if (choice) {
      const [, by, first, second] = choice;
      if (by === 'h') return h.hero?.boy === false ? second : first;
      return g.plural(by === 't' ? h.n[0] * 2 : at(by), t) ? first : second;
    }
    if (/^[abc]$/.test(key)) return String(at(key));
    if (/^[abc]~$/.test(key)) return g.bare ? g.bare(at(key[0]), t) : String(at(key[0]));
    if (key === 'a+b') return String(h.n[0] + h.n[1]);
    if (/^[ABC]$/.test(key)) return g.count(at(key), t);
    if (/^[ABC]u$/.test(key)) return g.count(at(key[0]), h.u ?? NOTHING);
    if (key === 'T') return g.count(h.n[0] * 2, t);
    if (/^\$[abc]$/.test(key)) return g.count(at(key[1]), h.coin);
    if (key === 'many') return g.many(t);
    if (key === 'Many') return g.cap(g.many(t));
    if (key === 'coins') return g.many(h.coin);
    if (key === 'Ile') return g.howMany(t);
    if (key === 'N') return h.hero ? (h.hero.boy ? g.names.boys : g.names.girls)[h.hero.name] : '';
    if (h.extra && key in h.extra) return h.extra[key];
    if (key in g.heroWords) return g.heroWords[key][h.hero?.boy === false ? 1 : 0];
    return undefined;
  };
  /** A handed-over word may have holes of its own, so the line is gone over until it is whole. */
  return (line: string, h: Holes): string => {
    let out = line;
    // Innermost holes first: «{a?{verbs}}» is first given its two verbs, then picks one of them.
    for (let pass = 0; pass < 4 && out.includes('{'); pass += 1) out = out.replace(/\{([^{}]+)\}/g, (hole, key: string) => one(key, h) ?? hole);
    return out;
  };
}
