import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSound } from '@/core/audio/useSound';
import type { GridAreaPayload } from '@/core/templates/types';
import { isConnected } from '@/core/templates/validate';
import { cn } from '@/core/utils/cn';
import { Button } from '@/components/ui/Button';
import { SHAKE, SHAKE_TRANSITION, Stimulus, type LayoutProps } from './parts';
import styles from './Templates.module.css';

/**
 * Grid overlay (geometry, 8–10 y) — "build a pen with an area of N cells":
 * colour cells of the meadow to fence in one connected field, then confirm.
 * The helper shows a running cell counter; a finished pen grows grass and a
 * happy sheep.
 */
export function GridAreaLayout({ payload, callbacks, hintActive }: LayoutProps<GridAreaPayload>) {
  const { cols, rows, targetArea } = payload;
  const { chime } = useSound();
  const [cells, setCells] = useState<Set<number>>(new Set());
  const [solved, setSolved] = useState(false);
  const [shake, setShake] = useState(false);

  const toggle = (index: number) => {
    if (solved) return;
    setCells((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      chime(next.size);
      return next;
    });
  };

  const check = () => {
    if (solved) return;
    if (cells.size === targetArea && isConnected(cells, cols)) {
      setSolved(true);
      callbacks.onSuccess();
    } else {
      setShake(true);
      callbacks.onMistake();
    }
  };

  return (
    <div className="stack">
      <Stimulus payload={payload} onSpeak={callbacks.speakPrompt} />
      <motion.div
        className={styles.areaGrid}
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        animate={shake ? SHAKE : { x: 0 }}
        transition={SHAKE_TRANSITION}
        onAnimationComplete={() => setShake(false)}
      >
        {Array.from({ length: cols * rows }, (_, index) => (
          <button
            key={index}
            type="button"
            className={cn(styles.areaCell, cells.has(index) && styles.areaCellOn, solved && cells.has(index) && styles.areaCellDone)}
            onClick={() => toggle(index)}
            aria-label={`Клітинка ${index + 1}`}
            aria-pressed={cells.has(index)}
          >
            {solved && cells.has(index) && index === Math.min(...cells) ? '🐑' : ''}
          </button>
        ))}
      </motion.div>
      {hintActive && !solved && (
        <p className={styles.counter} aria-live="polite">
          🟩 {cells.size} / {targetArea}
        </p>
      )}
      <Button size="lg" icon="✅" block onClick={check} ariaLabel="Перевірити загін">
        Готово!
      </Button>
    </div>
  );
}
