import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FACTS_PER_PLANET, PLANET_FACTS } from '../src/core/child/world/planetFacts.ts';
import { PLANET_NAMES, WORLD_PLANETS } from '../src/core/child/world/world.ts';

test('every planet tells twenty different stories of several sentences', () => {
  const all: string[] = [];
  for (const id of WORLD_PLANETS) {
    const facts = PLANET_FACTS[id];
    assert.equal(facts.length, FACTS_PER_PLANET, `${PLANET_NAMES[id]}: ${facts.length} facts`);
    for (const fact of facts) {
      const sentences = fact.split(/[.!?](?:\s|$)/).filter((part) => part.trim().length > 0);
      assert.ok(sentences.length >= 2, `one sentence only: ${fact}`);
      assert.ok(!/[A-Za-z]/.test(fact), `the Ukrainian voice cannot read: ${fact}`);
    }
    all.push(...facts);
  }
  assert.equal(new Set(all).size, all.length, 'a story is told twice');
});
