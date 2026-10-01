import { create } from 'zustand';
import type { ThemeId } from '@/core/theme/theme.types';
import { DEFAULT_THEME_ID } from '@/core/theme/themes';
import {
  DEFAULT_VOICE_STATE,
  type VoiceChannel,
  type VoiceChannelState,
} from '@/core/audio/voiceChannels';
import { clampStep, pathKey } from '@/core/progress/path';

/** Rate at which the companion rolls back during inactivity (PRD §4.1). */
export type CompanionSpeed = 'off' | 'slow' | 'medium' | 'fast';

/** Winning celebration styles (PRD §4.1 — 5 режимів святкування). */
export type CelebrationStyle =
  | 'balloons'
  | 'balls'
  | 'stars'
  | 'fireworks'
  | 'candy';

export type Gender = 'girl' | 'boy';

/** Child profile (PRD §10). Age is derived from the birth month/year. */
export interface ChildProfile {
  name: string;
  birthYear: number;
  /** 1–12. */
  birthMonth: number;
  gender: Gender;
}

/** A parent-configured reward tied to reaching a path step (PRD §7.1). */
export interface StepMilestone {
  id: string;
  /** Path step (1..TOTAL_STEPS) at which the reward is earned. */
  step: number;
  reward: string;
}

export interface Settings {
  soundOn: boolean;
  voiceOn: boolean;
  voice: VoiceChannelState;
  showText: boolean;
  companionSpeed: CompanionSpeed;
  celebration: CelebrationStyle;
  /** Tasks per game session before advancing a path step. */
  sessionLength: number;
}

/**
 * The fields that make up a save. This is exactly what gets persisted to the
 * server (and, previously, to localStorage) — the actions below are not part
 * of it.
 */
export interface PersistableState {
  profile: ChildProfile;
  themeId: ThemeId;
  artifacts: number;
  tasksCompleted: number;
  hintsSurfaced: number;
  /** Current path step per `${moduleId}:${subId}` (1-based). */
  progress: Record<string, number>;
  milestones: StepMilestone[];
  settings: Settings;
}

