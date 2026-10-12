package com.pulsarkids.api.core;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.pulsarkids.api.core.ScreenTime.Limits;
import com.pulsarkids.api.core.ScreenTime.State;
import com.pulsarkids.api.model.SessionEnd;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ScreenTimeTest {
  private static final long MIN = 60_000;
  private static final Limits LIMITS = new Limits(15, 45, 60);
  // 2026-10-06 10:00 UTC, child in Kyiv (UTC+3 → getTimezoneOffset() = -180).
  private static final long T0 = utc(2026, 10, 6, 10, 0);
  private static final int TZ = -180;

  private static long utc(int year, int month, int day, int hour, int minute) {
    return LocalDateTime.of(year, month, day, hour, minute).toInstant(ZoneOffset.UTC).toEpochMilli();
  }

  private static State fresh() {
    return ScreenTime.resetSession(T0, TZ);
  }

  /** Play continuously for `ms`, pinging every 30 s. */
  private static State play(State state, long from, long ms, Limits limits) {
    State s = state;
    for (long t = from + 30_000; t <= from + ms; t += 30_000) s = ScreenTime.heartbeat(s, limits, t, TZ, null);
    return s;
  }

  private static State play(State state, long from, long ms) {
    return play(state, from, ms, LIMITS);
  }

  private static Object left(State state, Limits limits, long now, String field) {
    Map<String, Object> view = ScreenTime.describe(state, limits, now);
    return view.get(field);
  }

  @Test
  void dayKeyAndMidnightFollowTheChildsLocalTime() {
    assertEquals("2026-10-07", ScreenTime.localDayKey(utc(2026, 10, 6, 22, 30), TZ));
    assertEquals(utc(2026, 10, 6, 21, 0), ScreenTime.nextLocalMidnight(T0, TZ));
  }

  @Test
  void heartbeatsBankPlayTimeAndReportWhatIsLeft() {
    State s = play(ScreenTime.startSession(fresh(), LIMITS, T0, TZ), T0, 5 * MIN);
    assertEquals(5 * MIN, s.sessionElapsedMs());
    assertEquals(600L, left(s, LIMITS, T0 + 5 * MIN, "remaining_time_seconds"));
  }

  @Test
  void aLongGapBetweenPingsIsAPauseNotPlayTime() {
    State s = ScreenTime.startSession(fresh(), LIMITS, T0, TZ);
    s = ScreenTime.heartbeat(s, LIMITS, T0 + 30_000, TZ, null);
    s = ScreenTime.heartbeat(s, LIMITS, T0 + 20 * MIN, TZ, null); // app was closed for ~20 min
    assertEquals(30_000, s.sessionElapsedMs());
  }

  @Test
  void pausingStopsTheClockUntilTheNextStart() {
    State s = ScreenTime.startSession(fresh(), LIMITS, T0, TZ);
    s = ScreenTime.heartbeat(s, LIMITS, T0 + 20_000, TZ, SessionEnd.PAUSE);
    assertNull(s.lastHeartbeatAt());
    s = ScreenTime.heartbeat(s, LIMITS, T0 + 40_000, TZ, null); // stray ping while paused
    assertEquals(20_000, s.sessionElapsedMs());
  }

  @Test
  void restartingNeverRefillsTheTank() {
    State s = play(ScreenTime.startSession(fresh(), LIMITS, T0, TZ), T0, 14 * MIN);
    s = ScreenTime.startSession(s, LIMITS, T0 + 14 * MIN + 5_000, TZ);
    assertEquals(60L, left(s, LIMITS, T0 + 14 * MIN + 5_000, "remaining_time_seconds"));
  }

  @Test
  void theClientEndsADepletedSession() {
    State s = play(ScreenTime.startSession(fresh(), LIMITS, T0, TZ), T0, 15 * MIN);
    assertEquals(true, left(s, LIMITS, T0 + 15 * MIN, "depleted"));
    assertEquals(false, left(s, LIMITS, T0 + 15 * MIN, "in_cooldown"), "the current task may still be finished");

    long end = T0 + 15 * MIN + 10_000;
    s = ScreenTime.heartbeat(s, LIMITS, end, TZ, SessionEnd.DEPLETED);
    assertEquals(end + 45 * MIN, s.cooldownUntil());
    assertEquals(0, s.sessionElapsedMs());
    assertTrue(Math.abs(s.minutesUsedToday() - (15 + 10 / 60.0)) < 1e-9);
    assertEquals(45L * 60, left(s, LIMITS, end, "cooldown_remaining_seconds"));
  }

  @Test
  void aClientThatNeverEndsTheSessionIsCutOffAfterTheGracePeriod() {
    State s = play(ScreenTime.startSession(fresh(), LIMITS, T0, TZ), T0, 15 * MIN + ScreenTime.DEPLETION_GRACE_MS);
    assertNotNull(s.cooldownUntil());
  }

  @Test
  void aFalseDepletedFromTheClientIsIgnored() {
    State s = ScreenTime.startSession(fresh(), LIMITS, T0, TZ);
    s = ScreenTime.heartbeat(s, LIMITS, T0 + 30_000, TZ, SessionEnd.DEPLETED);
    assertNull(s.cooldownUntil());
  }

  @Test
  void noPlayTimeIsCountedDuringACooldownAndItClearsWhenItExpires() {
    State s = play(ScreenTime.startSession(fresh(), LIMITS, T0, TZ), T0, 15 * MIN);
    long end = T0 + 15 * MIN;
    s = ScreenTime.heartbeat(s, LIMITS, end, TZ, SessionEnd.DEPLETED);
    s = ScreenTime.startSession(s, LIMITS, end + 10 * MIN, TZ);
    assertNull(s.lastHeartbeatAt());
    assertEquals(0L, left(s, LIMITS, end + 10 * MIN, "remaining_time_seconds"));

    s = ScreenTime.startSession(s, LIMITS, end + 46 * MIN, TZ);
    assertNull(s.cooldownUntil());
    assertEquals(900L, left(s, LIMITS, end + 46 * MIN, "remaining_time_seconds"));
  }

  @Test
  void theDailyCapShortensTheLastSessionAndRestsUntilTomorrow() {
    Limits l = new Limits(15, 5, 20);
    State s = play(ScreenTime.startSession(fresh(), l, T0, TZ), T0, 15 * MIN, l);
    long t = T0 + 15 * MIN;
    s = ScreenTime.heartbeat(s, l, t, TZ, SessionEnd.DEPLETED);
    t += 6 * MIN;
    s = ScreenTime.startSession(s, l, t, TZ);
    assertEquals(300L, left(s, l, t, "remaining_time_seconds"), "only 5 daily minutes left");
    s = play(s, t, 5 * MIN, l);
    t += 5 * MIN;
    s = ScreenTime.heartbeat(s, l, t, TZ, SessionEnd.DEPLETED);
    assertEquals(ScreenTime.nextLocalMidnight(t, TZ), s.cooldownUntil());
  }

  @Test
  void aNewLocalDayStartsWithAFullTank() {
    State s = play(ScreenTime.startSession(fresh(), LIMITS, T0, TZ), T0, 15 * MIN);
    s = ScreenTime.heartbeat(s, LIMITS, T0 + 15 * MIN, TZ, SessionEnd.DEPLETED);
    long tomorrow = T0 + 24 * 60 * MIN;
    s = ScreenTime.startSession(s, LIMITS, tomorrow, TZ);
    assertEquals(0, s.minutesUsedToday());
    assertEquals(900L, left(s, LIMITS, tomorrow, "remaining_time_seconds"));
  }

  @Test
  void zeroMaxDailyMinutesMeansNoDailyCap() {
    Limits l = new Limits(15, 45, 0);
    State s = ScreenTime.startSession(fresh().withUsed(500), l, T0, TZ);
    assertEquals(900L, left(s, l, T0, "remaining_time_seconds"));
    assertNull(left(s, l, T0, "daily_remaining_seconds"));
  }

  @Test
  void timeAwayGivesTheTankBackLittleByLittle() {
    State s = play(ScreenTime.startSession(fresh(), LIMITS, T0, TZ), T0, 6 * MIN);
    s = ScreenTime.heartbeat(s, LIMITS, T0 + 6 * MIN, TZ, SessionEnd.PAUSE);

    // Back within a minute: that was no rest, the same nine minutes are left.
    State back = ScreenTime.startSession(s, LIMITS, T0 + 7 * MIN, TZ);
    assertEquals(9L * 60, left(back, LIMITS, T0 + 7 * MIN, "remaining_time_seconds"));

    // Back after nine minutes — a fifth of the 45-minute rest gives back a fifth of a session: three minutes.
    long soon = T0 + 6 * MIN + 9 * MIN;
    back = ScreenTime.startSession(s, LIMITS, soon, TZ);
    assertEquals(12L * 60, left(back, LIMITS, soon, "remaining_time_seconds"));
    assertEquals(54L * 60, left(back, LIMITS, soon, "daily_remaining_seconds"), "the day has still lost all six minutes");

    // …and the same rest is not counted again: the next one is measured from this visit.
    State again = ScreenTime.startSession(ScreenTime.heartbeat(back, LIMITS, soon + 30_000, TZ, SessionEnd.PAUSE), LIMITS, soon + 60_000, TZ);
    assertEquals(12L * 60 - 30, left(again, LIMITS, soon + 60_000, "remaining_time_seconds"));

    // Never more than was played: eighteen minutes away give back all six, not seven.
    back = ScreenTime.startSession(s, LIMITS, T0 + 6 * MIN + 21 * MIN, TZ);
    assertEquals(0, back.sessionElapsedMs());

    s = play(ScreenTime.startSession(fresh(), LIMITS, T0, TZ), T0, 2 * MIN);
    s = ScreenTime.heartbeat(s, LIMITS, T0 + 2 * MIN, TZ, SessionEnd.PAUSE);

    // Back after the 45-minute rest: a full session, two minutes gone from the day.
    long later = T0 + 2 * MIN + 45 * MIN;
    back = ScreenTime.startSession(s, LIMITS, later, TZ);
    assertEquals(0, back.sessionElapsedMs());
    assertEquals(2, back.minutesUsedToday());
    assertEquals(900L, left(back, LIMITS, later, "remaining_time_seconds"));
    assertEquals(58L * 60, left(back, LIMITS, later, "daily_remaining_seconds"));
  }

  @Test
  void anAppThatWasKilledWithoutAPauseAlsoRests() {
    State s = play(ScreenTime.startSession(fresh(), LIMITS, T0, TZ), T0, 3 * MIN);
    assertEquals(3 * MIN, ScreenTime.refillIfRested(s, LIMITS, T0 + 4 * MIN).sessionElapsedMs(), "a minute is within the heartbeat window");
    assertEquals(2 * MIN, ScreenTime.refillIfRested(s, LIMITS, T0 + 6 * MIN).sessionElapsedMs(), "three minutes away give back one");
    assertEquals(0, ScreenTime.refillIfRested(s, LIMITS, T0 + 60 * MIN).sessionElapsedMs());
    assertFalse(ScreenTime.clampTzOffset(Double.NaN) != 0);
  }
}
