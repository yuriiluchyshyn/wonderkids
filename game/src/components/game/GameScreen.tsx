import { useT, useVoiceLang } from '@/core/translator';
import { moduleRegistry } from '@/core/game/kernel/ModuleRegistry';
import { useBalance } from '@/core/child/world/useBalance';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { saidOf, spokenPrompt, type TaskCallbacks } from '@/core/game/kernel/types';
import { useSound } from '@/core/audio/useSound';
import { useSayT, useVoiceSpeak } from '@/core/audio/useSpeech';
import { useVoiceStopsOnLeave, voice } from '@/core/audio/voice';
import { useShowText } from '@/core/app/ui/useUiPrefs';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useGameStore } from '@/core/child/store/useGameStore';
import { finishDemo, useDemo } from '@/core/app/demo';
import type { Treasure } from '@/core/theme/theme.types';
import { pickChestTreasure, treasureKey } from '@/core/child/progress/treasures';
import { giftTierOf, hasChest, type GiftTier } from '@/core/child/progress/pathStops';
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
import { tellFact } from '@/core/game/content/outro';
import { IntroDemo } from '@/components/templates/IntroDemo';
import { HintStageProvider, useHintStageState } from '@/components/hints/HintStage';
import { HintPanel } from '@/components/hints/HintPanel';
import { helpOf, helpOnIdle, toldOf } from '@/core/game/hints/script';
import { CuesHiddenProvider } from '@/components/templates/CueContext';
import { PauseProvider } from '@/components/templates/PauseContext';
import type { TemplatePayload } from '@/core/game/templates/types';
import { useGameSession, type GameSessionConfig } from './useGameSession';
import { useIdleRollback } from './useIdleRollback';
import { useScreenTime } from './useScreenTime';
import { subSteps } from '@/core/child/progress/path';
import { isFreePlay } from '@/core/game/kernel/gameConfig';
import { useWorld } from '@/core/child/world/useWorld';
import { keysOf } from '@/core/child/world/games';
import { KEY } from '@/core/child/world/stations';
import { spoken, written } from '@/core/language/uk';
import type { LangCode } from '@/core/language';
import styles from './GameScreen.module.css';

const GIFT_META: Record<Exclude<GiftTier, null>, { emoji: string; size: string }> = {
  small: { emoji: '🎀', size: '3.6rem' },
  big: { emoji: '🎁', size: '4.4rem' },
  biggest: { emoji: '🏆', size: '5.4rem' },
};

/** How long the trial's win screen stays, after it has been read out, before the way to an account. */
const TRIAL_OVER_MS = 2500;

