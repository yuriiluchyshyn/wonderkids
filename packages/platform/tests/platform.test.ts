import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isLocalHost, isPreviewHost, portalHost, portalOfHost, publicUrls, queryOfSource, rootHost, sharedCookieDomain, sourceOfQuery } from '../src/index.ts';

test('hosts: the root domain, its portals, and where there are none', () => {
  assert.equal(rootHost('Play.PulsarKids.com'), 'pulsarkids.com');
  assert.equal(rootHost('www.pulsarkids.com'), 'pulsarkids.com');
  assert.equal(portalOfHost('parents.pulsarkids.com'), 'parents');
  assert.equal(portalOfHost('pulsarkids.com'), null);
  assert.equal(portalHost('play', 'parents.pulsarkids.com'), 'play.pulsarkids.com');
  for (const host of ['localhost', '127.0.0.1', '192.168.1.20', '10.0.0.4', '172.20.1.1', 'mac.local']) assert.ok(isLocalHost(host), host);
  for (const host of ['pulsarkids.com', '172.40.1.1', 'site-abc.vercel.app']) assert.ok(!isLocalHost(host), host);
  assert.ok(isPreviewHost('site-abc.vercel.app'));
});

test('the cookie of a choice is shared by the site and the portals — where a domain can be', () => {
  assert.equal(sharedCookieDomain('play.pulsarkids.com'), '.pulsarkids.com');
  assert.equal(sharedCookieDomain('pulsarkids.com'), '.pulsarkids.com');
  assert.equal(sharedCookieDomain('localhost'), null);
  assert.equal(sharedCookieDomain('192.168.1.20'), null);
});

test('public addresses: the portals are subdomains of the site unless given their own', () => {
  assert.deepEqual(publicUrls(), { site: 'https://pulsarkids.com', play: 'https://play.pulsarkids.com', parents: 'https://parents.pulsarkids.com' });
  assert.deepEqual(publicUrls('https://example.org/'), { site: 'https://example.org', play: 'https://play.example.org', parents: 'https://parents.example.org' });
  assert.deepEqual(publicUrls('', { play: 'http://localhost:4321/' }), { site: 'https://pulsarkids.com', play: 'http://localhost:4321', parents: 'https://parents.pulsarkids.com' });
});

test('a source travels in a link and comes out the same', () => {
  assert.equal(sourceOfQuery('?x=1'), undefined);
  const source = sourceOfQuery('?utm_source=ig&utm_medium=paid&utm_campaign=pulsar%20ua');
  assert.deepEqual(source, { source: 'ig', medium: 'paid', campaign: 'pulsar ua' });
  assert.deepEqual(sourceOfQuery(queryOfSource(source!)), source);
  assert.equal(queryOfSource({ source: 'a b' }), '?utm_source=a+b');
});
