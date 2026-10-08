import { motion } from 'framer-motion';
import { useMemo, useState, type CSSProperties } from 'react';
import { useSound } from '@/core/audio/useSound';
import type { BubblePopPayload, Card } from '@/core/game/templates/types';
import { isNextBubble } from '@/core/game/templates/validate';
import { shuffle } from '@/core/utils/random';
import { cn } from '@/core/utils/cn';
import { CardFace, Stimulus, type LayoutProps } from './parts';
import styles from './Templates.module.css';

/** What a bubble shows — two bubbles with the same face are interchangeable. */
const faceOf = (card: Card) => card.label ?? card.emoji ?? card.id;

/** A wrong bubble does not pop — it springs back. */
const SPRING = { scale: [1, 0.8, 1.14, 0.94, 1] };

/** The sheen of a soap bubble — content, not chrome: the same in every theme. */
const SHEENS = ['#ff8fa3', '#ffd166', '#8ecae6', '#b8e986', '#cdb4f6', '#ffb38a', '#7fe0d0'];

/**
 * Bubble pop — soap bubbles drift about, the child pops them in order (tap).
 * Popped faces line up in the row above, so the word grows letter by letter.
 * Helper: the bubble to pop next pulses.
 */
export function BubblePopLayout({ payload, callbacks, hintActive }: LayoutProps<BubblePopPayload>) {
  const { bubbles, extras, target } = payload;
  const { play } = useSound();
  const floating = useMemo(() => shuffle([...bubbles, ...(extras ?? [])]), []); // eslint-disable-line react-hooks/exhaustive-deps
  const faces = bubbles.map(faceOf);
  const [popped, setPopped] = useState<string[]>([]);
  const [spring, setSpring] = useState<string | null>(null);

  const done = popped.length === bubbles.length;
  const nextFace = faces[popped.length];
  const hintId = hintActive && !done ? floating.find((b) => !popped.includes(b.id) && faceOf(b) === nextFace)?.id : null;

  const tap = (bubble: Card) => {
    if (done || popped.includes(bubble.id)) return;
    if (!isNextBubble(faces, popped.length, faceOf(bubble))) {
      setSpring(bubble.id);
      callbacks.onMistake();
      return;
    }
    play('pop');
    const next = [...popped, bubble.id];
    setPopped(next);
    if (next.length === bubbles.length) callbacks.onSuccess();
  };

  return (
    <div className="stack">
      <Stimulus payload={payload} onSpeak={callbacks.speakPrompt} />
      {target && (
        <div className={styles.popTarget}>
          <CardFace card={target} />
        </div>
      )}

      {/* The answer so far: one place per bubble, filled as they pop. */}
      <div className={cn(styles.popRow, done && styles.popRowDone)} aria-live="polite">
        {faces.map((face, i) => (
          <span key={i} className={cn(styles.popPlace, i < popped.length && styles.popPlaceOn)}>
            {i < popped.length ? face : ''}
          </span>
        ))}
      </div>

      <div className={styles.popField}>
        {floating.map((bubble, i) => {
          const gone = popped.includes(bubble.id);
          return (
            // Two loops of different lengths — sideways drift and up-and-down bob —
            // so every bubble wanders along a path of its own.
            <span
              key={bubble.id}
              className={styles.popFloat}
              style={
                {
                  '--sheen': SHEENS[i % SHEENS.length],
                  '--sheen2': SHEENS[(i + 3) % SHEENS.length],
                  '--drift': `${6.2 + (i % 4) * 1.3}s`,
                  '--bob': `${3.7 + (i % 3) * 0.9}s`,
                  '--delay': `${-(i * 1.1)}s`,
                } as CSSProperties
              }
            >
              <span className={styles.popBob}>
                <motion.button
                  type="button"
                  className={cn(styles.popBubble, hintId === bubble.id && styles.pulsing)}
                  onClick={() => tap(bubble)}
                  disabled={gone}
                  aria-label={bubble.speak ?? faceOf(bubble)}
                  animate={gone ? { scale: 1.5, opacity: 0 } : spring === bubble.id ? SPRING : { scale: 1, opacity: 1 }}
                  transition={{ duration: gone ? 0.22 : 0.45 }}
                  onAnimationComplete={() => spring === bubble.id && setSpring(null)}
                >
                  {bubble.label ?? (
                    <span className="emoji" aria-hidden>
                      {bubble.emoji}
                    </span>
                  )}
                </motion.button>
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
