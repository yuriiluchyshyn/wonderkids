import { siteUrl } from '@/core/app/portal';

/**
 * Auth0 settings for the parent login. Both values are public (they identify
 * the tenant and the application, they are not secrets). While either is
 * missing the parent login stays email-only, exactly as before Auth0.
 */
export const AUTH0_DOMAIN = (import.meta.env.VITE_AUTH0_DOMAIN ?? '')
  .trim()
  .replace(/^https?:\/\//, '')
  .replace(/\/+$/, '');
export const AUTH0_CLIENT_ID = (import.meta.env.VITE_AUTH0_CLIENT_ID ?? '').trim();

export const auth0Enabled = Boolean(AUTH0_DOMAIN && AUTH0_CLIENT_ID);

/**
 * Where Auth0 sends the parent back after signing in. The route exists on
 * every portal; this exact URL must be listed in the Auth0 application's
 * Allowed Callback URLs.
 */
export function auth0ReturnUrl(): string {
  return `${window.location.origin}/parent-login`;
}

/**
 * Ends the Auth0 session too. Without it the parent login — which goes to
 * Auth0 by itself — would sign the same parent straight back in; on a tablet
 * shared with a child that is no sign-out at all.
 *
 * Auth0 then returns to the public front page (not to the parent login, which
 * would bounce straight back to Auth0). That URL must be listed in the Auth0
 * application's Allowed Logout URLs.
 */
export function auth0Logout(): void {
  leaving = true;
  const params = new URLSearchParams({ client_id: AUTH0_CLIENT_ID, returnTo: siteUrl() });
  window.location.assign(`https://${AUTH0_DOMAIN}/v2/logout?${params}`);
}

let leaving = false;

/**
 * True once the page is on its way to the Auth0 logout. Clearing our session
 * shows the parent login for a moment, and it must not start a sign-in then:
 * that navigation would overtake the logout and sign the parent back in.
 */
export function auth0LoggingOut(): boolean {
  return leaving;
}
