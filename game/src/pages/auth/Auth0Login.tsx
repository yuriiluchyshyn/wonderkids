import { useT } from '@/core/i18n';
import { useEffect, useRef, useState } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN, auth0LoggingOut, auth0Logout, auth0ReturnUrl } from '@/core/account/auth/auth0';
import styles from './LoginPage.module.css';

/** While a parent is confirming their email: how often to look, and for how long (~10 min). */
const RECHECK_MS = 6000;
const RECHECK_LIMIT = 100;

/**
 * The Auth0 half of the parent login. There is nothing to press: a parent
 * without a session is sent straight to Auth0 Universal Login, and — once
 * Auth0 sends them back — its ID token is exchanged for our own session
 * (`POST /api/auth/login`). When that succeeds the session appears in the
 * store and `LoginPage` moves on to the cabinet.
 *
 * The page only stops to show something when the way is blocked: Auth0
 * reported an error, or we refused the account (unverified email). Going to
 * Auth0 again by itself there would loop.
 *
 * Loaded on demand and mounted only here, so the Auth0 SDK is never part of
 * what a child downloads.
 */
function Auth0Form() {
  const t = useT();
  const { isLoading, isAuthenticated, error: auth0Error, loginWithRedirect, getIdTokenClaims, getAccessTokenSilently } = useAuth0();
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

  // `replace`, not `assign`: this page only passes the parent on, so «Back»
  // on the Auth0 screen must return to where they came from, not to here
  // (which would send them straight to Auth0 again).
  const signIn = () => void loginWithRedirect({ openUrl: (url) => window.location.replace(url) });

  // No session anywhere and nothing went wrong → off to Auth0.
  const leaving = useRef(false);
  useEffect(() => {
    if (isLoading || isAuthenticated || auth0Error || leaving.current || auth0LoggingOut()) return;
    leaving.current = true;
    signIn();
  }, [isLoading, isAuthenticated, auth0Error]); // eslint-disable-line react-hooks/exhaustive-deps

  // Waiting for the parent to confirm their address (the link in the email
  // opens elsewhere): ask Auth0 again, quietly, whenever they come back to this
  // tab and every few seconds while it is in view — the cabinet then opens by
  // itself, with nothing to press and no password to type again.
  const recheck = async (): Promise<'in' | 'refused' | 'no-session'> => {
    let idToken: string;
    try {
      await getAccessTokenSilently({ cacheMode: 'off' });
      idToken = (await getIdTokenClaims())?.__raw ?? '';
    } catch {
      return 'no-session'; // nothing to ask Auth0 with — only signing in again helps
    }
    const code = await loginWithAuth0(idToken);
    setRefused(code);
    return code === null ? 'in' : 'refused';
  };
  const waiting = refused === 'email_not_verified';
  useEffect(() => {
    if (!waiting) return;
    let tries = 0;
    let busy = false;
    const tick = async () => {
      if (busy || document.visibilityState !== 'visible' || tries >= RECHECK_LIMIT) return;
      busy = true;
      tries += 1;
      await recheck();
      busy = false;
    };
    const timer = window.setInterval(() => void tick(), RECHECK_MS);
    const onBack = () => void tick();
    document.addEventListener('visibilitychange', onBack);
    window.addEventListener('focus', onBack);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onBack);
      window.removeEventListener('focus', onBack);
    };
  }, [waiting]); // eslint-disable-line react-hooks/exhaustive-deps

  if (refused) {
    return (
      <div className={styles.form}>
        <div className={styles.confirm} role="alert">
          <p>{error}</p>
          {waiting && <p>{t('parentLogin.waitingHint')}</p>}
          <button
            className={styles.submit}
            type="button"
            onClick={() => {
              if (!waiting) return signIn();
              void recheck().then((outcome) => {
                if (outcome === 'no-session') signIn();
              });
            }}
          >
            {waiting ? t('parentLogin.confirmed') : t('common.retry')}
          </button>
          {/* Signs out of Auth0 first, or it would return the same account. */}
          <button className={styles.secondary} type="button" onClick={auth0Logout}>
            {t('parentLogin.otherEmail')}
          </button>
        </div>
      </div>
    );
  }

  if (auth0Error) {
    return (
      <div className={styles.form}>
        <p className={styles.error}>{t('parentLogin.notFinished')}</p>
        <button className={styles.submit} type="button" onClick={signIn}>
          {t('parentLogin.signInOrUp')}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.form}>
      <p className={styles.sub} role="status">
        {isAuthenticated || pending ? t('parentLogin.pending') : t('parentLogin.redirecting')}
      </p>
    </div>
  );
}

export function Auth0Login() {
  return (
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      // `prompt: 'login'`: the sign-in form every time. Our own session lasts
      // for weeks, so nothing is lost — and a parent who backs out of an
      // unfinished sign-in (the two-factor set-up has no way back) gets the
      // form again, where they can pick another account or register.
      authorizationParams={{ redirect_uri: auth0ReturnUrl(), ui_locales: 'uk', prompt: 'login' }}
    >
      <Auth0Form />
    </Auth0Provider>
  );
}
