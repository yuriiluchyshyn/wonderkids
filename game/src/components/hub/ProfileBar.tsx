import { useT } from '@/core/translator';
import { useBalance } from '@/core/child/world/useBalance';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useShowText } from '@/core/app/ui/useUiPrefs';
import { useSound } from '@/core/audio/useSound';
import { treasureKey } from '@/core/child/progress/treasures';
import { Modal } from '@/components/ui/Modal';
import { TreasureCollection } from '@/components/reward/TreasureCollection';
import { useNavigate } from 'react-router-dom';
import { ChildDrawer } from './ChildDrawer';
import styles from './ProfileBar.module.css';

const AVATAR: Record<string, string> = { girl: '👧', boy: '👦' };

type HeaderModal = 'treasures' | null;

/**
 * Status row: the child's name (tap → profile + goals drawer), the
 * treasure-collection badge (opens its modal) and the artifact purse, which
 * opens «Мій світ», where artifacts are spent on buildings and decorations.
 */
export function ProfileBar() {
  const t = useT();
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

  const openDrawer = () => {
    play('tap');
    setDrawerOpen(true);
  };
  const openWorld = () => {
    play('tap');
    navigate('/world');
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
        aria-label={t('hub.profile.open')}
        data-tip="profile"
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
          aria-label={t('hub.profile.treasures', { found: treasuresFound, total: treasuresTotal })}
          data-tip="treasures"
        >
          <span className={`${styles.badgeIcon} emoji`} aria-hidden>
            {theme.chest.closed}
          </span>
          <span className={styles.badgeCount}>
            {treasuresFound}/{treasuresTotal}
          </span>
        </motion.button>

        {/* The purse — the one way into «Мій світ», where artifacts buy buildings
            and decorations. (A second badge with the dream build used to open
            the same page; one door is enough, and the name gets the room.) */}
        <motion.button
          className={`${styles.badge} ${styles.piggy}`}
          whileTap={{ scale: 0.9 }}
          onClick={openWorld}
          aria-label={t('hub.profile.purse', { name: theme.artifact.name, count: artifacts })}
          data-tip="artifacts"
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
