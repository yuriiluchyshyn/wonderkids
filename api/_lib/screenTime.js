// Server-side screen-time accounting (PRD v4.0 §2.2). The database is the
// source of truth for a child's remaining play time, so clearing browser
// storage, reloading or switching device/account can never refill the tank.
//
// Pure functions only — no I/O — so the rules are easy to reason about:
//
//   state  { dayKey, minutesUsedToday, sessionElapsedMs, cooldownUntil,
//            lastSessionEndedAt, lastHeartbeatAt }
//   limits { sessionMin, cooldownMin, maxDailyMin }
//
// `minutesUsedToday` holds time banked by FINISHED sessions today; the running
// session lives in `sessionElapsedMs` until it ends.

/** Client pings every 30 s; a gap longer than this means play was paused. */
export const HEARTBEAT_MAX_GAP_MS = 90_000;
/** How long an empty tank may keep running (finishing the current task). */
export const DEPLETION_GRACE_MS = 90_000;
/** Tolerated client/server disagreement when the client reports "depleted". */
const DEPLETED_TOLERANCE_MS = 20_000;

const MIN = 60_000;

/** Clamp a client-supplied `Date#getTimezoneOffset()` to real-world offsets. */
export function clampTzOffset(tzOffsetMin) {
  const n = Number(tzOffsetMin);
  if (!Number.isFinite(n)) return 0;
  return Math.max(-14 * 60, Math.min(12 * 60, Math.round(n)));
}

/** `YYYY-MM-DD` in the child's local time. */
export function localDayKey(now, tzOffsetMin) {
  return new Date(now - tzOffsetMin * MIN).toISOString().slice(0, 10);
}

/** Epoch ms of the next local midnight. */
export function nextLocalMidnight(now, tzOffsetMin) {
  const local = new Date(now - tzOffsetMin * MIN);
  local.setUTCHours(24, 0, 0, 0);
  return local.getTime() + tzOffsetMin * MIN;
}

function remaining(state, limits) {
  const sessionMs = Math.max(1, limits.sessionMin) * MIN;
  const sessionRemainingMs = Math.max(0, sessionMs - state.sessionElapsedMs);
  const hasDailyCap = limits.maxDailyMin > 0;
  const dailyUsedMs = state.minutesUsedToday * MIN + state.sessionElapsedMs;
  const dailyRemainingMs = hasDailyCap
    ? Math.max(0, limits.maxDailyMin * MIN - dailyUsedMs)
    : Number.POSITIVE_INFINITY;
  return {
    sessionRemainingMs,
    dailyRemainingMs,
    remainingMs: Math.min(sessionRemainingMs, dailyRemainingMs),
    sessionOverrunMs: Math.max(0, state.sessionElapsedMs - sessionMs),
    dailyOverrunMs: hasDailyCap ? Math.max(0, dailyUsedMs - limits.maxDailyMin * MIN) : 0,
  };
}

/** Roll the day over and clear an expired cooldown. */
function normalise(state, now, tzOffsetMin) {
  const next = {
    dayKey: state.dayKey ?? '',
    minutesUsedToday: Math.max(0, Number(state.minutesUsedToday) || 0),
    sessionElapsedMs: Math.max(0, Number(state.sessionElapsedMs) || 0),
    cooldownUntil: state.cooldownUntil ?? null,
    lastSessionEndedAt: state.lastSessionEndedAt ?? null,
    lastHeartbeatAt: state.lastHeartbeatAt ?? null,
  };
  const today = localDayKey(now, tzOffsetMin);
  if (next.dayKey !== today) {
    // A new day starts with a fresh tank.
    next.dayKey = today;
    next.minutesUsedToday = 0;
    next.sessionElapsedMs = 0;
    next.lastHeartbeatAt = null;
  }
  if (next.cooldownUntil !== null && now >= next.cooldownUntil) next.cooldownUntil = null;
  return next;
}

