package com.pulsarkids.api.data.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** A child's play-time bookkeeping — owned by the server (see `ScreenTime`), never written by a save. */
@Getter
@Setter
@Entity
@Table(name = "wk_screen_time")
public class ScreenTimeRow {
  @Id
  private String childId;

  private String dayKey;
  private double minutesUsedToday;
  private Long sessionStartedAt;
  private Long cooldownUntil;
  private Long lastSessionEndedAt;
  private long sessionElapsedMs;
  private Long lastHeartbeatAt;
}
