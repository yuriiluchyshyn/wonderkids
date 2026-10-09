/** Content for the Geography games. Ordered easy → hard: early path steps use
 *  only the first entries, later steps unlock the rest. */
import { own } from '@/core/language/marks';
import TEXTS from '@/locales/app/uk/games/geography.json';

const J = TEXTS.content.data;

export interface Dweller {
  id: string;
  name: string;
  emoji: string;
  home: string;
}

/** Animals placed on their home continent in «Склади Карту». */
export const CONTINENT_ANIMALS: Dweller[] = [
  { id: 'kangaroo', name: J.CONTINENT_ANIMALS.kangaroo.name, emoji: '🦘', home: 'australia' },
  { id: 'penguin', name: J.CONTINENT_ANIMALS.penguin.name, emoji: '🐧', home: 'antarctica' },
  { id: 'lion', name: J.CONTINENT_ANIMALS.lion.name, emoji: '🦁', home: 'africa' },
  { id: 'panda', name: J.CONTINENT_ANIMALS.panda.name, emoji: '🐼', home: 'asia' },
  { id: 'llama', name: J.CONTINENT_ANIMALS.llama.name, emoji: '🦙', home: 'south_america' },
  { id: 'bison', name: J.CONTINENT_ANIMALS.bison.name, emoji: '🦬', home: 'north_america' },
  { id: 'hedgehog', name: J.CONTINENT_ANIMALS.hedgehog.name, emoji: '🦔', home: 'europe' },
  { id: 'giraffe', name: J.CONTINENT_ANIMALS.giraffe.name, emoji: '🦒', home: 'africa' },
  { id: 'koala', name: J.CONTINENT_ANIMALS.koala.name, emoji: '🐨', home: 'australia' },
  { id: 'tiger', name: J.CONTINENT_ANIMALS.tiger.name, emoji: '🐅', home: 'asia' },
];

export type BiomeId = 'arctic' | 'jungle' | 'desert' | 'ocean' | 'savanna' | 'forest' | 'mountains';

export interface Biome {
  id: BiomeId;
  name: string;
  emoji: string;
  /** «Хто живе …?» — the zone in the locative. */
  where: string;
  /** What this zone "says" to an animal that does not belong there. */
  no: string;
  /** How to recognise the zone without naming it («Яка це природна зона?»). */
  signs: [string, string];
}

/** The first four open the game; the rest join as the path goes on. */
export const BIOMES: Biome[] = [
  {
    id: 'arctic', name: J.BIOMES.arctic.name, emoji: '❄️', where: J.BIOMES.arctic.where, no: J.BIOMES.arctic.no,
    signs: [J.BIOMES.arctic.signs[0], J.BIOMES.arctic.signs[1]],
  },
  {
    id: 'jungle', name: J.BIOMES.jungle.name, emoji: '🌴', where: J.BIOMES.jungle.where, no: J.BIOMES.jungle.no,
    signs: [J.BIOMES.jungle.signs[0], J.BIOMES.jungle.signs[1]],
  },
  {
    id: 'desert', name: J.BIOMES.desert.name, emoji: '🏜️', where: J.BIOMES.desert.where, no: J.BIOMES.desert.no,
    signs: [J.BIOMES.desert.signs[0], J.BIOMES.desert.signs[1]],
  },
  {
    id: 'ocean', name: J.BIOMES.ocean.name, emoji: '🌊', where: J.BIOMES.ocean.where, no: J.BIOMES.ocean.no,
    signs: [J.BIOMES.ocean.signs[0], J.BIOMES.ocean.signs[1]],
  },
  {
    id: 'savanna', name: J.BIOMES.savanna.name, emoji: '🌾', where: J.BIOMES.savanna.where, no: J.BIOMES.savanna.no,
    signs: [J.BIOMES.savanna.signs[0], J.BIOMES.savanna.signs[1]],
  },
  {
    id: 'forest', name: J.BIOMES.forest.name, emoji: '🌲', where: J.BIOMES.forest.where, no: J.BIOMES.forest.no,
    signs: [J.BIOMES.forest.signs[0], J.BIOMES.forest.signs[1]],
  },
  {
    id: 'mountains', name: J.BIOMES.mountains.name, emoji: '🏔️', where: J.BIOMES.mountains.where, no: J.BIOMES.mountains.no,
    signs: [J.BIOMES.mountains.signs[0], J.BIOMES.mountains.signs[1]],
  },
];

