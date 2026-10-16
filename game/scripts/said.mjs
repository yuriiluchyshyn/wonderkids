// Every Ukrainian text the app may say aloud — for the dictionary of stress
// (`src/core/language/uk/stress.json`). Loaded through Vite, like check:content.
//
// What is gathered (a little more than is ever said, never less):
//   - every Ukrainian string of the source and of the dictionaries, the admin panel aside;
//   - every task of every game written in Ukrainian, at every step, a few draws each and
//     in every currency — what the phrase engine makes of the words (the cases, the
//     verbs in their tense) exists only there;
//   - the intro of every step in every theme;
//   - the numbers as the voice says them (`numberWords`, `ordinalWords`) and the names of the letters.
// Each text goes through `voiced` first, as it does before the voice reads it.
//
//   npm run stress               lists the words the dictionary does not know
//   npm run stress -- <file>     and writes them to <file>, one per line
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const GAME = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(GAME, 'src');
/** Not said by the voice: the owner's panel, and the dictionary itself. */
const SKIPPED = [join(SRC, 'pages', 'admin'), join(SRC, 'core', 'language', 'uk', 'stress.json')];
const CYRILLIC = /[А-Яа-яІіЇїЄєҐґ]/;
const ROUNDS = 4;

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (SKIPPED.some((skip) => path.startsWith(skip))) continue;
    if (statSync(path).isDirectory()) yield* files(path);
    else if (/\.(tsx?|json)$/.test(name)) yield path;
  }
}

/** Every string inside a value, however deep (functions and cycles aside). */
function strings(value, out, seen = new WeakSet(), depth = 0) {
  if (typeof value === 'string') {
    if (CYRILLIC.test(value)) out.add(value);
    return;
  }
  if (!value || typeof value !== 'object' || depth > 12 || seen.has(value)) return;
  seen.add(value);
  for (const item of Array.isArray(value) ? value : Object.values(value)) strings(item, out, seen, depth + 1);
}

/** Gathers the texts; `server` is a Vite dev server in middleware mode. */
export async function saidTexts(server) {
  const texts = new Set();

  // The source and the dictionaries: Cyrillic runs, line by line (a literal may be split by code, a line seldom is).
  for (const path of files(SRC)) {
    // `\n` inside a literal would glue its «n» to the next word.
    for (const line of readFileSync(path, 'utf8').split('\n')) if (CYRILLIC.test(line)) texts.add(line.replace(/\\[nrt]/g, ' '));
  }

  await server.ssrLoadModule('/src/games/index.ts');
  const { moduleRegistry } = await server.ssrLoadModule('/src/core/game/kernel/ModuleRegistry.ts');
  const { toGameConfig, tasksPerLevel } = await server.ssrLoadModule('/src/core/game/kernel/gameConfig.ts');
  const { drawCandidates } = await server.ssrLoadModule('/src/components/game/useGameSession.ts');
  const { CURRENCIES } = await server.ssrLoadModule('/src/core/game/content/currency.ts');
  const { THEME_LIST } = await server.ssrLoadModule('/src/core/theme/themes.ts');
  const { localTheme } = await server.ssrLoadModule('/src/core/theme/localTheme.ts');
  const themes = THEME_LIST.map((spec) => localTheme(spec, 'uk'));
  const currencies = Object.keys(CURRENCIES);

  for (const module of moduleRegistry.getAll()) {
    strings(module.subCategories, texts);
    for (const sub of module.subCategories) {
      if (!(sub.langs ?? ['uk']).includes('uk')) continue;
      const config = toGameConfig(module, sub);
      const steps = config.progression === 'free' ? 1 : (sub.steps ?? 30);
      const size = tasksPerLevel(sub);
      for (let step = 1; step <= steps; step += 1) {
        for (const theme of themes) {
          const intro = module.getIntro?.(sub.id, theme, step, 'uk');
          if (intro) texts.add(intro);
        }
        for (let round = 0; round < ROUNDS; round += 1) {
          const base = { subCategoryId: sub.id, step, choicesCount: 9, currency: currencies[(step + round) % currencies.length] };
          let tasks = [];
          try {
            tasks = drawCandidates(module, base, size, config.progression !== 'free', { shown: 'uk', said: 'uk' });
          } catch {
            continue; // check:content reports a game that cannot make its tasks
          }
          for (const task of tasks) {
            strings(task, texts);
            const how = module.getHintSpeech?.(task);
            if (how) texts.add(how);
          }
        }
      }
    }
  }

  // Numbers and letters, as the voice reads them.
  const { numberWords, ordinalWords, letterName } = await server.ssrLoadModule('/src/core/language/uk/index.ts');
  const numbers = [...Array(1001).keys(), ...Array.from({ length: 100 }, (_, i) => (i + 1) * 100), ...Array.from({ length: 100 }, (_, i) => (i + 1) * 1000)];
  for (const n of numbers) {
    for (const gender of ['m', 'f', 'n']) for (const c of ['nom', 'gen', 'ins']) texts.add(numberWords(n, gender, c));
  }
  for (let n = 1; n <= 2100; n += 1) for (const form of ['m', 'f', 'gen', 'loc', 'f-loc']) texts.add(ordinalWords(n, form));
  for (const letter of 'абвгґдеєжзиіїйклмнопрстуфхцчшщьюя') texts.add(letterName(letter));

  return texts;
}

/** The words of the texts that the dictionary of stress does not know, sorted. */
export async function missingStress(server, texts) {
  const { uk } = await server.ssrLoadModule('/src/core/language/uk/index.ts');
  const { spoken } = await server.ssrLoadModule('/src/core/language/marks.ts');
  const missing = new Set();
  for (const text of texts) {
    const said = spoken(text);
    for (const version of new Set([said, uk.voiced(said)])) for (const word of await uk.stress.missing(version)) missing.add(word);
  }
  return [...missing].sort((a, b) => a.localeCompare(b, 'uk'));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const server = await createServer({ root: GAME, server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' });
  try {
    const texts = await saidTexts(server);
    const missing = await missingStress(server, texts);
    const out = process.argv[2];
    if (out) writeFileSync(out, missing.join('\n') + '\n');
    console.log(`${texts.size} texts; ${missing.length} word(s) without a stress${out ? ` → ${relative(process.cwd(), out)}` : ''}`);
    if (!out) for (const word of missing.slice(0, 200)) console.log(' ', word);
  } finally {
    await server.close();
  }
}
