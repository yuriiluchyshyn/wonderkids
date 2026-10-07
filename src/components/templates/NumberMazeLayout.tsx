import { motion } from 'framer-motion';
import { useMemo, useState, type CSSProperties } from 'react';
import { useSound } from '@/core/audio/useSound';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import type { NumberMazePayload } from '@/core/templates/types';
import { isAdjacent, nextStepTowards } from '@/core/templates/validate';
import { cn } from '@/core/utils/cn';
import { SHAKE, SHAKE_TRANSITION, Stimulus, type LayoutProps } from './parts';
import styles from './Templates.module.css';

/** Numbers as a child reads them: a real minus sign, not a hyphen. */
const show = (value: number) => String(value).replace('-', '−');

/**
 * Number maze (UI_GRID_CHOICE family, 8–10 y) — the mascot runs across a grid
 * stepping only on numbers that fit the rule ("divisible by 3"). A right step
 * turns the tile gold; a wrong one cracks. Bigger mazes have side corridors
 * that fit the rule but end in a dead end: walking into one is not a mistake,
 * the child just walks back. The helper lights up the next step only.
 */
export function NumberMazeLayout({ payload, callbacks, hintActive }: LayoutProps<NumberMazePayload>) {
  const { cols, cells, path, open } = payload;
  const theme = useActiveTheme();
  const { play } = useSound();
  const start = path[0];
  const finish = path[path.length - 1];
  const walkable = useMemo(() => new Set([...path, ...(open ?? [])]), [path, open]);

  // Where the mascot stands, and every tile it has stepped on so far.
  const [here, setHere] = useState(start);
  const [walked, setWalked] = useState<ReadonlySet<number>>(() => new Set([start]));
  const [cracked, setCracked] = useState<number | null>(null);

  const done = here === finish;
  // The one tile the helper points at: the next step of the way out from here.
  const next = hintActive && !done ? nextStepTowards(here, finish, walkable, cols) : null;

  const step = (index: number) => {
    if (done || index === here || !isAdjacent(here, index, cols)) return;
    if (walkable.has(index)) {
      // Stepping back over gold tiles (out of a dead end) is just walking.
      play('tap');
      setHere(index);
      setWalked((prev) => new Set(prev).add(index));
      if (index === finish) callbacks.onSuccess();
      return;
    }
    setCracked(index);
    callbacks.onMistake();
  };

  return (
    <div className="stack">
      <Stimulus payload={payload} onSpeak={callbacks.speakPrompt} />
      <div
        className={styles.maze}
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, '--maze-cols': cols } as CSSProperties}
      >
        {cells.map((value, index) => (
          <motion.button
            key={index}
            type="button"
            className={cn(
              styles.mazeCell,
              walked.has(index) && styles.mazeGold,
              next === index && styles.mazeLit,
              next === index && styles.pulsing,
              cracked === index && styles.mazeCracked,
            )}
            onClick={() => step(index)}
            animate={cracked === index ? SHAKE : { x: 0 }}
            transition={SHAKE_TRANSITION}
            onAnimationComplete={() => cracked === index && setCracked(null)}
            aria-label={show(value)}
          >
            {index === here ? (
              <span className="emoji" aria-hidden>
                {theme.mascot.emoji}
              </span>
            ) : index === finish ? (
              <span className={styles.mazeFinish}>
                {show(value)}
                <span className="emoji" aria-hidden>
                  {theme.goal.emoji}
                </span>
              </span>
            ) : (
              show(value)
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
