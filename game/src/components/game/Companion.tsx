import { motion } from 'framer-motion';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Mascot } from '@/components/theme/Mascot';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import styles from './Companion.module.css';

interface CompanionProps {
  /** Journey completion 0..1 across the session (already includes any rollback). */
  progress: number;
}

/**
 * The themed companion race (PRD §4.1). The mascot travels left→right toward its
 * goal as the child completes tasks, and looks the way it is going (`Mascot`):
 * towards the goal after an answer, back when it slides back while the child
 * idles. Three boxes, one job each: the lane (as wide as the track) slides, so
 * the position is a `transform` and never a `left` that lays the track out again
 * on every frame; the hop inside it is a CSS loop; the turn is on the sprite.
 */
export function Companion({ progress }: CompanionProps) {
  const theme = useActiveTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  // Keep the mascot within the track (4%..82%) so it never clips the goal.
  const left = 4 + clamped * 78;

  // Which way it last moved. Sent back to the very start (a new level), it
  // turns to the goal again once it has got there.
  const before = useRef(clamped);
  const [back, setBack] = useState(false);
  useEffect(() => {
    if (clamped === before.current) return;
    setBack(clamped < before.current);
    before.current = clamped;
    if (clamped > 0) return;
    const t = window.setTimeout(() => setBack(false), 900);
    return () => window.clearTimeout(t);
  }, [clamped]);

  return (
    <div className={styles.track} data-tip="track" aria-hidden>
      <div className={styles.ground} />
      <motion.div
        className={styles.lane}
        initial={false}
        animate={{ x: `${left}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      >
        <div className={`${styles.mascot} loop-bob`} style={{ '--loop': '1.1s' } as CSSProperties}>
          <Mascot heading={back ? 'left' : 'right'} />
        </div>
      </motion.div>
      <span className={`${styles.goal} emoji`}>{theme.goal.emoji}</span>
    </div>
  );
}
