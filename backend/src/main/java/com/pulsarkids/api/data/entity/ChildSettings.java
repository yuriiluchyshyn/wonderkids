package com.pulsarkids.api.data.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.pulsarkids.api.model.Currency;
import com.pulsarkids.api.model.Defaults;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** A child's game and play-time settings, as the parents set them. */
@Getter
@Setter
@Entity
@Table(name = "wk_child_settings")
public class ChildSettings {
  @Id
  private String childId;

  private boolean soundOn = true;
  private boolean voiceOn = true;
  private boolean showText = true;
  private String companionSpeed = Defaults.COMPANION_SPEED;
  private String celebration = Defaults.CELEBRATION;
  private String gameMode = Defaults.GAME_MODE;
  private int minTasksPerLevel = Defaults.MIN_TASKS_PER_LEVEL;
  private int choicesGridSize = Defaults.CHOICES_GRID_SIZE;

  @JdbcTypeCode(SqlTypes.JSON)
  private JsonNode voice;

  private int sessionDurationMin = Defaults.SESSION_MINUTES;
  private int cooldownMin = Defaults.COOLDOWN_MINUTES;
  private int maxDailyMin = Defaults.MAX_DAILY_MINUTES;
  private boolean ttsButtons = true;
  private boolean funFacts = true;
  private String currency = Currency.DEFAULT.wire();
  /** The parent picked the money themselves; NULL — a save from before the flag. */
  private Boolean currencyChosen;
  /** NULL — not chosen: the app offers the language of the visitor's country. */
  private String gameLang;
  private String voiceLang;

  /** Games put away for this child: ["<moduleId>:<subId>", …]. */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "hidden_games")
  private JsonNode hiddenGames;
}
