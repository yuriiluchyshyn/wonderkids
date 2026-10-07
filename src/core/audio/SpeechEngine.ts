/** Fetches a phrase as base64 MP3 from the cloud voice; rejects when unavailable. */
/** Language of a phrase. Everything is Ukrainian except the English-lesson cards. */
export type SpeechLang = 'uk' | 'en';

export type CloudVoice = (text: string, lang: SpeechLang) => Promise<string>;

/** Phrases kept in memory so repeats (prompts, hints) play instantly. */
const CLOUD_CACHE_LIMIT = 150;
/** If the cloud voice has not answered by then, the browser voice takes over. */
const CLOUD_TIMEOUT_MS = 3500;
/** A phrase that has not actually started sounding by then is treated as failed. */
const START_TIMEOUT_MS = 3000;
/** A moment of silence, played on the first touch to unlock the shared player. */
const SILENCE = 'data:audio/wav;base64,UklGRkQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';
const UNLOCK_EVENTS = ['pointerdown', 'touchend', 'click'] as const;

/**
 * Voice-First TTS (PRD §8.1).
 *
 * Phase 2 — a natural cloud voice (Google Cloud TTS via our own `/api/tts`
 * proxy) when the account has it switched on; Phase 1 — the browser's Web
 * Speech synthesiser otherwise, and as the automatic fallback whenever the
 * cloud voice is slow, offline or misconfigured. Callers never need to know
 * which one spoke.
 */
export class SpeechEngine {
  private readonly synth: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis
      : null;

  private cloud: CloudVoice | null = null;
  private readonly cloudCache = new Map<string, string>();
  /**
   * The one `<audio>` element every cloud phrase plays through. iOS only lets
   * an element play without a tap if that same element was once started by a
   * tap — so it is created and "blessed" on the first touch (`unlock`) and
   * reused, instead of making a new element per phrase.
   */
  private player: HTMLAudioElement | null = null;
  private unlocked = false;
  /** Bumped by every speak/cancel so a late cloud answer is dropped. */
  private turn = 0;
  /** Reports the end of the phrase in progress — exactly once, however it ends. */
  private pendingEnd: (() => void) | null = null;
  private watchdog: number | undefined;

