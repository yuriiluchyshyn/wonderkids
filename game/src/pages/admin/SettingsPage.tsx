import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { adminApi, type ProductSettings } from '@/core/account/api/client';
import { errorText } from './shared';
import { trialUrl } from './links';
import { Route, Routes } from 'react-router-dom';
import { SpeechPage } from './SpeechPage';
import { AvailabilityPage } from './AvailabilityPage';
import { Tabs } from './Table';
import styles from './Admin.module.css';

/**
 * `/admin/settings` — how long the trial game lasts, kept in the database
 * (`wk_settings`).
 */
function TrialGame({ adminKey }: { adminKey: string }) {
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
        <h1>🚀 Пробна гра</h1>
      </header>

      {error && <p className={styles.noteErr}>{error}</p>}

      <section className={styles.gamesSection}>
        <form className={styles.editor} onSubmit={save}>
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
    </div>
  );
}

const TABS = [
  { to: '/admin/settings', label: '🚀 Пробна гра' },
  { to: '/admin/settings/speech', label: '🗣️ Google Speech' },
  { to: '/admin/settings/availability', label: '🌍 Доступність' },
];

/**
 * `/admin/settings/*` — everything the owner sets for the whole product, a tab
 * each: the trial game, the Google Speech keys, what is offered where.
 */
export function SettingsPage({ adminKey }: { adminKey: string }) {
  return (
    <>
      <Tabs label="Налаштування" tabs={TABS} />
      <Routes>
        <Route index element={<TrialGame adminKey={adminKey} />} />
        <Route path="speech" element={<SpeechPage adminKey={adminKey} />} />
        <Route path="availability" element={<AvailabilityPage adminKey={adminKey} />} />
      </Routes>
    </>
  );
}
