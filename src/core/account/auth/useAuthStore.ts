import { tApp, useDeviceLang, type AppKey } from '@/core/i18n';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, ApiError, type AuthUser } from '@/core/account/api/client';
import { useGameStore } from '@/core/child/store/useGameStore';
import { signupSource } from '@/core/app/attribution';
import { auth0Enabled, auth0Logout } from './auth0';

/** The error codes the API can return on login that have a message of their own (`auth.error.<code>`). */
const LOGIN_ERRORS = new Set(['invalid_email', 'invalid_pin', 'invalid_credentials', 'child_not_found', 'network_error', 'login_failed', 'invalid_token', 'email_missing', 'email_not_verified', 'auth0_required']);

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
   * Clear the session and wipe the in-memory save. A parent who signed in
   * through Auth0 is also signed out there (the page leaves for Auth0 and
   * comes back to the parent login).
   */
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      childId: null,
      pending: false,
      error: null,

      login: async (email, create = false) => {
        set({ pending: true, error: null });
        try {
          const { token, user } = await api.login(email, create, signupSource());
          // Parent session → no child auto-selected.
          set({ token, user, childId: null, pending: false, error: null });
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
          set({ token, user: { ...user, provider: auth0Provider(idToken) }, childId: null, pending: false, error: null });
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
          set({ token, user, childId, pending: false, error: null });
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
        const wasParent = Boolean(get().token) && !get().childId;
        // Before the session is cleared: the parent login it reveals must
        // already know we are leaving.
        if (wasParent && auth0Enabled) auth0Logout();
        // Drop the signed-in child's data so the next login starts clean.
        useGameStore.getState().resetAll();
        set({ token: null, user: null, childId: null, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      // Only the session identity is persisted locally; the game save itself
      // now lives on the server.
      name: 'wonderkids-auth-v1',
      partialize: (s) => ({ token: s.token, user: s.user, childId: s.childId }),
    },
  ),
);

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
    useGameStore.getState().resetAll();
    useAuthStore.setState({ token, user: { id: Number(payload.sub) }, childId: payload.childId, error: null });
  } catch {
    /* not a token — ignore, the login page shows as usual */
  }
}
