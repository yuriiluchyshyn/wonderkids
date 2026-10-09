import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanSource } from '../api/_lib/source.js';

test('the labels of a link are kept lower-cased', () => {
  assert.deepEqual(cleanSource({ source: ' Instagram ', medium: 'Social', campaign: 'parents-ua' }), {
    source: 'instagram',
    medium: 'social',
    campaign: 'parents-ua',
    link: null,
  });
});

test('a source alone is enough — a site that sent the visitor has no campaign', () => {
  assert.deepEqual(cleanSource({ source: 'l.facebook.com', medium: 'referral' }), {
    source: 'l.facebook.com',
    medium: 'referral',
    campaign: null,
    link: null,
  });
});

test('no source, or one that is not a plain label, is no source at all', () => {
  assert.equal(cleanSource(undefined), null);
  assert.equal(cleanSource('instagram'), null);
  assert.equal(cleanSource({ medium: 'paid' }), null);
  assert.equal(cleanSource({ source: '' }), null);
  assert.equal(cleanSource({ source: '<script>' }), null);
  assert.equal(cleanSource({ source: 'x'.repeat(61) }), null);
});

test('a broken medium or campaign is dropped, the source stays', () => {
  assert.deepEqual(cleanSource({ source: 'youtube', medium: 42, campaign: 'a b' }), {
    source: 'youtube',
    medium: null,
    campaign: null,
    link: null,
  });
});

test('the code of the owner’s link is kept with the source', () => {
  assert.equal(cleanSource({ source: 'insta-bio', medium: 'link', link: 'Insta-Bio' }).link, 'insta-bio');
  assert.equal(cleanSource({ source: 'ig', link: 'a b' }).link, null);
});
