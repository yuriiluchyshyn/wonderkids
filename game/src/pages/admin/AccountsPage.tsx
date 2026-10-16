import { themeOf } from '@/core/theme/localTheme';
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react';
import { adminApi, type AdminAccount, type AdminChild, type SpeechKey } from '@/core/account/api/client';
import { moduleRegistry } from '@/core/game/kernel/ModuleRegistry';
import { isFreePlay } from '@/core/game/kernel/gameConfig';
import { subSteps } from '@/core/child/progress/path';
import { playsKey } from '@/core/child/progress/plays';
import type { ThemeId } from '@/core/theme/theme.types';
import { computeAge } from '@/core/utils/age';
import { errorText, formatDate, formatMoment, lookalikes, speechStatus, timeAgo } from './shared';
import { SortTable, type Column } from './Table';
import { channelName, channelOf } from './SourcesPage';
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
  const theme = child.themeId ? themeOf(child.themeId as ThemeId, 'uk') : undefined;
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
          {child.playing ? (
            <span className={styles.pillOn}>▶️ грає зараз</span>
          ) : (
            <span title={formatMoment(child.lastPlayedAt)}>🕹️ {child.lastPlayedAt ? timeAgo(child.lastPlayedAt) : 'ще не грав'}</span>
          )}
        </span>
        <span className={styles.caret} aria-hidden>
          {open ? '▴' : '▾'}
        </span>
      </button>
      {open && (
        <>
          <p className={styles.meta}>
            Створено {formatDate(child.createdAt)} · остання гра {formatMoment(child.lastPlayedAt)}
          </p>
          <ChildProgress child={child} />
        </>
      )}
    </div>
  );
}

/** A small round button of a row: a switch when `on` is given, a plain action otherwise. */
function RowButton({ icon, label, on, danger, busy, onClick }: { icon: string; label: string; on?: boolean; danger?: boolean; busy?: boolean; onClick: () => void }) {
  const look = danger ? styles.iconBtnDanger : on === undefined ? styles.iconBtn : on ? styles.iconBtnOn : styles.iconBtnOff;
  return (
    <button
      type="button"
      className={look}
      role={on === undefined ? undefined : 'switch'}
      aria-checked={on}
      aria-label={label}
      title={label}
      disabled={busy}
      onClick={onClick}
    >
      <span aria-hidden>{icon}</span>
    </button>
  );
}

/** When any child of the account last played; 0 — never. */
const lastPlayed = (account: AdminAccount) => Math.max(0, ...account.children.map((c) => c.lastPlayedAt ?? 0));
/** When the account was last here at all — seen, or a child playing; 0 — never. */
const lastActive = (account: AdminAccount) => Math.max(lastPlayed(account), account.lastSeenAt ? new Date(account.lastSeenAt).getTime() : 0);
/** How the table sorts by activity: playing now first, then online, then by the last visit. */
const activityRank = (account: AdminAccount) => (account.playing ? 2e13 : account.online ? 1e13 : 0) + lastActive(account);

/** How often the page asks again while it is open: who is online changes by the minute. */
const REFRESH_MS = 30_000;

/** Who is playing or online now, or when the account was last here. */
function ActivityCell({ account }: { account: AdminAccount }) {
  if (account.playing) {
    const who = account.children.filter((c) => c.playing).map((c) => c.name);
    return <span className={styles.pillOn} title="Дитина зараз проходить рівень">▶️ грає: {who.join(', ')}</span>;
  }
  if (account.online) return <span className={styles.pillOn} title={`Відкрито гру або кабінет · ${formatMoment(account.lastSeenAt)}`}>🟢 онлайн</span>;
  const played = lastPlayed(account);
  const active = lastActive(account);
  if (!active) return <span className={styles.meta}>—</span>;
  return (
    <span title={`Востаннє заходили: ${formatMoment(account.lastSeenAt)}\nВостаннє грали: ${formatMoment(played || null)}`}>
      {timeAgo(active)}
      {played > 0 && played < active - 60_000 && <span className={styles.meta}> · гра {timeAgo(played)}</span>}
    </span>
  );
}
const tasksDone = (account: AdminAccount) => account.children.reduce((n, c) => n + c.tasksCompleted, 0);

/** The plan as the admin page says it. */
const PLAN_NAME: Record<string, string> = { none: '— не вибрано', free: 'Базовий', family: 'Family', gift: '🎁 Подарунок' };
const planRank = (account: AdminAccount) => ({ gift: 3, family: 2, free: 1, none: 0 } as Record<string, number>)[account.billing?.access ?? 'none'] ?? 0;

