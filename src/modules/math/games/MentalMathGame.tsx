import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { GameViewProps } from '@/core/kernel/types';
import { AnswerTile, type TileState } from '../components/AnswerTile';
import type { MentalMathPayload } from '../math.types';
import styles from './Games.module.css';

/** Mental arithmetic: read the equation, tap the right answer tile. */
export function MentalMathGame({ task, callbacks }: GameViewProps<MentalMathPayload>) {
  const { a, b, op, answer, options } = task.payload;
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
        <motion.div
          key={task.id}
          className={styles.equation}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <span>{a}</span>
          <span className={styles.op}>{op}</span>
          <span>{b}</span>
          <span className={styles.op}>=</span>
          <span className={styles.q}>?</span>
        </motion.div>
      </div>

      <div className={styles.tiles}>
        {options.map((value) => (
          <AnswerTile key={value} state={tileState(value)} onClick={() => choose(value)} ariaLabel={`Відповідь ${value}`}>
            {value}
          </AnswerTile>
        ))}
      </div>
    </div>
  );
}
