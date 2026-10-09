import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { adminApi, type AdminAccount, type SpeechKey, type SpeechKeyDraft } from '@/core/account/api/client';
import { SpeechSwitch } from './SpeechSwitch';
import { errorFor, errorText, speechStatus } from './shared';
import styles from './Admin.module.css';

/** Voices offered as suggestions; any valid Google voice name can be typed. */
const VOICE_SUGGESTIONS = [
  'uk-UA-Wavenet-A',
  'uk-UA-Chirp3-HD-Aoede',
  'uk-UA-Chirp3-HD-Kore',
  'uk-UA-Chirp3-HD-Leda',
  'uk-UA-Chirp3-HD-Puck',
  'uk-UA-Chirp3-HD-Charon',
  'uk-UA-Standard-A',
];

const emptyDraft = (voice: string): SpeechKeyDraft => ({ label: '', key: '', voice, scope: 'accounts', accountIds: [] });

function Guide() {
  return (
    <details className={styles.guide}>
      <summary>Як отримати API-ключ Google</summary>
      <ol>
        <li>
          Відкрий{' '}
          <a href="https://console.cloud.google.com/projectcreate" target="_blank" rel="noreferrer">
            Google Cloud Console
          </a>{' '}
          і створи проєкт (або вибери наявний). До проєкту має бути прив’язаний платіжний акаунт —{' '}
          <a href="https://console.cloud.google.com/billing" target="_blank" rel="noreferrer">
            Billing
          </a>
          .
        </li>
        <li>
          Увімкни{' '}
          <a href="https://console.cloud.google.com/apis/library/texttospeech.googleapis.com" target="_blank" rel="noreferrer">
            Cloud Text-to-Speech API
          </a>{' '}
          кнопкою <b>Enable</b>.
        </li>
        <li>
          На сторінці{' '}
          <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer">
            Credentials
          </a>{' '}
          натисни <b>Create credentials → API key</b> і скопіюй ключ (починається з <code>AIza</code>).
        </li>
        <li>
          Обмеж ключ: <b>Edit API key → API restrictions → Restrict key → Cloud Text-to-Speech API</b>.
        </li>
        <li>
          Тут натисни <b>＋ Додати ключ</b>, встав його, вибери голос і для кого він діє, збережи й натисни{' '}
          <b>Перевірити</b> — має прозвучати фраза.
        </li>
      </ol>
      <p>
        Голоси й приклади звучання —{' '}
        <a href="https://cloud.google.com/text-to-speech/docs/list-voices-and-types" target="_blank" rel="noreferrer">
          список голосів
        </a>{' '}
        (шукай <code>uk-UA</code>). Ціни й безкоштовний місячний ліміт —{' '}
        <a href="https://cloud.google.com/text-to-speech/pricing" target="_blank" rel="noreferrer">
          Pricing
        </a>
        . Кожну фразу сервер озвучує один раз і далі бере з кешу.
      </p>
    </details>
  );
}

interface EditorProps {
  /** The key being edited, or null when adding a new one. */
  editing: SpeechKey | null;
  defaultVoice: string;
  accounts: AdminAccount[];
  keys: SpeechKey[];
  busy: boolean;
  onSave: (draft: SpeechKeyDraft) => void;
  onCancel: () => void;
}

