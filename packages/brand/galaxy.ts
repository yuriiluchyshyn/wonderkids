/**
 * The small spiral galaxy that turns while something loads — the same on the
 * site (a string of SVG) and in the game (React): three arms of stars winding
 * out of a bright core, with a little dust between them. Pure data, no DOM.
 * The picture is 48 × 48; the arms are turned by CSS (transform only).
 */

export interface GalaxyStar {
  x: number;
  y: number;
  r: number;
  /** Opacity, 0–1. */
  o: number;
  fill: string;
}

const CENTER = 24;
const ARMS = 3;
const PER_ARM = 13;
const DUST = 16;

const round = (n: number): number => Math.round(n * 100) / 100;

/** The stars of the arms and the dust, nearest the core first. */
export function galaxyStars(): GalaxyStar[] {
  const stars: GalaxyStar[] = [];
  for (let arm = 0; arm < ARMS; arm += 1) {
    for (let i = 0; i < PER_ARM; i += 1) {
      const t = (i + 1) / PER_ARM;
      const radius = 5 + t * 18 + (((arm * 31 + i * 17) % 7) - 3) * 0.35;
      const angle = (arm * 2 * Math.PI) / ARMS + t * 2.6;
      stars.push({
        x: round(CENTER + radius * Math.cos(angle)),
        y: round(CENTER + radius * Math.sin(angle)),
        r: round(1.9 - t * 1.2),
        o: round(1 - t * 0.5),
        fill: t < 0.35 ? '#fff4c2' : t < 0.7 ? '#9fefff' : '#b9a8ff',
      });
    }
  }
  // Dust: small dim stars between the arms, always in the same places.
  for (let i = 0; i < DUST; i += 1) {
    const radius = 7 + ((i * 53) % 17);
    const angle = i * 2.4 + 0.6;
    stars.push({ x: round(CENTER + radius * Math.cos(angle)), y: round(CENTER + radius * Math.sin(angle)), r: 0.55, o: 0.5, fill: '#dfe6ff' });
  }
  return stars;
}

/** The core: a violet haze, a gold glow and a white heart, drawn from the outside in. */
export const GALAXY_CORE: readonly GalaxyStar[] = [
  { x: CENTER, y: CENTER, r: 7.5, o: 0.22, fill: '#7c6cff' },
  { x: CENTER, y: CENTER, r: 4.6, o: 0.55, fill: '#fde047' },
  { x: CENTER, y: CENTER, r: 2.4, o: 1, fill: '#ffffff' },
];

const circle = (s: GalaxyStar): string => `<circle cx="${s.x}" cy="${s.y}" r="${s.r}" fill="${s.fill}" fill-opacity="${s.o}"/>`;

/** The galaxy as SVG markup for the site: `.galaxy-spin` is the turning part. */
export function galaxySvg(): string {
  return `<svg class="galaxy-svg" viewBox="0 0 48 48" width="56" height="56" aria-hidden="true" focusable="false"><g class="galaxy-spin">${galaxyStars().map(circle).join('')}</g>${GALAXY_CORE.map(circle).join('')}</svg>`;
}
