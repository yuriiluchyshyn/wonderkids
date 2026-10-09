// Outgoing email through Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email).
// Three variables: RESEND_API_KEY, FEEDBACK_TO (the owner's mailbox, where
// letters from the site are forwarded) and optionally FEEDBACK_FROM (a sender
// on a domain verified in Resend).
// RESEND_ENDPOINT points it at a stand-in server in tests.
const endpoint = () => process.env.RESEND_ENDPOINT || 'https://api.resend.com/emails';
const DEFAULT_FROM = 'Pulsar Kids <feedback@pulsarkids.com>';
const TIMEOUT_MS = 60_000;

export const ownerMailbox = () => (process.env.FEEDBACK_TO ?? '').trim();

/** True when letters can be forwarded to the owner. */
export const mailReady = () => Boolean(process.env.RESEND_API_KEY && ownerMailbox());

/**
 * Send one plain-text email. `attachments`: `[{ filename, content }]` with
 * base64 content. Throws an Error whose message says why it did not go.
 */
export async function sendMail({ to, subject, text, replyTo, attachments = [] }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('mail_not_configured');
  if (!to) throw new Error('no_recipient');

  let res;
  try {
    res = await fetch(endpoint(), {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.FEEDBACK_FROM?.trim() || DEFAULT_FROM,
        to: [to],
        subject,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(attachments.length ? { attachments } : {}),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    throw new Error(`mail_unreachable: ${err.message}`);
  }
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(`mail_rejected (${res.status}): ${detail?.message ?? 'no details'}`);
  }
}