/** A few facts about each zone itself (told after «Яка це природна зона?»). */
export const BIOME_FACTS: Record<BiomeId, string[]> = {
  arctic: J.BIOME_FACTS.arctic,
  jungle: J.BIOME_FACTS.jungle,
  desert: J.BIOME_FACTS.desert,
  ocean: J.BIOME_FACTS.ocean,
  savanna: J.BIOME_FACTS.savanna,
  forest: [
    J.BIOME_FACTS.forest[0],
    J.BIOME_FACTS.forest[1],
    J.BIOME_FACTS.forest[2],
    // Ukraine's own: the other languages tell of their own forests and mountains here (`own`).
    own(J.BIOME_FACTS.forest[3]),
  ],
  mountains: [
    J.BIOME_FACTS.mountains[0][1] + own(J.BIOME_FACTS.mountains[0][2]),
    J.BIOME_FACTS.mountains[1],
    J.BIOME_FACTS.mountains[2],
    J.BIOME_FACTS.mountains[3],
  ],
};

export interface BiomeAnimal extends Dweller {
  home: BiomeId;
  fact: string;
  /**
   * Zones where this animal could arguably live too (a seal swims in the
   * ocean, snakes live in jungles). Such a zone is never offered as a wrong
   * answer for it, so no question has two defensible answers.
   */
  also?: BiomeId[];
}

/**
 * Ordered by when the path meets them: the first sixteen cover the four zones
 * the game opens with, then the savanna and the forest arrive, then more sea
 * and jungle dwellers, and the mountains last.
 */
