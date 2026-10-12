import { flushSync } from 'react-dom';

/** How long one theme melts into the next (keep in step with `--theme-fade` in `styles/global.css`). */
const FADE_MS = 500;

type WithViewTransition = Document & { startViewTransition?: (update: () => void) => unknown };

/**
 * Makes a change of theme a soft cross-fade instead of a jump. Where the
 * browser has view transitions the whole screen fades from the old look to the
 * new one (`ThemeProvider` applies the palette in a layout effect, so it is in
 * place before the browser takes the new picture). Elsewhere the colours of
 * every element glide for a moment (`.theme-fade` in `styles/global.css`).
 * Someone who asked their device for less motion just gets the new theme.
 */
export function changeTheme(change: () => void): void {
  const doc = document as WithViewTransition;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    change();
    return;
  }
  if (typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(() => flushSync(change));
    return;
  }
  const root = document.documentElement;
  root.classList.add('theme-fade');
  change();
  window.setTimeout(() => root.classList.remove('theme-fade'), FADE_MS);
}
