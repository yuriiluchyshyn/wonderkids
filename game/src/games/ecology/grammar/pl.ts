import type { Bin, EcologyTexts, Lines, Rows } from '@/games/ecology/grammar/types';
import { whyOf } from '@/games/ecology/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/pl/games/ecology.json';

const LINES: Lines = J.data.why.LINES;
const ROWS = J.data.why.ROWS as unknown as Rows;

/** The Ecology galaxy in Polish. */

const BINS: Record<Bin, { name: string; no: string; clue: string }> = J.BINS;

/**
 * The first things, each with a clue of its own. A name that ends in «*» is
 * plural: the question then asks «dokąd trafią», not «dokąd trafi».
 */
const RUBBISH: Record<string, [name: string, clue: string]> = {
  bottle: [J.RUBBISH.bottle[0], J.RUBBISH.bottle[1]],
  newspaper: [J.RUBBISH.newspaper[0], J.RUBBISH.newspaper[1]],
  cup: [J.RUBBISH.cup[0], J.RUBBISH.cup[1]],
  box: [J.RUBBISH.box[0], J.RUBBISH.box[1]],
  jar: [J.RUBBISH.jar[0], J.RUBBISH.jar[1]],
  shampoo: [J.RUBBISH.shampoo[0], J.RUBBISH.shampoo[1]],
  envelope: [J.RUBBISH.envelope[0], J.RUBBISH.envelope[1]],
  glass: [J.RUBBISH.glass[0], J.RUBBISH.glass[1]],
  bag: [J.RUBBISH.bag[0], J.RUBBISH.bag[1]],
  notebook: [J.RUBBISH.notebook[0], J.RUBBISH.notebook[1]],
  toothbrush: [J.RUBBISH.toothbrush[0], J.RUBBISH.toothbrush[1]],
  perfume: [J.RUBBISH.perfume[0], J.RUBBISH.perfume[1]],
  books: [J.RUBBISH.books[0], J.RUBBISH.books[1]],
  bucket: [J.RUBBISH.bucket[0], J.RUBBISH.bucket[1]],
  honey_jar: [J.RUBBISH.honey_jar[0], J.RUBBISH.honey_jar[1]],
  shoe_box: [J.RUBBISH.shoe_box[0], J.RUBBISH.shoe_box[1]],
  soap_bottle: [J.RUBBISH.soap_bottle[0], J.RUBBISH.soap_bottle[1]],
  lemonade: [J.RUBBISH.lemonade[0], J.RUBBISH.lemonade[1]],
  towel_roll: [J.RUBBISH.towel_roll[0], J.RUBBISH.towel_roll[1]],
  container: [J.RUBBISH.container[0], J.RUBBISH.container[1]],
  pickle_jar: [J.RUBBISH.pickle_jar[0], J.RUBBISH.pickle_jar[1]],
  postcard: [J.RUBBISH.postcard[0], J.RUBBISH.postcard[1]],
  duck: [J.RUBBISH.duck[0], J.RUBBISH.duck[1]],
  jam_jar: [J.RUBBISH.jam_jar[0], J.RUBBISH.jam_jar[1]],
  egg_tray: [J.RUBBISH.egg_tray[0], J.RUBBISH.egg_tray[1]],
  straw: [J.RUBBISH.straw[0], J.RUBBISH.straw[1]],
  oil_bottle: [J.RUBBISH.oil_bottle[0], J.RUBBISH.oil_bottle[1]],
  calendar: [J.RUBBISH.calendar[0], J.RUBBISH.calendar[1]],
  cap: [J.RUBBISH.cap[0], J.RUBBISH.cap[1]],
};

/** The rest, by bin, in the order of `content/rubbish.ts`. */
const MORE: Record<Bin, string[]> = J.MORE;

const FACTS: Record<Bin, string[]> = J.FACTS;

const entry = (id: string): { name: string; clue?: string } => {
  if (RUBBISH[id]) return { name: RUBBISH[id][0], clue: RUBBISH[id][1] };
  const [, bin, at] = /^([a-z]+)_(\d+)$/.exec(id) ?? [];
  return { name: MORE[bin as Bin]?.[Number(at)] ?? id };
};
const rubbish = (id: string) => ({ ...entry(id), name: entry(id).name.replace(/\*$/, '') });
const cap = (text: string) => text[0].toLocaleUpperCase('pl') + text.slice(1);

export const pl: EcologyTexts = {
  cards: J.cards,
  bin: (id) => BINS[id],
  retry: J.retry,
  rubbish,
  // The thing is the subject, so it stays in the nominative; only the verb answers to its number.
  ask: (id) => fill(J.ask[1], { id: entry(id).name.endsWith('*') ? J.ask[2] : J.ask[3], name: rubbish(id).name }),
  yes: (id, bin) => fill(J.yes, { id: cap(rubbish(id).name), name: BINS[bin].name }),
  facts: (bin) => FACTS[bin],
  why: whyOf(ROWS, LINES),
};
