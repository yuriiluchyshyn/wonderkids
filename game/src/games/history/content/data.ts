import TEXTS from '@/locales/app/uk/games/history.json';

const J = TEXTS.content.data;

/** Content for the History games. Ordered easy → hard (see `unlocked`). */

export interface Achiever {
  id: string;
  name: string;
  /** Stand-in portrait until illustrated ones exist. */
  face: string;
  symbol: string;
  symbolName: string;
  fact: string;
  /** Who the verb agrees with («прославилася», «прославилися»). Default: he. */
  who?: 'she' | 'they';
  /** Whose portrait to show instead of the person's own (`/people/<id>.webp`). */
  picture?: string;
}

/**
 * Ordered by fame — best-known first. The ORDER decides the path: the first
 * five open step 1, then three more arrive on every step (see `introSteps`),
 * so step N teaches people of "fame level" N and recalls the earlier ones.
 */
export const WORLD_FIGURES: Achiever[] = [
  // ---- level 1
  { id: 'einstein', name: J.WORLD_FIGURES.einstein.name, face: '👨‍🔬', symbol: '⚛️', symbolName: J.WORLD_FIGURES.einstein.symbolName, fact: J.WORLD_FIGURES.einstein.fact },
  { id: 'davinci', name: J.WORLD_FIGURES.davinci.name, face: '👨‍🎨', symbol: '🖼️', symbolName: J.WORLD_FIGURES.davinci.symbolName, fact: J.WORLD_FIGURES.davinci.fact },
  { id: 'columbus', name: J.WORLD_FIGURES.columbus.name, face: '🧭', symbol: '⛵', symbolName: J.WORLD_FIGURES.columbus.symbolName, fact: J.WORLD_FIGURES.columbus.fact },
  { id: 'armstrong', name: J.WORLD_FIGURES.armstrong.name, face: '🧑‍🚀', symbol: '🌙', symbolName: J.WORLD_FIGURES.armstrong.symbolName, fact: J.WORLD_FIGURES.armstrong.fact },
  { id: 'mozart', name: J.WORLD_FIGURES.mozart.name, face: '🧑‍🎤', symbol: '🎹', symbolName: J.WORLD_FIGURES.mozart.symbolName, fact: J.WORLD_FIGURES.mozart.fact },
  // ---- level 2
  { id: 'newton', name: J.WORLD_FIGURES.newton.name, face: '🧑‍🏫', symbol: '🍎', symbolName: J.WORLD_FIGURES.newton.symbolName, fact: J.WORLD_FIGURES.newton.fact },
  { id: 'shakespeare', name: J.WORLD_FIGURES.shakespeare.name, face: '🧔', symbol: '🎭', symbolName: J.WORLD_FIGURES.shakespeare.symbolName, fact: J.WORLD_FIGURES.shakespeare.fact },
  { id: 'galileo', name: J.WORLD_FIGURES.galileo.name, face: '🧙‍♂️', symbol: '🔭', symbolName: J.WORLD_FIGURES.galileo.symbolName, fact: J.WORLD_FIGURES.galileo.fact },
  // ---- level 3
  { id: 'curie', name: J.WORLD_FIGURES.curie.name, who: 'she', face: '👩‍🔬', symbol: '🧪', symbolName: J.WORLD_FIGURES.curie.symbolName, fact: J.WORLD_FIGURES.curie.fact },
  { id: 'picasso', name: J.WORLD_FIGURES.picasso.name, face: '🧑‍🎨', symbol: '🎨', symbolName: J.WORLD_FIGURES.picasso.symbolName, fact: J.WORLD_FIGURES.picasso.fact },
  { id: 'darwin', name: J.WORLD_FIGURES.darwin.name, face: '👴', symbol: '🐢', symbolName: J.WORLD_FIGURES.darwin.symbolName, fact: J.WORLD_FIGURES.darwin.fact },
  // ---- level 4
  { id: 'gutenberg', name: J.WORLD_FIGURES.gutenberg.name, face: '🧑‍🔧', symbol: '📖', symbolName: J.WORLD_FIGURES.gutenberg.symbolName, fact: J.WORLD_FIGURES.gutenberg.fact },
  { id: 'edison', name: J.WORLD_FIGURES.edison.name, face: '👨‍🔧', symbol: '💡', symbolName: J.WORLD_FIGURES.edison.symbolName, fact: J.WORLD_FIGURES.edison.fact },
  { id: 'magellan', name: J.WORLD_FIGURES.magellan.name, face: '🧑‍✈️', symbol: '🌍', symbolName: J.WORLD_FIGURES.magellan.symbolName, fact: J.WORLD_FIGURES.magellan.fact },
  // ---- level 5
  { id: 'beethoven', name: J.WORLD_FIGURES.beethoven.name, face: '👨‍🦱', symbol: '🎼', symbolName: J.WORLD_FIGURES.beethoven.symbolName, fact: J.WORLD_FIGURES.beethoven.fact },
  { id: 'archimedes', name: J.WORLD_FIGURES.archimedes.name, face: '🧓', symbol: '🛁', symbolName: J.WORLD_FIGURES.archimedes.symbolName, fact: J.WORLD_FIGURES.archimedes.fact },
  { id: 'cleopatra', name: J.WORLD_FIGURES.cleopatra.name, who: 'she', face: '👸', symbol: '👑', symbolName: J.WORLD_FIGURES.cleopatra.symbolName, fact: J.WORLD_FIGURES.cleopatra.fact },
  // ---- level 6
  { id: 'joan', name: J.WORLD_FIGURES.joan.name, who: 'she', face: '👩', symbol: '🛡️', symbolName: J.WORLD_FIGURES.joan.symbolName, fact: J.WORLD_FIGURES.joan.fact },
  { id: 'vangogh', name: J.WORLD_FIGURES.vangogh.name, face: '👨‍🦰', symbol: '🌻', symbolName: J.WORLD_FIGURES.vangogh.symbolName, fact: J.WORLD_FIGURES.vangogh.fact },
  { id: 'alexander', name: J.WORLD_FIGURES.alexander.name, face: '🤴', symbol: '🗺️', symbolName: J.WORLD_FIGURES.alexander.symbolName, fact: J.WORLD_FIGURES.alexander.fact },
  // ---- level 7
  { id: 'wright', name: J.WORLD_FIGURES.wright.name, who: 'they', face: '👬', symbol: '✈️', symbolName: J.WORLD_FIGURES.wright.symbolName, fact: J.WORLD_FIGURES.wright.fact },
  { id: 'michelangelo', name: J.WORLD_FIGURES.michelangelo.name, face: '🧔‍♂️', symbol: '🗿', symbolName: J.WORLD_FIGURES.michelangelo.symbolName, fact: J.WORLD_FIGURES.michelangelo.fact },
  { id: 'copernicus', name: J.WORLD_FIGURES.copernicus.name, face: '👨‍🏫', symbol: '☀️', symbolName: J.WORLD_FIGURES.copernicus.symbolName, fact: J.WORLD_FIGURES.copernicus.fact },
  // ---- level 8
  { id: 'andersen', name: J.WORLD_FIGURES.andersen.name, face: '👨‍💼', symbol: '🧜‍♀️', symbolName: J.WORLD_FIGURES.andersen.symbolName, fact: J.WORLD_FIGURES.andersen.fact },
  { id: 'tesla', name: J.WORLD_FIGURES.tesla.name, face: '👨‍💻', symbol: '⚡', symbolName: J.WORLD_FIGURES.tesla.symbolName, fact: J.WORLD_FIGURES.tesla.fact },
  { id: 'marcopolo', name: J.WORLD_FIGURES.marcopolo.name, face: '🧳', symbol: '🐫', symbolName: J.WORLD_FIGURES.marcopolo.symbolName, fact: J.WORLD_FIGURES.marcopolo.fact },
  // ---- level 9
  { id: 'nightingale', name: J.WORLD_FIGURES.nightingale.name, who: 'she', face: '👩‍⚕️', symbol: '🏥', symbolName: J.WORLD_FIGURES.nightingale.symbolName, fact: J.WORLD_FIGURES.nightingale.fact },
  { id: 'chaplin', name: J.WORLD_FIGURES.chaplin.name, face: '🥸', symbol: '🎩', symbolName: J.WORLD_FIGURES.chaplin.symbolName, fact: J.WORLD_FIGURES.chaplin.fact },
  { id: 'cousteau', name: J.WORLD_FIGURES.cousteau.name, face: '🧑‍🔬', symbol: '🤿', symbolName: J.WORLD_FIGURES.cousteau.symbolName, fact: J.WORLD_FIGURES.cousteau.fact },
  // ---- level 10
  { id: 'jobs', name: J.WORLD_FIGURES.jobs.name, face: '👨‍💼', symbol: '📱', symbolName: J.WORLD_FIGURES.jobs.symbolName, fact: J.WORLD_FIGURES.jobs.fact },
  { id: 'pythagoras', name: J.WORLD_FIGURES.pythagoras.name, face: '👳', symbol: '📐', symbolName: J.WORLD_FIGURES.pythagoras.symbolName, fact: J.WORLD_FIGURES.pythagoras.fact },
  { id: 'goodall', name: J.WORLD_FIGURES.goodall.name, who: 'she', face: '👩‍🦳', symbol: '🐒', symbolName: J.WORLD_FIGURES.goodall.symbolName, fact: J.WORLD_FIGURES.goodall.fact },
];

