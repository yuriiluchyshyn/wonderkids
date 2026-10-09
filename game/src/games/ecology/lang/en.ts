import type { Bin, EcologyTexts } from './types';
import { whyOf } from './types';
import { LINES, ROWS } from './why.en';

/** The Ecology galaxy in English. */

const BINS: Record<Bin, { name: string; no: string; clue: string }> = {
  glass: { name: 'Glass', no: 'Clink! That is not glass.', clue: 'It is hard, see-through and it clinks — that is glass.' },
  paper: { name: 'Paper', no: 'Rustle! That is not paper.', clue: 'You can tear it and crumple it — that is paper.' },
  plastic: { name: 'Plastic', no: 'Oops! That is not plastic.', clue: 'It is light, it bends and it does not break — that is plastic.' },
  metal: { name: 'Metal', no: 'Clang! That is not metal.', clue: 'It is hard, it shines and it clanks — that is metal.' },
  organic: { name: 'Compost', no: 'Crunch! That is not for the compost.', clue: 'These are leftovers of plants and food — they will rot down in the compost.' },
};

/** The first things, each with a clue of its own. */
const RUBBISH: Record<string, [name: string, clue: string]> = {
  bottle: ['glass bottle', 'It is see-through, hard and it clinks — that is glass.'],
  newspaper: ['newspaper', 'You can tear it and crumple it — that is paper.'],
  cup: ['plastic cup', 'It is light and it bends — that is plastic.'],
  box: ['cardboard box', 'Cardboard is thick paper.'],
  jar: ['glass jar', 'A jar is see-through and rather heavy — that is glass.'],
  shampoo: ['shampoo bottle', 'It is soft and does not break — that is plastic.'],
  envelope: ['envelope', 'An envelope is made of paper.'],
  glass: ['drinking glass', 'A glass is hard and see-through — that is glass.'],
  bag: ['plastic bag', 'A bag is thin and it rustles — that is plastic.'],
  notebook: ['old notebook', 'The pages of a notebook are paper.'],
  toothbrush: ['toothbrush', 'The handle of the brush is made of plastic.'],
  perfume: ['perfume bottle', 'The bottle is hard and see-through — that is glass.'],
  books: ['pile of old books', 'Books are printed on paper.'],
  bucket: ['little plastic bucket', 'The bucket is light and does not break — that is plastic.'],
  honey_jar: ['honey jar', 'The jar is rather heavy, hard and see-through — that is glass.'],
  shoe_box: ['shoe box', 'The box is cardboard, and cardboard is thick paper.'],
  soap_bottle: ['liquid soap bottle', 'The bottle is light and springy — that is plastic.'],
  lemonade: ['glass lemonade bottle', 'It rings when you tap it — that is glass.'],
  towel_roll: ['cardboard tube from paper towels', 'A cardboard tube crumples easily — that is paper.'],
  container: ['plastic container', 'The container is light and does not break — that is plastic.'],
  pickle_jar: ['pickle jar', 'The jar is see-through and hard — that is glass.'],
  postcard: ['old postcard', 'A postcard can be bent and torn — that is paper.'],
  duck: ['plastic duck', 'The duck is light, it floats and does not break — that is plastic.'],
  jam_jar: ['jam jar', 'The jar is hard, see-through and rather heavy — that is glass.'],
  egg_tray: ['cardboard egg carton', 'The carton is made of pressed paper.'],
  straw: ['plastic straw', 'A straw is light and it bends — that is plastic.'],
  oil_bottle: ['glass oil bottle', 'The bottle is hard and see-through — that is glass.'],
  calendar: ['old calendar', 'The pages of a calendar are paper.'],
  cap: ['bottle cap', 'The cap is light and hard, but it does not break — that is plastic.'],
};

/** The rest, by bin, in the order of `content/rubbish.ts`. */
const MORE: Record<Bin, string[]> = {
  glass: ['juice bottle', 'fruit compote jar', 'mineral water bottle', 'mustard jar', 'glass coffee jar', 'syrup bottle', 'baby food jar', 'vinegar bottle', 'tomato sauce jar', 'glass medicine bottle', 'olive jar', 'jelly jar'],
  paper: ['magazine', 'paper bag', 'cereal box', 'sketchbook', 'old letter', 'advertising flyer', 'paper wrapping', 'cardboard folder', 'candy box', 'sheet of used paper', 'old diary', 'movie ticket', 'toy box', 'toilet paper tube', 'old textbook', 'paper bookmark'],
  plastic: ['water bottle', 'yogurt cup', 'kefir bottle', 'shower gel bottle', 'plastic spoon', 'ice cream tub', 'plastic ketchup bottle', 'water canister', 'plastic hanger', 'toy block', 'plastic bowl', 'dish soap bottle', 'sour cream cup', 'berry tray', 'plastic bucket lid'],
  metal: ['lemonade can', 'tin can', 'jar lid', 'sheet of aluminum foil', 'can of peas', 'metal bottle cap', 'can of corn', 'old spoon', 'rusty nail', 'tuna can', 'can of condensed milk', 'old key', 'metal cookie tin', 'juice can', 'piece of wire'],
  organic: ['apple core', 'banana peel', 'heap of potato peelings', 'wilted flower', 'orange peel', 'pile of fallen leaves', 'eggshell', 'cabbage stalk', 'heap of carrot peelings', 'spoonful of coffee grounds', 'used tea bag', 'watermelon rind', 'heap of cut grass', 'piece of dry bread'],
};

