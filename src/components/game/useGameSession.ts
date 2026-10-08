import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { moduleRegistry } from '@/core/game/kernel/ModuleRegistry';
import type { LearningModule, TaskInstance } from '@/core/game/kernel/types';
import { isFreePlay, tasksPerLevel } from '@/core/game/kernel/gameConfig';
import { composeLevel, recallSteps } from '@/core/game/engine/recall';
import { pick } from '@/core/utils/random';
import { LevelEngine, taskKey } from '@/core/game/engine/LevelEngine';
import type { AnswerResult } from '@/core/game/engine/BaseGameEngine';
import { useGameStore } from '@/core/child/store/useGameStore';
import { subSteps } from '@/core/child/progress/path';
import type { CurrencyId } from '@/core/game/content/currency';

/**
 * Mistakes on a task before the helper appears (PRD §5). The helper is ONLY
 * ever a response to mistakes — never to a pause, and never shown up-front.
 */
const HINT_THRESHOLD = 2;
/** On the repeat of a task the child already missed, one more slip is enough. */
const REPEAT_HINT_THRESHOLD = 1;
/** If a spoken fact never reports back (speech glitch), move on after this. */
const OUTRO_SAFETY_MS = 30_000;
/** Pause after a correct answer so the celebration animation can play. */
const ADVANCE_DELAY_MS = 850;
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
  /**
   * The companion drifted a whole step back while the child was away: one more
   * task joins the level. False when the level cannot grow any further.
   */
  extendForIdle: () => boolean;
  /** How many of the level's tasks were added by idle roll-back. */
  idleExtras: number;
  /**
   * True while a solved task's `outro` fact is on screen and the level waits
   * for it. The shell calls `outroDone` once the fact has been read out.
   */
  awaitingOutro: boolean;
  outroDone: () => void;
}

/**
 * Candidate tasks for one level: the module's own picker, or repeated draws.
 * A generated path game (the math ladders) gets the same shape as a content
 * one: half the level at the current step, half recalled from the steps just
 * behind it (`core/game/engine/recall`).
 */
export function drawCandidates(
  module: LearningModule,
  base: { subCategoryId: string; step: number; choicesCount: number; currency?: CurrencyId },
  count: number,
  recall = true,
): TaskInstance[] {
  if (module.buildLevel) return module.buildLevel(base, count);
  const draw = (stepOf: () => number) =>
    Array.from({ length: count * CANDIDATE_FACTOR }, (_, index) =>
      module.generateTask({ ...base, step: stepOf(), index }),
    );
  const fresh = draw(() => base.step);
  const earlier = recallSteps(base.step);
  if (!recall || earlier.length === 0) return fresh;
  return composeLevel(fresh, draw(() => pick(earlier)), count, taskKey);
}

/**
 * React binding of the Engine Layer (PRD v4.0 §3): owns one level's
 * `LevelEngine` — the task queue, the "missed task returns once" rule and the
 * dynamic level length — and exposes it as state the shell can render. The
 * level is always dynamic: a task the child gets wrong comes back once more, so
 * it is solved twice in all and is never shown a third time. Also counts
 * mistakes to raise the Zero-Aggression hint and awards artifacts.
 */
