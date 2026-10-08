import { Fragment } from 'react';
import type { Clue } from '@/core/game/templates/types';
import { cn } from '@/core/utils/cn';
import styles from './ClueHint.module.css';

/**
 * A riddle's clues drawn as a picture: the things of the story stood in their
 * places, what is ruled out crossed, the steps between numbers written on the
 * arrows. It never names the answer — the child reads it off the picture.
 */
export function ClueHint({ clue }: { clue: Clue }) {
  return (
    <div className={cn(styles.clue, clue.dense && styles.dense)}>
      {clue.ends && (
        <div className={styles.ends} aria-hidden>
          <span>← {clue.ends[0]}</span>
          <span>{clue.ends[1]} →</span>
        </div>
      )}
      {clue.rows.map((row, r) => (
        <div className={styles.row} key={r}>
          {row.label && <span className={styles.label}>{row.label}</span>}
          <div className={styles.cells}>
            {row.cells.map((cell, c) => (
              <Fragment key={c}>
                {cell.link && <span className={styles.link}>{cell.link}</span>}
                <span className={cn(styles.cell, cell.mark && styles.mark, cell.crossed && styles.crossed)}>
                  <span className={cn(styles.glyph, 'emoji')}>{cell.glyph}</span>
                  {cell.level !== undefined && <span className={styles.bar} style={{ height: `${cell.level * 14}px` }} />}
                  {cell.note && <span className={styles.note}>{cell.note}</span>}
                </span>
              </Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