/** Ordered by fame too: the first four open step 1, then one more per step. */
export const UA_FIGURES: Achiever[] = [
  { id: 'shevchenko', name: J.UA_FIGURES.shevchenko.name, face: '👨‍🦳', symbol: '📖', symbolName: J.UA_FIGURES.shevchenko.symbolName, fact: J.UA_FIGURES.shevchenko.fact },
  { id: 'korolov', name: J.UA_FIGURES.korolov.name, face: '👨‍🚀', symbol: '🚀', symbolName: J.UA_FIGURES.korolov.symbolName, fact: J.UA_FIGURES.korolov.fact },
  { id: 'yaroslav', name: J.UA_FIGURES.yaroslav.name, face: '🤴', symbol: '📜', symbolName: J.UA_FIGURES.yaroslav.symbolName, fact: J.UA_FIGURES.yaroslav.fact },
  { id: 'lesia', name: J.UA_FIGURES.lesia.name, who: 'she', face: '👩‍🦰', symbol: '🌳', symbolName: J.UA_FIGURES.lesia.symbolName, fact: J.UA_FIGURES.lesia.fact },
  { id: 'leontovych', name: J.UA_FIGURES.leontovych.name, face: '🧑‍🎼', symbol: '🔔', symbolName: J.UA_FIGURES.leontovych.symbolName, fact: J.UA_FIGURES.leontovych.fact },
  { id: 'sikorsky', name: J.UA_FIGURES.sikorsky.name, face: '👨‍✈️', symbol: '🚁', symbolName: J.UA_FIGURES.sikorsky.symbolName, fact: J.UA_FIGURES.sikorsky.fact },
  { id: 'olha', name: J.UA_FIGURES.olha.name, who: 'she', face: '👸', symbol: '👑', symbolName: J.UA_FIGURES.olha.symbolName, fact: J.UA_FIGURES.olha.fact },
  { id: 'khmelnytsky', name: J.UA_FIGURES.khmelnytsky.name, face: '🧔‍♂️', symbol: '🐎', symbolName: J.UA_FIGURES.khmelnytsky.symbolName, fact: J.UA_FIGURES.khmelnytsky.fact },
  { id: 'skovoroda', name: J.UA_FIGURES.skovoroda.name, face: '🧙', symbol: '🎒', symbolName: J.UA_FIGURES.skovoroda.symbolName, fact: J.UA_FIGURES.skovoroda.fact },
  { id: 'franko', name: J.UA_FIGURES.franko.name, face: '👨‍🏫', symbol: '🦊', symbolName: J.UA_FIGURES.franko.symbolName, fact: J.UA_FIGURES.franko.fact },
  { id: 'prymachenko', name: J.UA_FIGURES.prymachenko.name, who: 'she', face: '👵', symbol: '🎨', symbolName: J.UA_FIGURES.prymachenko.symbolName, fact: J.UA_FIGURES.prymachenko.fact },
  { id: 'kadeniuk', name: J.UA_FIGURES.kadeniuk.name, face: '🧑‍🚀', symbol: '🛰️', symbolName: J.UA_FIGURES.kadeniuk.symbolName, fact: J.UA_FIGURES.kadeniuk.fact },
  { id: 'amosov', name: J.UA_FIGURES.amosov.name, face: '👨‍⚕️', symbol: '❤️', symbolName: J.UA_FIGURES.amosov.symbolName, fact: J.UA_FIGURES.amosov.fact },
];

