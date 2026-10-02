import { useCallback, useEffect, useRef, useState } from 'react';
import { moduleRegistry } from '@/core/kernel/ModuleRegistry';
import type { LearningModule, TaskInstance } from '@/core/kernel/types';
import { useGameStore } from '@/core/store/useGameStore';
import { subSteps } from '@/core/progress/path';

/** Mistakes within a single task before the scaffolding helper appears (PRD §5). */
const HINT_THRESHOLD = 2;
/** Pause after a correct answer so the celebration animation can play. */
const ADVANCE_DELAY_MS = 850;
/** Safety cap so a child who keeps guessing can't balloon the queue forever. */
const MAX_EXTRA_TASKS = 25;

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
  /** Current required task count = `baseTotal` + `extraTasks` (live). */
  total: number;
  /** Parent-set baseline before any roll-back extensions. */
  baseTotal: number;
  /** Tasks added to the queue by roll-backs this session (dynamic mode). */
  extraTasks: number;
  solvedCount: number;
  hintActive: boolean;
  /** True when the just-answered task was correct (brief, before advancing). */
  justSolved: boolean;
  finished: boolean;
  earned: number;
  hintUsedThisSession: boolean;
  registerSuccess: () => void;
  registerMistake: () => void;
  /**
   * A transport roll-back happened (idle drift or blind guessing). In
   * `dynamic_task_extension` mode this appends +1 task to the queue, visibly
   * backing the companion up; a no-op in `fixed_strict` mode.
   */
  registerRollback: () => void;
}

/**
 * Owns the lifecycle of a learning session: generating tasks, counting mistakes
 * to raise the Zero-Aggression hint, awarding artifacts, and detecting the end
 * of the session. Keeps all this out of the view so the shell stays declarative.
 */
export function useGameSession(config: GameSessionConfig): GameSession {
  const { moduleId, subCategoryId, step } = config;
  const module = moduleRegistry.get(moduleId);
  const sub = module?.subCategories.find((sc) => sc.id === subCategoryId);
  const maxSteps = sub ? subSteps(sub) : 30;

  const baseTotal = useGameStore((s) => s.settings.minTasksPerLevel);
  const gameMode = useGameStore((s) => s.settings.gameMode);
  const gridSize = useGameStore((s) => s.settings.choicesGridSize);
  const awardArtifacts = useGameStore((s) => s.awardArtifacts);
  const recordTaskComplete = useGameStore((s) => s.recordTaskComplete);
  const advanceStep = useGameStore((s) => s.advanceStep);

  const [index, setIndex] = useState(0);
  const [task, setTask] = useState<TaskInstance | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [justSolved, setJustSolved] = useState(false);
  const [finished, setFinished] = useState(false);
  const [earned, setEarned] = useState(0);
  const [hintUsedThisSession, setHintUsedThisSession] = useState(false);
  // Extra tasks appended by roll-backs (dynamic mode). A ref mirrors it so the
  // deferred "advance" closure always sees the live required total.
  const [extraTasks, setExtraTasks] = useState(0);
  const extraRef = useRef(0);

  const total = baseTotal + (gameMode === 'dynamic_task_extension' ? extraTasks : 0);

  // Guards against double-advancing from rapid taps.
  const advancingRef = useRef(false);

  const makeTask = useCallback(
    (i: number) => {
      if (!module) return null;
      return module.generateTask({ subCategoryId, step, index: i, choicesCount: gridSize });
    },
    [module, subCategoryId, step, gridSize],
  );

  // Generate the first task (and regenerate if the config changes).
  useEffect(() => {
    setIndex(0);
    setMistakes(0);
    setSolvedCount(0);
    setJustSolved(false);
    setFinished(false);
    setEarned(0);
    setHintUsedThisSession(false);
    setExtraTasks(0);
    extraRef.current = 0;
    advancingRef.current = false;
    setTask(makeTask(0));
  }, [makeTask]);

  const registerRollback = useCallback(() => {
    if (gameMode !== 'dynamic_task_extension') return;
    setExtraTasks((e) => {
      if (e >= MAX_EXTRA_TASKS) return e;
      const next = e + 1;
      extraRef.current = next;
      return next;
    });
  }, [gameMode]);

  const registerMistake = useCallback(() => {
    setMistakes((m) => {
      const next = m + 1;
      if (next >= HINT_THRESHOLD) setHintUsedThisSession(true);
      // A wrong tap once the hint is already showing reads as blind guessing —
      // extend the queue so brute-forcing the grid is never a shortcut (DoD §2).
      if (next > HINT_THRESHOLD) registerRollback();
      return next;
    });
  }, [registerRollback]);

  const registerSuccess = useCallback(() => {
    if (advancingRef.current || !task) return;
    advancingRef.current = true;

    setJustSolved(true);
    setSolvedCount((c) => c + 1);
    setEarned((e) => e + task.reward);
    awardArtifacts(task.reward);
    recordTaskComplete({ hintUsed: mistakes >= HINT_THRESHOLD });

    const nextIndex = index + 1;
    window.setTimeout(() => {
      // Read the LIVE required total: a roll-back may have grown the queue while
      // this task was being answered, so the finish can't be captured early.
      const requiredTotal =
        baseTotal + (gameMode === 'dynamic_task_extension' ? extraRef.current : 0);
      if (nextIndex >= requiredTotal) {
        // Session complete → climb the learning path (frontier only).
        advanceStep(moduleId, subCategoryId, step, maxSteps);
        setFinished(true);
      } else {
        setIndex(nextIndex);
        setMistakes(0);
        setJustSolved(false);
        setTask(makeTask(nextIndex));
        advancingRef.current = false;
      }
    }, ADVANCE_DELAY_MS);
  }, [task, index, baseTotal, gameMode, step, maxSteps, mistakes, awardArtifacts, recordTaskComplete, makeTask, advanceStep, moduleId, subCategoryId]);

  return {
    module,
    task,
    index,
    total,
    baseTotal,
    extraTasks: gameMode === 'dynamic_task_extension' ? extraTasks : 0,
    solvedCount,
    hintActive: mistakes >= HINT_THRESHOLD,
    justSolved,
    finished,
    earned,
    hintUsedThisSession,
    registerSuccess,
    registerMistake,
    registerRollback,
  };
}