export const BIOME_ANIMALS: BiomeAnimal[] = [
  { id: 'polar_bear', name: J.BIOME_ANIMALS.polar_bear.name, emoji: '🐻‍❄️', home: 'arctic', fact: J.BIOME_ANIMALS.polar_bear.fact },
  { id: 'camel', name: J.BIOME_ANIMALS.camel.name, emoji: '🐪', home: 'desert', fact: J.BIOME_ANIMALS.camel.fact },
  { id: 'monkey', name: J.BIOME_ANIMALS.monkey.name, emoji: '🐒', home: 'jungle', fact: J.BIOME_ANIMALS.monkey.fact },
  { id: 'dolphin', name: J.BIOME_ANIMALS.dolphin.name, emoji: '🐬', home: 'ocean', fact: J.BIOME_ANIMALS.dolphin.fact },
  { id: 'seal', name: J.BIOME_ANIMALS.seal.name, emoji: '🦭', home: 'arctic', also: ['ocean'], fact: J.BIOME_ANIMALS.seal.fact },
  { id: 'parrot', name: J.BIOME_ANIMALS.parrot.name, emoji: '🦜', home: 'jungle', fact: J.BIOME_ANIMALS.parrot.fact },
  { id: 'scorpion', name: J.BIOME_ANIMALS.scorpion.name, emoji: '🦂', home: 'desert', fact: J.BIOME_ANIMALS.scorpion.fact },
  { id: 'octopus', name: J.BIOME_ANIMALS.octopus.name, emoji: '🐙', home: 'ocean', fact: J.BIOME_ANIMALS.octopus.fact },
  { id: 'arctic_hare', name: J.BIOME_ANIMALS.arctic_hare.name, emoji: '🐇', home: 'arctic', fact: J.BIOME_ANIMALS.arctic_hare.fact },
  { id: 'tiger', name: J.BIOME_ANIMALS.tiger.name, emoji: '🐅', home: 'jungle', also: ['forest'], fact: J.BIOME_ANIMALS.tiger.fact },
  { id: 'lizard', name: J.BIOME_ANIMALS.lizard.name, emoji: '🦎', home: 'desert', also: ['jungle', 'forest', 'savanna'], fact: J.BIOME_ANIMALS.lizard.fact },
  { id: 'whale', name: J.BIOME_ANIMALS.whale.name, emoji: '🐋', home: 'ocean', fact: J.BIOME_ANIMALS.whale.fact },
  { id: 'shark', name: J.BIOME_ANIMALS.shark.name, emoji: '🦈', home: 'ocean', fact: J.BIOME_ANIMALS.shark.fact },
  { id: 'gorilla', name: J.BIOME_ANIMALS.gorilla.name, emoji: '🦍', home: 'jungle', fact: J.BIOME_ANIMALS.gorilla.fact },
  { id: 'snake', name: J.BIOME_ANIMALS.snake.name, emoji: '🐍', home: 'desert', also: ['jungle', 'forest', 'savanna'], fact: J.BIOME_ANIMALS.snake.fact },
  { id: 'arctic_fox', name: J.BIOME_ANIMALS.arctic_fox.name, emoji: '🦊', home: 'arctic', fact: J.BIOME_ANIMALS.arctic_fox.fact },
  // The savanna.
  { id: 'lion', name: J.BIOME_ANIMALS.lion.name, emoji: '🦁', home: 'savanna', fact: J.BIOME_ANIMALS.lion.fact },
  { id: 'zebra', name: J.BIOME_ANIMALS.zebra.name, emoji: '🦓', home: 'savanna', fact: J.BIOME_ANIMALS.zebra.fact },
  { id: 'giraffe', name: J.BIOME_ANIMALS.giraffe.name, emoji: '🦒', home: 'savanna', fact: J.BIOME_ANIMALS.giraffe.fact },
  { id: 'elephant', name: J.BIOME_ANIMALS.elephant.name, emoji: '🐘', home: 'savanna', also: ['jungle'], fact: J.BIOME_ANIMALS.elephant.fact },
  { id: 'rhino', name: J.BIOME_ANIMALS.rhino.name, emoji: '🦏', home: 'savanna', fact: J.BIOME_ANIMALS.rhino.fact },
  // The forest.
  { id: 'brown_bear', name: J.BIOME_ANIMALS.brown_bear.name, emoji: '🐻', home: 'forest', also: ['mountains'], fact: J.BIOME_ANIMALS.brown_bear.fact },
  { id: 'squirrel', name: J.BIOME_ANIMALS.squirrel.name, emoji: '🐿️', home: 'forest', fact: J.BIOME_ANIMALS.squirrel.fact },
  { id: 'wolf', name: J.BIOME_ANIMALS.wolf.name, emoji: '🐺', home: 'forest', also: ['arctic', 'mountains'], fact: J.BIOME_ANIMALS.wolf.fact },
  { id: 'hedgehog', name: J.BIOME_ANIMALS.hedgehog.name, emoji: '🦔', home: 'forest', fact: J.BIOME_ANIMALS.hedgehog.fact },
  { id: 'owl', name: J.BIOME_ANIMALS.owl.name, emoji: '🦉', home: 'forest', also: ['arctic', 'desert', 'mountains'], fact: J.BIOME_ANIMALS.owl.fact },
  { id: 'deer', name: J.BIOME_ANIMALS.deer.name, emoji: '🦌', home: 'forest', also: ['arctic', 'mountains'], fact: J.BIOME_ANIMALS.deer.fact },
  { id: 'boar', name: J.BIOME_ANIMALS.boar.name, emoji: '🐗', home: 'forest', fact: J.BIOME_ANIMALS.boar.fact },
  // More dwellers of the sea and the jungle.
  { id: 'sea_turtle', name: J.BIOME_ANIMALS.sea_turtle.name, emoji: '🐢', home: 'ocean', fact: J.BIOME_ANIMALS.sea_turtle.fact },
  { id: 'orangutan', name: J.BIOME_ANIMALS.orangutan.name, emoji: '🦧', home: 'jungle', fact: J.BIOME_ANIMALS.orangutan.fact },
  { id: 'crab', name: J.BIOME_ANIMALS.crab.name, emoji: '🦀', home: 'ocean', fact: J.BIOME_ANIMALS.crab.fact },
  { id: 'sloth', name: J.BIOME_ANIMALS.sloth.name, emoji: '🦥', home: 'jungle', fact: J.BIOME_ANIMALS.sloth.fact },
  { id: 'jellyfish', name: J.BIOME_ANIMALS.jellyfish.name, emoji: '🪼', home: 'ocean', fact: J.BIOME_ANIMALS.jellyfish.fact },
  { id: 'clownfish', name: J.BIOME_ANIMALS.clownfish.name, emoji: '🐠', home: 'ocean', fact: J.BIOME_ANIMALS.clownfish.fact },
  { id: 'squid', name: J.BIOME_ANIMALS.squid.name, emoji: '🦑', home: 'ocean', fact: J.BIOME_ANIMALS.squid.fact },
  // The mountains.
  { id: 'mountain_goat', name: J.BIOME_ANIMALS.mountain_goat.name, emoji: '🐐', home: 'mountains', fact: J.BIOME_ANIMALS.mountain_goat.fact },
  { id: 'eagle', name: J.BIOME_ANIMALS.eagle.name, emoji: '🦅', home: 'mountains', also: ['forest', 'desert', 'savanna'], fact: J.BIOME_ANIMALS.eagle.fact },
  { id: 'llama', name: J.BIOME_ANIMALS.llama.name, emoji: '🦙', home: 'mountains', fact: J.BIOME_ANIMALS.llama.fact },
  { id: 'mountain_ram', name: J.BIOME_ANIMALS.mountain_ram.name, emoji: '🐏', home: 'mountains', fact: J.BIOME_ANIMALS.mountain_ram.fact },
];

