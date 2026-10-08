import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEPLETION_GRACE_MS,
  describe,
  heartbeat,
  localDayKey,
  refillIfRested,
  nextLocalMidnight,
  resetSession,
  startSession,
} from '../api/_lib/screenTime.js';

const MIN = 60_000;
const limits = { sessionMin: 15, cooldownMin: 45, maxDailyMin: 60 };
// 2026-10-06 10:00 UTC, child in Kyiv (UTC+3 → getTimezoneOffset() = -180).
const T0 = Date.UTC(2026, 9, 6, 10, 0, 0);
const TZ = -180;
const fresh = () => resetSession(T0, TZ);

/** Play continuously for `ms`, pinging every 30 s. */
function play(state, from, ms, l = limits) {
  let s = state;
  for (let t = from + 30_000; t <= from + ms; t += 30_000) s = heartbeat(s, l, t, TZ);
  return s;
}

test('day key and midnight follow the child’s local time', () => {
  assert.equal(localDayKey(Date.UTC(2026, 9, 6, 22, 30), TZ), '2026-10-07');
  assert.equal(nextLocalMidnight(T0, TZ), Date.UTC(2026, 9, 6, 21, 0, 0));
});

test('heartbeats bank play time and report what is left', () => {
  let s = startSession(fresh(), limits, T0, TZ);
  s = play(s, T0, 5 * MIN);
  assert.equal(s.sessionElapsedMs, 5 * MIN);
  assert.equal(describe(s, limits, T0 + 5 * MIN).remaining_time_seconds, 10 * 60);
});

test('a long gap between pings is a pause, not play time', () => {
  let s = startSession(fresh(), limits, T0, TZ);
  s = heartbeat(s, limits, T0 + 30_000, TZ);
  s = heartbeat(s, limits, T0 + 20 * MIN, TZ); // app was closed for ~20 min
  assert.equal(s.sessionElapsedMs, 30_000);
});

test('pausing stops the clock until the next start', () => {
  let s = startSession(fresh(), limits, T0, TZ);
  s = heartbeat(s, limits, T0 + 20_000, TZ, 'pause');
  assert.equal(s.lastHeartbeatAt, null);
  s = heartbeat(s, limits, T0 + 40_000, TZ); // stray ping while paused
  assert.equal(s.sessionElapsedMs, 20_000);
});

test('restarting (reload / other device) never refills the tank', () => {
  let s = startSession(fresh(), limits, T0, TZ);
  s = play(s, T0, 14 * MIN);
  s = startSession(s, limits, T0 + 14 * MIN + 5_000, TZ);
  assert.equal(describe(s, limits, T0 + 14 * MIN + 5_000).remaining_time_seconds, 60);
});

test('the client ends a depleted session → cooldown, time banked for the day', () => {
  let s = startSession(fresh(), limits, T0, TZ);
  s = play(s, T0, 15 * MIN);
  const view = describe(s, limits, T0 + 15 * MIN);
  assert.equal(view.depleted, true);
  assert.equal(view.in_cooldown, false, 'the current task may still be finished');

  const end = T0 + 15 * MIN + 10_000;
  s = heartbeat(s, limits, end, TZ, 'depleted');
  assert.equal(s.cooldownUntil, end + 45 * MIN);
  assert.equal(s.sessionElapsedMs, 0);
  assert.ok(Math.abs(s.minutesUsedToday - (15 + 10 / 60)) < 1e-9);
  assert.equal(describe(s, limits, end).cooldown_remaining_seconds, 45 * 60);
});

test('a client that never ends the session is cut off after the grace period', () => {
  let s = startSession(fresh(), limits, T0, TZ);
  s = play(s, T0, 15 * MIN + DEPLETION_GRACE_MS);
  assert.notEqual(s.cooldownUntil, null);
});

test('a false "depleted" from the client is ignored', () => {
  let s = startSession(fresh(), limits, T0, TZ);
  s = heartbeat(s, limits, T0 + 30_000, TZ, 'depleted');
  assert.equal(s.cooldownUntil, null);
});

test('no play time is counted during a cooldown; it clears when it expires', () => {
  let s = startSession(fresh(), limits, T0, TZ);
  s = play(s, T0, 15 * MIN);
  const end = T0 + 15 * MIN;
  s = heartbeat(s, limits, end, TZ, 'depleted');
  s = startSession(s, limits, end + 10 * MIN, TZ);
  assert.equal(s.lastHeartbeatAt, null);
  assert.equal(describe(s, limits, end + 10 * MIN).remaining_time_seconds, 0);

  s = startSession(s, limits, end + 46 * MIN, TZ);
  assert.equal(s.cooldownUntil, null);
  assert.equal(describe(s, limits, end + 46 * MIN).remaining_time_seconds, 15 * 60);
});

