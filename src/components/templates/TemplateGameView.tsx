import type { ComponentType } from 'react';
import type { GameViewProps } from '@/core/kernel/types';
import type { TemplatePayload } from '@/core/templates/types';
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
import { SpeakButton } from './SpeakButton';
import styles from './Templates.module.css';

/* eslint-disable @typescript-eslint/no-explicit-any -- each layout narrows `payload` itself */
const LAYOUTS: Record<TemplatePayload['template'], ComponentType<any>> = {
  UI_GRID_CHOICE: GridChoiceLayout,
  UI_DRAG_MATCH: DragMatchLayout,
  UI_CHRONO_SEQUENCE: SequenceLayout,
  UI_MAP_PUZZLE: InteractiveMapLayout,
  UI_BALANCE_SCALE: PhysicsScaleLayout,
  UI_SORTER_BINS: SorterBinsLayout,
  UI_CASH_TRAY: CashTrayLayout,
  UI_TANGRAM: TangramLayout,
  UI_GRID_AREA: GridAreaLayout,
  UI_NUMBER_MAZE: NumberMazeLayout,
};

/**
 * Presentation Layer entry point (PRD v4.0 §3.2): renders whichever CORE UI
 * template a task's payload asks for. Any module whose tasks carry a
 * `TemplatePayload` uses this as its `GameView` — no per-game view code.
 */
export function TemplateGameView(props: GameViewProps) {
  const payload = props.task.payload as TemplatePayload;
  const Layout = LAYOUTS[payload.template];

  return (
    <div className={styles.root}>
      {/* The written task, with its tap-to-hear speaker (PRD v4.0 §2.4). */}
      <p className={styles.prompt}>
        <span>{props.task.prompt}</span>
        <SpeakButton text={props.task.prompt} size="md" />
      </p>
      <Layout {...props} payload={payload} />
    </div>
  );
}
