import { useRef } from 'react';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import styles from './Mascot.module.css';

export type Heading = 'right' | 'left' | 'up' | 'down';

const TURN: Record<Heading, number> = { right: 0, down: 90, left: 180, up: -90 };

/**
 * The theme's mascot, looking the way it is going. Wherever the mascot MOVES
 * (the progress track, the number maze) it is drawn with this, never as a bare
 * emoji: a rocket flying to the planet nose first, a car driving back the way
 * it came.
 *
 * How to turn it is told by the theme (`mascot.faces`, `mascot.tilt`): a
 * picture drawn in profile is mirrored; one that points along its nose (the
 * rocket, drawn at 45°) is turned to any of the four ways; one that looks
 * straight at the child has no side to turn and stays as it is.
 */
export function Mascot({ heading = 'right' }: { heading?: Heading }) {
  const { mascot } = useActiveTheme();
  // Going up or down, a profile keeps looking the way it last went sideways.
  const side = useRef<'left' | 'right'>('right');
  if (heading === 'left' || heading === 'right') side.current = heading;

  let transform: string | undefined;
  if (mascot.tilt !== undefined) {
    // Mirrored, not spun round, to fly left — so it does not fly upside down.
    transform = heading === 'left' ? `scaleX(-1) rotate(${mascot.tilt}deg)` : `rotate(${mascot.tilt + TURN[heading]}deg)`;
  } else if (mascot.faces && mascot.faces !== side.current) {
    transform = 'scaleX(-1)';
  }

  return (
    <span className={`${styles.mascot} emoji`} style={{ transform }} aria-hidden>
      {mascot.emoji}
    </span>
  );
}
