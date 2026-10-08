import { create } from 'zustand';
import type { ThemeId } from '@/core/theme/theme.types';
import {
  DEFAULT_VOICE_STATE,
  type VoiceChannel,
  type VoiceChannelState,
} from '@/core/audio/voiceChannels';
import { clampStep, pathKey } from '@/core/child/progress/path';
import { playsKey } from '@/core/child/progress/plays';
import { balanceOf, itemCost, lossKey, ownedKey, sellPrice, stationCost, stationKey } from '@/core/child/world/world';
import { keysOf } from '@/core/child/world/games';
import { DEFAULT_CURRENCY, isCurrency, type CurrencyId } from '@/core/game/content/currency';
import { uid } from '@/core/utils/random';
// Note: no DEFAULT_THEME_ID import — a child's theme is `null` until chosen;
// useActiveTheme resolves null → the neutral galaxy skin.

/**
 * Rate at which the companion rolls back during inactivity (PRD §4.1). The
 * actual timings live in `components/game/useIdleRollback.ts`.
 */
export type CompanionSpeed = 'off' | 'verySlow' | 'slow' | 'medium' | 'fast';

/** Prefix of the "this tip has been read" keys kept in `treasures`. */
export const TIP_PREFIX = 'tip:';

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
  /** Simple 3–4 digit PIN for the in-account profile switcher (`''` = none). */
  pin: string;
  /** Optional login email the parent assigns to the child (`''` = none). */
  email: string;
  /** Login password set by the parent — the child signs in with nick/email + this. */
  password: string;
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
  /**
   * @deprecated Levels are always dynamic now (a missed task comes back once);
   * the parent no longer chooses. Kept so existing saves keep their shape.
   */
  gameMode: GameMode;
  /**
   * @deprecated PRD v4.0 §2.3 removed the manual task-count setting: a level's
   * length now comes from the game config (5–8, shrinking to the unique tasks
   * available). Kept only so existing saves keep their shape.
   */
  minTasksPerLevel: MinTasks;
  /**
   * Show the tap-to-hear speaker buttons next to text tasks and answers
   * (PRD v4.0 §2.4). Parents switch it off to encourage independent reading.
   */
  ttsButtons: boolean;
  /** Anti-guessing grid size (9 = 3×3, default). */
  choicesGridSize: ChoicesGridSize;
  /** Tell the short fact after a right answer. Off — the next task starts at once. */
  funFacts: boolean;
  /** The money the shop game counts in. */
  currency: CurrencyId;
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
  /**
   * Epoch ms the CURRENT running play segment started, or null while paused
   * (child left the game screen / tab hidden). Time is only ever counted while
   * this is non-null — never while the browser merely sits open.
   */
  sessionStartedAt: number | null;
  /**
   * Active play time already banked in THIS session from earlier segments
   * (before the current pause/resume). Total session time = this + the live
   * running segment. Reset to 0 when a session ends (cooldown) or is topped up.
   */
  sessionElapsedMs: number;
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
  /** Chosen theme, or `null` until the child picks one (→ neutral galaxy). */
  themeId: ThemeId | null;
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
  themeId: ThemeId | null;
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
  /**
   * Exchange artifacts for an item of the child's world. The lifetime total
   * (`artifacts`) is kept; the purchase is remembered and everything on screen
   * — counters and family goals alike — shows the balance "earned − spent"
   * (`useBalance`). So a purchase really does set the goals back.
   * Returns false when it cannot be afforded or is already owned.
   */
  buyWorldItem: (themeId: string, id: string, planet?: number) => boolean;
  /**
   * Sell a built item back. Only `sellPrice` returns to the purse — the
   * difference is remembered as a loss. Returns what was refunded (0 = not owned).
   */
  sellWorldItem: (themeId: string, id: string, planet?: number) => number;
  /**
   * Exchange keys of knowledge for a station on `planet`. Returns false when
   * there are too few keys or the station is already open.
   */
  openStation: (id: string, planet?: number) => boolean;
  /**
   * The child closed an onboarding tip — never show it again. Remembered as a
   * `tip:<id>` key inside `treasures` (like world purchases), so it syncs to
   * the account and a parent can reset it from their cabinet.
   */
  markTipSeen: (tipId: string) => void;
  /** Parent: show every onboarding tip to the active child again. */
  resetTips: () => void;
  recordTaskComplete: (opts: { hintUsed: boolean }) => void;
  advanceStep: (moduleId: string, subCategoryId: string, playedStep: number, maxSteps: number) => void;
  /** Count a finished level of a game (feeds the world the child builds). */
  recordLevelComplete: (moduleId: string, subCategoryId: string) => void;
  setStep: (moduleId: string, subCategoryId: string, step: number, maxSteps: number) => void;
  setMilestones: (milestones: Milestone[]) => void;
  updateSettings: (patch: Partial<Omit<Settings, 'voice' | 'timeControl'>>) => void;
  updateTimeControl: (patch: Partial<TimeControl>) => void;
  toggleVoice: (channel: VoiceChannel) => void;
  /**
   * Mirror the server's play-time numbers for a child (PRD v4.0 §2.2 — the
   * backend is the source of truth). `running` re-anchors the local clock that
   * animates the gauge between heartbeats.
   */
  applyServerScreenTime: (childId: string, view: ServerScreenTime, running: boolean) => void;
  startPlaySession: () => void;
  /** Pause counting (bank the running segment) without ending the session. */
  pausePlaySession: () => void;
  enterCooldown: () => void;
  /**
   * Parent override: give the active child a fresh tank right now — lift any
   * rest cooldown, clear the running session and zero today's used minutes.
   */
  resetScreenTime: () => void;
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

