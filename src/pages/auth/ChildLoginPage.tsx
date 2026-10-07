import { usePageMeta } from '@/core/app/seo/usePageMeta';
import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import styles from './LoginPage.module.css';

/** A sprinkle of world icons so the child login feels playful. */
const DECOR = [
  { e: '🦄', top: '10%', left: '8%', size: 3.2, rot: -10, delay: 0 },
  { e: '🚀', top: '16%', left: '85%', size: 3.0, rot: 12, delay: 0.4 },
  { e: '🦖', top: '70%', left: '10%', size: 3.4, rot: 8, delay: 0.9 },
  { e: '🌈', top: '62%', left: '88%', size: 2.8, rot: -8, delay: 0.6 },
  { e: '⭐', top: '40%', left: '4%', size: 2.2, rot: 0, delay: 1.1 },
  { e: '🏁', top: '82%', left: '70%', size: 2.4, rot: 6, delay: 0.3 },
] as const;

/**
 * Child portal entry (Tech Spec v2.1 US-1 / FR-AUTH): the child signs in with
 * the nickname (or email) + password the parent set in the parent cabinet.
 * This is the default login — the home page lands here.
 */
export function ChildLoginPage() {
  usePageMeta({
    title: 'Вхід для дітей',
    description:
      'Вхід у ДивоСвіт для дітей: введи свій нік і PIN, який дали батьки, — і вирушай у пригоду з математикою, географією та історією.',
    index: true,
  });
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const childLogin = useAuthStore((s) => s.childLogin);
  const pending = useAuthStore((s) => s.pending);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');

  if (token) return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    const ok = await childLogin(identifier.trim(), pin);
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

      <motion.button
        type="button"
        className={styles.parentCorner}
        whileTap={{ scale: 0.94 }}
        onClick={() => navigate('/parent-login')}
        aria-label="Вхід для батьків"
      >
        <span className={`${styles.parentCornerIcon} emoji`} aria-hidden>
          👨‍👩‍👧
        </span>
        <span className={styles.parentCornerText}>Вхід для батьків</span>
      </motion.button>

      <div className={styles.card}>
        <div className={styles.logoRow} aria-hidden>
          <span className={styles.logoIcon}>🦄</span>
          <span className={styles.logoIcon}>🚀</span>
          <span className={styles.logoIcon}>🦖</span>
        </div>

        <h1 className={styles.title}>WonderKids</h1>
        <p className={styles.sub}>Привіт! Введи свій нік і PIN</p>

        <form className={styles.form} onSubmit={submit}>
          <label className={styles.label} htmlFor="identifier">
            Нік
          </label>
          <input
            id="identifier"
            className={styles.input}
            type="text"
            autoCapitalize="none"
            autoCorrect="off"
            autoFocus
            placeholder="напр. marko_speed"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (error) clearError();
            }}
            aria-label="Нік"
          />

          <label className={styles.label} htmlFor="pin">
            PIN
          </label>
          <input
            id="pin"
            className={styles.input}
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            placeholder="••••"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
              if (error) clearError();
            }}
            aria-label="PIN"
            aria-invalid={Boolean(error)}
          />

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submit} type="submit" disabled={pending}>
            {pending ? 'Заходимо…' : 'Грати!'}
          </button>
        </form>

        <p className={styles.hint}>Немає акаунта? Попроси батьків створити тобі профіль 👨‍👩‍👧</p>
      </div>
    </div>
  );
}
