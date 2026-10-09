import { ordinalWords } from '@/core/lang/en';
import { own } from '@/core/lang/marks';
import type { SeasonId } from '../content/data';
import type { NatureTexts } from './types';

/** The Nature galaxy in English. */

const SEASONS: Record<SeasonId, { name: string; said: string; no: string; facts: string[] }> = {
  winter: {
    name: 'Winter',
    said: 'winter',
    no: 'Brr, that never happens in winter!',
    facts: [
      'Winter is December, January and February.',
      'In winter the days are the shortest and the nights the longest.',
      'Every snowflake has six little arms, and no two are alike.',
      'Snow is a blanket for the ground: plants are warmer under it.',
      'In winter trees are not dead — they are asleep, waiting for spring.',
      'The hedgehog, the bear and the badger sleep through winter, and the hare swaps its gray coat for a white one.',
      'In winter it is hard for birds to find food, so people make feeders for them.',
      'Ice is lighter than water, so it floats on top, and the fish spend the winter beneath it.',
      'In winter the sun stays low above the horizon — that is why it warms so little.',
      'The shortest day of the year comes in December. After it the days slowly grow longer.',
    ],
  },
  spring: {
    name: 'Spring',
    said: 'spring',
    no: 'No, in spring nature is only just waking up.',
    facts: [
      'Spring is March, April and May.',
      'In spring the days grow longer and the sun shines stronger.',
      'Snowdrops are the first to bloom in spring — sometimes straight out of the snow.',
      'In spring birds come back from the warm lands and build nests.',
      'In spring bears, hedgehogs and insects wake up.',
      'In April and May the orchards blossom: apple, cherry and apricot trees.',
      'In spring people sow seeds in gardens and fields.',
      'In spring bees fly out of their hives for the first nectar.',
      'In spring the snow melts and the rivers run full.',
      'At the end of spring comes the first thunderstorm, with thunder and lightning.',
    ],
  },
  summer: {
    name: 'Summer',
    said: 'summer',
    no: 'It is far too hot for that in summer!',
    facts: [
      'Summer is June, July and August.',
      'In summer the days are the longest and the nights the shortest.',
      'In summer the sun climbs highest — that is why it is so warm.',
      'In summer the berries ripen: strawberries, raspberries and cherries.',
      'Schoolchildren have their longest vacation in summer.',
      'In summer wheat ripens in the fields — bread is baked from it.',
      'In summer young birds learn to fly.',
      'The longest day of the year comes in June.',
      'In the heat you should drink plenty of water and wear a sun hat.',
      'On summer evenings you can see fireflies, and at night — lots of stars.',
    ],
  },
  autumn: {
    name: 'Fall',
    said: 'the fall',
    no: 'In the fall we see other things.',
    facts: [
      'Fall is September, October and November.',
      'In the fall the days get shorter and the nights longer.',
      'Leaves turn yellow because the green color in them — chlorophyll — fades away.',
      'In the fall storks, swallows and cranes fly away to the warm lands.',
      'In the fall the harvest is gathered: apples, pears, potatoes, pumpkins.',
      'In the fall squirrels, hamsters and mice store food for the winter.',
      'In the fall the hedgehog looks for a pile of leaves to sleep in until spring.',
      'In the fall animals grow thicker fur — they are getting ready for the cold.',
      'Fallen leaves are not litter: they cover the ground and feed the soil.',
      'At the end of fall there is frost in the mornings — a white coat of tiny ice crystals.',
    ],
  },
};

/** The months and the story of each one's English name. */
const MONTHS: [name: string, fact: string][] = [
  ['January', 'January is the first month of the year. It is named after Janus, the Roman god of doors and beginnings, who looked both back and ahead.'],
  ['February', 'February is the shortest month: it has 28 days, and once every four years — 29. Its name comes from an old Roman festival of cleaning and washing.'],
  ['March', 'March is named after Mars, a Roman god. Long ago the Romans began their year with this month.'],
  ['April', 'April is the month of the first flowers: snowdrops, daffodils and tulips come into bloom. Its name may come from a Latin word for “to open” — like buds opening.'],
  ['May', 'May is named after Maia, the Roman goddess of growing things. In May everything is covered with thick green grass.'],
  ['June', 'June is named after the Roman goddess Juno. The first berries turn red in June, and it has the longest day of the year.'],
  ['July', 'July is named after Julius Caesar, a famous Roman leader. In July the linden trees bloom, and bees gather fragrant honey from them.'],
  ['August', 'August is named after Augustus, the first Roman emperor. It is the month when ripe wheat is harvested.'],
  ['September', 'September means “the seventh month”: the old Roman year began in March. In September children go back to school.'],
  ['October', 'October means “the eighth month” in the old Roman count. In October the leaves on the trees turn yellow and gold.'],
  ['November', 'November means “the ninth month” in the old Roman count. In November the last leaves fall from the trees.'],
  ['December', 'December means “the tenth month” in the old Roman count — yet it is the twelfth and last month of our year.'],
];

