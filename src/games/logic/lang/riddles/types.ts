/**
 * The words of «Логічні задачі» in one language.
 *
 * A riddle is drawn once (`content/riddles.ts`): which skin, which names, which
 * numbers, in what order. Here it is only TOLD — so the same draw can be told
 * in the language on the screen and in the voice's, and stay one riddle.
 * Nothing in this file may roll dice or decide what the riddle is.
 *
 * Things, names, colours and days are passed as their place in the skin's own
 * list; a skin is its place in the list of its family.
 */

/** The rule of a row of numbers. */
export type Rule = { kind: 'add' | 'sub'; by: number } | { kind: 'alt'; by: number; then: number } | { kind: 'double' | 'triple' | 'half' | 'grow' | 'shrink' | 'two' };

export interface Told {
  text: string;
  how: string;
}

/** The small words written on a clue under a number or a face. */
export type NoteKey = 'mark' | 'sister' | 'brother' | 'olia' | 'now' | 'later' | 'then' | 'son' | 'mum' | 'olderSister' | 'thought' | 'tens' | 'ones';

export interface RiddleWords {
  cap(text: string): string;
  boys: readonly string[];
  girls: readonly string[];
  note: Record<NoteKey, string>;

  /** One of several things is hidden; all but one are ruled out. */
  oneOf(skin: number): { things: string[]; tell(set: number[], out: number[]): Told };
  /** Three in a row: who is in the middle (0), on the left (1), on the right (2). */
  row(skin: number): { names: string[]; ends: [string, string]; tell(left: number, middle: number, right: number, asked: 0 | 1 | 2, leftFirst: boolean): Told };
  /** «Тарас вищий за Марка, а Марко…» — `order` is the order the links are told in. */
  chain(skin: number, girls: boolean): { tell(row: number[], order: number[], low: boolean): Told };
  next(row: number[], rule: Rule): Told;
  queue(skin: number): { ends: [string, string]; tell(ahead: number, behind: number): Told };
  legs(skin: number): { labels: [string, string]; tell(a: number, b: number): Told };
  /** `ask` is which of the ten questions about days it is; `given` — the day that is named. */
  days: { names: string[]; short: string[]; tell(ask: number, given: number): Told; note(ask: number): string };
  cuts(skin: number): { tell(n: number): Told };
  repeats(skin: number): { colours: string[]; tell(unit: number[], place: number): Told };
  race(skin: number): { ends: [string, string]; tell(first: number, second: number, third: number, last: boolean, told: 0 | 1 | 2): Told };
  more(skin: number): { names: [string, string, string]; tell(c: number, b: number, a: number, fewer: boolean): Told };
  family(at: number, n: number[]): Told;
  ages(at: number, n: number[]): Told;
  hidden(at: number, n: number[]): Told;
  owners(skin: number): { things: string[]; tell(kids: number[], has: number[], hard: boolean): Told };
  meetings(skin: number): { tell(n: number): Told };
}
