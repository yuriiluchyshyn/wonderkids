export const RAD = Math.PI / 180;

/** A place on the globe, in degrees: latitude (north is up) and longitude. */
export type Place = [lat: number, lon: number];

/** The golden angle: each next slot is this much further round, so no two line up. */
const GOLDEN = 137.508;

/**
 * Slot `i` of `count`, spread evenly over the whole globe (a Fibonacci
 * lattice) — so nothing ever stands in a heap. Kept off the very poles, where
 * a thing would be hard to turn into view.
 */
export function spread(i: number, count: number, turn = 0): Place {
  const height = (1 - (2 * (i + 0.5)) / count) * 0.88;
  return [Math.asin(height) / RAD, (i * GOLDEN + turn) % 360];
}

/**
 * Where the `index`-th of a planet's `count` things stands. Neighbours in the
 * list are sent to opposite ends of the lattice, so buildings and decorations
 * mix instead of taking a hemisphere each.
 */
export function itemPlace(index: number, count: number): Place {
  const step = [7, 5, 3, 1].find((s) => count % s !== 0) ?? 1;
  return spread((index * step) % count, count);
}

/** Residents stroll between the buildings; beyond this many the globe would be crowded. */
export const RESIDENTS_SHOWN = 14;
export const residentPlace = (i: number): Place => spread(i % RESIDENTS_SHOWN, RESIDENTS_SHOWN, 68);

/** A place as seen right now: screen offset from the centre (in radii) and depth (1 = nearest, < 0 = behind). */
export function project([lat, lon]: Place, yaw: number, pitch: number) {
  const y = Math.sin(lat * RAD);
  const flat = Math.cos(lat * RAD);
  const x = flat * Math.sin(lon * RAD + yaw);
  const z = flat * Math.cos(lon * RAD + yaw);
  return { x, y: y * Math.cos(pitch) - z * Math.sin(pitch), depth: y * Math.sin(pitch) + z * Math.cos(pitch) };
}
