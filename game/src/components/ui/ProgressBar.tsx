import { motion } from 'framer-motion';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  /** 0..1 */
  value: number;
  label?: string;
}

/** Animated, glossy progress bar used for goals and session progress. */
export function ProgressBar({ value, label }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className={styles.fill}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        >
          <div className={styles.shine} />
        </motion.div>
      </div>
      {label && <div className={styles.label}>{label}</div>}
    </div>
  );
}
