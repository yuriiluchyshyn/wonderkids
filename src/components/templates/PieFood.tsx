import { motion } from 'framer-motion';
import styles from './PieFood.module.css';

interface PieFoodProps {
  food: string;
  denom: number;
  filled: number;
}

const SIZE = 220;
const R = 100;
const CENTER = SIZE / 2;

/** Builds an SVG wedge path for one slice. */
function wedge(index: number, denom: number): string {
  const slice = (Math.PI * 2) / denom;
  const start = -Math.PI / 2 + index * slice;
  const end = start + slice;
  const x1 = CENTER + R * Math.cos(start);
  const y1 = CENTER + R * Math.sin(start);
  const x2 = CENTER + R * Math.cos(end);
  const y2 = CENTER + R * Math.sin(end);
  const large = slice > Math.PI ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

/**
 * Sensory fraction plate: a food split into equal slices with `filled` of them
 * highlighted. Pure presentation — the child answers via fraction tiles.
 */
export function PieFood({ food, denom, filled }: PieFoodProps) {
  return (
    <div className={styles.wrap}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.pie} role="img" aria-label={`${filled} з ${denom} зафарбовано`}>
        {Array.from({ length: denom }, (_, i) => (
          <motion.path
            key={i}
            d={wedge(i, denom)}
            className={i < filled ? styles.filled : styles.empty}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
            style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
          />
        ))}
      </svg>
      <span className={`${styles.food} emoji`} aria-hidden>
        {food}
      </span>
    </div>
  );
}