test('the daily cap shortens the last session and rests until tomorrow', () => {
  const l = { sessionMin: 15, cooldownMin: 5, maxDailyMin: 20 };
  let s = startSession(fresh(), l, T0, TZ);
  s = play(s, T0, 15 * MIN, l);
  let t = T0 + 15 * MIN;
  s = heartbeat(s, l, t, TZ, 'depleted');
  t += 6 * MIN;
  s = startSession(s, l, t, TZ);
  assert.equal(describe(s, l, t).remaining_time_seconds, 5 * 60, 'only 5 daily minutes left');
  s = play(s, t, 5 * MIN, l);
  t += 5 * MIN;
  s = heartbeat(s, l, t, TZ, 'depleted');
  assert.equal(s.cooldownUntil, nextLocalMidnight(t, TZ));
});

test('a new local day starts with a full tank', () => {
  let s = startSession(fresh(), limits, T0, TZ);
  s = play(s, T0, 15 * MIN);
  s = heartbeat(s, limits, T0 + 15 * MIN, TZ, 'depleted');
  const tomorrow = T0 + 24 * 60 * MIN;
  s = startSession(s, limits, tomorrow, TZ);
  assert.equal(s.minutesUsedToday, 0);
  assert.equal(describe(s, limits, tomorrow).remaining_time_seconds, 15 * 60);
});

test('maxDailyMin = 0 means no daily cap', () => {
  const l = { sessionMin: 15, cooldownMin: 45, maxDailyMin: 0 };
  const s = { ...fresh(), minutesUsedToday: 500 };
  assert.equal(describe(startSession(s, l, T0, TZ), l, T0).remaining_time_seconds, 15 * 60);
});

test('time away gives the tank back little by little; the day still counts the minutes', () => {
  let s = startSession(fresh(), limits, T0, TZ);
  s = play(s, T0, 6 * MIN);
  s = heartbeat(s, limits, T0 + 6 * MIN, TZ, 'pause');

  // Back within a minute: that was no rest, the same nine minutes are left.
  let back = startSession(s, limits, T0 + 7 * MIN, TZ);
  assert.equal(describe(back, limits, T0 + 7 * MIN).remaining_time_seconds, 9 * 60);

  // Back after nine minutes — a fifth of the 45-minute rest gives back a fifth of a session: three minutes.
  const soon = T0 + 6 * MIN + 9 * MIN;
  back = startSession(s, limits, soon, TZ);
  assert.equal(describe(back, limits, soon).remaining_time_seconds, 12 * 60);
  assert.equal(describe(back, limits, soon).daily_remaining_seconds, 54 * 60, 'the day has still lost all six minutes');

  // …and the same rest is not counted again: the next one is measured from this visit.
  const again = startSession(heartbeat(back, limits, soon + 30_000, TZ, 'pause'), limits, soon + 60_000, TZ);
  assert.equal(describe(again, limits, soon + 60_000).remaining_time_seconds, 12 * 60 - 30);

  // Never more than was played: eighteen minutes away give back all six, not seven.
  back = startSession(s, limits, T0 + 6 * MIN + 21 * MIN, TZ);
  assert.equal(back.sessionElapsedMs, 0);

  s = startSession(fresh(), limits, T0, TZ);
  s = play(s, T0, 2 * MIN);
  s = heartbeat(s, limits, T0 + 2 * MIN, TZ, 'pause');

  // Back after the 45-minute rest: a full session, two minutes gone from the day.
  const later = T0 + 2 * MIN + 45 * MIN;
  back = startSession(s, limits, later, TZ);
  assert.equal(back.sessionElapsedMs, 0);
  assert.equal(back.minutesUsedToday, 2);
  assert.equal(describe(back, limits, later).remaining_time_seconds, 15 * 60);
  assert.equal(describe(back, limits, later).daily_remaining_seconds, 58 * 60);
});

test('an app that was killed without a pause also rests', () => {
  let s = startSession(fresh(), limits, T0, TZ);
  s = play(s, T0, 3 * MIN);
  assert.equal(refillIfRested(s, limits, T0 + 4 * MIN).sessionElapsedMs, 3 * MIN, 'a minute is within the heartbeat window');
  assert.equal(refillIfRested(s, limits, T0 + 6 * MIN).sessionElapsedMs, 2 * MIN, 'three minutes away give back one');
  assert.equal(refillIfRested(s, limits, T0 + 60 * MIN).sessionElapsedMs, 0);
});
