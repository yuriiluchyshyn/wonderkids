import assert from 'node:assert/strict';
import { test } from 'node:test';
import { beat, beatCeilingMs, fillScript, helpAfter, helpOnIdle, ids, readingMs } from '../src/core/game/hints/script.ts';
import type { HintScript } from '../src/core/game/hints/types.ts';

test('a beat names what blinks while it is said, and nothing when there is nothing', () => {
  assert.deepEqual(beat('Довга стрілка — хвилини.', ['hand:minute']), { text: 'Довга стрілка — хвилини.', focus: ['hand:minute'] });
  assert.deepEqual(beat('Це квітка:', []), { text: 'Це квітка:' });
  assert.deepEqual(beat('Разом — 5 з 6.', undefined, { show: 'total' }), { text: 'Разом — 5 з 6.', show: 'total' });
  assert.deepEqual(ids('slice', 3), ['slice:0', 'slice:1', 'slice:2']);
  assert.deepEqual(ids('slice', 3, 5), ['slice:3', 'slice:4']);
  assert.deepEqual(ids('slice', 0), []);
});

test('a board fills its script: the words, the ids that blink, and which beats are said at all', () => {
  const script: HintScript = {
    by: 'board',
    beats: [
      { text: '{n} — це {times} по 2, і ще {left} залишається.', focus: ['div:groups', 'div:left'], if: 'off' },
      { text: '{n} — це рівно {times} по 2.', unless: 'off' },
      { text: 'Лопай {next}.', focus: ['abc:{N}', 'bubble:{nextId}'] },
    ],
  };
  const left = fillScript(script, { n: 23, times: 11, left: 1, off: 1, next: 'T', N: 'T', nextId: 'b3' });
  assert.deepEqual(
    left.beats.map((b) => b.text),
    ['23 — це 11 по 2, і ще 1 залишається.', 'Лопай T.'],
  );
  assert.deepEqual(left.beats[1].focus, ['abc:T', 'bubble:b3']);
  // Settled: no conditions are carried on.
  assert.ok(left.beats.every((b) => b.if === undefined && b.unless === undefined));
  // Nothing left over: the other beat is said instead (an empty hole counts as not filled).
  const exact = fillScript(script, { n: 20, times: 10, off: '' });
  assert.equal(exact.beats[0].text, '20 — це рівно 10 по 2.');
  // A hole nobody filled stays as written, so the content check can find it.
  assert.equal(fillScript({ beats: [{ text: 'Після {prev} іде T.' }] }, {}).beats[0].text, 'Після {prev} іде T.');
  // The script itself is not touched.
  assert.equal(script.beats[0].text.includes('{n}'), true);
});

test('when the shell opens a help: its own rule, or the game’s', () => {
  const payload = (help?: HintScript) => ({ help });
  assert.equal(helpAfter(payload(), 2), 2);
  assert.equal(helpAfter(payload({ beats: [] }), 2), 2);
  assert.equal(helpAfter(payload({ beats: [], after: { mistakes: 1 } }), 2), 1);
  assert.equal(helpOnIdle(payload({ beats: [], after: { idle: true } })), true);
  assert.equal(helpOnIdle(payload({ beats: [] })), false);
  // A board's help is the board's to start, never the idle timer's.
  assert.equal(helpOnIdle(payload({ beats: [], by: 'board', after: { idle: true } })), false);
  assert.equal(helpOnIdle(null), false);
});

test('a beat with the voice off stays long enough to read, and never hangs with it on', () => {
  assert.equal(readingMs('Так.'), 1500);
  assert.ok(readingMs('x'.repeat(100)) >= 6000);
  assert.ok(beatCeilingMs('Так.') >= 9000);
  // However long a beat, the ceiling is above the time it takes to say it.
  const long = 'Широкий бік знака — до більшого: 10 > 4. '.repeat(3);
  assert.ok(beatCeilingMs(long) > readingMs(long));
});
