import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import styles from './Paywall.module.css';

/**
 * A small window over the cabinet — the cabinet's own confirmations and the
 * adding of children (instead of the browser's grey `confirm`). Closed by
 * Escape and by a tap outside it, unless `locked` (while something is being paid).
 */
export function Dialog({ title, locked, onClose, children }: { title: string; locked?: boolean; onClose: () => void; children: ReactNode }) {
  const titleId = useId();
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !locked) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [locked, onClose]);

  // Focus lands inside the window, on its first button or field.
  useEffect(() => {
    sheet.current?.querySelector<HTMLElement>('button:not([disabled]), input')?.focus();
  }, []);

  return createPortal(
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !locked) onClose();
      }}
    >
      <motion.div
        ref={sheet}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      >
        <h3 id={titleId} className={styles.dialogTitle}>
          {title}
        </h3>
        {children}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
