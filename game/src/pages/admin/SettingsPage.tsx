import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { adminApi, type ProductSettings } from '@/core/account/api/client';
import { errorText } from './shared';
import { trialUrl } from './links';
import { Route, Routes } from 'react-router-dom';
import { SpeechPage } from './SpeechPage';
import { AvailabilityPage } from './AvailabilityPage';
import { Tabs } from './Table';
import { StressTester } from './StressTester';
import { VoicePicker } from './VoicePicker';
import styles from './Admin.module.css';

/**
 * The trial game's voice: its own Google key and a switch. On — whoever plays
 * the trial hears the natural voice, with the stresses of the dictionary; off —
 * the browser's own voice reads, and nothing is stressed.
 */
function TrialVoice({ adminKey, settings, onSaved }: { adminKey: string; settings: ProductSettings; onSaved: (next: ProductSettings) => void }) {
  const trial = settings.trialSpeech;
  const [enabled, setEnabled] = useState(trial.enabled);
  const [key, setKey] = useState('');
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const changed = enabled !== trial.enabled || key.trim() !== '';
  const keyless = enabled && !trial.readable && key.trim() === '';

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNote(null);
    try {
      const next = (await adminApi.saveSettings(adminKey, { trialSpeech: { enabled, key: key.trim() } })).settings;
      onSaved(next);
      setEnabled(next.trialSpeech.enabled);
      setKey('');
      setNote({ ok: true, text: '✓ Збережено' });
    } catch (err) {
      setNote({ ok: false, text: errorText(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={styles.editor} onSubmit={save}>
      <h2>🗣️ Голос пробної гри</h2>
      <p className={styles.meta}>
        Увімкнено — усі, хто грає пробну гру, чують природний голос Google з наголосами зі словника. Вимкнено — читає
        голос браузера, і наголоси не враховуються. Кожну фразу сервер озвучує один раз і далі бере з кешу; один
        відвідувач може замовити не більше кількох сотень нових фраз на годину.
      </p>
      <div className={styles.fields}>
        <label className={styles.field}>
          <span>API-ключ Google Cloud (Text-to-Speech)</span>
          <input
            type="password"
            autoComplete="off"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={trial.readable ? `збережено ${trial.keyHint} — введи новий, щоб замінити` : 'AIza…'}
          />
        </label>
      </div>
      <label className={styles.radio}>
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        <span>
          <b>Увімкнути голос Google у пробній грі</b>
        </span>
      </label>
      {keyless && <p className={styles.noteErr}>Щоб увімкнути, введи ключ.</p>}
      <div className={styles.actions}>
        <button type="submit" className={styles.btnPrimary} disabled={busy || !changed || keyless}>
          {busy ? 'Зберігаю…' : 'Зберегти'}
        </button>
        {note && <span className={note.ok ? styles.noteOk : styles.noteErr}>{note.text}</span>}
      </div>
    </form>
  );
}

/**
 * `/admin/settings` — the main settings, kept in the database (`wk_settings`):
 * the voice each language is read in, and the trial game — how long it lasts and its voice.
 */
function MainSettings({ adminKey }: { adminKey: string }) {
  const [settings, setSettings] = useState<ProductSettings | null>(null);
  const [minutes, setMinutes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const show = (next: ProductSettings) => {
    setSettings(next);
    setMinutes(String(next.demoMinutes));
  };

  const load = useCallback(async () => {
    setError(null);
    try {
      show((await adminApi.getSettings(adminKey)).settings);
    } catch (err) {
      setError(errorText(err));
    }
  }, [adminKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const value = Number(minutes);
  const valid = settings !== null && Number.isInteger(value) && value >= settings.demoMinutesMin && value <= settings.demoMinutesMax;
  const changed = settings !== null && value !== settings.demoMinutes;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      show((await adminApi.saveSettings(adminKey, { demoMinutes: value })).settings);
      setSaved(true);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>⚙️ Основні налаштування</h1>
      </header>

      {error && <p className={styles.noteErr}>{error}</p>}

      {settings && (
        <section className={styles.gamesSection}>
          <VoicePicker adminKey={adminKey} settings={settings} onSaved={show} />
        </section>
      )}

      <section className={styles.gamesSection}>
        <form className={styles.editor} onSubmit={save}>
          <h2>🚀 Пробна гра</h2>
          <p className={styles.meta}>
            Гра без акаунта за адресою <code>{trialUrl()}</code>. Коли час спливає, гра зупиняється — навіть посеред
            завдання — і дитину просять покликати батьків, щоб ті створили акаунт. Набране в пробній грі не
            зберігається.
          </p>
          <div className={styles.fields}>
            <label className={styles.field}>
              Тривалість пробної гри, хвилин
              <input
                type="number"
                inputMode="numeric"
                min={settings?.demoMinutesMin ?? 1}
                max={settings?.demoMinutesMax ?? 60}
                step={1}
                value={minutes}
                disabled={settings === null}
                onChange={(e) => {
                  setMinutes(e.target.value);
                  setSaved(false);
                }}
              />
            </label>
          </div>
          {settings && (
            <p className={styles.meta}>
              Від {settings.demoMinutesMin} до {settings.demoMinutesMax} хвилин, за замовчуванням —{' '}
              {settings.demoMinutesDefault}. Нове значення діє для тих, хто відкриє пробну гру після збереження.
            </p>
          )}
          <div className={styles.actions}>
            <button type="submit" className={styles.btnPrimary} disabled={busy || !valid || !changed}>
              {busy ? 'Зберігаю…' : 'Зберегти'}
            </button>
            {settings && value !== settings.demoMinutesDefault && (
              <button type="button" className={styles.btn} onClick={() => setMinutes(String(settings.demoMinutesDefault))}>
                Повернути {settings.demoMinutesDefault} хв
              </button>
            )}
            {saved && <span className={styles.noteOk}>✓ Збережено</span>}
          </div>
        </form>
      </section>

      {settings && (
        <section className={styles.gamesSection}>
          <TrialVoice adminKey={adminKey} settings={settings} onSaved={show} />
        </section>
      )}

      {settings && (
        <section className={styles.gamesSection}>
          <StressTester adminKey={adminKey} trialReady={settings.trialSpeech.readable} />
        </section>
      )}
    </div>
  );
}

const TABS = [
  { to: '/admin/settings', label: '⚙️ Основне' },
  { to: '/admin/settings/speech', label: '🗣️ Google Speech' },
  { to: '/admin/settings/availability', label: '🌍 Доступність' },
];

/**
 * `/admin/settings/*` — everything the owner sets for the whole product, a tab
 * each: the main settings (voices, the trial game), the Google Speech keys, what is offered where.
 */
export function SettingsPage({ adminKey }: { adminKey: string }) {
  return (
    <>
      <Tabs label="Налаштування" tabs={TABS} />
      <Routes>
        <Route index element={<MainSettings adminKey={adminKey} />} />
        <Route path="speech" element={<SpeechPage adminKey={adminKey} />} />
        <Route path="availability" element={<AvailabilityPage adminKey={adminKey} />} />
      </Routes>
    </>
  );
}
