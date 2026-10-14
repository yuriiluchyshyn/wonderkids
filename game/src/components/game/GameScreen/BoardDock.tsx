import type { ReactNode } from 'react';
import styles from './BoardDock.module.css';

/**
 * What is said about the task once it is up — the fact after a right answer,
 * the help after a wrong one — kept in sight. Under a tall board (a field of
 * bubbles, a figure to build) it would sit below the bottom of a phone's
 * screen, where the child never looks; so it stays at the bottom of the
 * screen while the board runs on behind it, and settles back under the board
 * when the board's end is scrolled into view.
 */
export function BoardDock({ children }: { children: ReactNode }) {
  return <div className={styles.dock}>{children}</div>;
}
