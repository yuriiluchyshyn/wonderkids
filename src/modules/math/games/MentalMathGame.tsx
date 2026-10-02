import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { GameViewProps } from '@/core/kernel/types';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { AnswerTile, type TileState } from '../components/AnswerTile';
import type { MentalMathPayload } from '../math.types';
import styles from './Games.module.css';

/** Mental arithmetic: read the equation, tap the right answer tile. */
export function MentalMathGame({ task, callbacks }: GameViewProps<MentalMathPayload>) {
  const { a, b, op, answer, options } = task.payload;
  const theme = useActiveTheme();
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<number | null>(null);

  // Reset interaction state whenever a new task arrives.
  useEffect(() => {
    setSolved(false);
    setWrong(null);
  }, [task.id]);

  const choose = (value: number) => {
    if (solved) return;
    if (value === answer) {
      setSolved(true);
      callbacks.onSuccess();
    } else {
      setWrong(value);
      callbacks.onMistake();
    }
  };

  const tileState = (value: number): TileState => {
    if (solved && value === answer) return 'correct';
    if (wrong === value) return 'wrong';
    return 'idle';
  };

  return (
    <div className="stack">
      <div className={styles.prompt}>
        <motion.button
          key={task.id}
          type="button"
          className={styles.equation}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => callbacks.speakPrompt()}
          aria-label="Повторити завдання"
          title="Повторити завдання"
        >
          <span className={styles.operandA}>{a}</span>
          <span className={styles.op}>{op}</span>
          <span className={styles.operandB}>{b}</span>
          <span className={styles.op}>=</span>
          <span className={styles.q}>?</span>
        </motion.button>
      </div>

      <div className={styles.tilesGrid3}>
        {options.map((value) => (
          <AnswerTile
            key={value}
            state={tileState(value)}
            onClick={() => choose(value)}
            ariaLabel={`Відповідь ${value}`}
            burst={theme.celebrationEmojis}
          >
            {value}
          </AnswerTile>
        ))}
      </div>
    </div>
  );
}
