# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

WonderKids / ДивоСвіт — a mobile-first learning playground for kids 3–10 (POC). Vite + React 18 + TypeScript frontend, plus Vercel serverless functions in `api/` backed by PostgreSQL. All UI copy and TTS text is Ukrainian; code and comments are English.

`README.md` still describes the app as "zero-backend, LocalStorage". That is outdated: game state lives on the server and only the auth session is kept in `localStorage` (`wonderkids-auth-v1`).

## Workspace layout

This repo is `app/` inside a non-git parent folder `WonderKids/` that holds sibling repos and shared files:

- `../scripts/` — dev / deploy helper scripts.
- `../docker-compose.yml` — local Postgres 16 on host port **54329**.
- `../doc/` — the original PRD, Tech Spec v2.1 and PRD v4.0 (newest; it wins where they disagree — e.g. v4.0 removed the parent's "minimum tasks per level" setting). Code comments cite them (`PRD §4.1`, `FR-GAME-02`, `PRD v4.0 §2.3`, …).
- `../improvements/` — screenshot batches of requested UI changes (red marks on a screenshot = what to fix).

## Commands

```bash
npm run dev        # Vite on http://localhost:4321, bound to LAN; also serves /api from ./api
npm run build      # tsc -b && vite build — the only correctness check available
npm run preview    # serve dist/ on 4321
```

From the parent folder, `./scripts/dev.sh [port]` does the same as `npm run dev` (and installs deps if missing). `docker compose up -d db` starts a local Postgres on 54329, used only when `DATABASE_URL` is not set in `.env.local`.

```bash
npm test                 # node --test tests/*.test.* — pure logic: play-time rules, level engine, publish status
npm run check:content    # plays every game's generator at every path step and validates each task
node --test tests/engine.test.ts   # a single test file
```

- Tests run on plain Node (≥ 22.18 for `.ts` type-stripping), so anything they import must be free of React and `@/` imports — that is why `core/engine/*` and `core/templates/validate.ts` use relative `.ts` imports. `check:content` loads modules through Vite instead, so it can import anything; run it after touching any generator or content file.
- `npm run lint` does not work (ESLint is neither installed nor configured). `npm run build` is the type-check; `noUnusedLocals` / `noUnusedParameters` are on, so unused symbols fail the build.
- `./scripts/deploy-app.sh ["msg"]` builds, commits and pushes this repo — a push to `main` triggers the Vercel deploy (frontend + `api/`). `./scripts/autopush.sh` commits and pushes every workspace repo together. Both commit with a per-command identity (`git -c user.name/user.email`, see the scripts) and push straight to `main`; don't run them unless asked.
- Production health check: `curl https://wonderkids.yluch.app/api/health`.

## Architecture

### Micro-kernel plugins (`src/core/kernel`, `src/modules`)

A subject is a `LearningModule` (`core/kernel/types.ts`): sub-categories (one per **game**), a pure `generateTask(config)`, a `GameView`, and optional `buildLevel`, `VisualHelper`, `IntroView`, `getIntro`, `getHintSpeech`. Modules self-register with `moduleRegistry` at import time; `src/modules/index.ts` is the barrel imported by `main.tsx`. Core, Hub and the game shell must stay subject-agnostic.

`src/core/galaxies.ts` is the Hub's subject list ("galaxies"); a galaxy is live when its `moduleId` points at a registered module, otherwise it renders as "coming soon".

Each `SubCategory` carries the declarative game config from PRD v4.0 §1.2 (`gameId`, `difficulty` 1–3 stars, `publishDate`, `tasksPerLevel`, `mechanics`, `hintDelaySec`, `hasText`, `progression`); `core/kernel/gameConfig.ts` converts it to the PRD's wire shape (`toGameConfig`) so the catalog can move to a CMS/DB later. The hub's star filter (`core/ui/useHubState`, kept in sessionStorage together with the selected galaxy) sorts and dims — it never hides a game. Card status is derived from `publishDate` only (`core/engine/publish.ts`): before it → locked «Скоро»; for 60 days after → "NEW" badge.

Two words that are easy to confuse:

- **`steps`** — length of a game's *path* (the Duolingo-style ladder in «Мій шлях»). The current path step is the difficulty coefficient passed as `TaskConfig.step`.
- **`tasksPerLevel`** — how many tasks one play session ("level") asks. PRD v4.0 calls these "steps" (`steps_count_default`). A **path** game always asks 10 (`PATH_TASKS_PER_LEVEL`) and ignores the field; only free-play games set it (5–8).

**Spaced recall** (`core/engine/recall.ts`, written up for content authors in `docs/level-design.md` — read it before adding a game): a path level is five tasks new at the current step plus five recalled from the previous five steps, alternating. `composeLevel` does the split; generated games (math) get it in `drawCandidates`, template games through `recallLevel` (new/recalled worked out from how `pool(step)` grows), and ranked content (flags, famous people) composes its own `level` with `introSteps`.

Two kinds of games (`SubCategory.progression`):

- **`path`** (default) — every next step is harder; the card opens the path modal.
- **`free`** — content with no difficulty to grow (sorting bins, the five oceans, the 100 random tasks of «Часова Машина» in `modules/history/timeMachine.ts`). Its card shows how many tasks exist (`LearningModule.taskCount`). No ladder, no step gifts/chests: the card starts play directly, all content is in the pool, unlimited replays. `subSteps()` returns 1 for these.

### Engine layer vs presentation layer (PRD v4.0 §3)

- **Engine** — `core/engine/BaseGameEngine.ts` (abstract, as specified) and `LevelEngine.ts` own one level's task queue. Rules: candidates are de-duplicated by `task.key` (falls back to `prompt`), so a level shrinks on its own when a game has fewer unique tasks than `tasksPerLevel`; a task the child gets wrong is queued **once more** at the end of the level and never shown a third time; blind guessing (3+ wrong taps on one task) appends a fresh task, and so does idling — every whole step the companion rolls back (`useIdleRollback`) becomes one more task and the companion stays where it rolled to; both share the `MAX_EXTRA_TASKS` cap. Levels are always dynamic — the old parent setting (`gameMode`) is gone from the UI and ignored. `task.key` must identify the *question*, not its dressing: two tasks a child would call "the same" need the same key (e.g. 1/2 of a pizza and 1/2 of a cake).
- **React binding** — `components/game/useGameSession.ts` builds the engine per level (via `module.buildLevel` or repeated `generateTask`) and exposes it to `GameScreen`. Modules never touch the store; views only call `callbacks.onSuccess / onMistake / speakPrompt`. `GameScreen` keys the view by queue position, so the repeat of a task is a fresh mount.
- **Presentation** — `components/templates/*`: the CORE UI templates (`GridChoiceLayout`, `DragMatchLayout`, `SequenceLayout`, `InteractiveMapLayout`, `PhysicsScaleLayout`, `SorterBinsLayout`, plus `CashTrayLayout`, `TangramLayout`, `GridAreaLayout`, `NumberMazeLayout`). They render a declarative `TemplatePayload` (`core/templates/types.ts`) through `TemplateGameView`; pure answer checks live in `core/templates/validate.ts`. All dragging goes through `useDragDrop` (drag **or** tap-item-then-tap-target; targets are `data-drop` elements).

A template-based subject is pure data: `modules/shared/templateModule.ts` → `defineTemplateModule({ games })`, where each game supplies `pool(step)` returning every task it can ask at that step (see `modules/geography`, `ecology`, `history`). A game may also supply `level(step, count)` to compose a level itself — the flag game does: `geography/countries.ts` lists all countries ordered by how familiar their flag is, each path step introduces the next five and recalls five from the previous five steps. New math games mix into the existing module: `MathGameView` routes template payloads to `TemplateGameView`, classic payloads (`kind: 'mental' | 'fraction'`) to their own views.

Feedback is unified (PRD v4.0 §3.3): the engine's `AnswerResult` names a sound code (`SND_SUCCESS`, `SND_ERROR`, …), `useSound().playCode` maps it to the synthesiser, and views shake for 300 ms on a mistake.

- **Zero-aggression** is a product invariant: no fail states, no visible timers or countdowns, never the word "wrong". **Only mistakes raise a hint** — two on a task, or one on the repeat of a task missed earlier; never a pause, and a repeat starts as a normal task (its prompt is read out again). `hintActive` is then true and each template scaffolds itself (narrows choices, pulses the target, shows a counter).
- **How to answer is told once, not printed on every task.** The tap / drag / swap instruction is a first-run tip per board type (`components/coach/tips.ts`, `HOW_TO`), drag targets light up while a card hovers over them (`useDragDrop().over`), and when there is a single thing to place a tap on the target is enough (`soleItem`). Prompts must be explicit instructions a child can act on.
- **First-run tips** (`components/coach/CoachTips.tsx`): one at a time, each spotlighting a control via a `data-tip="…"` anchor and read aloud; it stays until the child closes it and never returns. Seen tips are `tip:<id>` keys in the child's `treasures` (so they sync with no schema change); the parent cabinet can reset them.
- **Never interrupt a level.** Running out of play time only takes effect once the level in progress is finished (the server allows `DEPLETION_GRACE_MS` of overrun for that); while the rest screen is up nothing speaks or runs underneath.
- **Text and voice**: text cards and prompts get a tap-to-hear `SpeakButton` (hidden when the parent turns `settings.ttsButtons` off); games with `hasText` get the one-time tip pointing at them. `TaskInstance.outro` is a short fact spoken and shown after a correct answer — the level waits until it has been read to the end (`session.awaitingOutro` / `outroDone`), never a guessed delay. It should be a pool of ten or more texts (`string[]`; `core/content/outro.ts` rotates through it so a replay tells a new story, `check:content` enforces the ten). The speech engine silences itself when the page is hidden (phone locked, app switched).

### Screen time (server-authoritative)

The server owns the play-time budget (PRD v4.0 §2.2). `components/game/useScreenTime.ts` calls `POST /api/v1/session/start` when a game becomes active, `PUT /api/v1/session/heartbeat` every 30 s, and a final beat with `end: 'pause' | 'depleted'`; parents refill via `POST /api/v1/session/reset`. The rules are pure functions in `api/_lib/screenTime.js` (day roll-over in the child's time zone, a >90 s gap between beats counts as a pause, cooldown, daily cap → rest until local midnight, forced end after a grace period if the client never ends the session). `PUT /api/state` never writes `wk_screen_time`. The store's `screenTime` is only a local mirror that animates the gauge between beats (`applyServerScreenTime`); `core/time/screenTime.ts` turns it into the fuel percentage. The child sees a draining row of the theme's `timeToken` — an hourglass or time crystal, never a star (stars mean progress, difficulty and rewards only).

### The child's world (`src/core/world`, `/world`)

«Мій світ» replaced the old single "dream build". `world.ts` holds the rules (pure, tested):

- **The planet** — the child *exchanges* artifacts for items of the active theme: ten buildings (`BUILDING_COSTS`, the last is `theme.dreamBuild` and unlocks only when the other nine stand) and eight decorations (`DECOR_COSTS`), listed per theme in `themeWorlds.ts`. `artifacts` is never decremented: a purchase is remembered as a key `world:<themeId>:<itemId>` inside the child's `treasures` array (so it syncs with no schema change), and the balance is `earned − spent` (`balanceOf`). Every counter and the family goals show that balance — read it with `useBalance()`, never `s.artifacts` directly — so buying something for the planet genuinely sets the goals back: the child chooses between building and saving. An item's price depends only on its id (`b3`, `d5`), never on the theme. Buying goes through `store.buyWorldItem`, which re-checks the balance.
- **«Землі знань»** — derived, not stored: one landmark per game (`SubCategory.landmark`, optionally with four named `stages`) that grows with the share of the path completed, or with levels played for free-play games.
- **Residents** — derived: every 5th path step is a gift that brings one.

Levels played are counted in `progress` under `${module}:${sub}#plays` (`core/progress/plays.ts`). Code that walks `progress` or `treasures` keys must expect these extra `#plays` / `world:` / `tip:` entries.

`components/world/PlanetView.tsx` draws the planet: items stand on the rim of a rotating disc (tap one and the planet turns it to the top), inside a `react-zoom-pan-pinch` wrapper for drag / pinch / wheel zoom, with a fly-in when something is built. The scene is a fixed 640 px stage scaled to fit; get the zoom handle via `onInit`, not `ref` (the library takes no ref on React 18).

### Voice (`src/core/audio/SpeechEngine.ts`, `api/tts.js`)

Speech has two tiers. When Google Speech is in effect for the account (`features.cloudTts` in the `GET /api/state` response) the engine fetches each phrase from `POST /api/tts` — our proxy to Google Cloud TTS, which caches every phrase in `wk_tts_cache` — and plays it through the sound effects' own `AudioContext` (`audioEngine.playEncoded`; an `<audio>` element is only the fallback), so speech and effects share one audio session on phones. Otherwise, and whenever the cloud is slow (3.5 s), offline or rejects the key, it falls back to the browser's Web Speech voice. Callers only ever use `speechEngine.speak / cancel`. A Google key never reaches a browser.

Keys live in `wk_tts_keys` (AES-GCM-encrypted, `api/_lib/secrets.js`), each with its own voice. Which key an account gets is decided in one place, `getTtsConfig` in `api/_lib/db.js`: the key assigned to the account (`wk_parents.tts_key_id`) wins; otherwise the single **global** key (`is_global`) applies; and `wk_parents.tts_off` switches the account off regardless. Saving a key as global clears the flag on any other; assigning a key to an account takes that account off whatever key it had (`saveTtsKey`).

### Admin area (`src/pages/AdminPage.tsx`, `src/pages/admin/*`, `api/admin/*`)

`/admin/*` is lazy-loaded and not mounted on the `play.*` portal. `/admin` lists every parent account, their children and each child's progress per game, with a one-line Google Speech status and on/off switch per account. `/admin/speech` manages the keys: add or edit, choose who each one serves (global or selected accounts), test, delete, plus the same per-account switches. It authenticates with a shared `ADMIN_KEY` env var sent as `x-admin-key` — deliberately not with parent tokens, because parent login is email-only.

### Themes that reshape the UI

Most themes are a palette + emoji set. `lego` and `minecraft` also change shape: `styles/global.css` overrides the shared tokens under `:root[data-theme='…']` (radii, shadows, font), so every component follows without per-component rules, and `components/theme/ThemeDecor.tsx` draws their scenery and wordmark. New components should keep using `var(--radius*)` / `var(--shadow*)` rather than literals, or they will look out of place in those themes.

### State (`src/core/store/useGameStore.ts`)

One Zustand store. The persisted shape is only `{ children: ChildState[], activeChildId }` — a parent account holds several children. The active child's fields (`profile`, `themeId`, `settings`, `progress`, …) are **mirrored** onto the store root so components read `s.settings` directly; every mutation must go through `patchActive` / `commit` so `children[]` and the mirror stay consistent. `hydrate` → `fromPersisted` → `migrateChild` fills defaults for missing fields; a new field needs a default there.

### Sync and auth (`src/core/sync`, `core/auth`, `core/api`)

`useRemoteSync` loads `GET /api/state` after login (the app shows a splash until `ready`), then debounces `PUT /api/state` (700 ms) on every store change with the whole persistable state. The parent cabinet pauses auto-save via `useSyncControl` and persists on an explicit Save button.

Two login kinds, both yielding a JWT whose subject is the **parent account id**: parent = email only (no password); child = nickname + PIN, token also carries `childId`, which is auto-selected after load.

### Portals and the public site (`src/core/portal.ts`)

One deployment, four faces chosen by hostname: the **root domain** → `site` (the public landing page); `parents.*` → parent cabinet (+ admin) only; `play.*` → child hub only, parent routes not mounted; localhost / LAN / `*.vercel.app` → `dev`, everything reachable on one origin. Routing in `App.tsx` branches on this, so route changes need checking against all of them. On `site` the SPA only redirects app paths to their subdomain (`portalUrl`). `VITE_USE_SUBDOMAINS=false` keeps the whole app on the root domain.

The landing page is **static HTML** (`landing.html`, a second Vite entry — no React), so crawlers get real content; `vercel.json` rewrites `/` to it on every host except `play.*` / `parents.*`. Its copy states concrete numbers (games, flags, tasks) — keep them true when content changes.

### SEO

- `seo-plugin.ts` (Vite) fills `__SITE_URL__` / `__PLAY_URL__` / `__PARENTS_URL__` in both HTML entries from `VITE_SITE_URL`, and emits `robots.txt` and `sitemap.xml`.
- `landing.html` carries the full set: title, description, canonical, hreflang, Open Graph / Twitter (`public/og-image.png`), and JSON-LD (`WebSite`, `WebApplication`, `FAQPage` — the FAQ JSON must match the visible FAQ).
- The SPA is `noindex` by default; `core/seo/usePageMeta` sets title, description, robots and canonical per page, and only the two public login pages opt into `index`. `vercel.json` adds `X-Robots-Tag: noindex` on personal paths.

### Accounts

Parent login is by email only (no password yet). **One mailbox = one account**: `api/_lib/email.js` derives `email_key` (Gmail dots, `+tags` and `googlemail.com` collapse), unique in `wk_parents`. Signing in never creates an account: an unknown address answers `account_not_found` (with a `suggestion` for a mistyped domain) and the account is created only after the parent confirms (`create: true`). Look-alike accounts that are genuinely different addresses cannot be merged automatically — the admin page flags them and can delete an account.

### Themes (`src/core/theme`)

A theme is a deep skin (palette, mascot, goal, artifact, time token, chest, treasures), not just colours. `ThemeProvider` writes the palette to CSS custom properties on `:root`; components use CSS Modules and read only those variables. A child's `themeId` is `null` until chosen and resolves to the neutral `galaxy` theme.

### API (`api/`)

`api/*.js` are Vercel serverless functions and the **only** API implementation (`_`-prefixed files/folders are shared code, not routes). In dev there is no separate backend: the `devApi()` Vite plugin (`dev-api.ts`) mirrors Vercel's file-based routing and serves the same handlers in-process, loading them through Vite's SSR module graph so edits apply on the next request. Handlers must stay runtime-neutral: default-export `(req, res)`, do their own method checks, and use only `req.method / headers / query / body` and `res.status().json() / setHeader()` — anything else needs a matching shim in `dev-api.ts`. `vite preview` does not serve `/api`.

Endpoints: `GET /api/health`, `POST /api/auth/login`, `POST /api/auth/child-login`, `GET /api/nickname`, `GET|PUT /api/state`, and `POST /api/v1/session/start`, `PUT /api/v1/session/heartbeat`, `POST /api/v1/session/reset` (the last is parent-only; a child token always acts on its own profile, a parent token names one with `child_profile_id`). Also `POST /api/tts` and the admin endpoints `GET|PUT /api/admin/users`, `GET|POST|PUT|DELETE /api/admin/speech`, `POST /api/admin/tts-test`.

The client sends the save as one JSON object, but `api/_lib/db.js` decomposes it into normalised `wk_*` tables in `saveState` and reassembles it in `getState`. Adding a persisted field therefore touches the store types + `migrateChild` on the client, and the table DDL + `saveState` + `getState` in `db.js`. The schema is created idempotently (`ensureSchema`); there are no migrations, so column changes need an explicit `ALTER TABLE` in that block.

Env vars for `api/`: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_KEY` (admin panel; ≥ 8 chars), optional `JWT_EXPIRES_IN`, `PGSSL`, `PGSSL_INSECURE`, `SECRETS_KEY` (encrypts stored Google keys; defaults to `JWT_SECRET` and must never change once keys are saved). Production values live in Vercel; locally they come from the gitignored `.env.local` (see `.env.example`). **`.env.local` currently points at the production (Neon) database**, so local dev reads and writes real data — don't run destructive queries, schema experiments or test logins that create junk accounts against it. Without `DATABASE_URL` the plugin falls back to the Docker database. To run against the Docker database while `.env.local` exists, set it in the shell, which wins over the file: `DATABASE_URL=postgres://wonderkids:wonderkids@localhost:54329/wonderkids PGSSL=false JWT_SECRET=dev npx vite`. `--mode test` does NOT help — Vite loads `.env.local` in every mode.

## Conventions

- Import via the `@/` alias (→ `src/`).
- Styling: CSS Modules next to the component + theme CSS variables; no hard-coded theme colours.
- Mobile-first: touch targets ≥ 56px, safe-area insets, no double-tap zoom.
- Audio is synthesised (Web Audio in `core/audio/AudioEngine.ts`) and speech uses the Web Speech API; voiced text is gated per channel (`core/audio/voiceChannels.ts`).
