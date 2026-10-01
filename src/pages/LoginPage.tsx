import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/auth/useAuthStore';
import styles from './LoginPage.module.css';

/**
 * Entry screen. Login is email-only for now — type an address and go. If a
 * session already exists we skip straight to the hub.
 *
 * Intentionally theme-independent: this screen renders before a world is
 * chosen, so it uses its own fixed styling rather than the app theme.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const login = useAuthStore((s) => s.login);
  const pending = useAuthStore((s) => s.pending);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState('');

  if (token) return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    const ok = await login(email);
    if (ok) navigate('/', { replace: true });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <span className={styles.mascot} aria-hidden>
          🦄
        </span>

        <h1 className={styles.title}>WonderKids</h1>
        <p className={styles.sub}>Увійди, щоб продовжити пригоду</p>

        <form className={styles.form} onSubmit={submit}>
          <label className={styles.label} htmlFor="email">
            Електронна пошта
          </label>
          <input
            id="email"
            className={styles.input}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) clearError();
            }}
            aria-label="Електронна пошта"
            aria-invalid={Boolean(error)}
          />

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submit} type="submit" disabled={pending}>
            {pending ? 'Входимо…' : 'Увійти'}
          </button>
        </form>

        <p className={styles.hint}>
          Пароль не потрібен — поки що вхід лише за поштою.
        </p>
      </div>
    </div>
  );
}
