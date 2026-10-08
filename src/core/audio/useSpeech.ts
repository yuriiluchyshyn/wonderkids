import { useCallback } from 'react';
import { useGameStore } from '@/core/child/store/useGameStore';
import { voice } from './voice';
import type { VoiceChannel } from './voiceChannels';

/** Returns a `speak` function that respects only the master `voiceOn` setting. */
export function useSpeech() {
  const voiceOn = useGameStore((s) => s.settings.voiceOn);

  const speak = useCallback(
    (text: string) => voice.say(text),
    [voiceOn], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return { speak, supported: voice.supported };
}

/**
 * Returns a `speak` function gated by both the master voice switch and a
 * specific per-section channel. Every voiced section uses this so a muted
 * channel stays silent.
 */
export function useVoiceSpeak(channel: VoiceChannel) {
  const voiceOn = useGameStore((s) => s.settings.voiceOn);
  const enabled = useGameStore((s) => s.settings.voice[channel]);

  return useCallback(
    (text: string) => voice.say(text, channel),
    [voiceOn, enabled, channel],
  );
}

/** Reads/controls a single voice channel for the inline mute toggle UI. */
export function useVoiceChannel(channel: VoiceChannel) {
  const voiceOn = useGameStore((s) => s.settings.voiceOn);
  const enabled = useGameStore((s) => s.settings.voice[channel]);
  const toggle = useGameStore((s) => s.toggleVoice);

  return {
    /** Effective on-state (also false when the master switch is off). */
    active: voiceOn && enabled,
    /** The channel's own flag, independent of the master switch. */
    channelOn: enabled,
    masterOn: voiceOn,
    toggle: () => toggle(channel),
  };
}
