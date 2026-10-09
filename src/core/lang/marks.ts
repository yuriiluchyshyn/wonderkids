/**
 * One string, two readings. A text shows «2 машинки», but a speech engine
 * handed the digit guesses the gender and the case — and says «два машинки».
 * So a text that will be read aloud marks such a piece with `say`: the same
 * string then gives the written form (`written`) and the spoken one
 * (`spoken`). The marks are the same in every language; each language builds
 * its own `num` on top of `say` (`uk/numbers.ts`, `en/numbers.ts`, …).
 *
 * Deliberately free of React and of `@/` imports so it runs under `node --test`.
 */
const OPEN = '⟦';
const CLOSE = '⟧';
const TOKEN = /⟦([^|⟧]*)\|([^⟧]*)⟧/g;
/**
 * A piece of a text that belongs to its language alone (`own`): the highest
 * mountain of Ukraine in Ukrainian, of Poland in Polish. It is not a
 * translation of anything in the other languages, so it is never paired with
 * them: when the voice speaks another language than the screen, an own piece
 * is left out of both (`common`), and a task whose prompt has one has no twin
 * at all — it is read in its own language.
 */
const OWN_OPEN = '⟪';
const OWN_CLOSE = '⟫';
const OWN_MARKS = /[⟪⟫]/g;
const OWN_PIECE = /⟪[^⟫]*⟫/g;
/** A piece of text that is written one way and said another: `say('7:00', 'сьома година')`. */
export const say = (shown: string | number, said: string): string => `${OPEN}${shown}|${said}${CLOSE}`;
/** The text as it is printed. */
export const written = (text: string): string => text.replace(TOKEN, '$1').replace(OWN_MARKS, '');
/** The text as the voice reads it. */
export const spoken = (text: string): string => text.replace(TOKEN, '$2').replace(OWN_MARKS, '');
/**
 * Marks a text — a whole fact, or a sentence of one — as this language's own
 * story rather than a translation: `own('Найвища гора України — Говерла.')`,
 * or `'Зубр живе в старих лісах Європи.' + own(' Є він і в Україні.')`.
 * The same place in every language's list holds that language's own story.
 */
export const own = (text: string): string => `${OWN_OPEN}${text}${OWN_CLOSE}`;
/** True when a text has a piece of its own language in it. */
export const hasOwn = (text: string): boolean => text.includes(OWN_OPEN);
/**
 * What a text says in every language: the text without its own pieces
 * ('' when the whole text is one). The marks of `say` are kept.
 */
export const common = (text: string): string =>
  hasOwn(text) ? text.replace(OWN_PIECE, '').replace(/ {2,}/g, ' ').trim() : text;
