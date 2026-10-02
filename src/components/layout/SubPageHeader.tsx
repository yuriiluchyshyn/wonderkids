import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './SubPageHeader.module.css';

interface SubPageHeaderProps {
  title: string;
  icon: string;
  /** Where the back arrow goes. `null` hides it entirely (e.g. parent portal). */
  backTo?: string | null;
}

/** Section header with an optional back arrow. */
export function SubPageHeader({ title, icon, backTo = '/' }: SubPageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className={styles.header}>
      {backTo !== null && (
        <motion.button
          className={styles.back}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(backTo)}
          aria-label="Назад"
        >
          ⬅️
        </motion.button>
      )}
      <h1 className={styles.title}>
        <span className="emoji" aria-hidden>
          {icon}
        </span>{' '}
        {title}
      </h1>
    </div>
  );
}
