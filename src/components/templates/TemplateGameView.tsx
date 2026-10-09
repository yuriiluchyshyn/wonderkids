import { Mechanics } from '@/core/game/kernel/mechanics';
import type { ComponentType } from 'react';
import { saidOf, spokenPrompt, type GameViewProps } from '@/core/game/kernel/types';
import type { TemplatePayload } from '@/core/game/templates/types';
import { PhysicsScaleLayout } from './PhysicsScaleLayout';
import { CashTrayLayout } from './CashTrayLayout';
import { DragMatchLayout } from './DragMatchLayout';
import { GridAreaLayout } from './GridAreaLayout';
import { GridChoiceLayout } from './GridChoiceLayout';
import { InteractiveMapLayout } from './InteractiveMapLayout';
import { NumberMazeLayout } from './NumberMazeLayout';
import { SequenceLayout } from './SequenceLayout';
import { SorterBinsLayout } from './SorterBinsLayout';
import { TangramLayout } from './TangramLayout';
import { BubblePopLayout } from './BubblePopLayout';
import { DotToDotLayout } from './DotToDotLayout';
import { ColorMixLayout } from './ColorMixLayout';
import { LetterGridLayout } from './LetterGridLayout';
import { SpeakButton } from './SpeakButton';
import styles from './Templates.module.css';

/* eslint-disable @typescript-eslint/no-explicit-any -- each layout narrows `payload` itself */
const LAYOUTS: Record<TemplatePayload['template'], ComponentType<any>> = {
  [Mechanics.GridChoice]: GridChoiceLayout,
  [Mechanics.DragMatch]: DragMatchLayout,
  [Mechanics.ChronoSequence]: SequenceLayout,
  [Mechanics.MapPuzzle]: InteractiveMapLayout,
  [Mechanics.BalanceScale]: PhysicsScaleLayout,
  [Mechanics.SorterBins]: SorterBinsLayout,
  [Mechanics.CashTray]: CashTrayLayout,
  [Mechanics.Tangram]: TangramLayout,
  [Mechanics.GridArea]: GridAreaLayout,
  [Mechanics.NumberMaze]: NumberMazeLayout,
  [Mechanics.BubblePop]: BubblePopLayout,
  [Mechanics.DotToDot]: DotToDotLayout,
  [Mechanics.ColorMix]: ColorMixLayout,
  [Mechanics.LetterGrid]: LetterGridLayout,
};

/**
 * Presentation Layer entry point (PRD v4.0 §3.2): renders whichever CORE UI
 * template a task's payload asks for. Any module whose tasks carry a
 * `TemplatePayload` uses this as its `GameView` — no per-game view code.
 * HOW to answer on each board (tap / drag / swap) is told once, as a first-run
 * tip (`components/coach/tips.ts`), not printed on every task.
 */
export function TemplateGameView(props: GameViewProps) {
  const payload = props.task.payload as TemplatePayload;
  const Layout = LAYOUTS[payload.template];

  return (
    <div className={styles.root}>
      {/* The written task, with its tap-to-hear speaker (PRD v4.0 §2.4). */}
      <p className={styles.prompt}>
        <span>{props.task.prompt}</span>
        <SpeakButton text={spokenPrompt(saidOf(props.task))} size="md" lang={saidOf(props.task).lang} />
      </p>
      <Layout {...props} payload={payload} />
    </div>
  );
}
