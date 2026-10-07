import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isNextBubble, isRecipe, minGap } from '../src/core/game/templates/validate.ts';

test('bubble pop: only the next face in order pops', () => {
  const faces = ['МА', 'МА'];
  assert.equal(isNextBubble(['К', 'І', 'Т'], 0, 'К'), true);
  assert.equal(isNextBubble(['К', 'І', 'Т'], 0, 'Т'), false);
  assert.equal(isNextBubble(['К', 'І', 'Т'], 2, 'Т'), true);
  // Two bubbles with the same face are interchangeable.
  assert.equal(isNextBubble(faces, 0, 'МА'), true);
  assert.equal(isNextBubble(faces, 1, 'МА'), true);
  // Nothing pops once the word is complete.
  assert.equal(isNextBubble(faces, 2, 'МА'), false);
});

test('colour mixer: the recipe is two paints in any order', () => {
  assert.equal(isRecipe(['yellow', 'blue'], ['blue', 'yellow']), true);
  assert.equal(isRecipe(['yellow', 'blue'], ['yellow', 'red']), false);
  assert.equal(isRecipe(['yellow', 'blue'], ['yellow']), false);
  assert.equal(isRecipe(['yellow', 'blue'], ['yellow', 'yellow']), false);
});

test('dot-to-dot: smallest gap between stars', () => {
  assert.equal(minGap([{ x: 0, y: 0 }, { x: 3, y: 4 }, { x: 30, y: 40 }]), 5);
  assert.equal(minGap([{ x: 1, y: 1 }]), Infinity);
});
