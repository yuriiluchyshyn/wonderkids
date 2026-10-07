import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSound } from '@/core/audio/useSound';
import styles from './CountingTowers.module.css';

interface CountingTowersProps {
  /** How many cubes to lay out (grouped into towers of ten). */
  count: number;
  /**
   * Optional addition split: the first `a` cubes belong to operand A, the next
   * `b` to operand B. They're colour-coded to match the equation ("6" + "1")
   * and count in two distinct voices.
   */
  split?: { a: number; b: number };
}

/**
 * Sensory tap-to-count helper (PRD §5): cubes grouped into towers of ten. Each
 * cube is lit individually — tapping one lights only that cube (no skipping),
 * blinks, and plays the next counting chime, so the child does the counting
 * themselves. For addition the two operands are shown in their own colours.
 * Deliberately shows no running total — counting aloud is the point.
 */
export function CountingTowers({ count, split }: CountingTowersProps) {
  const total = split ? split.a + split.b : count;
  const [lit, setLit] = useState<Set<number>>(() => new Set());
  const { countChime } = useSound();

  const towers = Math.ceil(total / 10);

  const groupOf = (globalIndex: number): 'a' | 'b' =>
    split && globalIndex >= split.a ? 'b' : 'a';

  const tapCube = (globalIndex: number) => {
    setLit((prev) => {
      if (prev.has(globalIndex)) return prev;
      const next = new Set(prev);
      next.add(globalIndex);
      // Pitch rises toward the full count; the voice differs per operand group.
      countChime(next.size, total, groupOf(globalIndex));
      return next;
    });
  };

  return (
    <div className={styles.towers}>
      {Array.from({ length: towers }, (_, t) => {
        const inThis = Math.min(10, total - t * 10);
        return (
          <div className={styles.tower} key={t}>
            {Array.from({ length: inThis }, (_, c) => {
              const gi = t * 10 + c;
              const on = lit.has(gi);
              const groupClass = split
                ? groupOf(gi) === 'b'
                  ? styles.groupB
                  : styles.groupA
                : '';
              return (
                <motion.button
                  key={gi}
                  className={`${styles.cube} ${groupClass} ${on ? styles.on : ''}`}
                  whileTap={{ scale: 0.8 }}
                  animate={on ? { scale: [1, 1.35, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  onClick={() => tapCube(gi)}
                  aria-label="Кубик"
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
