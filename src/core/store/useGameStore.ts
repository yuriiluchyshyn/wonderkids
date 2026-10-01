import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeId } from '@/core/theme/theme.types';
import { DEFAULT_THEME_ID } from '@/core/theme/themes';
import {
  DEFAULT_VOICE_STATE,
  type VoiceChannel,
  type VoiceChannelState,
} from '@/core/audio/voiceChannels';
import { clampStep, pathKey } from '@/core/progress/path';
import { uid } from '@/core/utils/random';

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

export interface GameState {
  profile: ChildProfile;
  themeId: ThemeId;
  artifacts: number;
  tasksCompleted: number;
  hintsSurfaced: number;
  /** Current path step per `${moduleId}:${subId}` (1-based). */
  progress: Record<string, number>;
  milestones: StepMilestone[];
  settings: Settings;

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

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      themeId: DEFAULT_THEME_ID,
      artifacts: 0,
      tasksCompleted: 0,
      hintsSurfaced: 0,
      progress: {},
      milestones: DEFAULT_MILESTONES,
      settings: DEFAULT_SETTINGS,

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
    }),
    {
      name: 'wonderkids-save-v1',
      version: 4,
      migrate: (persisted: unknown) => {
        const s = (persisted ?? {}) as Record<string, unknown>;
        const now = new Date();

        // Profile → birth month/year + gender (girl|boy).
        const prevProfile = (s.profile ?? {}) as Record<string, unknown>;
        let birthYear = prevProfile.birthYear as number | undefined;
        let birthMonth = prevProfile.birthMonth as number | undefined;
        if (!birthYear) {
          const legacyAge =
            typeof prevProfile.age === 'number' ? (prevProfile.age as number) : 5;
          birthYear = now.getFullYear() - legacyAge;
          birthMonth = 6;
        }
        s.profile = {
          name:
            (prevProfile.name as string) ?? (s.profileName as string) ?? DEFAULT_PROFILE.name,
          birthYear,
          birthMonth: birthMonth ?? 6,
          gender: prevProfile.gender === 'boy' ? 'boy' : 'girl',
        } satisfies ChildProfile;

        // Settings → voice channel map.
        const prevSettings = (s.settings ?? {}) as Record<string, unknown>;
        const prevVoice = (prevSettings.voice ?? {}) as Partial<VoiceChannelState>;
        const voice: VoiceChannelState = {
          selections: prevVoice.selections ?? (prevSettings.speakSelections as boolean) ?? true,
          taskPrompt: prevVoice.taskPrompt ?? true,
          taskIntro: prevVoice.taskIntro ?? true,
          hint: prevVoice.hint ?? (prevSettings.speakGameHints as boolean) ?? true,
        };
        s.settings = { ...DEFAULT_SETTINGS, ...prevSettings, voice };
        delete (s.settings as Record<string, unknown>).speakSelections;
        delete (s.settings as Record<string, unknown>).speakGameHints;

        // Path progress + milestones.
        if (!s.progress) s.progress = {};
        if (!Array.isArray(s.milestones)) {
          const legacyGoal = s.parentGoal as { reward?: string } | undefined;
          s.milestones = legacyGoal?.reward
            ? [{ id: uid('m'), step: 10, reward: legacyGoal.reward }, ...DEFAULT_MILESTONES.slice(1)]
            : DEFAULT_MILESTONES;
        }
        delete s.parentGoal;

        return s as unknown as GameState;
      },
    },
  ),
);