/** Add / edit form. In both cases you choose who the key is for. */
function KeyEditor({ editing, defaultVoice, accounts, keys, busy, onSave, onCancel }: EditorProps) {
  const [draft, setDraft] = useState<SpeechKeyDraft>(() =>
    editing
      ? {
          label: editing.label,
          key: '',
          voice: editing.voice,
          scope: editing.isGlobal ? 'global' : 'accounts',
          accountIds: editing.accountIds,
        }
      : emptyDraft(defaultVoice),
  );
  const [filter, setFilter] = useState('');
  const patch = (p: Partial<SpeechKeyDraft>) => setDraft((d) => ({ ...d, ...p }));

  const currentGlobal = keys.find((k) => k.isGlobal && k.id !== editing?.id);
  const shown = accounts.filter((a) => a.email.toLowerCase().includes(filter.trim().toLowerCase()));
  const toggleAccount = (id: number) =>
    patch({ accountIds: draft.accountIds.includes(id) ? draft.accountIds.filter((x) => x !== id) : [...draft.accountIds, id] });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave(draft);
  };

  return (
    <form className={styles.editor} onSubmit={submit}>
      <h2>{editing ? `Редагувати ключ «${editing.label || editing.keyHint}»` : 'Новий ключ'}</h2>

      <div className={styles.fields}>
        <label className={styles.field}>
          <span>Назва (для себе)</span>
          <input value={draft.label} onChange={(e) => patch({ label: e.target.value })} placeholder="Напр. Основний" maxLength={80} />
        </label>
        <label className={styles.field}>
          <span>API-ключ Google Cloud</span>
          <input
            type="password"
            autoComplete="off"
            value={draft.key}
            onChange={(e) => patch({ key: e.target.value })}
            placeholder={editing ? `збережено ${editing.keyHint} — введи новий, щоб замінити` : 'AIza…'}
            required={!editing}
          />
        </label>
        <label className={styles.field}>
          <span>Голос</span>
          <input list="wk-voices" value={draft.voice} onChange={(e) => patch({ voice: e.target.value })} spellCheck={false} />
        </label>
      </div>

      <fieldset className={styles.scope}>
        <legend>Для кого цей ключ</legend>
        <label className={styles.radio}>
          <input type="radio" name="scope" checked={draft.scope === 'global'} onChange={() => patch({ scope: 'global' })} />
          <span>
            <b>Глобальний — для всіх акаунтів</b>
            <small>
              Діє для кожного, хто не має власного ключа.
              {currentGlobal && ` Зараз глобальний — «${currentGlobal.label || currentGlobal.keyHint}»; він перестане ним бути.`}
            </small>
          </span>
        </label>
        <label className={styles.radio}>
          <input type="radio" name="scope" checked={draft.scope === 'accounts'} onChange={() => patch({ scope: 'accounts' })} />
          <span>
            <b>Для вибраних акаунтів</b>
            <small>Власний ключ акаунта має перевагу над глобальним.</small>
          </span>
        </label>

        {draft.scope === 'accounts' && (
          <div className={styles.pick}>
            <div className={styles.pickHead}>
              <input
                type="search"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Фільтр за email"
                aria-label="Фільтр акаунтів"
              />
              <span>вибрано: {draft.accountIds.length}</span>
            </div>
            <ul className={styles.pickList}>
              {shown.map((account) => {
                const other = keys.find((k) => k.id === account.speechKeyId && k.id !== editing?.id);
                return (
                  <li key={account.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={draft.accountIds.includes(account.id)}
                        onChange={() => toggleAccount(account.id)}
                      />
                      <span>{account.email}</span>
                      {other && <small>зараз на ключі «{other.label || other.keyHint}» — перейде на цей</small>}
                    </label>
                  </li>
                );
              })}
              {shown.length === 0 && <li className={styles.empty}>Немає акаунтів.</li>}
            </ul>
          </div>
        )}
      </fieldset>

      <div className={styles.actions}>
        <button type="submit" className={styles.btnPrimary} disabled={busy}>
          {editing ? 'Зберегти зміни' : 'Додати ключ'}
        </button>
        <button type="button" className={styles.btn} onClick={onCancel} disabled={busy}>
          Скасувати
        </button>
      </div>
    </form>
  );
}

/**
 * Google Speech settings (`/admin/speech`): the stored API keys — add a new
 * one or edit an existing one, and in both cases choose who it serves (every
 * account as the GLOBAL key, or selected accounts) — plus an on/off switch for
 * each account.
 */
