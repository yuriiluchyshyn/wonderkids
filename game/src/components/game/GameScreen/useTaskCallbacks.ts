import { useSound } from '@/core/audio/useSound';
import type { TaskCallbacks } from '@/core/game/kernel/types';
import type { GameSession } from './types';

/**
 * What a board reports back: a right answer, a wrong one, a wish to hear the
 * task again. The engine decides the feedback of a mistake (`SND_ERROR` and a
 * 300 ms shake in the view); any of the three counts as the child being there.
 */
export function useTaskCallbacks({ session, markActivity, sayTask }: { session: GameSession; markActivity: () => void; sayTask: () => void }): TaskCallbacks {
  const { play, playCode } = useSound();
  return {
    onSuccess: () => {
      markActivity();
      playCode('SND_SUCCESS');
      play('pop');
      session.registerSuccess();
    },
    onMistake: () => {
      markActivity();
      const result = session.registerMistake();
      if (result) playCode(result.audio);
    },
    speakPrompt: () => {
      markActivity();
      sayTask();
    },
  };
}
