import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { adminApi, type LinkMode, type MarketingLink, type MarketingVisit } from '@/core/account/api/client';
import { errorText } from './shared';
import { MODE_NAME, countryName, linkUrl } from './links';
import styles from './Admin.module.css';

type Period = 7 | 30 | 90 | 0;
const PERIODS: [Period, string][] = [
  [7, '7 днів'],
  [30, '30 днів'],
  [90, '90 днів'],
  [0, 'Весь час'],
];

const NO_LINK = '';
const ANY = '*';

const dateTime = (iso: string) => new Date(iso).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
/** `2026-10-10` in the owner's own time zone — sorts as text. */
const dayOf = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const dayName = (day: string) => day.split('-').reverse().join('.');

const VIA_NAME: Record<MarketingVisit['via'], string> = { link: 'за посиланням', site: 'кнопка на сайті' };
const DEVICE_NAME: Record<string, string> = { mobile: '📱 телефон', tablet: '📱 планшет', desktop: '💻 комп’ютер' };

const linkLabel = (visit: MarketingVisit) => (visit.link === null ? '— без посилання' : visit.linkName ? `${visit.linkName} (${visit.link})` : `${visit.link} (видалене)`);

// ---------------------------------------------------------------------------
// A table whose every column sorts
// ---------------------------------------------------------------------------

interface Column<Row> {
  id: string;
  label: string;
  /** What the column is sorted by. */
  value: (row: Row) => string | number;
  render?: (row: Row) => ReactNode;
}

function SortTable<Row>({ columns, rows, rowKey, initial }: { columns: Column<Row>[]; rows: Row[]; rowKey: (row: Row) => string | number; initial: { by: string; desc: boolean } }) {
  const [sort, setSort] = useState(initial);
  const sorted = useMemo(() => {
    const column = columns.find((c) => c.id === sort.by) ?? columns[0];
    const dir = sort.desc ? -1 : 1;
    return [...rows].sort((a, b) => {
      const x = column.value(a);
      const y = column.value(b);
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'uk')) * dir;
    });
  }, [rows, columns, sort]);

  return (
    <div className={styles.gamesScroll}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.id} aria-sort={sort.by === column.id ? (sort.desc ? 'descending' : 'ascending') : 'none'}>
                <button type="button" className={styles.sortBtn} onClick={() => setSort((now) => ({ by: column.id, desc: now.by === column.id ? !now.desc : true }))}>
                  {column.label}
                  <span aria-hidden>{sort.by === column.id ? (sort.desc ? ' ▼' : ' ▲') : ''}</span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.id}>{column.render ? column.render(row) : column.value(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={styles.btn}
      onClick={() =>
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        })
      }
    >
      {copied ? '✓ Скопійовано' : 'Копіювати'}
    </button>
  );
}

// ---------------------------------------------------------------------------
// A new link
// ---------------------------------------------------------------------------

function NewLink({ busy, onCreate }: { busy: boolean; onCreate: (link: { name: string; mode: LinkMode; code?: string; note?: string }) => Promise<boolean> }) {
  const [name, setName] = useState('');
  const [mode, setMode] = useState<LinkMode>('demo');
  const [code, setCode] = useState('');
  const [note, setNote] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (await onCreate({ name, mode, code: code.trim() || undefined, note })) {
      setName('');
      setCode('');
      setNote('');
    }
  };

  return (
    <form className={styles.editor} onSubmit={submit}>
      <h2>➕ Нове посилання</h2>
      <p className={styles.meta}>
        Одне посилання — на одне місце, де його поставиш: допис, біо профілю, оголошення, QR-код на флаєрі. Тоді видно,
        звідки хто прийшов.
      </p>
      <div className={styles.fields}>
        <label className={styles.field}>
          Назва — де воно стоятиме
          <input value={name} maxLength={80} placeholder="Instagram, біо профілю" onChange={(e) => setName(e.target.value)} />
        </label>
        <label className={styles.field}>
          Куди веде
          <select className={styles.select} value={mode} onChange={(e) => setMode(e.target.value as LinkMode)}>
            <option value="demo">Одразу в пробну гру</option>
            <option value="site">На сайт</option>
          </select>
        </label>
        <label className={styles.field}>
          Код в адресі (необов’язково)
          <input value={code} maxLength={40} placeholder="складеться з назви" onChange={(e) => setCode(e.target.value)} />
        </label>
        <label className={styles.field}>
          Примітка для себе
          <input value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} />
        </label>
      </div>
      <div className={styles.actions}>
        <button type="submit" className={styles.btnPrimary} disabled={busy || !name.trim()}>
          Створити посилання
        </button>
        <span className={styles.meta}>Код — латинські малі літери, цифри, дефіс; після створення не змінюється.</span>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Visits: filtered, then either counted by what was ticked or listed one by one
