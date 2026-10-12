import { tApp, useDeviceLang, type AppKey } from '@/core/translator';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, ApiError, type AuthUser } from '@/core/account/api/client';
import { useGameStore } from '@/core/child/store/useGameStore';
import { signupSource } from '@/core/app/attribution';
import { auth0Enabled, auth0Logout } from './auth0';
import { isStale, markAuth, wipeDevice } from './wipe';

const AUTH_STORAGE_KEY = 'wonderkids-auth-v1';

/** The error codes the API can return on login that have a message of their own (`auth.error.<code>`). */
const LOGIN_ERRORS = new Set(['invalid_email', 'invalid_pin', 'invalid_credentials', 'child_not_found', 'network_error', 'login_failed', 'invalid_token', 'email_missing', 'email_not_verified', 'auth0_required', 'account_disabled']);

/** A human-friendly message for a login error, in the language of this device — nobody has signed in yet. */
const loginError = (code: string): string => tApp(useDeviceLang.getState().lang, `auth.error.${LOGIN_ERRORS.has(code) ? code : 'login_failed'}` as AppKey);

/** `google-oauth2|123…` → `google-oauth2`: the first part of an Auth0 user id. */
function auth0Provider(idToken: string): string | undefined {
  try {
    const { sub } = JSON.parse(atob(idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof sub === 'string' ? sub.split('|')[0] : undefined;
  } catch {
    return undefined;
  }
}

export type LoginOutcome =
  | { status: 'ok' }
  | { status: 'error' }
  | { status: 'not_found'; email: string; suggestion: string | null; suggestionExists: boolean };

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  /** Set for a child session — which child to auto-select after state loads. */
  childId: string | null;
  /** When this session began here (ms) — a sign-out or sign-in elsewhere after it ends it. */
  since: number | null;
  pending: boolean;
  error: string | null;

  /**
   * Parent email-only login. Signing in never creates an account: an unknown
   * address comes back as `not_found` (with a suggestion when the domain looks
   * mistyped) and is only registered when called again with `create`.
   */
  login: (email: string, create?: boolean) => Promise<LoginOutcome>;
  /**
   * Parent login through Auth0: trades the ID token for our own session. On
   * failure returns the error code (also shown through `error`), else null.
   */
  loginWithAuth0: (idToken: string) => Promise<string | null>;
  /** Child login by unique nickname + parent-set PIN. */
  childLogin: (identifier: string, pin: string) => Promise<boolean>;
  /**
   * Clear the session, the in-memory save and everything the device keeps
   * (storage, cookies, caches) — here and, through the shared mark, on the
   * other portal too. With Auth0 on, its session ends as well (the page
   * leaves for Auth0 and comes back to the child login).
   */
  logout: () => void;
  /** The server no longer accepts this session (401): forget it, so the login page takes over. */
  expire: (code?: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      childId: null,
      since: null,
      pending: false,
      error: null,

      login: async (email, create = false) => {
        set({ pending: true, error: null });
        try {
          const { token, user } = await api.login(email, create, signupSource());
          // Parent session → no child auto-selected.
          startSession(user.id);
          set({ token, user, childId: null, since: Date.now(), pending: false, error: null });
          return { status: 'ok' };
        } catch (err) {
          // Not an error to show: the page asks whether to create the account.
          if (err instanceof ApiError && err.code === 'account_not_found') {
            set({ pending: false, error: null });
            return {
              status: 'not_found',
              email: String(err.data.email ?? email),
              suggestion: typeof err.data.suggestion === 'string' ? err.data.suggestion : null,
              suggestionExists: err.data.suggestionExists === true,
            };
          }
          const code = err instanceof ApiError ? err.code : 'login_failed';
          set({
            pending: false,
            error: loginError(code),
          });
          return { status: 'error' };
        }
      },

      loginWithAuth0: async (idToken) => {
        set({ pending: true, error: null });
        try {
          const { token, user } = await api.auth0Login(idToken, signupSource());
          startSession(user.id);
          set({ token, user: { ...user, provider: auth0Provider(idToken) }, childId: null, since: Date.now(), pending: false, error: null });
          return null;
        } catch (err) {
          const code = err instanceof ApiError ? err.code : 'login_failed';
          set({ pending: false, error: loginError(code) });
          return code;
        }
      },

      childLogin: async (identifier, pin) => {
        set({ pending: true, error: null });
        try {
          const { token, user, childId } = await api.childLogin(identifier, pin);
          startSession(user.id);
          set({ token, user, childId, since: Date.now(), pending: false, error: null });
          return true;
        } catch (err) {
          const code = err instanceof ApiError ? err.code : 'login_failed';
          set({
            pending: false,
            error: loginError(code),
          });
          return false;
        }
      },

      logout: () => {
        const hadSession = Boolean(get().token);
        // Tell the other portal (and other tabs) this account is gone.
        markAuth(0);
        // Before the session is cleared: the parent login it reveals must
        // already know we are leaving. A child session ends Auth0 too — on a
        // shared tablet the parent's Auth0 session would otherwise sign the
        // same parent straight back in.
        if (hadSession && auth0Enabled) auth0Logout();
        // Drop the signed-in child's data so the next login starts clean.
        useGameStore.getState().resetAll();
        set({ token: null, user: null, childId: null, since: null, error: null });
        wipeDevice();
      },

      // Unlike `logout`, the Auth0 session is left alone: a parent whose session
      // of ours ran out is signed in again by Auth0 without typing anything.
      expire: (code) => {
        useGameStore.getState().resetAll();
        set({ token: null, user: null, childId: null, since: null, error: code ? loginError(code) : null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      // Only the session identity is persisted locally; the game save itself
      // now lives on the server.
      name: AUTH_STORAGE_KEY,
      partialize: (s) => ({ token: s.token, user: s.user, childId: s.childId, since: s.since }),
    },
  ),
);

/**
 * A new sign-in here: whatever another account left on this device goes, and
 * the other portal learns about it (a session there for another account ends).
 */
function startSession(user: number): void {
  const before = useAuthStore.getState().user?.id;
  if (before !== undefined && before !== user) {
    useGameStore.getState().resetAll();
    wipeDevice();
  }
  markAuth(user);
}

/**
 * Ended elsewhere — signed out, or another account signed in on the other
 * portal or in another tab: drop the session and wipe the device, quietly
 * (no trip to Auth0; whoever ended it already made it).
 */
export function dropStaleSession(): boolean {
  const { token, since, user } = useAuthStore.getState();
  if (!token || !isStale(since, user?.id)) return false;
  useGameStore.getState().resetAll();
  useAuthStore.setState({ token: null, user: null, childId: null, since: null, error: null });
  wipeDevice();
  return true;
}

/**
 * Keeps a tab in step with the others: checks the mark whenever the tab comes
 * back into view, and reloads when another tab of this portal signed in or
 * out (the persisted store does not follow other tabs by itself).
 */
export function watchSession(): void {
  const check = () => {
    if (document.visibilityState === 'visible') dropStaleSession();
  };
  document.addEventListener('visibilitychange', check);
  window.addEventListener('focus', check);
  window.addEventListener('storage', (e) => {
    if (e.key !== AUTH_STORAGE_KEY && e.key !== null) return;
    const token = (() => {
      try {
        return (JSON.parse(e.newValue ?? 'null')?.state?.token as string | null) ?? null;
      } catch {
        return null;
      }
    })();
    if (token !== useAuthStore.getState().token) window.location.reload();
  });
}

/** The fragment the parent cabinet opens the child portal with: `#child=<token>`. */
export const CHILD_HANDOFF = '#child=';

/**
 * A parent opened this tab from the cabinet to play as one of their children
 * (see `ParentDashboard`): take the child session from the URL fragment — which
 * never reaches a server — and wipe it from the address bar and history.
 */
export function adoptChildHandoff(): void {
  const { hash, pathname, search } = window.location;
  if (!hash.startsWith(CHILD_HANDOFF)) return;
  const token = hash.slice(CHILD_HANDOFF.length);
  window.history.replaceState(null, '', pathname + search);
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof payload.childId !== 'string') return;
    const user = Number(payload.sub);
    // Another account's leftovers on this device go before the child comes in.
    if (useAuthStore.getState().user?.id !== user) wipeDevice();
    useGameStore.getState().resetAll();
    useAuthStore.setState({ token, user: { id: user }, childId: payload.childId, since: Date.now(), error: null });
  } catch {
    /* not a token — ignore, the login page shows as usual */
  }
}
