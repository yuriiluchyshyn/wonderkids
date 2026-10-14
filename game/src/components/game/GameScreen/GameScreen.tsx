import { useT } from '@/core/translator';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { useSound } from '@/core/audio/useSound';
import { useVoiceStopsOnLeave, voice } from '@/core/audio/voice';
import { useShowText } from '@/core/app/ui/useUiPrefs';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import type { TemplatePayload } from '@/core/game/templates/types';
import { CoachTips } from '@/components/coach/CoachTips';
import { gameTips } from '@/components/coach/tips';
import { HintPanel } from '@/components/hints/HintPanel';
import { HintStageProvider, useHintStageState } from '@/components/hints/HintStage';
import { CuesHiddenProvider } from '@/components/templates/CueContext';
import { PauseProvider } from '@/components/templates/PauseContext';
import { Celebration } from '../Celebration';
import { Cutscene } from '../Cutscene';
import { TreasureReveal } from '../TreasureReveal';
import { useGameSession, type GameSessionConfig } from '../useGameSession';
import { BoardDock } from './BoardDock';
import { GameHeader } from './GameHeader';
import { HeldBoard } from './HeldBoard';
import { HelpArea } from './HelpArea';
import { IntroCard } from './IntroCard';
import { OutroLine } from './OutroLine';
import { WinSummary } from './WinSummary';
import type { Phase } from './types';
import { useCompanionPace } from './useCompanionPace';
import { useHelpAttention } from './useHelpAttention';
import { useHelpFlow } from './useHelpFlow';
import { useIdleExplain } from './useIdleExplain';
import { useLevelEnd } from './useLevelEnd';
import { useOutro } from './useOutro';
import { useRestAfterLevel, useScreenRest } from './useScreenRest';
import { useTaskCallbacks } from './useTaskCallbacks';
import { useTaskIntro } from './useTaskIntro';
import { useTaskVoice } from './useTaskVoice';
import styles from './GameScreen.module.css';

interface GameScreenProps {
  config: GameSessionConfig;
  subLabel: string;
  onExit: () => void;
  onPlayAgain: () => void;
  /** Advance to the next step/level in place, without leaving to the hub. */
  onContinue: () => void;
}

/**
 * The game shell: an animated spoken intro, then it hosts a module's GameView,
 * drives the companion race (with idle roll-back), raises the Zero-Aggression
 * help (its script on the hint stage, or the module's helper and how-to),
 * keeps what is said about the task in sight, and shows the end-of-level
 * celebration. Each concern is a part of its own (`index.ts`); this only puts
 * them together.
 */
