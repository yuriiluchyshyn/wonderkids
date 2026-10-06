import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TIP_PREFIX, useGameStore } from '@/core/store/useGameStore';
import { useVoiceSpeak } from '@/core/audio/useSpeech';
import { speechEngine } from '@/core/audio/SpeechEngine';
import styles from './CoachTips.module.css';

export interface CoachTip {
  /** Stable id — what is remembered once the child closes the tip. */
  id: string;
  /** CSS selector of the control the tip points at. */
  anchor: string;
  text: string;
}

interface CoachTipsProps {
  /** In the order they should be explained. */
  tips: CoachTip[];
  /** Hold the tips back (a level is being finished, a modal is open…). */
  enabled?: boolean;
  /** Wait before the first tip, e.g. until the task has been read out. */
  startDelayMs?: number;
  onOpenChange?: (open: boolean) => void;
}

interface Shown {
  tip: CoachTip;
  rect: DOMRect;
}

const RETRY_MS = 900;
const NEXT_TIP_MS = 450;
const PAD = 6;

function visibleRect(selector: string): DOMRect | null {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;
  if (rect.top < 0 || rect.bottom > window.innerHeight) {
    el.scrollIntoView({ block: 'center' });
    return el.getBoundingClientRect();
  }
  return rect;
}

/**
 * First-run guide to the buttons on a screen: one tip at a time, each pointing
 * at its control and read aloud. A tip stays until the child closes it, and a
 * closed tip never comes back — until a parent resets the tips in the cabinet
 * (they are stored with the child's save, see `store.markTipSeen`).
 */
export function CoachTips({ tips, enabled = true, startDelayMs = 700, onOpenChange }: CoachTipsProps) {
  const hasChild = useGameStore((s) => s.children.some((c) => c.id === s.activeChildId));
  const treasures = useGameStore((s) => s.treasures);
  const markTipSeen = useGameStore((s) => s.markTipSeen);
  const speak = useVoiceSpeak('taskIntro');
  const [shown, setShown] = useState<Shown | null>(null);

  const pending = useMemo(() => {
    const seen = new Set(treasures);
    return tips.filter((tip) => !seen.has(`${TIP_PREFIX}${tip.id}`));
  }, [tips, treasures]);
  const active = enabled && hasChild && pending.length > 0;
  // The search below must not restart on every render of the host screen
  // (it would never get past its start delay), only when the list changes.
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  const pendingIds = pending.map((tip) => tip.id).join('|');
  const started = useRef(false);

  // Look for the next unread tip whose control is on screen. Controls can
  // mount late (a speaker button appears with the task), so keep looking.
  useEffect(() => {
    if (!active || shown) return;
    const find = () => {
      for (const tip of pendingRef.current) {
        const rect = visibleRect(tip.anchor);
        if (rect) {
          started.current = true;
          setShown({ tip, rect });
          return;
        }
      }
    };
    let retry: number | undefined;
    // Only the first tip waits for the screen to settle; the next follow closely.
    const start = window.setTimeout(
      () => {
        find();
        retry = window.setInterval(find, RETRY_MS);
      },
      started.current ? NEXT_TIP_MS : startDelayMs,
    );
    return () => {
      window.clearTimeout(start);
      window.clearInterval(retry);
    };
  }, [active, shown, pendingIds, startDelayMs]);

  // Held back while a tip is up (e.g. the level just ended): put it away
  // unread, it returns next time.
  useEffect(() => {
    if (!enabled && shown) setShown(null);
  }, [enabled, shown]);

  const tipId = shown?.tip.id;
  useEffect(() => {
    onOpenChange?.(Boolean(tipId));
    if (shown) speak(shown.tip.text);
  }, [tipId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Follow the control if the page scrolls or the phone is rotated.
  useEffect(() => {
    if (!shown) return;
    const follow = () => {
      const el = document.querySelector<HTMLElement>(shown.tip.anchor);
      if (el) setShown({ tip: shown.tip, rect: el.getBoundingClientRect() });
    };
    window.addEventListener('resize', follow);
    window.addEventListener('scroll', follow, true);
    return () => {
      window.removeEventListener('resize', follow);
      window.removeEventListener('scroll', follow, true);
    };
  }, [tipId]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = useCallback(() => {
    if (!shown) return;
    speechEngine.cancel();
    markTipSeen(shown.tip.id);
    setShown(null);
  }, [shown, markTipSeen]);

  const below = shown ? shown.rect.top + shown.rect.height / 2 < window.innerHeight / 2 : true;

  return createPortal(
    <AnimatePresence>
      {shown && (
        <motion.div
          key={shown.tip.id}
          className={styles.layer}
          role="dialog"
          aria-label="Підказка"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          {/* The spotlight: everything but the control is dimmed. */}
          <div
            className={styles.spot}
            style={{
              left: shown.rect.left - PAD,
              top: shown.rect.top - PAD,
              width: shown.rect.width + PAD * 2,
              height: shown.rect.height + PAD * 2,
            }}
          />
          <motion.span
            className={`${styles.pointer} emoji`}
            style={{
              left: shown.rect.left + shown.rect.width / 2,
              top: below ? shown.rect.bottom + PAD : shown.rect.top - PAD - 44,
            }}
            animate={{ y: below ? [0, 10, 0] : [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 0.9 }}
            aria-hidden
          >
            {below ? '👆' : '👇'}
          </motion.span>
          <div
            className={styles.note}
            style={
              below
                ? { top: Math.min(shown.rect.bottom + 62, window.innerHeight - 170) }
                : { bottom: Math.min(window.innerHeight - shown.rect.top + 62, window.innerHeight - 170) }
            }
          >
            <p className={styles.text}>{shown.tip.text}</p>
            <button type="button" className={styles.ok} onClick={close}>
              Зрозуміло 👍
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
