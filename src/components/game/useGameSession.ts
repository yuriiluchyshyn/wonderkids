import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { moduleRegistry } from '@/core/kernel/ModuleRegistry';
import type { LearningModule, TaskInstance } from '@/core/kernel/types';
import { tasksPerLevel } from '@/core/kernel/gameConfig';
import { LevelEngine, taskKey } from '@/core/engine/LevelEngine';
import type { AnswerResult } from '@/core/engine/BaseGameEngine';
import { useGameStore } from '@/core/store/useGameStore';
import { subSteps } from '@/core/progress/path';

/** Mistakes within a single task before the scaffolding helper appears (PRD §5). */
const HINT_THRESHOLD = 2;
/** Pause after a correct answer so the celebration animation can play. */
const ADVANCE_DELAY_MS = 850;
/** Extra time for a spoken `outro` fact: per character, capped. */
const OUTRO_MS_PER_CHAR = 70;
const OUTRO_MAX_MS = 5200;
/** How many candidates to draw per needed task when a module has no `buildLevel`. */
const CANDIDATE_FACTOR = 5;

export interface GameSessionConfig {
  moduleId: string;
  subCategoryId: string;
  /** Difficulty coefficient / path step (1-based) for this session. */
  step: number;
}

export interface GameSession {
  module: LearningModule | undefined;
  task: TaskInstance | null;
  index: number;
  /** Tasks in this level right now: base + queued repeats + extensions (live). */
  total: number;
  /** Level length before any repeat/extension was added. */
  baseTotal: number;
  solvedCount: number;
  hintActive: boolean;
  /** This showing is the one repeat of a task the child missed earlier. */
  isRepeat: boolean;
  /** True when the just-answered task was correct (brief, before advancing). */
  justSolved: boolean;
  finished: boolean;
  earned: number;
  hintUsedThisSession: boolean;
  registerSuccess: () => void;
  /** Reports a wrong attempt; the result says which sound/animation to play. */
  registerMistake: () => AnswerResult | null;
}

/** Candidate tasks for one level: the module's own picker, or repeated draws. */
function drawCandidates(
  module: LearningModule,
  base: { subCategoryId: string; step: number; choicesCount: number },
  count: number,
): TaskInstance[] {
  if (module.buildLevel) return module.buildLevel(base, count);
  return Array.from({ length: count * CANDIDATE_FACTOR }, (_, index) =>
    module.generateTask({ ...base, index }),
  );
}

/**
 * React binding of the Engine Layer (PRD v4.0 §3): owns one level's
 * `LevelEngine` — the task queue, the "missed task returns once" rule and the
 * dynamic level length — and exposes it as state the shell can render. Also
 * counts mistakes to raise the Zero-Aggression hint and awards artifacts.
 */