export const OCEAN_FACTS: Record<string, string> = J.OCEAN_FACTS;

/** «Пливи до …» without naming the ocean: three riddles each, easy first. */
export const OCEAN_RIDDLES: Record<string, [string, string, string]> = {
  pacific: [J.OCEAN_RIDDLES.pacific[0], J.OCEAN_RIDDLES.pacific[1], J.OCEAN_RIDDLES.pacific[2]],
  atlantic: [J.OCEAN_RIDDLES.atlantic[0], J.OCEAN_RIDDLES.atlantic[1], J.OCEAN_RIDDLES.atlantic[2]],
  indian: [J.OCEAN_RIDDLES.indian[0], J.OCEAN_RIDDLES.indian[1], J.OCEAN_RIDDLES.indian[2]],
  arctic: [J.OCEAN_RIDDLES.arctic[0], J.OCEAN_RIDDLES.arctic[1], J.OCEAN_RIDDLES.arctic[2]],
  southern: [J.OCEAN_RIDDLES.southern[0], J.OCEAN_RIDDLES.southern[1], J.OCEAN_RIDDLES.southern[2]],
};

export interface OceanPart {
  id: string;
  /** As the question names it. */
  name: string;
  /** The ocean it belongs to. */
  ocean: string;
  fact: string;
}

