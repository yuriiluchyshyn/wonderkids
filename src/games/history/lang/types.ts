import type { ModuleTexts } from '@/core/game/kernel/types';

type Diet = 'meat' | 'plants';

/**
 * Everything the History galaxy says, in one language. People, inventions and
 * dinosaurs are named by their id, the cards of the time machine by their
 * place in `content/timeMachine.ts`.
 */
export interface HistoryTexts {
  cards?: ModuleTexts;
  dino: {
    meat: string;
    plants: string;
    /** What the wrong bowl answers. */
    no: Record<Diet, string>;
    name(id: string): string;
    feature(id: string): string;
    ask(id: string): string;
    hint(id: string, eats: Diet): string;
    who(id: string): string;
    whoHint(id: string, eats: Diet): string;
    yes(id: string): string;
  };
  time: {
    sequence(at: number): { ask: string; labels: string[]; story: string };
    sequenceHint: string;
    earlierAsk: string;
    earlier(at: number): { first: string; later: string; hint: string; story: string };
    epoch(id: string): { name: string; no: string };
    item(at: number, epoch: string): { label: string; ask: string; hint: string; story: string };
    when(at: number): { question: string; right: string; wrong: [string, string]; story: string };
  };
  /** A person: the name, what they are known for, a story, and the two questions about them. */
  person(id: string): { name: string; symbol: string; fact: string; ask: string; who: string; hint: string };
  connectAsk: string;
  /** An invention: its name, who made it, a story, and the two questions about it. */
  invention(id: string): { name: string; by: string; fact: string; ask: string; what: string };
}