export interface Invention {
  id: string;
  name: string;
  emoji: string;
  by: string;
  fact: string;
  /** Portrait of the inventor: a file of `public/people` (without the extension). */
  face?: string;
  /** The question, where «Хто винайшов …?» would be untrue (a thing that was discovered, not invented). */
  ask?: string;
}

/**
 * People whose work has a real picture in `public/things/<person id>.webp`
 * (see its CREDITS.md). The others keep the pictogram: a work still under
 * copyright (Picasso, Prymachenko) or one no honest picture exists for.
 */
export const PICTURED = new Set(['alexander', 'andersen', 'archimedes', 'armstrong', 'beethoven', 'chaplin', 'cleopatra', 'columbus', 'copernicus', 'cousteau', 'curie', 'darwin', 'davinci', 'edison', 'franko', 'galileo', 'goodall', 'gutenberg', 'joan', 'kadeniuk', 'khmelnytsky', 'korolov', 'leontovych', 'lesia', 'magellan', 'marcopolo', 'michelangelo', 'mozart', 'newton', 'nightingale', 'pythagoras', 'shakespeare', 'shevchenko', 'sikorsky', 'tesla', 'vangogh', 'wright', 'yaroslav']);
/** Inventions that have no picture of their own in `public/things/inv_<id>.webp`. */
export const UNPICTURED_INVENTIONS = new Set<string>([]);

