import { useLocation } from 'react-router-dom';
import { getPortal } from '@/core/app/portal';
import { useLang } from '@/core/translator';
import { themeOf } from './localTheme';
import { DEFAULT_THEME_ID } from './themes';
import type { Theme } from './theme.types';
import { useActiveTheme } from './useActiveTheme';

/** The grown-ups' pages: the parents' cabinet, its sign-in, the admin panel. */
const GROWN_UP_PATHS = ['/parent', '/admin'];

/** Is this screen for the grown-ups? The whole parents' portal is; on the dev host — its paths. */
export function useGrownUpScreen(): boolean {
  const { pathname } = useLocation();
  return getPortal() === 'parent' || GROWN_UP_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`) || pathname.startsWith(`${path}-`));
}

/**
 * The theme the screen is painted in. The child's screens wear the child's
 * theme; the grown-ups' always wear the default one («Галактика»), whichever
 * child is chosen — what a child has picked is only shown, ticked, in the
 * cabinet's theme list. Only the looks are pinned: a component that needs the
 * child's own words or emoji (their artifact) still asks `useActiveTheme`.
 * Must be used inside the router.
 */
export function useScreenTheme(): Theme {
  const child = useActiveTheme();
  const lang = useLang();
  return useGrownUpScreen() ? themeOf(DEFAULT_THEME_ID, lang) : child;
}
