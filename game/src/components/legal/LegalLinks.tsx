import { LEGAL_DOCS, legalUrl } from '@pulsar/platform';
import { siteOrigin } from '@/core/app/portal';
import { useLang, useT } from '@/core/translator';
import styles from './LegalLinks.module.css';

/**
 * The way to the privacy policy and the terms — pages of the public site, in
 * the language of this screen. Shown where an account begins (the login
 * pages) and where a parent minds the family's data (the parents' area):
 * a parent must be able to read both before agreeing to anything.
 */
export function LegalLinks({ note = false }: { note?: boolean }) {
  const t = useT();
  const lang = useLang();
  const site = siteOrigin();
  return (
    <p className={styles.legal}>
      {note && <span className={styles.note}>{t('legal.note')}</span>}
      <span className={styles.links} aria-label={t('legal.label')}>
        {LEGAL_DOCS.map((doc) => (
          <a key={doc} href={legalUrl(site, lang, doc)} target="_blank" rel="noopener">
            {t(`legal.${doc}`)}
          </a>
        ))}
      </span>
    </p>
  );
}
