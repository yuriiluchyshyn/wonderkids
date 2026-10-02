import { create } from 'zustand';
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

/** Child profile (PRD §10 / Tech Spec v2.1 §6.1). Age is derived from the birth month/year. */
export interface ChildProfile {
  name: string;
  /** Unique low-text handle shown in the child drawer (`^[a-z0-9_]{3,12}$`). */
  nickname: string;
  /** Simple 3–4 digit login PIN for the child portal (`''` = no PIN). */
  pin: string;
  birthYear: number;
  /** 1–12. */
  birthMonth: number;
  gender: Gender;
}

/**
 * A parent-configured reward earned when the artifact basket reaches a total
 * amount (PRD §7.1). Artifacts from ANY adventure count toward it. Per child.
 */
export interface Milestone {
  id: string;
  /** Total collected artifacts required to earn this reward. */
  amount: number;
  reward: string;
}

/**
 * Game completion mode (Tech Spec v2.1 §US-3 / FR-GAME-02/03).
 * - `dynamic_task_extension`: a transport roll-back (idle / blind guessing)
 *   adds +1 task to the queue. The level only completes once the queue is
 *   cleared AND the companion reaches the finish. This is the DEFAULT.
 * - `fixed_strict`: the level ends strictly after `minTasksPerLevel` tasks,
 *   regardless of roll-backs (gentler, for 3–4-year-olds).
 */
export type GameMode = 'dynamic_task_extension' | 'fixed_strict';

/** Allowed baseline task counts per level (Tech Spec v2.1 FR-GAME-04). */
export type MinTasks = 5 | 8 | 10 | 15 | 20;

/** Anti-guessing answer grid size — 9 (3×3, default) or 6 (3×2). */
export type ChoicesGridSize = 6 | 9;

/**
 * Non-aggressive screen-time limits (Tech Spec v2.1 FR-TIME-01). All values are
 * parent-configured minutes. The child never sees a countdown — only a themed
 * "fuel" gauge driven by `sessionDurationMinutes`.
 */
export interface TimeControl {
  /** Length of a single uninterrupted play session before the fuel runs out. */
  sessionDurationMinutes: number;
  /** Rest interval before the transport can be "refuelled" (play resumes). */
  cooldownMinutes: number;
  /** Hard ceiling of total play minutes per calendar day. */
  maxDailyMinutes: number;
}

export interface Settings {
  soundOn: boolean;
  voiceOn: boolean;
  voice: VoiceChannelState;
  showText: boolean;
  companionSpeed: CompanionSpeed;
  celebration: CelebrationStyle;
  /** Game completion mode (default `dynamic_task_extension`). */
  gameMode: GameMode;
  /** Baseline tasks required to finish a level (Tech Spec FR-GAME-04). */
  minTasksPerLevel: MinTasks;
  /** Anti-guessing grid size (9 = 3×3, default). */
  choicesGridSize: ChoicesGridSize;
  /** Non-aggressive screen-time / fuel limits. */
  timeControl: TimeControl;
}

/**
 * Runtime screen-time bookkeeping — persisted so a page reload can't reset the
 * timer or dodge a cooldown. Kept separate from the parent-set `TimeControl`.
 */
export interface ScreenTimeState {
  /** `YYYY-MM-DD` the `minutesUsedToday` counter applies to (auto-resets). */
  dayKey: string;
  minutesUsedToday: number;
  /** Epoch ms the current active session started, or null when idle. */
  sessionStartedAt: number | null;
  /** Epoch ms until which play is locked (resting), or null when ready. */
  cooldownUntil: number | null;
  /** Epoch ms the last session ended (parent insight). */
  lastSessionEndedAt: number | null;
}

/**
 * Everything that belongs to ONE child. A parent account holds up to five of
 * these; each child has their own theme, progress, artifacts and settings.
 */
export interface ChildState {
  id: string;
  profile: ChildProfile;
  themeId: ThemeId;
  artifacts: number;
  tasksCompleted: number;
  hintsSurfaced: number;
  /** Current path step per `${moduleId}:${subId}` (1-based). */
  progress: Record<string, number>;
  /** Collected treasure ids (`${themeId}:${treasureId}`) found in path chests. */
  treasures: string[];
  milestones: Milestone[];
  settings: Settings;
  screenTime: ScreenTimeState;
}

