import type { MixId, PaintId } from '../content/data';
import type { ArtTexts } from './types';

/** The Art galaxy in English. */

const PAINTS: Record<PaintId, string> = { red: 'Red', yellow: 'Yellow', blue: 'Blue', white: 'White', black: 'Black', green: 'Green', orange: 'Orange' };
const MIXES: Record<MixId, string> = {
  green: 'Green', orange: 'Orange', purple: 'Purple', pink: 'Pink', grey: 'Gray', sky: 'Sky blue', navy: 'Navy blue', peach: 'Peach', brown: 'Brown', lime: 'Lime green', forest: 'Dark green',
};
/** The things to colour, in the order of `STEPS`. */
const THINGS = [
  'Frog', 'Orange', 'Leaf', 'Carrot',
  'Grapes', 'Eggplant', 'Crocodile', 'Pumpkin',
  'Cucumber', 'Fox', 'Umbrella',
  'Pig', 'Elephant', 'Flower',
  'Mouse', 'Whale', 'Flamingo',
  'Blueberry', 'Jeans', 'Wolf',
  'Peach', 'Butterfly', 'Bow',
  'Bear', 'Chestnut', 'Chocolate',
  'Apple', 'Pear', 'Lettuce',
  'Fir tree', 'Broccoli', 'Potato',
];
const low = (text: string) => text.toLowerCase();

export const en: ArtTexts = {
  cards: {
    title: 'Art',
    games: {
      mixer: {
        label: 'Color Mixer',
        blurb: 'Mix paints in the cauldron and color the pictures',
        intro: 'The picture is still gray — it needs coloring! Pour two paints into the magic cauldron to get the color you need.',
      },
    },
  },
  introFor: (step) => {
    if (step === 4) return 'Now there are white and black paints. White makes a color lighter, and black makes it darker.';
    if (step === 8) return 'The trickiest colors come when you mix a ready-made color with another one. Have a go!';
    return undefined;
  },
  paints: PAINTS,
  mixes: MIXES,
  thing: (at) => THINGS[at],
  prompt: (at, mix) => `The ${low(THINGS[at])} must turn ${low(MIXES[mix])}. Which two paints should you mix?`,
  hint: (mix, a, b) => `You get ${low(MIXES[mix])} if you mix ${low(PAINTS[a])} and ${low(PAINTS[b])} paint.`,
  outro: (mix, a, b) => `${PAINTS[a]} and ${low(PAINTS[b])} together make ${low(MIXES[mix])}!`,
};
