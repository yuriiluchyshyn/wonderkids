import { useT } from '@/core/i18n';
import { usePageMeta } from '@/core/app/seo/usePageMeta';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AudioSettings } from '@/components/settings/AudioSettings';
import styles from '@/components/layout/SubPageHeader.module.css';

/** Dedicated audio & text settings page (hidden sub-page of settings). */
export function AudioPage() {
  const t = useT();
  usePageMeta({ title: t('page.audio') });
  const navigate = useNavigate();
  return (
    <div className="page stack">
      <div className={styles.header}>
        <motion.button
          className={styles.back}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/parent')}
          aria-label={t('page.audioBack')}
        >
          ⬅️
        </motion.button>
        <h1 className={styles.title}>
          <span className="emoji" aria-hidden>
            🔊
          </span>{' '}
          {t('page.audio')}
        </h1>
      </div>
      <AudioSettings />
    </div>
  );
}
