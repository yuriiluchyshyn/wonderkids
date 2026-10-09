import { useT, useVoiceLang } from '@/core/translator';
import { useBalance } from '@/core/child/world/useBalance';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useSound } from '@/core/audio/useSound';
import { useSayT } from '@/core/audio/useSpeech';
import { voice } from '@/core/audio/voice';
import { Chip } from '@/components/ui/Chip';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ThemeGrid } from '@/components/settings/ThemeGrid';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import { endDemo, goCreateAccount, useDemo } from '@/core/app/demo';
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
 * world (theme) switcher, and three sound switches (mute everything; mute
 * only the voice, keeping sound effects; hide the tap-to-hear speaker icons). The treasure collection and dream build live as their
 * own badges in the header. No parent link — the parent portal is its own domain.
 */
export function ChildDrawer({ open, onClose }: ChildDrawerProps) {
  const t = useT();
  const navigate = useNavigate();
  const profile = useGameStore((s) => s.profile);
  // What is in the purse now (earned − spent on the planet).
  const artifacts = useBalance();
  const milestones = useGameStore((s) => s.milestones);
  const theme = useActiveTheme();
  const { play } = useSound();
  const say = useSayT('selections');
  // What is said aloud is in the voice's language — the parent may set it apart from the screen's.
  const voiceLang = useVoiceLang();
  const sayT = useT(voiceLang);
  const voiceTheme = useActiveTheme(voiceLang);
  const logout = useAuthStore((s) => s.logout);
  // The guest of the trial game has no account to leave and nobody to switch to.
  const demo = useDemo((s) => s.active);
  const soundOn = useGameStore((s) => s.settings.soundOn);
  const voiceOn = useGameStore((s) => s.settings.voiceOn);
  const ttsButtons = useGameStore((s) => s.settings.ttsButtons);
  const updateSettings = useGameStore((s) => s.updateSettings);

  // "Mute everything" is both master switches at once: effects and the voice.
  const muted = !soundOn && !voiceOn;
  const toggleMute = () => {
    if (!muted) voice.stop();
    updateSettings({ soundOn: muted, voiceOn: muted });
  };

  const switchPlayer = () => {
    play('tap');
    onClose();
    navigate('/who');
  };

  const doLogout = () => {
    play('tap');
    onClose();
    if (demo) endDemo(); // the trial is over → App shows the login
    else logout(); // clears the session → App redirects to /login
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
            aria-label={t('drawer.label')}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.close} onClick={onClose} aria-label={t('common.close')}>
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
                  {artifacts} <span className={styles.artifactUnit}>{t('drawer.inVault')}</span>
                </div>
              </div>
            </div>

            {/* ---- Goals — below ---- */}
            <h3 className={styles.sectionTitle}>{t('drawer.goals')}</h3>
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
                      const goal = m.reward || sayT('drawer.familyGoal');
                      if (reached) say('drawer.goalReached', { goal, amount: voiceTheme.artifact.count(m.amount) });
                      else say('drawer.goalPending', { goal, amount: voiceTheme.artifact.count(remaining) });
                    }}
                  >
                    <span className={`${styles.goalIcon} emoji`} aria-hidden>
                      {reached ? '🎉' : theme.artifact.emoji}
                    </span>
                    <div className={styles.goalBody}>
                      <div className={styles.goalReward}>{m.reward || t('drawer.familyGoalTitle')}</div>
                      <ProgressBar
                        value={artifacts / m.amount}
                        label={
                          reached
                            ? t('goal.reached')
                            : t('drawer.goalLeft', { left: remaining, emoji: theme.artifact.emoji, have: artifacts, need: m.amount })
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <h3 className={styles.sectionTitle}>{t('drawer.theme')}</h3>
            <ThemeGrid />

            <h3 className={styles.sectionTitle}>{t('drawer.sound')}</h3>
            <div className={styles.sound}>
              <Chip
                icon={muted ? '🔇' : '🔊'}
                label={muted ? t('drawer.muted') : t('drawer.mute')}
                active={muted}
                onClick={toggleMute}
              />
              <Chip
                icon={voiceOn ? '🗣️' : '🤐'}
                label={voiceOn ? t('drawer.voiceOff') : t('drawer.voiceIsOff')}
                active={!voiceOn}
                onClick={() => {
                  if (voiceOn) voice.stop();
                  updateSettings({ voiceOn: !voiceOn });
                }}
              />
              <Chip
                icon={ttsButtons ? '🔈' : '📖'}
                label={ttsButtons ? t('drawer.hideTts') : t('drawer.ttsHidden')}
                active={!ttsButtons}
                onClick={() => updateSettings({ ttsButtons: !ttsButtons })}
              />
            </div>

            <div className={styles.actions}>
              {demo ? (
                <Button block icon="👨‍👩‍👧" onClick={goCreateAccount}>
                  {t('demo.create')}
                </Button>
              ) : (
                <Button block icon="🔄" variant="ghost" onClick={switchPlayer}>
                  {t('drawer.switchPlayer')}
                </Button>
              )}
              <Button block icon="🚪" variant="ghost" onClick={doLogout}>
                {demo ? t('demo.leave') : t('common.logout')}
              </Button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
