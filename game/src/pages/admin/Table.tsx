import { Fragment, useMemo, useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Admin.module.css';

export interface Column<Row> {
  id: string;
  label: string;
  /** What the column is sorted by. */
  value: (row: Row) => string | number;
  render?: (row: Row) => ReactNode;
  /** A column of buttons has nothing to sort by. */
  sortable?: false;
}

interface SortTableProps<Row> {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string | number;
  initial: { by: string; desc: boolean };
  /** With it a row opens on a tap and shows this below itself. */
  detail?: (row: Row) => ReactNode;
  rowClass?: (row: Row) => string | undefined;
}

/** A table whose every column sorts; with `detail`, one whose rows unfold. */
export function SortTable<Row>({ columns, rows, rowKey, initial, detail, rowClass }: SortTableProps<Row>) {
  const [sort, setSort] = useState(initial);
  const [open, setOpen] = useState<ReadonlySet<string | number>>(new Set());
  const sorted = useMemo(() => {
    const column = columns.find((c) => c.id === sort.by) ?? columns[0];
    const dir = sort.desc ? -1 : 1;
    return [...rows].sort((a, b) => {
      const x = column.value(a);
      const y = column.value(b);
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'uk')) * dir;
    });
  }, [rows, columns, sort]);

  const toggle = (key: string | number) =>
    setOpen((now) => {
      const next = new Set(now);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  return (
    <div className={styles.gamesScroll}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            {detail && <th aria-label="Розгорнути" />}
            {columns.map((column) =>
              column.sortable === false ? (
                <th key={column.id} className={styles.plainTh}>
                  {column.label}
                </th>
              ) : (
                <th key={column.id} aria-sort={sort.by === column.id ? (sort.desc ? 'descending' : 'ascending') : 'none'}>
                  <button type="button" className={styles.sortBtn} onClick={() => setSort((now) => ({ by: column.id, desc: now.by === column.id ? !now.desc : true }))}>
                    {column.label}
                    <span aria-hidden>{sort.by === column.id ? (sort.desc ? ' ▼' : ' ▲') : ''}</span>
                  </button>
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const key = rowKey(row);
            const shown = detail !== undefined && open.has(key);
            const classes = [detail && styles.foldRow, shown && styles.foldRowOpen, rowClass?.(row)].filter(Boolean).join(' ');
            return (
              <Fragment key={key}>
                <tr className={classes || undefined} onClick={detail ? () => toggle(key) : undefined}>
                  {detail && (
                    <td className={styles.foldCell}>
                      {/* The tap is the row's: this button only gives the keyboard a way in. */}
                      <button type="button" className={styles.foldBtn} aria-expanded={shown} aria-label={shown ? 'Згорнути' : 'Розгорнути'}>
                        {shown ? '▾' : '▸'}
                      </button>
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.id}>{column.render ? column.render(row) : column.value(row)}</td>
                  ))}
                </tr>
                {shown && (
                  <tr className={styles.detailRow}>
                    <td colSpan={columns.length + 1}>{detail(row)}</td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function CopyButton({ text }: { text: string }) {
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

/** The pages of one section, as a strip above the chosen one. */
export function Tabs({ label, tabs }: { label: string; tabs: { to: string; label: string }[] }) {
  return (
    <div className={styles.tabsBar}>
      <nav className={styles.tabs} aria-label={label}>
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end className={({ isActive }) => (isActive ? `${styles.tab} ${styles.tabOn}` : styles.tab)}>
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