/**
 * The flattened view of the ACTIVE child, mirrored onto the top-level store so
 * the whole app can keep reading `s.artifacts`, `s.settings`, … unchanged while
 * multiple children live underneath in `children[]`.
 */
export interface ActiveChildView {
  profile: ChildProfile;
  themeId: ThemeId;
  artifacts: number;
  tasksCompleted: number;
  hintsSurfaced: number;
  progress: Record<string, number>;
  treasures: string[];
  milestones: Milestone[];
  settings: Settings;
  screenTime: ScreenTimeState;
}

/**
 * The fields that make up a save (persisted to the server). The active child's
 * mirror is NOT persisted — it is derived from `children`/`activeChildId`.
 */
export interface PersistableState {
  children: ChildState[];
  /** Which child is currently playing (null → the child-select gate shows). */
  activeChildId: string | null;
}

export interface GameState extends ActiveChildView, PersistableState {
  // ---- active-child actions (operate on the currently selected child) ----
  setProfile: (patch: Partial<ChildProfile>) => void;
  setTheme: (id: ThemeId) => void;
  awardArtifacts: (amount: number) => void;
  /** Add a treasure (by fully-qualified id) to the collection, deduped. */
  collectTreasure: (treasureKey: string) => void;
  recordTaskComplete: (opts: { hintUsed: boolean }) => void;
  advanceStep: (moduleId: string, subCategoryId: string, playedStep: number, maxSteps: number) => void;
  setStep: (moduleId: string, subCategoryId: string, step: number, maxSteps: number) => void;
  setMilestones: (milestones: Milestone[]) => void;
  updateSettings: (patch: Partial<Omit<Settings, 'voice' | 'timeControl'>>) => void;
  updateTimeControl: (patch: Partial<TimeControl>) => void;
  toggleVoice: (channel: VoiceChannel) => void;
  startPlaySession: () => void;
  enterCooldown: () => void;
  resetProgress: () => void;

  // ---- account-level actions (manage the set of children) ----
  /** Create a child (max 5) and make it active. Returns the new id or null. */
  addChild: (input: AddChildInput) => string | null;
  /** Remove a child; if it was active, falls back to the first remaining one. */
  removeChild: (id: string) => void;
  /** Switch the active (playing / edited) child. */
  setActiveChild: (id: string) => void;

  /** Replace the save with server-loaded data layered over defaults. */
  hydrate: (data: Partial<PersistableState> | Record<string, unknown>) => void;
  /** Reset the entire account back to empty (used on logout / fresh login). */
  resetAll: () => void;
}

export interface AddChildInput {
  profile?: Partial<ChildProfile>;
  themeId?: ThemeId;
  settings?: Partial<Settings>;
}

const CURRENT_YEAR = new Date().getFullYear();
const MAX_CHILDREN = 5;

const DEFAULT_PROFILE: ChildProfile = {
  name: 'Друже',
  nickname: '',
  pin: '',
  birthYear: CURRENT_YEAR - 5,
  birthMonth: 6,
  gender: 'girl',
};

const DEFAULT_TIME_CONTROL: TimeControl = {
  sessionDurationMinutes: 15,
  cooldownMinutes: 45,
  maxDailyMinutes: 60,
};

const DEFAULT_SETTINGS: Settings = {
  soundOn: true,
  voiceOn: true,
  voice: { ...DEFAULT_VOICE_STATE },
  showText: true,
  companionSpeed: 'medium',
  celebration: 'balloons',
  gameMode: 'dynamic_task_extension',
  minTasksPerLevel: 10,
  choicesGridSize: 9,
  timeControl: { ...DEFAULT_TIME_CONTROL },
};

const DEFAULT_MILESTONES: Milestone[] = [
  { id: 'm_cookie', amount: 30, reward: 'Спекти печиво разом 🍪' },
  { id: 'm_park', amount: 100, reward: 'Поїздка в парк розваг 🎡' },
  { id: 'm_trip', amount: 200, reward: 'Велика сімейна пригода 🎉' },
];

/** `YYYY-MM-DD` key used to reset the daily screen-time counter at midnight. */
export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function createScreenTime(): ScreenTimeState {
  return {
    dayKey: todayKey(),
    minutesUsedToday: 0,
    sessionStartedAt: null,
    cooldownUntil: null,
    lastSessionEndedAt: null,
  };
}