export interface GameState extends PersistableState {
  // actions
  setProfile: (patch: Partial<ChildProfile>) => void;
  setTheme: (id: ThemeId) => void;
  awardArtifacts: (amount: number) => void;
  recordTaskComplete: (opts: { hintUsed: boolean }) => void;
  /**
   * Advance the path frontier after completing a session at `playedStep`. Only
   * moves forward when the frontier step was played — replaying an earlier step
   * never pushes progress beyond where the child actually is.
   */
  advanceStep: (moduleId: string, subCategoryId: string, playedStep: number, maxSteps: number) => void;
  /** Parent control: set the current frontier step for a sub-category. */
  setStep: (moduleId: string, subCategoryId: string, step: number, maxSteps: number) => void;
  setMilestones: (milestones: StepMilestone[]) => void;
  updateSettings: (patch: Partial<Omit<Settings, 'voice'>>) => void;
  toggleVoice: (channel: VoiceChannel) => void;
  resetProgress: () => void;
  /** Replace the save with server-loaded data layered over defaults. */
  hydrate: (data: Partial<PersistableState>) => void;
  /** Reset the entire save back to defaults (used on logout / fresh login). */
  resetAll: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();

const DEFAULT_PROFILE: ChildProfile = {
  name: 'Друже',
  birthYear: CURRENT_YEAR - 5,
  birthMonth: 6,
  gender: 'girl',
};

const DEFAULT_SETTINGS: Settings = {
  soundOn: true,
  voiceOn: true,
  voice: { ...DEFAULT_VOICE_STATE },
  showText: true,
  companionSpeed: 'medium',
  celebration: 'balloons',
  sessionLength: 5,
};

const DEFAULT_MILESTONES: StepMilestone[] = [
  { id: 'm_cookie', step: 5, reward: 'Спекти печиво разом 🍪' },
  { id: 'm_park', step: 15, reward: 'Поїздка в парк розваг 🎡' },
  { id: 'm_trip', step: 30, reward: 'Велика сімейна пригода 🎉' },
];

/** A fresh save with all defaults — the starting point for a new user. */
function createInitialState(): PersistableState {
  return {
    profile: { ...DEFAULT_PROFILE },
    themeId: DEFAULT_THEME_ID,
    artifacts: 0,
    tasksCompleted: 0,
    hintsSurfaced: 0,
    progress: {},
    milestones: DEFAULT_MILESTONES.map((m) => ({ ...m })),
    settings: { ...DEFAULT_SETTINGS, voice: { ...DEFAULT_SETTINGS.voice } },
  };
}

/**
 * Merge a (possibly partial / legacy) server payload onto a fresh default
 * save, so missing or newly-added fields always have sane values. Mirrors the
 * old localStorage migration intent without being tied to a stored version.
 */
function fromPersisted(data: Partial<PersistableState> | null | undefined): PersistableState {
  const base = createInitialState();
  if (!data || typeof data !== 'object') return base;

  const settings = (data.settings ?? {}) as Partial<Settings>;
  return {
    profile: { ...base.profile, ...(data.profile ?? {}) },
    themeId: data.themeId ?? base.themeId,
    artifacts: typeof data.artifacts === 'number' ? data.artifacts : base.artifacts,
    tasksCompleted:
      typeof data.tasksCompleted === 'number' ? data.tasksCompleted : base.tasksCompleted,
    hintsSurfaced:
      typeof data.hintsSurfaced === 'number' ? data.hintsSurfaced : base.hintsSurfaced,
    progress: data.progress && typeof data.progress === 'object' ? data.progress : base.progress,
    milestones: Array.isArray(data.milestones) ? data.milestones : base.milestones,
    settings: {
      ...base.settings,
      ...settings,
      voice: { ...base.settings.voice, ...(settings.voice ?? {}) },
    },
  };
}

/** Extract just the persistable save from the live store (for syncing). */
export function selectPersistable(s: GameState): PersistableState {
  return {
    profile: s.profile,
    themeId: s.themeId,
    artifacts: s.artifacts,
    tasksCompleted: s.tasksCompleted,
    hintsSurfaced: s.hintsSurfaced,
    progress: s.progress,
    milestones: s.milestones,
    settings: s.settings,
  };
}

export const useGameStore = create<GameState>()((set) => ({
  ...createInitialState(),

  setProfile: (patch) =>
    set((s) => {
      const next = { ...s.profile, ...patch };
      if (typeof next.name === 'string') {
        next.name = next.name.trim() || 'Друже';
      }
      next.birthMonth = Math.min(12, Math.max(1, Math.round(next.birthMonth)));
      next.birthYear = Math.min(
        CURRENT_YEAR,
        Math.max(CURRENT_YEAR - 14, Math.round(next.birthYear)),
      );
      return { profile: next };
    }),

  setTheme: (id) => set({ themeId: id }),

  awardArtifacts: (amount) =>
    set((s) => ({ artifacts: s.artifacts + Math.max(0, amount) })),

  recordTaskComplete: ({ hintUsed }) =>
    set((s) => ({
      tasksCompleted: s.tasksCompleted + 1,
      hintsSurfaced: s.hintsSurfaced + (hintUsed ? 1 : 0),
    })),

  advanceStep: (moduleId, subCategoryId, playedStep, maxSteps) =>
    set((s) => {
      const key = pathKey(moduleId, subCategoryId);
      const current = s.progress[key] ?? 1;
      // Only the frontier advances; replaying an older step changes nothing.
      const next = Math.max(current, Math.min(maxSteps, playedStep + 1));
      return { progress: { ...s.progress, [key]: clampStep(next, maxSteps) } };
    }),

  setStep: (moduleId, subCategoryId, step, maxSteps) =>
    set((s) => ({
      progress: { ...s.progress, [pathKey(moduleId, subCategoryId)]: clampStep(step, maxSteps) },
    })),

  setMilestones: (milestones) =>
    set({
      milestones: [...milestones]
        .map((m) => ({ ...m, step: clampStep(m.step) }))
        .sort((a, b) => a.step - b.step),
    }),

  updateSettings: (patch) =>
    set((s) => ({ settings: { ...s.settings, ...patch } })),

  toggleVoice: (channel) =>
    set((s) => ({
      settings: {
        ...s.settings,
        voice: { ...s.settings.voice, [channel]: !s.settings.voice[channel] },
      },
    })),

  resetProgress: () =>
    set({
      artifacts: 0,
      tasksCompleted: 0,
      hintsSurfaced: 0,
      progress: {},
    }),

  hydrate: (data) => set(fromPersisted(data)),

  resetAll: () => set(createInitialState()),
}));
