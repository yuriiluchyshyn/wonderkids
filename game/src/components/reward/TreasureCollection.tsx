import { useT } from '@/core/translator';
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
  const t = useT();
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
        <h3>{t('treasures.title')}</h3>
      </div>

      <div className={styles.grid}>
        {theme.treasures.map((treasure) => {
          const found = owned.has(treasureKey(theme.id, treasure.id));
          return (
            <motion.div
              key={treasure.id}
              className={`${styles.slot} ${found ? styles.found : styles.locked}`}
              initial={false}
              animate={found ? { scale: [0.6, 1.15, 1] } : {}}
              title={found ? treasure.name : t('treasures.notFound')}
            >
              <span className="emoji" aria-hidden>
                {found ? treasure.emoji : '❓'}
              </span>
              <span className={styles.label}>{found ? treasure.name : '???'}</span>
            </motion.div>
          );
        })}
      </div>

      <p className={styles.progress}>
        {t('treasures.found')} <strong>{foundCount}</strong> / {total}
      </p>
      <p className="muted">
        {complete
          ? t('treasures.all')
          : t('treasures.hint', { chests: theme.chest.closed })}
      </p>
    </div>
  );
}
