package com.pulsarkids.api.service;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import javax.sql.DataSource;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * The normalised `wk_` schema — `src/main/resources/schema.sql`, written so it
 * can be run again and again (`IF NOT EXISTS`). It is applied once per running
 * instance, on the first request that needs the database; Hibernate only maps
 * the tables (`data/entity`). There are no migrations: a new column is an
 * `ALTER TABLE … ADD COLUMN IF NOT EXISTS` in that file plus a field of its entity.
 *
 *   wk_parents          parent accounts (email identity) + active child
 *   wk_children         one row per child profile (+ credentials, theme)
 *   wk_child_settings   per-child game + screen-time settings
 *   wk_child_stats      artifacts / tasks / hints counters
 *   wk_child_progress   path step per (module, sub)
 *   wk_child_treasures  collected treasure keys
 *   wk_milestones       family goals
 *   wk_screen_time      play-time bookkeeping — server-owned, see ScreenTime
 *   wk_tts_keys         Google Speech keys (+ wk_tts_cache — phrases already spoken)
 *   wk_feedback         letters from the public site (+ _replies, and _parts —
 *                       attached files on their way to the mailbox)
 *   wk_links            the owner's own links, handed out to tell visits apart
 *   wk_visits           arrivals by those links and into the trial game
 *   wk_settings         settings of the whole product (the trial game's length)
 */
@Service
@RequiredArgsConstructor
public class SchemaService {
  private static final String SCHEMA = "/schema.sql";

  private final DataSource dataSource;
  private boolean ready;

  public synchronized void ensure() {
    if (ready) return;
    String ddl;
    try (InputStream in = SchemaService.class.getResourceAsStream(SCHEMA)) {
      ddl = new String(in.readAllBytes(), StandardCharsets.UTF_8);
    } catch (Exception err) {
      throw new IllegalStateException("schema.sql not read", err);
    }
    try (Connection conn = dataSource.getConnection(); Statement statement = conn.createStatement()) {
      statement.execute(ddl);
    } catch (SQLException err) {
      // A failure is not remembered: the next request tries again (the database may be back).
      throw new IllegalStateException("schema not applied: " + err.getMessage(), err);
    }
    ready = true;
  }
}
