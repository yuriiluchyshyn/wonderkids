import { useBalance } from '@/core/world/useBalance';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/core/store/useGameStore';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useShowText } from '@/core/ui/useUiPrefs';
import { useSound } from '@/core/audio/useSound';
import { treasureKey } from '@/core/progress/treasures';
import { Modal } from '@/components/ui/Modal';
import { TreasureCollection } from '@/components/reward/TreasureCollection';
import { useNavigate } from 'react-router-dom';
import { useWorld } from '@/core/world/useWorld';
import { ChildDrawer } from './ChildDrawer';
import styles from './ProfileBar.module.css';

const AVATAR: Record<string, string> = { girl: '👧', boy: '👦' };

type HeaderModal = 'treasures' | null;

/**
 * Status row: the child's name (tap → profile + crystal/goals drawer), the
 * treasure-collection badge (opens its modal), the world badge (opens «Мій світ»), and a
 * single artifact piggy in the top-right corner (also opens the drawer).
 */
export function ProfileBar() {
  const profile = useGameStore((s) => s.profile);
  // What is in the purse now (earned − spent on the planet).
  const artifacts = useBalance();
  const collected = useGameStore((s) => s.treasures);
  const theme = useActiveTheme();
  const showText = useShowText();
  const { play } = useSound();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modal, setModal] = useState<HeaderModal>(null);

  const owned = new Set(collected);
  const treasuresFound = theme.treasures.reduce(
    (n, t) => (owned.has(treasureKey(theme.id, t.id)) ? n + 1 : n),
    0,
  );
  const treasuresTotal = theme.treasures.length;
  const navigate = useNavigate();
  const { def: world, buildingsOwned, buildingsTotal } = useWorld();

  const openDrawer = () => {
    play('tap');
    setDrawerOpen(true);
  };
  const openModal = (m: Exclude<HeaderModal, null>) => {
    play('tap');
    setModal(m);
  };

  return (
    <div className={styles.bar}>
      <motion.button
        className={styles.identity}
        whileTap={{ scale: 0.96 }}
        onClick={openDrawer}
        aria-label="Відкрити профіль і скарбничку"
      >
        <span className={`${styles.avatar} emoji`} aria-hidden>
          {AVATAR[profile.gender] ?? AVATAR.girl}
        </span>
        {showText && <span className={styles.name}>{profile.name}</span>}
        <span className={styles.caret} aria-hidden>
          ▾
        </span>
      </motion.button>

      <div className="spacer" />

      <div className={styles.badges}>
        {/* Treasure collection */}
        <motion.button
          className={styles.badge}
          whileTap={{ scale: 0.9 }}
          onClick={() => openModal('treasures')}
          aria-label={`Колекція скарбів: ${treasuresFound} з ${treasuresTotal}`}
        >
          <span className={`${styles.badgeIcon} emoji`} aria-hidden>
            {theme.chest.closed}
          </span>
          <span className={styles.badgeCount}>
            {treasuresFound}/{treasuresTotal}
          </span>
        </motion.button>

        {/* The world the child is building — opens «Мій світ». */}
        <motion.button
          className={styles.badge}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            play('tap');
            navigate('/world');
          }}
          aria-label={`${world.name}: збудовано ${buildingsOwned} з ${buildingsTotal}`}
        >
          <span className={`${styles.badgeIcon} emoji`} aria-hidden>
            {theme.dreamBuild.emoji}
          </span>
          <span className={styles.badgeCount}>
            {buildingsOwned}/{buildingsTotal}
          </span>
        </motion.button>

        {/* Artifact piggy — opens the profile + crystal/goals drawer. */}
        <motion.button
          className={`${styles.badge} ${styles.piggy}`}
          whileTap={{ scale: 0.9 }}
          onClick={openDrawer}
          aria-label={`Скарбничка: ${artifacts} ${theme.artifact.name}`}
        >
          <span className={`${styles.badgeIcon} emoji`} aria-hidden>
            {theme.artifact.emoji}
          </span>
          <strong className={styles.badgeCount}>{artifacts}</strong>
        </motion.button>
      </div>

      <Modal open={modal === 'treasures'} onClose={() => setModal(null)}>
        <TreasureCollection />
      </Modal>

      <ChildDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
