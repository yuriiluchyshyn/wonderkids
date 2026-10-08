import { useMemo } from 'react';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { themeWorld, type ThemeWorld } from './themeWorlds';
import { treasureKey } from '@/core/child/progress/treasures';
import { gamesProgress } from './games';
import { STATION_DEFS, type StationDef } from './stations';
import {
  PLANET_COUNT,
  PLANET_NAMES,
  SPACEPORT_ID,
  WORLD_PLANETS,
  frontierPlanet,
  giftsEarned,
  keyBalance,
  keysEarned,
  planetNeeds,
  residentForGift,
  balanceOf,
  ownedKey,
  residents,
  shopState,
  spentOn,
  stationCost,
  stationKey,
  type Inhabitant,
  type ItemState,
  type PlanetNeeds,
  type WorldPlanetId,
} from './world';

/** A station of knowledge on one planet, as it stands for this child. */
export interface StationState {
  station: StationDef;
  /** Keys of knowledge it takes to open here. */
  cost: number;
  status: 'open' | 'affordable' | 'saving';
  /** Keys still missing (0 unless `saving`). */
  missing: number;
}

/** One planet of the child's solar system, outermost first. */
export interface SystemPlanet {
  /** 1-based place on the way to the Sun. */
  planet: number;
  id: WorldPlanetId;
  name: string;
  /** The child may build here. */
  open: boolean;
  /** Everything it asks for is done — the way on is clear. */
  done: boolean;
  /** What it asks for before the child may fly on. */
  needs: PlanetNeeds;
  /** Every buildable item of this planet with its status for this child. */
  items: ItemState[];
}

export interface World {
  def: ThemeWorld;
  /** The planet being looked at (1-based) and what it is called. */
  planet: number;
  planetId: WorldPlanetId;
  planetName: string;
  /** The child may build on the planet being looked at (a closed one can only be looked at). */
  open: boolean;
  /** The furthest planet the child may build on. */
  frontier: number;
  /** All eight planets, outermost first. */
  system: SystemPlanet[];
  /** What the planet being looked at asks for before the child may fly on. */
  needs: PlanetNeeds;
  /** The last planet is done: the child has reached the Sun. */
  sunReached: boolean;
  /** Every buildable item of this planet with its status for this child. */
  items: ItemState[];
  /** Artifacts the child can spend now (earned − spent). */
  balance: number;
  spent: number;
  buildingsOwned: number;
  buildingsTotal: number;
  /** The stations of knowledge of the planet being looked at. */
  stations: StationState[];
  /** Keys of knowledge the child can exchange now (earned − spent on stations). */
  keys: number;
  residents: Inhabitant[];
  gifts: number;
  /** The resident the most recent gift brought (shown on the gift screen). */
  newestResident: Inhabitant | undefined;
}

/**
 * The active child's world, derived live from their artifacts and progress.
 * `viewPlanet` is the planet to show (1-based) — any of the eight, a closed
 * one too; by default the furthest one the child has reached.
 */
export function useWorld(viewPlanet?: number): World {
  const theme = useActiveTheme();
  const artifacts = useGameStore((s) => s.artifacts);
  const progress = useGameStore((s) => s.progress);
  const treasures = useGameStore((s) => s.treasures);

  return useMemo(() => {
    let def = themeWorld(theme);
    const all = gamesProgress(progress);
    const gifts = giftsEarned(all);
    const balance = balanceOf(artifacts, treasures);
    const keys = keyBalance(keysEarned(all), treasures);
    const treasuresFound = theme.treasures.filter((t) => treasures.includes(treasureKey(theme.id, t.id))).length;
    const stationsOn = (planet: number): StationState[] =>
      STATION_DEFS.map((station) => {
        const cost = stationCost(station.id, planet);
        if (treasures.includes(stationKey(station.id, planet))) return { station, cost, status: 'open', missing: 0 };
        return keys >= cost ? { station, cost, status: 'affordable', missing: 0 } : { station, cost, status: 'saving', missing: cost - keys };
      });

    // Every planet: what stands on it and whether it is done.
    const planets = WORLD_PLANETS.map((id, i) => {
      const planet = i + 1;
      const world = themeWorld(theme, planet);
      const owned = new Set(world.items.filter((item) => treasures.includes(ownedKey(theme.id, item.id, planet))).map((item) => item.id));
      const needs = planetNeeds({
        planet,
        itemsOwned: owned.size,
        itemsTotal: world.items.length,
        spaceport: owned.has(SPACEPORT_ID),
        stationsOpen: stationsOn(planet).filter((st) => st.status === 'open').length,
        gifts,
        treasuresFound,
        treasuresTotal: theme.treasures.length,
      });
      return { id, planet, world, owned, needs };
    });
    const frontier = frontierPlanet(planets.map((p) => p.needs.done), planets.map((p) => p.owned.size > 0));
    const shown = planets[Math.max(1, Math.min(PLANET_COUNT, Math.floor(viewPlanet ?? frontier))) - 1];
    def = shown.world;

    const system = planets.map((p) => ({
      planet: p.planet,
      id: p.id,
      name: PLANET_NAMES[p.id],
      open: p.planet <= frontier,
      done: p.needs.done,
      needs: p.needs,
      items: shopState(p.world.items, p.owned, balance),
    }));
    const { items } = system[shown.planet - 1];
    const buildings = items.filter((i) => i.item.kind === 'building');
    return {
      def,
      planet: shown.planet,
      planetId: shown.id,
      planetName: PLANET_NAMES[shown.id],
      open: shown.planet <= frontier,
      frontier,
      system,
      needs: shown.needs,
      sunReached: planets[PLANET_COUNT - 1].needs.done,
      items,
      balance,
      spent: spentOn(treasures),
      buildingsOwned: buildings.filter((b) => b.status === 'owned').length,
      buildingsTotal: buildings.length,
      stations: stationsOn(shown.planet),
      keys,
      residents: residents(def.residents, gifts),
      gifts,
      newestResident: residentForGift(def.residents, gifts),
    };
  }, [theme, artifacts, progress, treasures, viewPlanet]);
}
