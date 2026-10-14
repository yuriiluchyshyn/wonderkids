import { useT } from '@/core/translator';
import { motion } from 'framer-motion';
import type { HintScene } from '@/core/game/hints/types';
import { written } from '@/core/language/marks';
import { cn } from '@/core/utils/cn';
import { Button } from '@/components/ui/Button';
import { ClockFace } from '@/components/templates/ClockFace';
import { useHintStage } from './HintStage';
import { AlphabetScene } from './scenes/AlphabetScene';
import { CompareScene } from './scenes/CompareScene';
import { DivisibleScene } from './scenes/DivisibleScene';
import { StripsScene } from './scenes/StripsScene';
import styles from './HintPanel.module.css';

/** The picture a script names, drawn from its data. One case per kind of scene. */
function Scene({ scene, holes, seen, show, round }: { scene: HintScene; holes?: Record<string, string | number>; seen: Set<string>; show?: string; round: number }) {
  switch (scene.kind) {
    case 'clock':
      return <ClockFace time={scene.time} className={styles.clock} hints />;
    case 'strips':
      return <StripsScene scene={scene} show={show} round={round} />;
    case 'divisible':
      return <DivisibleScene scene={scene} holes={holes} />;
    case 'compare':
      return <CompareScene key={round} scene={scene} seen={seen} />;
    case 'alphabet':
      return <AlphabetScene scene={scene} />;
  }
}

/**
 * The help under the board, for whatever script is on the stage: its picture,
 * and its beats coming out one at a time as they are said — the one being
 * said stands out. While they are being said the board waits, and «Зрозуміло!»
 * lets it go; afterwards the help can be shown again.
 */
export function HintPanel() {
  const t = useT();
  const stage = useHintStage();
  if (!stage?.play || stage.play.kind !== 'help') return null;
  const { play, at, playing, round } = stage;
  const beats = play.shown.beats;
  // While it plays the beats come out one by one; stopped or over, all of them stand.
  const upTo = playing ? at : beats.length - 1;
  const out = beats.slice(0, upTo + 1);
  const seen = new Set(out.flatMap((b) => (b.show ? [b.show] : [])));
  const show = [...out].reverse().find((b) => b.show)?.show;

  return (
    <div className={styles.panel}>
      {play.shown.scene && (
        <div className={styles.scene}>
          <Scene scene={play.shown.scene} holes={play.holes} seen={seen} show={show} round={round} />
        </div>
      )}
      <ol className={styles.beats}>
        {out.map((b, i) => (
          <motion.li
            key={`${round}-${i}`}
            className={cn(styles.beat, playing && i === at && styles.now)}
            data-tone={b.tone}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {b.tone && <span className={styles.mark} aria-hidden />}
            <span>{written(b.text)}</span>
          </motion.li>
        ))}
      </ol>
      <div className={styles.actions}>
        {playing ? (
          <Button icon="👍" onClick={stage.stop}>
            {t('tpl.lessonOk')}
          </Button>
        ) : (
          <Button variant="ghost" icon="🔁" onClick={stage.replay}>
            {t('tpl.lessonReplay')}
          </Button>
        )}
      </div>
    </div>
  );
}
