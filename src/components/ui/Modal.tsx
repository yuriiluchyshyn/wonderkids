import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  icon?: string;
  children: ReactNode;
  /** Hide the close button (e.g. a gate the child must pass or cancel). */
  dismissible?: boolean;
}

/** Spring-animated bottom-safe modal sheet. */
export function Modal({ open, onClose, title, icon, children, dismissible = true }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => dismissible && onClose?.()}
        >
          <motion.div
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            initial={{ y: 40, scale: 0.92, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
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
                <button className={styles.close} onClick={onClose} aria-label="Закрити">
                  ✕
                </button>
              )}
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
