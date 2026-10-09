import { useT } from '@/core/translator';
import { goCreateAccount, useDemo } from '@/core/app/demo';
import styles from './DemoBanner.module.css';

/**
 * A quiet line on the hub of the trial game: this is a trial, nothing here is
 * kept — and the way to an account for the parent who is watching. It says
 * nothing about how much time is left; the row of tokens at the top does.
 */
export function DemoBanner() {
  const t = useT();
  const demo = useDemo((s) => s.active);
  if (!demo) return null;
  return (
    <div className={styles.banner}>
      <span className={styles.text}>
        <span className="emoji" aria-hidden>
          🚀
        </span>{' '}
        {t('demo.banner')}
      </span>
      <button type="button" className={styles.cta} onClick={goCreateAccount}>
        {t('demo.create')}
      </button>
    </div>
  );
}
