// The catalogue of games, written out for the public site.
//
// The site and the game never import one another, and a game's card lives in
// `src/games/<subject>/config.ts` behind `@/` imports — so what the site needs
// to know about the games is GENERATED from the game itself: this script loads
// every registered module through Vite (as `tests/content.check.mjs` does) and
// writes `packages/catalog/src/<lang>.json`, one file per language, each
// listing only the games written in that language. The files are committed;
// `tests/catalog.test.ts` runs this again and fails when they are stale, so
// the site cannot drift from the game.
//
//   npm run catalog          write the files
//   node scripts/catalog.mjs --check   fail if they would change
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';

const LANGS = ['uk', 'en', 'pl'];
/** Sample tasks are drawn under a fixed seed: the same catalogue every run. */
const SEED = 20261012;
/** How many answers of a board a page shows — and how long one may be: a board of whole sentences is told by its right answer alone. */
const MAX_ANSWERS = 9;
const MAX_ANSWER_LENGTH = 32;
const MAX_BOARD = 12;
/** How many different tasks a page shows from each step it samples — and from a game with no steps. */
const PER_STEP = 1;
const PER_FREE_GAME = 4;

const out = (lang) => new URL(`../../packages/catalog/src/${lang}.json`, import.meta.url);

export async function buildCatalog() {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error', plugins: [] });
  try {
    await server.ssrLoadModule('/src/games/index.ts');
    const { moduleRegistry } = await server.ssrLoadModule('/src/core/game/kernel/ModuleRegistry.ts');
    const { difficultyRange, isFreePlay, tasksPerLevel } = await server.ssrLoadModule('/src/core/game/kernel/gameConfig.ts');
    const { speaks } = await server.ssrLoadModule('/src/core/game/kernel/types.ts');
    const { GALAXIES } = await server.ssrLoadModule('/src/core/game/galaxies.ts');
    const { drawCandidates } = await server.ssrLoadModule('/src/components/game/useGameSession.ts');
    const { seeded } = await server.ssrLoadModule('/src/core/utils/random.ts');
    const { written } = await server.ssrLoadModule('/src/core/language/marks.ts');
    const { language } = await server.ssrLoadModule('/src/core/language/index.ts');

    const glyph = (piece) => (typeof piece === 'string' ? piece : 'd' in piece ? `${piece.n}/${piece.d}` : String(piece.text ?? ''));
    /** A card as plain words: its pictogram and its label, or the number written on it — or nothing, when it is a drawing. */
    const face = (card) => [card.emoji, card.label ?? card.glyphs?.map(glyph).join(' ')].filter(Boolean).join(' ').trim();

    /** Tasks of one step as a page can show them: the question, and the answers where they are words or pictograms. */
    const samples = (module, sub, step, lang, count) => {
      const drawn = seeded(SEED + step, () => drawCandidates(module, { subCategoryId: sub.id, step, choicesCount: 9, currency: language(lang).currency }, tasksPerLevel(sub), false, { shown: lang, said: lang }));
      // Different questions only: a page that asks the same thing twice tells nothing new.
      const asked = new Set();
      return drawn
        .filter((task) => task?.prompt && !asked.has(task.prompt) && asked.add(task.prompt))
        .slice(0, count)
        .map((task) => told(task, step));
    };

    const told = (task, step) => {
      const entry = { step, prompt: written(task.prompt) };
      const board = task.payload;
      if (board?.template === 'UI_GRID_CHOICE') {
        const answers = board.options.map(face);
        const right = face(board.options.find((option) => option.id === board.correctId));
        if (right) entry.right = right;
        if (right && answers.every((answer) => answer && answer.length <= MAX_ANSWER_LENGTH) && answers.length <= MAX_ANSWERS) entry.answers = answers;
      } else if (board) {
        // Any other board: the things laid out on it — the words to rhyme, the letters to place, the cards to put in order.
        const things = [...new Set(Object.values(board).flatMap((part) => (Array.isArray(part) ? part : [])).filter((thing) => thing && typeof thing === 'object').map(face).filter((thing) => thing && thing.length <= MAX_ANSWER_LENGTH))];
        if (things.length >= 2) entry.board = things.slice(0, MAX_BOARD);
      }
      return entry;
    };

    const catalogs = {};
    for (const lang of LANGS) {
      const galaxies = [];
      for (const galaxy of GALAXIES) {
        const module = galaxy.moduleId ? moduleRegistry.get(galaxy.moduleId, lang) : undefined;
        if (!module) continue;
        const games = module.subCategories
          .filter((sub) => speaks(sub, lang))
          .map((sub) => {
            const free = isFreePlay(sub);
            const steps = free ? 1 : (sub.steps ?? 30);
            // The first, the middle and the last step: what the game asks, and how it grows.
            const at = free ? [1] : [...new Set([1, Math.ceil(steps / 2), steps])];
            const mechanics = [sub.mechanics ?? []].flat();
            return {
              id: `${module.id}:${sub.id}`,
              sub: sub.id,
              icon: sub.icon,
              title: sub.label,
              blurb: sub.blurb,
              intro: sub.intro ?? '',
              ...(sub.group ? { set: `${sub.group.icon} ${sub.group.label}` } : {}),
              stars: difficultyRange(sub),
              kind: free ? 'free' : 'path',
              steps,
              tasksPerLevel: tasksPerLevel(sub),
              mechanics,
              ...(free && module.taskCount ? { tasks: module.taskCount(sub.id) } : {}),
              samples: at.flatMap((step) => samples(module, sub, step, lang, free ? PER_FREE_GAME : PER_STEP)),
            };
          });
        if (games.length > 0) galaxies.push({ id: module.id, icon: galaxy.icon, title: module.title, games });
      }
      catalogs[lang] = galaxies;
    }
    return catalogs;
  } finally {
    await server.close();
  }
}

const text = (catalog) => `${JSON.stringify(catalog, null, 1)}\n`;

if (import.meta.url === `file://${process.argv[1]}`) {
  const catalogs = await buildCatalog();
  const stale = LANGS.filter((lang) => {
    try {
      return readFileSync(out(lang), 'utf8') !== text(catalogs[lang]);
    } catch {
      return true;
    }
  });
  if (process.argv.includes('--check')) {
    if (stale.length > 0) {
      console.error(`packages/catalog is stale (${stale.join(', ')}): run «npm run catalog» in game/ and commit the result`);
      process.exit(1);
    }
  } else {
    for (const lang of LANGS) writeFileSync(out(lang), text(catalogs[lang]));
    for (const lang of LANGS) console.log(`${lang}: ${catalogs[lang].reduce((n, galaxy) => n + galaxy.games.length, 0)} games in ${catalogs[lang].length} galaxies`);
  }
  process.exit(0);
}
