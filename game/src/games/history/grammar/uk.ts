import { accusative, conjugate, inflect, lowerFirst, noun, verb } from '@/core/language/uk';
import { UA_FIGURES, UA_INVENTIONS, WHO_ASK, WORLD_FIGURES, WORLD_INVENTIONS, type Achiever, type Invention } from '@/games/history/content/data';
import { DINOSAURS } from '@/games/history/content/dinosaurs';
import { PL_FIGURES, PL_INVENTIONS, PL_WHO_ASK } from '@/games/history/content/poland';
import { EARLIER, EPOCHS, EPOCH_ITEMS, SEQUENCES, WHEN } from '@/games/history/content/timeMachine';
import type { HistoryTexts } from '@/games/history/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/uk/games/history.json';

/** The History galaxy in Ukrainian: the words of `content/`, put into sentences. */

const FAMOUS = verb(J.FAMOUS._, [J.FAMOUS[0], J.FAMOUS[1]], { perfective: true });
const CREATE = verb(J.CREATE._, [J.CREATE[0], J.CREATE[1]], { perfective: true });
const HE = noun(J.HE, 'm', { animate: true });
const SHE = noun(J.SHE, 'f', { animate: true });
const THEY = noun(J.THEY, 'm', { animate: true, number: 'pl' });
const becameFamous = (who?: 'she' | 'they') => conjugate(FAMOUS, 'past', who === 'she' ? SHE : who === 'they' ? THEY : HE);
/** «брати Райт» inside a sentence: only a real name keeps its capital. */
const inSentence = (name: string) => (/^(Брати|Конструктори) /.test(name) ? lowerFirst(name) : name);
const created = (by: string) => conjugate(CREATE, 'past', / і |^Брати |^Конструктори /.test(by) ? THEY : HE);

const dino = new Map(DINOSAURS.map((d) => [d.id, d]));
const people = new Map<string, Achiever>([...WORLD_FIGURES, ...UA_FIGURES, ...PL_FIGURES].map((p) => [p.id, p]));
const inventions = new Map<string, Invention>([...WORLD_INVENTIONS, ...UA_INVENTIONS, ...PL_INVENTIONS].map((i) => [i.id, i]));
const epoch = new Map<string, (typeof EPOCHS)[number]>(EPOCHS.map((e) => [e.id, e]));
const asks: Record<string, string> = { ...WHO_ASK, ...PL_WHO_ASK };

export const uk: HistoryTexts = {
  dino: {
    meat: J.dino.meat,
    plants: J.dino.plants,
    no: J.dino.no,
    name: (id) => dino.get(id)!.name,
    feature: (id) => dino.get(id)!.feature,
    ask: (id) => fill(J.dino.ask, { dino: inflect(noun(lowerFirst(dino.get(id)!.name), 'm', { animate: true }), 'acc') }),
    hint: (id, eats) =>
      eats === 'meat'
        ? fill(J.dino.hint[1], { name: dino.get(id)!.name })
        : fill(J.dino.hint[2], { name: dino.get(id)!.name }),
    who: (id) => fill(J.dino.who, { feature: dino.get(id)!.feature }),
    whoHint: (id, eats) => fill(J.dino.whoHint[1], { eats: eats === 'meat' ? J.dino.whoHint[2] : J.dino.whoHint[3], dino: dino.get(id)!.name[0] }),
    yes: (id) => fill(J.dino.yes, { name: dino.get(id)!.name, feature: dino.get(id)!.feature }),
  },
  time: {
    sequence: (at) => {
      const [topic, cards, story] = SEQUENCES[at];
      return { ask: fill(J.time.sequence.ask, { topic }), labels: cards.map(([, label]) => label), story };
    },
    sequenceHint: J.time.sequenceHint,
    earlierAsk: J.time.earlierAsk,
    earlier: (at) => {
      const [, first, , later, story] = EARLIER[at];
      return { first, later, hint: fill(J.time.earlier.hint, { first }), story };
    },
    epoch: (id) => ({ name: epoch.get(id)!.name, no: epoch.get(id)!.no }),
    item: (at, id) => {
      const [, label, , story] = EPOCH_ITEMS[at];
      return { label, ask: fill(J.time.item.ask, { label }), hint: fill(J.time.item.hint, { name: epoch.get(id)?.name ?? '', story }), story };
    },
    when: (at) => {
      const [question, , right, wrongA, wrongB, story] = WHEN[at];
      return { question, right, wrong: [wrongA, wrongB], story };
    },
  },
  person: (id) => {
    const p = people.get(id)!;
    return {
      name: p.name,
      symbol: p.symbolName,
      fact: p.fact,
      ask: fill(J.person.ask, { p: becameFamous(p.who), p2: inSentence(p.name) }),
      who: asks[id] ?? fill(J.person.who, { symbolName: p.symbolName }),
      hint: fill(J.person.hint, { p: p.name[0] }),
    };
  },
  connectAsk: J.connectAsk,
  invention: (id) => {
    const inv = inventions.get(id)!;
    return {
      name: inv.name,
      by: inv.by,
      fact: inv.fact,
      ask: inv.ask ?? fill(J.invention.ask, { inv: accusative(lowerFirst(inv.name)) }),
      what: fill(J.invention.what, { inv: created(inv.by), inv2: inSentence(inv.by) }),
    };
  },
};
