import { UA_FIGURES, WORLD_FIGURES } from '../content/data';
import { PL_FIGURES } from '../content/poland';
import { DINOSAURS, INVENTIONS, PEOPLE } from './people.en';
import { EARLIER, EPOCHS, ITEMS, SEQUENCES, WHEN } from './time.en';
import type { HistoryTexts } from './types';

/** The History galaxy in English. */

const many = new Set([...WORLD_FIGURES, ...UA_FIGURES, ...PL_FIGURES].filter((p) => p.who === 'they').map((p) => p.id));
/** «the Wright brothers» inside a sentence: only a real name keeps its capital. */
const inSentence = (name: string) => name.replace(/^The /, 'the ');
const dino = (id: string) => DINOSAURS[id].split('|');

export const en: HistoryTexts = {
  cards: {
    title: 'History',
    games: {
      dinosaurs: {
        label: 'Dinosaurs',
        blurb: 'Fifty dinosaurs: what to feed them and how to tell them apart',
        intro: 'Meet the dinosaurs! Feed each one what it ate — meat or plants — and know a dinosaur by its special mark.',
      },
      epochs: {
        label: 'Time Machine',
        blurb: 'Surprise tasks about time: what came earlier and what came later',
        intro: 'Let’s climb into the time machine! Every time it brings new tasks: put events in order, guess what appeared earlier, and find out when it was. After every task there is a short story.',
      },
      world_figures: {
        label: 'Great People of the World',
        blurb: 'Who is famous for what',
        intro: 'Meet the people who changed the world: scientists, artists and explorers. On every step there are new people, and the ones you know come back so that you don’t forget them.',
      },
      ua_figures: {
        label: 'Great People of Ukraine',
        blurb: 'Ukrainians to be proud of',
        intro: 'Ukraine has many great people: poets, princes, scientists and astronauts. Find out what they are famous for!',
      },
      inventions: {
        label: 'Great Inventions of the World',
        blurb: 'Who invented what',
        intro: 'The light bulb, the telephone, the airplane — someone once thought up each of them for the very first time. Find the inventor!',
      },
      ua_inventions: {
        label: 'Great Inventions of Ukraine',
        blurb: 'What Ukrainians gave the world',
        intro: 'The helicopter, the kerosene lamp, the biggest airplane in the world — all of these were thought up in Ukraine. Meet these inventions!',
      },
      pl_figures: {
        label: 'Great People of Poland',
        blurb: 'Kings, scientists and artists of Poland',
        intro: 'Poland has many great people: kings and knights, scientists, poets and musicians. Find out what they are famous for!',
      },
      pl_inventions: {
        label: 'Great Inventions of Poland',
        blurb: 'What Poles gave the world',
        intro: 'The kerosene lamp, vitamins, the walkie-talkie, the Moon rover — Poles thought up all of these. Find the inventor!',
      },
    },
  },
  dino: {
    meat: 'Meat',
    plants: 'Plants',
    no: { meat: 'Yuck, I don’t eat that!', plants: 'Grrr, I’d like something more filling!' },
    name: (id) => dino(id)[0],
    feature: (id) => dino(id)[1],
    ask: (id) => `What shall we feed ${dino(id)[0]}?`,
    hint: (id, eats) =>
      eats === 'meat'
        ? `${dino(id)[0]} is a meat-eater. Meat-eaters have teeth as sharp as knives: they eat meat with them.`
        : `${dino(id)[0]} is a plant-eater. Plant-eaters have flat teeth: they grind leaves with them.`,
    who: (id) => `Who is it? ${dino(id)[1]}`,
    whoHint: (id, eats) => `It is a ${eats === 'meat' ? 'meat-eater' : 'plant-eating dinosaur'}. Its name begins with the letter “${dino(id)[0][0]}.”`,
    yes: (id) => `It is ${dino(id)[0]}. ${dino(id)[1]}`,
  },
  time: {
    sequence: (at) => {
      const [topic, ...rest] = SEQUENCES[at].split('|');
      return { ask: `Put these in order: the earliest in place 1, the latest in the last place. ${topic}`, labels: rest.slice(0, -1), story: rest[rest.length - 1] };
    },
    sequenceHint: 'Find the oldest card and put it in place 1. To swap two cards, tap one and then the other. The ones that are already in the right place have a green border.',
    earlierAsk: 'Which appeared earlier?',
    earlier: (at) => {
      const [first, later, story] = EARLIER[at].split('|');
      return { first, later, hint: `Think which one people went without for longer. This one is older: ${first.replace(/^The /, 'the ')}.`, story };
    },
    epoch: (id) => {
      const [name, no] = EPOCHS[id].split('|');
      return { name, no };
    },
    item: (at, epoch) => {
      const [label, story] = ITEMS[at].split('|');
      return { label, ask: `${label} — when was that?`, hint: `It is the ${EPOCHS[epoch].split('|')[0].replace(/^Our time$/, 'time we live in')}. ${story}`, story };
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
      ask: `What ${many.has(id) ? 'are' : 'is'} ${inSentence(name)} famous for?`,
      who,
      hint: `This person’s name begins with the letter “${name.replace(/^The /, '')[0]}.”`,
    };
  },
  connectAsk: 'Match each person with what made them famous',
  invention: (id) => {
    const [name, by, fact, ask] = INVENTIONS[id].split('|');
    return { name, by, fact, ask, what: `What did ${inSentence(by)} create?` };
  },
};
