import { useT } from '@/core/translator';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { voice } from '@/core/audio/voice';
import { perf } from '@/core/app/platform';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  icon?: string;
  children: ReactNode;
  /** Hide the close button (e.g. a gate the child must pass or cancel). */
  dismissible?: boolean;
  /**
   * The sheet itself never scrolls: it is a column that fits the screen, and
   * the content picks one part to scroll (`flex: 1; min-height: 0; overflow-y: auto`).
   * Avoids a scroll inside a scroll.
   */
  fit?: boolean;
}

/**
 * How a sheet comes and goes. A weaker device slides it without resizing it:
 * a sheet that changes size is drawn anew on every frame of the spring, and on
 * an Android phone the frames that are late show as holes in the sheet
 * (docs/browser-support.md). Nor does it fade on its own there: the dim
 * around it already fades, and a fading layer inside a fading layer needs one
 * more full-screen picture in the phone's memory for every frame.
 */
const SHEET = perf.lite
  ? {
      from: { y: 28 },
      to: { y: 0 },
      transition: { duration: 0.18, ease: 'easeOut' },
    }
  : {
      from: { y: 40, scale: 0.92, opacity: 0 },
      to: { y: 0, scale: 1, opacity: 1 },
      transition: { type: 'spring', stiffness: 320, damping: 26 },
    };

/** How many sheets are open: the page under them rests while there is one (`global.css`). */
let openSheets = 0;

function useRestingPage(open: boolean): void {
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    openSheets += 1;
    root.dataset.modal = 'open';
    return () => {
      openSheets -= 1;
      if (openSheets === 0) delete root.dataset.modal;
    };
  }, [open]);
}

/** Spring-animated bottom-safe modal sheet. */
export function Modal({ open, onClose, title, icon, children, dismissible = true, fit = false }: ModalProps) {
  const t = useT();
  // The page rests until the sheet is gone — not from the moment it starts to
  // leave: everything under it waking up while it still fades out made the
  // whole screen flicker on Android.
  const [leaving, setLeaving] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    setLeaving(!open);
  }
  useRestingPage(open || leaving);
  // Put away by the child (✕ or a tap beside it): whatever was being read out in it stops.
  const dismiss = () => {
    voice.stop();
    onClose?.();
  };
  // Portalled to <body>: a page is a stacking context of its own, so a sheet
  // left in place is sorted among that page's cards — under the sticky
  // play-time bar, and between layers that move. On Android the order was
  // decided anew on every frame: parts of the page kept showing through the
  // sheet (docs/browser-support.md).
  return createPortal(
    <AnimatePresence onExitComplete={() => setLeaving(false)}>
      {open && (
        <motion.div
          className={`${styles.overlay} modal-layer`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => dismissible && dismiss()}
        >
          <motion.div
            className={fit ? `${styles.sheet} ${styles.fit}` : styles.sheet}
            role="dialog"
            aria-modal="true"
            initial={SHEET.from}
            animate={SHEET.to}
            exit={SHEET.from}
            transition={SHEET.transition}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.head}>
              {title && (
                <h2 className={styles.title}>
                  {icon && (
                    <span className="emoji" aria-hidden>
                      {icon}
                    </span>
                  )}
                  {title}
                </h2>
              )}
              {dismissible && onClose && (
                <button className={styles.close} onClick={dismiss} aria-label={t('common.close')}>
                  ✕
                </button>
              )}
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