/** Seas and the ocean each is a part of — the best-known first. */
export const SEAS: OceanPart[] = [
  { id: 'black', name: J.SEAS.black.name, ocean: 'atlantic', fact: J.SEAS.black.fact },
  { id: 'mediterranean', name: J.SEAS.mediterranean.name, ocean: 'atlantic', fact: J.SEAS.mediterranean.fact },
  { id: 'red', name: J.SEAS.red.name, ocean: 'indian', fact: J.SEAS.red.fact },
  { id: 'baltic', name: J.SEAS.baltic.name, ocean: 'atlantic', fact: J.SEAS.baltic.fact },
  { id: 'caribbean', name: J.SEAS.caribbean.name, ocean: 'atlantic', fact: J.SEAS.caribbean.fact },
  { id: 'japan', name: J.SEAS.japan.name, ocean: 'pacific', fact: J.SEAS.japan.fact },
  { id: 'north', name: J.SEAS.north.name, ocean: 'atlantic', fact: J.SEAS.north.fact },
  { id: 'arabian', name: J.SEAS.arabian.name, ocean: 'indian', fact: J.SEAS.arabian.fact },
  { id: 'coral', name: J.SEAS.coral.name, ocean: 'pacific', fact: J.SEAS.coral.fact },
  { id: 'barents', name: J.SEAS.barents.name, ocean: 'arctic', fact: J.SEAS.barents.fact },
  { id: 'bering', name: J.SEAS.bering.name, ocean: 'pacific', fact: J.SEAS.bering.fact },
  { id: 'ross', name: J.SEAS.ross.name, ocean: 'southern', fact: J.SEAS.ross.fact },
  { id: 'south_china', name: J.SEAS.south_china.name, ocean: 'pacific', fact: J.SEAS.south_china.fact },
  { id: 'andaman', name: J.SEAS.andaman.name, ocean: 'indian', fact: J.SEAS.andaman.fact },
  { id: 'greenland', name: J.SEAS.greenland.name, ocean: 'arctic', fact: J.SEAS.greenland.fact },
  { id: 'beaufort', name: J.SEAS.beaufort.name, ocean: 'arctic', fact: J.SEAS.beaufort.fact },
  { id: 'weddell', name: J.SEAS.weddell.name, ocean: 'southern', fact: J.SEAS.weddell.fact },
];

/** Famous places: «У якому океані …?» — `name` completes that question. */
export const OCEAN_PLACES: OceanPart[] = [
  { id: 'mariana', name: J.OCEAN_PLACES.mariana.name, ocean: 'pacific', fact: J.OCEAN_PLACES.mariana.fact },
  { id: 'titanic', name: J.OCEAN_PLACES.titanic.name, ocean: 'atlantic', fact: J.OCEAN_PLACES.titanic.fact },
  { id: 'madagascar', name: J.OCEAN_PLACES.madagascar.name, ocean: 'indian', fact: J.OCEAN_PLACES.madagascar.fact },
  { id: 'svalbard', name: J.OCEAN_PLACES.svalbard.name, ocean: 'arctic', fact: J.OCEAN_PLACES.svalbard.fact },
  { id: 'reef', name: J.OCEAN_PLACES.reef.name, ocean: 'pacific', fact: J.OCEAN_PLACES.reef.fact },
  { id: 'hawaii', name: J.OCEAN_PLACES.hawaii.name, ocean: 'pacific', fact: J.OCEAN_PLACES.hawaii.fact },
  { id: 'iceland', name: J.OCEAN_PLACES.iceland.name, ocean: 'atlantic', fact: J.OCEAN_PLACES.iceland.fact },
  { id: 'maldives', name: J.OCEAN_PLACES.maldives.name, ocean: 'indian', fact: J.OCEAN_PLACES.maldives.fact },
  { id: 'bermuda', name: J.OCEAN_PLACES.bermuda.name, ocean: 'atlantic', fact: J.OCEAN_PLACES.bermuda.fact },
  { id: 'galapagos', name: J.OCEAN_PLACES.galapagos.name, ocean: 'pacific', fact: J.OCEAN_PLACES.galapagos.fact },
  { id: 'sri_lanka', name: J.OCEAN_PLACES.sri_lanka.name, ocean: 'indian', fact: J.OCEAN_PLACES.sri_lanka.fact },
  { id: 'easter', name: J.OCEAN_PLACES.easter.name, ocean: 'pacific', fact: J.OCEAN_PLACES.easter.fact },
];

