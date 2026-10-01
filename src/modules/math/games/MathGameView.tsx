import type { GameViewProps } from '@/core/kernel/types';
import type { MathPayload } from '../math.types';
import { MentalMathGame } from './MentalMathGame';
import { FractionsGame } from './FractionsGame';

/** Routes a math task to the correct game view based on its payload kind. */
export function MathGameView(props: GameViewProps) {
  const payload = props.task.payload as MathPayload;
  if (payload.kind === 'fraction') {
    return <FractionsGame {...(props as GameViewProps<typeof payload>)} />;
  }
  return <MentalMathGame {...(props as GameViewProps<typeof payload>)} />;
}
