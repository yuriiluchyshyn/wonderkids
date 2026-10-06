import { useCallback, useMemo } from 'react';
import { useGameStore } from '@/core/store/useGameStore';
import type { SoundCode } from '@/core/engine/BaseGameEngine';
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
  | 'treasure'
  | 'bedtime'
  | 'sndSuccess'
  | 'sndError'
  | 'sndDragStart'
  | 'sndDropSlot'
  | 'sndTtsClick';

/** PRD v4.0 §3.3 sound codes → synthesiser voices. */
const SOUND_CODES: Record<SoundCode, SfxName> = {
  SND_SUCCESS: 'sndSuccess',
  SND_ERROR: 'sndError',
  SND_DRAG_START: 'sndDragStart',
  SND_DROP_SLOT: 'sndDropSlot',
  SND_TTS_CLICK: 'sndTtsClick',
};

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

  /** Play one of the unified engine sound codes. */
  const playCode = useCallback((code: SoundCode) => play(SOUND_CODES[code]), [play]);

  const chime = useCallback(
    (index: number) => {
      if (!soundOn) return;
      audioEngine.chime(index);
    },
    [soundOn],
  );

  /** Counting chime whose pitch rises with fill progress; `variant` picks the
   *  voice so two operand groups (A/B) sound distinct. */
  const countChime = useCallback(
    (filled: number, total: number, variant: 'a' | 'b' = 'a') => {
      if (!soundOn) return;
      audioEngine.countChime(filled, total, variant);
    },
    [soundOn],
  );

  return useMemo(
    () => ({ play, playCode, chime, countChime }),
    [play, playCode, chime, countChime],
  );
}
