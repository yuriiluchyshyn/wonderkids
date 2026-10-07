import { motion } from 'framer-motion';
import { PlanetArt } from '@/components/templates/PlanetArt';
import { cn } from '@/core/utils/cn';
import type { Inhabitant, ItemState, WorldPlanetId } from '@/core/child/world/world';
import { RESIDENTS_SHOWN, itemPlace, project, residentPlace, type Place } from './places';
import styles from './Globe.module.css';

/** How big things stand, as a share of the planet's radius — so zooming in makes them bigger too. */
const BUILDING_SIZE = 0.34;
const DECOR_SIZE = 0.2;
const RESIDENT_SIZE = 0.16;

interface GlobeProps {
  planetId: WorldPlanetId;
  /** Centre and radius of the disc, in pixels of the surrounding box. */
  cx: number;
  cy: number;
  radius: number;
  yaw: number;
  pitch: number;
  /** Everything that can stand here; what is not built yet is drawn dimmed. */
  items: readonly ItemState[];
  residents: readonly Inhabitant[];
  /** The planet's number on the way to the Sun: the level of its buildings. */
  level: number;
  /** The child cannot build here yet. */
  locked?: boolean;
  /** Draw the things standing on it (off for a planet seen from afar). */
  detail?: boolean;
  selectedId?: string | null;
  /** The item that was built a moment ago: it drops in. */
  justBuilt?: string | null;
  onTap?: (state: ItemState) => void;
}

/**
 * A planet as a globe: the real planet (`PlanetArt`) turned by `yaw`, with
 * everything built on it standing at its own place. What is on the far side is
 * not drawn; what is not built yet is a dim outline. Everything can be tapped
 * (`onTap`) — the planet view then tells what it is and offers to build it.
 */
export function Globe({ planetId, cx, cy, radius, yaw, pitch, items, residents, level, locked, detail = true, selectedId, justBuilt, onTap }: GlobeProps) {
  /** Things on the far side are hidden; near the edge they shrink away. */
  const seen = (place: Place) => {
    const p = project(place, yaw, pitch);
    return { left: cx + p.x * radius, top: cy - p.y * radius, scale: 0.55 + 0.45 * Math.max(0, p.depth), depth: p.depth, visible: p.depth > 0.08 };
  };

  return (
    <>
      <PlanetArt id={planetId} turned={yaw / (2 * Math.PI)} className={cn(styles.art, locked && styles.artLocked)} style={{ left: cx, top: cy, width: radius * 3.36 }} />

      {detail &&
        residents.slice(0, RESIDENTS_SHOWN).map((resident, i) => {
          const p = seen(residentPlace(i));
          if (!p.visible) return null;
          return (
            <span
              key={resident.id}
              className={cn(styles.walker, 'emoji')}
              style={{ left: p.left, top: p.top, fontSize: radius * RESIDENT_SIZE * p.scale, zIndex: Math.round(p.depth * 100) }}
              aria-hidden
            >
              {resident.emoji}
            </span>
          );
        })}

      {detail &&
        items.map((state, index) => {
          const { item, status } = state;
          const p = seen(itemPlace(index, items.length));
          if (!p.visible) return null;
          const built = status === 'owned';
          return (
            <button
              key={item.id}
              type="button"
              className={cn(styles.pin, !built && styles.ghost, selectedId === item.id && styles.selected, built && level > 1 && styles.upgraded)}
              style={{
                left: p.left,
                top: p.top,
                fontSize: radius * (item.kind === 'building' ? BUILDING_SIZE : DECOR_SIZE) * p.scale,
                zIndex: 100 + Math.round(p.depth * 100),
              }}
              onClick={() => onTap?.(state)}
              aria-label={`${item.name}: ${built ? 'збудовано' : 'ще не збудовано'}`}
            >
              <motion.span
                className={cn(styles.thing, 'emoji')}
                initial={justBuilt === item.id ? { scale: 0, y: -70, rotate: -25 } : false}
                animate={{ scale: 1, y: 0, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 170, damping: 9 }}
              >
                {item.emoji}
                {built && level > 1 && <span className={styles.level}>{level}</span>}
              </motion.span>
            </button>
          );
        })}

      {locked && (
        <span className={cn(styles.lock, 'emoji')} style={{ left: cx, top: cy, fontSize: radius * 0.7 }} aria-hidden>
          🔒
        </span>
      )}
    </>
  );
}