export function SpeechPage({ adminKey }: { adminKey: string }) {
  const [keys, setKeys] = useState<SpeechKey[]>([]);
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [defaultVoice, setDefaultVoice] = useState('uk-UA-Wavenet-A');
  /** `null` = list; `'new'` = adding; a number = editing that key. */
  const [mode, setModeRaw] = useState<null | 'new' | number>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  // Opening or closing the form starts from a clean slate.
  const setMode = (next: null | 'new' | number) => {
    setNote(null);
    setModeRaw(next);
  };

  const load = useCallback(async () => {
    try {
      const [speech, users] = await Promise.all([adminApi.listSpeechKeys(adminKey), adminApi.listAccounts(adminKey)]);
      setKeys(speech.keys);
      setDefaultVoice(speech.defaultVoice);
      setAccounts(users.accounts);
    } catch (err) {
      setNote({ ok: false, text: errorText(err) });
    }
  }, [adminKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (work: () => Promise<string>) => {
    setBusy(true);
    setNote(null);
    try {
      setNote({ ok: true, text: await work() });
    } catch (err) {
      setNote({ ok: false, text: errorText(err) });
    } finally {
      setBusy(false);
    }
  };

  const save = (draft: SpeechKeyDraft) =>
    run(async () => {
      await adminApi.saveSpeechKey(adminKey, mode === 'new' ? null : (mode as number), draft);
      setModeRaw(null);
      await load();
      return 'Збережено.';
    });

  const remove = (key: SpeechKey) => {
    if (!window.confirm(`Видалити ключ «${key.label || key.keyHint}»? Акаунти, які ним користувалися, перейдуть на глобальний.`)) return;
    void run(async () => {
      await adminApi.deleteSpeechKey(adminKey, key.id);
      await load();
      return 'Ключ видалено.';
    });
  };

  const test = (key: SpeechKey) =>
    run(async () => {
      const result = await adminApi.testSpeechKey(adminKey, key.id);
      if (!result.ok || !result.audio) throw new Error(`${errorFor(result.error)} ${result.detail ?? ''}`.trim());
      const name = key.label || key.keyHint;
      try {
        await new Audio(`data:audio/mpeg;base64,${result.audio}`).play();
      } catch {
        // Google accepted the key; only this browser refused to play the sample.
        return `Ключ «${name}» працює (Google відповів), але браузер не відтворив звук.`;
      }
      return `Ключ «${name}» працює — слухай голос.`;
    });

  const emailOf = useMemo(() => new Map(accounts.map((a) => [a.id, a.email])), [accounts]);
  const editing = typeof mode === 'number' ? (keys.find((k) => k.id === mode) ?? null) : null;

  return (
    <div className={styles.page}>
      <datalist id="wk-voices">
        {VOICE_SUGGESTIONS.map((v) => (
          <option key={v} value={v} />
        ))}
      </datalist>

      <header className={styles.header}>
        <h1>🗣️ Google Speech</h1>
        <span className={styles.totals} />
        {mode === null && (
          <button type="button" className={styles.btnPrimary} onClick={() => setMode('new')}>
            ＋ Додати ключ
          </button>
        )}
      </header>

      <Guide />
      {note && <p className={note.ok ? styles.noteOk : styles.noteErr}>{note.text}</p>}

      {mode !== null ? (
        <KeyEditor
          key={String(mode)}
          editing={editing}
          defaultVoice={defaultVoice}
          accounts={accounts}
          keys={keys}
          busy={busy}
          onSave={save}
          onCancel={() => setMode(null)}
        />
      ) : (
        <>
          <section className={styles.account}>
            <h2>Ключі</h2>
            {keys.length === 0 && <p className={styles.empty}>Ще немає жодного ключа. Натисни «＋ Додати ключ».</p>}
            {keys.map((key) => (
              <div key={key.id} className={styles.keyRow}>
                <div className={styles.keyMain}>
                  <strong>{key.label || 'Без назви'}</strong>
                  <code>{key.readable ? key.keyHint : 'не читається — введи ключ заново'}</code>
                  <span className={styles.meta}>{key.voice}</span>
                </div>
                <span className={key.isGlobal ? styles.pillOn : styles.pillOff}>
                  {key.isGlobal
                    ? '🌍 глобальний — для всіх'
                    : key.accountIds.length > 0
                      ? `для: ${key.accountIds.map((id) => emailOf.get(id) ?? `#${id}`).join(', ')}`
                      : 'нікому не призначено'}
                </span>
                <div className={styles.actions}>
                  <button type="button" className={styles.btn} disabled={busy} onClick={() => setMode(key.id)}>
                    Редагувати
                  </button>
                  <button type="button" className={styles.btn} disabled={busy || !key.readable} onClick={() => void test(key)}>
                    ▶ Перевірити
                  </button>
                  <button type="button" className={styles.btnDanger} disabled={busy} onClick={() => remove(key)}>
                    Видалити
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section className={styles.account}>
            <h2>Акаунти</h2>
            <p className={styles.meta}>Вимкни перемикач, щоб акаунт не користувався Google Speech, навіть якщо ключ для нього є.</p>
            {accounts.map((account) => {
              const status = speechStatus(account, keys);
              return (
                <div key={account.id} className={styles.voiceLine}>
                  <strong>{account.email}</strong>
                  <span className={status.live ? styles.pillOn : styles.pillOff}>{status.text}</span>
                  <SpeechSwitch
                    account={account}
                    adminKey={adminKey}
                    onChange={(next) => setAccounts((list) => list.map((a) => (a.id === next.id ? next : a)))}
                  />
                </div>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}
