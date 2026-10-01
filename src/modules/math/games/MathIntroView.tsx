import { motion } from 'framer-motion';
import { PieFood } from '../components/PieFood';
import { FractionGlyph } from '../components/FractionGlyph';
import { MATH_SUB } from '../math.types';
import styles from './Intro.module.css';

/** A dot group used by the multiplication demo. */
function DotGroup({ count, delay }: { count: number; delay: number }) {
  return (
    <motion.span
      className={styles.group}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 18 }}
    >
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={styles.dot} />
      ))}
    </motion.span>
  );
}

/**
 * Short, playful animated demo shown before a math game begins, matching the
 * sub-category: a splitting pie for fractions, repeated groups for
 * multiplication, and a combining set for mental arithmetic.
 */
export function MathIntroView({ subCategoryId }: { subCategoryId: string }) {
  if (subCategoryId === MATH_SUB.fractions) {
    return (
      <div className={styles.demo}>
        <PieFood food="🍕" denom={4} filled={1} />
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className={styles.frac}
        >
          <FractionGlyph value={{ n: 1, d: 4 }} />
        </motion.div>
      </div>
    );
  }

  if (subCategoryId === MATH_SUB.multiply) {
    return (
      <div className={styles.demoCol}>
        <div className={styles.groups}>
          <DotGroup count={2} delay={0.1} />
          <DotGroup count={2} delay={0.35} />
          <DotGroup count={2} delay={0.6} />
        </div>
        <motion.p
          className={styles.caption}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          3 рази по 2
        </motion.p>
      </div>
    );
  }

  // Mental arithmetic: a small combining set.
  return (
    <div className={styles.demo}>
      {['🍎', '🍎', '➕', '🍎', '🟰', '🍎', '🍎', '🍎'].map((e, i) => (
        <motion.span
          key={i}
          className={`${styles.item} emoji`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.12 }}
        >
          {e}
        </motion.span>
      ))}
    </div>
  );
}
