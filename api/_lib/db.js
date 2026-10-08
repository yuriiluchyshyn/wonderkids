// Shared database layer for the Vercel serverless API functions.
// Files/folders prefixed with "_" are ignored by Vercel's routing.
// In local dev the same files are served by the Vite plugin in dev-api.ts.
import pg from 'pg';
import { emailKey, normaliseEmail } from './email.js';
import { refillIfRested } from './screenTime.js';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

const wantsSsl =
  /sslmode=require|neon\.tech|\.rds\.amazonaws\.com/i.test(connectionString ?? '') ||
  process.env.PGSSL === 'true';

let pool;

/** Lazily create a single pooled client, reused across warm invocations. */
export function getPool() {
  if (!pool) {
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }
    pool = new Pool({
      connectionString,
      ssl: wantsSsl ? { rejectUnauthorized: process.env.PGSSL_INSECURE !== 'true' } : undefined,
      max: 3,
    });
  }
  return pool;
}

let schemaReady;

/**
 * Ensure the normalised `wk_` schema exists (idempotent, cached per cold
 * start). Legacy single-blob tables (`users`, `game_states`) are dropped — no
 * migration (POC reset is fine).
 *
 *   wk_parents          parent accounts (email identity) + active child
 *   wk_children         one row per child profile (+ credentials, theme)
 *   wk_child_settings   per-child game + screen-time settings
 *   wk_child_stats      artifacts / tasks / hints counters
 *   wk_child_progress   path step per (module, sub)
 *   wk_child_treasures  collected treasure keys
 *   wk_milestones       family goals
 *   wk_screen_time      play-time bookkeeping — server-owned, see screenTime.js
 */
