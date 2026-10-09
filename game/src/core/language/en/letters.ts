/**
 * The names of the English letters, spelt the way they sound. A lone letter
 * handed to a speech engine is a gamble: «A» comes out as the article, «I» as
 * the pronoun — «ay» and «eye» cannot be misread.
 */
const LETTER_NAMES: Record<string, string> = {
  a: 'ay', b: 'bee', c: 'see', d: 'dee', e: 'ee', f: 'eff', g: 'jee', h: 'aitch', i: 'eye', j: 'jay', k: 'kay', l: 'el', m: 'em',
  n: 'en', o: 'oh', p: 'pee', q: 'cue', r: 'ar', s: 'ess', t: 'tee', u: 'you', v: 'vee', w: 'double-you', x: 'ex', y: 'why', z: 'zee',
};

export const letterName = (letter: string): string => LETTER_NAMES[letter.toLowerCase()] ?? letter;
