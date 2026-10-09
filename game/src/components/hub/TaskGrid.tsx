import { useT } from '@/core/translator';
import { AnimatePresence, motion } from 'framer-motion';
import { TaskCard } from './TaskCard';
import type { CatalogEntry } from './catalog';
import styles from './TaskGrid.module.css';

interface TaskGridProps {
  entries: CatalogEntry[];
  onStart: (entry: CatalogEntry) => void;
  /** Cards outside the active star filter: shown after the rest, toned down. */
  isDimmed?: (entry: CatalogEntry) => boolean;
}

/** Responsive, animated grid of task cards (mobile-first vertical → multi-col). */
export function TaskGrid({ entries, onStart, isDimmed }: TaskGridProps) {
  const t = useT();
  if (entries.length === 0) {
    return (
      <motion.div
        className={styles.empty}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="emoji" style={{ fontSize: '3rem' }}>
          🔍
        </span>
        <p>{t('hub.empty')}</p>
      </motion.div>
    );
  }

  return (
    <div className={styles.grid} data-tip="cards">
      <AnimatePresence mode="popLayout">
        {entries.map((entry) => (
          <TaskCard
            key={`${entry.module.id}:${entry.sub.id}`}
            entry={entry}
            onStart={onStart}
            dimmed={isDimmed?.(entry) ?? false}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
