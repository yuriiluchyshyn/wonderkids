import { useEffect, useMemo, type CSSProperties } from 'react';
import { perf } from '@/core/app/platform';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useSound } from '@/core/audio/useSound';
import { fireConfetti } from './celebration.helpers';
import styles from './Celebration.module.css';

interface CelebrationProps {
  active: boolean;
}

/** As many as the device can carry (`docs/browser-support.md`). */
const PARTICLE_COUNT = perf.particles(16);

/**
 * Full-screen, non-interactive celebration overlay. Combines canvas-confetti
 * with themed emoji particles and the fanfare sound. The particle motion adapts
 * to the chosen celebration style (balloons rise & pop, others shower down).
 *
 * The particles fly in CSS (`Celebration.module.css`), not in JavaScript: the
 * win screen opens together with a jingle, a voice and the confetti, and on a
 * phone whose main thread is busy with those a script-driven particle arrives
 * in jerks. Each one only brings its own numbers as custom properties.
 */
export function Celebration({ active }: CelebrationProps) {
  const theme = useActiveTheme();
  const style = useGameStore((s) => s.settings.celebration);
  const { play } = useSound();

  // Fire the confetti burst once per activation. The victory jingle/fanfare is
  // owned by the GameScreen win modal so it stays in sync with the "Ти
  // неймовірний!" screen (and never double-plays).
  useEffect(() => {
    if (!active) return;
    fireConfetti(style);
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

  // Nothing to show — nothing on the screen: an empty layer over the whole
  // game is still a layer.
  if (!active) return null;

  return (
    <div className={styles.layer} aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className={`${styles.particle} ${rising ? styles.rise : styles.fall} emoji`}
          style={
            {
              left: `${p.x}%`,
              fontSize: `${p.size}rem`,
              '--fly': `${p.duration}s`,
              '--wait': `${p.delay}s`,
            } as CSSProperties
          }
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
