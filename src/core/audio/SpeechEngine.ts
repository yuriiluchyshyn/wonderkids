import { audioEngine } from './AudioEngine';

/** Fetches a phrase as base64 MP3 from the cloud voice; rejects when unavailable. */
export type CloudVoice = (text: string) => Promise<string>;

/** Phrases kept in memory so repeats (prompts, hints) play instantly. */
const CLOUD_CACHE_LIMIT = 150;
/** If the cloud voice has not answered by then, the browser voice takes over. */
const CLOUD_TIMEOUT_MS = 3500;

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
  private audio: HTMLAudioElement | null = null;
  /** Stops the cloud phrase playing through the shared audio context. */
  private stopClip: (() => void) | null = null;
  /** Bumped by every speak/cancel so a late cloud answer is dropped. */
  private turn = 0;

  constructor() {
    if (typeof document === 'undefined') return;
    // Locking the phone or switching to another app must silence the voice —
    // browsers happily keep reading a queued utterance in the background.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.cancel();
    });
    window.addEventListener('pagehide', () => this.cancel());
  }

  get supported(): boolean {
    return this.synth !== null || this.cloud !== null;
  }

  /** Switch the natural cloud voice on (pass a fetcher) or off (null). */
  setCloudVoice(cloud: CloudVoice | null): void {
    this.cloud = cloud;
    if (!cloud) this.cloudCache.clear();
  }

  /** Picks the best available Ukrainian voice, falling back to any voice. */
  private pickVoice(): SpeechSynthesisVoice | undefined {
    if (!this.synth) return undefined;
    const voices = this.synth.getVoices();
    return voices.find((v) => v.lang?.toLowerCase().startsWith('uk')) ?? voices[0];
  }

  /** Speaks `text`; `onEnd` fires when it finishes, is cut off, or cannot play. */
  speak(text: string, onEnd?: () => void): void {
    this.cancel();
    const turn = this.turn;
    if (!this.cloud) {
      this.speakWithBrowser(text, onEnd);
      return;
    }

    let settled = false;
    const fallback = () => {
      if (settled || turn !== this.turn) return;
      settled = true;
      this.speakWithBrowser(text, onEnd);
    };
    const timer = window.setTimeout(fallback, CLOUD_TIMEOUT_MS);

    this.fetchCloud(text)
      .then((base64) => {
        window.clearTimeout(timer);
        if (settled || turn !== this.turn) return;
        settled = true;
        this.playCloud(base64, text, turn, onEnd);
      })
      .catch(() => {
        window.clearTimeout(timer);
        fallback();
      });
  }

  /**
   * Plays a cloud phrase through the sound effects' own audio context: speech
   * and effects then share one audio session, so on phones neither silences
   * the other and no tap is needed per phrase. An `<audio>` element is the
   * fallback, and the browser voice the last resort.
   */
  private playCloud(base64: string, text: string, turn: number, onEnd?: () => void): void {
    audioEngine
      .playEncoded(base64)
      .then((clip) => {
        if (turn !== this.turn) {
          clip.stop();
          return;
        }
        this.stopClip = clip.stop;
        void clip.ended.then(() => {
          if (turn !== this.turn) return;
          this.stopClip = null;
          onEnd?.();
        });
      })
      .catch(() => {
        if (turn === this.turn) this.playWithElement(base64, text, turn, onEnd);
      });
  }

  private playWithElement(base64: string, text: string, turn: number, onEnd?: () => void): void {
    const audio = new Audio(`data:audio/mpeg;base64,${base64}`);
    this.audio = audio;
    const done = () => {
      if (this.audio === audio) this.audio = null;
      onEnd?.();
    };
    audio.onended = done;
    audio.onerror = done;
    audio.play().catch(() => {
      // Autoplay blocked or decode error — let the browser voice try.
      if (this.audio === audio) this.audio = null;
      if (turn === this.turn) this.speakWithBrowser(text, onEnd);
    });
  }

  private async fetchCloud(text: string): Promise<string> {
    const cached = this.cloudCache.get(text);
    if (cached) return cached;
    if (!this.cloud) throw new Error('cloud voice off');
    const base64 = await this.cloud(text);
    if (this.cloudCache.size >= CLOUD_CACHE_LIMIT) {
      const oldest = this.cloudCache.keys().next().value;
      if (oldest !== undefined) this.cloudCache.delete(oldest);
    }
    this.cloudCache.set(text, base64);
    return base64;
  }

  private speakWithBrowser(text: string, onEnd?: () => void): void {
    if (!this.synth) {
      onEnd?.();
      return;
    }
    this.synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'uk-UA';
    const voice = this.pickVoice();
    if (voice) utter.voice = voice;
    // Slightly slower and higher — warm and clear for small ears.
    utter.rate = 0.95;
    utter.pitch = 1.15;
    utter.volume = 1;
    if (onEnd) {
      utter.onend = onEnd;
      utter.onerror = onEnd;
    }
    this.synth.speak(utter);
  }

  cancel(): void {
    this.turn += 1;
    this.stopClip?.();
    this.stopClip = null;
    if (this.audio) {
      this.audio.onended = null;
      this.audio.onerror = null;
      this.audio.pause();
      this.audio = null;
    }
    this.synth?.cancel();
  }
}

export const speechEngine = new SpeechEngine();
