import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { GridChoicePayload } from '@/core/game/templates/types';
import { cn } from '@/core/utils/cn';
import { CardFace, SHAKE, SHAKE_TRANSITION, Stimulus, type LayoutProps } from './parts';
import styles from './Templates.module.css';

/**
 * UI_GRID_CHOICE — tap one card out of N (2 or 3 columns).
 * Helper (exclusion method, PRD §5): the grid narrows to the right answer and
 * one alternative, so the second look is a real choice, not a give-away —
 * unless the task brings a counting model (`payload.counting`), shown below.
 */
export function GridChoiceLayout({ payload, callbacks, hintActive }: LayoutProps<GridChoicePayload>) {
  const { options, correctId, cols } = payload;
  const [solved, setSolved] = useState(false);
  const [tried, setTried] = useState<string[]>([]);
  const [shake, setShake] = useState<string | null>(null);

  const kept = useMemo(() => {
    // A task with something to count keeps every answer: counting is the help.
    if (!hintActive || payload.counting) return null;
    const other = options.find((o) => o.id !== correctId && !tried.includes(o.id)) ?? options.find((o) => o.id !== correctId);
    return new Set([correctId, other?.id]);
  }, [hintActive]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (id: string) => {
    if (solved) return;
    if (id === correctId) {
      setSolved(true);
      callbacks.onSuccess();
      return;
    }
    setTried((t) => (t.includes(id) ? t : [...t, id]));
    setShake(id);
    callbacks.onMistake();
  };

  return (
    <div className="stack">
      <Stimulus payload={payload} onSpeak={callbacks.speakPrompt} />
      <div className={cn(styles.grid, cols === 3 ? styles.cols3 : cols === 1 ? styles.cols1 : styles.cols2)}>
        {options.map((option) => {
          const faded = kept !== null && !kept.has(option.id);
          const isCorrect = solved && option.id === correctId;
          return (
            <motion.button
              key={option.id}
              type="button"
              className={cn(styles.choice, isCorrect && styles.correct, faded && styles.faded)}
              onClick={() => choose(option.id)}
              disabled={faded}
              whileTap={{ scale: 0.94 }}
              animate={shake === option.id ? SHAKE : isCorrect ? { scale: [1, 1.12, 1] } : { x: 0 }}
              transition={SHAKE_TRANSITION}
              onAnimationComplete={() => shake === option.id && setShake(null)}
            >
              <CardFace card={option} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
