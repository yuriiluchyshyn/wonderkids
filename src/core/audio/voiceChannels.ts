/**
 * Named voice "channels". Each is independently mutable (persisted) so a parent
 * can silence, say, the equation reading while keeping selection prompts. Every
 * voiced section in the UI maps to one of these.
 */
export type VoiceChannel = 'selections' | 'taskPrompt' | 'taskIntro' | 'hint';

export interface VoiceChannelMeta {
  id: VoiceChannel;
  label: string;
  icon: string;
}

export const VOICE_CHANNELS: VoiceChannelMeta[] = [
  { id: 'selections', label: 'Озвучення вибору (вік, предмет, складність)', icon: '👆' },
  { id: 'taskPrompt', label: 'Читання завдання (напр. «шість плюс один»)', icon: '🔢' },
  { id: 'taskIntro', label: 'Пояснення на початку завдання', icon: '📖' },
  { id: 'hint', label: 'Голосова підказка-пояснення при помилці', icon: '🧚' },
];

export type VoiceChannelState = Record<VoiceChannel, boolean>;

export const DEFAULT_VOICE_STATE: VoiceChannelState = {
  selections: true,
  taskPrompt: true,
  taskIntro: true,
  hint: true,
};