/** How long a task whose help may come on its own (`payload.help.after.idle`) waits for an answer before it does. */
const EXPLAIN_IDLE_MS = 20_000;

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
  const t = useT();
  const session = useGameSession(config);
  const theme = useActiveTheme();
  const showText = useShowText();
  const { play, playCode } = useSound();
  const speakPrompt = useVoiceSpeak('taskPrompt');
  const speakIntro = useVoiceSpeak('taskIntro');
  const { module, task } = session;
  // What is said about a task is said in the voice's language — unless the task
  // has no twin there (a question of the screen's language alone, `task.own`):
  // then it is read in the language it is shown in.
  const taskLang = task?.voice ? session.langs.said : (task?.lang ?? session.langs.shown);
  // A hint's «how» is a piece of the task: the whole phrase is said in the language the task is read in.
  const sayHint = useSayT('hint', taskLang);
  // The win screen is read out in the voice's language, whatever the screen shows.
  const voiceLang = useVoiceLang();
  const sayT = useT(voiceLang);
  const voiceTheme = useActiveTheme(voiceLang);
  const gender = useGameStore((s) => s.profile.gender);

  const sub = module?.subCategories.find((s) => s.id === config.subCategoryId);
  // Prefer the module's themed, child-level intro; fall back to the static one.
  const introText = module?.getIntro?.(config.subCategoryId, theme, config.step) ?? sub?.intro;
  // …and the same intro as the voice says it, when the voice speaks another language.
  const saidModule = moduleRegistry.get(config.moduleId, session.langs.said);
  const saidTheme = useActiveTheme(session.langs.said);
  const introSpeech =
    session.langs.said === session.langs.shown
      ? introText
      : (saidModule?.getIntro?.(config.subCategoryId, saidTheme, config.step) ?? saidModule?.subCategories.find((s) => s.id === config.subCategoryId)?.intro ?? introText);

  // A gift pops at every 5th / 10th / final step of the adventure.
  const maxSteps = sub ? subSteps(sub) : 0;
  // Free-play games have no ladder: no step gifts, chests or "next level".
  const free = sub ? isFreePlay(sub) : false;
  const stepGift = free ? null : giftTierOf(config.step, maxSteps);
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
  const [coachingTip, setCoaching] = useState(false);
  // The board opened a lesson (the order of operations, brackets): the same.
  const [lessonOpen, setLessonOpen] = useState(false);
  // The one player of hint scripts (`components/hints`): the help, and what is read out over a solved board.
  const stage = useHintStageState();
  // While a help is being said the child is listening, not idling.
  const coaching = coachingTip || lessonOpen || stage.locked;
  // The fact told after this task: the next one from its pool, so a replay of
  // the same task — even its repeat within this level — tells a new story.
  // Picked once per showing; the last one stays up while the level finishes.
  const outroPick = useRef<{ at: number; text?: string; said?: string; lang?: LangCode }>({ at: -1 });
  if (task && !session.finished && outroPick.current.at !== session.index) {
    // The voice tells the same fact, from its twin's pool (`tellFact`: a story of
    // the screen's language alone is not paired — it is read in that language).
    const told = tellFact(task.outro, task.voice ? (task.voice.outro ?? []) : undefined);
    const paired = told?.said !== undefined;
    outroPick.current = { at: session.index, text: told?.text, said: told?.said ?? told?.text, lang: paired ? taskLang : (task.lang ?? session.langs.shown) };
  }
  const picked = outroPick.current.text;
  const outro = picked ? written(picked) : undefined;
  const outroSpeech = picked ? spoken(outroPick.current.said ?? picked) : undefined;
  const outroLang = outroPick.current.lang ?? taskLang;
  // First-run tips: how to answer on this kind of board, then what each
  // control does (text games also get the tap-to-hear one, PRD v4.0 §2.4).
  const template = (task?.payload as Partial<TemplatePayload> | null | undefined)?.template;
  const hasText = Boolean(sub?.hasText);
  const tips = useMemo(() => gameTips({ template, hasText }), [template, hasText]);

  // ---- Screen-time / fuel engine (Tech Spec FR-TIME) ----
  // What is in the purse now (earned − spent on the planet).
  const artifacts = useBalance();
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
    voice.stop();
  }, [endSession]);

  const resumePlay = useCallback(() => {
    setBedtimeArmed(false);
    setBedtimeOpen(false);
    startPlaySession();
    onPlayAgain();
  }, [startPlaySession, onPlayAgain]);

  const midLevel = phase === 'play' && !session.finished && session.solvedCount + session.index > 0;
  // The gauge is empty and the rest has not started yet. Read from the gauge
  // itself, not from "a session is running": the daily limit empties it too.
  // Only once the server has confirmed it for this visit (`synced`).
  const outOfTime = screen.synced && screen.fuelPct <= 0 && !screen.inCooldown;
  // True while the rest screen covers the game: nothing may speak or run under it.
  const blocked = bedtimeOpen || (screen.inCooldown && !midLevel);
  useEffect(() => {
    if (blocked) voice.stop();
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

  // A task that explains itself (the clock) does so when the child stays silent
  // on it for a long while — a child who does not know how to read it should
  // not have to guess wrong twice to be shown.
  const { explainForIdle } = session;
  const idleExplains = helpOnIdle(task?.payload);
  const explainPaused = phase !== 'play' || blocked || coaching || session.finished || session.justSolved || session.hintActive;
  useEffect(() => {
    if (!idleExplains || explainPaused) return;
    const timer = window.setTimeout(explainForIdle, EXPLAIN_IDLE_MS);
    return () => window.clearTimeout(timer);
  }, [session.index, idleExplains, explainPaused, explainForIdle]);
  const boardRef = useRef<HTMLDivElement>(null);
  const helperRef = useRef<HTMLDivElement>(null);

  // Speak the intro once when the intro screen is shown.
  useEffect(() => {
    if (phase === 'intro' && introSpeech && !blocked) speakIntro(introSpeech, session.langs.said);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Read the prompt aloud whenever a new task appears during play (Voice-First).
  // Keyed by queue position, not task id: the repeat of a missed task is read
  // out again like any other task.
  useEffect(() => {
    if (phase === 'play' && task && !session.finished && !blocked) speakPrompt(spokenPrompt(saidOf(task)), taskLang);
  }, [session.index, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Help is due and the task describes its help as a script: play it, beat by beat — unless the
  // board plays it itself (`by: 'board'`: it depends on what only the board knows).
  useEffect(() => {
    if (phase !== 'play' || !task) return;
    const help = helpOf(task.payload);
    if (session.hintActive && help && help.by !== 'board') {
      stage.start({ shown: help, said: helpOf(saidOf(task).payload), lang: taskLang, kind: 'help' });
    } else if (!session.hintActive && stage.play?.kind === 'help' && stage.play.shown.by !== 'board') {
      stage.clear();
    }
  }, [session.hintActive, session.index, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Whatever was on the stage belonged to the task before.
  useEffect(() => {
    stage.clear();
  }, [session.index]); // eslint-disable-line react-hooks/exhaustive-deps

  // A solved task: its help, if still up, has done its job.
  useEffect(() => {
    if (session.justSolved && stage.play?.kind === 'help') stage.clear();
  }, [session.justSolved]); // eslint-disable-line react-hooks/exhaustive-deps

  // The help has come up — the shell's or the board's: bring it into sight, the board staying in view.
  useEffect(() => {
    if (stage.play?.kind !== 'help') return;
    const t = window.setTimeout(() => helperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120);
    return () => window.clearTimeout(t);
  }, [stage.round, stage.play?.kind]); // eslint-disable-line react-hooks/exhaustive-deps

  // The board is held still while a help is being said: there is nothing to guess at yet.
  const lockRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const board = lockRef.current as (HTMLDivElement & { inert?: boolean }) | null;
    if (board) board.inert = stage.locked;
  }, [stage.locked]);

  // When the scaffolding helper appears: scroll to it and speak the how-to.
  useEffect(() => {
    if (!session.hintActive || phase !== 'play') return;
    const t = window.setTimeout(() => {
      helperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const how = module?.getHintSpeech?.(saidOf(task!));
      // A board that explains itself keeps the floor: whatever we said here would cut it off.
      if (how === undefined) return;
      if (how) sayHint('game.hint.with', { how });
      else sayHint('game.hint.plain');
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
    // Told part by part, the pieces each part names blinking (`payload.told`); with the voice off,
    // each part is given time to be read. The level goes on when the last part is over.
    const told = toldOf(task?.payload);
    if (told) {
      const start = window.setTimeout(
        () =>
          stage.start({
            shown: told,
            said: task ? toldOf(saidOf(task).payload) : undefined,
            lang: outroLang,
            kind: 'told',
            channel: 'taskPrompt',
            onDone: () => window.setTimeout(outroDone, 350),
          }),
        450,
      );
      return () => window.clearTimeout(start);
    }
    if (outroVoice && voice.supported) {
      // Let the "correct!" sound land first, then speak.
      const start = window.setTimeout(
        () => voice.speak(outroSpeech ?? outro, () => window.setTimeout(outroDone, 350), outroLang),
        450,
      );
      return () => window.clearTimeout(start);
    }
    const reading = window.setTimeout(outroDone, Math.max(2200, outro.length * 60));
    return () => window.clearTimeout(reading);
  }, [session.awaitingOutro]); // eslint-disable-line react-hooks/exhaustive-deps

  // The mascot reaches the goal and takes a happy "crunch" the instant the
  // level is cleared (this fires before any treasure-chest reveal). Whatever
  // was still being read out — the last task, a hint — stops here: nothing
  // about a task may sound under the win screen.
  useEffect(() => {
    if (!session.finished) return;
    voice.stop();
    play('crunch');
  }, [session.finished]); // eslint-disable-line react-hooks/exhaustive-deps

  // The win screen is read out — its title and what was earned, never the
  // buttons. `summarySaid` lets the rest screen wait for the last word.
  const voiceOn = useGameStore((s) => s.settings.voiceOn);
  const [summarySaid, setSummarySaid] = useState(false);
  // Keys of knowledge this level brought: a new step passed (or a free-play
  // level) gives one, a replay none. Counted against what there was before the win.
  const keys = useGameStore((s) => keysOf(s.progress, s.treasures));
  const keysBefore = useRef(keys);
  if (!session.finished) keysBefore.current = keys;
  const keysWon = Math.max(0, keys - keysBefore.current);
  const winTitle = `game.win.title.${gender === 'boy' ? 'boy' : 'girl'}` as const;
  const summarySpeech = [
    sayT(winTitle),
    keysWon > 0
      ? sayT('game.win.collectedWithKeys', { amount: voiceTheme.artifact.count(session.earned), keys: sayT('world.keyCount', { count: keysWon }) })
      : sayT('game.win.collected', { amount: voiceTheme.artifact.count(session.earned) }),
    sayT('game.tasksDone', { count: session.total }),
    sayT('game.win.great'),
  ].join(' ');
  useEffect(() => {
    if (!(session.finished && revealDone)) {
      setSummarySaid(false);
      return;
    }
    if (blocked || !voiceOn || !voice.supported) {
      setSummarySaid(true);
      return;
    }
    // Let the victory jingle ring first.
    const t = window.setTimeout(() => voice.speak(summarySpeech, () => setSummarySaid(true), voiceLang), 900);
    return () => window.clearTimeout(t);
  }, [session.finished, revealDone]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Leaving the game takes its voice along.
  useVoiceStopsOnLeave();

  // The trial game is one level: once its win screen has been seen and read
  // out, the way to an account takes over (`DemoOver`) — or sooner, on «Далі».
  const trial = useDemo((s) => s.active);
  useEffect(() => {
    if (!trial || !(session.finished && revealDone && summarySaid)) return;
    const id = window.setTimeout(finishDemo, TRIAL_OVER_MS);
    return () => window.clearTimeout(id);
  }, [trial, session.finished, revealDone, summarySaid]);

  // Arm the bedtime cutscene the moment the tank runs dry during play.
  useEffect(() => {
    if (phase === 'play' && outOfTime && !bedtimeArmed) {
      setBedtimeArmed(true);
    }
  }, [outOfTime, phase, bedtimeArmed]);

  // …but a NEW level never starts on an empty tank. Without this, «Наступний
  // рівень!» / «Ще раз!» (or leaving and coming back) opened a fresh level
  // that was again "in progress", so play could go on for ever.
  useEffect(() => {
    if (outOfTime && !midLevel && !session.finished && !bedtimeOpen) openBedtime();
  }, [outOfTime, midLevel, session.finished, bedtimeOpen, openBedtime]);

  // A level in progress is NEVER interrupted: out of time only takes effect
  // once the child has finished the level they are on (and seen their reward).
  useEffect(() => {
    if (!bedtimeArmed || bedtimeOpen || !(session.finished && revealDone && summarySaid)) return;
    const t = window.setTimeout(openBedtime, 3200);
    return () => window.clearTimeout(t);
  }, [bedtimeArmed, bedtimeOpen, session.finished, revealDone, summarySaid, openBedtime]);

  if (!module || !task) {
    return (
      <div className="center" style={{ padding: 40 }}>
        <p>{t('game.moduleNotFound')}</p>
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
      speakPrompt(spokenPrompt(saidOf(task)), taskLang);
    },
  };

  const GameView = module.GameView;
  const VisualHelper =
    module.VisualHelper && (module.showsHelper?.(task) ?? true) ? module.VisualHelper : undefined;
  // A help told as a script stands in the panel while it is on the stage; any other help while it is due.
  const scripted = stage.play?.kind === 'help';
  const helping = scripted || (session.hintActive && Boolean(VisualHelper));
  const tipsEnabled = !session.finished && !session.justSolved && !session.hintActive && !blocked && !lessonOpen && !stage.playing;
  // When finished, pin the mascot at the goal (no idle roll-back on the
  // celebration screen); otherwise show progress minus any idle roll-back.
  const progress = session.finished ? 1 : Math.max(0, position - rollback);

  const scrollToAnswers = () => {
    play('tap');
    boardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // The house, the title and the purse share the top row (the title held to
  // the left); the race track and its segments run beneath: a grid of three rows.
  const header = (
    <div className={cn(styles.header, phase === 'play' && styles.headerPlay)}>
      <button className={styles.back} onClick={onExit} aria-label={t('game.back')} data-tip="home">
        🏠
      </button>
      <div className={styles.headerMain}>
        <div className={styles.title} style={{ '--chars': subLabel.length + 3 } as CSSProperties}>
          {module.icon} {subLabel}
        </div>
        {/* The race and the task count are one gauge: the track sits under the
            title, and one segment per task right beneath it. A task added
            while idling adds a segment, and all of them narrow to fit. */}
        {phase === 'play' && (
          <div className={styles.track}>
            <Companion progress={progress} />
          </div>
        )}
        {phase === 'play' && (
          <div
            className={styles.dots}
            data-tip="dots"
            role="img"
            aria-label={t('game.progress', { n: Math.min(session.solvedCount + 1, session.total), total: session.total })}
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
      voice.stop();
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
              aria-label={t('game.intro.close')}
            >
              ✕
            </button>
          </div>
          {sub?.demo && <IntroDemo demo={sub.demo} />}
          {showText && introText && <p className={styles.introText}>{introText}</p>}
          <Button size="lg" icon="▶️" block onClick={startGame}>
            {t('game.intro.start')}
          </Button>
        </motion.div>
        {bedtimeOverlay}
      </div>
    );
  }

  // ---- Play screen ----
  return (
    <HintStageProvider stage={stage}>
    <div className={styles.screen}>
      {header}

      <div className={styles.board} ref={boardRef} data-tip="board">
        {/* A repeated task looks like any other: the child does not need to
            be told it is a repeat. (The voice on/off switch that used to sit
            here looked like a second "read aloud" button; it lives in the
            audio settings.) */}

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
        {/* A well-known task is asked without its association pictures (`core/game/cues`). */}
        <CuesHiddenProvider value={session.cuesHidden}>
          <PauseProvider value={setLessonOpen}>
            <div ref={lockRef} className={cn(stage.locked && styles.boardHeld)} aria-busy={stage.locked}>
              <GameView
                key={session.index}
                task={task}
                callbacks={callbacks}
                hintActive={session.hintActive}
              />
            </div>
          </PauseProvider>
        </CuesHiddenProvider>

        <AnimatePresence>
          {session.justSolved && outro && showText && (
            <motion.p
              className={styles.outro}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {stage.play?.kind === 'told'
                ? stage.play.shown.beats.map((b, i) => (
                    <span key={i} className={cn(stage.playing && i === stage.at && styles.outroNow)}>
                      {i > 0 ? ' ' : ''}
                      {written(b.text)}
                    </span>
                  ))
                : outro}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {helping && (
            <motion.div
              ref={helperRef}
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
            >
              <div className={styles.hintBar}>
                <span className={styles.hintBarLabel}>{t('game.hint.label')}</span>
                <VoiceToggle channel="hint" />
              </div>
              {scripted ? <HintPanel /> : VisualHelper && <VisualHelper task={task} callbacks={callbacks} hintActive />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bouncing jump-back button so a child who scrolled to the helper can
          return to the answer tiles with one tap. */}
      <AnimatePresence>
        {helping && (
          <motion.button
            className={styles.jumpUp}
            aria-label={t('game.hint.back')}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToAnswers}
          >
            <span className="loop-bob" style={{ '--loop': '1s', '--loop-y': '-10px' } as CSSProperties}>
              ⬆️
            </span>
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
        title={t(winTitle)}
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
              <p className={styles.giftLabel}>{t(`game.gift.${stepGift}`)}</p>
              {/* The gift is a new resident of the child's world. */}
              {newestResident && (
                <p className={styles.residentLine}>
                  {t('game.win.resident')}{' '}
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
            {t('game.win.earned', { n: session.earned, emoji: theme.artifact.emoji })}
            {keysWon > 0 && (
              <>
                {' '}
                +{keysWon} {KEY}
              </>
            )}
          </p>
          {reveal && (
            <p className={styles.treasureLine}>
              {reveal.isNew ? t('game.win.newTreasure') : t('game.win.treasure')}
              <span className="emoji" aria-hidden>
                {reveal.treasure.emoji}
              </span>{' '}
              {reveal.treasure.name}
            </p>
          )}
          <p className="muted">
            {t('game.tasksDone', { count: session.total })} {t('game.win.great')}
          </p>
          <div className={styles.summaryActions}>
            {/* The trial is one level: what follows it is the way to an account. */}
            {trial ? (
              <Button size="lg" icon="▶️" block onClick={finishDemo}>
                {t('demo.next')}
              </Button>
            ) : /* A next level leads on; replay is offered only once the path is done. */
            config.step < maxSteps ? (
              <Button size="lg" icon="▶️" block onClick={onContinue}>
                {t('game.win.next')}
              </Button>
            ) : (
              <Button size="lg" icon="🔁" block onClick={onPlayAgain}>
                {t('game.win.again')}
              </Button>
            )}
            {!trial && (
              <Button size="lg" variant="ghost" icon="🏠" block onClick={onExit}>
                {t('game.win.exit')}
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Waits until the first task has been read out. */}
      <CoachTips tips={tips} enabled={tipsEnabled} startDelayMs={2600} onOpenChange={setCoaching} />

      {bedtimeOverlay}
    </div>
    </HintStageProvider>
  );
}
