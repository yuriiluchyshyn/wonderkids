import { motion } from 'framer-motion';
import type { IntroDemo as Demo } from '@/core/game/kernel/types';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { Glyphs } from './parts';
import { PieFood } from './PieFood';
import styles from './IntroDemo.module.css';

/**
 * Short, playful animated demo shown before a game begins (`SubCategory.demo`):
 * a row of the active theme's collectibles, equal groups of dots, or a food
 * cut into slices with its fraction.
 */
export function IntroDemo({ demo }: { demo: Demo }) {
  const theme = useActiveTheme();

  if (demo.kind === 'pie') {
    return (
      <div className={styles.demo}>
        <PieFood food={demo.food} denom={demo.denom} filled={demo.filled} />
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className={styles.frac}>
          <Glyphs glyphs={[{ n: demo.filled, d: demo.denom }]} />
        </motion.div>
      </div>
    );
  }

  if (demo.kind === 'groups') {
    return (
      <div className={styles.demoCol}>
        <div className={styles.groups}>
          {demo.groups.map((count, g) => (
            <motion.span
              key={g}
              className={styles.group}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 + g * 0.3, type: 'spring', stiffness: 300, damping: 18 }}
            >
              {Array.from({ length: count }, (_, i) => (
                <span key={i} className={styles.dot} />
              ))}
            </motion.span>
          ))}
        </div>
        <motion.p className={styles.caption} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          {demo.caption}
        </motion.p>
      </div>
    );
  }

  return (
    <div className={styles.demo}>
      {demo.items.map((item, i) => (
        <motion.span key={i} className={`${styles.item} emoji`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }}>
          {/* '*' stands for the thing the child collects in the active theme. */}
          {item === '*' ? theme.artifact.emoji : item}
        </motion.span>
      ))}
    </div>
  );
}
