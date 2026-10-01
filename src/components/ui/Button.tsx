import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/core/utils/cn';
import { useSound } from '@/core/audio/useSound';
import styles from './Button.module.css';

type Variant = 'primary' | 'accent' | 'ghost';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  size?: 'md' | 'lg';
  block?: boolean;
  icon?: string;
  /** Suppress the default tap sound (e.g. when the handler plays its own). */
  silent?: boolean;
  ariaLabel?: string;
  type?: 'button' | 'submit';
}

/**
 * Primary tactile button: large touch target, bouncy press feedback, and a
 * built-in tap sound. Single responsibility — presentation + press affordance.
 */
export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  block = false,
  icon,
  silent = false,
  ariaLabel,
  type = 'button',
}: ButtonProps) {
  const { play } = useSound();

  const handleClick = () => {
    if (!silent) play('tap');
    onClick?.();
  };

  return (
    <motion.button
      type={type}
      aria-label={ariaLabel}
      className={cn(styles.btn, styles[variant], size === 'lg' && styles.lg, block && styles.block)}
      whileTap={{ scale: 0.93 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 24 }}
      onClick={handleClick}
    >
      {icon && (
        <span className={cn(styles.icon, 'emoji')} aria-hidden>
          {icon}
        </span>
      )}
      {children}
    </motion.button>
  );
}
