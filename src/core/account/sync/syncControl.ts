import { create } from 'zustand';

/**
 * Lets a screen pause the automatic debounced server-save (useRemoteSync). The
 * parent cabinet uses this so edits are only persisted when the parent taps
 * "Save" — not live on every keystroke. The child game keeps auto-saving.
 */
interface SyncControl {
  paused: boolean;
  setPaused: (paused: boolean) => void;
}

export const useSyncControl = create<SyncControl>((set) => ({
  paused: false,
  setPaused: (paused) => set({ paused }),
}));
