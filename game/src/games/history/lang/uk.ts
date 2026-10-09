import { accusative, conjugate, inflect, lowerFirst, noun, verb } from '@/core/lang/uk';
import { UA_FIGURES, UA_INVENTIONS, WHO_ASK, WORLD_FIGURES, WORLD_INVENTIONS, type Achiever, type Invention } from '../content/data';
import { DINOSAURS } from '../content/dinosaurs';
import { PL_FIGURES, PL_INVENTIONS, PL_WHO_ASK } from '../content/poland';
import { EARLIER, EPOCHS, EPOCH_ITEMS, SEQUENCES, WHEN } from '../content/timeMachine';
import type { HistoryTexts } from './types';

/** The History galaxy in Ukrainian: the words of `content/`, put into sentences. */

const FAMOUS = verb('прославитися', ['прославиться', 'прославляться'], { perfective: true });
const CREATE = verb('створити', ['створить', 'створять'], { perfective: true });
const HE = noun('він', 'm', { animate: true });
const SHE = noun('вона', 'f', { animate: true });
const THEY = noun('вони', 'm', { animate: true, number: 'pl' });
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
    meat: "М'ясо",
    plants: 'Рослини',
    no: { meat: 'Фу, я таке не їм!', plants: 'Гр-р-р, мені б чогось ситнішого!' },
    name: (id) => dino.get(id)!.name,
    feature: (id) => dino.get(id)!.feature,
    ask: (id) => `Чим нагодувати ${inflect(noun(lowerFirst(dino.get(id)!.name), 'm', { animate: true }), 'acc')}?`,
    hint: (id, eats) =>
      eats === 'meat'
        ? `${dino.get(id)!.name} — хижак. У хижаків зуби гострі, як ножі: ними їдять м’ясо.`
        : `${dino.get(id)!.name} — травоїдний. У травоїдних зуби пласкі: ними перетирають листя.`,
    who: (id) => `Хто це? ${dino.get(id)!.feature}`,
    whoHint: (id, eats) => `Це ${eats === 'meat' ? 'хижак' : 'травоїдний динозавр'}. Його назва починається на літеру «${dino.get(id)!.name[0]}».`,
    yes: (id) => `Це ${dino.get(id)!.name}. ${dino.get(id)!.feature}`,
  },
  time: {
    sequence: (at) => {
      const [topic, cards, story] = SEQUENCES[at];
      return { ask: `Постав по порядку: що було найраніше — на місце 1, що найпізніше — на останнє. ${topic}`, labels: cards.map(([, label]) => label), story };
    },
    sequenceHint: 'Знайди найдавнішу картку і постав її на місце 1. Щоб поміняти дві картки місцями, торкнись однієї, а потім другої. Зеленим обведено ті, що вже стоять правильно.',
    earlierAsk: 'Що з’явилося раніше?',
    earlier: (at) => {
      const [, first, , later, story] = EARLIER[at];
      return { first, later, hint: `Подумай, без чого люди обходилися довше. ${first} — давніший винахід.`, story };
    },
    epoch: (id) => ({ name: epoch.get(id)!.name, no: epoch.get(id)!.no }),
    item: (at, id) => {
      const [, label, , story] = EPOCH_ITEMS[at];
      return { label, ask: `${label} — коли це було?`, hint: `Це ${epoch.get(id)?.name}. ${story}`, story };
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
      ask: `Чим ${becameFamous(p.who)} ${inSentence(p.name)}?`,
      who: asks[id] ?? `${p.symbolName} — хто цим прославився?`,
      hint: `Ім’я цієї людини починається на літеру «${p.name[0]}».`,
    };
  },
  connectAsk: 'З’єднай людину з тим, чим вона прославилась',
  invention: (id) => {
    const inv = inventions.get(id)!;
    return {
      name: inv.name,
      by: inv.by,
      fact: inv.fact,
      ask: inv.ask ?? `Хто винайшов ${accusative(lowerFirst(inv.name))}?`,
      what: `Що ${created(inv.by)} ${inSentence(inv.by)}?`,
    };
  },
};
