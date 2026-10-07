import { useEffect, useRef, useState } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN, auth0LogoutUrl, auth0ReturnUrl } from '@/core/account/auth/auth0';
import styles from './LoginPage.module.css';

/**
 * The Auth0 half of the parent login: one button that leaves for Auth0
 * Universal Login, and — once Auth0 sends the parent back — the exchange of
 * its ID token for our own session (`POST /api/auth/auth0`). When that
 * succeeds the session appears in the store and `LoginPage` moves on to the
 * cabinet.
 *
 * Loaded on demand and mounted only here, so the Auth0 SDK is never part of
 * what a child downloads.
 */
function Auth0Form() {
  const { isLoading, isAuthenticated, error: auth0Error, loginWithRedirect, getIdTokenClaims } = useAuth0();
  const loginWithAuth0 = useAuthStore((s) => s.loginWithAuth0);
  const pending = useAuthStore((s) => s.pending);
  const error = useAuthStore((s) => s.error);

  /** The error code of a refused exchange — Auth0 let the parent in, we did not. */
  const [refused, setRefused] = useState<string | null>(null);
  // One exchange per visit (StrictMode runs effects twice).
  const exchanged = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || exchanged.current) return;
    exchanged.current = true;
    void (async () => {
      const claims = await getIdTokenClaims();
      setRefused(await loginWithAuth0(claims?.__raw ?? ''));
    })();
  }, [isAuthenticated, getIdTokenClaims, loginWithAuth0]);

  const busy = isLoading || pending || (isAuthenticated && !refused);
  const signIn = () => void loginWithRedirect();

  if (refused) {
    return (
      <div className={styles.form}>
        <div className={styles.confirm} role="alert">
          <p>{error}</p>
          <button className={styles.submit} type="button" onClick={signIn}>
            {refused === 'email_not_verified' ? 'Пошту підтверджено — увійти' : 'Спробувати ще раз'}
          </button>
          {/* Signs out of Auth0 first, or it would return the same account. */}
          <button className={styles.secondary} type="button" onClick={() => window.location.assign(auth0LogoutUrl())}>
            Увійти з іншою поштою
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.form}>
      {auth0Error && <p className={styles.error}>Вхід не завершено. Спробуйте, будь ласка, ще раз.</p>}
      <button className={styles.submit} type="button" disabled={busy} onClick={signIn}>
        {busy ? 'Входимо…' : 'Увійти або зареєструватися'}
      </button>
    </div>
  );
}

export function Auth0Login() {
  return (
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{ redirect_uri: auth0ReturnUrl(), ui_locales: 'uk' }}
    >
      <Auth0Form />
    </Auth0Provider>
  );
}
