import { own } from '../../language/marks.ts';
import type { LangCode } from '../../language/types.ts';
import { worldWords } from './words/index.ts';
import type { WorldPlanetId } from './world.ts';
import TEXTS from '../../../locales/app/uk/world.json' with { type: 'json' };

const J = TEXTS.planetFacts;

/** How many stories every planet has to tell. */
export const FACTS_PER_PLANET = 20;

/**
 * What the Solar System tells about a planet when the child taps it: twenty
 * stories a planet, each a few sentences long, read aloud and shown. Written
 * for the voice — units are spelled out and there are no foreign words.
 *
 * Pure data (no React, no value imports) so it runs under `node --test`.
 */
export const PLANET_FACTS: Record<WorldPlanetId, readonly string[]> = {
  neptune: J.PLANET_FACTS.neptune,
  uranus: J.PLANET_FACTS.uranus,
  saturn: J.PLANET_FACTS.saturn,
  jupiter: J.PLANET_FACTS.jupiter,
  mars: J.PLANET_FACTS.mars,
  earth: [
    J.PLANET_FACTS.earth[0],
    J.PLANET_FACTS.earth[1],
    J.PLANET_FACTS.earth[2],
    J.PLANET_FACTS.earth[3],
    J.PLANET_FACTS.earth[4],
    J.PLANET_FACTS.earth[5],
    J.PLANET_FACTS.earth[6],
    J.PLANET_FACTS.earth[7],
    J.PLANET_FACTS.earth[8],
    J.PLANET_FACTS.earth[9],
    J.PLANET_FACTS.earth[10],
    J.PLANET_FACTS.earth[11],
    J.PLANET_FACTS.earth[12],
    J.PLANET_FACTS.earth[13],
    J.PLANET_FACTS.earth[14],
    J.PLANET_FACTS.earth[15],
    J.PLANET_FACTS.earth[16],
    J.PLANET_FACTS.earth[17],
    J.PLANET_FACTS.earth[18],
    own(J.PLANET_FACTS.earth[19]),
  ],
  venus: J.PLANET_FACTS.venus,
  mercury: [
    J.PLANET_FACTS.mercury[0],
    J.PLANET_FACTS.mercury[1],
    J.PLANET_FACTS.mercury[2],
    J.PLANET_FACTS.mercury[3],
    J.PLANET_FACTS.mercury[4],
    J.PLANET_FACTS.mercury[5],
    J.PLANET_FACTS.mercury[6],
    J.PLANET_FACTS.mercury[7][1] + own(J.PLANET_FACTS.mercury[7][2]) + '.',
    J.PLANET_FACTS.mercury[8],
    J.PLANET_FACTS.mercury[9],
    J.PLANET_FACTS.mercury[10],
    J.PLANET_FACTS.mercury[11],
    J.PLANET_FACTS.mercury[12],
    J.PLANET_FACTS.mercury[13],
    J.PLANET_FACTS.mercury[14],
    J.PLANET_FACTS.mercury[15],
    J.PLANET_FACTS.mercury[16],
    J.PLANET_FACTS.mercury[17][1] + own(J.PLANET_FACTS.mercury[17][2]),
    J.PLANET_FACTS.mercury[18],
    J.PLANET_FACTS.mercury[19],
  ],
};

/** What a planet tells about itself, in `lang` (Ukrainian when none is asked for). */
export const planetFacts = (id: WorldPlanetId, lang?: LangCode): readonly string[] => worldWords(lang)?.facts[id] ?? PLANET_FACTS[id];
