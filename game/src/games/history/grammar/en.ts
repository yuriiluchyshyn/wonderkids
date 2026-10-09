import { UA_FIGURES, WORLD_FIGURES } from '@/games/history/content/data';
import { PL_FIGURES } from '@/games/history/content/poland';
import type { HistoryTexts } from '@/games/history/grammar/types';
import { fill } from '@/core/language/fill';
import J from '@/locales/app/en/games/history.json';
const EARLIER: string[] = J.data.time.EARLIER;
const EPOCHS: Record<string, string> = J.data.time.EPOCHS;
const ITEMS: string[] = J.data.time.ITEMS;
const SEQUENCES: string[] = J.data.time.SEQUENCES;
const WHEN: string[] = J.data.time.WHEN;
const DINOSAURS: Record<string, string> = J.data.people.DINOSAURS;
const INVENTIONS: Record<string, string> = J.data.people.INVENTIONS;
const PEOPLE: Record<string, string> = J.data.people.PEOPLE;

/** The History galaxy in English. */

const many = new Set([...WORLD_FIGURES, ...UA_FIGURES, ...PL_FIGURES].filter((p) => p.who === 'they').map((p) => p.id));
/** «the Wright brothers» inside a sentence: only a real name keeps its capital. */
const inSentence = (name: string) => name.replace(/^The /, J.inSentence);
const dino = (id: string) => DINOSAURS[id].split('|');

export const en: HistoryTexts = {
  cards: J.cards,
  dino: {
    meat: J.dino.meat,
    plants: J.dino.plants,
    no: J.dino.no,
    name: (id) => dino(id)[0],
    feature: (id) => dino(id)[1],
    ask: (id) => fill(J.dino.ask, { id: dino(id)[0] }),
    hint: (id, eats) =>
      eats === 'meat'
        ? fill(J.dino.hint[1], { id: dino(id)[0] })
        : fill(J.dino.hint[2], { id: dino(id)[0] }),
    who: (id) => fill(J.dino.who, { id: dino(id)[1] }),
    whoHint: (id, eats) => fill(J.dino.whoHint[1], { eats: eats === 'meat' ? J.dino.whoHint[2] : J.dino.whoHint[3], id: dino(id)[0][0] }),
    yes: (id) => fill(J.dino.yes, { id: dino(id)[0], id2: dino(id)[1] }),
  },
  time: {
    sequence: (at) => {
      const [topic, ...rest] = SEQUENCES[at].split('|');
      return { ask: fill(J.time.sequence.ask, { topic }), labels: rest.slice(0, -1), story: rest[rest.length - 1] };
    },
    sequenceHint: J.time.sequenceHint,
    earlierAsk: J.time.earlierAsk,
    earlier: (at) => {
      const [first, later, story] = EARLIER[at].split('|');
      return { first, later, hint: fill(J.time.earlier.hint[1], { first: first.replace(/^The /, J.time.earlier.hint[2]) }), story };
    },
    epoch: (id) => {
      const [name, no] = EPOCHS[id].split('|');
      return { name, no };
    },
    item: (at, epoch) => {
      const [label, story] = ITEMS[at].split('|');
      return { label, ask: fill(J.time.item.ask, { label }), hint: fill(J.time.item.hint[1], { epoch: EPOCHS[epoch].split('|')[0].replace(/^Our time$/, J.time.item.hint[2]), story }), story };
    },
    when: (at) => {
      const [question, right, a, b, story] = WHEN[at].split('|');
      return { question, right, wrong: [a, b], story };
    },
  },
  person: (id) => {
    const [name, symbol, fact, who] = PEOPLE[id].split('|');
    return {
      name,
      symbol,
      fact,
      ask: fill(J.person.ask[1], { many: many.has(id) ? J.person.ask[2] : J.person.ask[3], name: inSentence(name) }),
      who,
      hint: fill(J.person.hint, { name: name.replace(/^The /, '')[0] }),
    };
  },
  connectAsk: J.connectAsk,
  invention: (id) => {
    const [name, by, fact, ask] = INVENTIONS[id].split('|');
    return { name, by, fact, ask, what: fill(J.invention.what, { by: inSentence(by) }) };
  },
};
