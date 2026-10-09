/**
 * Named voice "channels". Each is independently mutable (persisted) so a parent
 * can silence, say, the equation reading while keeping selection prompts. Every
 * voiced section in the UI maps to one of these. A channel's label is the
 * text `voiceChannel.<id>` of the app dictionary.
 */
export type VoiceChannel = 'selections' | 'taskPrompt' | 'taskIntro' | 'hint';

export interface VoiceChannelMeta {
  id: VoiceChannel;
  icon: string;
}

export const VOICE_CHANNELS: VoiceChannelMeta[] = [
  { id: 'selections', icon: '👆' },
  { id: 'taskPrompt', icon: '🔢' },
  { id: 'taskIntro', icon: '📖' },
  { id: 'hint', icon: '🧚' },
];

export type VoiceChannelState = Record<VoiceChannel, boolean>;

export const DEFAULT_VOICE_STATE: VoiceChannelState = {
  selections: true,
  taskPrompt: true,
  taskIntro: true,
  hint: true,
};
