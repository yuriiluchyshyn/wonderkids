import { motion } from 'framer-motion';
import { useGameStore } from '@/core/store/useGameStore';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useShowText } from '@/core/ui/useUiPrefs';
import { useSound } from '@/core/audio/useSound';
import styles from './ProfileBar.module.css';

interface ProfileBarProps {
  onOpenVault: () => void;
}

const AVATAR: Record<string, string> = { girl: '👧', boy: '👦' };

/**
 * Compact, minimal status row: avatar · name · artifacts. Settings are
 * intentionally not linked here — they live behind their own URL so a child
 * can't wander into them.
 */
export function ProfileBar({ onOpenVault }: ProfileBarProps) {
  const profile = useGameStore((s) => s.profile);
  const artifacts = useGameStore((s) => s.artifacts);
  const theme = useActiveTheme();
  const showText = useShowText();
  const { play } = useSound();

  return (
    <div className={styles.bar}>
      <div className={styles.identity}>
        <span className={`${styles.avatar} emoji`} aria-hidden>
          {AVATAR[profile.gender] ?? AVATAR.girl}
        </span>
        {showText && <span className={styles.name}>{profile.name}</span>}
      </div>

      <div className="spacer" />

      <motion.button
        className={styles.vault}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          play('tap');
          onOpenVault();
        }}
        aria-label={`Скарбничка: ${artifacts}`}
      >
        <span className={`${styles.art} emoji`} aria-hidden>
          {theme.artifact.emoji}
        </span>
        <strong>{artifacts}</strong>
      </motion.button>
    </div>
  );
}
