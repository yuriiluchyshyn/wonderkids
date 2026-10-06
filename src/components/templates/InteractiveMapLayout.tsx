import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSound } from '@/core/audio/useSound';
import type { MapPuzzlePayload } from '@/core/templates/types';
import { CONTINENTS, OCEANS, type MapRegion } from '@/core/templates/worldMap';
import { cn } from '@/core/utils/cn';
import { CardFace, SHAKE, SHAKE_TRANSITION, type LayoutProps } from './parts';
import { useDragDrop } from './useDragDrop';
import styles from './Templates.module.css';

function RegionShape({ region, className, ...rest }: { region: MapRegion; className: string } & Record<string, unknown>) {
  if (region.points) return <polygon points={region.points} className={className} {...rest} />;
  return (
    <g {...rest}>
      {region.rects?.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} rx={3} className={className} />
      ))}
    </g>
  );
}

/**
 * UI_MAP_PUZZLE — an interactive SVG world map. `tap` mode: touch the region
 * the voice names (the ship sails there). `drag` mode: drag the marker/flag
 * into its slot. The helper makes the target softly pulse with colour.
 */
export function InteractiveMapLayout({ payload, callbacks, hintActive }: LayoutProps<MapPuzzlePayload>) {
  const { layer, mode, marker, targetId } = payload;
  const { playCode } = useSound();
  const [solved, setSolved] = useState(false);
  const [missed, setMissed] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const answer = (regionId: string) => {
    if (solved) return;
    if (regionId === targetId) {
      setSolved(true);
      playCode('SND_DROP_SLOT');
      callbacks.onSuccess();
      return;
    }
    setMissed(regionId);
    setShake(true);
    window.setTimeout(() => setMissed(null), 600);
    callbacks.onMistake();
  };
  const dnd = useDragDrop((_id, regionId) => answer(regionId), solved || mode === 'tap');

  const active = layer === 'continents' ? CONTINENTS : OCEANS;
  const backdrop = layer === 'continents' ? [] : CONTINENTS;
  const target = active.find((r) => r.id === targetId);

  return (
    <div className="stack">
      <div className={styles.mapWrap}>
        <svg viewBox="0 0 200 100" className={styles.map} role="group" aria-label="Карта світу">
          <rect x="0" y="0" width="200" height="100" rx="6" className={styles.mapSea} />
          {backdrop.map((r) => (
            <RegionShape key={r.id} region={r} className={styles.mapLandStatic} />
          ))}
          {active.map((r) => (
            <RegionShape
              key={r.id}
              region={r}
              className={cn(
                layer === 'continents' ? styles.mapLand : styles.mapOcean,
                solved && r.id === targetId && styles.mapSolved,
                missed === r.id && styles.mapMissed,
                hintActive && !solved && r.id === targetId && styles.mapPulse,
              )}
              role="button"
              aria-label={r.name}
              {...(mode === 'tap' ? { onClick: () => answer(r.id) } : dnd.target(r.id))}
            />
          ))}
          {solved && target && (
            <motion.text
              x={target.cx}
              y={target.cy + 3}
              textAnchor="middle"
              fontSize="9"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ transformOrigin: `${target.cx}px ${target.cy}px` }}
            >
              {marker.emoji}
            </motion.text>
          )}
        </svg>
      </div>

      {!solved && (
        <motion.div
          className={styles.tray}
          animate={shake ? SHAKE : { x: 0 }}
          transition={SHAKE_TRANSITION}
          onAnimationComplete={() => setShake(false)}
        >
          {mode === 'drag' ? (
            <div
              className={cn(styles.chipInner, styles.marker, dnd.selected === marker.id && styles.chipSelected)}
              style={dnd.styleFor(marker.id)}
              {...dnd.bind(marker.id)}
            >
              <CardFace card={marker} />
            </div>
          ) : (
            <button type="button" className={cn(styles.chipInner, styles.marker)} onClick={callbacks.speakPrompt}>
              <CardFace card={marker} />
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
