/**
 * Facts told after a correct answer in the Geography games. Every pool is
 * about the thing the question asks about (this ocean, this landmark) — never
 * a general fact that merely shares its category. Animals: `animalFacts.ts`.
 */
import { own } from '@/core/language/marks';
import TEXTS from '@/locales/app/uk/games/geography.json';

const J = TEXTS.content.facts;

export const OCEAN_POOLS: Record<string, string[]> = {
  pacific: J.OCEAN_POOLS.pacific,
  atlantic: [
    J.OCEAN_POOLS.atlantic[0],
    J.OCEAN_POOLS.atlantic[1],
    J.OCEAN_POOLS.atlantic[2],
    J.OCEAN_POOLS.atlantic[3],
    J.OCEAN_POOLS.atlantic[4],
    J.OCEAN_POOLS.atlantic[5],
    J.OCEAN_POOLS.atlantic[6],
    own(J.OCEAN_POOLS.atlantic[7]),
    J.OCEAN_POOLS.atlantic[8],
    J.OCEAN_POOLS.atlantic[9],
  ],
  indian: J.OCEAN_POOLS.indian,
  arctic: J.OCEAN_POOLS.arctic,
  southern: J.OCEAN_POOLS.southern,
};

/**
 * Ten facts per landmark of «Столиці»; the first says which capital it is in.
 * Keyed by landmark id (see `LANDMARKS`).
 */
export const LANDMARK_FACTS: Record<string, string[]> = J.LANDMARK_FACTS;

/** Nine stories about day and night; a question's own answer makes the tenth. */
export const DAY_NIGHT_FACTS = J.DAY_NIGHT_FACTS;