/** Landmarks → the capital they stand in. */
export const LANDMARKS = [
  { id: 'paris', emoji: '🗼', landmark: J.LANDMARKS.paris.landmark, capital: J.LANDMARKS.paris.capital, country: J.LANDMARKS.paris.country },
  { id: 'kyiv', emoji: '⛪', landmark: J.LANDMARKS.kyiv.landmark, capital: J.LANDMARKS.kyiv.capital, country: J.LANDMARKS.kyiv.country },
  { id: 'london', emoji: '🕰️', landmark: J.LANDMARKS.london.landmark, capital: J.LANDMARKS.london.capital, country: J.LANDMARKS.london.country },
  { id: 'rome', emoji: '🏟️', landmark: J.LANDMARKS.rome.landmark, capital: J.LANDMARKS.rome.capital, country: J.LANDMARKS.rome.country },
  { id: 'cairo', emoji: '🐫', landmark: J.LANDMARKS.cairo.landmark, capital: J.LANDMARKS.cairo.capital, country: J.LANDMARKS.cairo.country },
  { id: 'washington', emoji: '🏛️', landmark: J.LANDMARKS.washington.landmark, capital: J.LANDMARKS.washington.capital, country: J.LANDMARKS.washington.country },
  { id: 'athens', emoji: '🏺', landmark: J.LANDMARKS.athens.landmark, capital: J.LANDMARKS.athens.capital, country: J.LANDMARKS.athens.country },
  { id: 'tokyo', emoji: '🗾', landmark: J.LANDMARKS.tokyo.landmark, capital: J.LANDMARKS.tokyo.capital, country: J.LANDMARKS.tokyo.country },
  { id: 'berlin', emoji: '🚪', landmark: J.LANDMARKS.berlin.landmark, capital: J.LANDMARKS.berlin.capital, country: J.LANDMARKS.berlin.country },
  { id: 'beijing', emoji: '🏯', landmark: J.LANDMARKS.beijing.landmark, capital: J.LANDMARKS.beijing.capital, country: J.LANDMARKS.beijing.country },
  { id: 'copenhagen', emoji: '🧜‍♀️', landmark: J.LANDMARKS.copenhagen.landmark, capital: J.LANDMARKS.copenhagen.capital, country: J.LANDMARKS.copenhagen.country },
  { id: 'warsaw', emoji: '🏰', landmark: J.LANDMARKS.warsaw.landmark, capital: J.LANDMARKS.warsaw.capital, country: J.LANDMARKS.warsaw.country },
] as const;

/**
 * Capitals by country code, for the countries of `countries.ts` (which also
 * gives the order: best-known first). Countries with no single undisputed
 * capital, or one named like the country itself, are left out.
 */
// prettier-ignore
export const CAPITAL_OF: Record<string, string> = J.CAPITAL_OF;

/**
 * Clock difference with Kyiv: `shift` hours later (+) or earlier (−).
 * `kyiv` — the two Kyiv hours the question is asked for (the answer stays
 * within the same day). `winter`: the city does not move its clocks as we do,
 * so the number is true for our winter and the question says so.
 */