/** Normalise a profile as the parent types it (charset, PIN digits, age range). */
function sanitizeProfile(p: Partial<ChildProfile>): ChildProfile {
  const name = typeof p.name === 'string' ? p.name.trim() || 'Друже' : 'Друже';
  const nickname =
    typeof p.nickname === 'string'
      ? p.nickname.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 12)
      : '';
  const pin = typeof p.pin === 'string' ? p.pin.replace(/\D/g, '').slice(0, 4) : '';
  const birthMonth = Math.min(12, Math.max(1, Math.round(p.birthMonth ?? 6)));
  const birthYear = Math.min(
    CURRENT_YEAR,
    Math.max(CURRENT_YEAR - 14, Math.round(p.birthYear ?? CURRENT_YEAR - 5)),
  );
  const gender: Gender = p.gender === 'boy' ? 'boy' : 'girl';
  return { name, nickname, pin, birthYear, birthMonth, gender };
}

/** A fresh child with all defaults (plus any overrides from the parent form). */
function createChildState(input?: AddChildInput): ChildState {
  const settings = input?.settings ?? {};
  return {
    id: uid('child'),
    profile: sanitizeProfile({ ...DEFAULT_PROFILE, ...(input?.profile ?? {}) }),
    themeId: input?.themeId ?? DEFAULT_THEME_ID,
    artifacts: 0,
    tasksCompleted: 0,
    hintsSurfaced: 0,
    progress: {},
    treasures: [],
    milestones: DEFAULT_MILESTONES.map((m) => ({ ...m })),
    settings: {
      ...DEFAULT_SETTINGS,
      ...settings,
      voice: { ...DEFAULT_SETTINGS.voice, ...(settings.voice ?? {}) },
      timeControl: { ...DEFAULT_SETTINGS.timeControl, ...(settings.timeControl ?? {}) },
    },
    screenTime: createScreenTime(),
  };
}

/** Validate + fill a raw child object (from the server) over fresh defaults. */
function migrateChild(raw: Record<string, unknown>): ChildState {
  const base = createChildState();
  const r = raw as Partial<ChildState> & Record<string, unknown>;
  const settings = (r.settings ?? {}) as Partial<Settings>;
  return {
    id: typeof r.id === 'string' ? r.id : base.id,
    profile: sanitizeProfile({ ...base.profile, ...((r.profile as Partial<ChildProfile>) ?? {}) }),
    themeId: (r.themeId as ThemeId) ?? base.themeId,
    artifacts: typeof r.artifacts === 'number' ? r.artifacts : 0,
    tasksCompleted: typeof r.tasksCompleted === 'number' ? r.tasksCompleted : 0,
    hintsSurfaced: typeof r.hintsSurfaced === 'number' ? r.hintsSurfaced : 0,
    progress: r.progress && typeof r.progress === 'object' ? (r.progress as Record<string, number>) : {},
    treasures:
      Array.isArray(r.treasures) && r.treasures.every((t) => typeof t === 'string')
        ? (r.treasures as string[])
        : [],
    milestones:
      Array.isArray(r.milestones) &&
      r.milestones.every((m) => m && typeof (m as Milestone).amount === 'number')
        ? (r.milestones as Milestone[])
        : base.milestones,
    settings: {
      ...base.settings,
      ...settings,
      voice: { ...base.settings.voice, ...(settings.voice ?? {}) },
      timeControl: { ...base.settings.timeControl, ...(settings.timeControl ?? {}) },
    },
    screenTime:
      r.screenTime && typeof r.screenTime === 'object'
        ? { ...base.screenTime, ...(r.screenTime as Partial<ScreenTimeState>) }
        : base.screenTime,
  };
}

/** The active-child mirror derived from a child record. */
function viewOf(child: ChildState): ActiveChildView {
  return {
    profile: child.profile,
    themeId: child.themeId,
    artifacts: child.artifacts,
    tasksCompleted: child.tasksCompleted,
    hintsSurfaced: child.hintsSurfaced,
    progress: child.progress,
    treasures: child.treasures,
    milestones: child.milestones,
    settings: child.settings,
    screenTime: child.screenTime,
  };
}

