import { test } from 'node:test';
import assert from 'node:assert/strict';
import { availabilityFor, cleanAvailability, EMPTY } from '../api/_lib/availability.js';

const config = cleanAvailability({
  regions: [
    { id: 'north-america', name: 'Північна Америка', countries: ['us', 'CA', 'usa', 'US'] },
    { id: 'Bad Id', name: 'x', countries: ['DE'] },
  ],
  langRules: [
    { where: ['@north-america'], site: ['en'], game: ['EN'] },
    { where: ['PL', '@nowhere'], site: ['pl', 'en'], game: [] },
    { where: [], site: ['uk'], game: ['uk'] },
    { where: ['DE'], site: [], game: [] },
  ],
  items: {
    'game:math:shop': { status: 'soon' },
    'game:history:poland_people': { status: 'on', scope: 'only', where: ['PL'] },
    'game:geography:flags': { status: 'on', scope: 'except', where: ['@north-america', 'pl'] },
    'galaxy:art': { status: 'hidden' },
    'galaxy:music': { status: 'soon', scope: 'only', where: ['US'] },
    'game:math:add': { status: 'on', scope: 'only', where: [] },
    'not a key': { status: 'hidden' },
  },
});

test('the rules are kept clean: codes in one case, nothing that says nothing', () => {
  assert.deepEqual(config.regions, [{ id: 'north-america', name: 'Північна Америка', countries: ['US', 'CA'] }]);
  assert.deepEqual(config.langRules, [
    { where: ['@north-america'], site: ['en'], game: ['en'] },
    { where: ['PL'], site: ['pl', 'en'], game: [] },
  ]);
  assert.deepEqual(Object.keys(config.items).sort(), ['galaxy:art', 'galaxy:music', 'game:geography:flags', 'game:history:poland_people', 'game:math:shop']);
  assert.deepEqual(cleanAvailability(null), EMPTY);
  assert.deepEqual(cleanAvailability(config), config);
});

test('a visitor from the United States: English only, and what is theirs', () => {
  const us = availabilityFor(config, 'US');
  assert.deepEqual(us.langs, { site: ['en'], game: ['en'] });
  assert.deepEqual(us.games.hidden.sort(), ['geography:flags', 'history:poland_people']);
  assert.deepEqual(us.games.soon, ['math:shop']);
  assert.deepEqual(us.galaxies, { hidden: ['art'], soon: ['music'] });
});

test('a rule may limit the site and leave the game alone', () => {
  const pl = availabilityFor(config, 'PL');
  assert.deepEqual(pl.langs, { site: ['pl', 'en'], game: null });
  assert.deepEqual(pl.games.hidden, ['geography:flags']);
  assert.deepEqual(pl.galaxies.hidden.sort(), ['art', 'music']);
});

test('elsewhere, and where the country is not known, no place matches', () => {
  for (const country of ['UA', null]) {
    const there = availabilityFor(config, country);
    assert.deepEqual(there.langs, { site: null, game: null });
    assert.deepEqual(there.games, { hidden: ['history:poland_people'], soon: ['math:shop'] });
    assert.deepEqual(there.galaxies, { hidden: ['art', 'music'], soon: [] });
  }
  assert.deepEqual(availabilityFor(EMPTY, 'US'), { langs: { site: null, game: null }, games: { hidden: [], soon: [] }, galaxies: { hidden: [], soon: [] } });
});
