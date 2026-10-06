import { useGameStore } from '@/core/store/useGameStore';
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
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);

  return (
    <div className="stack">
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>🔈 Загальне</h3>
        <div className={styles.chipRow}>
          <Chip
            icon={settings.soundOn ? '🔊' : '🔇'}
            label="Звукові ефекти"
            active={settings.soundOn}
            onClick={() => updateSettings({ soundOn: !settings.soundOn })}
          />
          <Chip
            icon={settings.voiceOn ? '🗣️' : '🤐'}
            label="Озвучення (голос)"
            active={settings.voiceOn}
            onClick={() => updateSettings({ voiceOn: !settings.voiceOn })}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>🎙️ Голосові підказки по секціях</h3>
        <p className={styles.hint}>
          {settings.voiceOn
            ? 'Увімкни або вимкни озвучення для кожної частини окремо.'
            : 'Спочатку увімкни «Озвучення (голос)» вище.'}
        </p>
        <ul className={styles.list}>
          {VOICE_CHANNELS.map((ch) => (
            <li key={ch.id} className={styles.row}>
              <span className={styles.rowLabel}>
                <span className="emoji" aria-hidden>
                  {ch.icon}
                </span>
                {ch.label}
              </span>
              <VoiceToggle channel={ch.id} size="md" />
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>🔊 Кнопки озвучення тексту</h3>
        <p className={styles.hint}>
          Значок динаміка біля текстових завдань і відповідей зачитує їх уголос. Вимкни, щоб дитина
          читала самостійно.
        </p>
        <div className={styles.chipRow}>
          <Chip
            icon={settings.ttsButtons ? '🔊' : '📖'}
            label={settings.ttsButtons ? 'Показувати кнопки' : 'Вимкнено — читаємо самі'}
            active={settings.ttsButtons}
            onClick={() => updateSettings({ ttsButtons: !settings.ttsButtons })}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>🔤 Текстові підписи</h3>
        <p className={styles.hint}>Увімкнено — підписи для тих, хто читає. Вимкнено — лише малюнки.</p>
        <div className={styles.chipRow}>
          <Chip
            icon={settings.showText ? '🔤' : '🙈'}
            label={settings.showText ? 'Показувати' : 'Приховані'}
            active={settings.showText}
            onClick={() => updateSettings({ showText: !settings.showText })}
          />
        </div>
      </section>
    </div>
  );
}
