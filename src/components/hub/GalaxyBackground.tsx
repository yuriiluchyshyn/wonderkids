import { motion } from 'framer-motion';
import { getGalaxy } from '@/core/galaxies';
import styles from './GalaxyBackground.module.css';

interface GalaxyBackgroundProps {
  galaxyId: string;
}

/** Small deterministic PRNG so the sky is identical on every render. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** A layer of stars as one element: every star is a box-shadow. */
function starField(count: number, seed: number): string {
  const rnd = seeded(seed);
  return Array.from({ length: count }, () => `${(rnd() * 100).toFixed(2)}vw ${(rnd() * 100).toFixed(2)}vh 0 0 currentColor`).join(', ');
}

const FAR_STARS = starField(110, 7);
const MID_STARS = starField(55, 23);
const NEAR_STARS = starField(18, 41);

interface ArmDot {
  x: number;
  y: number;
  r: number;
  o: number;
  alt: boolean;
}

/**
 * Stars along logarithmic spiral arms — what actually makes a blur of light
 * read as a galaxy. Two bright arms and two faint ones, on a 200×200 canvas.
 */
function spiralArms(): ArmDot[] {
  const rnd = seeded(99);
  const dots: ArmDot[] = [];
  const ARMS = 4;
  const PER_ARM = 64;
  for (let arm = 0; arm < ARMS; arm += 1) {
    const faint = arm % 2 === 1;
    for (let i = 0; i < PER_ARM; i += 1) {
      const t = i / (PER_ARM - 1);
      const angle = (arm / ARMS) * Math.PI * 2 + t * Math.PI * 2.6;
      // Dots scatter more the further out they are, like real arms.
      const radius = 9 + t * 84 + (rnd() - 0.5) * (4 + t * 14);
      const wobble = (rnd() - 0.5) * 0.22;
      dots.push({
        x: 100 + Math.cos(angle + wobble) * radius,
        y: 100 + Math.sin(angle + wobble) * radius,
        r: (faint ? 0.5 : 0.9) * (1.5 - t) + rnd() * 0.5,
        o: (faint ? 0.4 : 0.85) * (1 - t * 0.65),
        alt: rnd() > 0.6,
      });
    }
  }
  return dots;
}

const ARM_DOTS = spiralArms();

/** Smooth centre-line of one spiral arm, for the soft glow under the stars. */
function armPath(arm: number): string {
  const points: string[] = [];
  for (let i = 0; i <= 40; i += 1) {
    const t = i / 40;
    const angle = (arm / 4) * Math.PI * 2 + t * Math.PI * 2.6;
    const radius = 9 + t * 84;
    points.push(`${(100 + Math.cos(angle) * radius).toFixed(1)},${(100 + Math.sin(angle) * radius).toFixed(1)}`);
  }
  return `M${points.join(' L')}`;
}

const ARM_PATHS = [0, 1, 2, 3].map(armPath);

/** Where the galaxy's motif "planets" drift (cycled over `motif`). */
const PLANETS = [
  { top: '14%', left: '80%', size: 2.3, d: 0 },
  { top: '30%', left: '9%', size: 1.9, d: 0.7 },
  { top: '62%', left: '87%', size: 2.1, d: 1.3 },
  { top: '78%', left: '14%', size: 1.8, d: 0.4 },
] as const;

/**
 * The hub's sky: a tilted spiral galaxy slowly turning among three depths of
 * twinkling stars, with nebula clouds and the odd shooting star. Colours come
 * from the CHILD'S active theme (so every world keeps its palette, light or
 * dark); the drifting "planets" are the selected GALAXY's motif icons.
 */
export function GalaxyBackground({ galaxyId }: GalaxyBackgroundProps) {
  const galaxy = getGalaxy(galaxyId);

  return (
    <div className={styles.sky} aria-hidden>
      <div className={styles.nebula} />

      <div className={styles.starsFar} style={{ boxShadow: FAR_STARS }} />
      <div className={styles.starsMid} style={{ boxShadow: MID_STARS }} />
      <div className={styles.starsNear} style={{ boxShadow: NEAR_STARS }} />

      {/* Tilted like a galaxy seen from the side; the disk inside rotates. */}
      <div className={styles.galaxyTilt}>
        <svg className={styles.galaxy} viewBox="0 0 200 200">
          <defs>
            <radialGradient id="wk-galaxy-core">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
              <stop offset="18%" stopColor="var(--ring)" stopOpacity="0.75" />
              <stop offset="45%" stopColor="var(--accent)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </radialGradient>
            <filter id="wk-galaxy-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>
          <circle cx="100" cy="100" r="98" fill="url(#wk-galaxy-core)" opacity="0.7" />
          {/* Glowing arms: wide blurred strokes the star dots then sit on. */}
          <g filter="url(#wk-galaxy-blur)" fill="none" strokeLinecap="round">
            {ARM_PATHS.map((d, arm) => (
              <path
                key={arm}
                d={d}
                className={arm % 2 ? styles.hazeAlt : styles.haze}
                strokeWidth={arm % 2 ? 9 : 14}
              />
            ))}
          </g>
          {ARM_DOTS.map((dot, i) => (
            <circle
              key={i}
              cx={dot.x}
              cy={dot.y}
              r={dot.r}
              opacity={dot.o}
              className={dot.alt ? styles.armAlt : styles.arm}
            />
          ))}
          <circle cx="100" cy="100" r="22" fill="url(#wk-galaxy-core)" />
        </svg>
      </div>

      <span className={styles.shooting} />
      <span className={`${styles.shooting} ${styles.shooting2}`} />

      {PLANETS.map((slot, i) => (
        <motion.span
          key={`${galaxyId}-${i}`}
          className={`${styles.motif} emoji`}
          style={{ top: slot.top, left: slot.left, fontSize: `${slot.size}rem` }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 0.5, scale: 1, y: [0, -12, 0] }}
          transition={{
            opacity: { duration: 0.6 },
            scale: { duration: 0.6 },
            y: { repeat: Infinity, duration: 7, delay: slot.d, ease: 'easeInOut' },
          }}
        >
          {galaxy.motif[i % galaxy.motif.length]}
        </motion.span>
      ))}
    </div>
  );
}
