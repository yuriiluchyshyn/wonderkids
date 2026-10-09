import { moduleRegistry } from '@/core/game/kernel/ModuleRegistry';
import { speaks, type LearningModule, type SubCategory } from '@/core/game/kernel/types';
import { DEFAULT_LANG, type LangCode } from '@/core/language';

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

/**
 * Flattens every registered module's sub-categories into catalog entries: the
 * games whose content exists in `lang`, their cards worded in it.
 */
export function buildCatalog(lang: LangCode = DEFAULT_LANG): CatalogEntry[] {
  return moduleRegistry.getAll(lang).flatMap((module) =>
    module.subCategories.filter((sub) => speaks(sub, lang)).map((sub) => ({ module, sub })),
  );
}

/** Pure filter — keeps the Hub component declarative. */
export function filterCatalog(entries: CatalogEntry[], f: CatalogFilters): CatalogEntry[] {
  return entries.filter(({ module }) => f.subjectId === 'all' || module.id === f.subjectId);
}
