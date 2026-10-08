import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BUILDING_COSTS,
  DECOR_COSTS,
  balanceOf,
  itemCost,
  itemId,
  lossKey,
  ownedKey,
  sellPrice,
  shopState,
  spentOn,
  giftsEarned,
  residentForGift,
  residents,
} from '../src/core/child/world/world.ts';

const items = [
  ...BUILDING_COSTS.map((cost, i) => ({ id: itemId('building', i), name: `B${i}`, emoji: '🏠', kind: 'building' as const, cost })),
  ...DECOR_COSTS.map((cost, i) => ({ id: itemId('decor', i), name: `D${i}`, emoji: '🌷', kind: 'decor' as const, cost })),
];
const statusOf = (state: ReturnType<typeof shopState>, id: string) => state.find((s) => s.item.id === id)!;

test('prices follow the item id, whatever the theme', () => {
  assert.equal(itemCost('b0'), 30);
  assert.equal(itemCost('b9'), 800);
  assert.equal(itemCost('d0'), 10);
  assert.equal(itemCost('b99'), 0);
  assert.equal(itemCost('x1'), 0);
});

test('the balance is everything earned minus everything spent, in any theme', () => {
  const owned = [ownedKey('unicorns', 'b0'), ownedKey('lego', 'd1'), 'unicorns:crown'];
  assert.equal(spentOn(owned), 30 + 15, 'ordinary treasures cost nothing');
  assert.equal(balanceOf(542, owned), 542 - 45);
  assert.equal(balanceOf(10, owned), 0, 'never negative');
});

test('items are affordable, being saved for, or owned', () => {
  const state = shopState(items, new Set(['b0']), 60);
  assert.equal(statusOf(state, 'b0').status, 'owned');
  assert.equal(statusOf(state, 'b1').status, 'affordable');
  assert.deepEqual([statusOf(state, 'b2').status, statusOf(state, 'b2').missing], ['saving', 20]);
  assert.equal(statusOf(state, 'd0').status, 'affordable');
});

test('the dream build stays locked until every other building stands', () => {
  const allButDream = new Set(BUILDING_COSTS.slice(0, -1).map((_, i) => itemId('building', i)));
  assert.equal(statusOf(shopState(items, new Set(['b0']), 5000), 'b9').status, 'locked');
  assert.equal(statusOf(shopState(items, allButDream, 5000), 'b9').status, 'affordable');
  assert.equal(statusOf(shopState(items, allButDream, 100), 'b9').status, 'saving');
});

test('the whole planet is a long project: thousands of artifacts', () => {
  const total = items.reduce((sum, i) => sum + i.cost, 0);
  assert.ok(total >= 2800, `only ${total}`);
});

test('every 5th path step is a gift that brings one resident', () => {
  const games = [
    { free: false, steps: 40, step: 11, plays: 10 }, // steps 5 and 10 passed
    { free: false, steps: 10, step: 6, plays: 5 }, // step 5 passed
    { free: true, steps: 1, step: 1, plays: 30 }, // free play gives no gifts
  ];
  assert.equal(giftsEarned(games), 3);
  const all = ['a', 'b', 'c', 'd'];
  assert.deepEqual(residents(all, 3), ['a', 'b', 'c']);
  assert.deepEqual(residents(all, 9), all);
  assert.equal(residentForGift(all, 3), 'c');
  assert.equal(residentForGift(all, 5), 'a');
  assert.equal(residentForGift(all, 0), undefined);
});

test('selling returns 80% of the price and the rest is lost for good', () => {
  const key = ownedKey('lego', 'b3');
  const cost = itemCost('b3');
  assert.equal(sellPrice('b3'), Math.floor(cost * 0.8));
  assert.equal(balanceOf(1000, [key]), 1000 - cost);
  // Sold: the item is gone, the loss stays on the books.
  const loss = cost - sellPrice('b3');
  assert.equal(balanceOf(1000, [lossKey(loss, 'a')]), 1000 - loss);
  // Buying and selling twice loses twice.
  assert.equal(balanceOf(1000, [lossKey(loss, 'a'), lossKey(loss, 'b')]), 1000 - 2 * loss);
});

// ---------------------------------------------------------- The solar system —

