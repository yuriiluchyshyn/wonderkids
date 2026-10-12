import { useT } from '@/core/translator';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { cn } from '@/core/utils/cn';
import styles from './TimeBudget.module.css';

interface TimeBudgetProps {
  /** Remaining play-time, 0..100. */
  pct: number;
  /** How many themed tokens make up a full tank. */
  slots?: number;
  /** Resting (cooldown) — the whole row shows spent/sleepy. */
  resting?: boolean;
  /** Compact variant for tight headers. */
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * A wordless play-time clock: a row of the theme's token (🥚 eggs, 🦄 unicorns,
 * ⛽ fuel...) that drains one-by-one as the session burns down. The token at the
 * drain edge fades gradually (the "slowly, slowly disappearing" egg) rather than
 * blinking out — never a digital countdown (Tech Spec AC-2).
 */
export function TimeBudget({ pct, slots = 10, resting = false, size = 'md', className }: TimeBudgetProps) {
  const t = useT();
  const theme = useActiveTheme();
  const token = theme.timeToken.emoji;
  const clamped = Math.max(0, Math.min(100, pct));
  // Tokens remaining, as a float. Tokens drain from the right edge inward, so
  // the leftmost token is the last one standing.
  const remaining = resting ? 0 : (clamped / 100) * slots;
  const fullCount = Math.floor(remaining);
  const frac = remaining - fullCount;

  return (
    <div
      className={cn(styles.row, size === 'sm' && styles.rowSm, resting && styles.resting, className)}
      role="img"
      aria-label={resting ? t('time.rest') : t('time.left', { pct: clamped })}
    >
      {Array.from({ length: slots }, (_, i) => {
        let state: 'full' | 'fading' | 'spent' = 'spent';
        let opacity = 1;
        let scale = 1;
        if (i < fullCount) {
          state = 'full';
        } else if (i === fullCount && frac > 0) {
          state = 'fading';
          // The draining token melts away smoothly as the fraction drops.
          opacity = 0.25 + 0.75 * frac;
          scale = 0.55 + 0.45 * frac;
        }
        return (
          <span
            key={i}
            className={cn(
              styles.token,
              'emoji',
              state === 'spent' && styles.spent,
              state === 'fading' && styles.fading,
            )}
            style={state === 'fading' ? { opacity, transform: `scale(${scale})` } : undefined}
            aria-hidden
          >
            {token}
          </span>
        );
      })}
    </div>
  );
}
