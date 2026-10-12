package com.pulsarkids.api.core;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * The service's settings. On Vercel they are the project's environment
 * variables; on a developer's machine the same names are also read from
 * `.env.local` — the backend's own, or the game's (`../game/.env.local`, where
 * they have always been kept). A variable set in the shell wins over the files.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Env {
  private static final Map<String, String> FILES = new ConcurrentHashMap<>();
  /** Set by tests in place of the real environment. */
  private static final Map<String, String> OVERRIDES = new ConcurrentHashMap<>();

  /** The Docker database from the workspace-root docker-compose.yml. */
  public static final String LOCAL_DATABASE_URL = "postgres://wonderkids:wonderkids@localhost:54329/wonderkids";
  public static final String DEV_SECRET = "dev-only-change-me";

  /** Read the developer's `.env.local` files. Never on Vercel: there the project's variables are the whole truth. */
  public static void loadLocalFiles() {
    if (onVercel()) return;
    String named = System.getenv(Vars.ENV_FILE);
    for (String file : named != null ? new String[] {named} : new String[] {".env.local", "../game/.env.local"}) {
      Path path = Path.of(file);
      if (!Files.isRegularFile(path)) continue;
      try {
        for (String line : Files.readAllLines(path, StandardCharsets.UTF_8)) {
          String text = line.strip();
          int eq = text.indexOf('=');
          if (text.isEmpty() || text.startsWith("#") || eq <= 0) continue;
          String key = text.substring(0, eq).strip();
          String value = text.substring(eq + 1).strip();
          if (value.length() >= 2 && (value.startsWith("\"") && value.endsWith("\"") || value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length() - 1);
          }
          // The first file that names a variable decides.
          FILES.putIfAbsent(key, value);
        }
      } catch (IOException err) {
        System.err.println("[env] " + file + " not read: " + err.getMessage());
      }
    }
  }

  public static boolean onVercel() {
    return System.getenv(Vars.VERCEL) != null;
  }

  /** The variable, or null when it is not set (an empty one counts as set, as in Node). */
  public static String get(String name) {
    String value = OVERRIDES.get(name);
    if (value == null) value = System.getenv(name);
    if (value == null) value = FILES.get(name);
    return value;
  }

  public static String get(String name, String fallback) {
    String value = get(name);
    return value == null ? fallback : value;
  }

  /** The secret that signs sessions and the small tickets of letters and visits. */
  public static String jwtSecret() {
    return get(Vars.JWT_SECRET, DEV_SECRET);
  }

  /** For tests: put a variable in place (null takes the override away). */
  public static void set(String name, String value) {
    if (value == null) OVERRIDES.remove(name);
    else OVERRIDES.put(name, value);
  }
}
