import { motion } from 'framer-motion';
import { getGalaxy } from '@/core/galaxies';
import styles from './GalaxyBackground.module.css';

interface GalaxyBackgroundProps {
  galaxyId: string;
}

/** Fixed star positions so the sky doesn't jump around on every render. */
const STARS = [
  { top: '8%', left: '12%', s: 1.1, d: 0 },
  { top: '18%', left: '82%', s: 0.8, d: 0.6 },
  { top: '30%', left: '46%', s: 0.6, d: 1.2 },
  { top: '44%', left: '8%', s: 0.9, d: 0.3 },
  { top: '58%', left: '90%', s: 0.7, d: 0.9 },
  { top: '70%', left: '30%', s: 1.0, d: 1.5 },
  { top: '82%', left: '66%', s: 0.8, d: 0.4 },
  { top: '14%', left: '58%', s: 0.6, d: 1.1 },
  { top: '52%', left: '68%', s: 0.7, d: 0.2 },
  { top: '88%', left: '18%', s: 0.9, d: 0.8 },
] as const;

/** Where the galaxy's motif icons sit (cycled over `motif`). */
const SLOTS = [
  { top: '12%', left: '78%', size: 2.6, rot: -12, d: 0 },
  { top: '26%', left: '14%', size: 2.1, rot: 10, d: 0.7 },
  { top: '48%', left: '86%', size: 2.4, rot: 8, d: 1.3 },
  { top: '66%', left: '10%', size: 2.2, rot: -8, d: 0.4 },
  { top: '80%', left: '48%', size: 2.0, rot: 12, d: 1.0 },
  { top: '38%', left: '40%', size: 1.8, rot: -6, d: 1.6 },
] as const;

/**
 * A galactic backdrop (Tech Spec: galaxies). The nebula glow uses the CHILD'S
 * active theme colours (so switching worlds keeps its palette), while the
 * floating motif icons come from the currently selected GALAXY — picking a new
 * galaxy swaps the motif without touching the theme.
 */
export function GalaxyBackground({ galaxyId }: GalaxyBackgroundProps) {
  const galaxy = getGalaxy(galaxyId);

  return (
    <div className={styles.sky} aria-hidden>
      <div className={styles.nebula} />

      {STARS.map((st, i) => (
        <motion.span
          key={`s${i}`}
          className={styles.star}
          style={{ top: st.top, left: st.left, fontSize: `${st.s}rem` }}
          animate={{ opacity: [0.25, 0.9, 0.25], scale: [0.9, 1.15, 0.9] }}
          transition={{ repeat: Infinity, duration: 3.5, delay: st.d }}
        >
          ✦
        </motion.span>
      ))}

      {SLOTS.map((slot, i) => (
        <motion.span
          key={`${galaxyId}-${i}`}
          className={`${styles.motif} emoji`}
          style={{ top: slot.top, left: slot.left, fontSize: `${slot.size}rem` }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{
            opacity: 0.22,
            scale: 1,
            y: [0, -14, 0],
            rotate: [slot.rot, slot.rot + 4, slot.rot],
          }}
          transition={{
            opacity: { duration: 0.6 },
            scale: { duration: 0.6 },
            y: { repeat: Infinity, duration: 6, delay: slot.d },
            rotate: { repeat: Infinity, duration: 6, delay: slot.d },
          }}
        >
          {galaxy.motif[i % galaxy.motif.length]}
        </motion.span>
      ))}
    </div>
  );
}
