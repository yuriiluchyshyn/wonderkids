import { useShowText } from '@/core/ui/useUiPrefs';
import { LANDMARK_STAGES } from '@/core/world/world';
import { PlanetView } from './PlanetView';
import { useWorld, type Landmark } from '@/core/world/useWorld';
import { cn } from '@/core/utils/cn';
import styles from './WorldView.module.css';

const STAGE_NAMES = ['Ще не розпочато', 'Закладено фундамент', 'Будівництво триває', 'Майже готово', 'Збудовано!'];

function LandmarkTile({ landmark }: { landmark: Landmark }) {
  const showText = useShowText();
  const { stage, stages } = landmark;
  // With named stages, the newest unlocked one is the face of the landmark.
  const face = stage > 0 && stages ? stages[stage - 1] : null;
  return (
    <li
      className={cn(styles.landmark, stage === 0 && styles.locked, stage === LANDMARK_STAGES && styles.built)}
      aria-label={`${landmark.name}: ${STAGE_NAMES[stage]}`}
    >
      <span className={cn(styles.landmarkEmoji, 'emoji')} style={{ fontSize: `${1.7 + stage * 0.32}rem` }} aria-hidden>
        {stage === 0 ? '🚧' : (face?.[0] ?? landmark.emoji)}
      </span>
      {showText && (
        <span className={styles.landmarkText}>
          <span className={styles.landmarkName}>{face?.[1] ?? landmark.name}</span>
          <span className={styles.landmarkGame}>
            {landmark.sub.icon} {stage === 0 ? `Грай «${landmark.sub.label}», щоб збудувати` : STAGE_NAMES[stage]}
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
  const world = useWorld();
  const { def, lands, residents } = world;

  return (
    <div className="stack">
      {/* ---- The planet: exchange artifacts for buildings and decorations ---- */}
      <PlanetView world={world} />

      {/* ---- Lands of knowledge ---- */}
      <section className={styles.card}>
        <h2 className={styles.title}>
          <span className="emoji" aria-hidden>
            🗺️
          </span>{' '}
          Землі знань
        </h2>
        {showText && <p className={styles.hint}>Кожна гра будує щось своє. Що далі проходиш — то більше виростає!</p>}
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
                <LandmarkTile key={landmark.sub.id} landmark={landmark} />
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
            <li key={r.id} className={styles.resident} aria-label={r.name}>
              <span className={cn(styles.residentEmoji, 'emoji')} aria-hidden>
                {r.emoji}
              </span>
              {showText && <span className={styles.residentName}>{r.name}</span>}
            </li>
          ))}
          {residents.length < def.residents.length && (
            <li className={cn(styles.resident, styles.locked)} aria-label="Хтось іще в дорозі">
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
