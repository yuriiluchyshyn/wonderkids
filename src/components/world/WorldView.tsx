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
  const { def, lands, residents, gifts } = world;
  const nextResident = def.residents[residents.length];

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
          <span className={styles.count}>
            {residents.length} / {def.residents.length}
          </span>
        </h2>
        <ul className={styles.residents}>
          {def.residents.map((r, i) => {
            const here = i < residents.length;
            return (
              <li key={r.id} className={cn(styles.resident, !here && styles.locked)} aria-label={here ? r.name : 'Ще не прийшов'}>
                <span className={cn(styles.residentEmoji, 'emoji')} aria-hidden>
                  {here ? r.emoji : '❔'}
                </span>
                {showText && <span className={styles.residentName}>{here ? r.name : '…'}</span>}
              </li>
            );
          })}
        </ul>
        <p className={styles.note}>
          {nextResident
            ? `Кожна 5-та сходинка на будь-якому шляху — це подарунок: до тебе приходить новий мешканець.`
            : `Усі мешканці вже тут! Подарунків зібрано: ${gifts}.`}
        </p>
      </section>
    </div>
  );
}
