import { motion } from 'framer-motion';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useGameStore } from '@/core/store/useGameStore';
import styles from './DreamBuild.module.css';

const TOTAL_PARTS = 10;
const COST_PER_PART = 10;

/**
 * Solo "Dream Build" (PRD §7.2): the child's artifacts assemble a themed object
 * (ship / rocket / castle...). Each part costs a fixed number of artifacts; when
 * all parts are placed the build is complete and shown in full.
 */
export function DreamBuild() {
  const theme = useActiveTheme();
  const artifacts = useGameStore((s) => s.artifacts);

  const partsBuilt = Math.min(TOTAL_PARTS, Math.floor(artifacts / COST_PER_PART));
  const complete = partsBuilt >= TOTAL_PARTS;

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <span className="emoji" aria-hidden style={{ fontSize: '1.8rem' }}>
          {theme.dreamBuild.emoji}
        </span>
        <h3>{theme.dreamBuild.name}</h3>
      </div>

      {complete ? (
        <motion.div
          className={`${styles.finished} emoji`}
          initial={{ scale: 0.5, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 14 }}
        >
          {theme.dreamBuild.emoji}
          <p className={styles.doneLabel}>Збудовано! 🎉</p>
        </motion.div>
      ) : (
        <>
          <div className={styles.slots}>
            {Array.from({ length: TOTAL_PARTS }, (_, i) => (
              <motion.div
                key={i}
                className={`${styles.slot} ${i < partsBuilt ? styles.filled : ''}`}
                initial={false}
                animate={i < partsBuilt ? { scale: [0.6, 1.15, 1] } : {}}
              >
                <span className="emoji" aria-hidden>
                  {i < partsBuilt ? theme.artifact.emoji : ''}
                </span>
              </motion.div>
            ))}
          </div>
          <p className={styles.progress}>
            Деталей зібрано: <strong>{partsBuilt}</strong> / {TOTAL_PARTS}
          </p>
          <p className="muted">
            Ще {COST_PER_PART - (artifacts % COST_PER_PART)} {theme.artifact.emoji} до наступної деталі
          </p>
        </>
      )}
    </div>
  );
}