export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = getPool().query(`
      DROP TABLE IF EXISTS game_states;
      DROP TABLE IF EXISTS users;

      CREATE TABLE IF NOT EXISTS wk_parents (
        id              SERIAL PRIMARY KEY,
        email           TEXT UNIQUE NOT NULL,
        active_child_id TEXT,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS wk_children (
        id          TEXT PRIMARY KEY,
        parent_id   INTEGER NOT NULL REFERENCES wk_parents(id) ON DELETE CASCADE,
        sort_index  INTEGER NOT NULL DEFAULT 0,
        name        TEXT NOT NULL DEFAULT 'Друже',
        nickname    TEXT UNIQUE,
        email       TEXT,
        pin         TEXT NOT NULL DEFAULT '',
        password    TEXT NOT NULL DEFAULT '',
        gender      TEXT NOT NULL DEFAULT 'girl',
        birth_year  INTEGER,
        birth_month INTEGER,
        theme_id    TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS wk_children_parent_idx ON wk_children(parent_id);
      -- theme_id is NULL until the child picks a world (neutral galaxy default).
      ALTER TABLE wk_children ALTER COLUMN theme_id DROP NOT NULL;
      ALTER TABLE wk_children ALTER COLUMN theme_id DROP DEFAULT;

      CREATE TABLE IF NOT EXISTS wk_child_settings (
        child_id             TEXT PRIMARY KEY REFERENCES wk_children(id) ON DELETE CASCADE,
        sound_on             BOOLEAN NOT NULL DEFAULT true,
        voice_on             BOOLEAN NOT NULL DEFAULT true,
        show_text            BOOLEAN NOT NULL DEFAULT true,
        companion_speed      TEXT NOT NULL DEFAULT 'medium',
        celebration          TEXT NOT NULL DEFAULT 'balloons',
        game_mode            TEXT NOT NULL DEFAULT 'dynamic_task_extension',
        min_tasks_per_level  INTEGER NOT NULL DEFAULT 10,
        choices_grid_size    INTEGER NOT NULL DEFAULT 9,
        voice                JSONB NOT NULL DEFAULT '{}'::jsonb,
        session_duration_min INTEGER NOT NULL DEFAULT 15,
        cooldown_min         INTEGER NOT NULL DEFAULT 45,
        max_daily_min        INTEGER NOT NULL DEFAULT 60
      );

      CREATE TABLE IF NOT EXISTS wk_child_stats (
        child_id        TEXT PRIMARY KEY REFERENCES wk_children(id) ON DELETE CASCADE,
        artifacts       INTEGER NOT NULL DEFAULT 0,
        tasks_completed INTEGER NOT NULL DEFAULT 0,
        hints_surfaced  INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS wk_child_progress (
        child_id  TEXT NOT NULL REFERENCES wk_children(id) ON DELETE CASCADE,
        module_id TEXT NOT NULL,
        sub_id    TEXT NOT NULL,
        step      INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (child_id, module_id, sub_id)
      );

      CREATE TABLE IF NOT EXISTS wk_child_treasures (
        child_id     TEXT NOT NULL REFERENCES wk_children(id) ON DELETE CASCADE,
        treasure_key TEXT NOT NULL,
        PRIMARY KEY (child_id, treasure_key)
      );

      CREATE TABLE IF NOT EXISTS wk_milestones (
        child_id     TEXT NOT NULL REFERENCES wk_children(id) ON DELETE CASCADE,
        milestone_id TEXT NOT NULL,
        amount       INTEGER NOT NULL DEFAULT 1,
        reward       TEXT NOT NULL DEFAULT '',
        sort_index   INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (child_id, milestone_id)
      );

      CREATE TABLE IF NOT EXISTS wk_screen_time (
        child_id              TEXT PRIMARY KEY REFERENCES wk_children(id) ON DELETE CASCADE,
        day_key               TEXT,
        minutes_used_today    DOUBLE PRECISION NOT NULL DEFAULT 0,
        session_started_at    BIGINT,
        cooldown_until        BIGINT,
        last_session_ended_at BIGINT
      );
      -- Server-authoritative play time (PRD v4.0 §2.2).
      ALTER TABLE wk_screen_time ADD COLUMN IF NOT EXISTS session_elapsed_ms BIGINT NOT NULL DEFAULT 0;
      ALTER TABLE wk_screen_time ADD COLUMN IF NOT EXISTS last_heartbeat_at BIGINT;
      -- One account per MAILBOX: email_key is the canonical form of the address
      -- (see emailKey in email.js — Gmail dots / +tags / googlemail collapse).
      -- Backfill is collision-proof: if two old rows share a mailbox, only the
      -- oldest gets the key (the other keeps NULL and shows up in the admin as
      -- a duplicate to remove) so the unique index can always be built.
      ALTER TABLE wk_parents ADD COLUMN IF NOT EXISTS email_key TEXT;
      WITH keyed AS (
        SELECT id,
               CASE WHEN split_part(lower(trim(email)), '@', 2) IN ('gmail.com', 'googlemail.com')
                    THEN replace(split_part(split_part(lower(trim(email)), '@', 1), '+', 1), '.', '') || '@gmail.com'
                    ELSE lower(trim(email)) END AS key
          FROM wk_parents WHERE email_key IS NULL
      ), ranked AS (
        SELECT id, key, row_number() OVER (PARTITION BY key ORDER BY id) AS rn FROM keyed
      )
      UPDATE wk_parents p SET email_key = r.key
        FROM ranked r
       WHERE p.id = r.id AND r.rn = 1
         AND NOT EXISTS (SELECT 1 FROM wk_parents o WHERE o.email_key = r.key);
      CREATE UNIQUE INDEX IF NOT EXISTS wk_parents_email_key_idx ON wk_parents (email_key);

      -- Natural voice via Google Cloud TTS. The admin keeps a set of API keys;
      -- each is either GLOBAL (serves every account) or assigned to chosen
      -- accounts. An account's own key wins over the global one, and any
      -- account can be switched off individually.
      CREATE TABLE IF NOT EXISTS wk_tts_keys (
        id            SERIAL PRIMARY KEY,
        label         TEXT NOT NULL DEFAULT '',
        encrypted_key TEXT NOT NULL,
        voice         TEXT,
        is_global     BOOLEAN NOT NULL DEFAULT false,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      ALTER TABLE wk_parents ADD COLUMN IF NOT EXISTS tts_key_id INTEGER REFERENCES wk_tts_keys(id) ON DELETE SET NULL;
      ALTER TABLE wk_parents ADD COLUMN IF NOT EXISTS tts_off BOOLEAN NOT NULL DEFAULT false;
      CREATE TABLE IF NOT EXISTS wk_tts_cache (
        hash       TEXT PRIMARY KEY,
        voice      TEXT NOT NULL,
        audio      TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      -- Tap-to-hear speaker buttons next to text (PRD v4.0 §2.4).
      ALTER TABLE wk_child_settings ADD COLUMN IF NOT EXISTS tts_buttons BOOLEAN NOT NULL DEFAULT true;
      -- The short fact told after a right answer, and the money the shop game counts in.
      ALTER TABLE wk_child_settings ADD COLUMN IF NOT EXISTS fun_facts BOOLEAN NOT NULL DEFAULT true;
      ALTER TABLE wk_child_settings ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'UAH';
    `).catch((err) => {
      // Don't cache a failure: let the next request retry (DB may be back).
      schemaReady = undefined;
      throw err;
    });
  }
  return schemaReady;
}

