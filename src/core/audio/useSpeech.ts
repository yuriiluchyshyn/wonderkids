import { useCallback } from 'react';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useT, useVoiceLang } from '@/core/i18n';
import type { AppKey, Params } from '@/core/i18n';
import type { SpeechLang } from './SpeechEngine';
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
    (text: string, lang?: SpeechLang) => voice.say(text, channel, lang),
    [voiceOn, enabled, channel],
  );
}

/**
 * Says a text of the app by its key — in the language of the VOICE, which the
 * parent may set apart from the language on the screen (the screen shows «Play»,
 * the voice says «Grać»). `inLang` names another language for the phrase —
 * the one a task is read in (`session.langs.said`), when it carries a piece of it.
 */
export function useSayT(channel?: VoiceChannel, inLang?: SpeechLang) {
  const voiceLang = useVoiceLang();
  const lang = inLang ?? voiceLang;
  const t = useT(lang);
  const voiceOn = useGameStore((s) => s.settings.voiceOn);
  const enabled = useGameStore((s) => (channel ? s.settings.voice[channel] : true));

  return useCallback(
    (key: AppKey, params?: Params) => voice.say(t(key, params), channel, lang),
    [voiceOn, enabled, channel, lang, t], // eslint-disable-line react-hooks/exhaustive-deps
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
