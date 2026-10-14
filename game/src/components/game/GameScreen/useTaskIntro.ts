import { moduleRegistry } from '@/core/game/kernel/ModuleRegistry';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import type { GameSessionConfig } from '../useGameSession';
import type { GameSession } from './types';

/**
 * What a game says before play: the module's themed, child-level intro (or
 * the static one), as it is shown and as the voice says it — in the voice's
 * language when that is another.
 */
export function useTaskIntro(config: GameSessionConfig, session: GameSession) {
  const theme = useActiveTheme();
  const { module } = session;
  const sub = module?.subCategories.find((s) => s.id === config.subCategoryId);
  const introText = module?.getIntro?.(config.subCategoryId, theme, config.step) ?? sub?.intro;
  const saidModule = moduleRegistry.get(config.moduleId, session.langs.said);
  const saidTheme = useActiveTheme(session.langs.said);
  const introSpeech =
    session.langs.said === session.langs.shown
      ? introText
      : (saidModule?.getIntro?.(config.subCategoryId, saidTheme, config.step) ?? saidModule?.subCategories.find((s) => s.id === config.subCategoryId)?.intro ?? introText);
  return { sub, introText, introSpeech };
}
