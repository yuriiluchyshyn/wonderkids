import { useEffect, useState, type FormEvent } from 'react';
import { adminApi, type CloudVoice, type ProductSettings, type SpeechAudience } from '@/core/account/api/client';
import { LANG_CODES, LANGUAGES, type LangCode } from '@/core/language';
import { errorFor, errorText } from './shared';
import styles from './Admin.module.css';

const AUDIENCES: { id: SpeechAudience; label: string }[] = [
  { id: 'accounts', label: 'Усі акаунти' },
  { id: 'trial', label: 'Пробна гра' },
];

const GENDER: Record<string, string> = { FEMALE: 'жіночий', MALE: 'чоловічий', NEUTRAL: 'нейтральний' };

const voiceLabel = (voice: CloudVoice): string => (voice.gender && GENDER[voice.gender] ? `${voice.name} · ${GENDER[voice.gender]}` : voice.name);

type Choices = Record<SpeechAudience, Record<LangCode, string>>;

/**
 * The voice each language is read in — once for every account, once for the
 * trial game. The lists are the voices Google offers for the language (asked
 * with whatever key is stored); ▶ plays a sample before anything is saved.
 * «By default» keeps the old way: an account hears its key's voice when that is
 * of the language, the language's own voice otherwise.
 */
export function VoicePicker({ adminKey, settings, onSaved }: { adminKey: string; settings: ProductSettings; onSaved: (next: ProductSettings) => void }) {
  const [choices, setChoices] = useState<Choices>(settings.voices);
  const [offered, setOffered] = useState<Record<LangCode, CloudVoice[]> | null>(null);
  const [listNote, setListNote] = useState<string | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .listCloudVoices(adminKey)
      .then((result) => {
        if (result.ok && result.voices) setOffered(result.voices);
        else setListNote(`Не вдалося отримати список голосів Google: ${errorFor(result.error)} ${result.detail ?? ''}`.trim());
      })
      .catch((err) => setListNote(errorText(err)));
  }, [adminKey]);

  const changed = AUDIENCES.some(({ id }) => LANG_CODES.some((lang) => choices[id][lang] !== settings.voices[id][lang]));

  const pick = (who: SpeechAudience, lang: LangCode, voice: string) => {
    setChoices((now) => ({ ...now, [who]: { ...now[who], [lang]: voice } }));
    setNote(null);
  };

  /** What a list offers: Google's voices, plus whatever is chosen now even if Google no longer lists it. */
  const options = (lang: LangCode, current: string): CloudVoice[] => {
    const list = offered?.[lang] ?? [];
    return current && !list.some((v) => v.name === current) ? [{ name: current, gender: null }, ...list] : list;
  };

  const hear = async (who: SpeechAudience, lang: LangCode) => {
    const slot = `${who}:${lang}`;
    setPlaying(slot);
    setNote(null);
    try {
      const result = await adminApi.hearVoice(adminKey, who, lang, choices[who][lang]);
      if (!result.ok || !result.audio) throw new Error(`${errorFor(result.error)} ${result.detail ?? ''}`.trim());
      await new Audio(`data:audio/mpeg;base64,${result.audio}`).play();
    } catch (err) {
      setNote({ ok: false, text: errorText(err) });
    } finally {
      setPlaying(null);
    }
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNote(null);
    try {
      const next = (await adminApi.saveSettings(adminKey, { voices: choices })).settings;
      onSaved(next);
      setChoices(next.voices);
      setNote({ ok: true, text: '✓ Збережено' });
    } catch (err) {
      setNote({ ok: false, text: errorText(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={styles.editor} onSubmit={save}>
      <h2>🗣️ Голоси озвучки</h2>
      <p className={styles.meta}>
        Яким голосом Google читається кожна мова — для всіх акаунтів і окремо для пробної гри. «За замовчуванням» —
        як було: акаунт чує голос свого ключа (якщо він цієї мови), інакше — типовий голос мови. Вибраний тут голос
        важливіший за голос ключа. ▶ — послухати до збереження. Нові фрази озвучуються новим голосом одразу; ті, що вже
        звучали, сервер озвучить заново при першому ж запиті.
      </p>
      {listNote && <p className={styles.noteErr}>{listNote}</p>}
      {LANG_CODES.map((lang) => (
        <div key={lang} className={styles.voiceLine}>
          <strong className={styles.voiceLang}>
            {LANGUAGES[lang].flag} {LANGUAGES[lang].name}
          </strong>
          <div className={styles.fields}>
            {AUDIENCES.map(({ id, label }) => (
              <label key={id} className={styles.field}>
                <span>{label}</span>
                <span className={styles.voicePick}>
                  <select value={choices[id][lang]} onChange={(e) => pick(id, lang, e.target.value)}>
                    <option value="">
                      За замовчуванням ({id === 'accounts' ? 'голос ключа або ' : ''}
                      {settings.defaultVoices[lang]})
                    </option>
                    {options(lang, choices[id][lang]).map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voiceLabel(voice)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={styles.btn}
                    disabled={playing !== null}
                    onClick={() => void hear(id, lang)}
                    aria-label={`Послухати: ${label}, ${LANGUAGES[lang].name}`}
                  >
                    {playing === `${id}:${lang}` ? '…' : '▶'}
                  </button>
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <div className={styles.actions}>
        <button type="submit" className={styles.btnPrimary} disabled={busy || !changed}>
          {busy ? 'Зберігаю…' : 'Зберегти'}
        </button>
        {changed && (
          <button type="button" className={styles.btn} onClick={() => setChoices(settings.voices)}>
            Скасувати
          </button>
        )}
        {note && <span className={note.ok ? styles.noteOk : styles.noteErr}>{note.text}</span>}
      </div>
    </form>
  );
}
