/**
 * Where the visitor came from: the `utm_*` labels of the link that brought them
 * (an ad, a profile link, a video description). The public site passes them on
 * to the portals; here they are remembered on the device — past the trip to
 * Auth0 and back — and sent along when a parent account is created, so the
 * admin's «Джерела» page can tell which channel brings families.
 *
 * How a source is written in a link and kept on the device is agreed with the
 * site in `@pulsar/platform`.
 */
import { sourceOfQuery, type SignupSource } from '@pulsar/platform';
import { readSource, saveSource } from '@pulsar/platform/browser';

export type { SignupSource };

/** Called once at start-up, before anything strips the query string. */
export function rememberSource(): void {
  const found = sourceOfQuery(window.location.search);
  if (found) saveSource(found);
}

export const signupSource = (): SignupSource | undefined => readSource();
