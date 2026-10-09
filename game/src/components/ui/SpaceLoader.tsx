import styles from './SpaceLoader.module.css';

/**
 * The loading scene: a tiny solar system with a rocket doing laps. Pure CSS,
 * theme-coloured, and the same markup index.html shows before the app boots —
 * so there is no flash from one spinner to another.
 */
export function SpaceLoader({ label }: { label?: string }) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <div className={styles.system} aria-hidden>
        <span className={styles.sun} />
        <span className={`${styles.orbit} ${styles.orbit1}`}>
          <span className={styles.planet} />
        </span>
        <span className={`${styles.orbit} ${styles.orbit2}`}>
          <span className={`${styles.planet} ${styles.planet2}`} />
        </span>
        <span className={`${styles.orbit} ${styles.orbit3}`}>
          <span className={`${styles.rocket} emoji`}>🚀</span>
        </span>
      </div>
      {label && <p className={styles.label}>{label}</p>}
    </div>
  );
}
