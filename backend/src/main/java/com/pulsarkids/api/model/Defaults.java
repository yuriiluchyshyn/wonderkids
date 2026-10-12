package com.pulsarkids.api.model;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * What a child's profile and settings are kept with when a save says nothing —
 * the same values the tables default to (`schema.sql`) and the game's
 * `migrateChild` fills in.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Defaults {
  public static final String COMPANION_SPEED = "medium";
  public static final String CELEBRATION = "balloons";
  public static final String GAME_MODE = "dynamic_task_extension";
  public static final int MIN_TASKS_PER_LEVEL = 10;
  public static final int CHOICES_GRID_SIZE = 9;
  public static final int SESSION_MINUTES = 15;
  public static final int COOLDOWN_MINUTES = 45;
  public static final int MAX_DAILY_MINUTES = 60;
  /** The most games a parent's list of put-away games is kept with. */
  public static final int MAX_HIDDEN_GAMES = 500;
}