// ---------------------------------------------------------------------------

type Dim = 'day' | 'link' | 'country' | 'mode';
const DIMS: [Dim, string][] = [
  ['day', 'День'],
  ['link', 'Посилання'],
  ['country', 'Країна'],
  ['mode', 'Режим'],
];

interface Group {
  key: string;
  day: string;
  link: string;
  country: string;
  mode: string;
  visits: number;
  people: number;
  expired: number;
  cta: number;
}

function groupVisits(visits: MarketingVisit[], dims: Dim[]): Group[] {
  const groups = new Map<string, Group & { seen: Set<string> }>();
  for (const visit of visits) {
    const of: Record<Dim, string> = { day: dayOf(visit.createdAt), link: linkLabel(visit), country: countryName(visit.country), mode: MODE_NAME[visit.mode] };
    const key = dims.map((dim) => of[dim]).join('|');
    let group = groups.get(key);
    if (!group) {
      group = { key, ...of, visits: 0, people: 0, expired: 0, cta: 0, seen: new Set() };
      groups.set(key, group);
    }
    group.visits += 1;
    group.seen.add(visit.visitor);
    group.people = group.seen.size;
    if (visit.expiredAt) group.expired += 1;
    if (visit.ctaAt) group.cta += 1;
  }
  return [...groups.values()];
}

