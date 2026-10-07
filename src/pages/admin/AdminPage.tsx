import { usePageMeta } from '@/core/app/seo/usePageMeta';
import { useState, type FormEvent } from 'react';
import { Route, Routes } from 'react-router-dom';
import { adminApi } from '@/core/account/api/client';
import { AccountsPage } from './AccountsPage';
import { SpeechPage } from './SpeechPage';
import { GamesPage } from './GamesPage';
import { ADMIN_KEY_STORAGE, errorText } from './shared';
import styles from './Admin.module.css';

/**
 * Admin area (`/admin/*`), guarded by the server-side ADMIN_KEY and never
 * mounted on the kids' portal:
 *
 *   /admin         accounts, children and their progress
 *   /admin/speech  Google Speech keys and who each one serves
 *   /admin/games   live summary of every game, read from the module registry
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
    <Routes>
      <Route index element={<AccountsPage adminKey={adminKey} onLogout={logout} />} />
      <Route path="speech" element={<SpeechPage adminKey={adminKey} />} />
      <Route path="games" element={<GamesPage />} />
    </Routes>
  );
}
