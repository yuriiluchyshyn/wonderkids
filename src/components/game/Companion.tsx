import { motion } from 'framer-motion';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import styles from './Companion.module.css';

interface CompanionProps {
  /** Journey completion 0..1 across the session (already includes any rollback). */
  progress: number;
}

/**
 * The themed companion race (PRD §4.1). The mascot travels left→right toward its
 * goal as the child completes tasks. The emoji is mirrored (scaleX(-1)) on an
 * inner span so it faces the finish — the outer element owns the position and
 * idle bounce transforms, keeping the flip intact.
 */
export function Companion({ progress }: CompanionProps) {
  const theme = useActiveTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  // Keep the mascot within the track (4%..82%) so it never clips the goal.
  const left = 4 + clamped * 78;

  return (
    <div className={styles.track} data-tip="track" aria-hidden>
      <div className={styles.ground} />
      <motion.div
        className={styles.mascot}
        initial={false}
        animate={{ left: `${left}%`, y: [0, -6, 0] }}
        transition={{
          left: { type: 'spring', stiffness: 120, damping: 18 },
          y: { repeat: Infinity, duration: 1.1, ease: 'easeInOut' },
        }}
      >
        <span className={`${styles.sprite} emoji`}>{theme.mascot.emoji}</span>
      </motion.div>
      <span className={`${styles.goal} emoji`}>{theme.goal.emoji}</span>
    </div>
  );
}
