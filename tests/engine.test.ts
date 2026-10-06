import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LevelEngine } from '../src/core/engine/LevelEngine.ts';
import { MAX_EXTRA_TASKS } from '../src/core/engine/BaseGameEngine.ts';
import { publishStatus } from '../src/core/engine/publish.ts';
import { composeLevel, recallSteps } from '../src/core/engine/recall.ts';

const tasks = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `t${i}`, key: `q${i}` }));

/** Answer every task correctly and return the order they were shown in. */
function playThrough(engine: LevelEngine, wrongOn: Record<string, number> = {}): string[] {
  const shown: string[] = [];
  const left = { ...wrongOn };
  while (!engine.isFinished) {
    const task = engine.currentTask!;
    shown.push(task.id);
    while ((left[task.id] ?? 0) > 0) {
      engine.submitAnswer(task.id, false);
      left[task.id] -= 1;
    }
    assert.equal(engine.submitAnswer(task.id, true).status, 'CORRECT');
    engine.advance();
  }
  return shown;
}

test('a clean run shows each task once', () => {
  const engine = new LevelEngine({ steps_count_default: 6, tasks: tasks(10) });
  assert.equal(engine.total, 6);
  assert.deepEqual(playThrough(engine), ['t0', 't1', 't2', 't3', 't4', 't5']);
});

test('a missed task comes back once, at the end of the level', () => {
  const engine = new LevelEngine({ steps_count_default: 4, tasks: tasks(4) });
  const first = engine.submitAnswer('t0', false);
  assert.deepEqual(first, { status: 'INCORRECT', audio: 'SND_ERROR', animation: 'SHAKE', requeued: true });
  assert.equal(engine.total, 5);
  assert.deepEqual(playThrough(engine), ['t0', 't1', 't2', 't3', 't0']);
});

test('a task is never shown more than twice, however many mistakes', () => {
  const engine = new LevelEngine({ steps_count_default: 3, tasks: tasks(3) });
  // 3 mistakes on the first showing, 2 more on the repeat.
  const shown = playThrough(engine, { t1: 3 });
  assert.equal(shown.filter((id) => id === 't1').length, 2);
  assert.equal(engine.submitAnswer('t1', false).requeued, false);
  assert.equal(shown.length, 4);
});

test('the repeat showing is flagged so the UI can scaffold it', () => {
  const engine = new LevelEngine({ steps_count_default: 2, tasks: tasks(2) });
  engine.submitAnswer('t0', false);
  assert.equal(engine.isRepeatShowing, false);
  engine.advance();
  engine.advance();
  assert.equal(engine.currentTask?.id, 't0');
  assert.equal(engine.isRepeatShowing, true);
});

test('the level shrinks to the unique tasks available', () => {
  const pool = [
    { id: 'a', key: '1+1' },
    { id: 'b', key: '1+1' },
    { id: 'c', key: '1+2' },
    { id: 'd', key: '2+1' },
  ];
  const engine = new LevelEngine({ steps_count_default: 6, tasks: pool });
  assert.equal(engine.baseTotal, 3);
  assert.deepEqual(playThrough(engine), ['a', 'c', 'd']);
});

test('repeatOnError=false keeps a fixed-length level', () => {
  const engine = new LevelEngine({ steps_count_default: 3, tasks: tasks(3), repeatOnError: false });
  assert.equal(engine.submitAnswer('t0', false).requeued, false);
  assert.equal(playThrough(engine).length, 3);
});

test('extensions are capped', () => {
  const engine = new LevelEngine({ steps_count_default: 2, tasks: tasks(2) });
  let added = 0;
  for (let i = 0; i < 10; i += 1) if (engine.extend({ id: `x${i}`, key: `x${i}` })) added += 1;
  assert.equal(added, MAX_EXTRA_TASKS);
  assert.equal(engine.total, 2 + MAX_EXTRA_TASKS);
});

test('publish status: soon → new (60 days) → live', () => {
  const published = '2026-11-01T00:00:00Z';
  const at = Date.parse(published);
  const day = 24 * 60 * 60 * 1000;
  assert.equal(publishStatus(published, at - 1), 'soon');
  assert.equal(publishStatus(published, at), 'new');
  assert.equal(publishStatus(published, at + 59 * day), 'new');
  assert.equal(publishStatus(published, at + 60 * day), 'live');
  assert.equal(publishStatus(undefined), 'live');
  assert.equal(publishStatus('not a date'), 'live');
});

// ---- Spaced recall: half a level is new, half comes back from earlier steps ----

const keyed = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => ({ id: `${prefix}${i}`, key: `${prefix}${i}` }));
const keyOf = (t: { key: string }) => t.key;

test('recall reaches five steps back and never before step 1', () => {
  assert.deepEqual(recallSteps(1), []);
  assert.deepEqual(recallSteps(3), [1, 2]);
  assert.deepEqual(recallSteps(9), [4, 5, 6, 7, 8]);
});

test('a level is five new tasks and five recalled, alternating from a new one', () => {
  const level = composeLevel(keyed('n', 8), keyed('r', 8), 10, keyOf);
  assert.deepEqual(level.map(keyOf), ['n0', 'r0', 'n1', 'r1', 'n2', 'r2', 'n3', 'r3', 'n4', 'r4']);
});

test('when one half is short the other fills the level', () => {
  assert.equal(composeLevel(keyed('n', 2), keyed('r', 20), 10, keyOf).filter((t) => t.key.startsWith('r')).length, 8);
  assert.equal(composeLevel(keyed('n', 20), [], 10, keyOf).length, 10);
  assert.equal(composeLevel(keyed('n', 3), keyed('r', 2), 10, keyOf).length, 5);
});

test('a recalled task never repeats a new one', () => {
  const level = composeLevel(keyed('n', 5), [...keyed('n', 5), ...keyed('r', 5)], 10, keyOf);
  assert.equal(new Set(level.map(keyOf)).size, 10);
});
