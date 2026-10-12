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
-- An account the owner switched off: nobody signs in to it — neither the parent
-- nor its children — and its save is neither read nor written. Nothing is deleted.
ALTER TABLE wk_parents ADD COLUMN IF NOT EXISTS disabled BOOLEAN NOT NULL DEFAULT false;
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
-- Languages (src/core/lang). NULL — not chosen: the app offers the one of the visitor's country.
ALTER TABLE wk_parents ADD COLUMN IF NOT EXISTS lang TEXT;
ALTER TABLE wk_child_settings ADD COLUMN IF NOT EXISTS game_lang TEXT;
-- The parent picked the money themselves; NULL — a save from before the flag (the client decides).
ALTER TABLE wk_child_settings ADD COLUMN IF NOT EXISTS currency_chosen BOOLEAN;
ALTER TABLE wk_child_settings ADD COLUMN IF NOT EXISTS voice_lang TEXT;
-- Games the parent has put away for this child: ["<moduleId>:<subId>", …].
ALTER TABLE wk_child_settings ADD COLUMN IF NOT EXISTS hidden_games JSONB NOT NULL DEFAULT '[]'::jsonb;
-- Letters from the public site («Написати нам»). The text stays here;
-- photos and videos are only forwarded by email: they wait in
-- wk_feedback_parts (base64 pieces) until the letter has left.
CREATE TABLE IF NOT EXISTS wk_feedback (
  id         SERIAL PRIMARY KEY,
  kind       TEXT NOT NULL,
  message    TEXT NOT NULL,
  email      TEXT NOT NULL DEFAULT '',
  files      JSONB NOT NULL DEFAULT '[]',
  status     TEXT NOT NULL DEFAULT 'new',
  closed     BOOLEAN NOT NULL DEFAULT false,
  mailed_at  TIMESTAMPTZ,
  mail_error TEXT,
  ip_hash    TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS wk_feedback_parts (
  feedback_id INTEGER NOT NULL REFERENCES wk_feedback(id) ON DELETE CASCADE,
  file_no     INTEGER NOT NULL,
  part_no     INTEGER NOT NULL,
  data        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (feedback_id, file_no, part_no)
);
CREATE TABLE IF NOT EXISTS wk_feedback_replies (
  id          SERIAL PRIMARY KEY,
  feedback_id INTEGER NOT NULL REFERENCES wk_feedback(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  mailed      BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Where a new account came from: the utm_* labels of the link that
-- brought the parent (see source.js). NULL = registered without one.
ALTER TABLE wk_parents ADD COLUMN IF NOT EXISTS signup_source TEXT;
ALTER TABLE wk_parents ADD COLUMN IF NOT EXISTS signup_medium TEXT;
ALTER TABLE wk_parents ADD COLUMN IF NOT EXISTS signup_campaign TEXT;
-- The owner's own links and the visits by them (see marketing.js).
-- A visit keeps its link's code, not a reference: deleting a link
-- leaves what it brought in the statistics.
ALTER TABLE wk_parents ADD COLUMN IF NOT EXISTS signup_link TEXT;
CREATE TABLE IF NOT EXISTS wk_links (
  id         SERIAL PRIMARY KEY,
  code       TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  mode       TEXT NOT NULL,
  note       TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS wk_visits (
  id         BIGSERIAL PRIMARY KEY,
  link_code  TEXT,
  mode       TEXT NOT NULL,
  via        TEXT NOT NULL DEFAULT 'link',
  country    TEXT,
  lang       TEXT,
  device     TEXT,
  referrer   TEXT,
  visitor    TEXT NOT NULL DEFAULT '',
  expired_at TIMESTAMPTZ,
  cta_at     TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wk_visits_created_at ON wk_visits (created_at DESC);
-- Settings of the whole product, set in the admin panel (one row each).
CREATE TABLE IF NOT EXISTS wk_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- The language a letter was written in: its sender is answered in it.
ALTER TABLE wk_feedback ADD COLUMN IF NOT EXISTS lang TEXT;
