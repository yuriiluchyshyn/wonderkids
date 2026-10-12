import { usePageMeta } from '@/core/app/seo/usePageMeta';
import { useState, type FormEvent } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { adminApi } from '@/core/account/api/client';
import { AccountsPage } from './AccountsPage';
import { FeedbackPage } from './FeedbackPage';
import { LinksPage } from './LinksPage';
import { ReportsPage } from './ReportsPage';
import { SettingsPage } from './SettingsPage';
import { AdminShell } from './AdminShell';
import { ADMIN_KEY_STORAGE, errorText } from './shared';
import styles from './Admin.module.css';

/**
 * Admin area (`/admin/*`), guarded by the server-side ADMIN_KEY and never
 * mounted on the kids' portal. Every section is shown inside `AdminShell`,
 * whose side panel lists them (`SECTIONS`):
 *
 *   /admin           accounts, children and their progress
 *   /admin/feedback  letters from the public site, and the answers to them
 *   /admin/links     every link the owner hands out, and who came by them
 *   /admin/reports   what is only read: where accounts come from (campaigns); `…/games` — the summary of every game
 *   /admin/settings  the trial game's length; `…/speech` — Google Speech keys; `…/availability` — what is offered where
 *
 * The addresses these pages had while each was a section of its own
 * (`/admin/sources`, `/admin/games`, `/admin/speech`, `/admin/availability`)
 * lead to where the page is now.
 */
export function AdminPage() {
  usePageMeta({ title: 'Адмінпанель' });
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem(ADMIN_KEY_STORAGE) ?? '');
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const key = draft.trim();
    if (!key) return;
    setChecking(true);
    setError(null);
    try {
      // Any admin call proves the key; this one is the cheapest.
      await adminApi.listSpeechKeys(key);
      sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
      setAdminKey(key);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setChecking(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem(ADMIN_KEY_STORAGE);
    setAdminKey('');
    setDraft('');
  };

  if (!adminKey) {
    return (
      <div className={styles.page}>
        <form className={styles.gate} onSubmit={submit}>
          <h1>🛠️ Адмінпанель</h1>
          <p>Введи ключ адміністратора (ADMIN_KEY із налаштувань сервера).</p>
          <input
            type="password"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ключ адміністратора"
            aria-label="Ключ адміністратора"
          />
          <button type="submit" className={styles.btnPrimary} disabled={checking || !draft.trim()}>
            {checking ? 'Перевіряю…' : 'Увійти'}
          </button>
          {error && <p className={styles.noteErr}>{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <AdminShell adminKey={adminKey} onLogout={logout}>
      <Routes>
        <Route index element={<AccountsPage adminKey={adminKey} />} />
        <Route path="feedback" element={<FeedbackPage adminKey={adminKey} />} />
        <Route path="links" element={<LinksPage adminKey={adminKey} />} />
        <Route path="reports/*" element={<ReportsPage adminKey={adminKey} />} />
        <Route path="settings/*" element={<SettingsPage adminKey={adminKey} />} />
        <Route path="sources" element={<Navigate to="/admin/reports" replace />} />
        <Route path="games" element={<Navigate to="/admin/reports/games" replace />} />
        <Route path="speech" element={<Navigate to="/admin/settings/speech" replace />} />
        <Route path="availability" element={<Navigate to="/admin/settings/availability" replace />} />
      </Routes>
    </AdminShell>
  );
}
