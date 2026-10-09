import type { LangCode } from '../../language/types.ts';
import { worldWords } from './words/index.ts';
import { STATION_COUNT, WORLD_PLANETS, stationId, type WorldPlanetId } from './world.ts';
import TEXTS from '../../../locales/app/uk/world.json' with { type: 'json' };

const J = TEXTS.stations;

/** The key of knowledge as it is drawn, and its count forms («5 ключів»). */
export const KEY = '🗝️';
export const KEY_COUNTED: [string, string, string] = [J.KEY_COUNTED[0], J.KEY_COUNTED[1], J.KEY_COUNTED[2]];

export interface StationDef {
  id: string;
  name: string;
  emoji: string;
  /** What the station is for — read out when the child taps it. */
  about: string;
}

type Row = [emoji: string, name: string, about: string];

/**
 * The stations of knowledge: ten on every planet, cheapest first
 * (`STATION_COSTS`), and every planet has its OWN ten — told in the spirit of
 * that planet (ice and Shakespeare on Uranus, rovers and volcanoes on Mars).
 * A station's id is its place in the list (`k0`…`k9`), so what a child has
 * opened is kept whatever a station is called.
 *
 * They are deliberately NOT derived from the game catalog — a new game or a
 * whole new galaxy adds ways to earn keys, never a station.
 */
