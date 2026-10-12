import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { browserOf, osOf, perfOf } from '../src/core/app/platform.ts';

const UA = {
  galaxyChrome: 'Mozilla/5.0 (Linux; Android 14; SM-A546B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
  galaxySamsung: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/27.0 Chrome/125.0.0.0 Mobile Safari/537.36',
  androidInstagram: 'Mozilla/5.0 (Linux; Android 13; SM-A135F; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/128.0.0.0 Mobile Safari/537.36 Instagram 350.0.0.0',
  androidFirefox: 'Mozilla/5.0 (Android 14; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
  iphoneSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  iphoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/129.0.0.0 Mobile/15E148 Safari/604.1',
  ipadSafari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  macChrome: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
};

test('the device is told apart by what it says about itself', () => {
  assert.equal(osOf({ userAgent: UA.galaxyChrome }), 'android');
  assert.equal(osOf({ userAgent: UA.iphoneSafari }), 'ios');
  // An iPad says it is a Mac; only its touch screen gives it away.
  assert.equal(osOf({ userAgent: UA.ipadSafari, maxTouchPoints: 5 }), 'ios');
  assert.equal(osOf({ userAgent: UA.ipadSafari, maxTouchPoints: 0 }), 'other');

  assert.equal(browserOf({ userAgent: UA.galaxySamsung }), 'samsung');
  assert.equal(browserOf({ userAgent: UA.galaxyChrome }), 'chrome');
  assert.equal(browserOf({ userAgent: UA.androidInstagram }), 'webview');
  assert.equal(browserOf({ userAgent: UA.androidFirefox }), 'firefox');
  assert.equal(browserOf({ userAgent: UA.iphoneSafari }), 'safari');
  assert.equal(browserOf({ userAgent: UA.iphoneChrome }), 'chrome');
});

test('Android always gets the lighter look, an iPhone never, a computer by its strength', () => {
  assert.equal(perfOf({ userAgent: UA.galaxySamsung, deviceMemory: 8, hardwareConcurrency: 8 }), 'lite');
  assert.equal(perfOf({ userAgent: UA.iphoneSafari, hardwareConcurrency: 4 }), 'full');
  assert.equal(perfOf({ userAgent: UA.macChrome, deviceMemory: 8, hardwareConcurrency: 8 }), 'full');
  assert.equal(perfOf({ userAgent: UA.macChrome, deviceMemory: 4, hardwareConcurrency: 8 }), 'lite');
  assert.equal(perfOf({ userAgent: UA.macChrome }), 'full');
});

// ---- The rules of docs/browser-support.md that a machine can check ----

const SRC = new URL('../src', import.meta.url).pathname;

function files(dir: string, ext: RegExp): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return files(path, ext);
    return ext.test(entry.name) ? [path] : [];
  });
}

const styles = files(SRC, /\.css$/).map((path) => ({ path: path.slice(SRC.length + 1), text: readFileSync(path, 'utf8') }));
const code = files(SRC, /\.tsx?$/).map((path) => ({ path: path.slice(SRC.length + 1), text: readFileSync(path, 'utf8') }));
const brand = readFileSync(new URL('../../packages/brand/night-sky.css', import.meta.url), 'utf8');

test('a stylesheet uses only custom properties that someone sets', () => {
  // `--bg2` for `--bg-2` once left the play-time bar with no background at all.
  const everything = [...styles, ...code].map((f) => f.text).join('\n') + brand;
  const defined = new Set([...everything.matchAll(/(--[a-z0-9-]+)['"]?\s*:/g)].map((m) => m[1]));
  for (const m of everything.matchAll(/setProperty\(\s*['"](--[a-z0-9-]+)/g)) defined.add(m[1]);
  // One with a fallback (`var(--loop, 3s)`) is optional by design; one without must exist.
  const unknown = styles.flatMap((f) => [...f.text.matchAll(/var\((--[a-z0-9-]+)\s*\)/g)].filter((m) => !defined.has(m[1])).map((m) => `${f.path}: ${m[1]}`));
  assert.deepEqual(unknown, []);
});

test('no background is pinned with background-attachment, and no layer is hinted for good', () => {
  const found = styles.flatMap((f) => (/^\s*(background-attachment\s*:\s*fixed|will-change\s*:)/m.test(f.text) ? [f.path] : []));
  assert.deepEqual(found, []);
});

test('an endless animation is a CSS loop, never a framer-motion one', () => {
  const found = code.flatMap((f) => (/repeat:\s*Infinity/.test(f.text) ? [f.path] : []));
  assert.deepEqual(found, []);
});

test('nothing on a child\'s screen is blurred from behind', () => {
  // The grown-ups' pages may (a weaker device switches it off: `data-perf='lite'`).
  const grownUps = /^(pages\/auth\/LoginPage\.|pages\/admin\/|components\/parent\/)/;
  const found = styles.flatMap((f) => (!grownUps.test(f.path) && f.path !== 'styles/global.css' && /^\s*(-webkit-)?backdrop-filter\s*:/m.test(f.text) ? [f.path] : []));
  assert.deepEqual(found, []);
});
