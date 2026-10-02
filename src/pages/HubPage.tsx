import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProfileBar } from '@/components/hub/ProfileBar';
import { GalaxyPicker } from '@/components/hub/GalaxyPicker';
import { GalaxyBackground } from '@/components/hub/GalaxyBackground';
import { TaskGrid } from '@/components/hub/TaskGrid';
import { PathModal } from '@/components/hub/PathModal';
import { buildCatalog, filterCatalog, type CatalogEntry } from '@/components/hub/catalog';
import { DEFAULT_GALAXY_ID, getGalaxy } from '@/core/galaxies';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useGameStore } from '@/core/store/useGameStore';
import { useShowText } from '@/core/ui/useUiPrefs';
import styles from './HubPage.module.css';

/** The adventure "shop window": profile, galaxy picker, planets and path. */
export function HubPage() {
  const navigate = useNavigate();
  const theme = useActiveTheme();
  const profile = useGameStore((s) => s.profile);
  const showText = useShowText();

  const [galaxyId, setGalaxyId] = useState(DEFAULT_GALAXY_ID);
  const [pathEntry, setPathEntry] = useState<CatalogEntry | null>(null);

  const catalog = useMemo(() => buildCatalog(), []);
  const galaxy = getGalaxy(galaxyId);
  // "Planets" = the galaxy's adventures (module sub-categories).
  const planets = useMemo(
    () => (galaxy.moduleId ? filterCatalog(catalog, { subjectId: galaxy.moduleId }) : []),
    [catalog, galaxy.moduleId],
  );

  return (
    <>
      <GalaxyBackground galaxyId={galaxyId} />
      <div className="page stack" style={{ position: 'relative', zIndex: 1 }}>
      <ProfileBar />

      <GalaxyPicker galaxyId={galaxyId} onChange={setGalaxyId} />

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
          {showText ? `Привіт, ${profile.name}! Обери планету` : 'Обери планету'}
        </p>
      </motion.header>

      {galaxy.comingSoon ? (
        <motion.div
          className={styles.comingSoon}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.span
            className={`${styles.comingSoonIcon} emoji`}
            aria-hidden
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.4 }}
          >
            {galaxy.icon}
          </motion.span>
          <h2 className={styles.comingSoonTitle}>Галактика «{galaxy.name}»</h2>
          <p className={styles.comingSoonText}>Незабаром тут з'являться планети! 🚀</p>
        </motion.div>
      ) : (
        <TaskGrid entries={planets} onStart={setPathEntry} />
      )}

      <PathModal
        entry={pathEntry}
        onClose={() => setPathEntry(null)}
        onPlay={(entry, step) => {
          setPathEntry(null);
          navigate(`/play/${entry.module.id}/${entry.sub.id}?step=${step}`);
        }}
      />
      </div>
    </>
  );
}