/** Resolve the mirror for the active child (or safe defaults when none). */
function resolveView(children: ChildState[], activeChildId: string | null): ActiveChildView {
  const active = children.find((c) => c.id === activeChildId) ?? children[0];
  return viewOf(active ?? createChildState());
}

/** The active child record, if any. */
function activeChild(s: GameState): ChildState | undefined {
  return s.children.find((c) => c.id === s.activeChildId);
}

/** Write an updated child back into `children` and refresh the mirror. */
function commit(s: GameState, child: ChildState): Partial<GameState> {
  return {
    children: s.children.map((c) => (c.id === child.id ? child : c)),
    ...viewOf(child),
  };
}

/** Apply `fn` to the active child and commit; a no-op when no child is active. */
function patchActive(s: GameState, fn: (c: ChildState) => ChildState): Partial<GameState> {
  const c = activeChild(s);
  if (!c) return {};
  return commit(s, fn(c));
}

/** A brand-new account: no children yet (the parent adds the first one). */
function createInitialState(): PersistableState {
  return { children: [], activeChildId: null };
}

/**
 * Merge a (possibly partial / legacy) server payload into the multi-child
 * shape. Supports three inputs: the new `{children,activeChildId}` shape, the
 * legacy single-child blob (wrapped into one child), and empty/garbage.
 */
function fromPersisted(data: Partial<PersistableState> | Record<string, unknown> | null | undefined): PersistableState {
  if (!data || typeof data !== 'object') return createInitialState();
  const d = data as Record<string, unknown>;

  // New multi-child shape.
  if (Array.isArray(d.children)) {
    const children = (d.children as unknown[])
      .filter((c): c is Record<string, unknown> => Boolean(c) && typeof c === 'object')
      .map(migrateChild);
    const ids = new Set(children.map((c) => c.id));
    const activeChildId =
      typeof d.activeChildId === 'string' && ids.has(d.activeChildId)
        ? d.activeChildId
        : (children[0]?.id ?? null);
    return { children, activeChildId };
  }

  // Legacy single-child blob → wrap into one child, keep it active.
  if (d.profile || d.settings || d.progress || typeof d.artifacts === 'number') {
    const child = migrateChild(d);
    return { children: [child], activeChildId: child.id };
  }

  return createInitialState();
}

/** Extract just the persistable save from the live store (for syncing). */
export function selectPersistable(s: GameState): PersistableState {
  return { children: s.children, activeChildId: s.activeChildId };
}

/** Is a nickname already used by another child in THIS account? */
export function selectNicknameTaken(s: GameState, nickname: string, exceptId?: string): boolean {
  const n = nickname.trim().toLowerCase();
  if (!n) return false;
  return s.children.some((c) => c.id !== exceptId && c.profile.nickname === n);
}

