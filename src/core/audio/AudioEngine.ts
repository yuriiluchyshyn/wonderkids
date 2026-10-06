/**
 * Programmatic sound synthesizer built on the Web Audio API (PRD §8.2).
 *
 * No media files are shipped: every sound effect is generated from oscillators
 * and gain envelopes, keeping cold-start fast and latency near-zero. The
 * AudioContext is created lazily on the first play call so it is unlocked by a
 * user gesture (browser autoplay policy).
 */

/** Pentatonic scale (C major pentatonic) used for the counting chimes. */
const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.6;
      this.master.connect(this.ctx.destination);
    }
    // Not only 'suspended': iOS parks the context as 'interrupted' whenever
    // another sound (a spoken phrase, a call) takes the audio session.
    if (this.ctx.state !== 'running') {
      void this.ctx.resume().catch(() => undefined);
    }
    return this.ctx;
  }

  /**
   * Call once at start-up. Every touch re-opens the context, so a sound that
   * fires later on its own (the victory jingle after a spoken fact) is never
   * swallowed because the context was left asleep.
   */
  installUnlock(): void {
    if (typeof document === 'undefined') return;
    const wake = () => this.ensureContext();
    for (const type of ['pointerdown', 'touchend', 'keydown'] as const) {
      document.addEventListener(type, wake, { capture: true, passive: true });
    }
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.ctx) this.ensureContext();
    });
  }

  /** Run `play` as soon as the context is actually producing sound. */
  private whenRunning(play: (ctx: AudioContext) => void): void {
    const ctx = this.ensureContext();
    if (ctx.state === 'running') {
      play(ctx);
      return;
    }
    void ctx
      .resume()
      .then(() => {
        if (ctx.state === 'running') play(ctx);
      })
      .catch(() => undefined);
  }

  /**
   * Play an encoded clip (a spoken phrase as base64 MP3) through the same
   * context as the sound effects. Sharing one context is what keeps effects
   * audible around speech on phones, and needs no fresh tap per clip. Rejects
   * when the context cannot run or the clip cannot be decoded.
   */
  async playEncoded(base64: string): Promise<{ stop: () => void; ended: Promise<void> }> {
    const ctx = this.ensureContext();
    if (ctx.state !== 'running') {
      await Promise.race([ctx.resume(), new Promise((resolve) => window.setTimeout(resolve, 400))]);
      if ((ctx.state as AudioContextState) !== 'running') throw new Error('audio context is not running');
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    const buffer = await ctx.decodeAudioData(bytes.buffer);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    // Speech goes out at full level, past the effects' master gain.
    source.connect(ctx.destination);
    let stopped = false;
    const ended = new Promise<void>((resolve) => {
      source.onended = () => {
        if (!stopped) resolve();
      };
    });
    source.start();
    return {
      stop: () => {
        stopped = true;
        try {
          source.stop();
        } catch {
          /* already finished */
        }
      },
      ended,
    };
  }

  /** Low-level helper: play one shaped tone. */
  private tone(opts: {
    freq: number;
    type?: OscillatorType;
    start?: number;
    duration: number;
    gain?: number;
    glideTo?: number;
  }): void {
    // Mobile browsers start the context suspended; a tone scheduled before it
    // is running is silently dropped — so wait, then play.
    this.whenRunning((ctx) => this.schedule(ctx, opts));
  }

  private schedule(
    ctx: AudioContext,
    opts: { freq: number; type?: OscillatorType; start?: number; duration: number; gain?: number; glideTo?: number },
  ): void {
    if (!this.master) return;
    const {
      freq,
      type = 'sine',
      start = 0,
      duration,
      gain = 0.5,
      glideTo,
    } = opts;

    const t0 = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (glideTo) {
      osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + duration);
    }

    // Fast attack, smooth exponential release — soft, never harsh.
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(env).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  /** A UI tap tick. */
  tap(): void {
    this.tone({ freq: 660, type: 'triangle', duration: 0.08, gain: 0.25 });
  }

  /** Pentatonic chime for tap-to-count — index selects the step. */
  chime(index: number): void {
    const freq = PENTATONIC[index % PENTATONIC.length];
    this.tone({ freq, type: 'sine', duration: 0.4, gain: 0.4 });
    this.tone({ freq: freq * 2, type: 'sine', duration: 0.3, gain: 0.12 });
  }

  /**
   * Counting chime whose pitch rises with how much is filled. `filled`/`total`
   * drives the pitch up ~1.5 octaves so the child hears the sound getting
   * "brighter / closer" as they approach the full count; the final element
   * resolves with a little sparkle.
   */
  countChime(filled: number, total: number, variant: 'a' | 'b' = 'a'): void {
    const ratio = total > 0 ? Math.min(1, filled / total) : 0;
    // Group A and group B count in two distinct voices so a child adding
    // "6 + 1" hears the two operands as different (G4 sine vs C5 triangle).
    const base = variant === 'b' ? 523.25 : 392;
    const voice: OscillatorType = variant === 'b' ? 'triangle' : 'sine';
    const freq = base * Math.pow(2, ratio * 1.5);
    this.tone({ freq, type: voice, duration: 0.32, gain: 0.4 });
    this.tone({ freq: freq * 2, type: 'sine', duration: 0.22, gain: 0.1 });
    if (total > 0 && filled >= total) {
      // Reached the full count — a bright resolving sparkle.
      this.tone({ freq: freq * 1.5, type: 'triangle', start: 0.08, duration: 0.34, gain: 0.3 });
    }
  }

  /** Happy "correct!" sparkle — rising two-note. */
  success(): void {
    this.tone({ freq: 659.25, type: 'triangle', duration: 0.14, gain: 0.4 });
    this.tone({ freq: 987.77, type: 'triangle', start: 0.12, duration: 0.3, gain: 0.4 });
  }

  // ---- Unified SFX set (PRD v4.0 §3.3) ----

  /** SND_SUCCESS: a bright major xylophone/harp run. */
  sndSuccess(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      this.tone({ freq, type: 'triangle', start: i * 0.07, duration: 0.32, gain: 0.5 });
      this.tone({ freq: freq * 2, type: 'sine', start: i * 0.07, duration: 0.18, gain: 0.08 });
    });
  }

  /** SND_ERROR: a soft double "boop-boop" — delicate, never startling. */
  sndError(): void {
    // Triangle + a higher pitch than before: still gentle, but it actually
    // carries on a small phone speaker.
    this.tone({ freq: 392, type: 'triangle', duration: 0.14, gain: 0.5, glideTo: 349 });
    this.tone({ freq: 349, type: 'triangle', start: 0.18, duration: 0.2, gain: 0.5, glideTo: 294 });
  }

  /** SND_DRAG_START: a light "pop" as a card lifts. */
  sndDragStart(): void {
    this.tone({ freq: 420, type: 'sine', duration: 0.09, gain: 0.28, glideTo: 760 });
  }

  /** SND_DROP_SLOT: a magnetic snap into place. */
  sndDropSlot(): void {
    this.tone({ freq: 900, type: 'square', duration: 0.035, gain: 0.12 });
    this.tone({ freq: 620, type: 'triangle', start: 0.03, duration: 0.14, gain: 0.3, glideTo: 520 });
  }

  /** SND_TTS_CLICK: a micro-click when a speaker button is tapped. */
  sndTtsClick(): void {
    this.tone({ freq: 1200, type: 'sine', duration: 0.045, gain: 0.16 });
  }

  /**
   * Gentle, friendly "let's look again" cue for a mistake. Deliberately warm
   * and curious — never a buzzer or loss sound (Zero-Aggression UX).
   */
  gentle(): void {
    this.tone({ freq: 392, type: 'sine', duration: 0.18, gain: 0.3 });
    this.tone({ freq: 440, type: 'sine', start: 0.14, duration: 0.26, gain: 0.3 });
  }

  /**
   * Soft "aww, not quite" cue for a wrong answer — a gentle descending
   * two-note sigh. Clearly reads as "sad / try again" while staying warm and
   * cartoonish, never a harsh buzzer (Zero-Aggression UX).
   */
  sad(): void {
    this.tone({ freq: 415.3, type: 'sine', duration: 0.22, gain: 0.3, glideTo: 392 });
    this.tone({ freq: 329.63, type: 'sine', start: 0.2, duration: 0.4, gain: 0.3, glideTo: 293.66 });
  }

  /**
   * Cheerful "level complete!" victory jingle — a rising arpeggio that lands
   * on a bright high note with a sparkle. Distinct from the single-answer
   * `success` sparkle so finishing a whole level feels like a big win.
   */
  win(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      this.tone({ freq, type: 'triangle', start: i * 0.11, duration: 0.26, gain: 0.34 });
    });
    // Final sparkle on top of the last note.
    this.tone({ freq: 1567.98, type: 'triangle', start: 0.44, duration: 0.5, gain: 0.3 });
    this.tone({ freq: 2093.0, type: 'sine', start: 0.5, duration: 0.4, gain: 0.14 });
  }

  /**
   * Warm "пара-па-пам" bedtime jingle for the fuel-depleted cutscene (Tech
   * Spec FR-TIME-03). Two soft pickup notes, a gentle lift, then a cosy
   * landing with a shimmer tail — reads as "time to rest", never an alarm.
   */
  bedtime(): void {
    this.tone({ freq: 587.33, type: 'triangle', start: 0.0, duration: 0.2, gain: 0.3 });
    this.tone({ freq: 587.33, type: 'triangle', start: 0.18, duration: 0.2, gain: 0.3 });
    this.tone({ freq: 698.46, type: 'triangle', start: 0.36, duration: 0.26, gain: 0.32 });
    this.tone({ freq: 523.25, type: 'triangle', start: 0.62, duration: 0.6, gain: 0.34 });
    this.tone({ freq: 1046.5, type: 'sine', start: 0.66, duration: 0.5, gain: 0.1 });
  }

  /** Balloon "ПОП!" burst. */
  pop(): void {
    this.tone({ freq: 900, type: 'square', duration: 0.06, gain: 0.3, glideTo: 180 });
  }

  /** Crunchy "хрум-хрум" of eating the apple. */
  crunch(): void {
    this.whenRunning((ctx) => this.crunchNow(ctx));
  }

  private crunchNow(ctx: AudioContext): void {
    if (!this.master) return;
    // Noise burst through a bandpass for a crispy texture.
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.18, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 1200;
    const env = ctx.createGain();
    env.gain.value = 0.5;
    src.connect(band).connect(env).connect(this.master);
    src.start();
  }

  /** Triumphant fanfare for the big win. */
  fanfare(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      this.tone({
        freq,
        type: 'sawtooth',
        start: i * 0.12,
        duration: 0.5,
        gain: 0.28,
      });
    });
  }

  /**
   * A treasure chest springing open — a wooden "creak" (noise glide) that
   * resolves into a bright rising "ta-da" lid pop. Warm and inviting, never
   * startling (Zero-Aggression UX).
   */
  chestOpen(): void {
    this.whenRunning((ctx) => this.creak(ctx));
    // Lid pop + rising sparkle as it opens.
    this.tone({ freq: 523.25, type: 'triangle', start: 0.22, duration: 0.18, gain: 0.32 });
    this.tone({ freq: 783.99, type: 'triangle', start: 0.34, duration: 0.3, gain: 0.3 });
  }

  private creak(ctx: AudioContext): void {
    if (!this.master) return;
    // Soft creak: short filtered noise sweeping upward (the lid lifting).
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.28, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) * 0.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.setValueAtTime(500, ctx.currentTime);
    band.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.26);
    const env = ctx.createGain();
    env.gain.value = 0.35;
    src.connect(band).connect(env).connect(this.master);
    src.start();
  }

  /**
   * A magical "treasure found!" shimmer — a cascade of bright bell tones that
   * reads as sparkly and precious when a new collectible is revealed.
   */
  treasure(): void {
    const notes = [1046.5, 1318.51, 1567.98, 2093.0];
    notes.forEach((freq, i) => {
      this.tone({ freq, type: 'sine', start: i * 0.07, duration: 0.42, gain: 0.26 });
      this.tone({ freq: freq * 1.5, type: 'triangle', start: i * 0.07 + 0.02, duration: 0.3, gain: 0.1 });
    });
  }
}

/** Shared singleton — a single AudioContext for the whole app. */
export const audioEngine = new AudioEngine();
audioEngine.installUnlock();
