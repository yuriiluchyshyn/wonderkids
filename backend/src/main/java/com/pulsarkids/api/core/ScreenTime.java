package com.pulsarkids.api.core;

import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.model.SessionEnd;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Map;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Server-side screen-time accounting (PRD v4.0 §2.2). The database is the
 * source of truth for a child's remaining play time, so clearing browser
 * storage, reloading or switching device/account can never refill the tank.
 *
 * Pure functions only — no I/O — so the rules are easy to reason about. A
 * `State` is never changed by them: each returns the next one.
 *
 * `minutesUsedToday` holds time banked by FINISHED sessions today; the running
 * session lives in `sessionElapsedMs` until it ends.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class ScreenTime {
  /** Client pings every 30 s; a gap longer than this means play was paused. */
  public static final long HEARTBEAT_MAX_GAP_MS = 90_000;
  /**
   * How long an empty tank may keep running. Out of time never interrupts a
   * level: the child finishes the one in progress, and only then rests — so the
   * server allows a level's worth of overrun before it ends the session itself.
   */
  public static final long DEPLETION_GRACE_MS = 10 * 60_000;
  /** Tolerated client/server disagreement when the client reports "depleted". */
  private static final long DEPLETED_TOLERANCE_MS = 20_000;

  private static final long MIN = 60_000;

  public record State(
      String dayKey,
      double minutesUsedToday,
      double sessionElapsedMs,
      Long cooldownUntil,
      Long lastSessionEndedAt,
      Long lastHeartbeatAt) {

    public State withUsed(double minutes) {
      return new State(dayKey, minutes, sessionElapsedMs, cooldownUntil, lastSessionEndedAt, lastHeartbeatAt);
    }

    State withElapsed(double ms) {
      return new State(dayKey, minutesUsedToday, ms, cooldownUntil, lastSessionEndedAt, lastHeartbeatAt);
    }

    State withCooldown(Long until) {
      return new State(dayKey, minutesUsedToday, sessionElapsedMs, until, lastSessionEndedAt, lastHeartbeatAt);
    }

    State withEnded(Long at) {
      return new State(dayKey, minutesUsedToday, sessionElapsedMs, cooldownUntil, at, lastHeartbeatAt);
    }

    State withHeartbeat(Long at) {
      return new State(dayKey, minutesUsedToday, sessionElapsedMs, cooldownUntil, lastSessionEndedAt, at);
    }
  }

  /** The parents' settings, in minutes. `maxDailyMin` 0 — no daily cap. */
  public record Limits(int sessionMin, int cooldownMin, int maxDailyMin) {}

  /** Clamp a client-supplied `Date#getTimezoneOffset()` to real-world offsets. */
  public static int clampTzOffset(double tzOffsetMin) {
    if (Double.isNaN(tzOffsetMin) || Double.isInfinite(tzOffsetMin)) return 0;
    return (int) Math.max(-14 * 60, Math.min(12 * 60, Math.round(tzOffsetMin)));
  }

  /** `YYYY-MM-DD` in the child's local time. */
  public static String localDayKey(long now, int tzOffsetMin) {
    return Instant.ofEpochMilli(now - tzOffsetMin * MIN).atOffset(ZoneOffset.UTC).toLocalDate().toString();
  }

  /** Epoch ms of the next local midnight. */
  public static long nextLocalMidnight(long now, int tzOffsetMin) {
    LocalDate local = Instant.ofEpochMilli(now - tzOffsetMin * MIN).atOffset(ZoneOffset.UTC).toLocalDate();
    return local.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC).toEpochMilli() + tzOffsetMin * MIN;
  }

  private record Remaining(double sessionRemainingMs, double dailyRemainingMs, double remainingMs, double sessionOverrunMs, double dailyOverrunMs) {}

  private static Remaining remaining(State state, Limits limits) {
    double sessionMs = Math.max(1, limits.sessionMin()) * (double) MIN;
    double sessionRemainingMs = Math.max(0, sessionMs - state.sessionElapsedMs());
    boolean hasDailyCap = limits.maxDailyMin() > 0;
    double dailyUsedMs = state.minutesUsedToday() * MIN + state.sessionElapsedMs();
    double dailyRemainingMs = hasDailyCap ? Math.max(0, limits.maxDailyMin() * (double) MIN - dailyUsedMs) : Double.POSITIVE_INFINITY;
    return new Remaining(
        sessionRemainingMs,
        dailyRemainingMs,
        Math.min(sessionRemainingMs, dailyRemainingMs),
        Math.max(0, state.sessionElapsedMs() - sessionMs),
        hasDailyCap ? Math.max(0, dailyUsedMs - limits.maxDailyMin() * (double) MIN) : 0);
  }

  private static double nonNegative(double value) {
    return Double.isNaN(value) ? 0 : Math.max(0, value);
  }

  /** Roll the day over and clear an expired cooldown. */
  private static State normalise(State state, long now, int tzOffsetMin) {
    String dayKey = state.dayKey() == null ? "" : state.dayKey();
    double used = nonNegative(state.minutesUsedToday());
    double elapsed = nonNegative(state.sessionElapsedMs());
    Long cooldownUntil = state.cooldownUntil();
    Long lastHeartbeatAt = state.lastHeartbeatAt();
    String today = localDayKey(now, tzOffsetMin);
    if (!dayKey.equals(today)) {
      // A new day starts with a fresh tank.
      dayKey = today;
      used = 0;
      elapsed = 0;
      lastHeartbeatAt = null;
    }
    if (cooldownUntil != null && now >= cooldownUntil) cooldownUntil = null;
    return new State(dayKey, used, elapsed, cooldownUntil, state.lastSessionEndedAt(), lastHeartbeatAt);
  }

  private static State endSession(State state, Limits limits, long now, int tzOffsetMin) {
    boolean dailyExhausted = remaining(state, limits).dailyRemainingMs() <= 0;
    long cooldownUntil = now + Math.max(0, limits.cooldownMin()) * MIN;
    // Out of daily time: resting until tomorrow, not just for one cooldown.
    if (dailyExhausted) cooldownUntil = Math.max(cooldownUntil, nextLocalMidnight(now, tzOffsetMin));
    return new State(state.dayKey(), state.minutesUsedToday() + state.sessionElapsedMs() / MIN, 0, cooldownUntil, now, null);
  }

  /**
   * Time away from the game fills the tank back up, little by little: a rest as
   * long as the parents' cooldown gives back a whole session, half of it — half
   * a session, and so on. A child who played five minutes of fifteen and put the
   * phone down does not come back to the same ten: the five are on their way
   * back from the moment play stopped. What is given back moves to the day's
   * total, so the daily cap still counts every minute played. A gap no longer
   * than the heartbeat window is not a rest — it is the same play going on.
   *
   * `lastHeartbeatAt` is the last beat of a session that was never paused (app
   * killed, phone locked); `lastSessionEndedAt` the moment it was paused. This
   * is only ever stored by `startSession`, which opens a new heartbeat window at
   * once — the mark a later rest is measured from — so no rest is counted twice.
   */
  public static State refillIfRested(State state, Limits limits, long now) {
    Long lastPlay = state.lastHeartbeatAt() != null ? state.lastHeartbeatAt() : state.lastSessionEndedAt();
    if (!(state.sessionElapsedMs() > 0) || lastPlay == null) return state;
    long rested = now - lastPlay;
    if (rested <= HEARTBEAT_MAX_GAP_MS) return state;
    double cooldownMs = Math.max(0, limits.cooldownMin()) * (double) MIN;
    double sessionMs = Math.max(1, limits.sessionMin()) * (double) MIN;
    double back = cooldownMs > 0 ? Math.min(state.sessionElapsedMs(), (rested * sessionMs) / cooldownMs) : state.sessionElapsedMs();
    return new State(
        state.dayKey(),
        state.minutesUsedToday() + back / MIN,
        state.sessionElapsedMs() - back,
        state.cooldownUntil(),
        state.lastSessionEndedAt(),
        null);
  }

  private static Long secs(double ms) {
    return Double.isInfinite(ms) ? null : (long) Math.ceil(ms / 1000);
  }

  /** What the API reports back (snake_case, per the PRD contract). */
  public static Map<String, Object> describe(State state, Limits limits, long now) {
    Remaining r = remaining(state, limits);
    boolean inCooldown = state.cooldownUntil() != null && now < state.cooldownUntil();
    return Json.map(
        Fields.REMAINING_TIME_SECONDS, inCooldown ? Long.valueOf(0) : secs(r.remainingMs()),
        Fields.SESSION_REMAINING_SECONDS, secs(r.sessionRemainingMs()),
        Fields.DAILY_REMAINING_SECONDS, secs(r.dailyRemainingMs()),
        Fields.DEPLETED, !inCooldown && r.remainingMs() <= 0,
        Fields.IN_COOLDOWN, inCooldown,
        Fields.COOLDOWN_REMAINING_SECONDS, inCooldown ? (long) Math.ceil((state.cooldownUntil() - now) / 1000.0) : 0L,
        Fields.SERVER_TIME, now,
        Fields.SCREEN_TIME_REPORT, Json.map(
            Fields.DAY_KEY, state.dayKey(),
            Fields.MINUTES_USED_TODAY, Json.tidy(state.minutesUsedToday()),
            Fields.SESSION_ELAPSED_MS, Json.tidy(state.sessionElapsedMs()),
            Fields.LAST_SESSION_ENDED_AT, state.lastSessionEndedAt()));
  }

  /** A play segment begins: open the heartbeat window (unless resting). */
  public static State startSession(State state, Limits limits, long now, int tzOffsetMin) {
    State next = refillIfRested(normalise(state, now, tzOffsetMin), limits, now);
    if (next.cooldownUntil() != null) return next;
    // Arriving with an already-empty tank (e.g. daily cap reached elsewhere).
    if (remaining(next, limits).remainingMs() <= 0) return endSession(next, limits, now, tzOffsetMin);
    return next.withHeartbeat(now);
  }

  /**
   * A heartbeat: bank the time since the previous ping, then decide whether the
   * session is over. `end`: PAUSE (child left the game), DEPLETED (client
   * finished the bedtime hand-off) or null (still playing).
   */
  public static State heartbeat(State state, Limits limits, long now, int tzOffsetMin, SessionEnd end) {
    State next = normalise(state, now, tzOffsetMin);
    if (next.cooldownUntil() != null) return next.withHeartbeat(null);

    if (next.lastHeartbeatAt() != null) {
      long gap = now - next.lastHeartbeatAt();
      // A longer gap means the app was backgrounded/closed — that is not play.
      if (gap > 0 && gap <= HEARTBEAT_MAX_GAP_MS) next = next.withElapsed(next.sessionElapsedMs() + gap);
    }
    next = next.withHeartbeat(end == SessionEnd.PAUSE ? null : now);
    // Remember when play stopped: a long enough break refills the tank.
    if (end == SessionEnd.PAUSE && next.sessionElapsedMs() > 0) next = next.withEnded(now);

    Remaining r = remaining(next, limits);
    double overrun = Math.max(r.sessionOverrunMs(), r.dailyOverrunMs());
    boolean clientDone = end == SessionEnd.DEPLETED && r.remainingMs() <= DEPLETED_TOLERANCE_MS;
    // The client normally ends the session itself (after the current task and
    // the cutscene). If it never does, the server ends it after a short grace.
    if (clientDone || (r.remainingMs() <= 0 && overrun >= DEPLETION_GRACE_MS)) {
      return endSession(next, limits, now, tzOffsetMin);
    }
    return next;
  }

  /** Parent top-up: a full tank and no cooldown. */
  public static State resetSession(long now, int tzOffsetMin) {
    return new State(localDayKey(now, tzOffsetMin), 0, 0, null, null, null);
  }
}
