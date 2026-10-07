import { existsSync } from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { loadEnv, type Plugin } from 'vite';

/** Server-side env vars the `api/` handlers read (never exposed to the client). */
const API_ENV = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'PGSSL',
  'PGSSL_INSECURE',
  'ADMIN_KEY',
  'SECRETS_KEY',
  'GOOGLE_TTS_ENDPOINT',
  // Public values shared with the frontend; the API verifies Auth0 tokens with them.
  'VITE_AUTH0_DOMAIN',
  'VITE_AUTH0_CLIENT_ID',
];

/** The Docker database from the workspace-root docker-compose.yml. */
const LOCAL_DATABASE_URL = 'postgres://wonderkids:wonderkids@localhost:54329/wonderkids';

const MAX_BODY_BYTES = 256 * 1024;

/**
 * The API variables as the shell provided them, captured once per process (on
 * globalThis, because Vite re-evaluates this file on every config reload).
 */
const SHELL_ENV: Record<string, string | undefined> = ((
  globalThis as { __wkShellEnv?: Record<string, string | undefined> }
).__wkShellEnv ??= Object.fromEntries(API_ENV.map((key) => [key, process.env[key]])));

/** Collect and JSON-parse a request body (`undefined` when empty). */
function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('body_too_large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve(undefined);
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('invalid_json'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

/**
 * Serves the Vercel serverless functions in `api/` from the Vite dev server, so
 * local dev runs the very code that is deployed — no separate backend process
 * and no second implementation.
 *
 * Mirrors Vercel's file-based routing (`api/auth/login.js` → `/api/auth/login`;
 * `_`-prefixed files/folders are shared code, not endpoints) and the small part
 * of its Node helper surface the handlers use: `req.query`, `req.body`,
 * `res.status()`, `res.json()`. Handlers load through Vite's SSR module graph,
 * so editing anything under `api/` takes effect on the next request.
 */
export function devApi(): Plugin {
  return {
    name: 'wonderkids-dev-api',
    apply: 'serve',

    config(_config, { mode }) {
      // Handlers read process.env — populate it from .env files (.env.local
      // etc.). Variables that were set in the shell when the dev server started
      // win; everything else follows the .env files, INCLUDING later edits:
      // Vite re-runs this hook when an .env file changes, and a value this
      // plugin put there earlier must not be mistaken for a shell variable.
      //
      // loadEnv itself prefers whatever is already in process.env, so our own
      // earlier values have to be cleared BEFORE reading the files again.
      const managed = API_ENV.filter((key) => SHELL_ENV[key] === undefined);
      for (const key of managed) delete process.env[key];
      const env = loadEnv(mode, process.cwd(), '');
      for (const key of managed) {
        if (env[key]) process.env[key] = env[key];
      }
      process.env.DATABASE_URL ??= LOCAL_DATABASE_URL;
    },

    configureServer(server) {
      const apiDir = path.resolve(server.config.root, 'api');

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        if (!url.pathname.startsWith('/api/')) return next();

        const segments = url.pathname.slice('/api/'.length).split('/');
        const routable = segments.every((s) => /^[\w-]+$/.test(s) && !s.startsWith('_'));
        const file = path.join(apiDir, ...segments) + '.js';
        if (!routable || !existsSync(file)) {
          return sendJson(res, 404, { error: 'not_found' });
        }

        try {
          const mod = await server.ssrLoadModule(file);
          const vReq = Object.assign(req, {
            query: Object.fromEntries(url.searchParams),
            body: await readJsonBody(req),
          });
          const vRes = Object.assign(res, {
            status(code: number) {
              res.statusCode = code;
              return vRes;
            },
            json(data: unknown) {
              sendJson(res, res.statusCode, data);
              return vRes;
            },
          });
          await mod.default(vReq, vRes);
        } catch (err) {
          const message = err instanceof Error ? err.message : '';
          if (message === 'invalid_json' || message === 'body_too_large') {
            return sendJson(res, 400, { error: message });
          }
          console.error(`[api] ${url.pathname} failed:`, err);
          if (!res.headersSent) sendJson(res, 500, { error: 'server_error' });
        }
      });
    },
  };
}
