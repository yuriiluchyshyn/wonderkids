import { motion } from 'framer-motion';
import { useVoiceChannel } from '@/core/audio/useSpeech';
import { useSound } from '@/core/audio/useSound';
import type { VoiceChannel } from '@/core/audio/voiceChannels';
import { cn } from '@/core/utils/cn';
import styles from './VoiceToggle.module.css';

interface VoiceToggleProps {
  channel: VoiceChannel;
  /** Optional text shown beside the icon (used on the settings page). */
  label?: string;
  size?: 'sm' | 'md';
}

/**
 * Small inline control that mutes/unmutes the voice for one section. Shows 🔊
 * when speaking is on and 🔇 when muted; the choice is persisted. When the
 * master voice switch is off it shows as muted and disabled.
 */
export function VoiceToggle({ channel, label, size = 'sm' }: VoiceToggleProps) {
  const { channelOn, masterOn, toggle } = useVoiceChannel(channel);
  const { play } = useSound();

  const effectiveOn = masterOn && channelOn;

  return (
    <motion.button
      className={cn(styles.toggle, styles[size], !effectiveOn && styles.muted)}
      whileTap={{ scale: 0.88 }}
      aria-pressed={channelOn}
      aria-label={
        channelOn ? `Вимкнути озвучення${label ? `: ${label}` : ''}` : `Увімкнути озвучення${label ? `: ${label}` : ''}`
      }
      title={masterOn ? undefined : 'Увімкніть «Озвучення» у налаштуваннях'}
      onClick={() => {
        play('tap');
        toggle();
      }}
    >
      <span className="emoji" aria-hidden>
        {effectiveOn ? '🔊' : '🔇'}
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </motion.button>
  );
}
