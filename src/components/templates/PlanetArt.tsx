import { useId, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/core/utils/cn';
import styles from './Templates.module.css';

/** Seconds for one turn on screen (not to scale — but Jupiter does spin fastest and Venus backwards). */
const TURN: Record<string, number> = { mercury: 30, venus: -42, earth: 18, mars: 19, jupiter: 10, saturn: 11, uranus: 15, neptune: 15 };

/** A band of cloud right across the tile, with a gentle wave that meets itself at the seam. */
const band = (y: number, h: number, fill: string, wave = 3, opacity = 1) => (
  <path
    key={`${y}-${fill}`}
    d={`M0 ${y}Q50 ${y - wave} 100 ${y}T200 ${y}V${y + h}Q150 ${y + h + wave} 100 ${y + h}T0 ${y + h}Z`}
    fill={fill}
    opacity={opacity}
  />
);

/**
 * The surface of each planet as one tile, 200 wide and 100 high — twice the
 * disc, so it can slide past for ever. Nothing crosses the tile's edges
 * except bands, which meet themselves there.
 */
const SURFACE: Record<string, ReactNode> = {
  // Grey rock pocked with craters, like our Moon.
  mercury: (
    <>
      <rect width="200" height="100" fill="#9b958e" />
      <path d="M20 30q18-14 40-4t30 18q-20 16-44 8T20 30Z" fill="#aaa49c" />
      <path d="M118 58q20-12 44-2t18 22q-24 10-44 2t-18-22Z" fill="#8a847d" />
      {[[30, 62, 7], [58, 22, 4], [82, 70, 5], [104, 34, 8], [140, 20, 5], [156, 78, 6], [176, 44, 4], [66, 48, 3], [128, 84, 3], [18, 16, 3]].map(([x, y, r]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r={r} fill="#7a746d" />
          <circle cx={x + r * 0.2} cy={y + r * 0.22} r={r * 0.72} fill="#8f8982" />
        </g>
      ))}
    </>
  ),
  // Thick creamy clouds in swirls — no ground to be seen.
  venus: (
    <>
      <rect width="200" height="100" fill="#e6c98c" />
      {band(6, 9, '#f2deb0', 4)}
      {band(22, 7, '#d6b06a', 5, 0.8)}
      {band(34, 11, '#f0d9a6', 6)}
      {band(52, 8, '#cfa560', 5, 0.75)}
      {band(64, 12, '#f4e3bb', 6)}
      {band(82, 7, '#d9b673', 4, 0.8)}
      <path d="M30 40q30-16 62-2t58-6" stroke="#fbf0d2" strokeWidth="3" fill="none" opacity="0.7" />
      <path d="M22 72q34 12 70 0t70 6" stroke="#c99e58" strokeWidth="2.5" fill="none" opacity="0.6" />
    </>
  ),
  // Blue oceans, green and sandy land, white clouds and ice at the poles.
  earth: (
    <>
      <rect width="200" height="100" fill="#2468c9" />
      <path d="M14 26q10-12 26-10t22 12q-4 12 4 22t-2 24q-10 8-16-6t-12-16q-16-2-22-26Z" fill="#3d9a4a" />
      <path d="M30 34q10-4 16 4t-2 14q-12 0-14-18Z" fill="#c9b36b" />
      <path d="M92 22q18-10 40-6t34 14q4 12-10 16t-22 0q-8 14-18 8t-6-16q-18 0-18-16Z" fill="#3d9a4a" />
      <path d="M122 30q12-4 22 2t0 10q-16 4-22-12Z" fill="#b9a65f" />
      <path d="M104 52q10-4 16 6t-2 24q-10 4-14-10t0-20Z" fill="#48a554" />
      <path d="M160 66q12-4 20 2t-2 12q-14 4-18-14Z" fill="#c9a45c" />
      <rect width="200" height="7" fill="#f4f9ff" />
      <rect y="92" width="200" height="8" fill="#f4f9ff" />
      <path d="M8 60q16-8 34-2t34-4" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.75" />
      <path d="M78 16q16 6 34 0t30 4" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M126 78q16-8 32-2t30-2" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" />
    </>
  ),
  // Rusty desert with dark plains, pale dust, a long canyon and white polar caps.
  mars: (
    <>
      <rect width="200" height="100" fill="#c2603c" />
      <path d="M0 38Q50 30 100 38T200 38V62Q150 70 100 62T0 62Z" fill="#cf7446" opacity="0.7" />
      <path d="M18 44q14-16 34-10t22 14q-6 14-26 14T18 44Z" fill="#8d3f2a" />
      <path d="M96 30q14-8 28 0t8 16q-12 8-26 2t-10-18Z" fill="#9a4a30" />
      <path d="M140 60q16-8 32 0t4 16q-18 6-30 0t-6-16Z" fill="#873a27" />
      <path d="M62 72q12-4 22 2t-4 10q-14 2-18-12Z" fill="#dc9363" />
      <path d="M150 28q10-4 18 2t-6 8q-10 0-12-10Z" fill="#dd9869" />
      <path d="M70 52q24-6 46 0t34-2" stroke="#6f2f20" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {[[40, 78, 3], [112, 80, 4], [176, 44, 3], [84, 22, 2.5]].map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#a9502f" stroke="#7d3524" strokeWidth="0.8" />
      ))}
      <path d="M0 0H200V6Q150 10 100 6T0 6Z" fill="#f6efe8" />
      <path d="M0 100H200V95Q150 92 100 95T0 95Z" fill="#f1e7df" />
    </>
  ),
  // Striped gas giant with the Great Red Spot.
  jupiter: (
    <>
      <rect width="200" height="100" fill="#e6d5b6" />
      {band(4, 8, '#b98a5e', 2)}
      {band(16, 10, '#ecdfc6', 3)}
      {band(28, 9, '#a8714a', 3)}
      {band(40, 12, '#f0e4cb', 4)}
      {band(54, 12, '#b5794e', 4)}
      {band(68, 9, '#e8d9bb', 3)}
      {band(79, 8, '#9c6a48', 2)}
      {band(89, 8, '#d9c4a0', 2)}
      <ellipse cx="132" cy="62" rx="17" ry="9" fill="#e8b08c" />
      <ellipse cx="132" cy="62" rx="13" ry="6.5" fill="#c4512f" />
      <ellipse cx="130" cy="61" rx="6" ry="3" fill="#a83c22" />
      <path d="M20 34q10 4 20 0t20 2" stroke="#f7efdc" strokeWidth="2" fill="none" opacity="0.8" />
      <path d="M60 58q12-4 22 0" stroke="#8a5536" strokeWidth="2" fill="none" opacity="0.7" />
    </>
  ),
  // Pale gold, softly banded (the rings are drawn around it).
  saturn: (
    <>
      <rect width="200" height="100" fill="#e2cc98" />
      {band(8, 10, '#d1b578', 2)}
      {band(22, 9, '#efe0b5', 2)}
      {band(36, 10, '#cdb074', 3, 0.85)}
      {band(50, 12, '#f1e3bc', 3)}
      {band(66, 9, '#c9aa6c', 2, 0.85)}
      {band(80, 10, '#e8d5a4', 2)}
    </>
  ),
  // A smooth pale turquoise ball with barely a mark on it.
  uranus: (
    <>
      <rect width="200" height="100" fill="#a3e4e6" />
      {band(18, 14, '#b9eeef', 2, 0.8)}
      {band(44, 12, '#93d8dc', 2, 0.7)}
      {band(70, 14, '#b4ebed', 2, 0.8)}
    </>
  ),
  // Deep blue, with a dark storm and thin white clouds.
  neptune: (
    <>
      <rect width="200" height="100" fill="#2f55c7" />
      {band(10, 12, '#3f6ae0', 3, 0.8)}
      {band(32, 10, '#2545aa', 3, 0.8)}
      {band(56, 14, '#3b63d8', 4, 0.8)}
      {band(80, 10, '#2340a0', 3, 0.8)}
      <ellipse cx="70" cy="46" rx="14" ry="8" fill="#1b3187" />
      <path d="M58 36q12-5 26 0" stroke="#eaf2ff" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M130 66q14-4 28 0" stroke="#eaf2ff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
      <path d="M150 24q10-3 20 0" stroke="#eaf2ff" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.8" />
    </>
  ),
};

