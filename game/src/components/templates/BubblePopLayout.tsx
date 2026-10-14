import { motion } from 'framer-motion';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useSound } from '@/core/audio/useSound';
import { saidOf } from '@/core/game/kernel/types';
import { fillScript, helpOf } from '@/core/game/hints/script';
import type { AlphabetScene, HintScript } from '@/core/game/hints/types';
import { say } from '@/core/language/marks';
import type { BubblePopPayload, Card } from '@/core/game/templates/types';
import { isNextBubble } from '@/core/game/templates/validate';
import { shuffle } from '@/core/utils/random';
import { cn } from '@/core/utils/cn';
import { blinkProps, useHintFocus, useHintStage } from '@/components/hints/HintStage';
import { CardFace, Stimulus, type LayoutProps } from './parts';
import styles from './Templates.module.css';

/** What a bubble shows — two bubbles with the same face are interchangeable. */
const faceOf = (card: Card) => card.label ?? card.emoji ?? card.id;

/** A wrong bubble does not pop — it springs back. */
const SPRING = { scale: [1, 0.8, 1.14, 0.94, 1] };

/** The sheen of a soap bubble — content, not chrome: the same in every theme. */
const SHEENS = ['#ff8fa3', '#ffd166', '#8ecae6', '#b8e986', '#cdb4f6', '#ffb38a', '#7fe0d0'];

/**
 * The alphabet help with the letters filled in: the one due next and the one
 * before it — said by name where the voice reads the alphabet by names.
 */
function alphabetHelp(script: HintScript | undefined, prev: string | undefined, next: string, nextId: string): HintScript | undefined {
  if (!script || script.scene?.kind !== 'alphabet') return undefined;
  const scene = script.scene as AlphabetScene;
  const named = (letter: string) => {
    const name = scene.names?.[scene.letters.indexOf(letter)];
    return name ? say(letter, name) : letter;
  };
  return fillScript(script, { next: named(next), N: next, prev: prev ? named(prev) : '', P: prev ?? '', nextId, started: prev ? 1 : '' });
}

/** One floating bubble; it blinks while a beat of the help names it (`bubble:<id>`). */
function Bubble({ bubble, gone, hinted, spring, onTap, onSprung }: { bubble: Card; gone: boolean; hinted: boolean; spring: boolean; onTap: () => void; onSprung: () => void }) {
  const lit = blinkProps(useHintFocus(`bubble:${bubble.id}`));
  return (
    <motion.button
      type="button"
      className={cn(styles.popBubble, hinted && styles.pulsing, lit.className)}
      style={lit.style}
      onClick={onTap}
      disabled={gone}
      aria-label={bubble.speak ?? faceOf(bubble)}
      animate={gone ? { scale: 1.5, opacity: 0 } : spring ? SPRING : { scale: 1, opacity: 1 }}
      transition={{ duration: gone ? 0.22 : 0.45 }}
      onAnimationComplete={() => spring && onSprung()}
    >
      {bubble.label ?? (
        <span className="emoji" aria-hidden>
          {bubble.emoji}
        </span>
      )}
    </motion.button>
  );
}

/**
 * Bubble pop — soap bubbles drift about, the child pops them in order (tap).
 * Popped faces line up in the row above, so the word grows letter by letter.
 * Helper: the bubble to pop next pulses. On an alphabet run the help also
 * draws the whole alphabet under the board and walks through it (`payload.help`,
 * a board's script): where the run's letters stand, then the letter due next —
 * lit in the strip and on its bubble while it is said.
 */
export function BubblePopLayout({ task, payload, callbacks, hintActive }: LayoutProps<BubblePopPayload>) {
  const { bubbles, extras, target } = payload;
  const { play } = useSound();
  const stage = useHintStage();
  const floating = useMemo(() => shuffle([...bubbles, ...(extras ?? [])]), []); // eslint-disable-line react-hooks/exhaustive-deps
  const faces = bubbles.map(faceOf);
  const [popped, setPopped] = useState<string[]>([]);
  const [spring, setSpring] = useState<string | null>(null);

  const done = popped.length === bubbles.length;
  const nextFace = faces[popped.length];
  const nextId = !done ? floating.find((b) => !popped.includes(b.id) && faceOf(b) === nextFace)?.id : undefined;
  const hintId = hintActive ? nextId : undefined;

  /** Says where the letter due next stands in the alphabet, after `count` bubbles are popped. */
  const explain = (count: number) => {
    const due = faces[count];
    const id = floating.find((b) => !popped.includes(b.id) && faceOf(b) === due)?.id;
    if (!stage || due === undefined || !id) return;
    const prev = count > 0 ? faces[count - 1] : undefined;
    const shown = alphabetHelp(helpOf(payload), prev, due, id);
    if (!shown) return;
    const voiced = saidOf(task);
    stage.start({ shown, said: alphabetHelp(helpOf(voiced.payload), prev, due, id), lang: voiced.lang, kind: 'help' });
  };

  // Help is due: show it once…
  useEffect(() => {
    if (hintActive) explain(popped.length);
  }, [hintActive]); // eslint-disable-line react-hooks/exhaustive-deps

  const tap = (bubble: Card) => {
    if (done || popped.includes(bubble.id)) return;
    if (!isNextBubble(faces, popped.length, faceOf(bubble))) {
      setSpring(bubble.id);
      // …and again after each wrong bubble while it is up.
      if (hintActive) explain(popped.length);
      callbacks.onMistake();
      return;
    }
    play('pop');
    const next = [...popped, bubble.id];
    setPopped(next);
    // A right bubble: what the help said is no longer the letter due.
    if (stage?.play?.kind === 'help') stage.clear();
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
        {floating.map((bubble, i) => (
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
              <Bubble
                bubble={bubble}
                gone={popped.includes(bubble.id)}
                hinted={hintId === bubble.id}
                spring={spring === bubble.id}
                onTap={() => tap(bubble)}
                onSprung={() => setSpring(null)}
              />
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
