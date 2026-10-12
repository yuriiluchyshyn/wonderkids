import type { Swatch } from '@/core/game/templates/types';
import { cn } from '@/core/utils/cn';
import styles from './ColorSwatch.module.css';

/**
 * A blob of paint in one colour — an answer of the colour lessons (`card`) or
 * the splash to name (`splash`). A shiny colour (gold, silver, the glitter
 * ones) gets a metallic sheen and a twinkle, so «золотий» is not just «жовтий».
 */
export function ColorSwatch({ swatch, size = 'card' }: { swatch: Swatch; size?: 'card' | 'splash' }) {
  return (
    <span
      className={cn(styles.swatch, size === 'splash' ? styles.splash : styles.card, swatch.shine && styles.shine)}
      style={{ backgroundColor: swatch.color }}
      aria-hidden
    >
      {swatch.shine && (
        <span className={cn(styles.twinkle, 'loop-breathe')} aria-hidden>
          ✨
        </span>
      )}
    </span>
  );
}
