import { accusative } from '@/core/language/uk';
import { RECYCLING_FACTS } from '@/games/ecology/content/facts';
import { ECO_QUESTIONS } from '@/games/ecology/content/questions';
import { BINS, CLUE, MORE_RUBBISH, RUBBISH } from '@/games/ecology/content/rubbish';
import type { EcologyTexts } from '@/games/ecology/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/uk/games/ecology.json';

/**
 * The Ecology galaxy in Ukrainian — its original sentences, word for word,
 * from the words written with the content itself (`content/`).
 */

const bins = new Map(BINS.map((b) => [b.id as string, b]));
const rubbish = new Map<string, { name: string; clue?: string }>([...RUBBISH, ...MORE_RUBBISH].map((r) => [r.id, r]));
const questions = new Map(ECO_QUESTIONS.map((q) => [q.id, q]));
const nameOf = (id: string) => rubbish.get(id)?.name ?? '';

export const uk: EcologyTexts = {
  bin: (id) => ({ name: bins.get(id)?.name ?? '', no: bins.get(id)?.no ?? '', clue: CLUE[id] }),
  retry: J.retry,
  rubbish: (id) => ({ name: nameOf(id), clue: rubbish.get(id)?.clue }),
  ask: (id) => fill(J.ask, { id: accusative(nameOf(id)) }),
  yes: (id, bin) => fill(J.yes, { id: nameOf(id)[0].toUpperCase(), id2: nameOf(id).slice(1), name: bins.get(bin)?.name ?? '' }),
  facts: (bin) => RECYCLING_FACTS[bin],
  why: (id) => {
    const q = questions.get(id);
    return { question: q?.question ?? '', right: q?.right ?? '', wrong: q?.wrong ?? [], why: q?.why ?? '' };
  },
};
