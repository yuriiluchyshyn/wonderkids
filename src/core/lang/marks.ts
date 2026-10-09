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

const OPEN = '⁣⟦';
const CLOSE = '⟧⁣';
const TOKEN = /⁣⟦([^|⟧]*)\|([^⟧]*)⟧⁣/g;

/** A piece of text that is written one way and said another: `say('7:00', 'сьома година')`. */
export const say = (shown: string | number, said: string): string => `${OPEN}${shown}|${said}${CLOSE}`;

/** The text as it is printed. */
export const written = (text: string): string => text.replace(TOKEN, '$1');
/** The text as the voice reads it. */
export const spoken = (text: string): string => text.replace(TOKEN, '$2');
