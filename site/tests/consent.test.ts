import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';
import { asksFirst, pixelAllowed } from '../src/consent.ts';

const read = (file: string): string => readFileSync(new URL(file, import.meta.url), 'utf8');

test('the Meta pixel asks first where the GDPR applies, and wherever the country is unknown', () => {
  for (const country of ['PL', 'de', 'GB', 'CH', 'NO', null, undefined, '']) assert.ok(asksFirst(country), `${country} is asked first`);
  for (const country of ['US', 'CA', 'UA']) assert.ok(!asksFirst(country), `${country} is not asked first`);
});

test('a choice wins; with none, the pixel counts only outside the ask-first countries and without Global Privacy Control', () => {
  assert.equal(pixelAllowed('granted', 'PL', true), true);
  assert.equal(pixelAllowed('denied', 'US', false), false);
  assert.equal(pixelAllowed(null, 'US', false), true);
  assert.equal(pixelAllowed(null, 'US', true), false);
  assert.equal(pixelAllowed(null, 'PL', false), false);
  assert.equal(pixelAllowed(null, null, false), false);
});

test('every page carries the question and the footer link that asks it again', () => {
  for (const file of ['index.html', 'legal.html', 'games.html', 'pricing.html']) {
    const page = read(`../${file}`);
    assert.match(page, /id="consent"[^>]*hidden/, `${file}: the question, hidden until asked`);
    assert.match(page, /data-consent="granted"/, `${file}: a yes`);
    assert.match(page, /data-consent="denied"/, `${file}: a no`);
    assert.match(page, /data-consent-open hidden/, `${file}: «cookie settings» in the footer`);
  }
});

test('the pixel is loaded only by its own module, after consent — never by a page or by the game', () => {
  const files = (dir: URL): URL[] =>
    readdirSync(dir).flatMap((name) => {
      const url = new URL(name, dir);
      return statSync(url).isDirectory() ? files(new URL(`${name}/`, dir)) : [url];
    });
  const loaders = files(new URL('../src/', import.meta.url)).filter((url) => readFileSync(url, 'utf8').includes('connect.facebook.net'));
  assert.deepEqual(loaders.map((url) => url.pathname.split('/site/')[1]), ['src/scripts/pixel.ts']);
  const game = files(new URL('../../game/src/', import.meta.url)).filter((url) => /\.(tsx?|html)$/.test(url.pathname) && /connect\.facebook\.net|fbevents|fbq\(/.test(readFileSync(url, 'utf8')));
  assert.deepEqual(game, [], 'no Meta pixel where a child plays');
});
