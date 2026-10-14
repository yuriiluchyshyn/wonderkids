import { Mascot, type Heading } from '@/components/theme/Mascot';
import { motion } from 'framer-motion';
import { useMemo, useState, type CSSProperties } from 'react';
import { useSound } from '@/core/audio/useSound';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { saidOf } from '@/core/game/kernel/types';
import { fillScript, helpOf } from '@/core/game/hints/script';
import type { DivisibleScene, HintScript } from '@/core/game/hints/types';
import type { NumberMazePayload } from '@/core/game/templates/types';
import { isAdjacent, nextStepTowards } from '@/core/game/templates/validate';
import { cn } from '@/core/utils/cn';
import { useHintStage } from '@/components/hints/HintStage';
import { divisibleHoles } from '@/components/hints/scenes/DivisibleScene';
import { SHAKE, SHAKE_TRANSITION, Stimulus, type LayoutProps } from './parts';
import styles from './Templates.module.css';

/** Wrong steps since the child last moved on, before the way out lights up: the help was said, and two more went wrong. */
const LIGHT_AT = 3;

/** Numbers as a child reads them: a real minus sign, not a hyphen. */
const show = (value: number) => String(value).replace('-', '−');

/** The help's script with the number stepped on filled in, and the holes its picture draws with. */
function about(script: HintScript | undefined, n: number): { script: HintScript; holes: Record<string, string | number> } | null {
  if (!script || script.scene?.kind !== 'divisible') return null;
  const holes = divisibleHoles(script.scene as DivisibleScene, n);
  return { script: fillScript(script, holes), holes };
}

/**
 * Number maze (UI_GRID_CHOICE family, 8–10 y) — the mascot runs across a grid
 * stepping only on numbers that fit the rule ("divisible by 3"). A right step
 * turns the tile gold; a wrong one cracks. Bigger mazes have side corridors
 * that fit the rule but end in a dead end: walking into one is not a mistake,
 * the child just walks back.
 *
 * Help comes in two stages, and the first is never the answer:
 *
 *  1. Every wrong step plays the task's help (`payload.help`, a board's
 *     script) about the very number stepped on: what is left over when it is
 *     shared into groups, why that number is not one of the rule's, and the
 *     one rule that tells a multiple of THIS number at a glance. The shell's
 *     stage says it beat by beat, with the part of the picture each beat names
 *     blinking, and holds the board still meanwhile.
 *  2. Only if two more steps go wrong after that does the way out light up —
 *     ONE tile, and then it steps aside: the child walks on alone.
 */
export function NumberMazeLayout({ task, payload, callbacks }: LayoutProps<NumberMazePayload>) {
  const { cols, cells, path, open } = payload;
  const stage = useHintStage();
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
  // Wrong steps since the child last moved on — what decides when the way out lights.
  const [slips, setSlips] = useState(0);

  const done = here === finish;
  // The one tile the way out is lit on — and only once the help has not been enough.
  const next = slips >= LIGHT_AT && !done ? nextStepTowards(here, finish, walkable, cols) : null;

  const step = (index: number) => {
    if (done || index === here || !isAdjacent(here, index, cols)) return;
    if (walkable.has(index)) {
      // Stepping back over gold tiles (out of a dead end) is just walking.
      play('tap');
      setHeading(index === here + 1 ? 'right' : index === here - 1 ? 'left' : index > here ? 'down' : 'up');
      setHere(index);
      setWalked((prev) => new Set(prev).add(index));
      // The child has moved on: the lit tile steps aside, and the help about the last number goes.
      setSlips(0);
      stage?.clear();
      if (index === finish) callbacks.onSuccess();
      return;
    }
    setCracked(index);
    setSlips(slips + 1);
    // Why this number is not one of the rule's — about it, in the screen's words and the voice's.
    const shown = about(helpOf(payload), cells[index]);
    if (stage && shown) {
      const voiced = saidOf(task);
      stage.start({ shown: shown.script, said: about(helpOf(voiced.payload), cells[index])?.script, lang: voiced.lang, kind: 'help', holes: shown.holes });
    }
    callbacks.onMistake();
  };

  return (
    <div className="stack">
      <Stimulus payload={payload} onSpeak={callbacks.speakPrompt} />
      <div className={styles.maze} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, '--maze-cols': cols } as CSSProperties}>
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
    </div>
  );
}
