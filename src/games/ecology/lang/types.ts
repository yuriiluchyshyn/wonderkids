import type { ModuleTexts } from '@/core/game/kernel/types';

export type Bin = 'glass' | 'paper' | 'plastic' | 'metal' | 'organic';

/**
 * Everything the Ecology galaxy says, in one language. A piece of rubbish and
 * a question of «Чому так?» are named by their id (`content/`).
 */
export interface EcologyTexts {
  cards?: ModuleTexts;
  /** A bin: its name, what it answers to a wrong thing, and how to tell what belongs in it. */
  bin(id: Bin): { name: string; no: string; clue: string };
  /** Said after a bin's «no»: «Спробуй інший бак!» */
  retry: string;
  /** A piece of rubbish: its name on the card, and — for the first ones — a clue of its own. */
  rubbish(id: string): { name: string; clue?: string };
  /** «Куди викинути скляну пляшку?» */
  ask(id: string): string;
  /** «Так! Скляна пляшка — у бак «Скло».» */
  yes(id: string, bin: Bin): string;
  /** The stories of a bin, dealt out one to a thing. */
  facts(bin: Bin): readonly string[];
  /** A question of «Чому так?»: the wrong answers are there for the first forty-two only. */
  why(id: string): { question: string; right: string; wrong: readonly string[]; why: string };
}

/** `question|right|why`, one a line — the way the questions are written (`content/questionsMore.ts`). */
export type Lines = Record<'waste' | 'air' | 'water' | 'climate' | 'wildlife' | 'energy', string>;
/** The seven hand-made questions of a topic: question, right, two wrong, why. */
export type Rows = Record<keyof Lines, [question: string, right: string, wrongA: string, wrongB: string, why: string][]>;

/** Finds a question's words by its id: `waste3` — hand-made, `wastem12` — one of the lines. */
export function whyOf(rows: Rows, lines: Lines) {
  const more = Object.fromEntries(Object.entries(lines).map(([topic, text]) => [topic, text.trim().split('\n').map((line) => line.split('|'))])) as Record<keyof Lines, string[][]>;
  return (id: string): { question: string; right: string; wrong: readonly string[]; why: string } => {
    const [, topic, extra, at] = /^([a-z]+?)(m?)(\d+)$/.exec(id) ?? [];
    const key = topic as keyof Lines;
    if (extra) {
      const [question = '', right = '', why = ''] = more[key]?.[Number(at)] ?? [];
      return { question, right, wrong: [], why };
    }
    const [question = '', right = '', wrongA = '', wrongB = '', why = ''] = rows[key]?.[Number(at)] ?? [];
    return { question, right, wrong: [wrongA, wrongB], why };
  };
}
