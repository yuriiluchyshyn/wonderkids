import type { GameViewProps } from '@/core/kernel/types';
import { TemplateGameView } from '@/components/templates/TemplateGameView';
import { isClassicPayload, type MathPayload } from '../math.types';
import { MentalMathGame } from './MentalMathGame';
import { FractionsGame } from './FractionsGame';

/** Routes a math task to the correct game view based on its payload kind. */
export function MathGameView(props: GameViewProps) {
  // PRD v4.0 games carry a template payload and need no view of their own.
  if (!isClassicPayload(props.task.payload)) return <TemplateGameView {...props} />;
  const payload: MathPayload = props.task.payload;
  if (payload.kind === 'fraction') {
    return <FractionsGame {...(props as GameViewProps<typeof payload>)} />;
  }
  return <MentalMathGame {...(props as GameViewProps<typeof payload>)} />;
}