export const WORLD_INVENTIONS: Invention[] = [
  { id: 'bulb', name: J.WORLD_INVENTIONS.bulb.name, emoji: '💡', by: J.WORLD_INVENTIONS.bulb.by, face: 'edison', fact: J.WORLD_INVENTIONS.bulb.fact },
  { id: 'telephone', name: J.WORLD_INVENTIONS.telephone.name, emoji: '☎️', by: J.WORLD_INVENTIONS.telephone.by, face: 'bell', fact: J.WORLD_INVENTIONS.telephone.fact },
  { id: 'plane', name: J.WORLD_INVENTIONS.plane.name, emoji: '✈️', by: J.WORLD_INVENTIONS.plane.by, face: 'wright', fact: J.WORLD_INVENTIONS.plane.fact },
  { id: 'radio', name: J.WORLD_INVENTIONS.radio.name, emoji: '📻', by: J.WORLD_INVENTIONS.radio.by, face: 'marconi', fact: J.WORLD_INVENTIONS.radio.fact },
  { id: 'press', name: J.WORLD_INVENTIONS.press.name, emoji: '📖', by: J.WORLD_INVENTIONS.press.by, face: 'gutenberg', fact: J.WORLD_INVENTIONS.press.fact },
  { id: 'car', name: J.WORLD_INVENTIONS.car.name, emoji: '🚗', by: J.WORLD_INVENTIONS.car.by, face: 'benz', fact: J.WORLD_INVENTIONS.car.fact },
  { id: 'train', name: J.WORLD_INVENTIONS.train.name, emoji: '🚂', by: J.WORLD_INVENTIONS.train.by, face: 'stephenson', fact: J.WORLD_INVENTIONS.train.fact },
  { id: 'penicillin', name: J.WORLD_INVENTIONS.penicillin.name, ask: J.WORLD_INVENTIONS.penicillin.ask, emoji: '💊', by: J.WORLD_INVENTIONS.penicillin.by, face: 'fleming', fact: J.WORLD_INVENTIONS.penicillin.fact },
  { id: 'web', name: J.WORLD_INVENTIONS.web.name, ask: J.WORLD_INVENTIONS.web.ask, emoji: '🌐', by: J.WORLD_INVENTIONS.web.by, face: 'berners_lee', fact: J.WORLD_INVENTIONS.web.fact },
  { id: 'telescope', name: J.WORLD_INVENTIONS.telescope.name, ask: J.WORLD_INVENTIONS.telescope.ask, emoji: '🔭', by: J.WORLD_INVENTIONS.telescope.by, face: 'galileo', fact: J.WORLD_INVENTIONS.telescope.fact },
];

