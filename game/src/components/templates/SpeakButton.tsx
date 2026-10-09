import { useT } from '@/core/translator';
import { useState, type MouseEvent } from 'react';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useSound } from '@/core/audio/useSound';
import type { SpeechLang } from '@/core/audio/SpeechEngine';
import { voice } from '@/core/audio/voice';
import { cn } from '@/core/utils/cn';
import styles from './Templates.module.css';

interface SpeakButtonProps {
  /** What to read aloud. */
  text: string;
  size?: 'sm' | 'md';
  className?: string;
  /** Language to read it in. Default: Ukrainian. */
  lang?: SpeechLang;
}

/**
 * The tap-to-hear speaker next to text tasks and answers (PRD v4.0 §2.4).
 * Feedback per §3.3 SND_TTS_CLICK: a micro-click, then a yellow halo pulses
 * while the text is being read. Parents can hide these buttons to encourage
 * independent reading (`settings.ttsButtons`).
 */
export function SpeakButton({ text, size = 'sm', className, lang }: SpeakButtonProps) {
  const t = useT();
  const enabled = useGameStore((s) => s.settings.ttsButtons);
  const voiceOn = useGameStore((s) => s.settings.voiceOn);
  const { playCode } = useSound();
  const [speaking, setSpeaking] = useState(false);

  if (!enabled || !voiceOn || !voice.supported || !text) return null;

  const speak = (e: MouseEvent) => {
    // The button often sits inside a tappable answer card — don't answer.
    e.stopPropagation();
    playCode('SND_TTS_CLICK');
    setSpeaking(true);
    voice.speak(text, () => setSpeaking(false), lang);
  };

  return (
    <span
      role="button"
      tabIndex={0}
      data-tts-button
      className={cn(styles.speak, size === 'md' && styles.speakMd, speaking && styles.speaking, className)}
      aria-label={t('tpl.readAloud', { text })}
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
