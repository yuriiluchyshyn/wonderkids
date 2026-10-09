import { useT, useVoiceLang, type T } from '@/core/translator';
import { useVoiceStopsOnLeave } from '@/core/audio/voice';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import type { Theme } from '@/core/theme/theme.types';
import { useSound } from '@/core/audio/useSound';
import { voice } from '@/core/audio/voice';
import { useGameStore } from '@/core/child/store/useGameStore';
import { Button } from '@/components/ui/Button';
import styles from './Cutscene.module.css';

/** How long the themed micro-animation plays before the rest screen (AC-2: 4–6s). */
const SCENE_MS = 9000;

interface SceneCopy {
  icon: string;
  zzz: string;
  title: string;
  /**
   * The friendly explanation (Tech Spec §7.2) — shown AND read out. It never
   * says how long the rest is: a number to wait for only winds a child up.
   */
  message: string;
}

/** Per-theme bedtime cutscene content — a calm, story-shaped goodbye. */
function bedtimeScene(theme: Theme, t: T): SceneCopy {
  switch (theme.id) {
    case 'cars':
      return {
        icon: '🏎️',
        zzz: '💤',
        title: t('rest.cars.title'),
        message: t('rest.cars.message'),
      };
    case 'space':
      return {
        icon: '🚀',
        zzz: '🌙',
        title: t('rest.space.title'),
        message: t('rest.space.message'),
      };
    case 'unicorns':
      return {
        icon: '🦄',
        zzz: '☁️',
        title: t('rest.unicorns.title'),
        message: t('rest.unicorns.message'),
      };
    default:
      return {
        icon: theme.mascot.emoji,
        zzz: '💤',
        title: t('rest.default.title'),
        message: t('rest.default.message', { mascot: theme.mascot.name }),
      };
  }
}

interface CutsceneProps {
  /** Play the ~5s scene first; when false, open straight on the rest screen. */
  playScene: boolean;
  /** True once the cooldown has elapsed and play may resume. */
  ready: boolean;
  /** Child chose to play on (only possible once `ready`). */
  onResume: () => void;
  /** Child chose to go and rest (leaves the game). */
  onExit: () => void;
}

type Phase = 'scene' | 'cooldown';

/**
 * Fuel-depleted cutscene + friendly cooldown lock (Tech Spec US-2 / §7.2).
 * Replaces any blocking "time's up" banner with a warm themed micro-animation,
 * a jingle, a spoken goodbye, then a gentle rest screen whose "play on" button
 * stays locked until the transport is refuelled.
 */
export function Cutscene({
  playScene,
  ready,
  onResume,
  onExit,
}: CutsceneProps) {
  useVoiceStopsOnLeave();
  const theme = useActiveTheme();
  const { play } = useSound();
  const t = useT();
  const voiceLang = useVoiceLang();
  const voiceT = useT(voiceLang);
  const voiceTheme = useActiveTheme(voiceLang);
  const copy = useMemo(() => bedtimeScene(theme, t), [theme, t]);
  // What is read out is in the voice's language, whatever the screen shows.
  const voiceOn = useGameStore((s) => s.settings.voiceOn);
  const speak = () => {
    if (voiceOn) voice.speak(bedtimeScene(voiceTheme, voiceT).message, undefined, voiceLang);
  };

  const [phase, setPhase] = useState<Phase>(playScene ? 'scene' : 'cooldown');

  // The message is read out once, however the screen was reached — after the
  // scene started or straight on the rest screen. A beat later than the
  // screen itself: the game underneath silences all speech as it is covered.
  useEffect(() => {
    const t = window.setTimeout(speak, 600);
    return () => window.clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Kick off the jingle, then slide to the rest screen.
  useEffect(() => {
    if (phase !== 'scene') return;
    play('bedtime');
    const t = window.setTimeout(() => setPhase('cooldown'), SCENE_MS);
    return () => window.clearTimeout(t);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
    >
      {phase === 'scene' ? (
        <motion.div
          className={styles.scene}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className={styles.sceneTitle}>🎬 {copy.title}</div>
          <div className={styles.stage}>
            <motion.span
              className={`${styles.hero} emoji`}
              aria-hidden
              initial={{ x: '-120%' }}
              animate={{ x: ['-120%', '0%', '0%'] }}
              transition={{ duration: 2.2, times: [0, 0.55, 1], ease: 'easeOut' }}
            >
              {copy.icon}
            </motion.span>
            <motion.span
              className={`${styles.zzz} emoji`}
              aria-hidden
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 1], y: [-4, -18, -30] }}
              transition={{ delay: 2.2, duration: 2.4, repeat: Infinity }}
            >
              {copy.zzz}
            </motion.span>
          </div>
          <p className={styles.sceneMsg}>{copy.message}</p>
        </motion.div>
      ) : (
        <motion.div
          className={styles.rest}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <span className={`${styles.restHero} emoji`} aria-hidden>
            {copy.icon}
            {copy.zzz}
          </span>
          <p className={styles.restMsg}>{copy.message}</p>

          {/* No locked button and no clock while resting: there is nothing to wait at. */}
          {ready && (
            <Button size="lg" block icon="⛽" onClick={onResume}>
              {t('rest.playOn')}
            </Button>
          )}
          <Button size="lg" variant={ready ? 'ghost' : 'primary'} block icon="🏃" onClick={onExit}>
            {t('rest.goRest')}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
