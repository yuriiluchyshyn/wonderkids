import { useMemo } from 'react';
import { moduleRegistry } from '@/core/kernel/ModuleRegistry';
import { isFreePlay } from '@/core/kernel/gameConfig';
import type { LearningModule, SubCategory } from '@/core/kernel/types';
import { pathKey, subSteps } from '@/core/progress/path';
import { playsKey } from '@/core/progress/plays';
import { useGameStore } from '@/core/store/useGameStore';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { themeWorld, type ThemeWorld } from './themeWorlds';
import {
  giftsEarned,
  landmarkStage,
  residentForGift,
  balanceOf,
  ownedKey,
  residents,
  shopState,
  spentOn,
  type GameProgress,
  type Inhabitant,
  type ItemState,
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
}

export interface World {
  def: ThemeWorld;
  /** Every buildable item of this theme with its status for this child. */
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

/** The active child's world, derived live from their artifacts and progress. */
export function useWorld(): World {
  const theme = useActiveTheme();
  const artifacts = useGameStore((s) => s.artifacts);
  const progress = useGameStore((s) => s.progress);
  const treasures = useGameStore((s) => s.treasures);

  return useMemo(() => {
    const def = themeWorld(theme);
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
        };
      }),
    }));

    const gifts = giftsEarned(all);
    const balance = balanceOf(artifacts, treasures);
    const owned = new Set(
      def.items.filter((item) => treasures.includes(ownedKey(theme.id, item.id))).map((item) => item.id),
    );
    const items = shopState(def.items, owned, balance);
    const buildings = items.filter((i) => i.item.kind === 'building');
    return {
      def,
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
  }, [theme, artifacts, progress, treasures]);
}
