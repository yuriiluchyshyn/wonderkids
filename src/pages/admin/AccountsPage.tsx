import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, type AdminAccount, type AdminChild, type SpeechKey } from '@/core/account/api/client';
import { moduleRegistry } from '@/core/game/kernel/ModuleRegistry';
import { isFreePlay } from '@/core/game/kernel/gameConfig';
import { subSteps } from '@/core/child/progress/path';
import { playsKey } from '@/core/child/progress/plays';
import { THEMES } from '@/core/theme/themes';
import type { ThemeId } from '@/core/theme/theme.types';
import { computeAge } from '@/core/utils/age';
import { SpeechSwitch } from './SpeechSwitch';
import { errorText, formatDate, lookalikes, speechStatus } from './shared';
import styles from './Admin.module.css';

/** A child's progress grouped by subject, with every game listed. */
function ChildProgress({ child }: { child: AdminChild }) {
  return (
    <div className={styles.progress}>
      {moduleRegistry.getAll().map((module) => (
        <div key={module.id} className={styles.subject}>
          <h5 className={styles.subjectTitle}>
            {module.icon} {module.title}
          </h5>
          <ul className={styles.games}>
            {module.subCategories.map((sub) => {
              const free = isFreePlay(sub);
              const total = subSteps(sub);
              const step = Math.min(child.progress[`${module.id}:${sub.id}`] ?? 0, total);
              const plays = child.progress[playsKey(module.id, sub.id)] ?? 0;
              const started = free ? plays > 0 : step > 0;
              // The stored step is the frontier: steps below it are finished.
              const done = free ? 0 : Math.max(0, step - 1);
              return (
                <li key={sub.id} className={started ? styles.game : `${styles.game} ${styles.gameIdle}`}>
                  <span className={styles.gameName}>
                    {sub.icon} {sub.label}
                  </span>
                  {free ? (
                    <span className={styles.gameValue}>{plays > 0 ? `зіграно разів: ${plays}` : 'не грав'}</span>
                  ) : (
                    <>
                      <span className={styles.bar} aria-hidden>
                        <span className={styles.barFill} style={{ width: `${(done / total) * 100}%` }} />
                      </span>
                      <span className={styles.gameValue}>
                        {started ? `сходинка ${step} / ${total}` : 'не починав'}
                      </span>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ChildRow({ child }: { child: AdminChild }) {
  const [open, setOpen] = useState(false);
  const age = child.birthYear ? computeAge(child.birthYear, child.birthMonth ?? 6) : null;
  const theme = child.themeId ? THEMES[child.themeId as ThemeId] : undefined;
  const gamesStarted = Object.keys(child.progress).filter((k) => !k.includes('#')).length;

  return (
    <div className={styles.child}>
      <button type="button" className={styles.childHead} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className={styles.childName}>
          {child.gender === 'boy' ? '👦' : '👧'} {child.name}
          {child.nickname && <span className={styles.nick}> @{child.nickname}</span>}
        </span>
        <span className={styles.childStats}>
          {age !== null && <span>{age} р.</span>}
          <span title="Тема">{theme ? `${theme.icon} ${theme.name}` : '🌌 без теми'}</span>
          <span title="Кристалів зароблено за весь час">💎 {child.artifacts}</span>
          <span title="Завдань виконано">✅ {child.tasksCompleted}</span>
          <span title="Підказок показано">💡 {child.hintsSurfaced}</span>
          <span title="Ігор розпочато">🎮 {gamesStarted}</span>
          <span title={`Зіграно ${child.playedDay || 'сьогодні'}`}>⏳ {Math.round(child.playedTodayMinutes)} хв</span>
        </span>
        <span className={styles.caret} aria-hidden>
          {open ? '▴' : '▾'}
        </span>
      </button>
      {open && (
        <>
          <p className={styles.meta}>
            Створено {formatDate(child.createdAt)} · остання сесія {formatDate(child.lastSessionEndedAt)}
          </p>
          <ChildProgress child={child} />
        </>
      )}
    </div>
  );
}

/**
 * Admin home: every registered parent, the children they created and each
 * child's progress in every game. Google Speech is only summarised and
 * switched on/off here — keys live on their own page (`/admin/speech`).
 */
export function AccountsPage({ adminKey, onLogout }: { adminKey: string; onLogout: () => void }) {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [keys, setKeys] = useState<SpeechKey[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [users, speech] = await Promise.all([adminApi.listAccounts(adminKey), adminApi.listSpeechKeys(adminKey)]);
      setAccounts(users.accounts);
      setKeys(speech.keys);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) =>
        a.email.toLowerCase().includes(q) ||
        a.children.some((c) => c.name.toLowerCase().includes(q) || c.nickname.toLowerCase().includes(q)),
    );
  }, [accounts, query]);

  const remove = async (account: AdminAccount) => {
    const kids = account.children.length;
    const warning = kids
      ? `Разом із ним буде видалено дітей (${kids}) і весь їхній прогрес. Цього не можна скасувати.`
      : 'У ньому немає дітей.';
    if (!window.confirm(`Видалити акаунт ${account.email}? ${warning}`)) return;
    try {
      await adminApi.deleteAccount(adminKey, account.id);
      setAccounts((list) => list.filter((a) => a.id !== account.id));
    } catch (err) {
      setError(errorText(err));
    }
  };

  const childCount = accounts.reduce((n, a) => n + a.children.length, 0);
  const voiceOn = accounts.filter((a) => speechStatus(a, keys).live).length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>🛠️ Адмінпанель</h1>
        <div className={styles.totals}>
          <span>👨‍👩‍👧 Батьків: {accounts.length}</span>
          <span>🧒 Дітей: {childCount}</span>
          <span>🗣️ Google Speech: {voiceOn}</span>
        </div>
        <Link to="/admin/games" className={styles.btn}>
          🎮 Ігри
        </Link>
        <Link to="/admin/speech" className={styles.btnPrimary}>
          🗣️ Налаштувати Google Speech
        </Link>
        <button type="button" className={styles.btn} onClick={() => void load()} disabled={loading}>
          ↻ Оновити
        </button>
        <button type="button" className={styles.btn} onClick={onLogout}>
          Вийти
        </button>
      </header>

      <input
        className={styles.search}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Пошук за email, іменем або ніком дитини"
        aria-label="Пошук"
      />
      {error && <p className={styles.noteErr}>{error}</p>}
      {!loading && visible.length === 0 && <p className={styles.empty}>Нікого не знайдено.</p>}

      {visible.map((account) => {
        const status = speechStatus(account, keys);
        const similar = lookalikes(account, accounts);
        return (
          <section key={account.id} className={styles.account}>
            <div className={styles.accountHead}>
              <h2>{account.email}</h2>
              <span className={styles.meta}>
                #{account.id} · з {formatDate(account.createdAt)} · дітей: {account.children.length}
              </span>
              <button type="button" className={styles.btnDanger} onClick={() => void remove(account)}>
                Видалити акаунт
              </button>
            </div>
            {(account.duplicateMailbox || similar.length > 0) && (
              <p className={styles.warn}>
                {account.duplicateMailbox
                  ? '⚠️ Дублікат: ця адреса веде до тієї самої поштової скриньки, що й інший акаунт. Вхід уже йде в основний — цей можна видалити.'
                  : `⚠️ Дуже схожий на ${similar.map((a) => a.email).join(', ')} — імовірно, одруківка тієї самої людини.${
                      account.children.length === 0 ? ' Тут немає дітей, тож його можна видалити.' : ''
                    }`}
              </p>
            )}

            <div className={styles.voiceLine}>
              <strong>🗣️ Google Speech</strong>
              <span className={status.live ? styles.pillOn : styles.pillOff}>{status.text}</span>
              <SpeechSwitch
                account={account}
                adminKey={adminKey}
                onChange={(next) => setAccounts((list) => list.map((a) => (a.id === next.id ? next : a)))}
              />
            </div>

            {account.children.length === 0 ? (
              <p className={styles.empty}>Дітей ще не додано.</p>
            ) : (
              account.children.map((child) => <ChildRow key={child.id} child={child} />)
            )}
          </section>
        );
      })}
    </div>
  );
}
