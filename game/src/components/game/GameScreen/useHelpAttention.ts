import { animate } from 'framer-motion';
import { useCallback, useRef } from 'react';
import { useSound } from '@/core/audio/useSound';

/**
 * Where the child's eyes are led when there is help to look at: the help is
 * brought into sight, and — after a tap on the board while it is being said —
 * a soft «listen» and a little nudge of the help, so the child sees where to
 * look. Never the sound of a mistake: nothing was answered.
 */
export function useHelpAttention() {
  const { play } = useSound();
  /** The help area under the board. */
  const helperRef = useRef<HTMLDivElement>(null);
  /** What is nudged in it. */
  const attentionRef = useRef<HTMLDivElement>(null);
  const lastNudge = useRef(0);

  const bringIntoSight = useCallback(() => {
    helperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  const nudge = useCallback(() => {
    const now = Date.now();
    // One tap is a pointerdown and a click, a held key repeats: one nudge for each.
    if (now - lastNudge.current < 500) return;
    lastNudge.current = now;
    play('listen');
    bringIntoSight();
    if (attentionRef.current) animate(attentionRef.current, { scale: [1, 1.04, 1] }, { duration: 0.45, ease: 'easeOut' });
  }, [play, bringIntoSight]);

  return { helperRef, attentionRef, bringIntoSight, nudge };
}
