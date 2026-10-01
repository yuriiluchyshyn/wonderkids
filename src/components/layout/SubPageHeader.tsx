import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './SubPageHeader.module.css';

interface SubPageHeaderProps {
  title: string;
  icon: string;
}

/** Back-to-hub header shared by the Vault and Parent pages. */
export function SubPageHeader({ title, icon }: SubPageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className={styles.header}>
      <motion.button
        className={styles.back}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/')}
        aria-label="Назад на головну"
      >
        ⬅️
      </motion.button>
      <h1 className={styles.title}>
        <span className="emoji" aria-hidden>
          {icon}
        </span>{' '}
        {title}
      </h1>
    </div>
  );
}
