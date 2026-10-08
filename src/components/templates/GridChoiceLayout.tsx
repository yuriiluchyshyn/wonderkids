import { motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import type { GridChoicePayload } from '@/core/game/templates/types';
import { cn } from '@/core/utils/cn';
import { CardFace, SHAKE, SHAKE_TRANSITION, Stimulus, type LayoutProps } from './parts';
import styles from './Templates.module.css';

/**
 * UI_GRID_CHOICE — tap one card out of N (2 or 3 columns).
 * Helper (exclusion method, PRD §5): the grid narrows to the right answer and
 * one alternative, so the second look is a real choice, not a give-away —
 * unless the task brings a counting model (`payload.counting`), shown below.
 * When the task has an unknown drawn in it (the «?» of a sum, the ❓ of a word
 * problem) and the answers are plain numbers, the right one flies into it.
 */
export function GridChoiceLayout({ payload, callbacks, hintActive }: LayoutProps<GridChoicePayload>) {
  const { options, correctId, cols } = payload;
  const [solved, setSolved] = useState(false);
  const [tried, setTried] = useState<string[]>([]);
  const [shake, setShake] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  // The right number on its way to the task's «?», then standing in it.
  const [flight, setFlight] = useState<{ text: string; from: DOMRect; to: DOMRect } | null>(null);
  const [landed, setLanded] = useState<string | undefined>(undefined);

  const kept = useMemo(() => {
    // A task with something to count keeps every answer: counting is the help.
    if (!hintActive || payload.counting) return null;
    const other = options.find((o) => o.id !== correctId && !tried.includes(o.id)) ?? options.find((o) => o.id !== correctId);
    return new Set([correctId, other?.id]);
  }, [hintActive]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (id: string, button: HTMLElement) => {
    if (solved) return;
    if (id === correctId) {
      setSolved(true);
      const glyphs = options.find((o) => o.id === id)?.glyphs;
      const ask = root.current?.querySelector('[data-ask]');
      if (ask && glyphs && glyphs.every((g) => typeof g === 'string')) {
        setFlight({ text: glyphs.join(' '), from: button.getBoundingClientRect(), to: ask.getBoundingClientRect() });
      }
      callbacks.onSuccess();
      return;
    }
    setTried((t) => (t.includes(id) ? t : [...t, id]));
    setShake(id);
    callbacks.onMistake();
  };

  return (
    <div className="stack" ref={root}>
      <Stimulus payload={payload} onSpeak={callbacks.speakPrompt} answer={landed} />
      {flight && !landed && (
        <motion.span
          className={styles.flying}
          aria-hidden
          initial={{ x: flight.from.left + flight.from.width / 2, y: flight.from.top + flight.from.height / 2, scale: 1.2 }}
          animate={{ x: flight.to.left + flight.to.width / 2, y: flight.to.top + flight.to.height / 2, scale: 0.8 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          onAnimationComplete={() => setLanded(flight.text)}
        >
          {flight.text}
        </motion.span>
      )}
      <div className={cn(styles.grid, cols === 3 ? styles.cols3 : cols === 1 ? styles.cols1 : styles.cols2)}>
        {options.map((option) => {
          const faded = kept !== null && !kept.has(option.id);
          const isCorrect = solved && option.id === correctId;
          return (
            <motion.button
              key={option.id}
              type="button"
              className={cn(styles.choice, isCorrect && styles.correct, faded && styles.faded)}
              onClick={(e) => choose(option.id, e.currentTarget)}
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
