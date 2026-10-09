import { UA_FIGURES, WORLD_FIGURES } from '../content/data';
import { PL_FIGURES } from '../content/poland';
import { DINOSAURS, INVENTIONS, PEOPLE } from './people.pl';
import { EARLIER, EPOCHS, ITEMS, SEQUENCES, WHEN } from './time.pl';
import type { HistoryTexts } from './types';

/** The History galaxy in Polish. */

const whoOf = Object.fromEntries([...WORLD_FIGURES, ...UA_FIGURES, ...PL_FIGURES].map((p) => [p.id, p.who]));
/** «bracia Wright» inside a sentence: only a real name keeps its capital. */
const inSentence = (name: string) => name.replace(/^(Bracia|Konstruktorzy) /, (word) => word.toLowerCase());
const dino = (id: string) => DINOSAURS[id].split('|');
/** «nakarmić tyranozaura», «nakarmić majazaurę» */
const fed = (name: string) => (name.endsWith('a') ? `${name.slice(0, -1)}ę` : `${name}a`).toLowerCase();
const famous = (id: string) => (whoOf[id] === 'she' ? 'zasłynęła' : whoOf[id] === 'they' ? 'zasłynęli' : 'zasłynął');

export const pl: HistoryTexts = {
  cards: {
    title: 'Historia',
    games: {
      dinosaurs: {
        label: 'Dinozaury',
        blurb: 'Pięćdziesiąt dinozaurów: czym je karmić i jak je rozpoznać',
        intro: 'Poznaj dinozaury! Nakarm każdego tym, co jadł — mięsem albo roślinami — i rozpoznaj dinozaura po jego znaku szczególnym.',
      },
      epochs: {
        label: 'Wehikuł czasu',
        blurb: 'Losowe zadania o czasie: co było wcześniej, a co później',
        intro: 'Wsiadamy do wehikułu czasu! Za każdym razem przywozi nowe zadania: ustaw wydarzenia po kolei, zgadnij, co pojawiło się wcześniej, i dowiedz się, kiedy to było. Po każdym zadaniu czeka krótka opowieść.',
      },
      world_figures: {
        label: 'Wybitne postaci świata',
        blurb: 'Kto z czego zasłynął',
        intro: 'Poznaj ludzi, którzy zmienili świat: uczonych, artystów i podróżników. Na każdym stopniu czekają nowe postaci, a znajome wracają, żeby nie wyleciały ci z głowy.',
      },
      ua_figures: {
        label: 'Wybitne postaci Ukrainy',
        blurb: 'Ukraińcy, z których można być dumnym',
        intro: 'Ukraina ma wielu wybitnych ludzi: poetów, książąt, uczonych i kosmonautów. Dowiedz się, z czego zasłynęli!',
      },
      inventions: {
        label: 'Wielkie wynalazki świata',
        blurb: 'Kto co wynalazł',
        intro: 'Żarówka, telefon, samolot — wszystko to ktoś kiedyś wymyślił po raz pierwszy. Znajdź wynalazcę!',
      },
      ua_inventions: {
        label: 'Wielkie wynalazki Ukrainy',
        blurb: 'Co Ukraińcy podarowali światu',
        intro: 'Śmigłowiec, lampa naftowa, największy samolot świata — to wszystko wymyślono w Ukrainie. Poznaj te wynalazki!',
      },
      pl_figures: {
        label: 'Wybitne postaci Polski',
        blurb: 'Królowie, uczeni i artyści, z których jesteśmy dumni',
        intro: 'Polska ma wielu wybitnych ludzi: królów i rycerzy, uczonych, poetów i muzyków. Dowiedz się, z czego zasłynęli!',
      },
      pl_inventions: {
        label: 'Wielkie wynalazki Polski',
        blurb: 'Co Polacy podarowali światu',
        intro: 'Lampa naftowa, witaminy, krótkofalówka, pojazd księżycowy — to wszystko wymyślili Polacy. Znajdź wynalazcę!',
      },
    },
  },
  dino: {
    meat: 'Mięso',
    plants: 'Rośliny',
    no: { meat: 'Fuj, ja tego nie jem!', plants: 'Grr, zjadłbym coś bardziej sycącego!' },
    name: (id) => dino(id)[0],
    feature: (id) => dino(id)[1],
    ask: (id) => `Czym nakarmić ${fed(dino(id)[0])}?`,
    hint: (id, eats) =>
      eats === 'meat'
        ? `${dino(id)[0]} to drapieżnik. Drapieżniki mają zęby ostre jak noże: jedzą nimi mięso.`
        : `${dino(id)[0]} to roślinożerca. Roślinożercy mają płaskie zęby: rozcierają nimi liście.`,
    who: (id) => `Kto to? ${dino(id)[1]}`,
    whoHint: (id, eats) => `To ${eats === 'meat' ? 'drapieżnik' : 'roślinożerny dinozaur'}. Jego nazwa zaczyna się na literę „${dino(id)[0][0]}”.`,
    yes: (id) => `To ${dino(id)[0].toLowerCase()}. ${dino(id)[1]}`,
  },
  time: {
    sequence: (at) => {
      const [topic, ...rest] = SEQUENCES[at].split('|');
      return { ask: `Ustaw po kolei: to, co było najwcześniej — na miejscu 1, to, co najpóźniej — na ostatnim. ${topic}`, labels: rest.slice(0, -1), story: rest[rest.length - 1] };
    },
    sequenceHint: 'Znajdź najstarszą kartę i postaw ją na miejscu 1. Żeby zamienić dwie karty miejscami, dotknij jednej, a potem drugiej. Zieloną ramkę mają te, które już stoją dobrze.',
    earlierAsk: 'Co pojawiło się wcześniej?',
    earlier: (at) => {
      const [first, later, story] = EARLIER[at].split('|');
      return { first, later, hint: `Pomyśl, bez czego ludzie obywali się dłużej. Starsze jest to: ${first.toLowerCase() === first ? first : first[0].toLowerCase() + first.slice(1)}.`, story };
    },
    epoch: (id) => {
      const [name, no] = EPOCHS[id].split('|');
      return { name, no };
    },
    item: (at, epoch) => {
      const [label, story] = ITEMS[at].split('|');
      return { label, ask: `${label} — kiedy to było?`, hint: `To ${EPOCHS[epoch].split('|')[0].toLowerCase()}. ${story}`, story };
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
      ask: `Z czego ${famous(id)} ${inSentence(name)}?`,
      who,
      hint: `Imię tej osoby zaczyna się na literę „${name[0]}”.`,
    };
  },
  connectAsk: 'Połącz osobę z tym, z czego zasłynęła',
  invention: (id) => {
    const [name, by, fact, ask] = INVENTIONS[id].split('|');
    return { name, by, fact, ask, what: `Co ${/ i |^Bracia |^Konstruktorzy /.test(by) ? 'stworzyli' : 'stworzył'} ${inSentence(by)}?` };
  },
};
