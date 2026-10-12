import { useT } from '@/core/translator';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useSound } from '@/core/audio/useSound';
import type { ColorMixPayload } from '@/core/game/templates/types';
import { isRecipe } from '@/core/game/templates/validate';
import { cn } from '@/core/utils/cn';
import { SHAKE, SHAKE_TRANSITION, Stimulus, type LayoutProps } from './parts';
import styles from './Templates.module.css';

/** How long the cauldron stirs before the colour is judged / shown off. */
const STIR_MS = 650;

/**
 * Colour mixer — the object is grey; the child pours paints into the
 * cauldron, as many as the recipe has (two, three, or two and glitter). The
 * right ones: the cauldron bubbles, the colour flows into the final one and
 * the object gets painted — a shiny colour sparkles. Others: the cauldron
 * empties itself and waits for a new try. Helper: the right tubes pulse.
 */
export function ColorMixLayout({ payload, callbacks, hintActive }: LayoutProps<ColorMixPayload>) {
  const t = useT();
  const { object, result, paints, recipe } = payload;
  const { play, playCode } = useSound();
  const [poured, setPoured] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [shake, setShake] = useState(false);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const needed = recipe.length;
  const busy = solved || poured.length >= needed;

  const pour = (id: string) => {
    if (busy || poured.includes(id)) return;
    playCode('SND_DROP_SLOT');
    const next = [...poured, id];
    setPoured(next);
    if (next.length < needed) return;
    if (isRecipe(recipe, next)) {
      setSolved(true);
      play('pop');
      // Let the colour flow in and the object get painted before moving on.
      timer.current = window.setTimeout(() => callbacks.onSuccess(), STIR_MS);
    } else {
      timer.current = window.setTimeout(() => {
        setShake(true);
        setPoured([]);
        callbacks.onMistake();
      }, STIR_MS);
    }
  };

  const colorOf = (id: string) => paints.find((p) => p.id === id)?.color;
  // What is in the pot so far: one colour, or bands of each poured one.
  const bands = poured.map((id, i) => `${colorOf(id)} ${(i * 100) / poured.length}% ${((i + 1) * 100) / poured.length}%`);
  const liquid = solved ? result.color : poured.length > 1 ? `linear-gradient(90deg, ${bands.join(', ')})` : poured.length === 1 ? colorOf(poured[0]) : undefined;
  const sparkles = (solved && result.shine) || poured.some((id) => paints.find((p) => p.id === id)?.shine);

  return (
    <div className="stack">
      <Stimulus payload={payload} onSpeak={callbacks.speakPrompt} />

      <div className={styles.mixStage}>
        <div className={styles.mixObject}>
          <motion.span
            className={cn(styles.mixEmoji, 'emoji', solved && styles.mixEmojiOn, solved && result.shine && styles.mixEmojiShine)}
            animate={solved ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            aria-hidden
          >
            {object.emoji}
          </motion.span>
          {object.label && <span className={styles.faceLabel}>{object.label}</span>}
        </div>

        <motion.div
          className={styles.mixPot}
          animate={shake ? SHAKE : { x: 0 }}
          transition={SHAKE_TRANSITION}
          onAnimationComplete={() => setShake(false)}
          aria-label={t('tpl.cauldron')}
        >
          <div className={cn(styles.mixLiquid, liquid && styles.mixLiquidOn, solved && styles.mixLiquidDone)} style={{ background: liquid }}>
            {sparkles && (
              <span className={cn(styles.mixSparkles, 'loop-breathe')} aria-hidden>
                ✨
              </span>
            )}
            {(solved || poured.length === needed) && (
              <>
                <span className={styles.mixBubble} style={{ left: '22%' }} />
                <span className={styles.mixBubble} style={{ left: '50%', animationDelay: '0.18s' }} />
                <span className={styles.mixBubble} style={{ left: '74%', animationDelay: '0.34s' }} />
              </>
            )}
          </div>
          {solved && <span className={styles.mixName}>{result.name}</span>}
        </motion.div>
      </div>

      <div className={cn(styles.mixPaints, paints.length > 6 && styles.mixPaintsMany)}>
        {paints.map((paint) => {
          const used = poured.includes(paint.id);
          return (
            <motion.button
              key={paint.id}
              type="button"
              className={cn(styles.mixPaint, used && styles.mixPaintUsed, hintActive && !busy && recipe.includes(paint.id) && !used && styles.pulsing)}
              onClick={() => pour(paint.id)}
              disabled={busy || used}
              whileTap={{ scale: 0.92 }}
              aria-label={t('tpl.paint', { name: paint.name })}
            >
              <span className={cn(styles.mixBlob, paint.shine && styles.mixBlobShine)} style={{ background: paint.color }}>
                {paint.shine && (
                  <span className={styles.mixBlobTwinkle} aria-hidden>
                    ✨
                  </span>
                )}
              </span>
              <span className={styles.faceLabel}>{paint.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
