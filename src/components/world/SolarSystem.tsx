import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSound } from '@/core/audio/useSound';
import { useVoiceSpeak } from '@/core/audio/useSpeech';
import { speechEngine } from '@/core/audio/SpeechEngine';
import { PLANET_FACTS } from '@/core/child/world/planetFacts';
import type { World } from '@/core/child/world/useWorld';
import { PLANET_COUNT, type WorldPlanetId } from '@/core/child/world/world';
import { pickOutro } from '@/core/game/content/outro';
import { cn } from '@/core/utils/cn';
import { Globe } from './Globe';
import { RAD } from './places';
import { useGestures } from './useGestures';
import styles from './SolarSystem.module.css';

/** Orbits from the Sun outwards, as shares of the room there is (not to scale — all eight must fit a phone). */
const ORBIT = [0.2, 0.3, 0.4, 0.5, 0.63, 0.76, 0.88, 0.98];
/** Seconds for one trip round the Sun: the nearer, the faster — as it really is. */
const YEAR = [24, 34, 46, 60, 95, 135, 185, 240];
/** How big each planet is drawn next to the others (Jupiter is the giant, Mercury the baby). */
const SIZE: Record<WorldPlanetId, number> = { mercury: 0.6, venus: 0.8, earth: 0.85, mars: 0.7, jupiter: 1.5, saturn: 1.25, uranus: 1.05, neptune: 1 };
/** A planet of size 1 is this share of the screen's shorter side across. */
const PLANET_SHARE = 0.075;
/** Zoomed to a planet, its disc takes this share of the shorter side. */
const FOCUS_SHARE = 0.6;
const ZOOM_MAX = 30;
/** A planet shows what is built on it once its disc is at least this many pixels in radius. */
const DETAIL_RADIUS = 60;
/** Planets stand still while the child is looking closer than this. */
const STILL_ABOVE = 1.05;
const TILT = 12 * RAD;

interface Camera {
  /** The point of the system at the middle of the screen, and the magnification. */
  x: number;
  y: number;
  s: number;
}

const OVERVIEW: Camera = { x: 0, y: 0, s: 1 };

interface SolarSystemProps {
  world: World;
  onClose: () => void;
}

/**
 * The whole screen for the child's solar system, and nothing else: the Sun
 * with all eight planets going round it. Pinch (or tap a planet) to fly up to
 * one and see what stands on it — what is not built yet is dimmed, a planet
 * not reached yet is dark under a lock. A tapped planet tells a story about
 * itself (`PLANET_FACTS`), a new one every time; the things on a planet not
 * reached yet say nothing. Looking only: building is done on the planet's own
 * page.
 */
