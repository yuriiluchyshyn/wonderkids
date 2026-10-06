import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSound } from '@/core/audio/useSound';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import type { NumberMazePayload } from '@/core/templates/types';
import { isAdjacent } from '@/core/templates/validate';
import { cn } from '@/core/utils/cn';
import { SHAKE, SHAKE_TRANSITION, Stimulus, type LayoutProps } from './parts';
import styles from './Templates.module.css';

/**
 * Number maze (UI_GRID_CHOICE family, 8–10 y) — the mascot runs across a grid
 * stepping only on numbers that fit the rule ("divisible by 3"). A right step
 * turns the tile gold with a footstep; a wrong one cracks. The helper lights
 * up the way.
 */
export function NumberMazeLayout({ payload, callbacks, hintActive }: LayoutProps<NumberMazePayload>) {
  const { cols, cells, path } = payload;
  const theme = useActiveTheme();
  const { play } = useSound();
  // How many cells of the route are behind us (the mascot stands on the last).
  const [walked, setWalked] = useState(1);
  const [cracked, setCracked] = useState<number | null>(null);

  const here = path[walked - 1];
  const finish = path[path.length - 1];
  const done = walked >= path.length;

  const step = (index: number) => {
    if (done || index === here || !isAdjacent(here, index, cols)) return;
    if (index === path[walked]) {
      play('tap');
      setWalked(walked + 1);
      if (walked + 1 >= path.length) callbacks.onSuccess();
      return;
    }
    // Stepping back over gold tiles is just wandering, not a mistake.
    if (path.slice(0, walked).includes(index)) return;
    setCracked(index);
    callbacks.onMistake();
  };

  return (
    <div className="stack">
      <Stimulus payload={payload} onSpeak={callbacks.speakPrompt} />
      <div className={styles.maze} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {cells.map((value, index) => {
          const gold = path.slice(0, walked).includes(index);
          const lit = hintActive && !done && path.slice(walked).includes(index);
          return (
            <motion.button
              key={index}
              type="button"
              className={cn(
                styles.mazeCell,
                gold && styles.mazeGold,
                lit && styles.mazeLit,
                lit && index === path[walked] && styles.pulsing,
                cracked === index && styles.mazeCracked,
              )}
              onClick={() => step(index)}
              animate={cracked === index ? SHAKE : { x: 0 }}
              transition={SHAKE_TRANSITION}
              onAnimationComplete={() => cracked === index && setCracked(null)}
              aria-label={`${value}`}
            >
              {index === here ? (
                <span className="emoji" aria-hidden>
                  {theme.mascot.emoji}
                </span>
              ) : index === finish ? (
                <span className={styles.mazeFinish}>
                  {value}
                  <span className="emoji" aria-hidden>
                    {theme.goal.emoji}
                  </span>
                </span>
              ) : (
                value
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
