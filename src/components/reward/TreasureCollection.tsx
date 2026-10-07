import { motion } from 'framer-motion';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useGameStore } from '@/core/child/store/useGameStore';
import { treasureKey } from '@/core/child/progress/treasures';
import styles from './TreasureCollection.module.css';

/**
 * The child's treasure album: every distinct collectible of the active theme.
 * Found treasures show in full colour with their name; still-hidden ones are
 * locked silhouettes (🔒 "?"). Treasures are discovered in path chests
 * (TreasureReveal) — this is where they live afterwards.
 */
export function TreasureCollection() {
  const theme = useActiveTheme();
  const collected = useGameStore((s) => s.treasures);

  const owned = new Set(collected);
  const foundCount = theme.treasures.reduce(
    (n, t) => (owned.has(treasureKey(theme.id, t.id)) ? n + 1 : n),
    0,
  );
  const total = theme.treasures.length;
  const complete = foundCount >= total && total > 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <span className="emoji" aria-hidden style={{ fontSize: '1.8rem' }}>
          {theme.chest.closed}
        </span>
        <h3>Колекція скарбів</h3>
      </div>

      <div className={styles.grid}>
        {theme.treasures.map((t) => {
          const found = owned.has(treasureKey(theme.id, t.id));
          return (
            <motion.div
              key={t.id}
              className={`${styles.slot} ${found ? styles.found : styles.locked}`}
              initial={false}
              animate={found ? { scale: [0.6, 1.15, 1] } : {}}
              title={found ? t.name : 'Ще не знайдено'}
            >
              <span className="emoji" aria-hidden>
                {found ? t.emoji : '❓'}
              </span>
              <span className={styles.label}>{found ? t.name : '???'}</span>
            </motion.div>
          );
        })}
      </div>

      <p className={styles.progress}>
        Скарбів знайдено: <strong>{foundCount}</strong> / {total}
      </p>
      <p className="muted">
        {complete
          ? 'Усю колекцію зібрано! 🎉'
          : `Відкривай ${theme.chest.closed} на шляху, щоб знайти нові скарби!`}
      </p>
    </div>
  );
}