export const hasPlanetArt = (id: string): boolean => id in SURFACE;

/**
 * A planet as it really looks, turning on its axis: its surface slides past
 * inside the disc while the light stays put. Saturn wears its rings and Uranus
 * lies on its side, as they do.
 */
export function PlanetArt({ id, className, style, turned }: { id: string; className?: string; style?: CSSProperties; /** Held at this many turns (any number) instead of spinning by itself — for a planet the child turns by hand. */ turned?: number }) {
  const clip = useId();
  const turn = TURN[id] ?? 16;
  const held = turned === undefined ? undefined : (((turned % 1) + 1) % 1) * 200 - 200;
  const surface = (
    <g
      className={held === undefined ? styles.planetSpin : undefined}
      style={held === undefined ? { animationDuration: `${Math.abs(turn)}s`, animationDirection: turn < 0 ? 'reverse' : 'normal' } : { transform: `translateX(${held}px)` }}
    >
      {SURFACE[id]}
      <g transform="translate(200 0)">{SURFACE[id]}</g>
    </g>
  );
  return (
    <svg viewBox="-34 -6 168 112" className={cn(styles.planetArt, className)} style={style} aria-hidden>
      <defs>
        <clipPath id={clip}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
        <radialGradient id={`${clip}s`} cx="0.34" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#020617" stopOpacity="0.62" />
        </radialGradient>
      </defs>
      {/* The far half of Saturn's rings goes behind the planet. */}
      {id === 'saturn' && (
        <g transform="rotate(-18 50 50)" fill="none">
          <ellipse cx="50" cy="50" rx="78" ry="19" stroke="#bfa772" strokeWidth="9" />
          <ellipse cx="50" cy="50" rx="66" ry="15" stroke="#e7d7a8" strokeWidth="4" />
        </g>
      )}
      <g clipPath={`url(#${clip})`}>
        {/* Uranus spins lying on its side. */}
        <g transform={id === 'uranus' ? 'rotate(82 50 50)' : undefined}>{surface}</g>
      </g>
      <circle cx="50" cy="50" r="50" fill={`url(#${clip}s)`} />
      {id === 'saturn' && (
        <g transform="rotate(-18 50 50)" fill="none">
          <path d="M-28 50A78 19 0 0 0 128 50" stroke="#bfa772" strokeWidth="9" />
          <path d="M-16 50A66 15 0 0 0 116 50" stroke="#e7d7a8" strokeWidth="4" />
        </g>
      )}
      {id === 'uranus' && <ellipse cx="50" cy="50" rx="11" ry="54" fill="none" stroke="#d9f6f7" strokeWidth="1.6" transform="rotate(-8 50 50)" opacity="0.85" />}
    </svg>
  );
}
