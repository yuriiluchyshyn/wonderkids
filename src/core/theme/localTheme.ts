import { tApp, type AppKey, type Params } from '@/core/i18n/app';
import type { LangCode } from '@/core/lang';
import { DEFAULT_THEME_ID, THEMES } from './themes';
import type { Theme, ThemeId, ThemeSpec } from './theme.types';

const cache = new Map<string, Theme>();

/** A theme with its words in `lang` (`theme.<id>.…` in the app dictionary). */
export function localTheme(spec: ThemeSpec, lang: LangCode): Theme {
  const cacheKey = `${spec.id}|${lang}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  const t = (key: string, params?: Params) => tApp(lang, `theme.${spec.id}.${key}` as AppKey, params);
  const theme: Theme = {
    ...spec,
    name: t('name'),
    mascot: { ...spec.mascot, name: t('mascot') },
    goal: { ...spec.goal, name: t('goal') },
    artifact: { ...spec.artifact, name: t('artifact'), count: (n) => t('artifactCount', { count: n }) },
    timeToken: { ...spec.timeToken, name: t('timeToken') },
    dreamBuild: { ...spec.dreamBuild, name: t('dreamBuild') },
    treasures: spec.treasures.map((treasure) => ({ ...treasure, name: t(`treasure.${treasure.id}`) })),
  };
  cache.set(cacheKey, theme);
  return theme;
}

/** The theme of an id (a child's `themeId`; `null` — the neutral galaxy) in `lang`. */
export const themeOf = (id: ThemeId | null | undefined, lang: LangCode): Theme => localTheme(THEMES[id ?? DEFAULT_THEME_ID] ?? THEMES[DEFAULT_THEME_ID], lang);
