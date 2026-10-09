import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi, type AdminAccount } from '@/core/account/api/client';
import { DEFAULT_SITE_URL, rootHost } from '@pulsar/platform';
import { getPortal } from '@/core/app/portal';
import { errorText } from './shared';
import styles from './Admin.module.css';

/** Channels with a name of their own; anything else is shown as its label. */
const CHANNELS: Record<string, string> = {
  facebook: '📘 Facebook',
  instagram: '📸 Instagram',
  youtube: '▶️ YouTube',
  tiktok: '🎵 TikTok',
  messenger: '💬 Messenger',
  'audience-network': '🌐 Audience Network',
};

/** Meta's ads fill `utm_source` with short codes of where the ad was shown. */
const META_CODES: Record<string, string> = { fb: 'facebook', ig: 'instagram', msg: 'messenger', an: 'audience-network' };

const NO_SOURCE = '';

/** The channel an account came through; hosts of Meta's link shims count as their network. */
export function channelOf(account: AdminAccount): string {
  const source = account.signup?.source;
  if (!source) return NO_SOURCE;
  if (META_CODES[source]) return META_CODES[source];
  for (const name of ['facebook', 'instagram', 'youtube', 'tiktok']) {
    if (source === `${name}.com` || source.endsWith(`.${name}.com`)) return name;
  }
  return source;
}

export const channelName = (channel: string) => (channel === NO_SOURCE ? '— без мітки' : CHANNELS[channel] ?? channel);

type Period = 7 | 30 | 0;
const PERIODS: [Period, string][] = [
  [7, '7 днів'],
  [30, '30 днів'],
  [0, 'Весь час'],
];

interface Row {
  key: string;
  label: string;
  accounts: number;
  withChildren: number;
  children: number;
  playing: number;
  tasks: number;
}

/** Accounts grouped by `keyOf`, biggest group first. */
function group(accounts: AdminAccount[], keyOf: (a: AdminAccount) => string, labelOf: (key: string) => string): Row[] {
  const rows = new Map<string, Row>();
  for (const account of accounts) {
    const key = keyOf(account);
    const row = rows.get(key) ?? { key, label: labelOf(key), accounts: 0, withChildren: 0, children: 0, playing: 0, tasks: 0 };
    row.accounts += 1;
    if (account.children.length > 0) row.withChildren += 1;
    row.children += account.children.length;
    row.playing += account.children.filter((c) => c.tasksCompleted > 0).length;
    row.tasks += account.children.reduce((n, c) => n + c.tasksCompleted, 0);
    rows.set(key, row);
  }
  return [...rows.values()].sort((a, b) => b.accounts - a.accounts || a.label.localeCompare(b.label));
}

