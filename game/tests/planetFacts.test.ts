import { test } from 'node:test';
import assert from 'node:assert/strict';
import { common, written } from '../src/core/language/marks.ts';
import { FACTS_PER_PLANET, PLANET_FACTS, planetFacts } from '../src/core/child/world/planetFacts.ts';
import { PLANET_NAMES, WORLD_PLANETS } from '../src/core/child/world/world.ts';

test('every planet tells twenty different stories of several sentences', () => {
  const all: string[] = [];
  for (const id of WORLD_PLANETS) {
    const facts = PLANET_FACTS[id];
    assert.equal(facts.length, FACTS_PER_PLANET, `${PLANET_NAMES[id]}: ${facts.length} facts`);
    for (const fact of facts) {
      const sentences = written(fact).split(/[.!?](?:\s|$)/).filter((part) => part.trim().length > 0);
      assert.ok(sentences.length >= 2, `one sentence only: ${fact}`);
      assert.ok(!/[A-Za-z]/.test(fact), `the Ukrainian voice cannot read: ${fact}`);
    }
    all.push(...facts);
  }
  assert.equal(new Set(all).size, all.length, 'a story is told twice');
});

test('the stories every language tells pair one to one; a story of its own is marked so', () => {
  for (const id of WORLD_PLANETS) {
    const told = (lang?: 'en' | 'pl') => planetFacts(id, lang).map(common).filter(Boolean).length;
    for (const lang of ['en', 'pl'] as const) {
      assert.equal(planetFacts(id, lang).length, FACTS_PER_PLANET, `${PLANET_NAMES[id]} [${lang}]`);
      assert.equal(told(lang), told(), `${PLANET_NAMES[id]} [${lang}]: the shared stories do not pair with the Ukrainian ones`);
    }
  }
});