const STATIONS: Record<WorldPlanetId, Row[]> = {
  // The first planet: the classic houses of knowledge.
  neptune: [
    ['🔭', J.STATIONS.neptune[0][1], J.STATIONS.neptune[0][2]],
    ['📚', J.STATIONS.neptune[1][1], J.STATIONS.neptune[1][2]],
    ['🧮', J.STATIONS.neptune[2][1], J.STATIONS.neptune[2][2]],
    ['🧭', J.STATIONS.neptune[3][1], J.STATIONS.neptune[3][2]],
    ['🌿', J.STATIONS.neptune[4][1], J.STATIONS.neptune[4][2]],
    ['🏺', J.STATIONS.neptune[5][1], J.STATIONS.neptune[5][2]],
    ['🧩', J.STATIONS.neptune[6][1], J.STATIONS.neptune[6][2]],
    ['🎨', J.STATIONS.neptune[7][1], J.STATIONS.neptune[7][2]],
    ['🧪', J.STATIONS.neptune[8][1], J.STATIONS.neptune[8][2]],
    ['🎵', J.STATIONS.neptune[9][1], J.STATIONS.neptune[9][2]],
  ],
  // The coldest planet, lying on its side; its moons bear the names of Shakespeare's heroes.
  uranus: [
    ['🧊', J.STATIONS.uranus[0][1], J.STATIONS.uranus[0][2]],
    ['🎭', J.STATIONS.uranus[1][1], J.STATIONS.uranus[1][2]],
    ['🤸', J.STATIONS.uranus[2][1], J.STATIONS.uranus[2][2]],
    ['🌬️', J.STATIONS.uranus[3][1], J.STATIONS.uranus[3][2]],
    ['💎', J.STATIONS.uranus[4][1], J.STATIONS.uranus[4][2]],
    ['🌡️', J.STATIONS.uranus[5][1], J.STATIONS.uranus[5][2]],
    ['🛷', J.STATIONS.uranus[6][1], J.STATIONS.uranus[6][2]],
    ['📖', J.STATIONS.uranus[7][1], J.STATIONS.uranus[7][2]],
    ['🎼', J.STATIONS.uranus[8][1], J.STATIONS.uranus[8][2]],
    ['🔬', J.STATIONS.uranus[9][1], J.STATIONS.uranus[9][2]],
  ],
  // The ringed planet, lighter than water, named after the god of time and harvest.
  saturn: [
    ['💍', J.STATIONS.saturn[0][1], J.STATIONS.saturn[0][2]],
    ['🛰️', J.STATIONS.saturn[1][1], J.STATIONS.saturn[1][2]],
    ['🎈', J.STATIONS.saturn[2][1], J.STATIONS.saturn[2][2]],
    ['⏳', J.STATIONS.saturn[3][1], J.STATIONS.saturn[3][2]],
    ['🌾', J.STATIONS.saturn[4][1], J.STATIONS.saturn[4][2]],
    ['🧲', J.STATIONS.saturn[5][1], J.STATIONS.saturn[5][2]],
    ['📐', J.STATIONS.saturn[6][1], J.STATIONS.saturn[6][2]],
    ['🎡', J.STATIONS.saturn[7][1], J.STATIONS.saturn[7][2]],
    ['🎶', J.STATIONS.saturn[8][1], J.STATIONS.saturn[8][2]],
    ['🗝️', J.STATIONS.saturn[9][1], J.STATIONS.saturn[9][2]],
  ],
  // The biggest planet: storms, lightning, the moons Galileo found, and everything weighs more.
  jupiter: [
    ['🌀', J.STATIONS.jupiter[0][1], J.STATIONS.jupiter[0][2]],
    ['🏆', J.STATIONS.jupiter[1][1], J.STATIONS.jupiter[1][2]],
    ['⚡', J.STATIONS.jupiter[2][1], J.STATIONS.jupiter[2][2]],
    ['🌕', J.STATIONS.jupiter[3][1], J.STATIONS.jupiter[3][2]],
    ['🏋️', J.STATIONS.jupiter[4][1], J.STATIONS.jupiter[4][2]],
    ['🧮', J.STATIONS.jupiter[5][1], J.STATIONS.jupiter[5][2]],
    ['📡', J.STATIONS.jupiter[6][1], J.STATIONS.jupiter[6][2]],
    ['🌈', J.STATIONS.jupiter[7][1], J.STATIONS.jupiter[7][2]],
    ['🧭', J.STATIONS.jupiter[8][1], J.STATIONS.jupiter[8][2]],
    ['🎨', J.STATIONS.jupiter[9][1], J.STATIONS.jupiter[9][2]],
  ],
  // The red planet: rovers, the highest volcano, dust, and the first people who will live there.
  mars: [
    ['🤖', J.STATIONS.mars[0][1], J.STATIONS.mars[0][2]],
    ['🌋', J.STATIONS.mars[1][1], J.STATIONS.mars[1][2]],
    ['🏜️', J.STATIONS.mars[2][1], J.STATIONS.mars[2][2]],
    ['🧑‍🚀', J.STATIONS.mars[3][1], J.STATIONS.mars[3][2]],
    ['🌱', J.STATIONS.mars[4][1], J.STATIONS.mars[4][2]],
    ['💧', J.STATIONS.mars[5][1], J.STATIONS.mars[5][2]],
    ['🪨', J.STATIONS.mars[6][1], J.STATIONS.mars[6][2]],
    ['🚁', J.STATIONS.mars[7][1], J.STATIONS.mars[7][2]],
    ['🗺️', J.STATIONS.mars[8][1], J.STATIONS.mars[8][2]],
    ['⚒️', J.STATIONS.mars[9][1], J.STATIONS.mars[9][2]],
  ],
  // Home: oceans, forests, people, their languages, music and history.
  earth: [
    ['🌍', J.STATIONS.earth[0][1], J.STATIONS.earth[0][2]],
    ['🌊', J.STATIONS.earth[1][1], J.STATIONS.earth[1][2]],
    ['🌳', J.STATIONS.earth[2][1], J.STATIONS.earth[2][2]],
    ['🏛️', J.STATIONS.earth[3][1], J.STATIONS.earth[3][2]],
    ['🗣️', J.STATIONS.earth[4][1], J.STATIONS.earth[4][2]],
    ['🎻', J.STATIONS.earth[5][1], J.STATIONS.earth[5][2]],
    ['🩺', J.STATIONS.earth[6][1], J.STATIONS.earth[6][2]],
    ['♻️', J.STATIONS.earth[7][1], J.STATIONS.earth[7][2]],
    ['🚂', J.STATIONS.earth[8][1], J.STATIONS.earth[8][2]],
    ['🏟️', J.STATIONS.earth[9][1], J.STATIONS.earth[9][2]],
  ],
  // The hottest planet, wrapped in clouds, named after the goddess of beauty; its day is longer than its year.
  venus: [
    ['🔥', J.STATIONS.venus[0][1], J.STATIONS.venus[0][2]],
    ['☁️', J.STATIONS.venus[1][1], J.STATIONS.venus[1][2]],
    ['🖼️', J.STATIONS.venus[2][1], J.STATIONS.venus[2][2]],
    ['🌅', J.STATIONS.venus[3][1], J.STATIONS.venus[3][2]],
    ['🪞', J.STATIONS.venus[4][1], J.STATIONS.venus[4][2]],
    ['⚗️', J.STATIONS.venus[5][1], J.STATIONS.venus[5][2]],
    ['🌋', J.STATIONS.venus[6][1], J.STATIONS.venus[6][2]],
    ['🕰️', J.STATIONS.venus[7][1], J.STATIONS.venus[7][2]],
    ['🩰', J.STATIONS.venus[8][1], J.STATIONS.venus[8][2]],
    ['💐', J.STATIONS.venus[9][1], J.STATIONS.venus[9][2]],
  ],
  // The last planet before the Sun: the fastest, named after the swift messenger of the gods.
  mercury: [
    ['☀️', J.STATIONS.mercury[0][1], J.STATIONS.mercury[0][2]],
    ['🏃', J.STATIONS.mercury[1][1], J.STATIONS.mercury[1][2]],
    ['✉️', J.STATIONS.mercury[2][1], J.STATIONS.mercury[2][2]],
    ['🔋', J.STATIONS.mercury[3][1], J.STATIONS.mercury[3][2]],
    ['🌑', J.STATIONS.mercury[4][1], J.STATIONS.mercury[4][2]],
    ['⚙️', J.STATIONS.mercury[5][1], J.STATIONS.mercury[5][2]],
    ['❄️', J.STATIONS.mercury[6][1], J.STATIONS.mercury[6][2]],
    ['🚀', J.STATIONS.mercury[7][1], J.STATIONS.mercury[7][2]],
    ['🕶️', J.STATIONS.mercury[8][1], J.STATIONS.mercury[8][2]],
    ['🏁', J.STATIONS.mercury[9][1], J.STATIONS.mercury[9][2]],
  ],
};

/** The stations of a planet (1-based; clamped), named in `lang` (Ukrainian when none is asked for). */
export function stationsOf(planet: number, lang?: LangCode): StationDef[] {
  const id = WORLD_PLANETS[Math.max(1, Math.min(WORLD_PLANETS.length, Math.floor(planet))) - 1];
  const words = worldWords(lang)?.stations[id];
  return STATIONS[id].slice(0, STATION_COUNT).map(([emoji, name, about], i) => ({ id: stationId(i), name: words?.[i]?.[0] ?? name, emoji, about: words?.[i]?.[1] ?? about }));
}