function StatsTable({ first, rows, total }: { first: string; rows: Row[]; total: number }) {
  return (
    <div className={styles.gamesScroll}>
      <table className={styles.gamesTable}>
        <thead>
          <tr>
            <th>{first}</th>
            <th>Акаунтів</th>
            <th>Частка</th>
            <th>З дітьми</th>
            <th>Дітей</th>
            <th>Діти, що грали</th>
            <th>Виконано завдань</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>
                <strong>{row.label}</strong>
              </td>
              <td>{row.accounts}</td>
              <td>{total > 0 ? `${Math.round((row.accounts / total) * 100)}%` : '—'}</td>
              <td>{row.withChildren}</td>
              <td>{row.children}</td>
              <td>{row.playing}</td>
              <td>{row.tasks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The public site's address, to build links for the channels. */
function siteUrl(): string {
  if (getPortal() === 'dev') return `${DEFAULT_SITE_URL}/`;
  return `https://${rootHost(window.location.hostname)}/`;
}

const LINKS: { where: string; query: string; note?: string }[] = [
  {
    where: 'Реклама у Facebook та Instagram (поле «Параметри URL» в оголошенні)',
    query: 'utm_source={{site_source_name}}&utm_medium=paid&utm_campaign=parents-ua',
    note: 'Вставляється без адреси сайту. Meta сама підставить fb або ig — де саме показали оголошення.',
  },
  { where: 'Сторінка і дописи у Facebook', query: 'utm_source=facebook&utm_medium=social' },
  { where: 'Профіль і сторіз в Instagram', query: 'utm_source=instagram&utm_medium=social' },
  { where: 'Опис каналу й відео на YouTube', query: 'utm_source=youtube&utm_medium=video' },
  { where: 'Профіль у TikTok', query: 'utm_source=tiktok&utm_medium=social' },
];

function ChannelLinks() {
  const [copied, setCopied] = useState<string | null>(null);
  const site = siteUrl();

  const copy = (text: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      window.setTimeout(() => setCopied((now) => (now === text ? null : now)), 1500);
    });
  };

  return (
    <section className={styles.gamesSection}>
      <h2>🔗 Посилання для каналів</h2>
      <p className={styles.meta}>
        Став на кожен канал своє посилання — тоді нові акаунти з нього з’являться в таблиці вище. Для нової кампанії
        додай у кінець <code>&amp;utm_campaign=назва-латинкою</code> (малі літери, цифри, дефіс).
      </p>
      {LINKS.map(({ where, query, note }) => {
        const text = query.includes('{{') ? query : `${site}?${query}`;
        return (
          <div key={query} className={styles.sourceLink}>
            <div>
              <strong>{where}</strong>
              <code>{text}</code>
              {note && <span className={styles.meta}>{note}</span>}
            </div>
            <button type="button" className={styles.btn} onClick={() => copy(text)}>
              {copied === text ? '✓ Скопійовано' : 'Копіювати'}
            </button>
          </div>
        );
      })}
    </section>
  );
}

/**
 * `/admin/sources` — which channel brings families. Counted in the browser
 * from the accounts list: an account remembers the utm_* labels of the link
 * its parent arrived by (see `core/app/attribution.ts`), and the children's
 * progress shows whether the family stayed to play.
 */
export function SourcesPage({ adminKey }: { adminKey: string }) {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>(30);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAccounts((await adminApi.listAccounts(adminKey)).accounts);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const inPeriod = useMemo(() => {
    if (period === 0) return accounts;
    const since = Date.now() - period * 24 * 60 * 60 * 1000;
    return accounts.filter((a) => new Date(a.createdAt).getTime() >= since);
  }, [accounts, period]);

  const channels = useMemo(() => group(inPeriod, channelOf, channelName), [inPeriod]);
  const campaigns = useMemo(
    () =>
      group(
        inPeriod.filter((a) => a.signup),
        (a) => [channelOf(a), a.signup?.medium ?? '', a.signup?.campaign ?? ''].join(' / '),
        (key) => {
          const [channel, medium, campaign] = key.split(' / ');
          return [channelName(channel), medium || '—', campaign || '—'].join(' · ');
        },
      ),
    [inPeriod],
  );
  const labelled = inPeriod.filter((a) => a.signup).length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>📊 Джерела</h1>
        <div className={styles.totals}>
          <span>👨‍👩‍👧 Нових акаунтів: {inPeriod.length}</span>
          <span>🏷️ З міткою: {labelled}</span>
        </div>
        <button type="button" className={styles.btn} onClick={() => void load()} disabled={loading}>
          ↻ Оновити
        </button>
      </header>

      <div className={`${styles.actions} ${styles.empty} ${styles.filters}`}>
        {PERIODS.map(([days, label]) => (
          <button
            key={days}
            type="button"
            className={period === days ? styles.btnPrimary : styles.btn}
            aria-pressed={period === days}
            onClick={() => setPeriod(days)}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className={styles.noteErr}>{error}</p>}

      <section className={styles.gamesSection}>
        <h2>Канали</h2>
        <p className={styles.meta}>
          Звідки прийшли батьки, які створили акаунт за цей час. «Без мітки» — зайшли напряму, з пошуку або
          зареєструвалися до того, як джерело почали записувати.
        </p>
        {channels.length > 0 ? (
          <StatsTable first="Канал" rows={channels} total={inPeriod.length} />
        ) : (
          !loading && <p className={styles.empty}>За цей час нових акаунтів немає.</p>
        )}
      </section>

      {campaigns.length > 0 && (
        <section className={styles.gamesSection}>
          <h2>Кампанії</h2>
          <p className={styles.meta}>Те саме докладніше: канал · тип переходу · кампанія.</p>
          <StatsTable first="Канал · тип · кампанія" rows={campaigns} total={labelled} />
        </section>
      )}

      <ChannelLinks />
    </div>
  );
}
