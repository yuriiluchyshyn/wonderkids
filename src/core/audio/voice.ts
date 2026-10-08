import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useGameStore } from '@/core/child/store/useGameStore';
import { speechEngine, type SpeechLang } from './SpeechEngine';
import type { VoiceChannel } from './voiceChannels';

/**
 * The voice of the app — the ONE door to speech. Screens and components talk
 * to `voice` (or the hooks in `useSpeech`, which are thin wrappers over it)
 * and never to `speechEngine`, which only knows how to make a phrase sound
 * (cloud voice or the browser's).
 *
 * The rules live here, so no screen has to remember them:
 *
 * - **One phrase at a time.** A new phrase cuts off the one before it; nothing
 *   is ever queued behind a phrase that is still sounding.
 * - **A phrase belongs to the screen that said it.** Whatever is sounding stops
 *   when the child goes somewhere else: another page (`VoiceGuard`), the
 *   browser's Back, a sheet closed with ✕ (`Modal`), a screen or overlay that
 *   goes away (`useVoiceStopsOnLeave`).
 * - **Nothing speaks into a dark screen.** Locking the phone, switching to
 *   another app or tab, the page being frozen or put away — all stop the voice
 *   (and coming back never resumes a phrase half-way).
 * - **The parent's switches are checked here.** `say` looks at the master
 *   switch and the channel itself.
 *
 * A phrase's `onEnd` fires exactly once however it ends — spoken to the end,
 * cut off by any of the above, or never started — so a screen that waits for
 * it cannot get stuck.
 */
export const voice = {
  get supported(): boolean {
    return speechEngine.supported;
  },

  /** May this be said at all — the master switch and, if named, the channel's own. */
  allowed(channel?: VoiceChannel): boolean {
    const { settings } = useGameStore.getState();
    return settings.voiceOn && (!channel || settings.voice[channel]);
  },

  /** Says `text` if the parent's switches allow it, cutting off whatever was sounding. */
  say(text: string, channel?: VoiceChannel): void {
    if (voice.allowed(channel)) speechEngine.speak(text);
  },

  /**
   * Says `text` and reports when it is over — for a caller that has checked
   * the switches itself and waits for the last word (a fact, the win screen,
   * a card read in another language).
   */
  speak(text: string, onEnd?: () => void, lang?: SpeechLang): void {
    speechEngine.speak(text, onEnd, lang);
  },

  /** Silence, now. Safe to call when nothing is sounding. */
  stop(): void {
    speechEngine.cancel();
  },
};

// Leaving by the browser's own doors. (The engine itself goes silent whenever
// the page is hidden; these are the cases a hidden page does not cover.)
if (typeof window !== 'undefined') {
  // Back / Forward: stop at once, before the old screen is even torn down.
  window.addEventListener('popstate', voice.stop);
  // The window lost the child's attention: another window, the task switcher.
  window.addEventListener('blur', voice.stop);
  // A background tab being frozen by the browser.
  document.addEventListener('freeze', voice.stop);
}

/**
 * Mounted once inside the router: every change of page stops the voice. A
 * layout effect, so it runs before the new page's own effects — the first
 * thing a page says is never the thing that gets cut.
 */
export function VoiceGuard(): null {
  const { pathname, search } = useLocation();
  useLayoutEffect(() => {
    voice.stop();
  }, [pathname, search]);
  return null;
}

/** For a screen or overlay that speaks: when it goes away, so does its voice. */
export function useVoiceStopsOnLeave(): void {
  useEffect(() => () => voice.stop(), []);
}
