import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { adminApi } from '@/core/account/api/client';
import styles from './Admin.module.css';

/**
 * The sections of the admin area, in the order the side panel lists them.
 * A new section is one line here plus its `<Route>` in `AdminPage`.
 */
export const SECTIONS: { path: string; icon: string; label: string }[] = [
  { path: '/admin', icon: '👨‍👩‍👧', label: 'Акаунти' },
  { path: '/admin/feedback', icon: '✉️', label: 'Звернення' },
  { path: '/admin/sources', icon: '📊', label: 'Джерела' },
  { path: '/admin/games', icon: '🎮', label: 'Ігри' },
  { path: '/admin/speech', icon: '🗣️', label: 'Google Speech' },
];

/** Letters nobody has answered yet — shown as a badge next to «Звернення». */
function useNewLetters(adminKey: string): number {
  const { pathname } = useLocation();
  const [count, setCount] = useState(0);
  useEffect(() => {
    let alive = true;
    adminApi
      .listFeedback(adminKey)
      .then(({ letters }) => alive && setCount(letters.filter((l) => l.status === 'new').length))
      .catch(() => {});
    return () => {
      alive = false;
    };
    // Asked again on every change of section: a letter may have been answered meanwhile.
  }, [adminKey, pathname]);
  return count;
}

/**
 * The frame of every admin page: the sections in a panel on the left (a strip
 * along the top on a phone), the chosen one on the right.
 */
export function AdminShell({ adminKey, onLogout, children }: { adminKey: string; onLogout: () => void; children: ReactNode }) {
  const newLetters = useNewLetters(adminKey);
  return (
    <div className={styles.shell}>
      <aside className={styles.side}>
        <strong className={styles.sideTitle}>🛠️ Адмінпанель</strong>
        <nav className={styles.sideNav} aria-label="Розділи адмінпанелі">
          {SECTIONS.map(({ path, icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end
              className={({ isActive }) => (isActive ? `${styles.sideLink} ${styles.sideLinkOn}` : styles.sideLink)}
            >
              <span aria-hidden>{icon}</span>
              {label}
              {path === '/admin/feedback' && newLetters > 0 && (
                <span className={styles.sideBadge} title="Нових звернень">
                  {newLetters}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <button type="button" className={`${styles.btn} ${styles.sideOut}`} onClick={onLogout}>
          Вийти
        </button>
      </aside>
      <main className={styles.shellMain}>{children}</main>
    </div>
  );
}
