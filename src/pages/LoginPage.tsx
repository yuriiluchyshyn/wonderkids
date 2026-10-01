import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/auth/useAuthStore';
import styles from './LoginPage.module.css';

/**
 * Entry screen. Login is email-only for now — type an address and go. If a
 * session already exists we skip straight to the hub.
 *
 * Intentionally theme-independent: this screen renders before a world is
 * chosen, so it uses its own neutral styling (no per-theme palette). To hint at
 * the worlds waiting inside, the background is sprinkled with icons pulled from
 * across every theme rather than committing to any single one.
 */

/** Small logo cluster: a sample of worlds, so no single theme dominates. */
const LOGO_ICONS = ['🦄', '🚀', '🦖', '🌊'];

/**
 * Floating background decorations — one or two signature icons from each theme.
 * Positions are kept toward the edges so the login card stays readable. Values
 * are static (not random) so the layout is stable across renders.
 */
const DECOR: ReadonlyArray<{
  e: string;
  top: string;
  left: string;
  size: number;
  rot: number;
  delay: number;
}> = [
  { e: '🦄', top: '8%', left: '6%', size: 3.4, rot: -12, delay: 0 },
  { e: '🌈', top: '55%', left: '92%', size: 3.0, rot: 8, delay: 0.2 },
  { e: '🚀', top: '14%', left: '88%', size: 3.0, rot: 14, delay: 0.6 },
  { e: '🪐', top: '60%', left: '3%', size: 2.6, rot: -14, delay: 0.8 },
  { e: '🦖', top: '72%', left: '9%', size: 3.6, rot: 8, delay: 1.1 },
  { e: '🌋', top: '20%', left: '21%', size: 2.2, rot: 10, delay: 1.6 },
  { e: '🐠', top: '40%', left: '4%', size: 2.6, rot: 10, delay: 0.9 },
  { e: '🫧', top: '74%', left: '70%', size: 2.6, rot: -10, delay: 1.5 },
  { e: '🦉', top: '30%', left: '93%', size: 2.8, rot: -10, delay: 1.2 },
  { e: '🍎', top: '88%', left: '22%', size: 2.2, rot: 8, delay: 0.4 },
  { e: '🧱', top: '6%', left: '47%', size: 2.4, rot: 6, delay: 0.5 },
  { e: '❄️', top: '82%', left: '86%', size: 2.8, rot: -8, delay: 0.3 },
  { e: '⛄', top: '12%', left: '70%', size: 2.4, rot: -6, delay: 1.0 },
  { e: '🏎️', top: '86%', left: '45%', size: 3.0, rot: -6, delay: 1.4 },
  { e: '🏁', top: '34%', left: '80%', size: 2.2, rot: 6, delay: 0.7 },
  { e: '💎', top: '46%', left: '14%', size: 2.0, rot: -8, delay: 1.3 },
  { e: '⭐', top: '4%', left: '30%', size: 2.0, rot: 0, delay: 0.9 },
  { e: '🏆', top: '90%', left: '63%', size: 2.2, rot: -6, delay: 0.6 },
];

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
      <div className={styles.bg} aria-hidden>
        {DECOR.map((d, i) => (
          <span
            key={i}
            className={styles.decor}
            style={{
              top: d.top,
              left: d.left,
              fontSize: `${d.size}rem`,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ['--rot' as any]: `${d.rot}deg`,
              animationDelay: `${d.delay}s`,
            }}
          >
            {d.e}
          </span>
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.logoRow} aria-hidden>
          {LOGO_ICONS.map((icon, i) => (
            <span key={i} className={styles.logoIcon}>
              {icon}
            </span>
          ))}
        </div>

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
