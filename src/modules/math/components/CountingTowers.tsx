import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSound } from '@/core/audio/useSound';
import styles from './CountingTowers.module.css';

interface CountingTowersProps {
  /** How many cubes to lay out (grouped into towers of ten). */
  count: number;
}

/**
 * Sensory tap-to-count helper (PRD §5): cubes grouped into towers of ten. Each
 * cube is lit individually — tapping one lights only that cube (no skipping) and
 * plays the next pentatonic chime, so the child does the counting themselves.
 * Deliberately shows no running total — counting aloud is the point.
 */
export function CountingTowers({ count }: CountingTowersProps) {
  const [lit, setLit] = useState<Set<number>>(() => new Set());
  const { countChime } = useSound();

  const towers = Math.ceil(count / 10);

  const tapCube = (globalIndex: number) => {
    setLit((prev) => {
      if (prev.has(globalIndex)) return prev;
      const next = new Set(prev);
      next.add(globalIndex);
      // Pitch rises as the child gets closer to the full count.
      countChime(next.size, count);
      return next;
    });
  };

  return (
    <div className={styles.towers}>
      {Array.from({ length: towers }, (_, t) => {
        const inThis = Math.min(10, count - t * 10);
        return (
          <div className={styles.tower} key={t}>
            {Array.from({ length: inThis }, (_, c) => {
              const gi = t * 10 + c;
              return (
                <motion.button
                  key={gi}
                  className={`${styles.cube} ${lit.has(gi) ? styles.on : ''}`}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => tapCube(gi)}
                  aria-label={`Кубик`}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
