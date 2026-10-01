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
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
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
    const ctx = this.ensureContext();
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
  countChime(filled: number, total: number): void {
    const ratio = total > 0 ? Math.min(1, filled / total) : 0;
    const base = 392; // G4
    const freq = base * Math.pow(2, ratio * 1.5);
    this.tone({ freq, type: 'sine', duration: 0.32, gain: 0.4 });
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

  /** Balloon "ПОП!" burst. */
  pop(): void {
    this.tone({ freq: 900, type: 'square', duration: 0.06, gain: 0.3, glideTo: 180 });
  }

  /** Crunchy "хрум-хрум" of eating the apple. */
  crunch(): void {
    const ctx = this.ensureContext();
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
}

/** Shared singleton — a single AudioContext for the whole app. */
export const audioEngine = new AudioEngine();
