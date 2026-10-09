import { createHash, createHmac } from 'node:crypto';
import {
  addFeedbackReply,
  closeFeedback,
  countRecentFeedback,
  createFeedback,
  deleteFeedback,
  ensureSchema,
  feedbackFileParts,
  getFeedback,
  listFeedback,
  markFeedbackMailed,
  saveFeedbackPart,
  setFeedbackStatus,
} from './_lib/db.js';
import { requireAdmin } from './_lib/admin.js';
import { MAX_MESSAGE, MAX_PER_DAY, MAX_PER_HOUR, STATUSES, partCount, validateLetter, validPart } from './_lib/feedback.js';
import { mailReady, ownerMailbox, sendMail } from './_lib/mail.js';
import { safeEqual } from './_lib/secrets.js';

const KIND_LABEL = { bug: 'Помилка', idea: 'Ідея', game: 'Нова гра', other: 'Інше' };

const secret = () => process.env.JWT_SECRET ?? 'dev-only-change-me';

/** Lets the sender of a letter — and nobody else — add its files. */
const uploadToken = (id) => createHmac('sha256', secret()).update(`feedback:${id}`).digest('hex');

/** The sender's address is kept only as a hash, to count letters per sender. */
function ipHash(req) {
  const ip = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || 'local';
  return createHash('sha256').update(`${secret()}:${ip}`).digest('hex').slice(0, 32);
}

/** Where the owner answers: the admin page lives on the parents' portal. */
function adminUrl(req) {
  const host = String(req.headers.host ?? '').toLowerCase();
  if (!host || /^(localhost|127\.|10\.|192\.168\.)|\.vercel\.app$/.test(host)) return `http://${host}/admin/feedback`;
  return `https://parents.${host.replace(/^(www|play|parents)\./, '')}/admin/feedback`;
}

const megabytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} МБ`;

/**
 * Forward a letter to the owner's mailbox with whatever files have arrived.
 * Never throws: the outcome is written to the letter (`mailedAt` / `mailError`),
 * and the files stay in the database until the letter has really left.
 */
async function deliver(letter, req) {
  try {
    const attachments = [];
    const lost = [];
    for (const [index, file] of letter.files.entries()) {
      const parts = await feedbackFileParts(letter.id, index);
      if (parts.length === partCount(file.size)) attachments.push({ filename: file.name, content: parts.join('') });
      else lost.push(file.name);
    }
    const lines = [
      letter.message,
      '',
      '—',
      `Тип: ${KIND_LABEL[letter.kind] ?? letter.kind}`,
      `Від: ${letter.email || 'адресу не вказано'}`,
      letter.files.length ? `Файли: ${letter.files.map((f) => `${f.name} (${megabytes(f.size)})`).join(', ')}` : null,
      lost.length ? `Не дійшли: ${lost.join(', ')}` : null,
      `Браузер: ${letter.userAgent || '—'}`,
      `Відповісти: ${adminUrl(req)}`,
    ];
    await sendMail({
      to: ownerMailbox(),
      subject: `Pulsar Kids · ${KIND_LABEL[letter.kind] ?? 'Лист'} №${letter.id}`,
      text: lines.filter((line) => line !== null).join('\n'),
      replyTo: letter.email || undefined,
      attachments,
    });
    await markFeedbackMailed(letter.id);
    return true;
  } catch (err) {
    console.error(`[feedback] letter ${letter.id} not mailed:`, err.message);
    await markFeedbackMailed(letter.id, err.message).catch(() => {});
    return false;
  }
}

/** The owner's answer, sent to the address the letter came with. */
async function mailReply(letter, reply) {
  const quoted = letter.message.split('\n').map((line) => `> ${line}`).join('\n');
  const date = new Date(letter.createdAt).toLocaleDateString('uk-UA', { timeZone: 'Europe/Kyiv' });
  await sendMail({
    to: letter.email,
    subject: 'Відповідь від Pulsar Kids',
    text: `${reply}\n\n— Pulsar Kids\n\n${date} ви писали:\n${quoted}`,
    replyTo: ownerMailbox() || undefined,
  });
}

/** A letter comes in (or, with `finish`, its last file has). */
async function receive(req, res) {
  const body = req.body ?? {};

  if (body.finish) {
    if (!Number.isInteger(body.id) || !safeEqual(body.token, uploadToken(body.id))) {
      return res.status(403).json({ error: 'invalid_token' });
    }
    const letter = await getFeedback(body.id);
    if (!letter) return res.status(404).json({ error: 'not_found' });
    if (await closeFeedback(letter.id)) await deliver(letter, req);
    return res.status(200).json({ ok: true });
  }

  // A field no person sees or fills: whoever did is a robot. It gets its "ok".
  if (body.trap) return res.status(200).json({ ok: true });

  const { letter: draft, error } = validateLetter(body);
  if (error) return res.status(400).json({ error });

  const sender = ipHash(req);
  const recent = await countRecentFeedback(sender);
  if (recent.mine >= MAX_PER_HOUR || recent.everyone >= MAX_PER_DAY) return res.status(429).json({ error: 'too_many' });

  const letter = await createFeedback({
    ...draft,
    closed: draft.files.length === 0,
    ipHash: sender,
    userAgent: String(req.headers['user-agent'] ?? '').slice(0, 300),
  });
  if (letter.closed) {
    await deliver(letter, req);
    return res.status(200).json({ ok: true });
  }
  return res.status(200).json({ ok: true, id: letter.id, token: uploadToken(letter.id) });
}

/** One piece of an attached file. */
async function receivePart(req, res) {
  const { id, token, file, part, data } = req.body;
  if (!Number.isInteger(id) || !safeEqual(token, uploadToken(id))) return res.status(403).json({ error: 'invalid_token' });
  const letter = await getFeedback(id);
  if (!letter || !validPart(letter, file, part, data)) return res.status(400).json({ error: 'invalid_part' });
  await saveFeedbackPart(id, file, part, data);
  return res.status(200).json({ ok: true });
}

/** The owner answers a letter, files it away or sends it to the mailbox again. */
async function manage(req, res) {
  const { id, reply, status, resend } = req.body ?? {};
  const letter = Number.isInteger(id) ? await getFeedback(id) : null;
  if (!letter) return res.status(404).json({ error: 'not_found' });

  if (typeof reply === 'string') {
    const text = reply.trim();
    if (!text || text.length > MAX_MESSAGE) return res.status(400).json({ error: 'invalid_reply' });
    if (!letter.email) return res.status(400).json({ error: 'no_reply_address' });
    try {
      await mailReply(letter, text);
    } catch (err) {
      return res.status(502).json({ error: 'mail_failed', detail: err.message });
    }
    await addFeedbackReply(id, text, true);
  } else if (resend) {
    if (!(await deliver(letter, req))) {
      const failed = await getFeedback(id);
      return res.status(502).json({ error: 'mail_failed', detail: failed?.mailError ?? '' });
    }
  } else if (STATUSES.includes(status)) {
    await setFeedbackStatus(id, status);
  } else {
    return res.status(400).json({ error: 'invalid_request' });
  }
  return res.status(200).json({ letters: await listFeedback(), mailReady: mailReady() });
}

/**
 * Letters from the public site («Написати нам») →
 *
 * Anyone:
 *   POST /api/feedback  { kind, message, email?, files: [{ name, type, size }] }
 *        stores the text. Without files the letter is forwarded to the owner's
 *        mailbox at once; with files → `{ id, token }` to send them with.
 *   PUT  /api/feedback  { id, token, file, part, data }   one base64 piece of a file
 *   POST /api/feedback  { id, token, finish: true }       forward it, files attached
 *
 * Admin (`x-admin-key`):
 *   GET    /api/feedback                     every letter with its replies
 *   PUT    /api/feedback  { id, reply }      answer by email
 *   PUT    /api/feedback  { id, status }     new | answered | done
 *   PUT    /api/feedback  { id, resend }     forward to the mailbox once more
 *   DELETE /api/feedback?id=…
 *
 * Photos and videos are never kept: they wait in the database only until the
 * email with them has left (see `_lib/feedback.js` for the limits).
 */
/**
 * The form that writes here is on the public site — a deployment of its own,
 * on another origin (`../site`). Sending a letter needs no session and no
 * cookie, so any page may do it; the owner's side of this endpoint stays out
 * of reach across origins, because `x-admin-key` is not a header we allow.
 */
function allowTheSite(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export default async function handler(req, res) {
  try {
    allowTheSite(res);
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method === 'POST') {
      await ensureSchema();
      return await receive(req, res);
    }
    if (req.method === 'PUT' && req.body?.part !== undefined) {
      await ensureSchema();
      return await receivePart(req, res);
    }

    if (!requireAdmin(req, res)) return undefined;
    await ensureSchema();

    if (req.method === 'GET') {
      return res.status(200).json({ letters: await listFeedback(), mailReady: mailReady() });
    }
    if (req.method === 'PUT') return await manage(req, res);
    if (req.method === 'DELETE') {
      const id = Number(req.query?.id);
      if (!Number.isInteger(id) || !(await deleteFeedback(id))) return res.status(404).json({ error: 'not_found' });
      return res.status(200).json({ letters: await listFeedback(), mailReady: mailReady() });
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    console.error('[feedback] failed:', err);
    return res.status(500).json({ error: 'server_error' });
  }
}
