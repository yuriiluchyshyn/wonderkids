import { useBalance } from '@/core/world/useBalance';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TaskCallbacks } from '@/core/kernel/types';
import { useSound } from '@/core/audio/useSound';
import { useVoiceSpeak } from '@/core/audio/useSpeech';
import { speechEngine } from '@/core/audio/SpeechEngine';
import { useShowText } from '@/core/ui/useUiPrefs';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useGameStore } from '@/core/store/useGameStore';
import type { Treasure } from '@/core/theme/theme.types';
import { hasChest, pickChestTreasure, treasureKey } from '@/core/progress/treasures';
import { cn } from '@/core/utils/cn';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { VoiceToggle } from '@/components/ui/VoiceToggle';
import { Companion } from './Companion';
import { Celebration } from './Celebration';
import { TreasureReveal } from './TreasureReveal';
import { Cutscene } from './Cutscene';
import { CoachTips } from '@/components/coach/CoachTips';
import { gameTips } from '@/components/coach/tips';
import { pickOutro } from '@/core/content/outro';
import type { TemplatePayload } from '@/core/templates/types';
import { useGameSession, type GameSessionConfig } from './useGameSession';
import { useIdleRollback } from './useIdleRollback';
import { useScreenTime } from './useScreenTime';
import { subSteps } from '@/core/progress/path';
import { isFreePlay } from '@/core/kernel/gameConfig';
import { useWorld } from '@/core/world/useWorld';
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
  const { play, playCode } = useSound();
  const speakPrompt = useVoiceSpeak('taskPrompt');
  const speakIntro = useVoiceSpeak('taskIntro');
  const speakHint = useVoiceSpeak('hint');

  const { module, task } = session;
  const sub = module?.subCategories.find((s) => s.id === config.subCategoryId);
  // Prefer the module's themed, child-level intro; fall back to the static one.
  const introText = module?.getIntro?.(config.subCategoryId, theme, config.step) ?? sub?.intro;

  // A gift pops at every 5th / 10th / final step of the adventure.
  const maxSteps = sub ? subSteps(sub) : 0;
  // Free-play games have no ladder: no step gifts, chests or "next level".
  const free = sub ? isFreePlay(sub) : false;
  const stepGift = free ? null : giftForStep(config.step, maxSteps);
  // Some steps hide a themed treasure chest the child opens on completion.
  const stepHasChest = !free && hasChest(config.step, maxSteps);
  const collectTreasure = useGameStore((s) => s.collectTreasure);
  const { newestResident } = useWorld();

  const [phase, setPhase] = useState<Phase>(introText ? 'intro' : 'play');
  // The treasure revealed by this step's chest (null until the session ends on
  // a chest step). `revealDone` gates the celebration + summary until the
  // chest-opening animation has played out.
  const [reveal, setReveal] = useState<{ treasure: Treasure; isNew: boolean } | null>(null);
  const [revealDone, setRevealDone] = useState(false);
  // An onboarding tip is on screen (the child is reading, not idling).
  const [coaching, setCoaching] = useState(false);
  // The fact told after this task: the next one from its pool, so a replay of
  // the same task — even its repeat within this level — tells a new story.
  // Picked once per showing; the last one stays up while the level finishes.
  const outroPick = useRef<{ at: number; text?: string }>({ at: -1 });
  if (task && !session.finished && outroPick.current.at !== session.index) {
    outroPick.current = { at: session.index, text: pickOutro(task) };
  }
  const outro = outroPick.current.text;
  // First-run tips: how to answer on this kind of board, then what each
  // control does (text games also get the tap-to-hear one, PRD v4.0 §2.4).
  const template = (task?.payload as Partial<TemplatePayload> | null | undefined)?.template;
  const hasText = Boolean(sub?.hasText);
  const tips = useMemo(() => gameTips({ template, hasText }), [template, hasText]);

  // ---- Screen-time / fuel engine (Tech Spec FR-TIME) ----
  // What is in the purse now (earned − spent on the planet).
  const artifacts = useBalance();
  const timeControl = useGameStore((s) => s.settings.timeControl);
  const startPlaySession = useGameStore((s) => s.startPlaySession);
  const screen = useScreenTime(phase === 'play');
  // `armed` = fuel ran dry (wait for a safe moment); `open` = cutscene showing.
  const [bedtimeArmed, setBedtimeArmed] = useState(false);
  const [bedtimeOpen, setBedtimeOpen] = useState(false);

  const { endSession } = screen;
  const openBedtime = useCallback(() => {
    setBedtimeOpen(true);
    // Ends the session locally and on the server (which starts the cooldown).
    endSession();
    speechEngine.cancel();
  }, [endSession]);

  const resumePlay = useCallback(() => {
    setBedtimeArmed(false);
    setBedtimeOpen(false);
    startPlaySession();
    onPlayAgain();
  }, [startPlaySession, onPlayAgain]);

  const midLevel = phase === 'play' && !session.finished && session.solvedCount + session.index > 0;
  // True while the rest screen covers the game: nothing may speak or run under it.
  const blocked = bedtimeOpen || (screen.inCooldown && !midLevel);
  useEffect(() => {
    if (blocked) speechEngine.cancel();
  }, [blocked]);

  // Idle drift is real: every whole step the companion slides back adds one
  // task to the level, so the next answer moves it one step on from where it
  // stands instead of leaping back to where it was. It never slides past the
  // start, and never while the child is listening, reading or resting.
  //
  // The track is measured in the level's own tasks (`paced`); a task added by
  // idling is not a longer track but one step of it lost: the companion stands
  // at (solved − idle extras) of `paced`, and still arrives exactly at the end.
  const { solvedCount, total, idleExtras, extendForIdle } = session;
  const paced = Math.max(1, total - idleExtras);
  const position = Math.max(0, (solvedCount - idleExtras) / paced);
  const { rollback, markActivity } = useIdleRollback(task?.id ?? 'none', {
    paused:
      phase !== 'play' || blocked || coaching || session.finished || session.justSolved || session.hintActive,
    step: 1 / paced,
    limit: position,
    onRetreat: () => (extendForIdle() ? 1 / paced : null),
  });

  const boardRef = useRef<HTMLDivElement>(null);
  const helperRef = useRef<HTMLDivElement>(null);

  // Speak the intro once when the intro screen is shown.
  useEffect(() => {
    if (phase === 'intro' && introText && !blocked) speakIntro(introText);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Read the prompt aloud whenever a new task appears during play (Voice-First).
  // Keyed by queue position, not task id: the repeat of a missed task is read
  // out again like any other task.
  useEffect(() => {
    if (phase === 'play' && task && !session.finished && !blocked) speakPrompt(task.prompt);
  }, [session.index, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // When the scaffolding helper appears: scroll to it and speak the how-to.
  useEffect(() => {
    if (!session.hintActive || phase !== 'play') return;
    const t = window.setTimeout(() => {
      helperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const how = module?.getHintSpeech?.(task!);
      speakHint(how ? `Ось підказка! ${how}` : 'Ось підказка! Подивімось разом.');
    }, 120);
    return () => window.clearTimeout(t);
  }, [session.hintActive, session.index, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // A correct answer may come with a short fact ("Це прапор Японії!").
  // The level waits for it: the next task starts only when the fact has been
  // read to the end (or, with the voice off, after time to read it).
  const outroVoice = useGameStore((s) => s.settings.voiceOn && s.settings.voice.taskPrompt);
  useEffect(() => {
    if (!session.awaitingOutro) return;
    const { outroDone } = session;
    if (!outro) {
      outroDone();
      return;
    }
    if (outroVoice && speechEngine.supported) {
      // Let the "correct!" sound land first, then speak.
      const start = window.setTimeout(
        () => speechEngine.speak(outro, () => window.setTimeout(outroDone, 350)),
        450,
      );
      return () => window.clearTimeout(start);
    }
    const reading = window.setTimeout(outroDone, Math.max(2200, outro.length * 60));
    return () => window.clearTimeout(reading);
  }, [session.awaitingOutro]); // eslint-disable-line react-hooks/exhaustive-deps

  // The mascot reaches the goal and takes a happy "crunch" the instant the
  // level is cleared (this fires before any treasure-chest reveal).
  useEffect(() => {
    if (!session.finished) return;
    play('crunch');
  }, [session.finished]); // eslint-disable-line react-hooks/exhaustive-deps

  // A clear, celebratory victory sound the moment the "Ти неймовірний!" screen
  // actually appears (after any chest reveal) — the win screen is never silent.
  useEffect(() => {
    if (!(session.finished && revealDone)) return;
    play('win');
    const t = window.setTimeout(() => play('fanfare'), 480);
    return () => window.clearTimeout(t);
  }, [session.finished, revealDone]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // A level in progress is NEVER interrupted: out of time only takes effect
  // once the child has finished the level they are on (and seen their reward).
  useEffect(() => {
    if (!bedtimeArmed || bedtimeOpen || !(session.finished && revealDone)) return;
    const t = window.setTimeout(openBedtime, 3200);
    return () => window.clearTimeout(t);
  }, [bedtimeArmed, bedtimeOpen, session.finished, revealDone, openBedtime]);

  if (!module || !task) {
    return (
      <div className="center" style={{ padding: 40 }}>
        <p>Модуль не знайдено 🙈</p>
      </div>
    );
  }

  // The fuel-depleted cutscene + cooldown lock. Shown when the tank just ran
  // dry (bedtimeOpen) or the child arrived while a cooldown is still active.
  // Arriving during a cooldown shows it at once; but a cooldown that starts
  // while a level is being played waits for that level to end.
  const showBedtime = blocked;
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
      playCode('SND_SUCCESS');
      play('pop');
      session.registerSuccess();
    },
    onMistake: () => {
      markActivity();
      // Engine decides the feedback: SND_ERROR + a 300 ms shake in the view.
      const result = session.registerMistake();
      if (result) playCode(result.audio);
    },
    speakPrompt: () => {
      markActivity();
      speakPrompt(task.prompt);
    },
  };

  const GameView = module.GameView;
  const VisualHelper =
    module.VisualHelper && (module.showsHelper?.(task) ?? true) ? module.VisualHelper : undefined;
  const tipsEnabled = !session.finished && !session.justSolved && !session.hintActive && !blocked;
  const IntroView = module.IntroView;
  // When finished, pin the mascot at the goal (no idle roll-back on the
  // celebration screen); otherwise show progress minus any idle roll-back.
  const progress = session.finished ? 1 : Math.max(0, position - rollback);

  const scrollToAnswers = () => {
    play('tap');
    boardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const header = (
    <div className={styles.header}>
      <button className={styles.back} onClick={onExit} aria-label="Назад до пригод" data-tip="home">
        🏠
      </button>
      <div className={styles.headerMain}>
        <div className={styles.title}>
          {module.icon} {subLabel}
        </div>
        {phase === 'play' && (
          <div
            className={styles.dots}
            data-tip="dots"
            role="img"
            aria-label={`Завдання ${Math.min(session.solvedCount + 1, session.total)} з ${session.total}`}
          >
            {Array.from({ length: session.total }, (_, i) => {
              const done = i < session.solvedCount;
              const isExtra = i >= session.baseTotal;
              return (
                <span
                  key={i}
                  className={cn(styles.dot, done && styles.dotDone, isExtra && styles.dotExtra)}
                  aria-hidden
                />
              );
            })}
          </div>
        )}
      </div>
      {phase === 'play' && (
        <div className={styles.hud}>
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
    const startGame = () => {
      // Stop the intro voice immediately — no lingering talking in-game.
      speechEngine.cancel();
      play('tap');
      markActivity();
      setPhase('play');
    };
    return (
      <div className={styles.screen}>
        {header}
        <motion.div
          className={styles.introCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.introClose}>
            <button
              className={styles.introCloseBtn}
              onClick={startGame}
              aria-label="Закрити і почати"
            >
              ✕
            </button>
          </div>
          {IntroView && <IntroView subCategoryId={config.subCategoryId} />}
          {showText && introText && <p className={styles.introText}>{introText}</p>}
          <Button size="lg" icon="▶️" block onClick={startGame}>
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

      <div className={styles.board} ref={boardRef} data-tip="board">
        {/* The one repeat of a task missed earlier: a quiet icon in the corner,
            no words and no row of its own. (The voice on/off switch that used
            to sit here looked like a second "read aloud" button; it lives in
            the audio settings.) */}
        {session.isRepeat && !session.finished && (
          <span className={`${styles.repeatTag} emoji`} role="img" aria-label="Спробуймо ще раз">
            🔁
          </span>
        )}

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

        {/* Keyed by queue position: the repeat of a missed task is a fresh view. */}
        <GameView
          key={session.index}
          task={task}
          callbacks={callbacks}
          hintActive={session.hintActive}
        />

        <AnimatePresence>
          {session.justSolved && outro && showText && (
            <motion.p
              className={styles.outro}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {outro}
            </motion.p>
          )}
        </AnimatePresence>

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
        {session.hintActive && VisualHelper && (
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
              {/* The gift is a new resident of the child's world. */}
              {newestResident && (
                <p className={styles.residentLine}>
                  У твоєму світі оселився:{' '}
                  <span className="emoji" aria-hidden>
                    {newestResident.emoji}
                  </span>{' '}
                  <strong>{newestResident.name}</strong>
                </p>
              )}
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

      {/* Waits until the first task has been read out. */}
      <CoachTips tips={tips} enabled={tipsEnabled} startDelayMs={2600} onOpenChange={setCoaching} />

      {bedtimeOverlay}
    </div>
  );
}
