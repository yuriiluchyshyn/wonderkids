import type { Fraction } from '../math.types';
import styles from './FractionGlyph.module.css';

/** Vertical fraction (numerator above, bar, denominator below) per PRD §4.1. */
export function FractionGlyph({ value }: { value: Fraction }) {
  return (
    <span className={styles.frac} aria-label={`${value.n} з ${value.d}`}>
      <span className={styles.num}>{value.n}</span>
      <span className={styles.bar} />
      <span className={styles.den}>{value.d}</span>
    </span>
  );
}
