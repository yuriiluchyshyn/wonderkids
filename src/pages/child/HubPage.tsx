import { usePageMeta } from '@/core/app/seo/usePageMeta';
import { useEffect, useMemo, useState } from 'react';
import { StarFilter } from '@/components/hub/StarFilter';
import { GroupFilter } from '@/components/hub/GroupFilter';
import type { GameGroup } from '@/core/game/kernel/types';
import { useHubState } from '@/core/app/ui/useHubState';
import { difficultyRange } from '@/core/game/kernel/gameConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProfileBar } from '@/components/hub/ProfileBar';
import { GalaxyPicker } from '@/components/hub/GalaxyPicker';
import { GalaxyBackground } from '@/components/hub/GalaxyBackground';
import { TaskGrid } from '@/components/hub/TaskGrid';
import { ThemeBrand, hasOwnScenery } from '@/components/theme/ThemeDecor';
import { PathModal } from '@/components/hub/PathModal';
import { buildCatalog, filterCatalog, type CatalogEntry } from '@/components/hub/catalog';
import { getGalaxy } from '@/core/game/galaxies';
import { isFreePlay } from '@/core/game/kernel/gameConfig';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useShowText } from '@/core/app/ui/useUiPrefs';
import { CoachTips } from '@/components/coach/CoachTips';
import { hubTips } from '@/components/coach/tips';
import styles from './HubPage.module.css';

/** The adventure "shop window": profile, galaxy picker, planets and path. */
export function HubPage() {
  usePageMeta({ title: 'Обери планету' });
  const navigate = useNavigate();
  const theme = useActiveTheme();
  const profile = useGameStore((s) => s.profile);
  const showText = useShowText();

  // Remembered across navigation: returning from a game keeps the section.
  const galaxyId = useHubState((s) => s.galaxyId);
  const setGalaxyId = useHubState((s) => s.setGalaxy);
  const stars = useHubState((s) => s.stars);
  const setStars = useHubState((s) => s.setStars);
  const chosenGroup = useHubState((s) => s.groups[galaxyId] ?? null);
  const setGroup = useHubState((s) => s.setGroup);
  const [pathEntry, setPathEntry] = useState<CatalogEntry | null>(null);

  // Back from a game: bring its card into view (the cards fly in first). The
  // note is used once and wiped from the history entry at once — a reload of
  // the hub must open at the top, not jump to the game played last.
  const location = useLocation();
  const focusGame = (location.state as { focusGame?: string } | null)?.focusGame;
  useEffect(() => {
    if (!focusGame) return;
    navigate(location.pathname, { replace: true, state: null });
    const t = window.setTimeout(() => {
      document.querySelector(`[data-game="${focusGame}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 450);
    // No cleanup: wiping the note re-runs this effect, and the scroll must still happen.
    void t;
  }, [focusGame]); // eslint-disable-line react-hooks/exhaustive-deps

  const tips = useMemo(() => hubTips(), []);
  const catalog = useMemo(() => buildCatalog(), []);
  const galaxy = getGalaxy(galaxyId);
  // "Planets" = the galaxy's adventures (module sub-categories).
  const galaxyPlanets = useMemo(
    () => (galaxy.moduleId ? filterCatalog(catalog, { subjectId: galaxy.moduleId }) : []),
    [catalog, galaxy.moduleId],
  );
  // A galaxy whose games come in sets (languages) can be narrowed to one of
  // them. A remembered set that no longer exists simply shows everything.
  const groups = useMemo(() => {
    const seen = new Map<string, GameGroup>();
    for (const { sub } of galaxyPlanets) if (sub.group && !seen.has(sub.group.id)) seen.set(sub.group.id, sub.group);
    return seen.size >= 2 ? [...seen.values()] : [];
  }, [galaxyPlanets]);
  const groupId = groups.some((g) => g.id === chosenGroup) ? chosenGroup : null;
  const allPlanets = useMemo(
    () => (groupId ? galaxyPlanets.filter((entry) => entry.sub.group?.id === groupId) : galaxyPlanets),
    [galaxyPlanets, groupId],
  );
  // Star filter SORTS, it never hides: games of the chosen level come first,
  // the rest follow dimmed (still playable). A game spanning ★–★★★ matches
  // every level in its range — but one that STARTS at the chosen level goes
  // ahead of one that only grows into it. Where most games span a range
  // (math), picking a level would otherwise change nothing on the screen.
  const matchesStars = (entry: CatalogEntry) => {
    if (stars === null) return true;
    const [min, max] = difficultyRange(entry.sub);
    return stars >= min && stars <= max;
  };
  const planets = useMemo(() => {
    if (stars === null) return allPlanets;
    const below = (entry: CatalogEntry) => stars - difficultyRange(entry.sub)[0];
    return [
      ...allPlanets.filter(matchesStars).sort((a, b) => below(a) - below(b)),
      ...allPlanets.filter((e) => !matchesStars(e)),
    ];
  }, [allPlanets, stars]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {!hasOwnScenery(theme.id) && <GalaxyBackground galaxyId={galaxyId} />}
      <div className="page stack" style={{ position: 'relative', zIndex: 1 }}>
      <ProfileBar />

      <ThemeBrand />

      <div data-tip="galaxy">
        <GalaxyPicker galaxyId={galaxyId} onChange={setGalaxyId} />
      </div>

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
        <>
        {/* Small and to the right: the first game should start mid-screen, not below a wall of filters. */}
        <div className={styles.filters}>
          {groups.length > 0 && <GroupFilter groups={groups} value={groupId} onChange={(id) => setGroup(galaxyId, id)} />}
          <div data-tip="stars">
            <StarFilter value={stars} onChange={setStars} />
          </div>
        </div>
        <TaskGrid
          entries={planets}
          isDimmed={(entry) => !matchesStars(entry)}
          onStart={(entry) => {
            // Two kinds of games: a path opens its ladder first; free play has
            // no levels, so it starts right away.
            if (isFreePlay(entry.sub)) navigate(`/play/${entry.module.id}/${entry.sub.id}`);
            else setPathEntry(entry);
          }}
        />
        </>
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
      {/* First-run guide to the hub's buttons; held back while the path is open. */}
      <CoachTips tips={tips} enabled={pathEntry === null} />
    </>
  );
}