function PlanCell({ account }: { account: AdminAccount }) {
  const billing = account.billing;
  const access = billing?.access ?? 'none';
  const details = [
    billing?.status === 'trialing' && billing.trialEnd ? `тріал до ${formatDate(billing.trialEnd)}` : null,
    billing?.status && billing.status !== 'trialing' && access === 'family' ? billing.status : null,
    billing?.children ? `${billing.children} діт.` : null,
    billing?.period === 'year' ? 'рік' : billing?.period === 'month' ? 'місяць' : null,
    billing?.cancelAtPeriodEnd ? `→ Базовий ${formatDate(billing.periodEnd)}` : null,
    billing?.gift === 'promo' && billing.giftCode ? `код ${billing.giftCode}` : null,
  ].filter(Boolean);
  return (
    <span title={details.join(' · ')}>
      <span className={access === 'family' || access === 'gift' ? styles.pillOn : styles.pillOff}>{PLAN_NAME[access]}</span>
      {details.length > 0 && <span className={styles.meta}> {details.join(' · ')}</span>}
    </span>
  );
}

/**
 * Admin home: every registered parent as a row of a table — a tap on a row
 * unfolds the account (where it came from, its children and each child's
 * progress in every game), and the small buttons on the right act on it:
 * Google Speech on/off, the whole account on/off, delete. The keys of Google
 * Speech live on their own page (`/admin/settings/speech`).
 */
