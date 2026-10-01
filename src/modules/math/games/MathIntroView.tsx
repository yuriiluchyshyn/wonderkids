import { motion } from 'framer-motion';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { PieFood } from '../components/PieFood';
import { FractionGlyph } from '../components/FractionGlyph';
import { MATH_SUB } from '../math.types';
import styles from './Intro.module.css';

/** A dot group used by the multiply/divide demos. */
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

/** A row of themed collectibles with +/-/= signs, animated in. */
function ItemRow({ items }: { items: string[] }) {
  return (
    <div className={styles.demo}>
      {items.map((e, i) => (
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

/**
 * Short, playful animated demo shown before a math game begins — themed to the
 * active skin's collectible so the example matches the child's world.
 */
export function MathIntroView({ subCategoryId }: { subCategoryId: string }) {
  const theme = useActiveTheme();
  const it = theme.artifact.emoji;

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

  if (subCategoryId === MATH_SUB.mul || subCategoryId === MATH_SUB.div) {
    return (
      <div className={styles.demoCol}>
        <div className={styles.groups}>
          <DotGroup count={2} delay={0.1} />
          <DotGroup count={2} delay={0.4} />
        </div>
        <motion.p
          className={styles.caption}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {subCategoryId === MATH_SUB.mul ? '2 рази по 2' : '4 порівну на 2'}
        </motion.p>
      </div>
    );
  }

  if (subCategoryId === MATH_SUB.sub) {
    return <ItemRow items={[it, it, it, '➖', it, '🟰', it, it]} />;
  }

  // Addition & mixed.
  return <ItemRow items={[it, it, '➕', it, '🟰', it, it, it]} />;
}
