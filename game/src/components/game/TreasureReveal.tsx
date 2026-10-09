import { useT } from '@/core/translator';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Treasure } from '@/core/theme/theme.types';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useSound } from '@/core/audio/useSound';
import styles from './TreasureReveal.module.css';

interface TreasureRevealProps {
  active: boolean;
  treasure: Treasure | null;
  /** True when this treasure is a brand-new addition to the collection. */
  isNew: boolean;
  /** Called when the reveal animation finishes (or the child taps to skip). */
  onDone: () => void;
}

type Phase = 'shake' | 'reveal' | 'fly';

const SHAKE_MS = 850;
const REVEAL_MS = 1600;
const FLY_MS = 900;

/** A few sparkle emojis that burst out alongside the treasure. */
const SPARKLES = ['✨', '⭐', '🌟', '💫'];

/**
 * Full-screen "treasure chest" moment shown when a session finishes on a chest
 * step: the themed chest shakes, springs open with a sound, the found treasure
 * bursts out, then flies down into the child's collection. Tapping anywhere
 * skips ahead.
 */
export function TreasureReveal({ active, treasure, isNew, onDone }: TreasureRevealProps) {
  const t = useT();
  const theme = useActiveTheme();
  const { play } = useSound();
  const [phase, setPhase] = useState<Phase>('shake');

  const open = active && treasure !== null;

  useEffect(() => {
    if (!open) return;
    setPhase('shake');
    play('chestOpen');

    const toReveal = window.setTimeout(() => {
      setPhase('reveal');
      play('treasure');
    }, SHAKE_MS);
    const toFly = window.setTimeout(() => setPhase('fly'), SHAKE_MS + REVEAL_MS);
    const toDone = window.setTimeout(onDone, SHAKE_MS + REVEAL_MS + FLY_MS);

    return () => {
      window.clearTimeout(toReveal);
      window.clearTimeout(toFly);
      window.clearTimeout(toDone);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {open && treasure && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDone}
          role="dialog"
          aria-label={t('treasure.found', { name: treasure.name })}
        >
          <motion.p
            className={styles.title}
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {isNew ? t('treasure.new') : t('treasure.one')}
          </motion.p>

          <div className={styles.stage}>
            {/* Burst behind the chest once it opens. */}
            <AnimatePresence>
              {phase !== 'shake' && (
                <motion.span
                  key="burst"
                  className={`${styles.burst} emoji`}
                  aria-hidden
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.4, 1.1], opacity: [0, 1, 0.85], rotate: 20 }}
                  transition={{ duration: 0.5 }}
                >
                  {theme.chest.open}
                </motion.span>
              )}
            </AnimatePresence>

            {/* The chest itself: shakes while closed, drops away once open. */}
            <AnimatePresence>
              {phase === 'shake' && (
                <motion.span
                  key="chest"
                  className={`${styles.chest} emoji`}
                  aria-hidden
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    rotate: [0, -9, 9, -7, 7, -4, 4, 0],
                  }}
                  exit={{ scale: 0.4, opacity: 0, y: 20 }}
                  transition={{ rotate: { duration: SHAKE_MS / 1000, ease: 'easeInOut' } }}
                >
                  {theme.chest.closed}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Sparkles radiating out when the treasure appears. */}
            <AnimatePresence>
              {phase === 'reveal' &&
                SPARKLES.map((s, i) => {
                  const angle = (i / SPARKLES.length) * Math.PI * 2;
                  return (
                    <motion.span
                      key={s}
                      className={`${styles.sparkle} emoji`}
                      aria-hidden
                      initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                      animate={{
                        x: Math.cos(angle) * 90,
                        y: Math.sin(angle) * 90,
                        scale: [0, 1, 0.6],
                        opacity: [0, 1, 0],
                      }}
                      transition={{ duration: 1.1, delay: 0.1 }}
                    >
                      {s}
                    </motion.span>
                  );
                })}
            </AnimatePresence>

            {/* The treasure: pops out, then flies down into the collection. */}
            {phase !== 'shake' && (
              <motion.span
                className={`${styles.treasure} emoji`}
                aria-hidden
                initial={{ scale: 0, y: 10 }}
                animate={
                  phase === 'fly'
                    ? { scale: 0.25, y: 260, opacity: [1, 1, 0] }
                    : { scale: [0, 1.3, 1], y: -8 }
                }
                transition={{ duration: phase === 'fly' ? FLY_MS / 1000 : 0.6, ease: 'easeIn' }}
              >
                {treasure.emoji}
              </motion.span>
            )}
          </div>

          <AnimatePresence>
            {phase === 'reveal' && (
              <motion.p
                className={styles.name}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {treasure.name}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Collection target the treasure flies into. */}
          <motion.div
            className={styles.collection}
            animate={phase === 'fly' ? { scale: [1, 1.25, 1] } : {}}
            transition={{ duration: 0.5, delay: FLY_MS / 1000 - 0.2 }}
          >
            <span className="emoji" aria-hidden>
              🧺
            </span>
            <span>{t('treasure.collection')}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
