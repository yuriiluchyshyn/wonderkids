import { useActiveTheme } from '@/core/theme/useActiveTheme';
import type { ThemeId } from '@/core/theme/theme.types';
import { cn } from '@/core/utils/cn';
import styles from './FuelGauge.module.css';

/**
 * Themed "fuel" meter (Tech Spec FR-TIME-02 / AC-2): a fuel tank ⛽, battery 🔋
 * or magic crystal 🔮 instead of any digital countdown. Drains as the session
 * burns down; glows low (amber) under 25%.
 */
const FUEL_ICON: Partial<Record<ThemeId, string>> = {
  cars: '⛽',
  space: '🔋',
  unicorns: '🔮',
  dinos: '🥚',
  underwater: '🫧',
  forest: '🍄',
  lego: '🔋',
  frozen: '❄️',
};

interface FuelGaugeProps {
  /** Remaining fuel 0..100. */
  pct: number;
}

export function FuelGauge({ pct }: FuelGaugeProps) {
  const theme = useActiveTheme();
  const icon = FUEL_ICON[theme.id] ?? '⛽';
  const clamped = Math.max(0, Math.min(100, pct));
  const low = clamped <= 25;

  return (
    <div className={styles.fuel} aria-label={`Пальне ${clamped}%`} title={`Пальне ${clamped}%`}>
      <span className={`${styles.icon} emoji`} aria-hidden>
        {icon}
      </span>
      <div className={styles.bar}>
        <div
          className={cn(styles.fill, low && styles.low)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className={styles.pct}>{clamped}%</span>
    </div>
  );
}
