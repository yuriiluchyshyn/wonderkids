import { useT } from '@/core/translator';
import { motion } from 'framer-motion';
import { useShowText } from '@/core/app/ui/useUiPrefs';
import type { SubCategory } from '@/core/game/kernel/types';
import { Button } from '@/components/ui/Button';
import { IntroDemo } from '@/components/templates/IntroDemo';
import styles from './IntroCard.module.css';

/** What a game shows before play: how it is played (an animated demo, if it has one), its intro, and the way in. */
export function IntroCard({ demo, text, onStart }: { demo?: SubCategory['demo']; text?: string; onStart: () => void }) {
  const t = useT();
  const showText = useShowText();
  return (
    <motion.div className={styles.introCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.introClose}>
        <button className={styles.introCloseBtn} onClick={onStart} aria-label={t('game.intro.close')}>
          ✕
        </button>
      </div>
      {demo && <IntroDemo demo={demo} />}
      {showText && text && <p className={styles.introText}>{text}</p>}
      <Button size="lg" icon="▶️" block onClick={onStart}>
        {t('game.intro.start')}
      </Button>
    </motion.div>
  );
}
