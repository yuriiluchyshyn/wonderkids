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
  ) {
    super(code);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  { method = 'GET', body, token }: {
    method?: string;
    body?: unknown;
    token?: string | null;
  } = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Network / server-down: surface a consistent, catchable error.
    throw new ApiError(0, 'network_error');
  }

  if (!res.ok) {
    let code = `http_${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) code = data.error;
    } catch {
      /* non-JSON error body — keep the generic code */
    }
    throw new ApiError(res.status, code);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  /** Email-only PARENT login: returns a token + user, creating the account if needed. */
  login(email: string) {
    return request<{ token: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: { email },
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
    return request<{ state: T | null }>('/api/state', { token });
  },

  /** Replace the signed-in user's saved state. */
  putState(token: string, state: unknown) {
    return request<{ ok: true; updatedAt: string }>('/api/state', {
      method: 'PUT',
      token,
      body: { state },
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