export function useGameSession(config: GameSessionConfig): GameSession {
  const { moduleId, subCategoryId, step } = config;
  const module = moduleRegistry.get(moduleId);
  const sub = module?.subCategories.find((sc) => sc.id === subCategoryId);
  const maxSteps = sub ? subSteps(sub) : 30;
  const levelSize = sub ? tasksPerLevel(sub) : 0;
  const free = sub ? isFreePlay(sub) : false;
  const gridSize = useGameStore((s) => s.settings.choicesGridSize);
  const currency = useGameStore((s) => s.settings.currency);
  const awardArtifacts = useGameStore((s) => s.awardArtifacts);
  const recordTaskComplete = useGameStore((s) => s.recordTaskComplete);
  const advanceStep = useGameStore((s) => s.advanceStep);
  const recordLevelComplete = useGameStore((s) => s.recordLevelComplete);

  // One engine per level. Rebuilt only when the level itself changes.
  const engine = useMemo(() => {
    if (!module) return null;
    const base = { subCategoryId, step, choicesCount: gridSize, currency };
    return new LevelEngine<TaskInstance>({
      steps_count_default: levelSize,
      tasks: drawCandidates(module, base, levelSize, !free),
    });
  }, [module, subCategoryId, step, gridSize, levelSize, free]);

  // The engine is mutable; `tick` re-renders after each transition.
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);

  const [mistakes, setMistakes] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [justSolved, setJustSolved] = useState(false);
  const [finished, setFinished] = useState(false);
  const [earned, setEarned] = useState(0);
  const [hintUsedThisSession, setHintUsedThisSession] = useState(false);
  const [awaitingOutro, setAwaitingOutro] = useState(false);
  const [idleExtras, setIdleExtras] = useState(0);
  // The pending "go to the next task" step, run exactly once.
  const advanceRef = useRef<(() => void) | null>(null);

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
    setAwaitingOutro(false);
    setIdleExtras(0);
    advanceRef.current = null;
    advancingRef.current = false;
  }, [engine]);

  const task = engine?.currentTask ?? null;
  const isRepeat = engine?.isRepeatShowing ?? false;
  // The engine is the truth about "the level is over". Finishing also writes
  // to the store (path step, plays), and React renders that store change
  // before this hook's own `finished` state lands — for one render the queue
  // had moved on while `finished` was still false, so the shell took the last
  // task for a new one and read its prompt out under the win screen.
  const over = finished || Boolean(engine && engine.total > 0 && engine.isFinished);

  /** Append one question the level does not ask yet. False once capped. */
  const appendFresh = useCallback((): boolean => {
    if (!engine || !module) return false;
    const base = { subCategoryId, step, choicesCount: gridSize };
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const extra = module.generateTask({ ...base, index: engine.total + attempt });
      if (engine.includesKey(taskKey(extra))) continue;
      return engine.extend(extra);
    }
    return false;
  }, [engine, module, subCategoryId, step, gridSize]);

  const extendForIdle = useCallback((): boolean => {
    if (!engine || engine.isFinished || advancingRef.current) return false;
    const added = appendFresh();
    if (added) setIdleExtras((n) => n + 1);
    return added;
  }, [engine, appendFresh]);

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
    if (next > HINT_THRESHOLD) appendFresh();
    rerender();
    return result;
  }, [engine, module, appendFresh, rerender]);

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

    const advance = () => {
      if (advanceRef.current !== advance) return; // already ran, or level changed
      advanceRef.current = null;
      setAwaitingOutro(false);
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
    };
    advanceRef.current = advance;

    if (current.outro?.length) {
      // A fact follows: wait until the shell says it has been read to the end
      // (`outroDone`) — never cut a sentence off to start the next task.
      setAwaitingOutro(true);
      window.setTimeout(advance, OUTRO_SAFETY_MS);
    } else {
      window.setTimeout(advance, ADVANCE_DELAY_MS);
    }
  }, [engine, step, maxSteps, awardArtifacts, recordTaskComplete, advanceStep, recordLevelComplete, moduleId, subCategoryId, rerender]);

  const outroDone = useCallback(() => advanceRef.current?.(), []);

  return {
    module,
    // Keep the last task on screen while the finish celebration plays.
    task: task ?? engine?.lastTask ?? null,
    index: engine?.position ?? 0,
    total: engine?.total ?? 0,
    baseTotal: engine?.baseTotal ?? 0,
    solvedCount,
    hintActive: !justSolved && mistakes >= (isRepeat ? REPEAT_HINT_THRESHOLD : HINT_THRESHOLD),
    isRepeat,
    justSolved,
    finished: over,
    earned,
    hintUsedThisSession,
    registerSuccess,
    registerMistake,
    extendForIdle,
    idleExtras,
    awaitingOutro,
    outroDone,
  };
}