/** The account that owns this mailbox, however the address was typed. */
export async function findParentByEmail(email) {
  const { rows } = await getPool().query(
    `SELECT id, email, created_at FROM wk_parents
      WHERE email_key = $1 OR email = $2
      ORDER BY (email_key = $1) DESC, id
      LIMIT 1`,
    [emailKey(email), normaliseEmail(email)],
  );
  return rows[0] ?? null;
}

/**
 * Create the account for a mailbox. Safe against a double submit: if another
 * request created it a moment ago, that account is returned instead.
 */
export async function createParent(email) {
  const { rows } = await getPool().query(
    `INSERT INTO wk_parents (email, email_key) VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING id, email, created_at`,
    [normaliseEmail(email), emailKey(email)],
  );
  return rows[0] ?? findParentByEmail(email);
}

/** Admin: remove an account with all its children and their data. */
export async function deleteParent(parentId) {
  const { rowCount } = await getPool().query(`DELETE FROM wk_parents WHERE id = $1`, [parentId]);
  return rowCount > 0;
}

const numOrNull = (v) => (v === null || v === undefined ? null : Number(v));

/** The money a child's shop game may count in (`core/game/content/currency.ts`). */
const CURRENCIES = ['UAH', 'EUR', 'USD', 'GBP', 'PLN'];

function assembleChild(row, settings, stats, screen, progressRows, treasureRows, milestoneRows) {
  const s = settings ?? {};
  const st = stats ?? {};
  const sc = screen ?? {};
  const progress = {};
  for (const p of progressRows) progress[`${p.module_id}:${p.sub_id}`] = p.step;
  // What the gauge shows before a game opens: the time away has already given
  // some of the tank back (the row itself is updated by the next /session/start).
  const rested = refillIfRested(
    {
      minutesUsedToday: Number(sc.minutes_used_today ?? 0),
      sessionElapsedMs: Number(sc.session_elapsed_ms ?? 0),
      lastSessionEndedAt: numOrNull(sc.last_session_ended_at),
      lastHeartbeatAt: numOrNull(sc.last_heartbeat_at),
    },
    { sessionMin: s.session_duration_min ?? 15, cooldownMin: s.cooldown_min ?? 45 },
    Date.now(),
  );

  return {
    id: row.id,
    profile: {
      name: row.name,
      nickname: row.nickname ?? '',
      pin: row.pin ?? '',
      email: row.email ?? '',
      password: row.password ?? '',
      birthYear: row.birth_year ?? undefined,
      birthMonth: row.birth_month ?? undefined,
      gender: row.gender,
    },
    themeId: row.theme_id ?? null,
    artifacts: st.artifacts ?? 0,
    tasksCompleted: st.tasks_completed ?? 0,
    hintsSurfaced: st.hints_surfaced ?? 0,
    progress,
    treasures: treasureRows.map((t) => t.treasure_key),
    milestones: milestoneRows.map((m) => ({ id: m.milestone_id, amount: m.amount, reward: m.reward })),
    settings: {
      soundOn: s.sound_on ?? true,
      voiceOn: s.voice_on ?? true,
      showText: s.show_text ?? true,
      companionSpeed: s.companion_speed ?? 'medium',
      celebration: s.celebration ?? 'balloons',
      gameMode: s.game_mode ?? 'dynamic_task_extension',
      minTasksPerLevel: s.min_tasks_per_level ?? 10,
      choicesGridSize: s.choices_grid_size ?? 9,
      ttsButtons: s.tts_buttons ?? true,
      funFacts: s.fun_facts ?? true,
      currency: s.currency ?? 'UAH',
      voice: s.voice ?? {},
      timeControl: {
        sessionDurationMinutes: s.session_duration_min ?? 15,
        cooldownMinutes: s.cooldown_min ?? 45,
        maxDailyMinutes: s.max_daily_min ?? 60,
      },
    },
    screenTime: {
      dayKey: sc.day_key ?? '',
      minutesUsedToday: rested.minutesUsedToday,
      sessionElapsedMs: rested.sessionElapsedMs,
      // Never running on load: the client opens a segment via /session/start.
      sessionStartedAt: null,
      cooldownUntil: numOrNull(sc.cooldown_until),
      lastSessionEndedAt: numOrNull(sc.last_session_ended_at),
    },
  };
}

