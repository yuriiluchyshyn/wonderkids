import TEXTS from '@/locales/app/uk/games/ecology.json';

const J = TEXTS.content.rubbish;

/**
 * More things to sort in «Еко-патруль» — together with the hand-made ones in
 * `tasks.ts` they make a hundred. One per cell: `name|emoji`, lower-case, in
 * the nominative (the question puts it in the accusative by itself).
 */
type Bin = 'glass' | 'paper' | 'plastic' | 'metal' | 'organic';

const BY_BIN: Record<Bin, string> = J.BY_BIN;

export const MORE_RUBBISH = (Object.keys(BY_BIN) as Bin[]).flatMap((bin) =>
  BY_BIN[bin]
    .split(';')
    .map((cell) => cell.trim())
    .filter(Boolean)
    .map((cell, i) => {
      const [name, emoji] = cell.split('|');
      return { id: `${bin}_${i}`, name, emoji, bin };
    }),
);

export const BINS = [
  { id: 'glass', name: J.BINS.glass.name, emoji: '🫙', no: J.BINS.glass.no },
  { id: 'paper', name: J.BINS.paper.name, emoji: '📄', no: J.BINS.paper.no },
  { id: 'plastic', name: J.BINS.plastic.name, emoji: '🧴', no: J.BINS.plastic.no },
  { id: 'metal', name: J.BINS.metal.name, emoji: '🥫', no: J.BINS.metal.no },
  { id: 'organic', name: J.BINS.organic.name, emoji: '🍂', no: J.BINS.organic.no },
] as const;

/** What gives a material away — the helper's clue for the things of `content/rubbish.ts`. */
export const CLUE: Record<(typeof BINS)[number]['id'], string> = J.CLUE;

/** Rubbish found on the meadow, with the marker clue the helper points out. */
export const RUBBISH = [
  { id: 'bottle', name: J.RUBBISH.bottle.name, emoji: '🍾', bin: 'glass', clue: J.RUBBISH.bottle.clue },
  { id: 'newspaper', name: J.RUBBISH.newspaper.name, emoji: '📰', bin: 'paper', clue: J.RUBBISH.newspaper.clue },
  { id: 'cup', name: J.RUBBISH.cup.name, emoji: '🥤', bin: 'plastic', clue: J.RUBBISH.cup.clue },
  { id: 'box', name: J.RUBBISH.box.name, emoji: '📦', bin: 'paper', clue: J.RUBBISH.box.clue },
  { id: 'jar', name: J.RUBBISH.jar.name, emoji: '🫙', bin: 'glass', clue: J.RUBBISH.jar.clue },
  { id: 'shampoo', name: J.RUBBISH.shampoo.name, emoji: '🧴', bin: 'plastic', clue: J.RUBBISH.shampoo.clue },
  { id: 'envelope', name: J.RUBBISH.envelope.name, emoji: '✉️', bin: 'paper', clue: J.RUBBISH.envelope.clue },
  { id: 'glass', name: J.RUBBISH.glass.name, emoji: '🥛', bin: 'glass', clue: J.RUBBISH.glass.clue },
  { id: 'bag', name: J.RUBBISH.bag.name, emoji: '🛍️', bin: 'plastic', clue: J.RUBBISH.bag.clue },
  { id: 'notebook', name: J.RUBBISH.notebook.name, emoji: '📓', bin: 'paper', clue: J.RUBBISH.notebook.clue },
  { id: 'toothbrush', name: J.RUBBISH.toothbrush.name, emoji: '🪥', bin: 'plastic', clue: J.RUBBISH.toothbrush.clue },
  { id: 'perfume', name: J.RUBBISH.perfume.name, emoji: '🧪', bin: 'glass', clue: J.RUBBISH.perfume.clue },
  { id: 'books', name: J.RUBBISH.books.name, emoji: '📚', bin: 'paper', clue: J.RUBBISH.books.clue },
  { id: 'bucket', name: J.RUBBISH.bucket.name, emoji: '🪣', bin: 'plastic', clue: J.RUBBISH.bucket.clue },
  { id: 'honey_jar', name: J.RUBBISH.honey_jar.name, emoji: '🍯', bin: 'glass', clue: J.RUBBISH.honey_jar.clue },
  { id: 'shoe_box', name: J.RUBBISH.shoe_box.name, emoji: '👟', bin: 'paper', clue: J.RUBBISH.shoe_box.clue },
  { id: 'soap_bottle', name: J.RUBBISH.soap_bottle.name, emoji: '🧼', bin: 'plastic', clue: J.RUBBISH.soap_bottle.clue },
  { id: 'lemonade', name: J.RUBBISH.lemonade.name, emoji: '🍶', bin: 'glass', clue: J.RUBBISH.lemonade.clue },
  { id: 'towel_roll', name: J.RUBBISH.towel_roll.name, emoji: '🧻', bin: 'paper', clue: J.RUBBISH.towel_roll.clue },
  { id: 'container', name: J.RUBBISH.container.name, emoji: '🍱', bin: 'plastic', clue: J.RUBBISH.container.clue },
  { id: 'pickle_jar', name: J.RUBBISH.pickle_jar.name, emoji: '🥒', bin: 'glass', clue: J.RUBBISH.pickle_jar.clue },
  { id: 'postcard', name: J.RUBBISH.postcard.name, emoji: '💌', bin: 'paper', clue: J.RUBBISH.postcard.clue },
  { id: 'duck', name: J.RUBBISH.duck.name, emoji: '🦆', bin: 'plastic', clue: J.RUBBISH.duck.clue },
  { id: 'jam_jar', name: J.RUBBISH.jam_jar.name, emoji: '🍓', bin: 'glass', clue: J.RUBBISH.jam_jar.clue },
  { id: 'egg_tray', name: J.RUBBISH.egg_tray.name, emoji: '🥚', bin: 'paper', clue: J.RUBBISH.egg_tray.clue },
  { id: 'straw', name: J.RUBBISH.straw.name, emoji: '🧋', bin: 'plastic', clue: J.RUBBISH.straw.clue },
  { id: 'oil_bottle', name: J.RUBBISH.oil_bottle.name, emoji: '🫒', bin: 'glass', clue: J.RUBBISH.oil_bottle.clue },
  { id: 'calendar', name: J.RUBBISH.calendar.name, emoji: '📅', bin: 'paper', clue: J.RUBBISH.calendar.clue },
  { id: 'cap', name: J.RUBBISH.cap.name, emoji: '🔘', bin: 'plastic', clue: J.RUBBISH.cap.clue },
] as const;

/** Game 12 — «Сортування Сміття та Еко-патруль»: five bins, a hundred things to sort. */
