import { useState, type MouseEvent } from 'react';
import { useGameStore } from '@/core/store/useGameStore';
import { useSound } from '@/core/audio/useSound';
import { speechEngine } from '@/core/audio/SpeechEngine';
import { cn } from '@/core/utils/cn';
import styles from './Templates.module.css';

interface SpeakButtonProps {
  /** What to read aloud. */
  text: string;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * The tap-to-hear speaker next to text tasks and answers (PRD v4.0 §2.4).
 * Feedback per §3.3 SND_TTS_CLICK: a micro-click, then a yellow halo pulses
 * while the text is being read. Parents can hide these buttons to encourage
 * independent reading (`settings.ttsButtons`).
 */
export function SpeakButton({ text, size = 'sm', className }: SpeakButtonProps) {
  const enabled = useGameStore((s) => s.settings.ttsButtons);
  const voiceOn = useGameStore((s) => s.settings.voiceOn);
  const { playCode } = useSound();
  const [speaking, setSpeaking] = useState(false);

  if (!enabled || !voiceOn || !speechEngine.supported || !text) return null;

  const speak = (e: MouseEvent) => {
    // The button often sits inside a tappable answer card — don't answer.
    e.stopPropagation();
    playCode('SND_TTS_CLICK');
    setSpeaking(true);
    speechEngine.speak(text, () => setSpeaking(false));
  };

  return (
    <span
      role="button"
      tabIndex={0}
      data-tts-button
      className={cn(styles.speak, size === 'md' && styles.speakMd, speaking && styles.speaking, className)}
      aria-label={`Прочитати вголос: ${text}`}
      onClick={speak}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') speak(e as unknown as MouseEvent);
      }}
    >
      <span className="emoji" aria-hidden>
        🔊
      </span>
    </span>
  );
}