function endSession(state, limits, now, tzOffsetMin) {
  const dailyExhausted = remaining(state, limits).dailyRemainingMs <= 0;
  let cooldownUntil = now + Math.max(0, limits.cooldownMin) * MIN;
  // Out of daily time: resting until tomorrow, not just for one cooldown.
  if (dailyExhausted) cooldownUntil = Math.max(cooldownUntil, nextLocalMidnight(now, tzOffsetMin));
  return {
    ...state,
    minutesUsedToday: state.minutesUsedToday + state.sessionElapsedMs / MIN,
    sessionElapsedMs: 0,
    cooldownUntil,
    lastSessionEndedAt: now,
    lastHeartbeatAt: null,
  };
}

/** What the API reports back (snake_case, per the PRD contract). */
export function describe(state, limits, now) {
  const r = remaining(state, limits);
  const inCooldown = state.cooldownUntil !== null && now < state.cooldownUntil;
  const secs = (ms) => (Number.isFinite(ms) ? Math.ceil(ms / 1000) : null);
  return {
    remaining_time_seconds: inCooldown ? 0 : secs(r.remainingMs),
    session_remaining_seconds: secs(r.sessionRemainingMs),
    daily_remaining_seconds: secs(r.dailyRemainingMs),
    depleted: !inCooldown && r.remainingMs <= 0,
    in_cooldown: inCooldown,
    cooldown_remaining_seconds: inCooldown ? Math.ceil((state.cooldownUntil - now) / 1000) : 0,
    server_time: now,
    screen_time: {
      dayKey: state.dayKey,
      minutesUsedToday: state.minutesUsedToday,
      sessionElapsedMs: state.sessionElapsedMs,
      lastSessionEndedAt: state.lastSessionEndedAt,
    },
  };
}

/** Read-only view of the current state (also applies day roll / expired cooldown). */
export function peek(state, now, tzOffsetMin) {
  return normalise(state, now, tzOffsetMin);
}

/** A play segment begins: open the heartbeat window (unless resting). */
export function startSession(state, limits, now, tzOffsetMin) {
  const next = normalise(state, now, tzOffsetMin);
  if (next.cooldownUntil !== null) return next;
  // Arriving with an already-empty tank (e.g. daily cap reached elsewhere).
  if (remaining(next, limits).remainingMs <= 0) return endSession(next, limits, now, tzOffsetMin);
  next.lastHeartbeatAt = now;
  return next;
}

/**
 * A heartbeat: bank the time since the previous ping, then decide whether the
 * session is over. `end`: 'pause' (child left the game), 'depleted' (client
 * finished the bedtime hand-off) or undefined (still playing).
 */
export function heartbeat(state, limits, now, tzOffsetMin, end) {
  const next = normalise(state, now, tzOffsetMin);
  if (next.cooldownUntil !== null) {
    next.lastHeartbeatAt = null;
    return next;
  }

  if (next.lastHeartbeatAt !== null) {
    const gap = now - next.lastHeartbeatAt;
    // A longer gap means the app was backgrounded/closed — that is not play.
    if (gap > 0 && gap <= HEARTBEAT_MAX_GAP_MS) next.sessionElapsedMs += gap;
  }
  next.lastHeartbeatAt = end === 'pause' ? null : now;

  const r = remaining(next, limits);
  const overrun = Math.max(r.sessionOverrunMs, r.dailyOverrunMs);
  const clientDone = end === 'depleted' && r.remainingMs <= DEPLETED_TOLERANCE_MS;
  // The client normally ends the session itself (after the current task and
  // the cutscene). If it never does, the server ends it after a short grace.
  if (clientDone || (r.remainingMs <= 0 && overrun >= DEPLETION_GRACE_MS)) {
    return endSession(next, limits, now, tzOffsetMin);
  }
  return next;
}

/** Parent top-up: a full tank and no cooldown. */
export function resetSession(now, tzOffsetMin) {
  return {
    dayKey: localDayKey(now, tzOffsetMin),
    minutesUsedToday: 0,
    sessionElapsedMs: 0,
    cooldownUntil: null,
    lastSessionEndedAt: null,
    lastHeartbeatAt: null,
  };
}