export function AccountsPage({ adminKey }: { adminKey: string }) {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [keys, setKeys] = useState<SpeechKey[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  /** The account a button is working on, so it cannot be pressed twice. */
  const [busyId, setBusyId] = useState<number | null>(null);
  const [onlineOnly, setOnlineOnly] = useState(false);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
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
    // Who is online changes by the minute: the page asks again quietly while it is open and in sight.
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load(true);
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const here = onlineOnly ? accounts.filter((a) => a.online) : accounts;
    if (!q) return here;
    return here.filter(
      (a) =>
        a.email.toLowerCase().includes(q) ||
        a.children.some((c) => c.name.toLowerCase().includes(q) || c.nickname.toLowerCase().includes(q)),
    );
  }, [accounts, query, onlineOnly]);

  /** One change of one account: the row waits, a failure is said above the table. */
  const act = async (account: AdminAccount, work: () => Promise<AdminAccount | null>) => {
    setBusyId(account.id);
    setError(null);
    try {
      const next = await work();
      setAccounts((list) => (next ? list.map((a) => (a.id === next.id ? next : a)) : list.filter((a) => a.id !== account.id)));
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusyId(null);
    }
  };

  const toggleGift = (account: AdminAccount) => {
    const on = account.billing?.gift !== 'admin';
    if (on && !window.confirm(`Подарувати Family акаунту ${account.email}? Без оплати й без обмежень, доки не забереш подарунок.`)) return;
    void act(account, async () => {
      await adminApi.setGift(adminKey, account.id, on);
      const billing = account.billing ?? { access: 'none' as const, status: null, period: null, children: null, periodEnd: null, trialEnd: null, cancelAtPeriodEnd: false, gift: null, giftCode: null };
      return { ...account, billing: { ...billing, gift: on ? 'admin' : null, access: on ? 'gift' : billing.status && ['trialing', 'active', 'past_due'].includes(billing.status) ? 'family' : billing.access === 'gift' ? 'none' : billing.access } };
    });
  };

  const toggleSpeech = (account: AdminAccount) =>
    act(account, async () => ({ ...account, speechOff: (await adminApi.setSpeechEnabled(adminKey, account.id, account.speechOff)).speechOff }));

  const toggleAccount = (account: AdminAccount) => {
    if (!account.disabled && !window.confirm(`Вимкнути акаунт ${account.email}? Ні батьки, ні діти не зможуть увійти, доки не ввімкнеш його знову. Діти й прогрес залишаться.`)) return;
    void act(account, async () => ({ ...account, disabled: (await adminApi.setAccountEnabled(adminKey, account.id, account.disabled)).disabled }));
  };

  const remove = (account: AdminAccount) => {
    const kids = account.children.length;
    const warning = kids
      ? `Разом із ним буде видалено дітей (${kids}) і весь їхній прогрес. Цього не можна скасувати.`
      : 'У ньому немає дітей.';
    if (!window.confirm(`Видалити акаунт ${account.email}? ${warning}`)) return;
    void act(account, async () => {
      await adminApi.deleteAccount(adminKey, account.id);
      return null;
    });
  };

  const childCount = accounts.reduce((n, a) => n + a.children.length, 0);
  const voiceOn = accounts.filter((a) => speechStatus(a, keys).live).length;
  const off = accounts.filter((a) => a.disabled).length;
  const playingNow = accounts.filter((a) => a.playing).length;
  const onlineNow = accounts.filter((a) => a.online).length;

  const columns: Column<AdminAccount>[] = [
    {
      id: 'email',
      label: 'Акаунт',
      value: (a) => a.email,
      render: (a) => (
        <span className={styles.accountCell}>
          <strong>{a.email}</strong>
          {a.disabled && <span className={styles.pillOff}>вимкнено</span>}
          {(a.duplicateMailbox || lookalikes(a, accounts).length > 0) && <span title={a.duplicateMailbox ? 'Дублікат поштової скриньки' : 'Схожий на інший акаунт'}>⚠️</span>}
        </span>
      ),
    },
    { id: 'created', label: 'Створено', value: (a) => new Date(a.createdAt).getTime(), render: (a) => formatDate(a.createdAt) },
    { id: 'children', label: 'Дітей', value: (a) => a.children.length },
    { id: 'tasks', label: 'Завдань', value: tasksDone },
    { id: 'activity', label: 'Активність', value: activityRank, render: (a) => <ActivityCell account={a} /> },
    { id: 'plan', label: 'План', value: planRank, render: (a) => <PlanCell account={a} /> },
    { id: 'source', label: 'Звідки', value: (a) => channelName(channelOf(a)), render: (a) => (a.signup ? channelName(channelOf(a)) : '—') },
    {
      id: 'voice',
      label: 'Голос',
      value: (a) => (speechStatus(a, keys).live ? 1 : 0),
      render: (a) => {
        const status = speechStatus(a, keys);
        return (
          <span className={status.live ? styles.pillOn : styles.pillOff} title={`Google Speech — ${status.text}`}>
            {status.live ? 'Google' : status.key ? 'вимкнено' : 'браузер'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      label: 'Дії',
      sortable: false,
      value: () => 0,
      render: (a) => (
        // A button acts on the account; it must not also unfold the row.
        <div className={styles.rowActions} onClick={(e: MouseEvent) => e.stopPropagation()}>
          <RowButton icon="🎁" on={a.billing?.gift === 'admin'} busy={busyId === a.id} label={a.billing?.gift === 'admin' ? 'Family у подарунок — забрати' : 'Подарувати Family (без оплати)'} onClick={() => toggleGift(a)} />
          <RowButton icon="🗣️" on={!a.speechOff} busy={busyId === a.id} label={a.speechOff ? 'Google Speech вимкнено — увімкнути' : 'Google Speech увімкнено — вимкнути'} onClick={() => void toggleSpeech(a)} />
          <RowButton icon="⏻" on={!a.disabled} busy={busyId === a.id} label={a.disabled ? 'Акаунт вимкнено — увімкнути' : 'Акаунт увімкнено — вимкнути'} onClick={() => toggleAccount(a)} />
          <RowButton icon="🗑️" danger busy={busyId === a.id} label="Видалити акаунт" onClick={() => remove(a)} />
        </div>
      ),
    },
  ];

  const detail = (account: AdminAccount) => {
    const similar = lookalikes(account, accounts);
    const { signup } = account;
    return (
      <div className={styles.accountDetail}>
        <p className={styles.meta}>
          #{account.id} · з {formatDate(account.createdAt)}
          {signup
            ? ` · прийшов із: ${[channelName(channelOf(account)), signup.medium, signup.campaign].filter(Boolean).join(' · ')}${signup.link ? ` · посилання ${signup.link}` : ''}`
            : ' · без мітки джерела'}
          {` · 🗣️ Google Speech — ${speechStatus(account, keys).text}`}
        </p>
        {account.disabled && <p className={styles.warn}>⏻ Акаунт вимкнено: ні батьки, ні діти не можуть увійти. Усе, що в ньому є, збережено.</p>}
        {(account.duplicateMailbox || similar.length > 0) && (
          <p className={styles.warn}>
            {account.duplicateMailbox
              ? '⚠️ Дублікат: ця адреса веде до тієї самої поштової скриньки, що й інший акаунт. Вхід уже йде в основний — цей можна видалити.'
              : `⚠️ Дуже схожий на ${similar.map((a) => a.email).join(', ')} — імовірно, одруківка тієї самої людини.${
                  account.children.length === 0 ? ' Тут немає дітей, тож його можна видалити.' : ''
                }`}
          </p>
        )}
        {account.children.length === 0 ? (
          <p className={styles.meta}>Дітей ще не додано.</p>
        ) : (
          account.children.map((child) => <ChildRow key={child.id} child={child} />)
        )}
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>👨‍👩‍👧 Акаунти</h1>
        <div className={styles.totals}>
          <span>👨‍👩‍👧 Батьків: {accounts.length}</span>
          <span>🧒 Дітей: {childCount}</span>
          <span>🗣️ Google Speech: {voiceOn}</span>
          {off > 0 && <span>⏻ Вимкнено: {off}</span>}
          <span title="Діти, що зараз проходять рівень">▶️ Грають зараз: {playingNow}</span>
          <span title="Гра або кабінет відкриті протягом останніх 5 хвилин">🟢 Онлайн: {onlineNow}</span>
        </div>
        <button type="button" className={styles.btn} onClick={() => void load()} disabled={loading}>
          ↻ Оновити
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
      <label className={styles.radio}>
        <input type="checkbox" checked={onlineOnly} onChange={(e) => setOnlineOnly(e.target.checked)} />
        <span>Лише ті, хто зараз онлайн ({onlineNow})</span>
      </label>
      {error && <p className={styles.noteErr}>{error}</p>}
      {!loading && visible.length === 0 && <p className={styles.empty}>Нікого не знайдено.</p>}

      {visible.length > 0 && (
        <section className={styles.gamesSection}>
          <SortTable
            columns={columns}
            rows={visible}
            rowKey={(a) => a.id}
            initial={{ by: 'created', desc: true }}
            detail={detail}
            rowClass={(a) => (a.disabled ? styles.rowOff : undefined)}
          />
        </section>
      )}
    </div>
  );
}
