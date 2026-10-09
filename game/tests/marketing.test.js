import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanCode, cleanDemoMinutes, cleanLink, cleanVisit, codeFromName, deviceOf, randomCode } from '../api/_lib/marketing.js';

test('the trial game lasts a whole number of minutes, 1 to 60', () => {
  assert.equal(cleanDemoMinutes(5), 5);
  assert.equal(cleanDemoMinutes('10'), 10);
  for (const bad of [0, 61, 2.5, 'five', null, undefined]) assert.equal(cleanDemoMinutes(bad), null);
});

test('a link’s code is short, plain and lower-case', () => {
  assert.equal(cleanCode(' Insta-Bio '), 'insta-bio');
  for (const bad of ['a', '-abc', 'a b', '<script>', 'x'.repeat(41), 42]) assert.equal(cleanCode(bad), null);
  assert.equal(codeFromName('Інстаграм, біо'), 'instahram-bio');
  assert.equal(codeFromName('Facebook Ads / Spring 2026'), 'facebook-ads-spring-2026');
  assert.equal(codeFromName('🚀'), null);
  assert.match(randomCode(), /^[a-z0-9]{7}$/);
});

test('a new link needs a name and a mode; its code is typed or made from the name', () => {
  assert.deepEqual(cleanLink({ name: ' Флаєр у садочку ', mode: 'demo' }).link, { name: 'Флаєр у садочку', code: 'flayer-u-sadochku', mode: 'demo', note: '' });
  assert.equal(cleanLink({ name: 'TikTok', mode: 'site', code: 'TT-1' }).link.code, 'tt-1');
  assert.equal(cleanLink({ name: '', mode: 'demo' }).error, 'invalid_name');
  assert.equal(cleanLink({ name: 'x', mode: 'game' }).error, 'invalid_mode');
  assert.equal(cleanLink({ name: 'x', mode: 'demo', code: 'a b' }).error, 'invalid_code');
  assert.match(cleanLink({ name: '🚀', mode: 'demo' }).link.code, /^[a-z0-9]{7}$/);
});

test('an arrival keeps only what is plainly written', () => {
  assert.deepEqual(cleanVisit({ link: 'Insta-Bio', mode: 'site', via: 'link', lang: 'PL', referrer: 'L.Instagram.com' }), {
    link: 'insta-bio',
    mode: 'site',
    via: 'link',
    lang: 'pl',
    referrer: 'l.instagram.com',
  });
  assert.deepEqual(cleanVisit({ link: '<x>', mode: 'admin', via: 'magic', lang: 'english', referrer: 'a b' }), {
    link: null,
    mode: 'demo',
    via: 'link',
    lang: 'en',
    referrer: null,
  });
  assert.equal(cleanVisit(undefined).mode, 'demo');
});

test('the device is read off the browser’s name', () => {
  assert.equal(deviceOf('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148'), 'mobile');
  assert.equal(deviceOf('Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit Safari'), 'tablet');
  assert.equal(deviceOf('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari'), 'desktop');
  assert.equal(deviceOf(''), null);
});
