import { useEffect, type ReactNode } from 'react';
import { useActiveTheme } from './useActiveTheme';
import type { Theme } from './theme.types';

/** Maps a theme palette to the CSS custom properties consumed by the stylesheet. */
function applyPalette(theme: Theme): void {
  const root = document.documentElement;
  const p = theme.palette;
  root.style.setProperty('--bg-1', p.bg1);
  root.style.setProperty('--bg-2', p.bg2);
  root.style.setProperty('--surface', p.surface);
  root.style.setProperty('--surface-ink', p.surfaceInk);
  root.style.setProperty('--primary', p.primary);
  root.style.setProperty('--primary-ink', p.primaryInk);
  root.style.setProperty('--accent', p.accent);
  root.style.setProperty('--accent-ink', p.accentInk);
  root.style.setProperty('--text', p.text);
  root.style.setProperty('--text-soft', p.textSoft);
  root.style.setProperty('--ring', p.ring);
  root.dataset.theme = theme.id;
}

/**
 * Applies the active theme's palette to the document root. Kept as a thin
 * side-effect wrapper (single responsibility) so the rest of the UI only ever
 * reads CSS variables and never knows which theme is active.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useActiveTheme();

  useEffect(() => {
    applyPalette(theme);
  }, [theme]);

  return <>{children}</>;
}