function Visits({ visits }: { visits: MarketingVisit[] }) {
  const [link, setLink] = useState(ANY);
  const [country, setCountry] = useState(ANY);
  const [mode, setMode] = useState<LinkMode | typeof ANY>(ANY);
  const [view, setView] = useState<'groups' | 'rows'>('groups');
  const [dims, setDims] = useState<Dim[]>(['day', 'link', 'country', 'mode']);

  const linkChoices = useMemo(() => {
    const seen = new Map<string, string>();
    for (const visit of visits) seen.set(visit.link ?? NO_LINK, linkLabel(visit));
    return [...seen].sort((a, b) => a[1].localeCompare(b[1], 'uk'));
  }, [visits]);
  const countryChoices = useMemo(() => [...new Set(visits.map((v) => v.country ?? ''))].sort((a, b) => countryName(a || null).localeCompare(countryName(b || null), 'uk')), [visits]);

  const shown = useMemo(
    () => visits.filter((v) => (link === ANY || (v.link ?? NO_LINK) === link) && (country === ANY || (v.country ?? '') === country) && (mode === ANY || v.mode === mode)),
    [visits, link, country, mode],
  );
  const people = useMemo(() => new Set(shown.map((v) => v.visitor)).size, [shown]);
  const groups = useMemo(() => groupVisits(shown, dims), [shown, dims]);

  const groupColumns: Column<Group>[] = [
    ...DIMS.filter(([dim]) => dims.includes(dim)).map(([dim, label]): Column<Group> => ({ id: dim, label, value: (g) => g[dim], render: dim === 'day' ? (g) => dayName(g.day) : undefined })),
    { id: 'visits', label: 'Візитів', value: (g) => g.visits },
    { id: 'people', label: 'Людей', value: (g) => g.people },
    { id: 'expired', label: 'Дограли до кінця', value: (g) => g.expired },
    { id: 'cta', label: '«Створити акаунт»', value: (g) => g.cta },
  ];
  const rowColumns: Column<MarketingVisit>[] = [
    { id: 'at', label: 'Коли', value: (v) => new Date(v.createdAt).getTime(), render: (v) => dateTime(v.createdAt) },
    { id: 'link', label: 'Посилання', value: linkLabel },
    { id: 'mode', label: 'Режим', value: (v) => MODE_NAME[v.mode] },
    { id: 'via', label: 'Як зайшли', value: (v) => VIA_NAME[v.via] },
    { id: 'country', label: 'Країна', value: (v) => countryName(v.country) },
    { id: 'lang', label: 'Мова', value: (v) => v.lang ?? '—' },
    { id: 'device', label: 'Пристрій', value: (v) => DEVICE_NAME[v.device ?? ''] ?? '—' },
    { id: 'referrer', label: 'Звідки', value: (v) => v.referrer ?? '—' },
    { id: 'expired', label: 'Дограли до кінця', value: (v) => (v.expiredAt ? 1 : 0), render: (v) => (v.expiredAt ? '✓' : '') },
    { id: 'cta', label: '«Створити акаунт»', value: (v) => (v.ctaAt ? 1 : 0), render: (v) => (v.ctaAt ? '✓' : '') },
  ];

  return (
    <section className={styles.gamesSection}>
      <h2>
        👣 Відвідування
        <span className={styles.gamesCount}>
          {shown.length} візитів · {people} людей
        </span>
      </h2>
      <p className={styles.meta}>
        Кожен перехід за твоїм посиланням і кожен вхід у пробну гру. «Людей» — скільки різних відвідувачів (за адресою
        пристрою в мережі; сама адреса не зберігається). Натисни на заголовок стовпця, щоб відсортувати.
      </p>

      <div className={styles.filterRow}>
        <label className={styles.field}>
          Посилання
          <select className={styles.select} value={link} onChange={(e) => setLink(e.target.value)}>
            <option value={ANY}>Усі</option>
            {linkChoices.map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          Країна
          <select className={styles.select} value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value={ANY}>Усі</option>
            {countryChoices.map((code) => (
              <option key={code} value={code}>
                {countryName(code || null)}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          Режим
          <select className={styles.select} value={mode} onChange={(e) => setMode(e.target.value as LinkMode | typeof ANY)}>
            <option value={ANY}>Усі</option>
            <option value="demo">{MODE_NAME.demo}</option>
            <option value="site">{MODE_NAME.site}</option>
          </select>
        </label>
        <label className={styles.field}>
          Показати
          <select className={styles.select} value={view} onChange={(e) => setView(e.target.value as 'groups' | 'rows')}>
            <option value="groups">Зведено</option>
            <option value="rows">Кожен візит</option>
          </select>
        </label>
      </div>

      {view === 'groups' && (
        <div className={styles.dims}>
          <span className={styles.meta}>Рахувати окремо за:</span>
          {DIMS.map(([dim, label]) => (
            <label key={dim} className={styles.dim}>
              <input type="checkbox" checked={dims.includes(dim)} onChange={(e) => setDims((now) => (e.target.checked ? DIMS.map(([d]) => d).filter((d) => d === dim || now.includes(d)) : now.filter((d) => d !== dim)))} />
              {label}
            </label>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className={styles.empty}>За цей час відвідувань немає.</p>
      ) : view === 'groups' ? (
        // Re-made when the columns change, so the sort never points at a column that is gone.
        <SortTable key={dims.join()} columns={groupColumns} rows={groups} rowKey={(g) => g.key} initial={{ by: dims.includes('day') ? 'day' : 'visits', desc: true }} />
      ) : (
        <SortTable columns={rowColumns} rows={shown} rowKey={(v) => v.id} initial={{ by: 'at', desc: true }} />
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

/**
 * `/admin/links` — the owner's own links and who came by them.
 *
 * A link is made here and handed out, one per place it is put; it leads to the
 * public site or straight into the trial game. Every arrival is kept in the
 * database (`wk_visits`): when, by which link, into which mode, from which
 * country — filtered, grouped and sorted here in the browser.
 */
export function LinksPage({ adminKey }: { adminKey: string }) {
  const [links, setLinks] = useState<MarketingLink[]>([]);
  const [visits, setVisits] = useState<MarketingVisit[]>([]);
  const [period, setPeriod] = useState<Period>(30);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  /** Runs a call that answers with the whole page; false when it failed. */
  const run = useCallback(async (call: () => Promise<{ links: MarketingLink[]; visits: MarketingVisit[] }>) => {
    setBusy(true);
    setError(null);
    try {
      const page = await call();
      setLinks(page.links);
      setVisits(page.visits);
      return true;
    } catch (err) {
      setError(errorText(err));
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const load = useCallback(() => run(() => adminApi.listLinks(adminKey, period)), [run, adminKey, period]);
  useEffect(() => {
    void load();
  }, [load]);

  const rename = (link: MarketingLink) => {
    const name = window.prompt('Нова назва посилання', link.name)?.trim();
    if (name && name !== link.name) void run(() => adminApi.renameLink(adminKey, period, link.id, name, link.note));
  };
  const remove = (link: MarketingLink) => {
    if (window.confirm(`Видалити посилання «${link.name}»? Воно перестане рахуватися; уже записані відвідування залишаться в статистиці.`)) {
      void run(() => adminApi.deleteLink(adminKey, period, link.id));
    }
  };

  const linkColumns: Column<MarketingLink>[] = [
    {
      id: 'name',
      label: 'Посилання',
      value: (l) => l.name,
      render: (l) => (
        <div className={styles.linkCell}>
          <strong>{l.name}</strong>
          <code>{linkUrl(l.mode, l.code)}</code>
          {l.note && <span className={styles.meta}>{l.note}</span>}
        </div>
      ),
    },
    { id: 'mode', label: 'Куди веде', value: (l) => MODE_NAME[l.mode] },
    { id: 'visits', label: 'Візитів', value: (l) => l.visits },
    { id: 'visitors', label: 'Людей', value: (l) => l.visitors },
    { id: 'demos', label: 'Пробних ігор', value: (l) => l.demos },
    { id: 'expired', label: 'Дограли до кінця', value: (l) => l.expired },
    { id: 'cta', label: '«Створити акаунт»', value: (l) => l.cta },
    { id: 'accounts', label: 'Акаунтів', value: (l) => l.accounts },
    { id: 'last', label: 'Останній візит', value: (l) => (l.lastVisitAt ? new Date(l.lastVisitAt).getTime() : 0), render: (l) => (l.lastVisitAt ? dateTime(l.lastVisitAt) : '—') },
    {
      id: 'created',
      label: 'Створено',
      value: (l) => new Date(l.createdAt).getTime(),
      render: (l) => (
        <div className={styles.rowActions}>
          <span>{dateTime(l.createdAt)}</span>
          <CopyButton text={linkUrl(l.mode, l.code)} />
          <button type="button" className={styles.btn} onClick={() => rename(l)}>
            Перейменувати
          </button>
          <button type="button" className={styles.btnDanger} onClick={() => remove(l)}>
            Видалити
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>🔗 Посилання й відвідування</h1>
        <div className={styles.totals}>
          <span>🔗 Посилань: {links.length}</span>
          <span>👣 Візитів за період: {visits.length}</span>
        </div>
        <button type="button" className={styles.btn} onClick={() => void load()} disabled={busy}>
          ↻ Оновити
        </button>
      </header>

      {error && <p className={styles.noteErr}>{error}</p>}

      <section className={styles.gamesSection}>
        <NewLink busy={busy} onCreate={(link) => run(() => adminApi.createLink(adminKey, period, link))} />
      </section>

      <section className={styles.gamesSection}>
        <h2>Мої посилання</h2>
        <p className={styles.meta}>
          Числа тут — за весь час. «Акаунтів» — скільки батьківських акаунтів створили ті, хто прийшов за посиланням.
          До посилання можна дописати й звичні мітки: <code>&amp;utm_source=instagram&amp;utm_medium=social</code>.
        </p>
        {links.length > 0 ? (
          <SortTable columns={linkColumns} rows={links} rowKey={(l) => l.id} initial={{ by: 'created', desc: true }} />
        ) : (
          !busy && <p className={styles.empty}>Посилань ще немає — створи перше вище.</p>
        )}
      </section>

      <div className={`${styles.actions} ${styles.empty} ${styles.filters}`}>
        {PERIODS.map(([days, label]) => (
          <button key={days} type="button" className={period === days ? styles.btnPrimary : styles.btn} aria-pressed={period === days} onClick={() => setPeriod(days)}>
            {label}
          </button>
        ))}
      </div>

      <Visits visits={visits} />
    </div>
  );
}
