import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { TaskCallbacks } from '@/core/kernel/types';
import { useSound } from '@/core/audio/useSound';
import { useVoiceSpeak } from '@/core/audio/useSpeech';
import { speechEngine } from '@/core/audio/SpeechEngine';
import { useShowText } from '@/core/ui/useUiPrefs';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { VoiceToggle } from '@/components/ui/VoiceToggle';
import { Companion } from './Companion';
import { Celebration } from './Celebration';
import { useGameSession, type GameSessionConfig } from './useGameSession';
import { useIdleRollback } from './useIdleRollback';
import { subSteps } from '@/core/progress/path';
import styles from './GameScreen.module.css';

type GiftTier = 'small' | 'big' | 'biggest' | null;

/** Progression gift earned for completing a 5th / 10th / final step. */
function giftForStep(step: number, total: number): GiftTier {
  if (total > 0 && step === total) return 'biggest';
  if (step % 10 === 0) return 'big';
  if (step % 5 === 0) return 'small';
  return null;
}

const GIFT_META: Record<Exclude<GiftTier, null>, { emoji: string; label: string; size: string }> = {
  small: { emoji: '🎀', label: 'Маленький подарунок!', size: '3.6rem' },
  big: { emoji: '🎁', label: 'Великий подарунок!', size: '4.4rem' },
  biggest: { emoji: '🏆', label: 'Найбільший подарунок!', size: '5.4rem' },
};

interface GameScreenProps {
  config: GameSessionConfig;
  subLabel: string;
  onExit: () => void;
  onPlayAgain: () => void;
  /** Advance to the next step/level in place, without leaving to the hub. */
  onContinue: () => void;
}

type Phase = 'intro' | 'play';

/**
 * The game shell: an animated spoken intro, then it hosts a module's GameView,
 * drives the companion race (with idle roll-back), raises the Zero-Aggression
 * scaffolding helper (auto-scroll + jump-back + spoken how-to), and shows the
 * end-of-session celebration. Each voiced section has an inline mute toggle.
 */
