import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useSound } from '@/core/audio/useSound';
import type { BalanceScalePayload } from '@/core/game/templates/types';
import { scaleTilt } from '@/core/game/templates/validate';
import { cn } from '@/core/utils/cn';
import { CardFace, Glyphs, type LayoutProps } from './parts';
import { useDragDrop } from './useDragDrop';
import styles from './Templates.module.css';

const DOT_COLORS = ['var(--operand-a)', 'var(--operand-b)', '#f59e0b', '#10b981'];
/** How far the beam leans when the pans disagree. */
const TILT_DEG = 9;
const SWING = { type: 'spring', stiffness: 90, damping: 9 } as const;

/**
 * UI_BALANCE_SCALE — a lever scale. The left pan holds an expression; drag a
 * weight onto the right pan and the beam physically tilts. Balanced → a green
 * indicator and a "ding". The helper is a cloud of coloured dots to count.
 */
export function PhysicsScaleLayout({ payload, callbacks, hintActive }: LayoutProps<BalanceScalePayload>) {
  const { left, weights, hintDots } = payload;
  const { playCode, chime } = useSound();
  const [onPan, setOnPan] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  const placed = weights.find((w) => w.id === onPan);
  // Empty right pan → the loaded left pan hangs low.
  const tilt = placed ? scaleTilt(left.value, placed.value) : -1;

  const onDrop = (weightId: string) => {
    if (solved || onPan) return;
    const weight = weights.find((w) => w.id === weightId);
    if (!weight) return;
    setOnPan(weightId);
    playCode('SND_DROP_SLOT');
    if (scaleTilt(left.value, weight.value) === 0) {
      setSolved(true);
      chime(4);
      callbacks.onSuccess();
      return;
    }
    callbacks.onMistake();
    // Let the child SEE the scale lean, then hand the weight back.
    window.setTimeout(() => setOnPan(null), 1100);
  };
  const dnd = useDragDrop((id) => onDrop(id), solved);

  return (
    <div className="stack">
      <div className={styles.scale}>
        <span className={cn(styles.scaleLamp, solved && styles.scaleLampOn)} aria-hidden />
        <div className={styles.scaleStand} aria-hidden />
        <motion.div className={styles.beam} animate={{ rotate: tilt * TILT_DEG }} transition={SWING}>
          {/* Pans counter-rotate so they hang level while the beam leans. */}
          <motion.div
            className={cn(styles.pan, styles.panLeft)}
            animate={{ rotate: -tilt * TILT_DEG }}
            transition={SWING}
          >
            <div className={styles.panBowl}>
              <button type="button" className={styles.panLoad} onClick={callbacks.speakPrompt}>
                <Glyphs glyphs={left.glyphs} />
              </button>
            </div>
          </motion.div>
          <motion.div
            className={cn(styles.pan, styles.panRight)}
            animate={{ rotate: -tilt * TILT_DEG }}
            transition={SWING}
          >
            <div className={cn(styles.panBowl, dnd.over === 'pan' && styles.dropOver)} {...dnd.target('pan')}>
              {placed ? (
                <motion.div className={styles.panLoad} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  <CardFace card={placed} speaker={false} />
                </motion.div>
              ) : (
                <span className={styles.panEmpty} aria-hidden>
                  ?
                </span>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {hintActive && hintDots && !solved && (
          <motion.div className={styles.dotCloud} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {hintDots.map((count, g) => (
              <span key={g} className={styles.dotGroup}>
                {Array.from({ length: count }, (_, i) => (
                  <span key={i} className={styles.dot} style={{ background: DOT_COLORS[g % DOT_COLORS.length] }} />
                ))}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.tray}>
        {weights
          .filter((w) => w.id !== onPan)
          .map((w) => (
            <div
              key={w.id}
              className={cn(styles.chipInner, styles.weight, dnd.selected === w.id && styles.chipSelected)}
              style={dnd.styleFor(w.id)}
              {...dnd.bind(w.id)}
            >
              <CardFace card={w} speaker={false} />
            </div>
          ))}
      </div>
    </div>
  );
}
