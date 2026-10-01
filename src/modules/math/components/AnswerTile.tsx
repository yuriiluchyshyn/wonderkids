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
}

/**
 * A large tappable answer tile. Zero-aggression feedback: a wrong tap gives a
 * gentle wobble (never red X / buzzer), a correct tap gives a happy pop.
 */
export function AnswerTile({ children, state, onClick, ariaLabel }: AnswerTileProps) {
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
    </motion.button>
  );
}
