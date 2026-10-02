import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import type { Theme } from '@/core/theme/theme.types';
import { useSound } from '@/core/audio/useSound';
import { useSpeech } from '@/core/audio/useSpeech';
import { Button } from '@/components/ui/Button';
import styles from './Cutscene.module.css';

/** How long the themed micro-animation plays before the rest screen (AC-2: 4–6s). */
const SCENE_MS = 5200;

interface SceneCopy {
  icon: string;
  zzz: string;
  title: string;
  /** On-screen friendly explanation (Tech Spec §7.2). */
  message: string;
  /** Spoken announcement (Tech Spec AC-2). */
  tts: string;
}

/** Per-theme bedtime cutscene content — a calm, story-shaped goodbye. */
function bedtimeScene(theme: Theme, cooldownMin: number): SceneCopy {
  const cd = Math.max(1, Math.round(cooldownMin));
  switch (theme.id) {
    case 'cars':
      return {
        icon: '🏎️',
        zzz: '💤',
        title: 'Мультфільм: Піт-стоп!',
        message: `Наш спорткар проїхав чудову дистанцію і йому час відпочити! Час побігати в кімнаті або випити смачного соку. Бак знову буде повний через ${cd} хв!`,
        tts: 'Наш двигун втомився і пішов відпочивати! Час побігати в кімнаті або випити водички. Зустрінемось на треку пізніше!',
      };
    case 'space':
      return {
        icon: '🚀',
        zzz: '🌙',
        title: 'Мультфільм: Посадка на станцію!',
        message: `Ракета м'яко пристикувалася до станції й увімкнула нічник. Відпочинь трохи — політ продовжимо за ${cd} хв!`,
        tts: 'Наша ракета втомилася і пристикувалася до станції відпочити! Час побігати в кімнаті або випити водички. Зустрінемось у космосі пізніше!',
      };
    case 'unicorns':
      return {
        icon: '🦄',
        zzz: '☁️',
        title: 'Мультфільм: Сон кристала!',
        message: `Кристал м'яко огорнувся хмаринкою і заснув, щоб відновити веселку. Він знову засяє за ${cd} хв!`,
        tts: 'Наш кристал втомився і пішов відпочивати, щоб відновити веселку! Час побігати в кімнаті або випити водички. Зустрінемось у чарівній країні пізніше!',
      };
    default:
      return {
        icon: theme.mascot.emoji,
        zzz: '💤',
        title: 'Мультфільм: Час відпочинку!',
        message: `${theme.mascot.name} сьогодні чудово попрацював і йде відпочивати. Час побігати в кімнаті або випити водички. Повернемось за ${cd} хв!`,
        tts: `Наш друг ${theme.mascot.name} втомився і пішов відпочивати! Час побігати в кімнаті або випити водички. Зустрінемось пізніше!`,
      };
  }
}

function formatMMSS(totalSec: number): string {
  const s = Math.max(0, totalSec);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

interface CutsceneProps {
  /** Play the ~5s scene first; when false, open straight on the rest screen. */
  playScene: boolean;
  /** Parent-set cooldown length (minutes) — shown in the copy. */
  cooldownMinutes: number;
  /** Live seconds remaining in the cooldown. */
  cooldownRemainingSec: number;
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
  cooldownMinutes,
  cooldownRemainingSec,
  ready,
  onResume,
  onExit,
}: CutsceneProps) {
  const theme = useActiveTheme();
  const { play } = useSound();
  const { speak } = useSpeech();
  const copy = useMemo(() => bedtimeScene(theme, cooldownMinutes), [theme, cooldownMinutes]);

  const [phase, setPhase] = useState<Phase>(playScene ? 'scene' : 'cooldown');

  // Kick off the jingle + spoken goodbye, then slide to the rest screen.
  useEffect(() => {
    if (phase !== 'scene') return;
    play('bedtime');
    speak(copy.tts);
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

          <Button size="lg" block icon={ready ? '⛽' : '🔒'} disabled={!ready} onClick={onResume}>
            {ready ? 'Грати далі!' : `Заправка через ${formatMMSS(cooldownRemainingSec)}`}
          </Button>
          <Button size="lg" variant="ghost" block icon="🏃" onClick={onExit}>
            Піти відпочивати
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
