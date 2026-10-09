import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_FILE_BYTES,
  MAX_TOTAL_BYTES,
  PART_BYTES,
  PART_CHARS,
  UPLOAD_WINDOW_MS,
  partCount,
  validateLetter,
  validPart,
} from '../api/_lib/feedback.js';

const photo = (size = 1000, name = 'a.jpg') => ({ name, type: 'image/jpeg', size });

test('a letter needs a few words and, if given, a real address', () => {
  assert.equal(validateLetter({ message: ' hi ' }).error, 'message_too_short');
  assert.equal(validateLetter({ message: 'x'.repeat(4001) }).error, 'message_too_long');
  assert.equal(validateLetter({ message: 'hello there', email: 'nobody@' }).error, 'invalid_email');
  assert.deepEqual(validateLetter({ kind: 'idea', message: ' hello there ', email: ' a@b.ua ' }).letter, {
    kind: 'idea',
    message: 'hello there',
    email: 'a@b.ua',
    files: [],
  });
  assert.equal(validateLetter({ kind: 'nonsense', message: 'hello there' }).letter.kind, 'other');
});

test('only photos and videos, within the limits', () => {
  const letter = (files) => validateLetter({ message: 'hello there', files });
  assert.equal(letter([{ name: 'a.exe', type: 'application/x-msdownload', size: 10 }]).error, 'invalid_file_type');
  assert.equal(letter([photo(MAX_FILE_BYTES + 1)]).error, 'file_too_big');
  assert.equal(letter([photo(0)]).error, 'file_too_big');
  assert.equal(letter(Array.from({ length: 6 }, () => photo())).error, 'too_many_files');
  assert.equal(letter([photo(MAX_FILE_BYTES), photo(MAX_TOTAL_BYTES - MAX_FILE_BYTES + 1)]).error, 'files_too_big');
  assert.equal(letter([photo(MAX_FILE_BYTES), photo(MAX_TOTAL_BYTES - MAX_FILE_BYTES)]).error, undefined);
});

test('a file name cannot carry a path', () => {
  const names = validateLetter({
    message: 'hello there',
    files: [photo(5, '../../etc/фото 1.jpg'), photo(5, 'C:\\x\\..hidden.jpg'), photo(5, '')],
  }).letter.files.map((f) => f.name);
  assert.deepEqual(names, ['фото 1.jpg', 'hidden.jpg', 'file-3']);
});

test('pieces glued together are valid base64', () => {
  assert.equal(PART_BYTES % 3, 0);
  const whole = Buffer.from(Array.from({ length: 10 }, (_, i) => i));
  const glued = [whole.subarray(0, 6), whole.subarray(6)].map((piece) => piece.toString('base64')).join('');
  assert.deepEqual(Buffer.from(glued, 'base64'), whole);
  assert.equal(partCount(PART_BYTES), 1);
  assert.equal(partCount(PART_BYTES + 1), 2);
});

test('a piece is taken only for an open letter and a file it announced', () => {
  const now = Date.now();
  const letter = { closed: false, createdAt: new Date(now).toISOString(), files: [photo(PART_BYTES + 1)] };
  assert.equal(validPart(letter, 0, 1, 'AAAA', now), true);
  assert.equal(validPart(letter, 0, 2, 'AAAA', now), false);
  assert.equal(validPart(letter, 1, 0, 'AAAA', now), false);
  assert.equal(validPart(letter, 0, 0, 'not base64!', now), false);
  assert.equal(validPart(letter, 0, 0, 'A'.repeat(PART_CHARS + 4), now), false);
  assert.equal(validPart({ ...letter, closed: true }, 0, 0, 'AAAA', now), false);
  assert.equal(validPart(letter, 0, 0, 'AAAA', now + UPLOAD_WINDOW_MS), false);
});