/** The signs of the seasons, in the order of `SIGNS`: the question, the card, the fact. */
const SIGNS: [ask: string, label: string, fact: string][] = [
  ['When do we build a snowman?', 'Building a snowman', 'A snowman is built in winter, when the snow is sticky. It packs best when it is just around freezing outside.'],
  ['When do we swim in the sea?', 'Swimming in the sea', 'In summer the water in the sea and the rivers warms up — just the time for a swim.'],
  ['When do yellow leaves fall?', 'Yellow leaves fall', 'In the fall trees drop their leaves, so that in winter they do not lose water or break under the snow.'],
  ['When do tulips bloom?', 'Tulips bloom', 'In spring the sun shines stronger, and the first flowers push up out of the ground.'],
  ['When do we decorate the Christmas tree?', 'Decorating the Christmas tree', 'The tree is decorated in winter — for Christmas and New Year.'],
  ['When do watermelons ripen?', 'Watermelons ripen', 'Watermelons need lots of sun and warmth, so they ripen at the end of summer.'],
  ['When do birds come back from the warm lands?', 'Birds come back from the warm lands', 'In spring swallows, storks and starlings come home from the warm lands.'],
  ['When do we pick mushrooms?', 'Picking mushrooms', 'It often rains in the fall, and mushrooms love the damp — so there are lots of them.'],
  ['When do we go ice skating?', 'Ice skating', 'In winter water freezes, and you can skate on the ice.'],
  ['When do sunflowers bloom?', 'Sunflowers bloom', 'In summer the fields turn yellow with sunflowers. Young sunflowers turn their heads to follow the sun.'],
  ['When do the first little leaves appear?', 'The first little leaves appear', 'In spring the buds on the trees burst open, and tender little leaves unfold from them.'],
  ['When do children go back to school?', 'Children go back to school', own('The school year begins as summer ends and the fall comes.')],
  ['When does the bear sleep in its den?', 'The bear sleeps in its den', 'In winter it is hard for a bear to find food, so it sleeps in its den right through to spring.'],
  ['When do butterflies fly?', 'Butterflies fly', 'In summer there are lots of flowers, and butterflies drink sweet nectar from them.'],
  ['When does the snow melt and the streams babble?', 'The snow melts and the streams babble', 'In spring the sun melts the snow, and the meltwater runs in streams down to the rivers.'],
  ['When do pumpkins ripen?', 'Pumpkins ripen', 'Pumpkins are picked in the fall. They can keep all winter without going bad.'],
  ['When do we put on mittens and a hat?', 'Putting on mittens and a hat', 'It is cold in winter, so we put on warm clothes: they keep in the warmth of our bodies.'],
  ['When do strawberries ripen?', 'Strawberries ripen', 'Strawberries ripen at the start of summer — they are among the first berries of the year.'],
  ['When do chicks hatch?', 'Chicks hatch', 'In spring birds build nests and sit on their eggs — and chicks hatch out of them.'],
  ['When do cold rains often fall?', 'Cold rains often fall', 'In the fall the sun is weaker, clouds cover the sky and it often rains.'],
  ['When does the squirrel store nuts?', 'The squirrel stores nuts', 'In the fall the squirrel hides nuts and mushrooms, to have something to eat in winter.'],
  ['When do we get thunderstorms and rainbows?', 'Thunderstorms and rainbows', 'In summer, after a warm downpour, you can often see a rainbow: it is sunlight splitting up in the raindrops.'],
];

const name = (at: number) => MONTHS[at][0];
const cap = (text: string) => text[0].toUpperCase() + text.slice(1);

export const en: NatureTexts = {
  cards: {
    title: 'Nature',
    games: {
      seasons: {
        label: 'Seasons and Months',
        blurb: 'What happens in nature and when, and the twelve months in order',
        intro: 'A year has four seasons: winter, spring, summer and fall, and each has three months. Look at the picture and show when this happens!',
      },
    },
  },
  introFor: (step) => {
    if (step === 3) return 'Now let’s meet the months. There are twelve of them in a year, and each belongs to its own season.';
    if (step === 4 || step === 5) return 'The months always follow one another. Remember which month is the neighbor!';
    if (step === 6 || step === 8) return 'Put the cards in order. Tap two cards to swap them.';
    if (step === 7) return 'Every month has a number of its own: January is the first, and December the twelfth.';
    return undefined;
  },
  season: (id) => SEASONS[id],
  // A month's fact tells where ITS name comes from: each language has its own story (`own`).
  month: (at) => ({ name: name(at), fact: own(MONTHS[at][1]) }),
  sign: (at) => ({ ask: SIGNS[at][0], label: SIGNS[at][1], fact: SIGNS[at][2] }),
  monthSeason: {
    ask: (m) => `Which season does ${name(m)} belong to?`,
    hint: (m, season) => `${name(m)} is in ${SEASONS[season].said}. ${SEASONS[season].facts[0]}`,
  },
  after: {
    ask: (m) => `Which month comes after ${name(m)}?`,
    hint: (m) => `Remember the months in order: ${name((m + 11) % 12)}, ${name(m)}, and then…`,
    fact: (m) => `After ${name(m)} comes ${name((m + 1) % 12)}.`,
  },
  before: {
    ask: (m) => `Which month was before ${name(m)}?`,
    hint: (m) => `Remember the months in order. Which month does ${name(m)} come after?`,
    fact: (m) => `Before ${name(m)} came ${name((m + 11) % 12)}.`,
  },
  orderMonths: {
    ask: (season) => `Put the ${SEASONS[season].name.toLowerCase()} months in order. The first month goes in place 1.`,
    hint: (season, first) => `${cap(SEASONS[season].said)} begins with ${name(first)}. Tap two cards to swap them.`,
    fact: (season, months) => `${cap(SEASONS[season].said)} is ${name(months[0])}, ${name(months[1])} and ${name(months[2])}.`,
  },
  ends: ['first', 'last'],
  nth: {
    ask: (m) => `Which month is the ${ordinalWords(m + 1)} in the year?`,
    hint: 'The year begins with January. Count the months in order: January is the first, February the second, March the third…',
    fact: (m) => `${name(m)} is the ${ordinalWords(m + 1)} month of the year.`,
  },
  orderSeasons: {
    ask: (first) => `Put the seasons in order. Start with ${SEASONS[first].said}.`,
    circle: 'The seasons go round in a circle: winter, spring, summer, fall — and winter again.',
  },
};
