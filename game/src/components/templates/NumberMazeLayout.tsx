import { Mascot, type Heading } from '@/components/theme/Mascot';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useSound } from '@/core/audio/useSound';
import { voice } from '@/core/audio/voice';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { saidOf } from '@/core/game/kernel/types';
import type { NumberMazePayload } from '@/core/game/templates/types';
import { isAdjacent, nextStepTowards } from '@/core/game/templates/validate';
import { cn } from '@/core/utils/cn';
import { DivisibleHint, divisibleSpeech } from './DivisibleHint';
import { SHAKE, SHAKE_TRANSITION, Stimulus, type LayoutProps } from './parts';
import styles from './Templates.module.css';

/** Wrong steps from one spot before the helper shows the next step again. */
const SLIPS_FOR_HINT = 2;

/** Numbers as a child reads them: a real minus sign, not a hyphen. */
const show = (value: number) => String(value).replace('-', '−');

/**
 * Number maze (UI_GRID_CHOICE family, 8–10 y) — the mascot runs across a grid
 * stepping only on numbers that fit the rule ("divisible by 3"). A right step
 * turns the tile gold; a wrong one cracks. Bigger mazes have side corridors
 * that fit the rule but end in a dead end: walking into one is not a mistake,
 * the child just walks back. The helper lights up ONE next step and then
 * steps aside: the child walks on alone, and it comes back only after two
 * more slips from where they stand.
 *
 * A wrong step is also answered in words, about the very number stepped on:
 * how many of the divisor fit into it and what is left over, and then the one
 * rule that tells a multiple of THIS number at a glance — «на 2 діляться
 * числа, що закінчуються на 0, 2, 4, 6 або 8» (`DivisibleHint`). The maze
 * shows it itself rather than through the shell's helper panel, because the
 * lesson is about the tile the child chose, which only the board knows.
 */
export function NumberMazeLayout({ task, payload, callbacks, hintActive }: LayoutProps<NumberMazePayload>) {
  const { cols, cells, path, open, divisible } = payload;
  // The lesson is read out in the voice's language, which is not always the task's.
  const said = (saidOf(task).payload as NumberMazePayload).divisible ?? divisible;
  const saidLang = saidOf(task).lang;
  const theme = useActiveTheme();
  const { play } = useSound();
  const start = path[0];
  const finish = path[path.length - 1];
  const walkable = useMemo(() => new Set([...path, ...(open ?? [])]), [path, open]);

  // Where the mascot stands, and every tile it has stepped on so far.
  const [here, setHere] = useState(start);
  // The way of its last step: the mascot looks where it walks.
  const [heading, setHeading] = useState<Heading>('right');
  const [walked, setWalked] = useState<ReadonlySet<number>>(() => new Set([start]));
  const [cracked, setCracked] = useState<number | null>(null);
  // The number of the last wrong step: what the lesson under the board is about.
  const [missed, setMissed] = useState<number | null>(null);

  // The helper is lit for one step at a time. `slips` counts wrong steps since
  // it last went out (or since the child last moved on).
  const [lit, setLit] = useState(false);
  const [slips, setSlips] = useState(0);
  useEffect(() => {
    if (hintActive) setLit(true);
  }, [hintActive]);

  const done = here === finish;
  // The one tile the helper points at: the next step of the way out from here.
  const next = hintActive && lit && !done ? nextStepTowards(here, finish, walkable, cols) : null;

  const step = (index: number) => {
    if (done || index === here || !isAdjacent(here, index, cols)) return;
    if (walkable.has(index)) {
      // Stepping back over gold tiles (out of a dead end) is just walking.
      play('tap');
      setHeading(index === here + 1 ? 'right' : index === here - 1 ? 'left' : index > here ? 'down' : 'up');
      setHere(index);
      setWalked((prev) => new Set(prev).add(index));
      // One step was shown — or made without help: from here the child goes alone.
      setLit(false);
      setSlips(0);
      setMissed(null);
      if (index === finish) callbacks.onSuccess();
      return;
    }
    setCracked(index);
    // The lesson turns to the number just stepped on, and says why it is not one of the rule's.
    if (said) {
      setMissed(cells[index]);
      voice.say(divisibleSpeech(said, cells[index]), 'hint', saidLang);
    }
    // Two slips on the same spot bring the helper back for one more step.
    if (hintActive && slips + 1 >= SLIPS_FOR_HINT) {
      setLit(true);
      setSlips(0);
    } else {
      setSlips(slips + 1);
    }
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
              <Mascot heading={heading} />
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
      {/* After a wrong step — and once the child needs help for any reason — why a number is one of the rule's. */}
      <AnimatePresence>
        {divisible && (missed !== null || hintActive) && !done && (
          <motion.div
            key={missed ?? 'rule'}
            className={styles.mazeLesson}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <DivisibleHint divisible={divisible} tried={missed} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
