import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useGameStore } from '@/core/store/useGameStore';
import { useSound } from '@/core/audio/useSound';
import { fireConfetti } from './celebration.helpers';
import styles from './Celebration.module.css';

interface CelebrationProps {
  active: boolean;
}

const PARTICLE_COUNT = 16;

/**
 * Full-screen, non-interactive celebration overlay. Combines canvas-confetti
 * with themed emoji particles and the fanfare sound. The particle motion adapts
 * to the chosen celebration style (balloons rise & pop, others shower down).
 */
export function Celebration({ active }: CelebrationProps) {
  const theme = useActiveTheme();
  const style = useGameStore((s) => s.settings.celebration);
  const { play } = useSound();

  // Fire the burst + fanfare once per activation.
  useEffect(() => {
    if (!active) return;
    fireConfetti(style);
    play('fanfare');
    if (style === 'balloons') {
      const t = setTimeout(() => play('pop'), 1400);
      return () => clearTimeout(t);
    }
  }, [active, style, play]);

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        emoji: theme.celebrationEmojis[i % theme.celebrationEmojis.length],
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1.6 + Math.random() * 1.4,
        size: 1.8 + Math.random() * 1.8,
      })),
    [theme, active], // regenerate per activation
  );

  const rising = style === 'balloons';

  return (
    <div className={styles.layer} aria-hidden>
      <AnimatePresence>
        {active &&
          particles.map((p) => (
            <motion.span
              key={p.id}
              className={`${styles.particle} emoji`}
              style={{ left: `${p.x}%`, fontSize: `${p.size}rem` }}
              initial={{ y: rising ? '110vh' : '-20vh', opacity: 0, rotate: 0 }}
              animate={{
                y: rising ? '-20vh' : '110vh',
                opacity: [0, 1, 1, 0],
                rotate: rising ? [0, -12, 12, 0] : [0, 180, 360],
                x: [0, 20, -20, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: p.duration, delay: p.delay, ease: 'easeInOut' }}
            >
              {p.emoji}
            </motion.span>
          ))}
      </AnimatePresence>
    </div>
  );
}
