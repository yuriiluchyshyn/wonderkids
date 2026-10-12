import type { CSSProperties, ReactNode } from 'react';
import styles from './SpaceLoader.module.css';

/**
 * The eight planets as on the public site's front page (`site/src/styles/hero.css`):
 * distance (share of the box), time of one lap and where on the lap it starts.
 * Laps are four times quicker here — a loading scene has to visibly move.
 */
const PLANETS = [
  { name: 'mercury', d: '25%', t: '3s', from: '-0.75s' },
  { name: 'venus', d: '33%', t: '4.25s', from: '-5.25s' },
  { name: 'earth', d: '42%', t: '5.75s', from: '-2.25s' },
  { name: 'mars', d: '50%', t: '7.5s', from: '-10s' },
  { name: 'jupiter', d: '63%', t: '12s', from: '-17.5s' },
  { name: 'saturn', d: '78%', t: '17s', from: '-6.25s' },
  { name: 'uranus', d: '88%', t: '23.25s', from: '-30s' },
  { name: 'neptune', d: '96%', t: '30s', from: '-15s' },
] as const;

/**
 * The loading scene: the Solar System of the site's front page — the Sun and
 * eight planets, the nearer the faster. Pure CSS; `index.html` shows the same
 * scene before the app boots, so there is no flash from one to the other.
 * It is the same in every theme: `data-round` keeps the Minecraft theme, which
 * squares every corner, from turning the planets and their orbits into boxes.
 */
export function SpaceLoader({ label }: { label?: string }) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite" data-round>
      <div className={styles.system} aria-hidden>
        <span className={styles.sun} />
        {PLANETS.map((p) => (
          <span key={p.name} className={styles.orbit} style={{ '--d': p.d, '--t': p.t, '--from': p.from } as CSSProperties}>
            <i className={styles[p.name]} />
          </span>
        ))}
      </div>
      {label && <p className={styles.label}>{label}</p>}
    </div>
  );
}

/** A full screen of night sky with twinkling stars — the backdrop of the login — for loading and its errors. */
export function SpaceScreen({ children }: { children: ReactNode }) {
  return <div className={styles.screen}>{children}</div>;
}