export function useGameSession(config: GameSessionConfig): GameSession {
  const { moduleId, subCategoryId, step } = config;
  const module = moduleRegistry.get(moduleId);
  const sub = module?.subCategories.find((sc) => sc.id === subCategoryId);
  const maxSteps = sub ? subSteps(sub) : 30;
  const levelSize = sub ? tasksPerLevel(sub) : 0;
  const hintDelaySec = sub?.hintDelaySec;

  const gameMode = useGameStore((s) => s.settings.gameMode);
  const gridSize = useGameStore((s) => s.settings.choicesGridSize);
  const awardArtifacts = useGameStore((s) => s.awardArtifacts);
  const recordTaskComplete = useGameStore((s) => s.recordTaskComplete);
  const advanceStep = useGameStore((s) => s.advanceStep);
  const recordLevelComplete = useGameStore((s) => s.recordLevelComplete);
  const voiceOn = useGameStore((s) => s.settings.voiceOn && s.settings.voice.taskPrompt);
  const dynamic = gameMode === 'dynamic_task_extension';

  // One engine per level. Rebuilt only when the level itself changes.
  const engine = useMemo(() => {
    if (!module) return null;
    const base = { subCategoryId, step, choicesCount: gridSize };
    return new LevelEngine<TaskInstance>({
      steps_count_default: levelSize,
      tasks: drawCandidates(module, base, levelSize),
      repeatOnError: dynamic,
    });
  }, [module, subCategoryId, step, gridSize, levelSize, dynamic]);

  // The engine is mutable; `tick` re-renders after each transition.
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);

  const [mistakes, setMistakes] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [justSolved, setJustSolved] = useState(false);
  const [finished, setFinished] = useState(false);
  const [earned, setEarned] = useState(0);
  const [hintUsedThisSession, setHintUsedThisSession] = useState(false);
  const [idleHint, setIdleHint] = useState(false);

  // Guards against double-advancing from rapid taps.
  const advancingRef = useRef(false);
  const mistakesRef = useRef(0);

  useEffect(() => {
    setMistakes(0);
    mistakesRef.current = 0;
    setSolvedCount(0);
    setJustSolved(false);
    setFinished(false);
    setEarned(0);
    setHintUsedThisSession(false);
    setIdleHint(false);
    advancingRef.current = false;
  }, [engine]);

  const task = engine?.currentTask ?? null;
  const isRepeat = engine?.isRepeatShowing ?? false;

  // A long pause on a task raises the helper by itself (per-game delay).
  useEffect(() => {
    setIdleHint(false);
    if (!hintDelaySec || !task || finished) return;
    const t = window.setTimeout(() => setIdleHint(true), hintDelaySec * 1000);
    return () => window.clearTimeout(t);
  }, [task?.id, engine?.position, hintDelaySec, finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const registerMistake = useCallback((): AnswerResult | null => {
    if (!engine || !module) return null;
    const current = engine.currentTask;
    if (!current || advancingRef.current) return null;

    const result = engine.submitAnswer(current.id, false);
    const next = mistakesRef.current + 1;
    mistakesRef.current = next;
    setMistakes(next);
    if (next >= HINT_THRESHOLD) setHintUsedThisSession(true);

    // A wrong tap once the hint is already showing reads as blind guessing —
    // add a fresh task so brute-forcing the grid is never a shortcut (Tech
    // Spec v2.1 DoD §2). The engine caps how far a level can grow.
    if (dynamic && next > HINT_THRESHOLD) {
      const base = { subCategoryId, step, choicesCount: gridSize };
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const extra = module.generateTask({ ...base, index: engine.total + attempt });
        if (taskKey(extra) !== taskKey(current) && engine.extend(extra)) break;
      }
    }
    rerender();
    return result;
  }, [engine, module, dynamic, subCategoryId, step, gridSize, rerender]);

  const registerSuccess = useCallback(() => {
    if (!engine) return;
    const current = engine.currentTask;
    if (advancingRef.current || !current) return;
    advancingRef.current = true;

    engine.submitAnswer(current.id, true);
    setJustSolved(true);
    setSolvedCount((c) => c + 1);
    setEarned((e) => e + current.reward);
    awardArtifacts(current.reward);
    recordTaskComplete({ hintUsed: mistakesRef.current >= HINT_THRESHOLD });

    // A spoken fact needs room to finish before the next prompt starts.
    const advanceDelay =
      current.outro && voiceOn
        ? Math.min(OUTRO_MAX_MS, ADVANCE_DELAY_MS + current.outro.length * OUTRO_MS_PER_CHAR)
        : current.outro
          ? ADVANCE_DELAY_MS + 900
          : ADVANCE_DELAY_MS;
    window.setTimeout(() => {
      // Advance only now: a late mistake may still have queued a repeat or an
      // extension, so "is the level over?" is read from the live queue.
      engine.advance();
      if (engine.isFinished) {
        // Level complete → climb the learning path (frontier only).
        advanceStep(moduleId, subCategoryId, step, maxSteps);
        recordLevelComplete(moduleId, subCategoryId);
        setFinished(true);
      } else {
        mistakesRef.current = 0;
        setMistakes(0);
        setJustSolved(false);
        advancingRef.current = false;
      }
      rerender();
    }, advanceDelay);
  }, [engine, step, voiceOn, maxSteps, awardArtifacts, recordTaskComplete, advanceStep, recordLevelComplete, moduleId, subCategoryId, rerender]);

  return {
    module,
    // Keep the last task on screen while the finish celebration plays.
    task: task ?? engine?.lastTask ?? null,
    index: engine?.position ?? 0,
    total: engine?.total ?? 0,
    baseTotal: engine?.baseTotal ?? 0,
    solvedCount,
    hintActive: !justSolved && (mistakes >= HINT_THRESHOLD || isRepeat || idleHint),
    isRepeat,
    justSolved,
    finished,
    earned,
    hintUsedThisSession,
    registerSuccess,
    registerMistake,
  };
}
