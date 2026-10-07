import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSound } from '@/core/audio/useSound';
import styles from './GroupsHint.module.css';

interface GroupsHintProps {
  /** Number of equal groups (the first factor). */
  rows: number;
  /** Items per group (the second factor). */
  cols: number;
}

/**
 * Array/groups model for multiplication (PRD §5). The structure is labelled
 * ("{rows} рядків · по {cols}") so the child sees it visually, but every dot is
 * tapped individually — no auto-fill, no displayed total — so the child counts
 * for themselves.
 */
export function GroupsHint({ rows, cols }: GroupsHintProps) {
  const total = rows * cols;
  const [lit, setLit] = useState<Set<string>>(() => new Set());
  const { countChime } = useSound();

  const tapDot = (key: string) => {
    setLit((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      // Pitch rises as the child gets closer to counting them all.
      countChime(next.size, total);
      return next;
    });
  };

  return (
    <div>
      <p className={styles.caption}>
        {rows} рядків · по {cols} в кожному
      </p>

      <div className={styles.grid}>
        {Array.from({ length: rows }, (_, r) => (
          <div className={styles.row} key={r}>
            {Array.from({ length: cols }, (_, c) => {
              const key = `${r}-${c}`;
              const on = lit.has(key);
              return (
                <motion.button
                  key={key}
                  className={`${styles.dot} ${on ? styles.on : ''}`}
                  whileTap={{ scale: 0.8 }}
                  animate={on ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  onClick={() => tapDot(key)}
                  aria-label="Кружечок"
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
