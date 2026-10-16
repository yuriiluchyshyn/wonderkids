import { useEffect, useState, type FormEvent } from 'react';
import { adminApi, type SpeechKey } from '@/core/account/api/client';
import { LANG_CODES, LANGUAGES, stressed, voiced, type LangCode } from '@/core/language';
import { errorFor, errorText } from './shared';
import styles from './Admin.module.css';

/** The stress marks made visible: «колесо́» → «колесО». */
const shown = (text: string): string => text.replace(/(.)́/gu, (_, vowel: string) => vowel.toLocaleUpperCase());

/**
 * Hear a phrase as the cloud voice gets it: made ready for the voice
 * (`voiced`), its stresses marked from the dictionary (`core/language/stress.ts`)
 * — the marks are shown as capitals — and read with a key of the owner's choice.
 */
export function StressTester({ adminKey, trialReady }: { adminKey: string; trialReady: boolean }) {
  const [keys, setKeys] = useState<SpeechKey[]>([]);
  const [key, setKey] = useState<number | 'trial'>('trial');
  const [lang, setLang] = useState<LangCode>('uk');
  const [text, setText] = useState('Колесо котиться до замку. Корова дає молоко.');
  const [marked, setMarked] = useState<string | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminApi
      .listSpeechKeys(adminKey)
      .then(({ keys: list }) => {
        setKeys(list);
        if (!trialReady && list[0]) setKey(list[0].id);
      })
      .catch(() => undefined);
  }, [adminKey, trialReady]);

  const listen = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNote(null);
    try {
      const said = await stressed(voiced(text, lang), lang);
      setMarked(said);
      const result = await adminApi.testSpeechKey(adminKey, key, { text: said, lang });
      if (!result.ok || !result.audio) throw new Error(`${errorFor(result.error)} ${result.detail ?? ''}`.trim());
      await new Audio(`data:audio/mpeg;base64,${result.audio}`).play();
    } catch (err) {
      setNote({ ok: false, text: errorText(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={styles.editor} onSubmit={listen}>
      <h2>🔊 Перевірити наголоси</h2>
      <p className={styles.meta}>
        Фраза йде до голосу Google так само, як у грі: числа стають словами, а наголоси зі словника позначаються знаком
        наголосу. Нижче їх видно великими літерами. На екрані гри наголосів не видно.
      </p>
      <div className={styles.fields}>
        <label className={styles.field}>
          <span>Фраза</span>
          <input value={text} onChange={(e) => setText(e.target.value)} maxLength={380} />
        </label>
        <label className={styles.field}>
          <span>Мова</span>
          <select value={lang} onChange={(e) => setLang(e.target.value as LangCode)}>
            {LANG_CODES.map((code) => (
              <option key={code} value={code}>
                {LANGUAGES[code].flag} {LANGUAGES[code].name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Ключ</span>
          <select value={String(key)} onChange={(e) => setKey(e.target.value === 'trial' ? 'trial' : Number(e.target.value))}>
            <option value="trial" disabled={!trialReady}>
              Ключ пробної гри
            </option>
            {keys.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label || k.keyHint} — {k.voice}
              </option>
            ))}
          </select>
        </label>
      </div>
      {marked !== null && (
        <p className={styles.meta}>
          Голос отримав: <b>{shown(marked)}</b>
        </p>
      )}
      <div className={styles.actions}>
        <button type="submit" className={styles.btnPrimary} disabled={busy || !text.trim()}>
          {busy ? 'Слухаю…' : '▶ Прослухати'}
        </button>
        {note && <span className={note.ok ? styles.noteOk : styles.noteErr}>{note.text}</span>}
      </div>
    </form>
  );
}
