import { own } from '../../../language/marks.ts';
import type { WorldPlanetId } from '../world.ts';
import TEXTS from '../../../../locales/app/pl/world.json' with { type: 'json' };

const J = TEXTS.facts;

/** What the planets tell about themselves, in Polish: twenty stories each, in the order of `planetFacts.ts`. */
export const FACTS: Record<WorldPlanetId, readonly string[]> = {
  neptune: J.FACTS.neptune,
  uranus: J.FACTS.uranus,
  saturn: J.FACTS.saturn,
  jupiter: J.FACTS.jupiter,
  mars: J.FACTS.mars,
  earth: [
    J.FACTS.earth[0],
    J.FACTS.earth[1],
    J.FACTS.earth[2],
    J.FACTS.earth[3],
    J.FACTS.earth[4],
    J.FACTS.earth[5],
    J.FACTS.earth[6],
    J.FACTS.earth[7],
    J.FACTS.earth[8],
    J.FACTS.earth[9],
    J.FACTS.earth[10],
    J.FACTS.earth[11],
    J.FACTS.earth[12],
    J.FACTS.earth[13],
    J.FACTS.earth[14],
    J.FACTS.earth[15],
    J.FACTS.earth[16],
    J.FACTS.earth[17],
    J.FACTS.earth[18],
    own(J.FACTS.earth[19]),
  ],
  venus: J.FACTS.venus,
  mercury: [
    J.FACTS.mercury[0],
    J.FACTS.mercury[1],
    J.FACTS.mercury[2],
    J.FACTS.mercury[3],
    J.FACTS.mercury[4],
    J.FACTS.mercury[5],
    J.FACTS.mercury[6],
    J.FACTS.mercury[7][1] + own(J.FACTS.mercury[7][2]) + '.',
    J.FACTS.mercury[8],
    J.FACTS.mercury[9],
    J.FACTS.mercury[10],
    J.FACTS.mercury[11],
    J.FACTS.mercury[12],
    J.FACTS.mercury[13],
    J.FACTS.mercury[14],
    J.FACTS.mercury[15],
    J.FACTS.mercury[16],
    J.FACTS.mercury[17][1] + own(J.FACTS.mercury[17][2]),
    J.FACTS.mercury[18],
    J.FACTS.mercury[19],
  ],
};
