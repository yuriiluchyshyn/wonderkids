import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { Button } from '@/components/ui/Button';
import styles from './LoginPage.module.css';

/**
 * Entry screen. Login is email-only for now — type an address and go. If a
 * session already exists we skip straight to the hub.
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
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <motion.div
          className="emoji"
          aria-hidden
          animate={{ y: [0, -8, 0], rotate: [0, -5, 5, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <span className={styles.mascot}>🦄</span>
        </motion.div>

        <h1 className={styles.title}>ДивоСвіт</h1>
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

          <Button type="submit" block size="lg" icon="✨" silent>
            {pending ? 'Входимо…' : 'Увійти'}
          </Button>
        </form>

        <p className={styles.hint}>
          Пароль не потрібен — поки що вхід лише за поштою.
        </p>
      </motion.div>
    </div>
  );
}