export function GameScreen({ config, subLabel, onExit, onPlayAgain, onContinue }: GameScreenProps) {
  const session = useGameSession(config);
  const theme = useActiveTheme();
  const showText = useShowText();
  const { play } = useSound();
  const speakPrompt = useVoiceSpeak('taskPrompt');
  const speakIntro = useVoiceSpeak('taskIntro');
  const speakHint = useVoiceSpeak('hint');

  const { module, task } = session;
  const sub = module?.subCategories.find((s) => s.id === config.subCategoryId);
  // Prefer the module's themed, child-level intro; fall back to the static one.
  const introText = module?.getIntro?.(config.subCategoryId, theme) ?? sub?.intro;

  // A gift pops at every 5th / 10th / final step of the adventure.
  const maxSteps = sub ? subSteps(sub) : 0;
  const stepGift = giftForStep(config.step, maxSteps);

  const [phase, setPhase] = useState<Phase>(introText ? 'intro' : 'play');
  const { rollback, markActivity } = useIdleRollback(task?.id ?? 'none');

  const boardRef = useRef<HTMLDivElement>(null);
  const helperRef = useRef<HTMLDivElement>(null);

  // Speak the intro once when the intro screen is shown.
  useEffect(() => {
    if (phase === 'intro' && introText) speakIntro(introText);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Read the prompt aloud whenever a new task appears during play (Voice-First).
  useEffect(() => {
    if (phase === 'play' && task) speakPrompt(task.prompt);
  }, [task?.id, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // When the scaffolding helper appears: scroll to it and speak the how-to.
  useEffect(() => {
    if (!session.hintActive || phase !== 'play') return;
    const t = window.setTimeout(() => {
      helperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const how = module?.getHintSpeech?.(task!);
      speakHint(how ? `Ось підказка! ${how}` : 'Ось підказка! Порахуймо разом.');
    }, 120);
    return () => window.clearTimeout(t);
  }, [session.hintActive, task?.id, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Victory sound when the level is completed (the mascot "reaches the apple"),
  // plus an extra sparkle when a progression gift is earned.
  useEffect(() => {
    if (!session.finished) return;
    play('crunch');
    play('win');
    if (stepGift) {
      const t = window.setTimeout(() => play('fanfare'), 650);
      return () => window.clearTimeout(t);
    }
  }, [session.finished]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop any lingering speech when leaving the screen.
  useEffect(() => () => speechEngine.cancel(), []);

  if (!module || !task) {
    return (
      <div className="center" style={{ padding: 40 }}>
        <p>Модуль не знайдено 🙈</p>
      </div>
    );
  }

  const callbacks: TaskCallbacks = {
    onSuccess: () => {
      markActivity();
      play('success');
      play('crunch');
      session.registerSuccess();
    },
    onMistake: () => {
      markActivity();
      play('sad');
      session.registerMistake();
    },
    speakPrompt: () => {
      markActivity();
      speakPrompt(task.prompt);
    },
  };

  const GameView = module.GameView;
  const VisualHelper = module.VisualHelper;
  const IntroView = module.IntroView;
  // When finished, pin the mascot at the goal (no idle roll-back on the
  // celebration screen); otherwise show progress minus any idle roll-back.
  const progress = session.finished
    ? 1
    : Math.max(0, session.solvedCount / session.total - rollback);

  const scrollToAnswers = () => {
    play('tap');
    boardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const header = (
    <div className={styles.header}>
      <button className={styles.back} onClick={onExit} aria-label="Назад до пригод">
        🏠
      </button>
      <div>
        <div className={styles.title}>
          {module.icon} {subLabel}
        </div>
        {phase === 'play' && (
          <div className={styles.dots} aria-label={`Завдання ${session.solvedCount} з ${session.total}`}>
            {Array.from({ length: session.total }, (_, i) => (
              <span key={i} className={`${styles.dot} ${i < session.solvedCount ? styles.dotDone : ''}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ---- Intro screen ----
  if (phase === 'intro') {
    return (
      <div className={styles.screen}>
        {header}
        <motion.div
          className={styles.introCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.introToggle}>
            <VoiceToggle channel="taskIntro" />
          </div>
          {IntroView && <IntroView subCategoryId={config.subCategoryId} />}
          {showText && introText && <p className={styles.introText}>{introText}</p>}
          <Button
            size="lg"
            icon="▶️"
            block
            onClick={() => {
              // Stop the intro voice immediately — no lingering talking in-game.
              speechEngine.cancel();
              play('tap');
              markActivity();
              setPhase('play');
            }}
          >
            Почнемо!
          </Button>
        </motion.div>
      </div>
    );
  }

  // ---- Play screen ----
  return (
    <div className={styles.screen}>
      {header}

      <Companion progress={progress} />

      <div className={styles.board} ref={boardRef}>
        <div className={styles.boardTop}>
          <VoiceToggle channel="taskPrompt" />
        </div>

        <AnimatePresence>
          {session.justSolved && (
            <motion.div
              className={`${styles.floatReward} emoji`}
              initial={{ opacity: 0, y: 10, scale: 0.6 }}
              animate={{ opacity: 1, y: -24, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              +{task.reward} {theme.artifact.emoji}
            </motion.div>
          )}
        </AnimatePresence>

        <GameView task={task} callbacks={callbacks} hintActive={session.hintActive} />

        <AnimatePresence>
          {session.hintActive && VisualHelper && (
            <motion.div
              ref={helperRef}
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
            >
              <div className={styles.hintBar}>
                <span className={styles.hintBarLabel}>🧚 Підказка</span>
                <VoiceToggle channel="hint" />
              </div>
              <VisualHelper task={task} callbacks={callbacks} hintActive />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bouncing jump-back button so a child who scrolled to the helper can
          return to the answer tiles with one tap. */}
      <AnimatePresence>
        {session.hintActive && (
          <motion.button
            className={styles.jumpUp}
            aria-label="Повернутися до відповідей"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ y: { repeat: Infinity, duration: 1 }, default: { duration: 0.2 } }}
            onClick={scrollToAnswers}
          >
            ⬆️
          </motion.button>
        )}
      </AnimatePresence>

      <Celebration active={session.finished} />

      <Modal open={session.finished} dismissible={false} title="Ти неймовірний!" icon="🏆">
        <div className={styles.summary}>
          {stepGift ? (
            <motion.div
              className={styles.giftWrap}
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: [0, -10, 10, -6, 6, 0] }}
              transition={{ type: 'spring', stiffness: 240, damping: 11 }}
            >
              <span className="emoji" style={{ fontSize: GIFT_META[stepGift].size }} aria-hidden>
                {GIFT_META[stepGift].emoji}
              </span>
              <p className={styles.giftLabel}>{GIFT_META[stepGift].label}</p>
            </motion.div>
          ) : (
            <div className={`${styles.summaryArt} emoji`}>{theme.mascot.emoji}</div>
          )}
          <p className={styles.summaryBig}>
            Зібрано +{session.earned} {theme.artifact.emoji}
          </p>
          <p className="muted">Усі {session.total} завдань виконано. Чудова робота!</p>
          <div className={styles.summaryActions}>
            {config.step < maxSteps && (
              <Button size="lg" icon="▶️" block onClick={onContinue}>
                Наступний рівень!
              </Button>
            )}
            <Button
              size="lg"
              variant={config.step < maxSteps ? 'ghost' : 'primary'}
              icon="🔁"
              block
              onClick={onPlayAgain}
            >
              Ще раз!
            </Button>
            <Button size="lg" variant="ghost" icon="🏠" block onClick={onExit}>
              До пригод
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