/** Load a parent's whole save, reassembled into the client blob (or null). */
export async function getState(userId) {
  const db = getPool();
  const parent = await db.query(`SELECT id, active_child_id FROM wk_parents WHERE id = $1`, [userId]);
  if (parent.rowCount === 0) return null;
  const activeChildId = parent.rows[0].active_child_id ?? null;

  const children = (
    await db.query(`SELECT * FROM wk_children WHERE parent_id = $1 ORDER BY sort_index, created_at`, [userId])
  ).rows;
  if (children.length === 0) return { children: [], activeChildId };

  const ids = children.map((c) => c.id);
  const byChild = (rows) => {
    const map = new Map();
    for (const r of rows) {
      if (!map.has(r.child_id)) map.set(r.child_id, []);
      map.get(r.child_id).push(r);
    }
    return map;
  };
  const first = (rows) => {
    const map = new Map();
    for (const r of rows) map.set(r.child_id, r);
    return map;
  };

  const settings = first((await db.query(`SELECT * FROM wk_child_settings WHERE child_id = ANY($1::text[])`, [ids])).rows);
  const stats = first((await db.query(`SELECT * FROM wk_child_stats WHERE child_id = ANY($1::text[])`, [ids])).rows);
  const screen = first((await db.query(`SELECT * FROM wk_screen_time WHERE child_id = ANY($1::text[])`, [ids])).rows);
  const progress = byChild((await db.query(`SELECT * FROM wk_child_progress WHERE child_id = ANY($1::text[])`, [ids])).rows);
  const treasures = byChild((await db.query(`SELECT * FROM wk_child_treasures WHERE child_id = ANY($1::text[])`, [ids])).rows);
  const milestones = byChild(
    (await db.query(`SELECT * FROM wk_milestones WHERE child_id = ANY($1::text[]) ORDER BY sort_index`, [ids])).rows,
  );

  const assembled = children.map((row) =>
    assembleChild(
      row,
      settings.get(row.id),
      stats.get(row.id),
      screen.get(row.id),
      progress.get(row.id) ?? [],
      treasures.get(row.id) ?? [],
      milestones.get(row.id) ?? [],
    ),
  );

  return { children: assembled, activeChildId };
}

