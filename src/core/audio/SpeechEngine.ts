/**
 * Voice-First TTS wrapper over the Web Speech API (PRD §8.1, Phase 1 offline).
 *
 * Reads task prompts aloud in Ukrainian (uk-UA) so a pre-reader can play alone.
 * Gracefully degrades to a no-op when the browser has no speech synthesis.
 */
export class SpeechEngine {
  private readonly synth: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis
      : null;

  get supported(): boolean {
    return this.synth !== null;
  }

  /** Picks the best available Ukrainian voice, falling back to any voice. */
  private pickVoice(): SpeechSynthesisVoice | undefined {
    if (!this.synth) return undefined;
    const voices = this.synth.getVoices();
    return (
      voices.find((v) => v.lang?.toLowerCase().startsWith('uk')) ??
      voices.find((v) => v.lang?.toLowerCase().startsWith('ru')) ??
      voices[0]
    );
  }

  speak(text: string): void {
    if (!this.synth) return;
    this.synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'uk-UA';
    const voice = this.pickVoice();
    if (voice) utter.voice = voice;
    // Slightly slower and higher — warm and clear for small ears.
    utter.rate = 0.95;
    utter.pitch = 1.15;
    utter.volume = 1;
    this.synth.speak(utter);
  }

  cancel(): void {
    this.synth?.cancel();
  }
}

export const speechEngine = new SpeechEngine();
