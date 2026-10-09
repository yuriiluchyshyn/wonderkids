import { useT } from '@/core/translator';
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
  const t = useT();
  const { channelOn, masterOn, toggle } = useVoiceChannel(channel);
  const { play } = useSound();

  const effectiveOn = masterOn && channelOn;

  return (
    <motion.button
      className={cn(styles.toggle, styles[size], !effectiveOn && styles.muted)}
      whileTap={{ scale: 0.88 }}
      aria-pressed={channelOn}
      aria-label={
        label ? t(channelOn ? 'voiceToggle.offOf' : 'voiceToggle.onOf', { label }) : t(channelOn ? 'voiceToggle.off' : 'voiceToggle.on')
      }
      title={masterOn ? undefined : t('voiceToggle.masterOff')}
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
