import { useEffect, useState } from 'react';
import { api } from '@/core/api/client';
import { speechEngine } from '@/core/audio/SpeechEngine';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { useSyncControl } from '@/core/sync/syncControl';
import {
  useGameStore,
  selectPersistable,
  type PersistableState,
} from '@/core/store/useGameStore';

export type SyncStatus = 'idle' | 'loading' | 'ready' | 'error';

/** Debounce window for writing changes back to the server. */
const SAVE_DELAY_MS = 700;

/**
 * Keeps the game store in sync with the server for the signed-in user:
 *
 *  1. On login, loads the saved state and hydrates the store.
 *  2. While loaded, writes any store change back to the server (debounced).
 *
 * Returns the load status so the UI can show a splash until data is ready.
 */
export function useRemoteSync(): SyncStatus {
  const token = useAuthStore((s) => s.token);
  const [status, setStatus] = useState<SyncStatus>('idle');

  // --- Load on login (or token change) ---
  useEffect(() => {
    if (!token) {
      speechEngine.setCloudVoice(null);
      setStatus('idle');
      return;
    }

    let active = true;
    setStatus('loading');

    api
      .getState<PersistableState>(token)
      .then(({ state, features }) => {
        if (!active) return;
        // Natural cloud voice, when the admin switched it on for this account.
        speechEngine.setCloudVoice(features?.cloudTts ? (text, lang) => api.tts(token, text, lang) : null);
        // `state` is null for a brand-new user → hydrate falls back to defaults.
        useGameStore.getState().hydrate(state ?? {});
        // Child session: auto-select the child the token logged in as, so the
        // hub shows immediately (no profile picker).
        const childId = useAuthStore.getState().childId;
        if (childId) useGameStore.getState().setActiveChild(childId);
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('error');
      });

    return () => {
      active = false;
    };
  }, [token]);

  // --- Save on change (debounced), only once loaded ---
  useEffect(() => {
    if (!token || status !== 'ready') return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    const unsubscribe = useGameStore.subscribe((state) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        // The parent cabinet pauses auto-save (explicit "Save" button there).
        if (useSyncControl.getState().paused) return;
        api.putState(token, selectPersistable(state)).catch(() => {
          // Best-effort: a dropped save is retried on the next change. The
          // local store stays authoritative for the session.
        });
      }, SAVE_DELAY_MS);
    });

    return () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, [token, status]);

  return status;
}
