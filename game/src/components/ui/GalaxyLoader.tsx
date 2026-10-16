import styles from './GalaxyLoader.module.css';

/**
 * A small spiral galaxy that turns while something loads (the paywall's plans,
 * the payment's fields). Pure CSS, transform only. `data-round` keeps themes
 * that square every corner from turning it into a box.
 */
export function GalaxyLoader({ label }: { label?: string }) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite" data-round>
      <span className={styles.galaxy} aria-hidden />
      {label && <p className={styles.label}>{label}</p>}
    </div>
  );
}
