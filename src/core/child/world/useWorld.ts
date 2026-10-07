import { useMemo } from 'react';
import { moduleRegistry } from '@/core/game/kernel/ModuleRegistry';
import { isFreePlay } from '@/core/game/kernel/gameConfig';
import type { LearningModule, SubCategory } from '@/core/game/kernel/types';
import { pathKey, subSteps } from '@/core/child/progress/path';
import { playsKey } from '@/core/child/progress/plays';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { themeWorld, type ThemeWorld } from './themeWorlds';
import { treasureKey } from '@/core/child/progress/treasures';
import {
  PLANET_COUNT,
  PLANET_NAMES,
  SPACEPORT_ID,
  WORLD_PLANETS,
  frontierPlanet,
  giftsEarned,
  landmarkLevel,
  landmarkStage,
  planetNeeds,
  residentForGift,
  balanceOf,
  ownedKey,
  residents,
  shopState,
  spentOn,
  type GameProgress,
  type Inhabitant,
  type ItemState,
  type PlanetNeeds,
  type WorldPlanetId,
} from './world';

export interface Landmark {
  module: LearningModule;
  sub: SubCategory;
  name: string;
  emoji: string;
  /** What each of the four stages adds, when the game names them. */
  stages?: [string, string][];
  /** 0 (not started) … 4 (complete). */
  stage: number;
  /** 0 … 8: one level per planet of the system (`landmarkLevel`). */
  level: number;
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
}

export interface World {
  def: ThemeWorld;
  /** The planet being looked at (1-based) and what it is called. */
  planet: number;
  planetId: WorldPlanetId;
  planetName: string;
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
  /** Landmarks grouped by subject, in catalog order. */
  lands: { module: LearningModule; landmarks: Landmark[] }[];
  residents: Inhabitant[];
  gifts: number;
  /** The resident the most recent gift brought (shown on the gift screen). */
  newestResident: Inhabitant | undefined;
}

/**
 * The active child's world, derived live from their artifacts and progress.
 * `viewPlanet` is the planet to show (1-based); by default the furthest one
 * the child has reached.
 */
export function useWorld(viewPlanet?: number): World {
  const theme = useActiveTheme();
  const artifacts = useGameStore((s) => s.artifacts);
  const progress = useGameStore((s) => s.progress);
  const treasures = useGameStore((s) => s.treasures);

  return useMemo(() => {
    let def = themeWorld(theme);
    const all: GameProgress[] = [];

    const lands = moduleRegistry.getAll().map((module) => ({
      module,
      landmarks: module.subCategories.map((sub): Landmark => {
        const game: GameProgress = {
          free: isFreePlay(sub),
          steps: subSteps(sub),
          step: progress[pathKey(module.id, sub.id)] ?? 0,
          plays: progress[playsKey(module.id, sub.id)] ?? 0,
        };
        all.push(game);
        return {
          module,
          sub,
          name: sub.landmark?.name ?? sub.label,
          emoji: sub.landmark?.emoji ?? sub.icon,
          stages: sub.landmark?.stages,
          stage: landmarkStage(game),
          level: landmarkLevel(game),
        };
      }),
    }));

    const gifts = giftsEarned(all);
    const balance = balanceOf(artifacts, treasures);
    const landLevels = lands.flatMap((land) => land.landmarks.map((l) => l.level));
    const treasuresFound = theme.treasures.filter((t) => treasures.includes(treasureKey(theme.id, t.id))).length;

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
        landLevels,
        gifts,
        treasuresFound,
        treasuresTotal: theme.treasures.length,
      });
      return { id, planet, world, owned, needs };
    });
    const frontier = frontierPlanet(planets.map((p) => p.needs.done), planets.map((p) => p.owned.size > 0));
    const shown = planets[Math.max(1, Math.min(frontier, Math.floor(viewPlanet ?? frontier))) - 1];
    def = shown.world;

    const items = shopState(def.items, shown.owned, balance);
    const buildings = items.filter((i) => i.item.kind === 'building');
    return {
      def,
      planet: shown.planet,
      planetId: shown.id,
      planetName: PLANET_NAMES[shown.id],
      frontier,
      system: planets.map((p) => ({ planet: p.planet, id: p.id, name: PLANET_NAMES[p.id], open: p.planet <= frontier, done: p.needs.done })),
      needs: shown.needs,
      sunReached: planets[PLANET_COUNT - 1].needs.done,
      items,
      balance,
      spent: spentOn(treasures),
      buildingsOwned: buildings.filter((b) => b.status === 'owned').length,
      buildingsTotal: buildings.length,
      lands,
      residents: residents(def.residents, gifts),
      gifts,
      newestResident: residentForGift(def.residents, gifts),
    };
  }, [theme, artifacts, progress, treasures, viewPlanet]);
}
