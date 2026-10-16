package com.pulsarkids.api.service;

import com.pulsarkids.api.core.ScreenTime;
import com.pulsarkids.api.data.entity.ChildSettings;
import com.pulsarkids.api.data.entity.ScreenTimeRow;
import com.pulsarkids.api.data.repo.ChildRepository;
import com.pulsarkids.api.data.repo.ChildSettingsRepository;
import com.pulsarkids.api.data.repo.ScreenTimeRepository;
import java.util.function.BiFunction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** The server's side of a child's play time: one transition of `ScreenTime` applied to the child's row. */
@Service
@RequiredArgsConstructor
public class ScreenTimeService {
  private final ChildRepository children;
  private final ChildSettingsRepository settingsRepo;
  private final ScreenTimeRepository screenRepo;
  private final SubscriptionService subscriptions;

  /** `blocked` — the children are paused (more of them than the plan has room for): nothing was counted. */
  public record Tracked(ScreenTime.State state, ScreenTime.Limits limits, boolean blocked) {}

  /**
   * Apply a screen-time transition for one child inside a row-locked
   * transaction. `transition(state, limits)` is one of the pure functions of
   * `ScreenTime` and returns the next state. Answers null when the child does
   * not belong to this account.
   */
  @Transactional
  public Tracked track(int userId, String childId, BiFunction<ScreenTime.State, ScreenTime.Limits, ScreenTime.State> transition) {
    if (!children.existsByIdAndParentId(childId, userId)) return null;
    ChildSettings s = settingsRepo.findById(childId).orElseGet(ChildSettings::new);
    // The parents' own limits — or, where their plan does not let them set any, the plan's.
    SubscriptionService.Allowance allowance = subscriptions.allowanceOf(userId);
    ScreenTime.Limits limits = allowance.limits(new ScreenTime.Limits(s.getSessionDurationMin(), s.getCooldownMin(), s.getMaxDailyMin()));

    screenRepo.insertIfAbsent(childId);
    ScreenTimeRow row = screenRepo.lock(childId).orElseThrow();
    ScreenTime.State before = new ScreenTime.State(
        row.getDayKey() == null ? "" : row.getDayKey(),
        row.getMinutesUsedToday(),
        row.getSessionElapsedMs(),
        row.getCooldownUntil(),
        row.getLastSessionEndedAt(),
        row.getLastHeartbeatAt());
    // More children than the plan has room for: they are paused, and no time is counted while they are.
    if (subscriptions.overLimit(userId)) return new Tracked(before, limits, true);
    ScreenTime.State state = transition.apply(before, limits);

    row.setDayKey(state.dayKey());
    row.setMinutesUsedToday(state.minutesUsedToday());
    row.setSessionElapsedMs(Math.round(state.sessionElapsedMs()));
    row.setCooldownUntil(state.cooldownUntil());
    row.setLastSessionEndedAt(state.lastSessionEndedAt());
    row.setLastHeartbeatAt(state.lastHeartbeatAt());
    row.setSessionStartedAt(null);
    return new Tracked(state, limits, false);
  }
}
