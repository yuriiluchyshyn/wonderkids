import { moduleRegistry } from '@/core/kernel/ModuleRegistry';
import type { LearningModule, SubCategory } from '@/core/kernel/types';

/** A single catalog card: one subject sub-category offered by a module. */
export interface CatalogEntry {
  module: LearningModule;
  sub: SubCategory;
}

/** Only subject filtering remains — difficulty now lives on the learning path. */
export interface CatalogFilters {
  subjectId: string | 'all';
}

export const DEFAULT_FILTERS: CatalogFilters = {
  subjectId: 'all',
};

/** Flattens every registered module's sub-categories into catalog entries. */
export function buildCatalog(): CatalogEntry[] {
  return moduleRegistry.getAll().flatMap((module) =>
    module.subCategories.map((sub) => ({ module, sub })),
  );
}

/** Pure filter — keeps the Hub component declarative. */
export function filterCatalog(entries: CatalogEntry[], f: CatalogFilters): CatalogEntry[] {
  return entries.filter(({ module }) => f.subjectId === 'all' || module.id === f.subjectId);
}
