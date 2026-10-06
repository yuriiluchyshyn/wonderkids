import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/core/store/useGameStore';
import { useVoiceSpeak } from '@/core/audio/useSpeech';
import { speechEngine } from '@/core/audio/SpeechEngine';
import styles from './TtsGuide.module.css';

const SEEN_KEY = 'wk-tts-guide-v1';
const MESSAGE = 'Не знаєш, що тут написано? Натисни на динамік — і я прочитаю!';
/** The guide leaves on its own if the child just keeps playing. */
const AUTO_HIDE_MS = 9000;

function alreadySeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function markSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* private mode — the guide simply shows again next time */
  }
}

/**
 * Onboarding guide for text-based games (PRD v4.0 §2.4): on the very first run
 * an animated pointer bounces next to a speaker button and explains what it
 * does. Shown once per device; hidden when parents turned the buttons off.
 */
export function TtsGuide() {
  const enabled = useGameStore((s) => s.settings.ttsButtons && s.settings.voiceOn);
  const speak = useVoiceSpeak('taskIntro');
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!enabled || !speechEngine.supported || alreadySeen()) return;
    // Wait for the first task to render and its prompt to be read out.
    const show = window.setTimeout(() => {
      const button = document.querySelector<HTMLElement>('[data-tts-button]');
      if (!button) return;
      const r = button.getBoundingClientRect();
      setAnchor({ x: r.left + r.width / 2, y: r.bottom });
      speak(MESSAGE);
      markSeen();
    }, 2600);
    return () => window.clearTimeout(show);
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!anchor) return;
    const hide = window.setTimeout(() => setAnchor(null), AUTO_HIDE_MS);
    return () => window.clearTimeout(hide);
  }, [anchor]);

  return (
    <AnimatePresence>
      {anchor && (
        <motion.div
          className={styles.layer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onPointerDown={() => setAnchor(null)}
        >
          <motion.span
            className={`${styles.pointer} emoji`}
            style={{ left: anchor.x, top: anchor.y }}
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 0.9 }}
            aria-hidden
          >
            👆
          </motion.span>
          <p className={styles.note} style={{ top: Math.min(anchor.y + 64, window.innerHeight - 120) }}>
            {MESSAGE}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
