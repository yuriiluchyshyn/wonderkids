import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emailKey, isValidEmail, normaliseEmail, suggestEmail } from '../api/_lib/email.js';

test('emails are stored trimmed and lower-cased', () => {
  assert.equal(normaliseEmail('  Mama@Example.COM '), 'mama@example.com');
  assert.ok(isValidEmail(' a@b.co '));
  assert.ok(!isValidEmail('a@b'));
  assert.ok(!isValidEmail('no at.sign'));
});

test('every spelling of one Gmail mailbox has the same key', () => {
  const key = 'yuralychushun@gmail.com';
  for (const spelling of [
    'yura.lychushun@gmail.com',
    'Yura.Lychushun@Gmail.com',
    'yuralychushun@gmail.com',
    'y.u.r.a.lychushun@gmail.com',
    'yura.lychushun+kids@gmail.com',
    'yura.lychushun@googlemail.com',
    '  yura.lychushun@gmail.com  ',
  ]) {
    assert.equal(emailKey(spelling), key, spelling);
  }
});

test('other providers keep dots and plus tags — they are different mailboxes there', () => {
  assert.equal(emailKey('a.b@ukr.net'), 'a.b@ukr.net');
  assert.notEqual(emailKey('a.b@ukr.net'), emailKey('ab@ukr.net'));
  assert.equal(emailKey('A.B+x@Outlook.com'), 'a.b+x@outlook.com');
});

test('different people stay different', () => {
  assert.notEqual(emailKey('olena@gmail.com'), emailKey('olena1@gmail.com'));
  assert.notEqual(emailKey('olena@gmail.com'), emailKey('olena@ukr.net'));
});

test('a mistyped well-known domain gets a suggestion', () => {
  assert.equal(suggestEmail('Yura.L@gamil.com'), 'yura.l@gmail.com');
  assert.equal(suggestEmail('mama@gmail.con'), 'mama@gmail.com');
  assert.equal(suggestEmail('tato@urk.net'), 'tato@ukr.net');
  assert.equal(suggestEmail('ok@gmail.com'), null);
  assert.equal(suggestEmail('boss@company.ua'), null);
});
