import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TaskCallbacks } from '@/core/kernel/types';
import { useSound } from '@/core/audio/useSound';
import { useVoiceSpeak } from '@/core/audio/useSpeech';
import { speechEngine } from '@/core/audio/SpeechEngine';
import { useShowText } from '@/core/ui/useUiPrefs';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useGameStore } from '@/core/store/useGameStore';
import type { Treasure } from '@/core/theme/theme.types';
import { hasChest, pickChestTreasure, treasureKey } from '@/core/progress/treasures';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { VoiceToggle } from '@/components/ui/VoiceToggle';
import { Companion } from './Companion';
import { Celebration } from './Celebration';
import { TreasureReveal } from './TreasureReveal';
import { FuelGauge } from './FuelGauge';
import { Cutscene } from './Cutscene';
import { useGameSession, type GameSessionConfig } from './useGameSession';
import { useIdleRollback } from './useIdleRollback';
import { useScreenTime } from './useScreenTime';
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
  // Some steps hide a themed treasure chest the child opens on completion.
  const stepHasChest = hasChest(config.step, maxSteps);
  const collectTreasure = useGameStore((s) => s.collectTreasure);

  const [phase, setPhase] = useState<Phase>(introText ? 'intro' : 'play');
  // The treasure revealed by this step's chest (null until the session ends on
  // a chest step). `revealDone` gates the celebration + summary until the
  // chest-opening animation has played out.
  const [reveal, setReveal] = useState<{ treasure: Treasure; isNew: boolean } | null>(null);
  const [revealDone, setRevealDone] = useState(false);
  const { rollback, markActivity } = useIdleRollback(task?.id ?? 'none', session.registerRollback);

  // ---- Screen-time / fuel engine (Tech Spec FR-TIME) ----
  const artifacts = useGameStore((s) => s.artifacts);
  const timeControl = useGameStore((s) => s.settings.timeControl);
  const enterCooldown = useGameStore((s) => s.enterCooldown);
  const startPlaySession = useGameStore((s) => s.startPlaySession);
  const screen = useScreenTime(phase === 'play');
  // `armed` = fuel ran dry (wait for a safe moment); `open` = cutscene showing.
  const [bedtimeArmed, setBedtimeArmed] = useState(false);
  const [bedtimeOpen, setBedtimeOpen] = useState(false);

  const openBedtime = useCallback(() => {
    setBedtimeOpen(true);
    enterCooldown();
    speechEngine.cancel();
  }, [enterCooldown]);

  const resumePlay = useCallback(() => {
    setBedtimeArmed(false);
    setBedtimeOpen(false);
    startPlaySession();
    onPlayAgain();
  }, [startPlaySession, onPlayAgain]);

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

  // On a chest step, pick a treasure to reveal and add it to the collection.
  // The TreasureReveal overlay plays first; the celebration + summary wait for
  // it to finish (revealDone). On non-chest steps the summary shows at once.
  useEffect(() => {
    if (!session.finished) {
      setReveal(null);
      setRevealDone(false);
      return;
    }
    if (!stepHasChest) {
      setRevealDone(true);
      return;
    }
    const picked = pickChestTreasure(theme, useGameStore.getState().treasures);
    if (!picked) {
      setRevealDone(true);
      return;
    }
    setReveal(picked);
    setRevealDone(false);
    if (picked.isNew) collectTreasure(treasureKey(theme.id, picked.treasure.id));
  }, [session.finished]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop any lingering speech when leaving the screen.
  useEffect(() => () => speechEngine.cancel(), []);

  // Arm the bedtime cutscene the moment the tank runs dry during play.
  useEffect(() => {
    if (phase === 'play' && screen.depleted && !bedtimeArmed) {
      setBedtimeArmed(true);
    }
  }, [screen.depleted, phase, bedtimeArmed]);

  // Open it at a safe moment: right after the current answer is counted, or a
  // short grace if the child is idle — the current example is never cut off
  // mid-solve (Tech Spec AC-2).
  useEffect(() => {
    if (!bedtimeArmed || bedtimeOpen) return;
    const t = window.setTimeout(openBedtime, session.justSolved ? 250 : 4000);
    return () => window.clearTimeout(t);
  }, [bedtimeArmed, bedtimeOpen, session.justSolved, openBedtime]);

  if (!module || !task) {
    return (
      <div className="center" style={{ padding: 40 }}>
        <p>Модуль не знайдено 🙈</p>
      </div>
    );
  }

  // The fuel-depleted cutscene + cooldown lock. Shown when the tank just ran
  // dry (bedtimeOpen) or the child arrived while a cooldown is still active.
  const showBedtime = bedtimeOpen || screen.inCooldown;
  const bedtimeOverlay = showBedtime ? (
    <Cutscene
      playScene={bedtimeOpen}
      cooldownMinutes={timeControl.cooldownMinutes}
      cooldownRemainingSec={screen.cooldownRemainingSec}
      ready={screen.ready}
      onResume={resumePlay}
      onExit={onExit}
    />
  ) : null;

  const callbacks: TaskCallbacks = {
    onSuccess: () => {
      markActivity();
      play('success');
      play('pop');
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
          <div className={styles.progressWrap}>
            <div
              className={styles.progressLabel}
              aria-label={`Завдання ${Math.min(session.solvedCount + 1, session.total)} з ${session.total}`}
            >
              🎯 Завдання {Math.min(session.solvedCount + 1, session.total)} з {session.total}
              {session.extraTasks > 0 && (
                <span className={styles.progressExtra}>
                  {' '}
                  (базових {session.baseTotal} + {session.extraTasks})
                </span>
              )}
            </div>
            {session.total <= 12 && (
              <div className={styles.dots} aria-hidden>
                {Array.from({ length: session.total }, (_, i) => (
                  <span key={i} className={`${styles.dot} ${i < session.solvedCount ? styles.dotDone : ''}`} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {phase === 'play' && (
        <div className={styles.hud}>
          <FuelGauge pct={screen.fuelPct} />
          <div className={styles.hudArtifacts}>
            <span className="emoji" aria-hidden>
              {theme.artifact.emoji}
            </span>{' '}
            {artifacts}
          </div>
        </div>
      )}
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
        {bedtimeOverlay}
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

      <TreasureReveal
        active={reveal !== null && !revealDone}
        treasure={reveal?.treasure ?? null}
        isNew={reveal?.isNew ?? false}
        onDone={() => setRevealDone(true)}
      />

      <Celebration active={session.finished && revealDone} />

      <Modal
        open={session.finished && revealDone}
        dismissible={false}
        title="Ти неймовірний!"
        icon="🏆"
      >
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
          {reveal && (
            <p className={styles.treasureLine}>
              {reveal.isNew ? 'Новий скарб у колекції: ' : 'Скарб: '}
              <span className="emoji" aria-hidden>
                {reveal.treasure.emoji}
              </span>{' '}
              {reveal.treasure.name}
            </p>
          )}
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

      {bedtimeOverlay}
    </div>
  );
}
