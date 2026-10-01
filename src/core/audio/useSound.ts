import { useCallback, useMemo } from 'react';
import { useGameStore } from '@/core/store/useGameStore';
import { audioEngine } from './AudioEngine';

type SfxName =
  | 'tap'
  | 'success'
  | 'gentle'
  | 'sad'
  | 'pop'
  | 'crunch'
  | 'fanfare'
  | 'win'
  | 'chestOpen'
  | 'treasure';

/**
 * Returns sound-effect players that respect the `soundOn` setting. UI code calls
 * `play('pop')` without knowing anything about the Web Audio layer.
 */
export function useSound() {
  const soundOn = useGameStore((s) => s.settings.soundOn);

  const play = useCallback(
    (name: SfxName) => {
      if (!soundOn) return;
      audioEngine[name]();
    },
    [soundOn],
  );

  const chime = useCallback(
    (index: number) => {
      if (!soundOn) return;
      audioEngine.chime(index);
    },
    [soundOn],
  );

  /** Counting chime whose pitch rises with fill progress. */
  const countChime = useCallback(
    (filled: number, total: number) => {
      if (!soundOn) return;
      audioEngine.countChime(filled, total);
    },
    [soundOn],
  );

  return useMemo(() => ({ play, chime, countChime }), [play, chime, countChime]);
}
