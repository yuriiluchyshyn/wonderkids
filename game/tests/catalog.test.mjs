// The catalogue the public site builds its pages of games from must be the one
// the game would write today (`scripts/catalog.mjs`): a game added, renamed or
// retold without `npm run catalog` fails here, before the site can drift.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { buildCatalog } from '../scripts/catalog.mjs';

test('packages/catalog is what the game says today', async () => {
  const catalogs = await buildCatalog();
  for (const [lang, galaxies] of Object.entries(catalogs)) {
    const kept = JSON.parse(readFileSync(new URL(`../../packages/catalog/src/${lang}.json`, import.meta.url), 'utf8'));
    assert.deepEqual(kept, JSON.parse(JSON.stringify(galaxies)), `packages/catalog/src/${lang}.json is stale — run «npm run catalog» in game/ and commit it`);
    for (const galaxy of galaxies) for (const game of galaxy.games) assert.ok(game.samples.length > 0 && game.samples.every((task) => task.prompt), `${lang} ${game.id}: a page needs real tasks to show`);
  }
});
