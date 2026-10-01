import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProfileBar } from '@/components/hub/ProfileBar';
import { FilterBar } from '@/components/hub/FilterBar';
import { TaskGrid } from '@/components/hub/TaskGrid';
import { PathModal } from '@/components/hub/PathModal';
import {
  buildCatalog,
  filterCatalog,
  DEFAULT_FILTERS,
  type CatalogEntry,
  type CatalogFilters,
} from '@/components/hub/catalog';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useGameStore } from '@/core/store/useGameStore';
import { useShowText } from '@/core/ui/useUiPrefs';
import styles from './HubPage.module.css';

/** The adventure "shop window" — profile, subject picker, catalog and path. */
export function HubPage() {
  const navigate = useNavigate();
  const theme = useActiveTheme();
  const profile = useGameStore((s) => s.profile);
  const showText = useShowText();

  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const [pathEntry, setPathEntry] = useState<CatalogEntry | null>(null);

  const catalog = useMemo(() => buildCatalog(), []);
  const visible = useMemo(() => filterCatalog(catalog, filters), [catalog, filters]);

  return (
    <div className="page stack">
      <ProfileBar onOpenVault={() => navigate('/vault')} />

      <motion.header
        className={styles.hero}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.span
          className={`${styles.heroMascot} emoji`}
          aria-hidden
          animate={{ y: [0, -6, 0], rotate: [0, -4, 4, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          {theme.mascot.emoji}
        </motion.span>
        <p className={styles.heroSub}>
          {showText ? `Привіт, ${profile.name}! Обери пригоду` : 'Обери пригоду'}
        </p>
      </motion.header>

      <FilterBar filters={filters} onChange={setFilters} />

      <TaskGrid entries={visible} onStart={setPathEntry} />

      <footer className={styles.parentFooter}>
        <button
          type="button"
          className={styles.parentBtn}
          onClick={() => navigate('/parent')}
          aria-label="Кабінет батьків і налаштування"
        >
          <span className="emoji" aria-hidden>
            ⚙️
          </span>{' '}
          Батькам
        </button>
      </footer>

      <PathModal
        entry={pathEntry}
        onClose={() => setPathEntry(null)}
        onPlay={(entry, step) => {
          setPathEntry(null);
          navigate(`/play/${entry.module.id}/${entry.sub.id}?step=${step}`);
        }}
      />
    </div>
  );
}