/** The play-time part of a `/api/v1/session/*` response. */
export interface ServerScreenTime {
  in_cooldown: boolean;
  cooldown_remaining_seconds: number;
  screen_time: {
    dayKey: string;
    minutesUsedToday: number;
    sessionElapsedMs: number;
    lastSessionEndedAt: number | null;
  };
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
  email: '',
  password: '',
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
  ttsButtons: true,
  funFacts: true,
  currency: DEFAULT_CURRENCY,
  timeControl: { ...DEFAULT_TIME_CONTROL },
};

const DEFAULT_MILESTONES: Milestone[] = [
  { id: 'm_cookie', amount: 30, reward: 'Спекти печиво разом 🍪' },
  { id: 'm_park', amount: 100, reward: 'Поїздка в парк розваг 🎡' },
  { id: 'm_trip', amount: 200, reward: 'Велика сімейна пригода 🎉' },
];

/**
 * Remember the active child's theme locally so the loading splash can show the
 * right spinner immediately on a cold reload — before the server save arrives.
 * A brand-new user (nothing stored) resolves to the neutral galaxy default.
 */
const LAST_THEME_KEY = 'wk-last-theme-v1';

function readLastTheme(): ThemeId | null {
  try {
    const v = typeof localStorage !== 'undefined' ? localStorage.getItem(LAST_THEME_KEY) : null;
    return v ? (v as ThemeId) : null;
  } catch {
    return null;
  }
}

function writeLastTheme(id: ThemeId | null): void {
  try {
    if (typeof localStorage === 'undefined') return;
    if (id) localStorage.setItem(LAST_THEME_KEY, id);
    else localStorage.removeItem(LAST_THEME_KEY);
  } catch {
    /* ignore storage errors */
  }
}

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
    sessionElapsedMs: 0,
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
  const email = typeof p.email === 'string' ? p.email.trim().toLowerCase().slice(0, 120) : '';
  const password = typeof p.password === 'string' ? p.password.slice(0, 64) : '';
  const birthMonth = Math.min(12, Math.max(1, Math.round(p.birthMonth ?? 6)));
  const birthYear = Math.min(
    CURRENT_YEAR,
    Math.max(CURRENT_YEAR - 14, Math.round(p.birthYear ?? CURRENT_YEAR - 5)),
  );
  const gender: Gender = p.gender === 'boy' ? 'boy' : 'girl';
  return { name, nickname, pin, email, password, birthYear, birthMonth, gender };
}

/** A fresh child with all defaults (plus any overrides from the parent form). */
function createChildState(input?: AddChildInput): ChildState {
  const settings = input?.settings ?? {};
  return {
    id: uid('child'),
    profile: sanitizeProfile({ ...DEFAULT_PROFILE, ...(input?.profile ?? {}) }),
    themeId: input?.themeId ?? null,
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
    themeId: (r.themeId as ThemeId | null) ?? null,
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
      funFacts: settings.funFacts ?? base.settings.funFacts,
      currency: isCurrency(settings.currency) ? settings.currency : base.settings.currency,
      voice: { ...base.settings.voice, ...(settings.voice ?? {}) },
      timeControl: { ...base.settings.timeControl, ...(settings.timeControl ?? {}) },
    },
    screenTime: migrateScreenTime(r.screenTime, base.screenTime),
  };
}

