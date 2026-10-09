import { ordinalWords } from '@/core/lang/en';
import type { AstronomyTexts } from './types';

/** The Astronomy galaxy in English. */

const PLANETS: Record<string, string> = { mercury: 'Mercury', venus: 'Venus', earth: 'Earth', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune' };

const FEATURES: Record<string, string> = {
  red: 'The Red Planet',
  rings: 'Has big rings',
  home: 'This is where we live',
  biggest: 'The biggest planet',
  nearest: 'The nearest to the Sun',
  farthest: 'The farthest from the Sun',
  hottest: 'The hottest planet',
  sideways: 'Spins lying on its side',
  moon: 'Has one moon — the Moon',
  smallest: 'The smallest planet',
  spot: 'Has the Great Red Spot — a giant storm',
  winds: 'The fastest winds blow here',
  olympus: 'Has the tallest mountain — Olympus Mons',
  morning: 'It is called the Morning Star',
  year: 'Its year lasts only 88 days',
  light: 'Lighter than water',
  oceans: 'The blue planet with oceans',
  day: 'Its day lasts only 10 hours',
  icy: 'An icy giant, turquoise in color',
  math: 'It was found thanks to math',
  moons: 'Has two tiny moons — Phobos and Deimos',
  backwards: 'Spins backwards',
  titan: 'Has the moon Titan, with an atmosphere of its own',
  ganymede: 'Has the biggest moon — Ganymede',
};

/** The constellations, in the order of `FIGURES`: as it stands in a sentence, and what is told about it. */
const FIGURES: [name: string, fact: string][] = [
  ['Cassiopeia', 'Cassiopeia looks like the letter W. It is named after a queen from a myth.'],
  ['the Southern Cross', 'The Southern Cross can be seen only from the southern half of the Earth — it is on the flag of Australia.'],
  ['Sagitta', 'Sagitta means “the Arrow”. It is one of the smallest constellations in the sky.'],
  ['Delphinus', 'Delphinus, the Dolphin, is small but easy to spot in the summer sky.'],
  ['Aries', 'Aries is the ram with the golden fleece from an ancient Greek myth.'],
  ['Corvus', 'The four bright stars of Corvus, the Crow, make a four-sided shape in the sky.'],
  ['the Big Dipper', 'The Big Dipper is seven stars of the Great Bear constellation. It looks like a ladle.'],
  ['the Little Bear', 'At the tip of the Little Bear’s “tail” shines the North Star — it always points north.'],
  ['Cepheus', 'The constellation Cepheus looks like a little house with a pointed roof.'],
  ['Lyra', 'In Lyra, the Harp, shines Vega — one of the brightest stars in our sky.'],
  ['Gemini', 'The two brightest stars of Gemini, the Twins, are called Castor and Pollux — like the brothers in the myth.'],
  ['the Northern Crown', 'The stars of the Northern Crown form a half circle — just like a real crown.'],
  ['Scorpius', 'In the heart of Scorpius, the Scorpion, burns the red star Antares.'],
  ['Draco', 'Draco, the Dragon, winds its way between the Great Bear and the Little Bear.'],
  ['Orion', 'Orion is the hunter of the sky. The three stars in the middle are his belt.'],
  ['Leo', 'The brightest star of Leo, the Lion, is called Regulus — “the little king”.'],
  ['Hydra', 'Hydra is the longest constellation in the whole sky.'],
];

type Row = [question: string, fact: string];
/** The hundred questions of the planet quiz, in the order of `content/planetQuiz.ts`. */
const QUIZ: Record<string, Row[]> = {
  mercury: [
    ['Which planet goes around the Sun the fastest?', 'Mercury races around the Sun faster than any other planet — almost 50 kilometers every second.'],
    ['On which planet is it over 400 degrees by day and minus 170 by night?', 'Mercury has almost no air to hold the warmth: by day it scorches, and by night there is a bitter frost.'],
    ['Which planet is only a little bigger than our Moon?', 'Mercury is only a little bigger than the Moon — and covered with craters just the same.'],
    ['Which planet is all craters and looks very much like the Moon?', 'The surface of Mercury is pitted with craters: meteorites have been hitting it for billions of years.'],
    ['Which planet has neither moons nor air?', 'Mercury has no moon at all and almost no atmosphere.'],
    ['Which planet does sunlight reach the soonest — in just three minutes?', 'Light from the Sun takes about three minutes to reach Mercury, and more than eight to reach the Earth.'],
    ['On which planet does the Sun look three times bigger in the sky than from the Earth?', 'From Mercury the Sun looks three times bigger than from the Earth — that is how close it is.'],
    ['Which planet is named after the swift Roman messenger god?', 'Mercury was the Romans’ messenger god in winged sandals. The planet got his name because it is the fastest.'],
    ['Which planet is the hardest to see from the Earth, because it hides in the glare of the Sun?', 'Mercury can be seen only for a short while at dawn or just after sunset — it always stays close to the Sun.'],
    ['Which planet did the spacecraft MESSENGER work at?', 'The MESSENGER spacecraft circled Mercury for four years and photographed its whole surface.'],
    ['On which planet is ice hidden in dark craters near the poles, although it is the nearest to the Sun?', 'The Sun never looks into the craters at Mercury’s poles, so ice lies there.'],
    ['In which planet does an iron core take up almost the whole inside?', 'Mercury is like an iron ball in a thin stone shell: the core takes up most of it.'],
  ],
  venus: [
    ['On which planet is it 460 degrees both by day and by night?', 'Venus is hotter than an oven: its thick clouds do not let the heat out by day or by night.'],
    ['Which planet is wrapped in thick yellow clouds of acid?', 'The clouds of Venus are made of burning acid. The surface of the planet cannot be seen through them.'],
    ['Which planet is called the Earth’s sister, because it is almost the same size?', 'Venus is almost the same size as the Earth, but nothing could live on it.'],
    ['On which planet does the Sun rise in the west and set in the east?', 'Venus spins backwards, so the Sun rises there in the west.'],
    ['Which planet turns the slowest — once in 243 Earth days?', 'Venus turns so slowly that one turn takes longer than its year.'],
    ['Which planet is the brightest in our night sky?', 'After the Sun and the Moon, the brightest thing in the sky is Venus: its clouds reflect light wonderfully.'],
    ['On which planet does the air press as hard as if you were at the bottom of an ocean?', 'The air on Venus presses ninety times harder than on the Earth — like water a kilometer deep.'],
    ['Which planet is named after the Roman goddess of beauty?', 'Venus was the Roman goddess of beauty and love. The planet got her name for its bright glow.'],
    ['Which planet has the most volcanoes?', 'Venus has more than a thousand big volcanoes — more than any other planet.'],
    ['Which planet comes the closest to the Earth?', 'Venus comes closer to the Earth than any other planet — but even then it is forty million kilometers away.'],
    ['Which planet is the second from the Sun?', 'Venus is the second planet from the Sun, between Mercury and the Earth.'],
    ['On which planet does acid rain fall and dry up before it reaches the ground?', 'It is so hot on Venus that drops of acid rain turn to vapor while still in the air.'],
  ],
  earth: [
    ['On which planet is there liquid water — rivers, seas and oceans?', 'Only on the Earth does water flow in rivers and fill oceans: it is neither too hot nor too cold here.'],
    ['Which is the only planet where there is life for certain?', 'The Earth is the only planet we know that has life: plants, animals and people.'],
    ['On which planet does a day last exactly 24 hours?', 'The Earth turns around once in 24 hours — that is why day follows night.'],
    ['On which planet does a year last 365 days?', 'In 365 days the Earth goes once around the Sun — and that is a year.'],
    ['Which planet is the third from the Sun?', 'The Earth is the third planet from the Sun, between Venus and Mars.'],
    ['On which planet is there air that people can breathe?', 'Only the air of the Earth has enough oxygen for people and animals to breathe.'],
    ['Which planet looks blue from space, with white clouds and green continents?', 'From space the Earth looks like a little blue ball: most of it is covered with water.'],
    ['Which planet does light from the Sun reach in a little over eight minutes?', 'A ray of sunlight reaches the Earth in eight minutes and twenty seconds.'],
    ['Which planet is the biggest of the four rocky ones?', 'The Earth is the biggest of the rocky planets: bigger than Venus, Mars and Mercury.'],
    ['Which planet does the International Space Station fly around?', 'The International Space Station goes around the Earth in an hour and a half.'],
    ['Which planet did all the space rockets take off from?', 'Every rocket, satellite and astronaut set out for space from the Earth.'],
    ['On which planet do you weigh exactly what the scales at home show?', 'The scales at home show your weight on the Earth. On other planets it would be different.'],
    ['On which planet is there a total eclipse of the Sun, when the Moon covers the Sun exactly?', 'From the Earth the Moon and the Sun look the same size, so the Moon can cover the Sun completely.'],
  ],
  mars: [
    ['Which planet do rovers drive across?', 'Robot rovers drive across Mars: they take pictures, drill into rocks and look for traces of water.'],
    ['On which planet is the daytime sky pinkish-red and the sunset blue?', 'Because of the rusty dust, the sky on Mars is pink by day and blue at sunset. On the Earth it is the other way around.'],
    ['Which planet has the biggest canyon in the Solar System?', 'Valles Marineris on Mars is so long that it would stretch right across Europe.'],
    ['On which planet is a day only a little longer than ours — 24 hours 37 minutes?', 'A day on Mars is almost the same as on the Earth: only thirty-seven minutes longer.'],
    ['On which planet does a year last almost two Earth years?', 'Mars goes around the Sun in 687 days — almost two Earth years.'],
    ['On which planet do people dream of building the first base?', 'Scientists are preparing to send people to Mars: of all the planets it is the most like the Earth.'],
    ['On which planet can dust storms cover the whole of it?', 'A dust storm on Mars can cover the whole planet with dust for several months.'],
    ['Which planet has ice caps at its poles and the dry beds of ancient rivers?', 'Rivers once flowed on Mars. Now water is left there only as ice.'],
    ['Which planet is named after the Roman god of war?', 'Mars was the Roman god of war. The planet got his name for its red color.'],
    ['Which planet is the fourth from the Sun?', 'Mars is the fourth planet from the Sun, right after the Earth.'],
    ['Which planet is about half as wide as the Earth?', 'Mars is half as wide as the Earth — and ten times lighter.'],
    ['On which planet did a helicopter from the Earth fly for the first time?', 'The little helicopter Ingenuity took off on Mars — the first flight ever on another planet.'],
    ['On which planet was ice found under the soil, and where do we look for traces of ancient life?', 'There is ice under the soil of Mars. Scientists are looking to see whether microbes once lived there.'],
  ],
  jupiter: [
    ['On which planet would you weigh the most — two and a half times more than on the Earth?', 'Jupiter pulls the hardest: a child who weighs thirty kilograms would weigh seventy-five there.'],
    ['Which planet spins the fastest?', 'Jupiter turns around once in under ten hours — faster than any other planet.'],
    ['Which planet is the fifth from the Sun — the first of the giants?', 'Jupiter is the fifth planet from the Sun and the first of the four giants.'],
    ['Which planet is heavier than all the other planets put together?', 'Jupiter is two and a half times heavier than all the other planets together.'],
    ['Which planet has the moon Europa, with an ocean under its ice?', 'Under the icy crust of Europa, a moon of Jupiter, hides an ocean of salty water.'],
    ['Which planet has the moon Io, with hundreds of active volcanoes?', 'Io, a moon of Jupiter, is the most volcanic place in the Solar System.'],
    ['Galileo discovered four big moons of which planet?', 'Through his telescope Galileo saw four moons of Jupiter: Io, Europa, Ganymede and Callisto.'],
    ['On which planet does a year last almost twelve Earth years?', 'Jupiter goes around the Sun in almost twelve Earth years.'],
    ['Which planet is striped — with brown and white belts of cloud?', 'The stripes of Jupiter are belts of cloud that the wind drives in different directions.'],
    ['Which planet is named after the chief Roman god?', 'Jupiter was the king of the Roman gods. The biggest planet was given his name.'],
    ['Which planet does the spacecraft Juno work at?', 'The Juno spacecraft circles Jupiter and peers beneath its clouds.'],
    ['Which planet protects the Earth by pulling comets and asteroids toward itself?', 'With its pull Jupiter catches many comets and asteroids that might otherwise fly toward the Earth.'],
    ['On which planet do the most powerful auroras shine?', 'The auroras on Jupiter are hundreds of times more powerful than those on the Earth, and they never go out.'],
  ],
  saturn: [
    ['Which planet has the most moons — more than a hundred and forty?', 'More than a hundred and forty moons have been found around Saturn — more than around any other planet.'],
    ['Which planet is the second biggest?', 'Saturn is the second biggest planet: only Jupiter is bigger.'],
    ['Which planet is the sixth from the Sun?', 'Saturn is the sixth planet from the Sun, between Jupiter and Uranus.'],
    ['On which planet does a year last almost thirty Earth years?', 'Saturn goes around the Sun in twenty-nine and a half Earth years.'],
    ['The rings of which planet are made of pieces of ice and rock?', 'The rings of Saturn are billions of bits of ice and stone: from the size of a grain of sand to the size of a house.'],
    ['At the pole of which planet does an amazing six-sided storm spin?', 'At the north pole of Saturn rages a storm in the shape of a perfect hexagon.'],
    ['Which planet has the moon Enceladus, which shoots fountains of water into space?', 'Enceladus, a moon of Saturn, shoots geysers into space from under its icy crust.'],
    ['Which planet did the Cassini spacecraft study for thirteen years?', 'The Cassini spacecraft spent thirteen years studying Saturn, its rings and its moons.'],
    ['Which planet is named after the Roman god of farming and time?', 'Saturn was the Romans’ god of farming and time, the father of Jupiter.'],
    ['Which planet is the farthest of those easily seen without a telescope?', 'Saturn is the farthest planet that people have always been able to see with the naked eye.'],
    ['Which planet is the most squashed — like a flattened ball?', 'Saturn spins so fast that it has visibly flattened at the poles.'],
    ['The rings of which planet can be seen even through a small telescope?', 'The rings of Saturn are so wide and bright that they can be seen even through an amateur telescope.'],
    ['On a moon of which planet are there lakes and rain of liquid gas?', 'On Titan, a moon of Saturn, there are lakes and rivers — not of water, but of liquid methane.'],
  ],
  uranus: [
    ['Which planet is the coldest — it gets down to minus 224 degrees there?', 'The lowest temperature of any planet was measured on Uranus: minus 224 degrees.'],
    ['Which planet is the seventh from the Sun?', 'Uranus is the seventh planet from the Sun, between Saturn and Neptune.'],
    ['On which planet does a year last 84 Earth years?', 'Uranus goes around the Sun in eighty-four Earth years — as long as a long human life.'],
    ['On which planet do winter and summer last twenty-one years each?', 'Uranus lies on its side, so each season there lasts twenty-one years.'],
    ['Which planet was the first to be discovered with a telescope?', 'Uranus was the first planet discovered through a telescope — by William Herschel.'],
    ['The moons of which planet are named after characters from Shakespeare?', 'The moons of Uranus are named like characters in Shakespeare’s plays: Titania, Oberon, Miranda, Ariel.'],
    ['Which planet is named after the Greek god of the sky?', 'Uranus was the ancient Greek god of the sky. It is the only planet with a Greek name rather than a Roman one.'],
    ['Which planet does sunlight take almost three hours to reach?', 'A ray of sunlight takes two hours and forty minutes to reach Uranus.'],
    ['Which planet is the third biggest?', 'Uranus is the third biggest planet, after Jupiter and Saturn.'],
    ['On which planet can a pole be lit by the Sun for forty-two years in a row?', 'At the poles of Uranus a day lasts forty-two years, and then a night lasts just as long.'],
    ['Which planet rolls along its orbit on its side, like a ball, and has thirteen dark rings?', 'Uranus has thirteen thin dark rings, and they stand almost upright, because the planet lies on its side.'],
  ],
  neptune: [
    ['Which planet is the eighth — the last — from the Sun?', 'Neptune is the eighth and last planet of the Solar System.'],
    ['On which planet does a year last 165 Earth years?', 'Neptune goes around the Sun in one hundred sixty-five Earth years.'],
    ['Which planet does sunlight take more than four hours to reach?', 'A ray of sunlight takes four hours and ten minutes to reach Neptune.'],
    ['Which planet is dark blue, like the deep sea?', 'Neptune is dark blue: the methane gas in its air soaks up red light.'],
    ['Which planet is named after the Roman god of the seas?', 'Neptune was the Roman god of the seas. The blue planet was given his name.'],
    ['Which planet has the moon Triton, which circles it “backwards”?', 'Triton, a moon of Neptune, goes around the opposite way — not the way the planet itself turns.'],
    ['Which planet can never be seen without a telescope — even on the darkest night?', 'Neptune is so far away that it can be seen only through a telescope.'],
    ['On which planet has only one year passed since the day it was discovered?', 'Neptune was discovered in 1846, and it finished its first full trip around the Sun only in 2011.'],
    ['Which planet is the fourth biggest, but heavier than Uranus?', 'Neptune is a little narrower than Uranus, yet heavier.'],
    ['Which planet is the farthest from the Earth?', 'Neptune is the planet farthest from us: more than four billion kilometers away.'],
    ['On which planet was the Great Dark Spot seen — a storm as big as the Earth?', 'The Great Dark Spot on Neptune is a gigantic storm. It disappears and then comes back again.'],
    ['Which planet did Voyager 2 fly past last, before leaving the Solar System?', 'Voyager 2 is the only spacecraft ever to visit Neptune. After that it flew off toward the stars.'],
    ['On which planet do the seasons last forty years each?', 'A year on Neptune is so long that each season there lasts more than forty Earth years.'],
  ],
};

const cap = (text: string) => text[0].toUpperCase() + text.slice(1);
/** «the Big Dipper» → «Big Dipper», for a card. */
const bare = (name: string) => cap(name.replace(/^the /, ''));

export const en: AstronomyTexts = {
  cards: {
    title: 'Astronomy',
    games: {
      planets: {
        label: 'Parade of Planets',
        blurb: 'Line up the planets from the Sun and by size, and learn a hundred curious things about them',
        intro: 'Eight planets circle the Sun. Line them up in order: first the one nearest the Sun!',
      },
      constellations: {
        label: 'Space Navigator',
        blurb: 'Join the stars in order, draw constellations and find them in the starry sky',
        intro: 'In the sky the stars make pictures — constellations. Tap the stars in order, starting from the smallest number, and see what comes out!',
      },
    },
  },
  introFor: {
    planets: (step, quizFrom) => {
      if (step === 2) return 'Now the far-off giant planets: Jupiter, Saturn, Uranus and Neptune.';
      if (step === 4) return 'Planets can be tiny or gigantic. Line them up by size: from the smallest to the biggest!';
      if (step === 7) return 'Every planet is special in some way. Match each clue to the planet it tells about.';
      if (step === quizFrom) return 'Now — questions about the planets: where it is hot and where it is cold, where there is water, how long a day and a year last. Tap the planet in question!';
      return undefined;
    },
    constellations: (step, sky) => {
      if (step === 3) return 'Now the counting does not start from one. Find the smallest number and go on in order.';
      if (step === 6) return 'The constellations are getting bigger, and now the stars carry letters. Join them in alphabetical order!';
      if (step === 11) return 'Now we count in twos: two, four, six, eight…';
      if (step === 13) return 'And now in tens: ten, twenty, thirty…';
      if (step === sky + 1) return 'Now there are many stars in the sky, and they have no numbers. The stars of the constellation are a little bigger than the others. Find them and join them with your finger!';
      if (step === sky + 7) return 'There are more stars in the sky now, and the constellation’s stars are not so big any more. Look closely!';
      if (step === sky + 13) return 'The hardest sky: the stars of the constellation are only slightly bigger than the others.';
      return undefined;
    },
  },
  planet: (id) => PLANETS[id] ?? id,
  sun: 'The Sun',
  lineUp: {
    sun: {
      ask: 'Line up the planets: from the nearest to the Sun to the farthest.',
      ends: ['by the Sun', 'farthest'],
      hint: (first, all) => `The planet nearest the Sun comes first: ${first}. All the planets in order: ${all}.`,
      fact: (names) => `From the Sun these planets stand like this: ${names}.`,
    },
    size: {
      ask: 'Line up the planets by size: from the smallest to the biggest.',
      ends: ['smallest', 'biggest'],
      hint: (smallest, biggest) => `The smallest here is ${smallest}, and the biggest is ${biggest}.`,
      fact: (names) => `From the smallest to the biggest: ${names}.`,
    },
  },
  feature: (id) => FEATURES[id] ?? id,
  features: {
    ask: 'Match each clue to its planet.',
    hint: (feature, planet) => `“${feature}” — that is ${planet}.`,
    fact: (feature, planet) => `${feature} — that is ${planet}.`,
  },
  quiz: (id) => {
    const [, planet, at] = /^([a-z]+)(\d+)$/.exec(id) ?? [];
    const [question = '', fact = ''] = QUIZ[planet]?.[Number(at)] ?? [];
    return { question, fact };
  },
  quizHint: (planet, place) => `The name of this planet begins with the letter “${planet[0]}”. It is the ${ordinalWords(place + 1)} from the Sun.`,
  alphabet: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
  figure: (at) => ({ name: bare(FIGURES[at][0]), fact: FIGURES[at][1] }),
  sky: {
    abc: (first, last) => `Join the stars in alphabetical order: from ${first} to ${last}.`,
    order: (first, last) => `Join the stars in order: from ${first} to ${last}.`,
    skip: (by, firstThree, last) => `Join the stars, counting in ${by === 2 ? 'twos' : 'tens'}: ${firstThree} — and on up to ${last}.`,
    hintAbc: (first, firstFour) => `Start from the letter ${first}. Then follow the alphabet: ${firstFour}…`,
    hint: (first, nextThree) => `Start from star ${first}. Then: ${nextThree}…`,
    is: (at) => `This is ${FIGURES[at][0]}!`,
  },
  find: {
    ask: (at) => `Find ${FIGURES[at][0]} in the sky. Its stars are a little bigger than the others — join them with your finger.`,
    hint: (at, stars) => `${cap(FIGURES[at][0])} has ${stars} stars. They twinkle — tap each one.`,
  },
};
