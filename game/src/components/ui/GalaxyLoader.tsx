import { GALAXY_CORE, galaxyStars } from '@pulsar/brand/galaxy';
import styles from './GalaxyLoader.module.css';

/** The stars never change: made once. */
const STARS = galaxyStars();

/**
 * A small spiral galaxy that turns while something loads (the paywall's plans,
 * the payment's fields): three arms of stars round a bright core (the same
 * picture as on the site, `@pulsar/brand/galaxy`). Transform only. `data-round`
 * keeps themes that square every corner from touching it.
 */
export function GalaxyLoader({ label }: { label?: string }) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite" data-round>
      <svg className={styles.galaxy} viewBox="0 0 48 48" aria-hidden focusable="false">
        <g className={styles.spin}>
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.fill} fillOpacity={s.o} />
          ))}
        </g>
        {GALAXY_CORE.map((s, i) => (
          <circle key={`core-${i}`} cx={s.x} cy={s.y} r={s.r} fill={s.fill} fillOpacity={s.o} />
        ))}
      </svg>
      {label && <p className={styles.label}>{label}</p>}
    </div>
  );
}
