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
import { speechEngine } from '@/core/audio/SpeechEngine';
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
 * One line that says HOW to answer — tap, drag, swap. A child should never
 * have to guess the gesture; tapping the line reads it aloud.
 */
function howTo(payload: TemplatePayload): string {
  switch (payload.template) {
    case 'UI_GRID_CHOICE':
      return '👆 Торкнись правильної відповіді';
    case 'UI_DRAG_MATCH':
      return '✋ Перетягни кожну картку на її місце';
    case 'UI_CHRONO_SEQUENCE':
      return '🔄 Торкнись двох карток, щоб поміняти їх місцями, а тоді натисни «Готово»';
    case 'UI_MAP_PUZZLE':
      return payload.mode === 'tap'
        ? '👆 Торкнись потрібного місця на карті'
        : '✋ Перетягни на карту — або просто торкнись потрібного материка';
    case 'UI_BALANCE_SCALE':
      return '✋ Перетягни гирю на праву шальку ваг';
    case 'UI_SORTER_BINS':
      return '✋ Перетягни в потрібне місце — або просто торкнись його';
    case 'UI_CASH_TRAY':
      return '👆 Торкайся монет і купюр, щоб покласти їх на касу';
    case 'UI_TANGRAM':
      return '✋ Перетягни кожну фігуру на її контур';
    case 'UI_GRID_AREA':
      return '👆 Торкайся клітинок, щоб зафарбувати їх, а тоді натисни «Готово»';
    case 'UI_NUMBER_MAZE':
      return '👆 Торкайся сусідньої клітинки, щоб зробити крок';
  }
}

/**
 * Presentation Layer entry point (PRD v4.0 §3.2): renders whichever CORE UI
 * template a task's payload asks for. Any module whose tasks carry a
 * `TemplatePayload` uses this as its `GameView` — no per-game view code.
 */
export function TemplateGameView(props: GameViewProps) {
  const payload = props.task.payload as TemplatePayload;
  const Layout = LAYOUTS[payload.template];
  const instruction = howTo(payload);

  return (
    <div className={styles.root}>
      {/* The written task, with its tap-to-hear speaker (PRD v4.0 §2.4). */}
      <p className={styles.prompt}>
        <span>{props.task.prompt}</span>
        <SpeakButton text={props.task.prompt} size="md" />
      </p>
      <button
        type="button"
        className={styles.howTo}
        onClick={() => speechEngine.speak(instruction.replace(/^\S+\s/, ''))}
        aria-label={`Як виконати: ${instruction}`}
      >
        {instruction}
      </button>
      <Layout {...props} payload={payload} />
    </div>
  );
}