export function SolarSystem({ world, onClose }: SolarSystemProps) {
  const { play } = useSound();
  const announce = useVoiceSpeak('selections');
  /** The planet that is telling about itself, and the story it tells now. */
  const [told, setTold] = useState<{ id: WorldPlanetId; fact: string } | null>(null);

  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The page underneath must not scroll while the system covers it.
  useEffect(() => {
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = before;
      speechEngine.cancel();
    };
  }, []);

  // ---- Time: planets go round the Sun and turn on their axes ----
  const camera = useRef<Camera>(OVERVIEW);
  const flight = useRef<{ from: Camera; to: Camera; started: number } | null>(null);
  const clock = useRef({ orbit: 0, spin: 0 });
  const [frame, setFrame] = useState({ cam: OVERVIEW, orbit: 0, spin: 0 });
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const f = flight.current;
      if (f) {
        const t = Math.min(1, (now - f.started) / 650);
        const ease = 1 - (1 - t) ** 3;
        camera.current = {
          x: f.from.x + (f.to.x - f.from.x) * ease,
          y: f.from.y + (f.to.y - f.from.y) * ease,
          s: f.from.s * (f.to.s / f.from.s) ** ease,
        };
        if (t >= 1) flight.current = null;
      }
      // Looked at closely, a planet waits; from afar they all travel on.
      if (!flight.current && camera.current.s <= STILL_ABOVE) clock.current.orbit += dt;
      clock.current.spin += dt;
      setFrame({ cam: camera.current, orbit: clock.current.orbit, spin: clock.current.spin });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const w = size?.w ?? 0;
  const h = size?.h ?? 0;
  const short = Math.min(w, h);
  // Orbits are stretched to the screen, so a tall phone is filled too.
  const reachX = w <= h ? w * 0.46 : Math.min(w * 0.46, h * 0.46 * 1.6);
  const reachY = w <= h ? Math.min(h * 0.46, w * 0.46 * 1.6) : h * 0.46;

  /** Keeps the camera over the system: the further in, the further it may wander. */
  const held = (c: Camera): Camera => {
    const s = Math.max(1, Math.min(ZOOM_MAX, c.s));
    const room = Math.min(1, s - 1);
    return { s, x: Math.max(-reachX * room, Math.min(reachX * room, c.x)), y: Math.max(-reachY * room, Math.min(reachY * room, c.y)) };
  };
  const flyTo = (to: Camera) => {
    flight.current = { from: camera.current, to, started: performance.now() };
  };
  /** Magnify around a point of the screen, which stays under the fingers. */
  const zoomAt = (factor: number, x: number, y: number) => {
    flight.current = null;
    const c = camera.current;
    const s = Math.max(1, Math.min(ZOOM_MAX, c.s * factor));
    if (s <= STILL_ABOVE) setTold(null);
    const px = x - w / 2;
    const py = y - h / 2;
    camera.current = held({ s, x: c.x + px / c.s - px / s, y: c.y + py / c.s - py / s });
  };

  const { handlers, wasDrag } = useGestures({
    onStart: () => (flight.current = null),
    onDrag: (dx, dy) => {
      const c = camera.current;
      camera.current = held({ ...c, x: c.x - dx / c.s, y: c.y - dy / c.s });
    },
    onPinch: zoomAt,
  });

  /** The planet's next story, shown and read out; its pool comes round only after all twenty. */
  const tell = (id: WorldPlanetId, name: string) => {
    const fact = pickOutro({ outro: [...PLANET_FACTS[id]] });
    if (!fact) return;
    setTold({ id, fact });
    announce(`${name}. ${fact}`);
  };

  const { cam } = frame;
  const toScreen = (x: number, y: number) => ({ left: w / 2 + (x - cam.x) * cam.s, top: h / 2 + (y - cam.y) * cam.s });

  // World order is the journey (Neptune first); orbits are counted from the Sun.
  const planets = world.system.map((p) => {
    const ring = PLANET_COUNT - p.planet;
    const angle = ring * 2.4 + (2 * Math.PI * frame.orbit) / YEAR[ring];
    const x = reachX * ORBIT[ring] * Math.cos(angle);
    const y = reachY * ORBIT[ring] * Math.sin(angle);
    const across = short * PLANET_SHARE * SIZE[p.id];
    return { ...p, ring, x, y, across, radius: (across / 2) * cam.s, ...toScreen(x, y) };
  });

  const sun = toScreen(0, 0);
  const sunSize = short * 0.11 * cam.s;
  const zoomed = cam.s > STILL_ABOVE;
  const teller = told && planets.find((p) => p.id === told.id);

  return createPortal(
    <div
      className={styles.space}
      ref={box}
      {...handlers}
      onWheel={(e) => {
        const at = e.currentTarget.getBoundingClientRect();
        zoomAt(e.deltaY < 0 ? 1.12 : 0.89, e.clientX - at.left, e.clientY - at.top);
      }}
      role="dialog"
      aria-label="Сонячна система"
    >
      {size && (
        <>
          <svg className={styles.orbits} width={w} height={h} aria-hidden>
            {ORBIT.map((share) => (
              <ellipse key={share} cx={sun.left} cy={sun.top} rx={reachX * share * cam.s} ry={reachY * share * cam.s} />
            ))}
          </svg>

          <button
            type="button"
            className={styles.sun}
            style={{ left: sun.left, top: sun.top, width: sunSize, height: sunSize }}
            aria-label="Сонце"
            onClick={() => {
              if (wasDrag()) return;
              play('tap');
              announce(
                world.sunReached
                  ? 'Ти дістався Сонця! Уся Сонячна система твоя.'
                  : 'Сонце — мета твоєї подорожі. Щоб дістатися до нього, пройди всі вісім планет.',
              );
            }}
          />

          {planets.map((p) => {
            const touch = Math.max(48, p.radius * 2);
            return (
              <div key={p.id} className={styles.planet}>
                {p.planet === world.frontier && (
                  <span className={styles.here} style={{ left: p.left, top: p.top, width: p.radius * 2 + 10, height: p.radius * 2 + 10 }} aria-hidden />
                )}
                {/* The whole planet is a button: tap to fly up to it. */}
                <button
                  type="button"
                  className={styles.touch}
                  style={{ left: p.left, top: p.top, width: touch, height: touch }}
                  aria-label={p.name}
                  onClick={() => {
                    if (wasDrag()) return;
                    play('tap');
                    flyTo({ x: p.x, y: p.y, s: (short * FOCUS_SHARE) / p.across });
                    tell(p.id, p.name);
                  }}
                />
                <Globe
                  planetId={p.id}
                  cx={p.left}
                  cy={p.top}
                  radius={p.radius}
                  yaw={frame.spin * 0.3 + p.ring}
                  pitch={TILT}
                  items={p.items}
                  residents={p.open ? world.residents : []}
                  level={p.planet}
                  locked={!p.open}
                  detail={p.radius >= DETAIL_RADIUS}
                  // On a planet not reached yet the things are only seen: a tap goes through to the planet.
                  onTap={
                    p.open
                      ? (state) => {
                          if (wasDrag()) return;
                          play('tap');
                          announce(`${state.item.name}. ${state.status === 'owned' ? 'Уже збудовано!' : 'Ще не збудовано.'}`);
                        }
                      : undefined
                  }
                />
              </div>
            );
          })}
        </>
      )}

      <div className={styles.buttons} onPointerDown={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => {
            play('tap');
            onClose();
          }}
          aria-label="Закрити Сонячну систему"
        >
          ✕
        </button>
        <button type="button" onClick={() => zoomAt(1.5, w / 2, h / 2)} aria-label="Наблизити">
          ＋
        </button>
        <button type="button" onClick={() => zoomAt(1 / 1.5, w / 2, h / 2)} aria-label="Віддалити">
          －
        </button>
        <button
          type="button"
          className={cn(!zoomed && styles.off)}
          disabled={!zoomed}
          onClick={() => {
            play('tap');
            speechEngine.cancel();
            setTold(null);
            flyTo(OVERVIEW);
          }}
          aria-label="Показати всю Сонячну систему"
        >
          ☀️
        </button>
      </div>

      {teller && told && (
        <div className={styles.story} onPointerDown={(e) => e.stopPropagation()} onWheel={(e) => e.stopPropagation()}>
          <div className={styles.storyHead}>
            <h2>{teller.name}</h2>
            <span>{teller.open ? `Збудовано ${teller.items.filter((s) => s.status === 'owned').length} з ${teller.items.length}` : '🔒 Сюди ти ще не долетів'}</span>
          </div>
          <p aria-live="polite">{told.fact}</p>
          <button
            type="button"
            onClick={() => {
              play('tap');
              tell(teller.id, teller.name);
            }}
          >
            Розкажи ще ✨
          </button>
        </div>
      )}
    </div>,
    document.body,
  );
}
