import type { ThemeId } from '../../../theme/theme.types.ts';
import type { WorldPlanetId } from '../world.ts';

/**
 * The words of «Мій світ» in a language other than Ukrainian. The Ukrainian
 * ones are the content itself (`planetFacts.ts`, `stations.ts`,
 * `themeWorlds.ts`); a language lays its own over them by position: the n-th
 * fact, the n-th station, the n-th building of a theme. A story that is the
 * language's own rather than a translation (Kadeniuk / Hermaszewski) is marked
 * `own` at the same place in every language (`core/language/marks.ts`).
 *
 * Free of `@/` imports: the world is counted under `node --test`.
 */
export interface WorldWords {
  planets: Record<WorldPlanetId, string>;
  galaxy: string;
  spaceport: string;
  facts: Record<WorldPlanetId, readonly string[]>;
  /** Ten stations a planet: `[name, what it is]`. */
  stations: Record<WorldPlanetId, readonly (readonly [string, string])[]>;
  /** A theme's world: its name, then the names of its buildings, decorations and residents, in the order of `themeWorlds.ts`. */
  themes: Record<ThemeId, { name: string; buildings: readonly string[]; decor: readonly string[]; residents: readonly string[] }>;
  /** The guests that come to every world, in the order of `VISITORS`. */
  visitors: readonly string[];
}