  constructor() {
    if (typeof document === 'undefined') return;
    // Locking the phone or switching to another app must silence the voice —
    // browsers happily keep reading a queued utterance in the background.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.cancel();
    });
    window.addEventListener('pagehide', () => this.cancel());

    const unlock = () => {
      if (this.unlocked) return;
      const player = (this.player ??= new Audio());
      // Busy speaking already — this element is evidently allowed to play.
      if (this.pendingEnd) return;
      player.src = SILENCE;
      player
        .play()
        .then(() => {
          this.unlocked = true;
          if (!this.pendingEnd) player.pause();
          for (const type of UNLOCK_EVENTS) document.removeEventListener(type, unlock, true);
        })
        .catch(() => undefined);
    };
    for (const type of UNLOCK_EVENTS) document.addEventListener(type, unlock, true);
  }

  get supported(): boolean {
    return this.synth !== null || this.cloud !== null;
  }

  /** Switch the natural cloud voice on (pass a fetcher) or off (null). */
  setCloudVoice(cloud: CloudVoice | null): void {
    this.cloud = cloud;
    if (!cloud) this.cloudCache.clear();
  }

  /** Picks the best available voice of the language, falling back to any voice. */
  private pickVoice(lang: SpeechLang): SpeechSynthesisVoice | undefined {
    if (!this.synth) return undefined;
    const voices = this.synth.getVoices();
    return voices.find((v) => v.lang?.toLowerCase().startsWith(lang)) ?? (lang === 'uk' ? voices[0] : undefined);
  }

  /** Speaks `text`; `onEnd` fires when it finishes, is cut off, or cannot play. */
  speak(text: string, onEnd?: () => void, lang: SpeechLang = 'uk'): void {
    this.cancel();
    const turn = this.turn;
    this.pendingEnd = onEnd ?? (() => undefined);
    // Locked phone, another app in front: say nothing. Cutting a phrase off
    // reports its end, and whoever waited for it (a fact, then the next task)
    // would otherwise carry on reading into a dark screen.
    if (typeof document !== 'undefined' && document.hidden) {
      this.finish(turn);
      return;
    }
    if (!this.cloud) {
      this.speakWithBrowser(text, turn, lang);
      return;
    }

    let settled = false;
    const fallback = () => {
      if (settled || turn !== this.turn) return;
      settled = true;
      this.speakWithBrowser(text, turn, lang);
    };
    const timer = window.setTimeout(fallback, CLOUD_TIMEOUT_MS);

    this.fetchCloud(text, lang)
      .then((base64) => {
        window.clearTimeout(timer);
        if (settled || turn !== this.turn) return;
        settled = true;
        this.playWithElement(base64, text, turn, lang);
      })
      .catch(() => {
        window.clearTimeout(timer);
        fallback();
      });
  }

  /** The phrase of `turn` is over (played, failed or gave up): tell the caller once. */
  private finish(turn: number): void {
    if (turn !== this.turn) return;
    window.clearTimeout(this.watchdog);
    const done = this.pendingEnd;
    this.pendingEnd = null;
    done?.();
  }

  /**
   * Plays a cloud phrase with the shared `<audio>` element, and falls back to
   * the browser voice if that is refused or never starts. Deliberately NOT
   * through the Web Audio context the sound effects use: on an iPhone Web Audio
   * is silenced by the ring/silent switch, while an `<audio>` element keeps
   * playing.
   */
  private playWithElement(base64: string, text: string, turn: number, lang: SpeechLang): void {
    const audio = (this.player ??= new Audio());
    let started = false;
    const giveUp = () => {
      if (turn !== this.turn) return;
      window.clearTimeout(this.watchdog);
      audio.onended = audio.onerror = audio.onplaying = null;
      audio.pause();
      this.speakWithBrowser(text, turn, lang);
    };
    audio.onplaying = () => {
      started = true;
      window.clearTimeout(this.watchdog);
    };
    audio.onended = () => this.finish(turn);
    audio.onerror = giveUp;
    audio.src = `data:audio/mpeg;base64,${base64}`;
    // Autoplay blocked or decode error — let the browser voice try.
    audio.play().catch(giveUp);
    // "Allowed" but nothing ever comes out (seen on phones): do not leave the
    // caller waiting on a phrase that is not being spoken.
    this.watchdog = window.setTimeout(() => {
      if (!started) giveUp();
    }, START_TIMEOUT_MS);
  }

  private async fetchCloud(text: string, lang: SpeechLang): Promise<string> {
    const cacheKey = `${lang}|${text}`;
    const cached = this.cloudCache.get(cacheKey);
    if (cached) return cached;
    if (!this.cloud) throw new Error('cloud voice off');
    const base64 = await this.cloud(text, lang);
    if (this.cloudCache.size >= CLOUD_CACHE_LIMIT) {
      const oldest = this.cloudCache.keys().next().value;
      if (oldest !== undefined) this.cloudCache.delete(oldest);
    }
    this.cloudCache.set(cacheKey, base64);
    return base64;
  }

  private speakWithBrowser(text: string, turn: number, lang: SpeechLang): void {
    if (!this.synth) {
      this.finish(turn);
      return;
    }
    this.synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === 'en' ? 'en-US' : 'uk-UA';
    const voice = this.pickVoice(lang);
    if (voice) utter.voice = voice;
    // Slightly slower and higher — warm and clear for small ears.
    utter.rate = 0.95;
    utter.pitch = 1.15;
    utter.volume = 1;
    let started = false;
    utter.onstart = () => {
      started = true;
      window.clearTimeout(this.watchdog);
    };
    utter.onend = () => this.finish(turn);
    utter.onerror = () => this.finish(turn);
    this.synth.speak(utter);
    // A browser that silently refuses to speak fires no event at all.
    window.clearTimeout(this.watchdog);
    this.watchdog = window.setTimeout(() => {
      if (!started && !this.synth?.speaking) this.finish(turn);
    }, START_TIMEOUT_MS);
  }

  /** Stops whatever is being said. The phrase's `onEnd` still fires (cut off). */
  cancel(): void {
    const cut = this.pendingEnd;
    this.pendingEnd = null;
    this.turn += 1;
    window.clearTimeout(this.watchdog);
    if (this.player) {
      this.player.onended = this.player.onerror = this.player.onplaying = null;
      this.player.pause();
    }
    this.synth?.cancel();
    cut?.();
  }
}

export const speechEngine = new SpeechEngine();
