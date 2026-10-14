import type { AlphabetScene as Scene } from '@/core/game/hints/types';
import { cn } from '@/core/utils/cn';
import { blinkProps, useHintFocus } from '../HintStage';
import styles from './AlphabetScene.module.css';

function Letter({ letter }: { letter: string }) {
  const lit = blinkProps(useHintFocus(`abc:${letter}`));
  return (
    <span className={cn(styles.letter, lit.className !== undefined && styles.named, lit.className)} style={lit.style}>
      {letter}
    </span>
  );
}

/**
 * The whole alphabet in a row under the board, so the child can find where
 * the bubbles' letters stand in it — the letters each beat names blink, the
 * one before and the one due next.
 */
export function AlphabetScene({ scene }: { scene: Scene }) {
  return (
    <div className={styles.alphabet} aria-hidden>
      {scene.letters.map((letter) => (
        <Letter key={letter} letter={letter} />
      ))}
    </div>
  );
}
