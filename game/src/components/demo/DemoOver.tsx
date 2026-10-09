import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useT, useVoiceLang } from '@/core/translator';
import { useVoiceStopsOnLeave, voice } from '@/core/audio/voice';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { endDemo, goCreateAccount } from '@/core/app/demo';
import { usePageMeta } from '@/core/app/seo/usePageMeta';
import { Button } from '@/components/ui/Button';
import styles from './DemoOver.module.css';

/** A breath between the game going quiet and the voice beginning. */
const SPEAK_AFTER_MS = 500;

/**
 * The end of the trial game. It takes the game's place the moment the time is
 * up, so nothing runs or speaks underneath.
 *
 * The child did nothing wrong, and the screen must not feel like a door shut
 * in their face: it praises, says plainly that this was a trial and that what
 * was collected is not kept, and gives the child something to DO — call a
 * parent. No countdown, no «time is up», no «you can't». The same words are
 * read aloud, in the voice's language; the smaller text below is for the
 * parent who comes to look.
 */
export function DemoOver() {
  const t = useT();
  const sayT = useT(useVoiceLang());
  const theme = useActiveTheme();
  usePageMeta({ title: t('demo.over.title') });
  useVoiceStopsOnLeave();

  const tell = () => {
    if (voice.allowed()) voice.speak(`${sayT('demo.over.title')} ${sayT('demo.over.text')}`);
  };

  useEffect(() => {
    const id = window.setTimeout(tell, SPEAK_AFTER_MS);
    return () => window.clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.wrap}>
      <motion.div
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-over-title"
        initial={{ y: 30, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      >
        <motion.span className={`${styles.mascot} emoji`} aria-hidden animate={{ y: [0, -8, 0], rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
          {theme.mascot.emoji}
        </motion.span>
        <h1 id="demo-over-title" className={styles.title}>
          {t('demo.over.title')}
        </h1>
        <p className={styles.text}>{t('demo.over.text')}</p>
        <button type="button" className={styles.listen} onClick={tell}>
          <span className="emoji" aria-hidden>
            🔊
          </span>{' '}
          {t('demo.over.listen')}
        </button>

        <div className={styles.parents}>
          <p className={styles.parentsText}>{t('demo.over.parents')}</p>
          <Button block size="lg" icon="👨‍👩‍👧" onClick={goCreateAccount}>
            {t('demo.create')}
          </Button>
          <Button block variant="ghost" icon="🔑" onClick={endDemo}>
            {t('demo.over.login')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