export function GameScreen({ config, subLabel, onExit, onPlayAgain, onContinue }: GameScreenProps) {
  const t = useT();
  const session = useGameSession(config);
  const theme = useActiveTheme();
  const showText = useShowText();
  const { play } = useSound();
  const { module, task } = session;
  // What is said about a task is said in the voice's language — unless the task has no twin
  // there (a question of the screen's language alone, `task.own`): then in the one it is shown in.
  const taskLang = task?.voice ? session.langs.said : (task?.lang ?? session.langs.shown);

  const { sub, introText, introSpeech } = useTaskIntro(config, session);
  const [phase, setPhase] = useState<Phase>(introText ? 'intro' : 'play');
  // An onboarding tip is on screen, or the board opened a lesson: the child is reading, not idling.
  const [coachingTip, setCoaching] = useState(false);
  const [lessonOpen, setLessonOpen] = useState(false);
  // The one player of hint scripts (`components/hints`): the help, and what is read out over a solved board.
  const stage = useHintStageState();
  const coaching = coachingTip || lessonOpen || stage.locked;

  const rest = useScreenRest({ phase, session, onPlayAgain });
  const { blocked } = rest;
  const sayTask = useTaskVoice({ phase, session, taskLang, introSpeech, blocked });
  const { progress, markActivity } = useCompanionPace(session, phase !== 'play' || blocked || coaching);
  useIdleExplain(session, phase !== 'play' || blocked || coaching);
  const attention = useHelpAttention();
  useHelpFlow({ phase, session, taskLang, stage, bringIntoSight: attention.bringIntoSight });
  const outro = useOutro({ session, taskLang, stage });
  const end = useLevelEnd({ config, sub, session, blocked });
  useRestAfterLevel(rest, end.seen);
  const callbacks = useTaskCallbacks({ session, markActivity, sayTask });
  // Leaving the game takes its voice along.
  useVoiceStopsOnLeave();

  // First-run tips: how to answer on this kind of board, then what each control does.
  const template = (task?.payload as Partial<TemplatePayload> | null | undefined)?.template;
  const hasText = Boolean(sub?.hasText);
  const tips = useMemo(() => gameTips({ template, hasText }), [template, hasText]);
  const boardRef = useRef<HTMLDivElement>(null);

  if (!module || !task) {
    return (
      <div className="center" style={{ padding: 40 }}>
        <p>{t('game.moduleNotFound')}</p>
      </div>
    );
  }

  // The rest screen: when the tank just ran dry, or the child arrived during a cooldown.
  const restOverlay = blocked ? <Cutscene playScene={rest.open} ready={rest.screen.ready} onResume={rest.resume} onExit={onExit} /> : null;
  const header = <GameHeader phase={phase} icon={module.icon} label={subLabel} session={session} progress={progress} onExit={onExit} />;

  if (phase === 'intro') {
    const startGame = () => {
      // No lingering talking in the game.
      voice.stop();
      play('tap');
      markActivity();
      setPhase('play');
    };
    return (
      <div className={styles.screen}>
        {header}
        <IntroCard demo={sub?.demo} text={introText} onStart={startGame} />
        {restOverlay}
      </div>
    );
  }

  const GameView = module.GameView;
  const VisualHelper = module.VisualHelper && (module.showsHelper?.(task) ?? true) ? module.VisualHelper : undefined;
  // A help told as a script stands in the panel while it is on the stage; any other help while it is due.
  const scripted = stage.play?.kind === 'help';
  const helping = scripted || (session.hintActive && Boolean(VisualHelper));
  const tipsEnabled = !session.finished && !session.justSolved && !session.hintActive && !blocked && !lessonOpen && !stage.playing;
  const backToAnswers = () => {
    play('tap');
    boardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <HintStageProvider stage={stage}>
      <div className={styles.screen}>
        {header}

        <div className={styles.board} ref={boardRef} data-tip="board">
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

          {/* Keyed by queue position: the repeat of a missed task is a fresh view. A well-known
              task is asked without its association pictures (`core/game/cues`). */}
          <CuesHiddenProvider value={session.cuesHidden}>
            <PauseProvider value={setLessonOpen}>
              <HeldBoard held={stage.locked} onHeldTap={attention.nudge}>
                <GameView key={session.index} task={task} callbacks={callbacks} hintActive={session.hintActive} />
              </HeldBoard>
            </PauseProvider>
          </CuesHiddenProvider>

          <BoardDock>
            <OutroLine text={outro} open={session.justSolved && showText} stage={stage} />
            <HelpArea open={helping} helperRef={attention.helperRef} attentionRef={attention.attentionRef} onBack={backToAnswers}>
              {scripted ? <HintPanel /> : VisualHelper && <VisualHelper task={task} callbacks={callbacks} hintActive />}
            </HelpArea>
          </BoardDock>
        </div>

        <TreasureReveal active={end.reveal !== null && !end.revealDone} treasure={end.reveal?.treasure ?? null} isNew={end.reveal?.isNew ?? false} onDone={() => end.setRevealDone(true)} />
        <Celebration active={end.winShown} />
        <WinSummary
          open={end.winShown}
          title={t(end.winTitle)}
          gift={end.gift}
          earned={session.earned}
          keysWon={end.keysWon}
          reveal={end.reveal}
          tasks={session.total}
          trial={end.trial}
          hasNext={config.step < end.maxSteps}
          onContinue={onContinue}
          onPlayAgain={onPlayAgain}
          onExit={onExit}
        />

        {/* Waits until the first task has been read out. */}
        <CoachTips tips={tips} enabled={tipsEnabled} startDelayMs={2600} onOpenChange={setCoaching} />
        {restOverlay}
      </div>
    </HintStageProvider>
  );
}
