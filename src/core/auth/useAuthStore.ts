import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, ApiError, type AuthUser } from '@/core/api/client';
import { useGameStore } from '@/core/store/useGameStore';

/** Human-friendly messages for the error codes the API can return on login. */
const LOGIN_ERRORS: Record<string, string> = {
  invalid_email: 'Схоже, це не схоже на електронну пошту. Перевір, будь ласка.',
  invalid_pin: 'Невірний PIN. Спробуй ще раз або спитай у батьків.',
  invalid_credentials: 'Перевір нік і PIN, будь ласка.',
  child_not_found: 'Схоже, такого гравця ще немає. Попроси батьків створити тобі акаунт 👨‍👩‍👧',
  network_error: 'Не вдалося зв’язатися із сервером. Він увімкнений?',
  login_failed: 'Щось пішло не так на сервері. Спробуй ще раз.',
};

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  /** Set for a child session — which child to auto-select after state loads. */
  childId: string | null;
  pending: boolean;
  error: string | null;

  /** Parent email-only login. Returns true on success. */
  login: (email: string) => Promise<boolean>;
  /** Child login by unique nickname + parent-set PIN. */
  childLogin: (identifier: string, pin: string) => Promise<boolean>;
  /** Clear the session and wipe the in-memory save. */
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      childId: null,
      pending: false,
      error: null,

      login: async (email) => {
        set({ pending: true, error: null });
        try {
          const { token, user } = await api.login(email);
          // Parent session → no child auto-selected.
          set({ token, user, childId: null, pending: false, error: null });
          return true;
        } catch (err) {
          const code = err instanceof ApiError ? err.code : 'login_failed';
          set({
            pending: false,
            error: LOGIN_ERRORS[code] ?? LOGIN_ERRORS.login_failed,
          });
          return false;
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
            error: LOGIN_ERRORS[code] ?? LOGIN_ERRORS.login_failed,
          });
          return false;
        }
      },

      logout: () => {
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
