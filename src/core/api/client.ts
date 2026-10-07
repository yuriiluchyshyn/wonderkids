/**
 * Thin fetch wrapper around the WonderKids API.
 *
 * In dev the base URL is empty, so requests go to `/api/...` on the Vite dev
 * server, which proxies them to the backend (see vite.config.ts). Set
 * `VITE_API_URL` to call a deployed API directly instead.
 */

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export interface AuthUser {
  id: number;
  /** Absent for child sessions (which authenticate against a child profile). */
  email?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    /** The rest of the error body, when the server sent details. */
    public data: Record<string, unknown> = {},
  ) {
    super(code);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  { method = 'GET', body, token, keepalive, adminKey }: {
    method?: string;
    body?: unknown;
    token?: string | null;
    /** Admin panel calls authenticate with the shared admin key instead. */
    adminKey?: string;
    /** Let the request outlive the page (used when the tab is closing). */
    keepalive?: boolean;
  } = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(adminKey ? { 'x-admin-key': adminKey } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      keepalive,
    });
  } catch {
    // Network / server-down: surface a consistent, catchable error.
    throw new ApiError(0, 'network_error');
  }

  if (!res.ok) {
    let code = `http_${res.status}`;
    let details: Record<string, unknown> = {};
    try {
      const data = await res.json();
      if (data?.error) code = data.error;
      if (data && typeof data === 'object') details = data;
    } catch {
      /* non-JSON error body — keep the generic code */
    }
    throw new ApiError(res.status, code, details);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Server-side play-time view returned by every `/api/v1/session/*` call. */
export interface SessionView {
  child_profile_id: string;
  /** Seconds of play left right now (0 while resting). */
  remaining_time_seconds: number | null;
  session_remaining_seconds: number | null;
  daily_remaining_seconds: number | null;
  depleted: boolean;
  in_cooldown: boolean;
  cooldown_remaining_seconds: number;
  server_time: number;
  screen_time: {
    dayKey: string;
    minutesUsedToday: number;
    sessionElapsedMs: number;
    lastSessionEndedAt: number | null;
  };
}

/** `child_profile_id` is ignored for child sessions (the token decides). */
const sessionBody = (childId: string, extra: Record<string, unknown> = {}) => ({
  child_profile_id: childId,
  tz_offset_min: new Date().getTimezoneOffset(),
  ...extra,
});

export const api = {
  /**
   * Email-only PARENT login. An unknown address fails with `account_not_found`
   * (see `ApiError.data` for a typo suggestion); pass `create` to register it.
   */
  login(email: string, create = false) {
    return request<{ token: string; user: AuthUser; created: boolean }>('/api/auth/login', {
      method: 'POST',
      body: create ? { email, create: true } : { email },
    });
  },

  /** CHILD login by unique nickname + parent-set PIN. */
  childLogin(identifier: string, pin: string) {
    return request<{ token: string; childId: string; user: AuthUser }>('/api/auth/child-login', {
      method: 'POST',
      body: { identifier, pin },
    });
  },

  /** Load the signed-in user's saved state (`state` is `null` when empty). */
  getState<T>(token: string) {
    return request<{ state: T | null; features?: { cloudTts?: boolean } }>('/api/state', { token });
  },

  /** One phrase from the natural cloud voice, as base64 MP3. */
  async tts(token: string, text: string, lang: 'uk' | 'en' = 'uk') {
    const { audio } = await request<{ audio: string }>('/api/tts', {
      method: 'POST',
      token,
      body: lang === 'uk' ? { text } : { text, lang },
    });
    return audio;
  },

  /** Replace the signed-in user's saved state. */
  putState(token: string, state: unknown) {
    return request<{ ok: true; updatedAt: string }>('/api/state', {
      method: 'PUT',
      token,
      body: { state },
    });
  },

  /** A play segment begins: returns the child's remaining play time. */
  sessionStart(token: string, childId: string) {
    return request<SessionView>('/api/v1/session/start', {
      method: 'POST',
      token,
      body: sessionBody(childId),
    });
  },

  /**
   * Still playing (every 30 s). `end`: 'pause' when leaving the game,
   * 'depleted' once the bedtime hand-off is done.
   */
  sessionHeartbeat(token: string, childId: string, end?: 'pause' | 'depleted', keepalive = false) {
    return request<SessionView>('/api/v1/session/heartbeat', {
      method: 'PUT',
      token,
      keepalive,
      body: sessionBody(childId, end ? { end } : {}),
    });
  },

  /** Parent top-up: refill the tank and clear the cooldown. */
  sessionReset(token: string, childId: string) {
    return request<SessionView>('/api/v1/session/reset', {
      method: 'POST',
      token,
      body: sessionBody(childId),
    });
  },

  /** Check whether a child nickname is free (excludes the caller's account). */
  checkNickname(token: string, nick: string) {
    return request<{ available: boolean }>(
      `/api/nickname?nick=${encodeURIComponent(nick)}`,
      { token },
    );
  },
};

// ---------------------------------------------------------------------------
// Admin panel
// ---------------------------------------------------------------------------

export interface AdminChild {
  id: string;
  name: string;
  nickname: string;
  gender: string;
  birthYear: number | null;
  birthMonth: number | null;
  themeId: string | null;
  createdAt: string;
  artifacts: number;
  tasksCompleted: number;
  hintsSurfaced: number;
  playedTodayMinutes: number;
  playedDay: string;
  lastSessionEndedAt: number | null;
  /** `${moduleId}:${subId}` → path step (or `…#plays` → sessions played). */
  progress: Record<string, number>;
}

export interface AdminAccount {
  id: number;
  email: string;
  createdAt: string;
  /** An older row sharing its mailbox with another account — safe to remove. */
  duplicateMailbox: boolean;
  /** Google Speech switched off for this account specifically. */
  speechOff: boolean;
  /** The key assigned to this account, if any (otherwise the global key applies). */
  speechKeyId: number | null;
  children: AdminChild[];
}

/** A stored Google Cloud API key. The secret itself never leaves the server. */
export interface SpeechKey {
  id: number;
  label: string;
  voice: string;
  /** Serves every account that has no key of its own. */
  isGlobal: boolean;
  /** Accounts this key is assigned to (empty for a global key). */
  accountIds: number[];
  /** Last characters of the secret, to tell keys apart. */
  keyHint: string;
  readable: boolean;
  createdAt: string;
}

export interface SpeechKeyDraft {
  label: string;
  /** Empty when editing = keep the stored secret. */
  key: string;
  voice: string;
  scope: 'global' | 'accounts';
  accountIds: number[];
}

export const adminApi = {
  listAccounts(adminKey: string) {
    return request<{ accounts: AdminAccount[] }>('/api/admin/users', { adminKey });
  },

  /** Remove an account together with its children and all their data. */
  deleteAccount(adminKey: string, parentId: number) {
    return request<{ ok: true }>(`/api/admin/users?id=${parentId}`, { method: 'DELETE', adminKey });
  },

  /** Switch Google Speech on/off for one account. */
  setSpeechEnabled(adminKey: string, parentId: number, speechEnabled: boolean) {
    return request<{ ok: true; speechOff: boolean }>('/api/admin/users', {
      method: 'PUT',
      adminKey,
      body: { parentId, speechEnabled },
    });
  },

  listSpeechKeys(adminKey: string) {
    return request<{ keys: SpeechKey[]; defaultVoice: string }>('/api/admin/speech', { adminKey });
  },

  /** Create (`id` null) or update a key together with who it serves. */
  saveSpeechKey(adminKey: string, id: number | null, draft: SpeechKeyDraft) {
    return request<{ id: number; keys: SpeechKey[] }>('/api/admin/speech', {
      method: id === null ? 'POST' : 'PUT',
      adminKey,
      body: { ...draft, ...(id === null ? {} : { id }) },
    });
  },

  deleteSpeechKey(adminKey: string, id: number) {
    return request<{ keys: SpeechKey[] }>(`/api/admin/speech?id=${id}`, { method: 'DELETE', adminKey });
  },

  testSpeechKey(adminKey: string, keyId: number) {
    return request<{ ok: boolean; audio?: string; error?: string; detail?: string }>('/api/admin/tts-test', {
      method: 'POST',
      adminKey,
      body: { keyId },
    });
  },
};
