import { useT } from '@/core/i18n';
import { useGameStore } from '@/core/child/store/useGameStore';
import { VOICE_CHANNELS } from '@/core/audio/voiceChannels';
import { Chip } from '@/components/ui/Chip';
import { VoiceToggle } from '@/components/ui/VoiceToggle';
import styles from './AudioSettings.module.css';

/**
 * All sound, voice and text-label settings in one place (PRD §8/§10). Kept on a
 * dedicated page so the child doesn't stumble into it. Per-section voice
 * toggles mirror the inline ones in the app and persist to local storage.
 */
export function AudioSettings() {
  const t = useT();
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);

  return (
    <div className="stack">
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('audio.general')}</h3>
        <div className={styles.chipRow}>
          <Chip
            icon={settings.soundOn ? '🔊' : '🔇'}
            label={t('audio.effects')}
            active={settings.soundOn}
            onClick={() => updateSettings({ soundOn: !settings.soundOn })}
          />
          <Chip
            icon={settings.voiceOn ? '🗣️' : '🤐'}
            label={t('audio.voice')}
            active={settings.voiceOn}
            onClick={() => updateSettings({ voiceOn: !settings.voiceOn })}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('audio.sections')}</h3>
        <p className={styles.hint}>
          {settings.voiceOn
            ? t('audio.sectionsHint')
            : t('audio.sectionsOff')}
        </p>
        <ul className={styles.list}>
          {VOICE_CHANNELS.map((ch) => (
            <li key={ch.id} className={styles.row}>
              <span className={styles.rowLabel}>
                <span className="emoji" aria-hidden>
                  {ch.icon}
                </span>
                {t(`voiceChannel.${ch.id}`)}
              </span>
              <VoiceToggle channel={ch.id} size="md" />
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('audio.ttsButtons')}</h3>
        <p className={styles.hint}>
          {t('audio.ttsHint')}
        </p>
        <div className={styles.chipRow}>
          <Chip
            icon={settings.ttsButtons ? '🔊' : '📖'}
            label={settings.ttsButtons ? t('audio.ttsOn') : t('audio.ttsOff')}
            active={settings.ttsButtons}
            onClick={() => updateSettings({ ttsButtons: !settings.ttsButtons })}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('audio.captions')}</h3>
        <p className={styles.hint}>{t('audio.captionsHint')}</p>
        <div className={styles.chipRow}>
          <Chip
            icon={settings.showText ? '🔤' : '🙈'}
            label={settings.showText ? t('audio.captionsOn') : t('audio.captionsOff')}
            active={settings.showText}
            onClick={() => updateSettings({ showText: !settings.showText })}
          />
        </div>
      </section>
    </div>
  );
}