const FACTS: Record<Bin, string[]> = {
  glass: [
    'Old glass will be made into new bottles — and that can be done over and over again!',
    'Glass can be melted down again and again, and it never gets any worse.',
    'Glass does not disappear in nature for thousands of years — so it is better to recycle it.',
    'At the factory, glass is crushed, melted in a furnace and blown into new jars.',
    'One recycled bottle saves enough energy to keep a light bulb on for several hours.',
    'Broken glass in the forest can hurt the paws of little animals. In the bin it harms nobody.',
    'Glass is made from sand. If we recycle old glass, no new sand needs to be dug up.',
    'A piece of glass in the sun can set dry grass on fire, like a magnifying glass. That is why glass is never left in the forest.',
    'Recycled glass is made not only into bottles, but into tiles and insulation for houses too.',
    'Glass is sorted by color: clear, green and brown — so that the new bottles look good.',
    'A glass jar can not only be recycled but also used again — for jam, for example.',
    'Melting old glass takes less heat than making new glass from sand.',
  ],
  paper: [
    'Paper will be made into new notebooks, and the trees will stay standing.',
    'Paper is made from wood. Hand in your waste paper and you save trees from being cut down.',
    'Old newspapers turn into egg cartons and toilet paper.',
    'Paper can be recycled five to seven times, until its fibers get too short.',
    'At the factory, paper is soaked in water, stirred into a mush and rolled out into new sheets.',
    'A hundred kilograms of waste paper saves one grown tree from being cut down.',
    'Cardboard boxes are made into new boxes — the kind your parcels arrive in.',
    'Making paper from waste paper takes far less water than making it from wood.',
    'The trees left standing clean the air and give a home to birds and squirrels.',
    'Paper rots quickly, but in a landfill it gives off a harmful gas. Recycled, it is useful.',
    'Before you throw paper away, take a look: maybe you can still draw on the back?',
    'Cardboard and paper must be handed in dry and clean — a greasy pizza box cannot be recycled.',
  ],
  plastic: [
    'Plastic will be made into new toys, benches and even clothes.',
    'Plastic bottles are made into warm fleece sweaters and the filling for jackets.',
    'Plastic does not disappear in nature for hundreds of years — so it must not be dropped just anywhere.',
    'Plastic bags in the sea look like jellyfish, and turtles eat them by mistake. In the bin a bag harms nobody.',
    'At the factory, plastic is washed, cut into tiny flakes and melted into new things.',
    'Plastic caps are collected separately: they are made into benches, slides and whole playgrounds.',
    'Plastic is made from oil. If we recycle old plastic, the oil stays in the ground.',
    'Before you throw a bottle away, squash it: more will fit into the bin.',
    'Twenty-five bottles can make one fleece sweater.',
    'There are different kinds of plastic. The triangle with a number on the bottom tells how to recycle it.',
    'Birds often mistake bits of plastic for food. By picking it up, you save birds.',
    'The best plastic is the plastic that never was: take your own bag to the shop.',
  ],
  metal: [
    'Metal can be melted down any number of times — it never gets any worse.',
    'Melted-down cans are made into new cans, bicycles and even airplanes.',
    'An aluminum can may be back on the shop shelf in just two months.',
    'Melting down an old can is far easier than getting metal out of ore.',
    'In nature metal rusts and lies there for dozens, even hundreds of years.',
    'It is worth squashing a can before handing it in — it takes up less room.',
    'Metal is pulled out of the rubbish with a big magnet.',
    'Old tin cans are melted into steel for bridges and rails.',
    'Foil can be recycled too, if you scrunch it into a ball.',
    'A hundred recycled cans make the frame of a new bicycle.',
  ],
  organic: [
    'Leftovers of plants rot down and become compost — food for the garden.',
    'Peels and cores disappear in nature in a few weeks.',
    'Earthworms and microbes are at work in the compost heap.',
    'Compost makes the soil loose and rich.',
    'Fallen leaves are not rubbish: they feed the soil and keep hedgehogs warm.',
    'Eggshells in the compost give plants calcium.',
    'House plants love coffee grounds and used tea leaves.',
    'In a landfill, food waste rots without air and gives off a harmful gas — so it is better to compost it.',
    'New vegetables grow from compost — and so food comes back to the table.',
    'Almost a third of household rubbish is leftover food that can be composted.',
  ],
};

const rubbish = (id: string): { name: string; clue?: string } => {
  if (RUBBISH[id]) return { name: RUBBISH[id][0], clue: RUBBISH[id][1] };
  const [, bin, at] = /^([a-z]+)_(\d+)$/.exec(id) ?? [];
  return { name: MORE[bin as Bin]?.[Number(at)] ?? id };
};

export const en: EcologyTexts = {
  cards: {
    title: 'Ecology',
    games: {
      recycling: {
        label: 'Eco Patrol',
        blurb: 'Sorting rubbish: a hundred things — glass, paper, plastic, metal and compost',
        intro: 'The clearing needs tidying up! Glass, paper, plastic, metal and leftover food go into different bins — then new things will be made from them.',
      },
      why: {
        label: 'Why Is That?',
        blurb: 'Why glaciers melt and why fallen leaves must not be burned',
        intro: 'Nature needs our help. Listen to the question and choose the answer — and I will tell you why it matters: about air, water, animals, rubbish and warmth on the planet.',
      },
    },
  },
  bin: (id) => BINS[id],
  retry: 'Try another bin!',
  rubbish,
  // No verb to agree with the thing: «the old books» and «the glass bottle» both fit.
  ask: (id) => `Which bin is right for the ${rubbish(id).name}?`,
  yes: (id, bin) => `Yes! “${BINS[bin].name}” is the right bin for the ${rubbish(id).name}.`,
  facts: (bin) => FACTS[bin],
  why: whyOf(ROWS, LINES),
};
