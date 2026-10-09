import { useT, useVoiceLang } from '@/core/i18n';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { GALAXIES, galaxyKey, getGalaxy } from '@/core/game/galaxies';
import { useSound } from '@/core/audio/useSound';
import { useSayT } from '@/core/audio/useSpeech';
import { Modal } from '@/components/ui/Modal';
import styles from './GalaxyPicker.module.css';

interface GalaxyPickerProps {
  galaxyId: string;
  onChange: (id: string) => void;
}

/**
 * Galaxy (subject) chooser pinned at the top of the hub. The child picks their
 * galaxy — Математика is live, the rest show a "coming soon" tag. Big, icon-led
 * targets so a pre-reader can navigate alone.
 */
export function GalaxyPicker({ galaxyId, onChange }: GalaxyPickerProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const { play } = useSound();
  const say = useSayT('selections');
  const sayT = useT(useVoiceLang());
  const current = getGalaxy(galaxyId);

  const pick = (id: string) => {
    play('tap');
    onChange(id);
    say('hub.galaxy.say', { name: sayT(galaxyKey(id)) });
    setOpen(false);
  };

  return (
    <>
      <motion.button
        className={styles.trigger}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          play('tap');
          setOpen(true);
        }}
        aria-label={t('hub.galaxy.label', { name: t(galaxyKey(current.id)) })}
      >
        <span className={`${styles.triggerIcon} emoji`} aria-hidden>
          {current.icon}
        </span>
        <span className={styles.triggerText}>
          <span className={styles.triggerKicker}>{t('hub.galaxy.kicker')}</span>
          <span className={styles.triggerName}>{t(galaxyKey(current.id))}</span>
        </span>
        <span className={styles.caret} aria-hidden>
          ▾
        </span>
      </motion.button>

      <Modal open={open} onClose={() => setOpen(false)} title={t('hub.galaxy.pick')} icon="🌌">
        <div className={styles.list}>
          {GALAXIES.map((g) => (
            <motion.button
              key={g.id}
              className={`${styles.item} ${g.id === galaxyId ? styles.itemActive : ''} ${
                g.comingSoon ? styles.itemSoon : ''
              }`}
              whileTap={{ scale: 0.96 }}
              onClick={() => pick(g.id)}
            >
              <span className={`${styles.itemIcon} emoji`} aria-hidden>
                {g.icon}
              </span>
              <span className={styles.itemName}>{t(galaxyKey(g.id))}</span>
              {g.comingSoon && <span className={styles.soonTag}>{t('hub.galaxy.soon')}</span>}
              {g.id === galaxyId && !g.comingSoon && (
                <span className={styles.check} aria-hidden>
                  ✓
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </Modal>
    </>
  );
}
