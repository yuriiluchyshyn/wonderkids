/**
 * The names of the Polish letters, as they are called aloud: «be», «eł»,
 * «żet». A lone letter handed to a speech engine is read unpredictably — and
 * «W», «Z», «O», «U», «I», «A» are words of their own.
 */
const LETTER_NAMES: Record<string, string> = {
  a: 'a', ą: 'ą', b: 'be', c: 'ce', ć: 'cie', d: 'de', e: 'e', ę: 'ę', f: 'ef', g: 'gie', h: 'ha', i: 'i', j: 'jot', k: 'ka', l: 'el', ł: 'eł',
  m: 'em', n: 'en', ń: 'eń', o: 'o', ó: 'o z kreską', p: 'pe', q: 'ku', r: 'er', s: 'es', ś: 'eś', t: 'te', u: 'u', v: 'fał', w: 'wu',
  x: 'iks', y: 'igrek', z: 'zet', ź: 'ziet', ż: 'żet',
};

export const letterName = (letter: string): string => LETTER_NAMES[letter.toLocaleLowerCase('pl')] ?? letter;
