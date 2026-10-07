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
  landmarkStage,
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

test('a path landmark grows from foundation to complete along the path', () => {
  const at = (step: number, plays = 1) => landmarkStage({ free: false, steps: 10, step, plays });
  assert.equal(landmarkStage({ free: false, steps: 10, step: 1, plays: 0 }), 0);
  assert.equal(at(1), 1, 'first finished level lays the foundation');
  assert.equal(at(2), 1);
  assert.equal(at(4), 2);
  assert.equal(at(7), 3);
  assert.equal(at(10), 4);
  assert.equal(at(99), 4, 'a stale step beyond the path is clamped');
});

test('a free-play landmark grows with how often the game is played', () => {
  const at = (plays: number) => landmarkStage({ free: true, steps: 1, step: 1, plays });
  assert.deepEqual([0, 1, 2, 3, 5, 6, 9, 10, 50].map(at), [0, 1, 1, 2, 2, 3, 3, 4, 4]);
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
