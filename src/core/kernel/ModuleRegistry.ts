import type { LearningModule } from './types';

/**
 * The micro-kernel's plugin registry.
 *
 * Modules call `registerModule` once at import time; the Hub reads the registry
 * to build its catalog. This is the single integration point described in the
 * PRD as `CoreApp.registerModule(plugin)` — adding a subject requires no change
 * to the core.
 */
class ModuleRegistry {
  private readonly modules = new Map<string, LearningModule>();

  register(module: LearningModule): void {
    if (this.modules.has(module.id)) {
      // Idempotent in dev under React StrictMode / HMR double-import.
      return;
    }
    this.modules.set(module.id, module);
  }

  get(id: string): LearningModule | undefined {
    return this.modules.get(id);
  }

  getAll(): LearningModule[] {
    return [...this.modules.values()];
  }

  has(id: string): boolean {
    return this.modules.has(id);
  }
}

/** Shared singleton registry instance. */
export const moduleRegistry = new ModuleRegistry();
