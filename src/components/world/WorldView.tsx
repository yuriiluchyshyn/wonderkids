import { useState } from 'react';
import { useShowText } from '@/core/app/ui/useUiPrefs';
import { LANDMARK_STAGES, PLANET_COUNT } from '@/core/child/world/world';
import { PlanetView } from './PlanetView';
import { useWorld, type Landmark } from '@/core/child/world/useWorld';
import { cn } from '@/core/utils/cn';
import { useVoiceSpeak } from '@/core/audio/useSpeech';
import { useSound } from '@/core/audio/useSound';
import styles from './WorldView.module.css';

const STAGE_NAMES = ['Ще не розпочато', 'Закладено фундамент', 'Будівництво триває', 'Майже готово', 'Збудовано!'];

/** Tap a picture to hear what it is (the caption may be hidden or unreadable yet). */
function useSayOnTap() {
  const speak = useVoiceSpeak('selections');
  const { play } = useSound();
  return (text: string) => () => {
    play('tap');
    speak(text);
  };
}

function LandmarkTile({ landmark, planet }: { landmark: Landmark; planet: number }) {
  const showText = useShowText();
  const say = useSayOnTap();
  const { stage, stages } = landmark;
  // With named stages, the newest unlocked one is the face of the landmark.
  const face = stage > 0 && stages ? stages[stage - 1] : null;
  return (
    <li
      className={cn(styles.landmark, stage === 0 && styles.locked, stage === LANDMARK_STAGES && styles.built)}
      aria-label={`${landmark.name}: ${STAGE_NAMES[stage]}`}
      role="button"
      tabIndex={0}
      onClick={say(
        stage === 0
          ? `${landmark.name}. Грай у гру «${landmark.sub.label}», щоб це збудувати.`
          : `${face?.[1] ?? landmark.name}. ${STAGE_NAMES[stage]}. Рівень ${landmark.level} з ${PLANET_COUNT}. ${
              landmark.level >= planet ? 'Для цієї планети досить!' : `Для цієї планети потрібен рівень ${planet} — грай далі у гру «${landmark.sub.label}».`
            }`,
      )}
    >
      <span className={cn(styles.landmarkEmoji, 'emoji')} style={{ fontSize: `${1.7 + stage * 0.32}rem` }} aria-hidden>
        {stage === 0 ? '🚧' : (face?.[0] ?? landmark.emoji)}
      </span>
      {showText && (
        <span className={styles.landmarkText}>
          <span className={styles.landmarkName}>{face?.[1] ?? landmark.name}</span>
          <span className={styles.landmarkGame}>
            {landmark.sub.icon} {stage === 0 ? `Грай «${landmark.sub.label}», щоб збудувати` : STAGE_NAMES[stage]} · рівень {landmark.level}
            {landmark.level >= planet ? ' ✅' : ''}
          </span>
        </span>
      )}
      {stages ? (
        <span className={styles.stageRow} aria-hidden>
          {stages.map(([emoji], i) => (
            <span key={i} className={cn(styles.stageChip, 'emoji', i < stage && styles.stageOn)}>
              {emoji}
            </span>
          ))}
        </span>
      ) : (
        <span className={styles.stageRow} aria-hidden>
          {Array.from({ length: LANDMARK_STAGES }, (_, i) => (
            <span key={i} className={cn(styles.stagePip, i < stage && styles.stageOn)} />
          ))}
        </span>
      )}
    </li>
  );
}

/**
 * «Мій світ» — the world the child builds by learning: the theme's planet
 * (artifacts exchanged for buildings, ending in the dream build), the lands of knowledge
 * (one landmark per game, growing with progress) and the residents that gifts
 * bring. Everything here is earned; nothing can be lost.
 */
export function WorldView() {
  const showText = useShowText();
  // The planet being looked at; by default the furthest one reached.
  const [planet, setPlanet] = useState<number | undefined>(undefined);
  const world = useWorld(planet);
  const { def, lands, residents } = world;
  const say = useSayOnTap();

  return (
    <div className="stack">
      {/* ---- The planet: exchange artifacts for buildings and decorations ---- */}
      <PlanetView world={world} onPlanet={setPlanet} />

      {/* ---- Lands of knowledge ---- */}
      <section className={styles.card}>
        <h2 className={styles.title}>
          <span className="emoji" aria-hidden>
            🗺️
          </span>{' '}
          Землі знань
        </h2>
        {showText && (
          <p className={styles.hint}>
            Кожна гра будує щось своє і росте рівень за рівнем — по одному на кожну планету. Для планети «{world.planetName}» потрібен рівень {world.planet}.
          </p>
        )}
        {lands.map(({ module, landmarks }) => (
          <div key={module.id} className={styles.land}>
            <h3 className={styles.landTitle}>
              <span className="emoji" aria-hidden>
                {module.icon}
              </span>{' '}
              {module.title}
              <span className={styles.count}>
                {landmarks.filter((l) => l.stage > 0).length} / {landmarks.length}
              </span>
            </h3>
            <ul className={styles.landmarks}>
              {landmarks.map((landmark) => (
                <LandmarkTile key={landmark.sub.id} landmark={landmark} planet={world.planet} />
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* ---- Residents ---- */}
      <section className={styles.card}>
        <h2 className={styles.title}>
          <span className="emoji" aria-hidden>
            🎁
          </span>{' '}
          Мешканці
          <span className={styles.count}>{residents.length}</span>
        </h2>
        {/* Who comes next, when and how many there are is a surprise: only
            those who already moved in are shown, plus one mystery guest. */}
        <ul className={styles.residents}>
          {residents.map((r) => (
            <li key={r.id} className={styles.resident} aria-label={r.name} role="button" tabIndex={0} onClick={say(r.name)}>
              <span className={cn(styles.residentEmoji, 'emoji')} aria-hidden>
                {r.emoji}
              </span>
              {showText && <span className={styles.residentName}>{r.name}</span>}
            </li>
          ))}
          {residents.length < def.residents.length && (
            <li
              className={cn(styles.resident, styles.locked)}
              aria-label="Хтось іще в дорозі"
              role="button"
              tabIndex={0}
              onClick={say('Хтось іще в дорозі до тебе. Це сюрприз!')}
            >
              <span className={cn(styles.residentEmoji, 'emoji')} aria-hidden>
                ❔
              </span>
              {showText && <span className={styles.residentName}>…</span>}
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
