import confetti from 'canvas-confetti';
import type { CelebrationStyle } from '@/core/child/store/useGameStore';
import { perf } from '@/core/app/platform';

/**
 * What every burst shares. The library draws in a worker of its own wherever
 * the browser has `OffscreenCanvas`, and takes its canvas away when the last
 * piece has fallen — so only the number of pieces is ours to mind: a weaker
 * device gets fewer (`perf.particles`).
 */
const BASE = { disableForReducedMotion: true } as const;

/**
 * Fires a canvas-confetti burst pattern matching the chosen celebration style
 * (PRD §4.1 — 5 режимів переможного святкування). Pure side-effect helper so
 * the Celebration component stays declarative.
 */
export function fireConfetti(style: CelebrationStyle): void {
  switch (style) {
    case 'fireworks':
      fireworks();
      break;
    case 'stars':
      confetti({
        ...BASE,
        particleCount: perf.particles(120),
        spread: 100,
        origin: { y: 0.6 },
        shapes: ['star'],
        colors: ['#FFD700', '#FFEC8B', '#FFFACD', '#FFC107'],
        scalar: 1.2,
      });
      break;
    case 'balls':
      confetti({ ...BASE, particleCount: perf.particles(90), spread: 120, origin: { y: 0.7 }, gravity: 1.4, scalar: 1.4 });
      break;
    case 'candy':
      confetti({
        ...BASE,
        particleCount: perf.particles(110),
        spread: 110,
        origin: { y: 0.5 },
        colors: ['#ff6ec7', '#ffd166', '#06d6a0', '#8367c7', '#ff5c8a'],
        scalar: 1.1,
      });
      break;
    case 'balloons':
    default:
      confetti({ ...BASE, particleCount: perf.particles(80), spread: 90, origin: { y: 0.65 }, scalar: 1.1 });
      break;
  }
}

/** A short multi-burst firework sequence. */
function fireworks(): void {
  const end = Date.now() + 900;
  const colors = ['#ff5c8a', '#ffd166', '#4cc9f0', '#b5179e'];
  const tick = () => {
    confetti({ ...BASE, particleCount: perf.particles(6), angle: 60, spread: 70, origin: { x: 0 }, colors });
    confetti({ ...BASE, particleCount: perf.particles(6), angle: 120, spread: 70, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(tick);
  };
  tick();
}