/**
 * Load persisted screen-time, but never resume a "running" segment across a
 * reload — the time between closing and reopening the app is NOT play time.
 * Any previously running segment is collapsed to paused (banked time kept), so
 * counting only ever restarts when the child actually re-enters a game.
 */
function migrateScreenTime(raw: unknown, base: ScreenTimeState): ScreenTimeState {
  if (!raw || typeof raw !== 'object') return base;
  const merged = { ...base, ...(raw as Partial<ScreenTimeState>) };
  return {
    ...merged,
    sessionElapsedMs: Math.max(0, merged.sessionElapsedMs ?? 0),
    // Treat a reload as a pause: drop the stale running segment.
    sessionStartedAt: null,
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
  // Seed the splash theme from the last session (null → galaxy for new users).
  themeId: readLastTheme(),

  setProfile: (patch) => set((s) => patchActive(s, (c) => ({ ...c, profile: sanitizeProfile({ ...c.profile, ...patch }) }))),

  setTheme: (id) =>
    set((s) => {
      writeLastTheme(id);
      return patchActive(s, (c) => ({ ...c, themeId: id }));
    }),

  awardArtifacts: (amount) =>
    set((s) => patchActive(s, (c) => ({ ...c, artifacts: c.artifacts + Math.max(0, amount) }))),

  collectTreasure: (treasureKey) =>
    set((s) =>
      patchActive(s, (c) =>
        c.treasures.includes(treasureKey) ? c : { ...c, treasures: [...c.treasures, treasureKey] },
      ),
    ),

  buyWorldItem: (themeId, id, planet = 1) => {
    let bought = false;
    set((s) =>
      patchActive(s, (c) => {
        const key = ownedKey(themeId, id, planet);
        const cost = itemCost(id, planet);
        // The purse is checked here, not in the UI: nothing is ever overdrawn.
        if (cost <= 0 || c.treasures.includes(key) || balanceOf(c.artifacts, c.treasures) < cost) return c;
        bought = true;
        return { ...c, treasures: [...c.treasures, key] };
      }),
    );
    return bought;
  },

  sellWorldItem: (themeId, id, planet = 1) => {
    let refund = 0;
    set((s) =>
      patchActive(s, (c) => {
        const key = ownedKey(themeId, id, planet);
        if (!c.treasures.includes(key)) return c;
        refund = sellPrice(id, planet);
        const loss = itemCost(id, planet) - refund;
        const stamp = `${Date.now().toString(36)}${uid('').slice(1, 4)}`;
        return {
          ...c,
          treasures: [...c.treasures.filter((t) => t !== key), ...(loss > 0 ? [lossKey(loss, stamp)] : [])],
        };
      }),
    );
    return refund;
  },

  openStation: (id, planet = 1) => {
    let opened = false;
    set((s) =>
      patchActive(s, (c) => {
        const key = stationKey(id, planet);
        const cost = stationCost(id, planet);
        if (cost <= 0 || c.treasures.includes(key) || keysOf(c.progress, c.treasures) < cost) return c;
        opened = true;
        return { ...c, treasures: [...c.treasures, key] };
      }),
    );
    return opened;
  },

  markTipSeen: (tipId) =>
    set((s) =>
      patchActive(s, (c) => {
        const key = `${TIP_PREFIX}${tipId}`;
        return c.treasures.includes(key) ? c : { ...c, treasures: [...c.treasures, key] };
      }),
    ),

  resetTips: () =>
    set((s) => patchActive(s, (c) => ({ ...c, treasures: c.treasures.filter((t) => !t.startsWith(TIP_PREFIX)) }))),

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

  recordLevelComplete: (moduleId, subCategoryId) =>
    set((s) =>
      patchActive(s, (c) => {
        const key = playsKey(moduleId, subCategoryId);
        return { ...c, progress: { ...c.progress, [key]: (c.progress[key] ?? 0) + 1 } };
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

  applyServerScreenTime: (childId, view, running) =>
    set((s) => {
      const c = s.children.find((ch) => ch.id === childId);
      if (!c) return {};
      const now = Date.now();
      // Server time → local time via the remaining duration, so a skewed device
      // clock can neither shorten nor stretch the rest.
      const cooldownUntil = view.in_cooldown ? now + view.cooldown_remaining_seconds * 1000 : null;
      const next: ChildState = {
        ...c,
        screenTime: {
          dayKey: view.screen_time.dayKey,
          minutesUsedToday: view.screen_time.minutesUsedToday,
          sessionElapsedMs: view.screen_time.sessionElapsedMs,
          lastSessionEndedAt: view.screen_time.lastSessionEndedAt,
          cooldownUntil,
          sessionStartedAt: running && !view.in_cooldown ? now : null,
        },
      };
      const children = s.children.map((ch) => (ch.id === childId ? next : ch));
      return childId === s.activeChildId ? { children, ...viewOf(next) } : { children };
    }),

  // The actions below drive the LOCAL clock only — an optimistic mirror that
  // keeps the gauge moving between heartbeats and while offline. The server
  // overwrites it on every /session response and never trusts it.
  //
  // Start/resume counting — ONLY called while the child is actively in a game
  // (and the tab is visible). Opens a fresh running segment; banked time is
  // preserved so pausing and resuming never loses or double-counts time.
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
      // A segment is already running — keep its start time (idempotent resume).
      if (st.sessionStartedAt && !dayRolled) return {};
      return commit(s, {
        ...c,
        screenTime: {
          ...st,
          dayKey: key,
          minutesUsedToday: dayRolled ? 0 : st.minutesUsedToday,
          // A new day starts a fresh tank; otherwise keep what was banked.
          sessionElapsedMs: dayRolled ? 0 : st.sessionElapsedMs,
          sessionStartedAt: now,
          cooldownUntil: null,
        },
      });
    }),

  // Pause counting without ending the session — called when the child leaves
  // the game screen or the tab goes to the background. Banks the running
  // segment so an open-but-idle browser never burns play time.
  pausePlaySession: () =>
    set((s) => {
      const c = activeChild(s);
      if (!c) return {};
      const st = c.screenTime;
      if (st.sessionStartedAt == null) return {}; // already paused — nothing to bank
      const now = Date.now();
      const dayRolled = st.dayKey !== todayKey();
      const segmentMs = Math.max(0, now - st.sessionStartedAt);
      return commit(s, {
        ...c,
        screenTime: {
          ...st,
          dayKey: todayKey(),
          minutesUsedToday: dayRolled ? 0 : st.minutesUsedToday,
          sessionElapsedMs: (dayRolled ? 0 : st.sessionElapsedMs) + segmentMs,
          sessionStartedAt: null,
        },
      });
    }),

  enterCooldown: () =>
    set((s) => {
      const c = activeChild(s);
      if (!c) return {};
      const now = Date.now();
      const st = c.screenTime;
      const runningMs = st.sessionStartedAt ? Math.max(0, now - st.sessionStartedAt) : 0;
      const playedMin = Math.max(0, (st.sessionElapsedMs + runningMs) / 60_000);
      const cooldownMs = Math.max(0, c.settings.timeControl.cooldownMinutes) * 60_000;
      const dayRolled = st.dayKey !== todayKey();
      return commit(s, {
        ...c,
        screenTime: {
          dayKey: todayKey(),
          minutesUsedToday: (dayRolled ? 0 : st.minutesUsedToday) + playedMin,
          sessionStartedAt: null,
          sessionElapsedMs: 0,
          lastSessionEndedAt: now,
          cooldownUntil: now + cooldownMs,
        },
      });
    }),

  resetScreenTime: () =>
    set((s) =>
      patchActive(s, (c) => ({
        ...c,
        screenTime: {
          ...c.screenTime,
          dayKey: todayKey(),
          minutesUsedToday: 0,
          sessionStartedAt: null,
          sessionElapsedMs: 0,
          cooldownUntil: null,
          lastSessionEndedAt: null,
        },
      })),
    ),

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
      writeLastTheme(c.themeId);
      return { activeChildId: id, ...viewOf(c) };
    }),

  hydrate: (data) =>
    set(() => {
      const ps = fromPersisted(data);
      const view = resolveView(ps.children, ps.activeChildId);
      writeLastTheme(view.themeId);
      return { ...ps, ...view };
    }),

  resetAll: () =>
    set(() => ({ ...createInitialState(), ...resolveView([], null) })),
}));