export const UA_INVENTIONS: Invention[] = [
  { id: 'helicopter', name: J.UA_INVENTIONS.helicopter.name, emoji: '🚁', by: J.UA_INVENTIONS.helicopter.by, face: 'sikorsky', fact: J.UA_INVENTIONS.helicopter.fact },
  { id: 'kerosene', name: J.UA_INVENTIONS.kerosene.name, emoji: '🪔', by: J.UA_INVENTIONS.kerosene.by, face: 'lukasiewicz', fact: J.UA_INVENTIONS.kerosene.fact },
  { id: 'cinema', name: J.UA_INVENTIONS.cinema.name, emoji: '🎥', by: J.UA_INVENTIONS.cinema.by, face: 'tymchenko', fact: J.UA_INVENTIONS.cinema.fact },
  { id: 'welding', name: J.UA_INVENTIONS.welding.name, ask: J.UA_INVENTIONS.welding.ask, emoji: '⚡', by: J.UA_INVENTIONS.welding.by, face: 'paton', fact: J.UA_INVENTIONS.welding.fact },
  { id: 'xray', name: J.UA_INVENTIONS.xray.name, ask: J.UA_INVENTIONS.xray.ask, emoji: '🩻', by: J.UA_INVENTIONS.xray.by, face: 'pulyui', fact: J.UA_INVENTIONS.xray.fact },
  { id: 'tram', name: J.UA_INVENTIONS.tram.name, emoji: '🚋', by: J.UA_INVENTIONS.tram.by, face: 'pirotsky', fact: J.UA_INVENTIONS.tram.fact },
  { id: 'vaccine', name: J.UA_INVENTIONS.vaccine.name, emoji: '💉', by: J.UA_INVENTIONS.vaccine.by, face: 'haffkine', fact: J.UA_INVENTIONS.vaccine.fact },
  { id: 'mriya', name: J.UA_INVENTIONS.mriya.name, ask: J.UA_INVENTIONS.mriya.ask, emoji: '✈️', by: J.UA_INVENTIONS.mriya.by, fact: J.UA_INVENTIONS.mriya.fact },
  { id: 'cd', name: J.UA_INVENTIONS.cd.name, emoji: '💿', by: J.UA_INVENTIONS.cd.by, fact: J.UA_INVENTIONS.cd.fact },
  { id: 'rocket', name: J.UA_INVENTIONS.rocket.name, emoji: '🚀', by: J.UA_INVENTIONS.rocket.by, face: 'korolov', fact: J.UA_INVENTIONS.rocket.fact },
];

/**
 * «Хто …?» for every person — the question asked when the child has to
 * recognise them by what they did. Written out, not glued from a symbol's
 * name: «Хто відкрив Америку?», never «Хто прославився цим: корабель до Америки?».
 */
export const WHO_ASK: Record<string, string> = J.WHO_ASK;