export const useGameStore = create<GameState>()((set) => ({
  ...createInitialState(),
  ...resolveView([], null),

  setProfile: (patch) => set((s) => patchActive(s, (c) => ({ ...c, profile: sanitizeProfile({ ...c.profile, ...patch }) }))),

  setTheme: (id) => set((s) => patchActive(s, (c) => ({ ...c, themeId: id }))),

  awardArtifacts: (amount) =>
    set((s) => patchActive(s, (c) => ({ ...c, artifacts: c.artifacts + Math.max(0, amount) }))),

  collectTreasure: (treasureKey) =>
    set((s) =>
      patchActive(s, (c) =>
        c.treasures.includes(treasureKey) ? c : { ...c, treasures: [...c.treasures, treasureKey] },
      ),
    ),

  recordTaskComplete: ({ hintUsed }) =>
    set((s) =>
      patchActive(s, (c) => ({
        ...c,
        tasksCompleted: c.tasksCompleted + 1,
        hintsSurfaced: c.hintsSurfaced + (hintUsed ? 1 : 0),
      })),
    ),

  advanceStep: (moduleId, subCategoryId, playedStep, maxSteps) =>
    set((s) =>
      patchActive(s, (c) => {
        const key = pathKey(moduleId, subCategoryId);
        const current = c.progress[key] ?? 1;
        // Only the frontier advances; replaying an older step changes nothing.
        const next = Math.max(current, Math.min(maxSteps, playedStep + 1));
        return { ...c, progress: { ...c.progress, [key]: clampStep(next, maxSteps) } };
      }),
    ),

  setStep: (moduleId, subCategoryId, step, maxSteps) =>
    set((s) =>
      patchActive(s, (c) => ({
        ...c,
        progress: { ...c.progress, [pathKey(moduleId, subCategoryId)]: clampStep(step, maxSteps) },
      })),
    ),

  setMilestones: (milestones) =>
    set((s) =>
      patchActive(s, (c) => ({
        ...c,
        milestones: [...milestones]
          .map((m) => ({ ...m, amount: Math.max(1, Math.round(m.amount || 1)) }))
          .sort((a, b) => a.amount - b.amount),
      })),
    ),

  updateSettings: (patch) =>
    set((s) => patchActive(s, (c) => ({ ...c, settings: { ...c.settings, ...patch } }))),

  updateTimeControl: (patch) =>
    set((s) =>
      patchActive(s, (c) => ({
        ...c,
        settings: { ...c.settings, timeControl: { ...c.settings.timeControl, ...patch } },
      })),
    ),

  toggleVoice: (channel) =>
    set((s) =>
      patchActive(s, (c) => ({
        ...c,
        settings: { ...c.settings, voice: { ...c.settings.voice, [channel]: !c.settings.voice[channel] } },
      })),
    ),

  startPlaySession: () =>
    set((s) => {
      const c = activeChild(s);
      if (!c) return {};
      const now = Date.now();
      const key = todayKey();
      const st = c.screenTime;
      // Still resting — never start mid-cooldown.
      if (st.cooldownUntil && now < st.cooldownUntil) return {};
      const dayRolled = st.dayKey !== key;
      // A session is already running (survives reloads) — keep its start time.
      if (st.sessionStartedAt && !dayRolled) return {};
      return commit(s, {
        ...c,
        screenTime: {
          ...st,
          dayKey: key,
          minutesUsedToday: dayRolled ? 0 : st.minutesUsedToday,
          sessionStartedAt: now,
          cooldownUntil: null,
        },
      });
    }),

  enterCooldown: () =>
    set((s) => {
      const c = activeChild(s);
      if (!c) return {};
      const now = Date.now();
      const st = c.screenTime;
      const start = st.sessionStartedAt ?? now;
      const playedMin = Math.max(0, (now - start) / 60_000);
      const cooldownMs = Math.max(0, c.settings.timeControl.cooldownMinutes) * 60_000;
      const dayRolled = st.dayKey !== todayKey();
      return commit(s, {
        ...c,
        screenTime: {
          dayKey: todayKey(),
          minutesUsedToday: (dayRolled ? 0 : st.minutesUsedToday) + playedMin,
          sessionStartedAt: null,
          lastSessionEndedAt: now,
          cooldownUntil: now + cooldownMs,
        },
      });
    }),

  resetProgress: () =>
    set((s) =>
      patchActive(s, (c) => ({
        ...c,
        artifacts: 0,
        tasksCompleted: 0,
        hintsSurfaced: 0,
        progress: {},
        treasures: [],
      })),
    ),

  addChild: (input) => {
    let newId: string | null = null;
    set((s) => {
      if (s.children.length >= MAX_CHILDREN) return {};
      const child = createChildState(input);
      newId = child.id;
      return { children: [...s.children, child], activeChildId: child.id, ...viewOf(child) };
    });
    return newId;
  },

  removeChild: (id) =>
    set((s) => {
      const remaining = s.children.filter((c) => c.id !== id);
      const nextActive =
        s.activeChildId === id ? (remaining[0]?.id ?? null) : s.activeChildId;
      return {
        children: remaining,
        activeChildId: nextActive,
        ...resolveView(remaining, nextActive),
      };
    }),

  setActiveChild: (id) =>
    set((s) => {
      const c = s.children.find((x) => x.id === id);
      if (!c) return {};
      return { activeChildId: id, ...viewOf(c) };
    }),

  hydrate: (data) =>
    set(() => {
      const ps = fromPersisted(data);
      return { ...ps, ...resolveView(ps.children, ps.activeChildId) };
    }),

  resetAll: () =>
    set(() => ({ ...createInitialState(), ...resolveView([], null) })),
}));
