// Shared database layer for the Vercel serverless API functions.
// Files/folders prefixed with "_" are ignored by Vercel's routing, so this is
// a plain module, not an endpoint.
import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

// Managed Postgres (Neon, RDS) needs TLS; enable it from the URL or an env flag.
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
      ssl: wantsSsl
        ? { rejectUnauthorized: process.env.PGSSL_INSECURE !== 'true' }
        : undefined,
      // Keep the per-instance pool small — Neon's pooler fans out connections.
      max: 3,
    });
  }
  return pool;
}

let schemaReady;

/**
 * Ensure tables exist. Idempotent and cached per cold start so repeated
 * invocations don't re-run the DDL.
 */
export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = getPool().query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        email       TEXT UNIQUE NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS game_states (
        user_id     INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        state       JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  }
  return schemaReady;
}

/** Find or create a user by (normalised) email. */
export async function upsertUser(email) {
  const normalised = email.trim().toLowerCase();
  const { rows } = await getPool().query(
    `INSERT INTO users (email)
     VALUES ($1)
     ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
     RETURNING id, email, created_at`,
    [normalised],
  );
  return rows[0];
}

/** Return the stored save for a user, or null if nothing saved yet. */
export async function getState(userId) {
  const { rows } = await getPool().query(
    `SELECT state FROM game_states WHERE user_id = $1`,
    [userId],
  );
  return rows[0]?.state ?? null;
}

/**
 * Is a child nickname free across all accounts? Scans the `children` JSONB
 * arrays with a containment match, optionally excluding one account.
 */
export async function isNicknameAvailable(nickname, exceptUserId = null) {
  const probe = JSON.stringify([{ profile: { nickname: String(nickname).toLowerCase() } }]);
  const { rows } = await getPool().query(
    `SELECT 1 FROM game_states
      WHERE state->'children' @> $1::jsonb
        AND ($2::int IS NULL OR user_id <> $2)
      LIMIT 1`,
    [probe, exceptUserId],
  );
  return rows.length === 0;
}

/**
 * Resolve a child login: match nickname OR email, then the parent-set password.
 * Returns `{ status }` ('ok' + { userId, childId } | 'bad_password' | 'not_found').
 */
export async function resolveChildLogin(identifier, password) {
  const id = String(identifier ?? '').trim().toLowerCase();
  if (!id) return { status: 'not_found' };
  let identifierExists = false;
  for (const field of ['nickname', 'email']) {
    const probe = JSON.stringify([{ profile: { [field]: id } }]);
    const { rows } = await getPool().query(
      `SELECT user_id, state FROM game_states WHERE state->'children' @> $1::jsonb`,
      [probe],
    );
    for (const row of rows) {
      const children = Array.isArray(row.state?.children) ? row.state.children : [];
      for (const c of children) {
        if (String(c?.profile?.[field] ?? '').toLowerCase() === id) {
          identifierExists = true;
          if (String(c?.profile?.password ?? '') === String(password ?? '') && c.id) {
            return { status: 'ok', userId: row.user_id, childId: c.id };
          }
        }
      }
    }
  }
  return { status: identifierExists ? 'bad_password' : 'not_found' };
}

/** Insert or replace the full save for a user. Returns the updated timestamp. */
export async function saveState(userId, state) {
  const { rows } = await getPool().query(
    `INSERT INTO game_states (user_id, state, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (user_id)
     DO UPDATE SET state = EXCLUDED.state, updated_at = now()
     RETURNING updated_at`,
    [userId, state],
  );
  return rows[0].updated_at;
}
