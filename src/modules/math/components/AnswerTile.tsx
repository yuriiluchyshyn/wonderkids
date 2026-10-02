import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/core/utils/cn';
import styles from './AnswerTile.module.css';

export type TileState = 'idle' | 'wrong' | 'correct';

interface AnswerTileProps {
  children: ReactNode;
  state: TileState;
  onClick: () => void;
  ariaLabel?: string;
  /** Emojis that pop out of the tile on a correct answer (themed balloons). */
  burst?: string[];
}

/**
 * A large tappable answer tile. Zero-aggression feedback: a wrong tap gives a
 * gentle wobble (never red X / buzzer), a correct tap gives a happy pop plus a
 * little burst of themed balloons.
 */
export function AnswerTile({ children, state, onClick, ariaLabel, burst }: AnswerTileProps) {
  return (
    <motion.button
      className={cn(styles.tile, state === 'correct' && styles.correct, state === 'wrong' && styles.wrong)}
      aria-label={ariaLabel}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      animate={
        state === 'wrong'
          ? { x: [0, -10, 10, -6, 6, 0], rotate: [0, -3, 3, 0] }
          : state === 'correct'
            ? { scale: [1, 1.18, 1] }
            : {}
      }
      transition={{ duration: 0.45 }}
    >
      {children}

      {state === 'correct' && burst && burst.length > 0 && (
        <span className={styles.burst} aria-hidden>
          {burst.slice(0, 5).map((emoji, i) => (
            <motion.span
              key={i}
              className={`${styles.balloon} emoji`}
              initial={{ opacity: 0, scale: 0.3, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.3, 1.2, 1, 0.1],
                x: (i - 2) * 30,
                y: -44 - (i % 2) * 12,
              }}
              transition={{ duration: 0.7, times: [0, 0.3, 0.6, 1], delay: i * 0.03 }}
            >
              {emoji}
            </motion.span>
          ))}
        </span>
      )}
    </motion.button>
  );
}