export const TIME_SHIFTS = [
  { id: 'warsaw', city: J.TIME_SHIFTS.warsaw.city, shift: -1, kyiv: [9, 14] },
  { id: 'london', city: J.TIME_SHIFTS.london.city, shift: -2, kyiv: [10, 17] },
  { id: 'athens', city: J.TIME_SHIFTS.athens.city, shift: 0, kyiv: [8, 15] },
  { id: 'paris', city: J.TIME_SHIFTS.paris.city, shift: -1, kyiv: [12, 20] },
  { id: 'lisbon', city: J.TIME_SHIFTS.lisbon.city, shift: -2, kyiv: [7, 13] },
  { id: 'new_york', city: J.TIME_SHIFTS.new_york.city, shift: -7, kyiv: [15, 19] },
  { id: 'vilnius', city: J.TIME_SHIFTS.vilnius.city, shift: 0, kyiv: [11, 18] },
  { id: 'rome', city: J.TIME_SHIFTS.rome.city, shift: -1, kyiv: [10, 16] },
  { id: 'dubai', city: J.TIME_SHIFTS.dubai.city, shift: 2, kyiv: [9, 18], winter: true },
  { id: 'beijing', city: J.TIME_SHIFTS.beijing.city, shift: 6, kyiv: [8, 14], winter: true },
  { id: 'tokyo', city: J.TIME_SHIFTS.tokyo.city, shift: 7, kyiv: [7, 12], winter: true },
  { id: 'sydney', city: J.TIME_SHIFTS.sydney.city, shift: 9, kyiv: [6, 11], winter: true },
] as const;

/** When it is `kyiv` in Kyiv, is it day or night in the other city? */
export const DAY_NIGHT = [
  { id: 'la', kyiv: 'day', city: J.DAY_NIGHT.la.city, answer: 'night', why: J.DAY_NIGHT.la.why },
  { id: 'london', kyiv: 'day', city: J.DAY_NIGHT.london.city, answer: 'day', why: J.DAY_NIGHT.london.why },
  { id: 'delhi', kyiv: 'day', city: J.DAY_NIGHT.delhi.city, answer: 'day', why: J.DAY_NIGHT.delhi.why },
  { id: 'honolulu', kyiv: 'day', city: J.DAY_NIGHT.honolulu.city, answer: 'night', why: J.DAY_NIGHT.honolulu.why },
  { id: 'sydney_n', kyiv: 'night', city: J.DAY_NIGHT.sydney_n.city, answer: 'day', why: J.DAY_NIGHT.sydney_n.why },
  { id: 'la_n', kyiv: 'night', city: J.DAY_NIGHT.la_n.city, answer: 'day', why: J.DAY_NIGHT.la_n.why },
  { id: 'london_n', kyiv: 'night', city: J.DAY_NIGHT.london_n.city, answer: 'night', why: J.DAY_NIGHT.london_n.why },
  { id: 'warsaw_n', kyiv: 'night', city: J.DAY_NIGHT.warsaw_n.city, answer: 'night', why: J.DAY_NIGHT.warsaw_n.why },
  { id: 'paris', kyiv: 'day', city: J.DAY_NIGHT.paris.city, answer: 'day', why: J.DAY_NIGHT.paris.why },
  { id: 'sydney', kyiv: 'day', city: J.DAY_NIGHT.sydney.city, answer: 'night', why: J.DAY_NIGHT.sydney.why },
  { id: 'ny_n', kyiv: 'night', city: J.DAY_NIGHT.ny_n.city, answer: 'day', why: J.DAY_NIGHT.ny_n.why },
  { id: 'tokyo_n', kyiv: 'night', city: J.DAY_NIGHT.tokyo_n.city, answer: 'day', why: J.DAY_NIGHT.tokyo_n.why },
  { id: 'mexico', kyiv: 'day', city: J.DAY_NIGHT.mexico.city, answer: 'night', why: J.DAY_NIGHT.mexico.why },
  { id: 'mexico_n', kyiv: 'night', city: J.DAY_NIGHT.mexico_n.city, answer: 'day', why: J.DAY_NIGHT.mexico_n.why },
  { id: 'vancouver', kyiv: 'day', city: J.DAY_NIGHT.vancouver.city, answer: 'night', why: J.DAY_NIGHT.vancouver.why },
  { id: 'wellington', kyiv: 'day', city: J.DAY_NIGHT.wellington.city, answer: 'night', why: J.DAY_NIGHT.wellington.why },
  { id: 'wellington_n', kyiv: 'night', city: J.DAY_NIGHT.wellington_n.city, answer: 'day', why: J.DAY_NIGHT.wellington_n.why },
] as const;
