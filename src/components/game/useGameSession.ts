import { useCallback, useEffect, useRef, useState } from 'react';
import { moduleRegistry } from '@/core/kernel/ModuleRegistry';
import type { LearningModule, TaskInstance } from '@/core/kernel/types';
import { useGameStore } from '@/core/store/useGameStore';

/** Mistakes within a single task before the scaffolding helper appears (PRD §5). */
const HINT_THRESHOLD = 2;
/** Pause after a correct answer so the celebration animation can play. */
const ADVANCE_DELAY_MS = 850;

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
  total: number;
  solvedCount: number;
  hintActive: boolean;
  /** True when the just-answered task was correct (brief, before advancing). */
  justSolved: boolean;
  finished: boolean;
  earned: number;
  hintUsedThisSession: boolean;
  registerSuccess: () => void;
  registerMistake: () => void;
}

/**
 * Owns the lifecycle of a learning session: generating tasks, counting mistakes
 * to raise the Zero-Aggression hint, awarding artifacts, and detecting the end
 * of the session. Keeps all this out of the view so the shell stays declarative.
 */
export function useGameSession(config: GameSessionConfig): GameSession {
  const { moduleId, subCategoryId, step } = config;
  const module = moduleRegistry.get(moduleId);

  const total = useGameStore((s) => s.settings.sessionLength);
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

  // Guards against double-advancing from rapid taps.
  const advancingRef = useRef(false);

  const makeTask = useCallback(
    (i: number) => {
      if (!module) return null;
      return module.generateTask({ subCategoryId, step, index: i });
    },
    [module, subCategoryId, step],
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
    advancingRef.current = false;
    setTask(makeTask(0));
  }, [makeTask]);

  const registerMistake = useCallback(() => {
    setMistakes((m) => {
      const next = m + 1;
      if (next >= HINT_THRESHOLD) setHintUsedThisSession(true);
      return next;
    });
  }, []);

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
      if (nextIndex >= total) {
        // Session complete → climb the learning path (frontier only).
        advanceStep(moduleId, subCategoryId, step);
        setFinished(true);
      } else {
        setIndex(nextIndex);
        setMistakes(0);
        setJustSolved(false);
        setTask(makeTask(nextIndex));
        advancingRef.current = false;
      }
    }, ADVANCE_DELAY_MS);
  }, [task, index, total, step, mistakes, awardArtifacts, recordTaskComplete, makeTask, advanceStep, moduleId, subCategoryId]);

  return {
    module,
    task,
    index,
    total,
    solvedCount,
    hintActive: mistakes >= HINT_THRESHOLD,
    justSolved,
    finished,
    earned,
    hintUsedThisSession,
    registerSuccess,
    registerMistake,
  };
}