test('the first planet keeps the keys children already have; later planets add their number', async () => {
  const { parseOwned, SPACEPORT_ID, SPACEPORT_COST } = await import('../src/core/child/world/world.ts');
  assert.equal(ownedKey('lego', 'b3'), 'world:lego:b3');
  assert.equal(ownedKey('lego', 'b3', 3), 'world:lego:p3:b3');
  assert.deepEqual(parseOwned('world:lego:b3'), { themeId: 'lego', planet: 1, id: 'b3' });
  assert.deepEqual(parseOwned('world:lego:p3:b3'), { themeId: 'lego', planet: 3, id: 'b3' });
  assert.equal(parseOwned('lego:crown'), null);
  assert.equal(itemCost(SPACEPORT_ID), SPACEPORT_COST);
  // Every next planet is dearer, and the purse knows it.
  assert.equal(itemCost('b0', 1), 30);
  assert.equal(itemCost('b0', 5), 60);
  assert.equal(spentOn([ownedKey('lego', 'b0'), ownedKey('lego', 'b0', 5)]), 90);
  assert.equal(sellPrice('b0', 5), 48);
});

test('the dream build waits for the spaceport too', async () => {
  const { SPACEPORT_ID, SPACEPORT_COST } = await import('../src/core/child/world/world.ts');
  const withPort = [...items, { id: SPACEPORT_ID, name: 'Port', emoji: '🚀', kind: 'building' as const, cost: SPACEPORT_COST }];
  const allButDream = new Set(BUILDING_COSTS.slice(0, -1).map((_, i) => itemId('building', i)));
  assert.equal(statusOf(shopState(withPort, allButDream, 5000), 'b9').status, 'locked');
  assert.equal(statusOf(shopState(withPort, new Set([...allButDream, SPACEPORT_ID]), 5000), 'b9').status, 'affordable');
});

test('a key of knowledge is earned for every new step of any game, and stations are opened with them', async () => {
  const { keysEarned, keyBalance, keysSpent, stationCost, stationKey, parseStation, KEYS_PER_FREE_GAME } = await import('../src/core/child/world/world.ts');
  const path = (step: number, steps = 30) => ({ free: false, steps, step, plays: 99 });
  // Never opened and still on the first step: nothing yet; replays earn nothing.
  assert.equal(keysEarned([path(0), path(1)]), 0);
  assert.equal(keysEarned([path(4), path(11)]), 3 + 10);
  // The frontier never passes the end of a path.
  assert.equal(keysEarned([path(40, 30)]), 29);
  // A free-play game gives a key per level, up to its limit.
  assert.equal(keysEarned([{ free: true, steps: 1, step: 1, plays: 6 }]), 6);
  assert.equal(keysEarned([{ free: true, steps: 1, step: 1, plays: 500 }]), KEYS_PER_FREE_GAME);

  assert.equal(stationKey('k2', 3), 'know:p3:k2');
  assert.deepEqual(parseStation('know:p3:k2'), { planet: 3, id: 'k2' });
  assert.equal(parseStation('world:lego:b3'), null);
  assert.equal(stationCost('k0'), 3);
  assert.equal(stationCost('k0', 5), 6);
  assert.equal(stationCost('b0'), 0);
  // Stations take keys, never artifacts — and the other way round.
  const owned = [stationKey('k0'), stationKey('k1', 5), ownedKey('lego', 'b0')];
  assert.equal(keysSpent(owned), 3 + 10);
  assert.equal(keyBalance(20, owned), 7);
  assert.equal(keyBalance(5, owned), 0);
  assert.equal(spentOn(owned), 30);
});

test('a planet lets the child fly on only when nearly everything on it is done', async () => {
  const { planetNeeds, frontierPlanet } = await import('../src/core/child/world/world.ts');
  const base = { planet: 2, itemsOwned: 19, itemsTotal: 19, spaceport: true, stationsOpen: 4, gifts: 8, treasuresFound: 3, treasuresTotal: 12 };
  assert.equal(planetNeeds(base).done, true);
  assert.equal(planetNeeds({ ...base, spaceport: false }).done, false, 'no spaceport');
  assert.equal(planetNeeds({ ...base, itemsOwned: 18 }).done, false, 'something not built');
  assert.equal(planetNeeds({ ...base, stationsOpen: 3 }).done, false, 'too few stations of knowledge');
  assert.equal(planetNeeds({ ...base, gifts: 7 }).done, false, 'too few residents');
  assert.equal(planetNeeds({ ...base, treasuresFound: 2 }).done, false, 'too few treasures');
  const none = Array(8).fill(false);
  assert.equal(frontierPlanet(none, none), 1);
  assert.equal(frontierPlanet([true, true, ...none.slice(2)], none), 3);
  // Something already stands on planet 2: it stays open even if planet 1 is no longer complete.
  assert.equal(frontierPlanet(none, [true, true, ...none.slice(2)]), 2);
});
