import { motion } from 'framer-motion';
import { cn } from '@/core/utils/cn';
import { useSound } from '@/core/audio/useSound';
import styles from './Chip.module.css';

interface ChipProps {
  /** Illustration/emoji — always shown. */
  icon?: string;
  /** Text label — shown only when `showLabel` is true. */
  label?: string;
  showLabel?: boolean;
  active?: boolean;
  onClick?: () => void;
  /** Optional colour dot (e.g. age-group colour). */
  dotColor?: string;
}

/**
 * A toggleable filter pill. Icon-first: the illustration always shows; the text
 * label appears only when `showLabel` is set, so pre-readers get a clean,
 * icon-only control and readers get labels.
 */
export function Chip({ icon, label, showLabel = true, active = false, onClick, dotColor }: ChipProps) {
  const { play } = useSound();
  const iconOnly = !showLabel || !label;

  return (
    <motion.button
      className={cn(styles.chip, active && styles.active, iconOnly && styles.iconOnly)}
      whileTap={{ scale: 0.9 }}
      aria-pressed={active}
      aria-label={label}
      onClick={() => {
        play('tap');
        onClick?.();
      }}
    >
      {dotColor && <span className={styles.dot} style={{ background: dotColor }} aria-hidden />}
      {icon && (
        <span className={cn(styles.icon, 'emoji')} aria-hidden>
          {icon}
        </span>
      )}
      {!iconOnly && <span className={styles.label}>{label}</span>}
    </motion.button>
  );
}
