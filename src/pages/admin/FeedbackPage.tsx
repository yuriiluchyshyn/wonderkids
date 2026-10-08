import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ApiError,
  adminApi,
  type FeedbackKind,
  type FeedbackLetter,
  type FeedbackStatus,
} from '@/core/account/api/client';
import { errorText } from './shared';
import styles from './Admin.module.css';

const KIND: Record<FeedbackKind, string> = {
  bug: '🐞 Помилка',
  idea: '💡 Ідея',
  game: '🎮 Нова гра',
  other: '✉️ Інше',
};

const STATUS: Record<FeedbackStatus, string> = {
  new: 'нове',
  answered: 'є відповідь',
  done: 'закрито',
};

type Filter = 'open' | 'all' | FeedbackStatus;

const FILTERS: [Filter, string][] = [
  ['open', 'Відкриті'],
  ['new', 'Нові'],
  ['answered', 'З відповіддю'],
  ['done', 'Закриті'],
  ['all', 'Усі'],
];

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const megabytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} МБ`;

/** The mail service's own words, when it refused a letter. */
const failure = (err: unknown) =>
  err instanceof ApiError && typeof err.data.detail === 'string' && err.data.detail
    ? `${errorText(err)} (${err.data.detail})`
    : errorText(err);

/** Where the letter is on its way to the owner's mailbox. */
function mailLine(letter: FeedbackLetter): { ok: boolean; text: string } {
  if (letter.mailedAt) return { ok: true, text: `переслано на пошту ${dateTime(letter.mailedAt)}` };
  if (letter.mailError) return { ok: false, text: `на пошту не переслано: ${letter.mailError}` };
  return { ok: false, text: 'на пошту ще не переслано' };
}

function LetterCard({
  letter,
  adminKey,
  onChange,
}: {
  letter: FeedbackLetter;
  adminKey: string;
  onChange: (letters: FeedbackLetter[]) => void;
}) {
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mail = mailLine(letter);

  const run = async (action: () => Promise<{ letters: FeedbackLetter[] }>, after?: () => void) => {
    setBusy(true);
    setError(null);
    try {
      onChange((await action()).letters);
      after?.();
    } catch (err) {
      setError(failure(err));
    } finally {
      setBusy(false);
    }
  };

  const update = (change: Parameters<typeof adminApi.updateFeedback>[2], after?: () => void) =>
    run(() => adminApi.updateFeedback(adminKey, letter.id, change), after);

  const remove = () => {
    if (!window.confirm(`Видалити звернення №${letter.id} разом із відповідями? Цього не можна скасувати.`)) return;
    void run(() => adminApi.deleteFeedback(adminKey, letter.id));
  };

  return (
    <section className={styles.account}>
      <div className={styles.accountHead}>
        <h2>
          {KIND[letter.kind] ?? letter.kind} · №{letter.id}
        </h2>
        <span className={letter.status === 'new' ? styles.pillOn : styles.pillOff}>{STATUS[letter.status]}</span>
        <span className={styles.meta}>
          {dateTime(letter.createdAt)} ·{' '}
          {letter.email ? <a href={`mailto:${letter.email}`}>{letter.email}</a> : 'без адреси'}
        </span>
      </div>

      <p className={styles.letterText}>{letter.message}</p>

      {letter.files.length > 0 && (
        <p className={styles.meta}>
          📎 {letter.files.map((f) => `${f.name} (${megabytes(f.size)})`).join(', ')} — файли є лише в листі на пошті.
        </p>
      )}
      <p className={mail.ok ? styles.meta : styles.warn}>
        {mail.ok ? '✉️' : '⚠️'} {mail.text}
        {!mail.ok && letter.files.length > 0 && !letter.filesWaiting && ' Файли вже не збереглися — перешлеться лише текст.'}
      </p>
      {letter.userAgent && <p className={styles.meta}>{letter.userAgent}</p>}

      {letter.replies.map((r) => (
        <div key={r.id} className={styles.reply}>
          <span className={styles.meta}>Відповідь · {dateTime(r.createdAt)}</span>
          <p className={styles.letterText}>{r.body}</p>
        </div>
      ))}

      {letter.email ? (
        <label className={styles.field}>
          Відповісти на {letter.email}
          <textarea
            className={styles.replyBox}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            maxLength={4000}
            rows={4}
            placeholder="Текст листа. Початкове звернення буде процитовано нижче."
          />
        </label>
      ) : (
        <p className={styles.meta}>Автор не залишив пошти — відповісти нікуди.</p>
      )}

      <div className={styles.actions}>
        {letter.email && (
          <button
            type="button"
            className={styles.btnPrimary}
            disabled={busy || !reply.trim()}
            onClick={() => void update({ reply }, () => setReply(''))}
          >
            {busy ? 'Надсилаю…' : 'Надіслати відповідь'}
          </button>
        )}
        {letter.status === 'done' ? (
          <button type="button" className={styles.btn} disabled={busy} onClick={() => void update({ status: 'new' })}>
            Відкрити знову
          </button>
        ) : (
          <button type="button" className={styles.btn} disabled={busy} onClick={() => void update({ status: 'done' })}>
            ✓ Закрити
          </button>
        )}
        {!letter.mailedAt && (
          <button type="button" className={styles.btn} disabled={busy} onClick={() => void update({ resend: true })}>
            Переслати на пошту
          </button>
        )}
        <button type="button" className={styles.btnDanger} disabled={busy} onClick={remove}>
          Видалити
        </button>
        {error && <span className={styles.noteErr}>{error}</span>}
      </div>
    </section>
  );
}

/**
 * `/admin/feedback` — letters from the «Написати нам» form of the public
 * site: read them, answer by email, close them. Attached photos and videos
 * are not stored; they exist only in the copy forwarded to the owner's mailbox.
 */
export function FeedbackPage({ adminKey }: { adminKey: string }) {
  const [letters, setLetters] = useState<FeedbackLetter[]>([]);
  const [mailReady, setMailReady] = useState(true);
  const [filter, setFilter] = useState<Filter>('open');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.listFeedback(adminKey);
      setLetters(data.letters);
      setMailReady(data.mailReady);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(
    () =>
      letters.filter((l) => (filter === 'all' ? true : filter === 'open' ? l.status !== 'done' : l.status === filter)),
    [letters, filter],
  );
  const count = (status: FeedbackStatus) => letters.filter((l) => l.status === status).length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/admin" className={styles.btn}>
          ← Акаунти
        </Link>
        <h1>✉️ Звернення</h1>
        <div className={styles.totals}>
          <span>Нових: {count('new')}</span>
          <span>З відповіддю: {count('answered')}</span>
          <span>Закритих: {count('done')}</span>
        </div>
        <button type="button" className={styles.btn} onClick={() => void load()} disabled={loading}>
          ↻ Оновити
        </button>
      </header>

      {!mailReady && (
        <p className={`${styles.warn} ${styles.empty}`}>
          ⚠️ Пошту не налаштовано: звернення зберігаються тут, але не пересилаються, а фото й відео губляться. Задай
          на сервері <code>RESEND_API_KEY</code> і <code>FEEDBACK_TO</code>.
        </p>
      )}

      <div className={`${styles.actions} ${styles.empty} ${styles.filters}`}>
        {FILTERS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={filter === id ? styles.btnPrimary : styles.btn}
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className={styles.noteErr}>{error}</p>}
      {!loading && visible.length === 0 && <p className={styles.empty}>Тут порожньо.</p>}

      {visible.map((letter) => (
        <LetterCard key={letter.id} letter={letter} adminKey={adminKey} onChange={setLetters} />
      ))}
    </div>
  );
}
