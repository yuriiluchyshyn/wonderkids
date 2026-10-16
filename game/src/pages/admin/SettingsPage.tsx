import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { adminApi, type BillingStatus, type ProductSettings } from '@/core/account/api/client';
import { errorText } from './shared';
import { siteOrigin, trialUrl } from './links';
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
 * The site's page of prices: shown or hidden. Hidden, its address sends a
 * visitor to the main page and no link leads to it; the site asks
 * `GET /api/health` (`features.pricing`), so a change shows within half a minute.
 */
function PricingSwitch({ adminKey, settings, onSaved }: { adminKey: string; settings: ProductSettings; onSaved: (next: ProductSettings) => void }) {
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const flip = async (on: boolean) => {
    setBusy(true);
    setNote(null);
    try {
      onSaved((await adminApi.saveSettings(adminKey, { pricingPage: on })).settings);
      setNote({ ok: true, text: on ? '✓ Сторінку показано' : '✓ Сторінку сховано' });
    } catch (err) {
      setNote({ ok: false, text: errorText(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.editor}>
      <h2>💳 Сторінка цін на сайті</h2>
      <p className={styles.meta}>
        Тарифи (базовий план і Family Pro) з цінами для України, Польщі, США, Канади та ЄС за адресою{' '}
        <a href={`${siteOrigin()}/pricing/`} target="_blank" rel="noreferrer">
          <code>/pricing/</code>
        </a>{' '}
        (та <code>/en/pricing/</code>, <code>/pl/pricing/</code>). Вимкнено — посилання «Ціни» на сайті немає, а хто
        відкриє адресу, потрапить на головну. Зміна діє на сайті протягом пів хвилини.
      </p>
      <label className={styles.radio}>
        <input type="checkbox" checked={settings.pricingPage} disabled={busy} onChange={(e) => void flip(e.target.checked)} />
        <span>
          <b>Показувати сторінку цін</b>
        </span>
      </label>
      {note && <p className={note.ok ? styles.noteOk : styles.noteErr}>{note.text}</p>}
    </div>
  );
}

/**
 * The connection to Stripe, read-only: which mode the server's key is for, the
 * account it opens, and what the catalogue holds — the plans are edited in
 * Stripe itself. The key itself never leaves the server.
 */
function StripeStatus({ adminKey }: { adminKey: string }) {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setStatus(null);
    try {
      setStatus(await adminApi.billingStatus(adminKey));
    } catch (err) {
      setError(errorText(err));
    }
  }, [adminKey]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className={styles.editor}>
      <h2>🔌 Stripe</h2>
      {error && <p className={styles.noteErr}>{error}</p>}
      {!status && !error && <p className={styles.meta}>Перевіряю з’єднання…</p>}
      {status && !status.configured && (
        <p className={styles.noteErr}>
          На сервері немає ключа <code>STRIPE_SECRET_KEY</code> — оплата вимкнена.
        </p>
      )}
      {status?.configured && status.ok === false && <p className={styles.noteErr}>Stripe не прийняв ключ: {status.detail}</p>}
      {status?.ok && (
        <>
          <p className={styles.meta}>
            {status.mode === 'live' ? '🟢 Бойовий режим — справжні гроші' : '🧪 Тестовий режим (sandbox) — гроші не списуються'} · акаунт{' '}
            <code>{status.account?.id}</code>
            {status.account?.name ? ` (${status.account.name})` : ''}
            {status.account?.country ? `, ${status.account.country}` : ''}
          </p>
          {status.plans ? (
            <p className={styles.noteOk}>
              ✓ Планів у каталозі: {status.plans}; регіони цін: {status.regions?.join(', ')}
            </p>
          ) : (
            <p className={styles.noteErr}>
              У Stripe немає жодного плану Pulsar Kids. Запусти <code>node scripts/stripe-setup.mjs</code>.
            </p>
          )}
          <p className={styles.meta}>
            Плани, ціни й «що входить» живуть у Stripe — сторінка цін і гра беруть їх звідти (за 5 хвилин після зміни).
            Редагувати:{' '}
            <a href={`https://dashboard.stripe.com/${status.mode === 'live' ? '' : 'test/'}products`} target="_blank" rel="noreferrer">
              Stripe → Product catalog
            </a>
            . Тексти трьома мовами — у metadata продукту (<code>name_uk</code>, <code>tagline_pl</code>,{' '}
            <code>feature_1_en</code>…), числа — <code>daily_minutes</code>, <code>trial_days</code>,{' '}
            <code>children_included</code>; регіон ціни — у metadata ціни (<code>region</code>, <code>countries</code>).
          </p>
        </>
      )}
      <div className={styles.actions}>
        <button type="button" className={styles.btn} onClick={() => void load()}>
          Перевірити ще раз
        </button>
      </div>
    </div>
  );
}

/**
 * `/admin/settings` — the main settings, kept in the database (`wk_settings`):
 * the voice each language is read in, the trial game — how long it lasts and its voice —,
 * and whether the site shows its page of prices.
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
          <PricingSwitch adminKey={adminKey} settings={settings} onSaved={show} />
        </section>
      )}

      <section className={styles.gamesSection}>
        <StripeStatus adminKey={adminKey} />
      </section>

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
