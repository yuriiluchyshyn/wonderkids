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
 * Where Auth0 sends the parent back, after both sign-in and sign-out. The
 * route exists on every portal; this exact URL must be listed in the Auth0
 * application's Allowed Callback URLs and Allowed Logout URLs.
 */
export function auth0ReturnUrl(): string {
  return `${window.location.origin}/parent-login`;
}

/**
 * Ends the Auth0 session too. Without it the next tap on «Увійти» would sign
 * the same parent straight back in — on a tablet shared with a child that is
 * no sign-out at all.
 */
export function auth0LogoutUrl(): string {
  const params = new URLSearchParams({ client_id: AUTH0_CLIENT_ID, returnTo: auth0ReturnUrl() });
  return `https://${AUTH0_DOMAIN}/v2/logout?${params}`;
}
