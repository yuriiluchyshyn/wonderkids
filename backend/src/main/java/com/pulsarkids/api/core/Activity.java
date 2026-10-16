package com.pulsarkids.api.core;

import java.time.Instant;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Who is here now, for the admin page. Two signs, both kept by the server:
 * a child is PLAYING while the game's heartbeats come (`ScreenTime`, every
 * 30 s during a level); an account is ONLINE while its game or cabinet has
 * loaded or saved its state lately (`wk_parents.last_seen_at`) — the hub, the
 * world, the cabinet, not only a level.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Activity {
  /** An account seen this recently is online. A child's every change is saved within a second, so a page in use is seen often. */
  public static final long ONLINE_MS = 5 * 60_000;
  /** How often the mark of being seen is written at most. */
  public static final long SEEN_EVERY_MS = 60_000;

  /** Playing now: a heartbeat within the window the server still counts as the same play. */
  public static boolean isPlaying(Long lastHeartbeatAt, long now) {
    return lastHeartbeatAt != null && now - lastHeartbeatAt <= ScreenTime.HEARTBEAT_MAX_GAP_MS;
  }

  /** When the child last played: the last heartbeat or the end of the last session, whichever is later; null — never. */
  public static Long lastPlayedAt(Long lastHeartbeatAt, Long lastSessionEndedAt) {
    if (lastHeartbeatAt == null) return lastSessionEndedAt;
    if (lastSessionEndedAt == null) return lastHeartbeatAt;
    return Math.max(lastHeartbeatAt, lastSessionEndedAt);
  }

  /** Online: seen within `ONLINE_MS`. */
  public static boolean isOnline(Instant lastSeenAt, long now) {
    return lastSeenAt != null && now - lastSeenAt.toEpochMilli() <= ONLINE_MS;
  }
}
