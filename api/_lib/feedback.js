// Rules of the «Написати нам» form on the public site — pure, no I/O.
//
// A letter is text plus up to MAX_FILES photos / videos. Vercel accepts at
// most 4.5 MB per request, so a file travels in pieces of PART_BYTES, each a
// base64 string. PART_BYTES is a multiple of 3, so the pieces of a file glued
// together are again valid base64 — the attachment as the mail API wants it.
export const KINDS = ['bug', 'idea', 'game', 'other'];
export const STATUSES = ['new', 'answered', 'done'];

export const MIN_MESSAGE = 5;
export const MAX_MESSAGE = 4000;
export const MAX_EMAIL = 200;
export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 15 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 18 * 1024 * 1024;
export const PART_BYTES = 3 * 2 ** 19;
export const PART_CHARS = (PART_BYTES / 3) * 4;

/** One sender may write this many letters an hour; the site as a whole, this many a day. */
export const MAX_PER_HOUR = 5;
export const MAX_PER_DAY = 200;
/** Files of a letter must arrive within this time after its text. */
export const UPLOAD_WINDOW_MS = 60 * 60 * 1000;

const FILE_TYPE = /^(image\/(jpeg|png|webp|gif|heic|heif)|video\/(mp4|quicktime|webm))$/;
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

export const partCount = (size) => Math.ceil(size / PART_BYTES);

/** A file name safe to put on an attachment. */
function cleanName(name, index) {
  const base = String(name ?? '')
    .split(/[/\\]/)
    .pop()
    .replace(/[\u0000-\u001f\u007f:*?"<>|]/g, '')
    .replace(/^\.+/, '')
    .trim()
    .slice(-80);
  return base || `file-${index + 1}`;
}

/**
 * Check a new letter. → `{ letter: { kind, message, email, files } }`, or
 * `{ error }` with the code the form shows a text for.
 */
export function validateLetter(body) {
  const kind = KINDS.includes(body?.kind) ? body.kind : 'other';
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  if (message.length < MIN_MESSAGE) return { error: 'message_too_short' };
  if (message.length > MAX_MESSAGE) return { error: 'message_too_long' };

  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  if (email && (email.length > MAX_EMAIL || !EMAIL.test(email))) return { error: 'invalid_email' };

  const list = body?.files ?? [];
  if (!Array.isArray(list) || list.length > MAX_FILES) return { error: 'too_many_files' };
  const files = [];
  for (const [index, file] of list.entries()) {
    const type = String(file?.type ?? '').toLowerCase();
    if (!FILE_TYPE.test(type)) return { error: 'invalid_file_type' };
    if (!Number.isInteger(file?.size) || file.size <= 0 || file.size > MAX_FILE_BYTES) return { error: 'file_too_big' };
    files.push({ name: cleanName(file.name, index), type, size: file.size });
  }
  if (files.reduce((sum, f) => sum + f.size, 0) > MAX_TOTAL_BYTES) return { error: 'files_too_big' };

  return { letter: { kind, message, email, files } };
}

/** Is this a piece the letter is still waiting for? */
export function validPart(letter, fileNo, partNo, data, now = Date.now()) {
  const file = Number.isInteger(fileNo) ? letter.files[fileNo] : undefined;
  return Boolean(
    file &&
      !letter.closed &&
      now - new Date(letter.createdAt).getTime() < UPLOAD_WINDOW_MS &&
      Number.isInteger(partNo) &&
      partNo >= 0 &&
      partNo < partCount(file.size) &&
      typeof data === 'string' &&
      data.length > 0 &&
      data.length <= PART_CHARS &&
      BASE64.test(data),
  );
}
