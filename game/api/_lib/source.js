/**
 * Where a new account came from: the labels of the link that brought the parent
 * (`utm_source`, `utm_medium`, `utm_campaign`), or the site that sent them.
 * `link` is the code of one of the owner's own links (`?l=…`, see marketing.js).
 * They arrive from the browser, so only short plain labels are kept.
 */
const LABEL = /^[a-z0-9][a-z0-9._-]{0,59}$/;

function label(value) {
  if (typeof value !== 'string') return null;
  const text = value.trim().toLowerCase();
  return LABEL.test(text) ? text : null;
}

/** `{ source, medium, campaign, link }` with clean labels, or null when there is no usable source. */
export function cleanSource(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const source = label(raw.source);
  if (!source) return null;
  return { source, medium: label(raw.medium), campaign: label(raw.campaign), link: label(raw.link) };
}
