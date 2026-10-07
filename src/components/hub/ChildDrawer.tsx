import { useBalance } from '@/core/child/world/useBalance';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useSound } from '@/core/audio/useSound';
import { useVoiceSpeak } from '@/core/audio/useSpeech';
import { counted } from '@/core/lang/uk';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ThemeGrid } from '@/components/settings/ThemeGrid';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import styles from './ChildDrawer.module.css';

const AVATAR: Record<string, string> = { girl: '👧', boy: '👦' };

interface ChildDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * The child profile "shutter" + treasure panel (Tech Spec v2.1 US-4). Opens
 * from the child's name (the artifact purse opens «Мій світ», where artifacts
 * are spent). Shows, top to bottom: the themed
 * artifact (name + count), the family goals (how much more to collect), and the
 * world (theme) switcher. The treasure collection and dream build live as their
 * own badges in the header. No parent link — the parent portal is its own domain.
 */
export function ChildDrawer({ open, onClose }: ChildDrawerProps) {
  const navigate = useNavigate();
  const profile = useGameStore((s) => s.profile);
  // What is in the purse now (earned − spent on the planet).
  const artifacts = useBalance();
  const milestones = useGameStore((s) => s.milestones);
  const theme = useActiveTheme();
  const { play } = useSound();
  const announce = useVoiceSpeak('selections');
  const logout = useAuthStore((s) => s.logout);

  const switchPlayer = () => {
    play('tap');
    onClose();
    navigate('/who');
  };

  const doLogout = () => {
    play('tap');
    onClose();
    logout(); // clears the session → App redirects to /login
  };

  // Portalled to <body>: the hub page is its own stacking context, so an
  // in-place drawer would slide UNDER the sticky play-time header.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.aside
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-label="Профіль і скарбничка"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.close} onClick={onClose} aria-label="Закрити">
              ✕
            </button>

            <div className={styles.head}>
              <span className={`${styles.avatar} emoji`} aria-hidden>
                {AVATAR[profile.gender] ?? AVATAR.girl}
              </span>
              <div className={styles.identity}>
                <div className={styles.name}>{profile.name}</div>
                {profile.nickname && <div className={styles.nick}>@{profile.nickname}</div>}
              </div>
            </div>

            {/* ---- Artifact (скарбничка) — top ---- */}
            <div className={styles.artifact}>
              <motion.span
                className={`${styles.artifactIcon} emoji`}
                aria-hidden
                animate={{ rotate: [0, -8, 8, 0], y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                {theme.artifact.emoji}
              </motion.span>
              <div className={styles.artifactInfo}>
                <div className={styles.artifactName}>{theme.artifact.name}</div>
                <div className={styles.artifactCount}>
                  {artifacts} <span className={styles.artifactUnit}>у скарбничці</span>
                </div>
              </div>
            </div>

            {/* ---- Goals — below ---- */}
            <h3 className={styles.sectionTitle}>🎯 Цілі</h3>
            <div className={styles.goals}>
              {milestones.map((m) => {
                const reached = artifacts >= m.amount;
                const remaining = Math.max(0, m.amount - artifacts);
                return (
                  <div
                    key={m.id}
                    className={styles.goal}
                    role="button"
                    tabIndex={0}
                    // Tap a goal to hear what it is and how far away it is.
                    onClick={() => {
                      play('tap');
                      announce(
                        reached
                          ? `Ціль: ${m.reward || 'сімейна ціль'}. Досягнуто! Ти зібрав ${counted(m.amount, theme.artifact.counted)}.`
                          : `Ціль: ${m.reward || 'сімейна ціль'}. Ще не досягнуто. Треба зібрати ще ${counted(remaining, theme.artifact.counted)}.`,
                      );
                    }}
                  >
                    <span className={`${styles.goalIcon} emoji`} aria-hidden>
                      {reached ? '🎉' : theme.artifact.emoji}
                    </span>
                    <div className={styles.goalBody}>
                      <div className={styles.goalReward}>{m.reward || 'Сімейна ціль'}</div>
                      <ProgressBar
                        value={artifacts / m.amount}
                        label={
                          reached
                            ? 'Досягнуто! 🎁'
                            : `ще ${remaining} ${theme.artifact.emoji} (${artifacts} / ${m.amount})`
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <h3 className={styles.sectionTitle}>🎨 Тема</h3>
            <ThemeGrid />

            <div className={styles.actions}>
              <Button block icon="🔄" variant="ghost" onClick={switchPlayer}>
                Змінити гравця
              </Button>
              <Button block icon="🚪" variant="ghost" onClick={doLogout}>
                Вийти
              </Button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