/** Replace a parent's whole save by decomposing the client blob into tables. */
export async function saveState(userId, state) {
  const children = Array.isArray(state?.children) ? state.children : [];
  const activeChildId = typeof state?.activeChildId === 'string' ? state.activeChildId : null;
  const childIds = children.map((c) => String(c?.id)).filter(Boolean);

  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    await client.query(`UPDATE wk_parents SET active_child_id = $2 WHERE id = $1`, [userId, activeChildId]);

    await client.query(
      `DELETE FROM wk_children WHERE parent_id = $1 AND NOT (id = ANY($2::text[]))`,
      [userId, childIds],
    );

    for (let i = 0; i < children.length; i += 1) {
      const c = children[i] ?? {};
      const id = String(c.id ?? '').trim();
      if (!id) continue;
      const p = c.profile ?? {};
      const s = c.settings ?? {};
      const tc = s.timeControl ?? {};
      const nickname = p.nickname ? String(p.nickname).trim().toLowerCase() : null;
      const email = p.email ? String(p.email).trim().toLowerCase() : null;

      await client.query(
        `INSERT INTO wk_children
           (id, parent_id, sort_index, name, nickname, email, pin, password, gender, birth_year, birth_month, theme_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (id) DO UPDATE SET
           parent_id=EXCLUDED.parent_id, sort_index=EXCLUDED.sort_index, name=EXCLUDED.name,
           nickname=EXCLUDED.nickname, email=EXCLUDED.email, pin=EXCLUDED.pin, password=EXCLUDED.password,
           gender=EXCLUDED.gender, birth_year=EXCLUDED.birth_year, birth_month=EXCLUDED.birth_month,
           theme_id=EXCLUDED.theme_id`,
        [
          id, userId, i, p.name ?? 'Друже', nickname, email, p.pin ?? '', p.password ?? '',
          p.gender ?? 'girl', p.birthYear ?? null, p.birthMonth ?? null, c.themeId ?? null,
        ],
      );

      await client.query(
        `INSERT INTO wk_child_settings
           (child_id, sound_on, voice_on, show_text, companion_speed, celebration, game_mode,
            min_tasks_per_level, choices_grid_size, voice, session_duration_min, cooldown_min, max_daily_min,
            tts_buttons, fun_facts, currency)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         ON CONFLICT (child_id) DO UPDATE SET
           sound_on=EXCLUDED.sound_on, voice_on=EXCLUDED.voice_on, show_text=EXCLUDED.show_text,
           companion_speed=EXCLUDED.companion_speed, celebration=EXCLUDED.celebration, game_mode=EXCLUDED.game_mode,
           min_tasks_per_level=EXCLUDED.min_tasks_per_level, choices_grid_size=EXCLUDED.choices_grid_size,
           voice=EXCLUDED.voice, session_duration_min=EXCLUDED.session_duration_min,
           cooldown_min=EXCLUDED.cooldown_min, max_daily_min=EXCLUDED.max_daily_min,
           tts_buttons=EXCLUDED.tts_buttons, fun_facts=EXCLUDED.fun_facts, currency=EXCLUDED.currency`,
        [
          id, s.soundOn ?? true, s.voiceOn ?? true, s.showText ?? true, s.companionSpeed ?? 'medium',
          s.celebration ?? 'balloons', s.gameMode ?? 'dynamic_task_extension', s.minTasksPerLevel ?? 10,
          s.choicesGridSize ?? 9, JSON.stringify(s.voice ?? {}), tc.sessionDurationMinutes ?? 15,
          tc.cooldownMinutes ?? 45, tc.maxDailyMinutes ?? 60, s.ttsButtons ?? true,
          s.funFacts ?? true, CURRENCIES.includes(s.currency) ? s.currency : 'UAH',
        ],
      );

      await client.query(
        `INSERT INTO wk_child_stats (child_id, artifacts, tasks_completed, hints_surfaced)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (child_id) DO UPDATE SET
           artifacts=EXCLUDED.artifacts, tasks_completed=EXCLUDED.tasks_completed, hints_surfaced=EXCLUDED.hints_surfaced`,
        [id, c.artifacts ?? 0, c.tasksCompleted ?? 0, c.hintsSurfaced ?? 0],
      );

      // Play time is server-owned (see trackSession): a save only makes sure
      // the row exists and never overwrites what the server has counted.
      await client.query(
        `INSERT INTO wk_screen_time (child_id) VALUES ($1) ON CONFLICT (child_id) DO NOTHING`,
        [id],
      );

      await client.query(`DELETE FROM wk_child_progress WHERE child_id = $1`, [id]);
      const progress = c.progress && typeof c.progress === 'object' ? c.progress : {};
      for (const [key, step] of Object.entries(progress)) {
        const idx = key.indexOf(':');
        if (idx <= 0) continue;
        await client.query(
          `INSERT INTO wk_child_progress (child_id, module_id, sub_id, step) VALUES ($1,$2,$3,$4)`,
          [id, key.slice(0, idx), key.slice(idx + 1), Number(step) || 1],
        );
      }

      await client.query(`DELETE FROM wk_child_treasures WHERE child_id = $1`, [id]);
      for (const t of Array.isArray(c.treasures) ? c.treasures : []) {
        if (typeof t === 'string' && t) {
          await client.query(
            `INSERT INTO wk_child_treasures (child_id, treasure_key) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
            [id, t],
          );
        }
      }

      await client.query(`DELETE FROM wk_milestones WHERE child_id = $1`, [id]);
      const milestones = Array.isArray(c.milestones) ? c.milestones : [];
      for (let m = 0; m < milestones.length; m += 1) {
        const ms = milestones[m] ?? {};
        if (!ms.id) continue;
        await client.query(
          `INSERT INTO wk_milestones (child_id, milestone_id, amount, reward, sort_index)
           VALUES ($1,$2,$3,$4,$5)`,
          [id, String(ms.id), Number(ms.amount) || 1, String(ms.reward ?? ''), m],
        );
      }
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return new Date().toISOString();
}

/** Is a child nickname free across all accounts? Optionally excludes one parent. */
export async function isNicknameAvailable(nickname, exceptUserId = null) {
  const nick = String(nickname).trim().toLowerCase();
  const { rows } = await getPool().query(
    `SELECT 1 FROM wk_children
      WHERE lower(nickname) = $1
        AND ($2::int IS NULL OR parent_id <> $2)
      LIMIT 1`,
    [nick, exceptUserId],
  );
  return rows.length === 0;
}

/**
 * Resolve a child login by unique nickname (or email) + parent-set PIN. Returns
 * `{ status }` ('ok' + { userId, childId } | 'bad_pin' | 'not_found').
 */
export async function resolveChildLogin(identifier, pin) {
  const id = String(identifier ?? '').trim().toLowerCase();
  if (!id) return { status: 'not_found' };
  const { rows } = await getPool().query(
    `SELECT id, parent_id, pin FROM wk_children WHERE lower(nickname) = $1 OR lower(email) = $1`,
    [id],
  );
  if (rows.length === 0) return { status: 'not_found' };
  const match = rows.find((r) => String(r.pin ?? '') === String(pin ?? ''));
  if (!match) return { status: 'bad_pin' };
  return { status: 'ok', userId: match.parent_id, childId: match.id };
}

/** Whether this child profile belongs to this parent account. */
export async function ownsChild(parentId, childId) {
  const { rowCount } = await getPool().query(`SELECT 1 FROM wk_children WHERE id = $1 AND parent_id = $2`, [childId, parentId]);
  return rowCount > 0;
}

/**
 * Apply a screen-time transition for one child inside a row-locked
 * transaction. `transition(state, limits)` is one of the pure functions from
 * screenTime.js and returns the next state. Resolves to `{ state, limits }`, or
 * `null` when the child does not belong to this account.
 */
export async function trackSession(userId, childId, transition) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const owned = await client.query(
      `SELECT c.id, s.session_duration_min, s.cooldown_min, s.max_daily_min
         FROM wk_children c
         LEFT JOIN wk_child_settings s ON s.child_id = c.id
        WHERE c.id = $1 AND c.parent_id = $2`,
      [childId, userId],
    );
    if (owned.rowCount === 0) {
      await client.query('ROLLBACK');
      return null;
    }
    const limits = {
      sessionMin: owned.rows[0].session_duration_min ?? 15,
      cooldownMin: owned.rows[0].cooldown_min ?? 45,
      maxDailyMin: owned.rows[0].max_daily_min ?? 60,
    };

    await client.query(
      `INSERT INTO wk_screen_time (child_id) VALUES ($1) ON CONFLICT (child_id) DO NOTHING`,
      [childId],
    );
    const { rows } = await client.query(
      `SELECT * FROM wk_screen_time WHERE child_id = $1 FOR UPDATE`,
      [childId],
    );
    const row = rows[0];
    const state = transition(
      {
        dayKey: row.day_key ?? '',
        minutesUsedToday: Number(row.minutes_used_today ?? 0),
        sessionElapsedMs: Number(row.session_elapsed_ms ?? 0),
        cooldownUntil: numOrNull(row.cooldown_until),
        lastSessionEndedAt: numOrNull(row.last_session_ended_at),
        lastHeartbeatAt: numOrNull(row.last_heartbeat_at),
      },
      limits,
    );

    await client.query(
      `UPDATE wk_screen_time SET
         day_key = $2, minutes_used_today = $3, session_elapsed_ms = $4, cooldown_until = $5,
         last_session_ended_at = $6, last_heartbeat_at = $7, session_started_at = NULL
       WHERE child_id = $1`,
      [
        childId, state.dayKey, state.minutesUsedToday, Math.round(state.sessionElapsedMs),
        state.cooldownUntil, state.lastSessionEndedAt, state.lastHeartbeatAt,
      ],
    );
    await client.query('COMMIT');
    return { state, limits };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// Cloud voice (Google TTS) + admin
// ---------------------------------------------------------------------------

/**
 * The cloud voice an account actually gets: its own assigned key if it has
 * one, otherwise the global key — unless the account is switched off.
 * (The key is still encrypted here.)
 */
export async function getTtsConfig(userId) {
  const { rows } = await getPool().query(
    `SELECT p.tts_off, k.encrypted_key, k.voice
       FROM wk_parents p
       LEFT JOIN wk_tts_keys k
         ON k.id = COALESCE(p.tts_key_id, (SELECT id FROM wk_tts_keys WHERE is_global ORDER BY id LIMIT 1))
      WHERE p.id = $1`,
    [userId],
  );
  const row = rows[0];
  return {
    enabled: Boolean(row && !row.tts_off && row.encrypted_key),
    encryptedKey: row?.encrypted_key ?? null,
    voice: row?.voice ?? null,
  };
}

/** One stored key by id (encrypted), for the admin's "test" button. */
export async function getTtsKey(keyId) {
  const { rows } = await getPool().query(`SELECT encrypted_key, voice FROM wk_tts_keys WHERE id = $1`, [keyId]);
  return rows[0] ? { encryptedKey: rows[0].encrypted_key, voice: rows[0].voice } : null;
}

export async function getCachedSpeech(hash) {
  const { rows } = await getPool().query(`SELECT audio FROM wk_tts_cache WHERE hash = $1`, [hash]);
  return rows[0]?.audio ?? null;
}

export async function cacheSpeech(hash, voice, audio) {
  await getPool().query(
    `INSERT INTO wk_tts_cache (hash, voice, audio) VALUES ($1,$2,$3) ON CONFLICT (hash) DO NOTHING`,
    [hash, voice, audio],
  );
}

/** Every account with its children and their progress, newest first. */
export async function listAccounts() {
  const db = getPool();
  const parents = await db.query(
    `SELECT id, email, email_key, created_at, tts_key_id, tts_off FROM wk_parents ORDER BY created_at DESC`,
  );
  const children = await db.query(
    `SELECT c.id, c.parent_id, c.name, c.nickname, c.gender, c.birth_year, c.birth_month, c.theme_id,
            c.created_at, st.artifacts, st.tasks_completed, st.hints_surfaced,
            sc.day_key, sc.minutes_used_today, sc.session_elapsed_ms, sc.last_session_ended_at
       FROM wk_children c
       LEFT JOIN wk_child_stats st ON st.child_id = c.id
       LEFT JOIN wk_screen_time sc ON sc.child_id = c.id
      ORDER BY c.parent_id, c.sort_index, c.created_at`,
  );
  const progress = await db.query(`SELECT child_id, module_id, sub_id, step FROM wk_child_progress`);

  const progressByChild = new Map();
  for (const p of progress.rows) {
    if (!progressByChild.has(p.child_id)) progressByChild.set(p.child_id, {});
    progressByChild.get(p.child_id)[`${p.module_id}:${p.sub_id}`] = p.step;
  }
  const childrenByParent = new Map();
  for (const c of children.rows) {
    if (!childrenByParent.has(c.parent_id)) childrenByParent.set(c.parent_id, []);
    childrenByParent.get(c.parent_id).push({
      id: c.id,
      name: c.name,
      nickname: c.nickname ?? '',
      gender: c.gender,
      birthYear: c.birth_year,
      birthMonth: c.birth_month,
      themeId: c.theme_id,
      createdAt: c.created_at,
      artifacts: c.artifacts ?? 0,
      tasksCompleted: c.tasks_completed ?? 0,
      hintsSurfaced: c.hints_surfaced ?? 0,
      playedTodayMinutes:
        Number(c.minutes_used_today ?? 0) + Number(c.session_elapsed_ms ?? 0) / 60_000,
      playedDay: c.day_key ?? '',
      lastSessionEndedAt: numOrNull(c.last_session_ended_at),
      progress: progressByChild.get(c.id) ?? {},
    });
  }
  return parents.rows.map((p) => ({
    id: p.id,
    email: p.email,
    createdAt: p.created_at,
    // NULL key = an older row that shares its mailbox with another account.
    duplicateMailbox: p.email_key === null,
    speechOff: p.tts_off,
    speechKeyId: p.tts_key_id ?? null,
    children: childrenByParent.get(p.id) ?? [],
  }));
}

/** Switch the cloud voice on/off for one account. False for an unknown account. */
export async function setSpeechOff(parentId, off) {
  const { rowCount } = await getPool().query(`UPDATE wk_parents SET tts_off = $2 WHERE id = $1`, [parentId, Boolean(off)]);
  return rowCount > 0;
}

/** Every stored key (encrypted) with the accounts it is assigned to. */
export async function listTtsKeys() {
  const db = getPool();
  const keys = await db.query(`SELECT id, label, encrypted_key, voice, is_global, created_at FROM wk_tts_keys ORDER BY id`);
  const assigned = await db.query(`SELECT id, tts_key_id FROM wk_parents WHERE tts_key_id IS NOT NULL`);
  return keys.rows.map((k) => ({
    id: k.id,
    label: k.label,
    encryptedKey: k.encrypted_key,
    voice: k.voice ?? '',
    isGlobal: k.is_global,
    createdAt: k.created_at,
    accountIds: assigned.rows.filter((a) => a.tts_key_id === k.id).map((a) => a.id),
  }));
}

/**
 * Create (`id` null) or update a key and set who it serves, atomically.
 *   - `isGlobal: true`  → it becomes THE global key (any other loses the flag)
 *     and is detached from individual accounts.
 *   - `isGlobal: false` → it serves exactly `accountIds`; an account can hold
 *     one key, so assigning it here takes it away from whatever it had.
 * `encryptedKey` undefined keeps the stored secret. Returns the key id, or
 * null when `id` does not exist.
 */
export async function saveTtsKey({ id, label, encryptedKey, voice, isGlobal, accountIds }) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    let keyId = id ?? null;
    if (keyId === null) {
      const created = await client.query(
        `INSERT INTO wk_tts_keys (label, encrypted_key, voice, is_global) VALUES ($1,$2,$3,false) RETURNING id`,
        [label, encryptedKey, voice],
      );
      keyId = created.rows[0].id;
    } else {
      const updated = await client.query(
        `UPDATE wk_tts_keys SET label = $2, voice = $3, encrypted_key = COALESCE($4, encrypted_key) WHERE id = $1`,
        [keyId, label, voice, encryptedKey ?? null],
      );
      if (updated.rowCount === 0) {
        await client.query('ROLLBACK');
        return null;
      }
    }

    if (isGlobal) await client.query(`UPDATE wk_tts_keys SET is_global = false WHERE id <> $1`, [keyId]);
    await client.query(`UPDATE wk_tts_keys SET is_global = $2 WHERE id = $1`, [keyId, Boolean(isGlobal)]);

    const ids = isGlobal ? [] : accountIds;
    await client.query(`UPDATE wk_parents SET tts_key_id = NULL WHERE tts_key_id = $1 AND NOT (id = ANY($2::int[]))`, [keyId, ids]);
    if (ids.length > 0) {
      await client.query(`UPDATE wk_parents SET tts_key_id = $1 WHERE id = ANY($2::int[])`, [keyId, ids]);
    }
    await client.query('COMMIT');
    return keyId;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/** Remove a key; accounts that used it fall back to the global one. */
export async function deleteTtsKey(keyId) {
  const { rowCount } = await getPool().query(`DELETE FROM wk_tts_keys WHERE id = $1`, [keyId]);
  return rowCount > 0;
}
