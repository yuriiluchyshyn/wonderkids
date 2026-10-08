// Content sanity check: loads every registered learning module through Vite
// (so `@/` aliases, TSX and CSS modules resolve) and plays the generators at
// every path step, asserting each task is well-formed and solvable.
//
//   npm run check:content
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
  logLevel: 'error',
  plugins: [],
});

let tasksChecked = 0;
const problems = [];

function unique(ids, what) {
  assert.equal(new Set(ids).size, ids.length, `${what}: duplicate ids ${ids.join(',')}`);
}

function checkPayload(p, validate) {
  switch (p.template) {
    case 'UI_GRID_CHOICE': {
      const ids = p.options.map((o) => o.id);
      unique(ids, 'options');
      assert.ok(ids.includes(p.correctId), `correctId ${p.correctId} not among options`);
      assert.ok(p.options.length >= 2 && p.options.length <= 9, `bad option count ${p.options.length}`);
      for (const o of p.options) assert.ok(o.emoji || o.label || o.glyphs || o.shape || o.clock, 'option has no face');
      break;
    }
    case 'UI_DRAG_MATCH': {
      const slots = p.slots.map((s) => s.id);
      unique(slots, 'slots');
      unique(p.items.map((i) => i.id), 'items');
      for (const item of p.items) assert.ok(slots.includes(p.pairs[item.id]), `item ${item.id} has no slot`);
      assert.equal(new Set(Object.values(p.pairs)).size, p.items.length, 'two items share a slot');
      break;
    }
    case 'UI_CHRONO_SEQUENCE': {
      const ids = p.cards.map((c) => c.id);
      unique(ids, 'cards');
      assert.deepEqual([...p.initial].sort(), [...ids].sort(), 'initial is not a permutation');
      assert.notDeepEqual(p.initial, ids, 'sequence starts already solved');
      break;
    }
    case 'UI_MAP_PUZZLE':
      assert.ok(validate.regions(p.layer).some((r) => r.id === p.targetId), `unknown region ${p.targetId}`);
      break;
    case 'UI_BALANCE_SCALE': {
      unique(p.weights.map((w) => w.id), 'weights');
      const balancing = p.weights.filter((w) => Math.abs(w.value - p.left.value) < 1e-9);
      assert.equal(balancing.length, 1, `expected exactly one balancing weight, got ${balancing.length}`);
      break;
    }
    case 'UI_SORTER_BINS':
      assert.ok(p.bins.some((b) => b.id === p.correctBinId), `unknown bin ${p.correctBinId}`);
      break;
    case 'UI_CASH_TRAY': {
      // Subset-sum: the wallet must be able to pay the exact price.
      const reachable = new Set([0]);
      for (const coin of p.wallet) for (const s of [...reachable]) reachable.add(s + coin);
      assert.ok(reachable.has(p.price), `wallet ${p.wallet} cannot make ${p.price}`);
      // Five slots must be five different coins, not a 2 and four 5s.
      unique(p.wallet, 'wallet');
      assert.ok(p.wallet.length >= 4, `wallet has only ${p.wallet.length} coins`);
      break;
    }
    case 'UI_TANGRAM':
      assert.ok(p.pieces.length >= 2, 'tangram needs pieces');
      for (const piece of p.pieces) {
        const half = piece.size / 2;
        // A 'rect' is drawn half as tall as it is wide.
        const halfY = piece.shape === 'rect' ? half / 2 : half;
        assert.ok(piece.x - half >= 0 && piece.x + half <= 100, `piece off canvas (x) in ${p.figure}`);
        assert.ok(piece.y - halfY >= 0 && piece.y + halfY <= 100, `piece off canvas (y) in ${p.figure}`);
      }
      break;
    case 'UI_GRID_AREA':
      assert.ok(p.targetArea >= 1 && p.targetArea <= p.cols * p.rows, `impossible area ${p.targetArea}`);
      break;
    case 'UI_NUMBER_MAZE': {
      assert.equal(p.cells.length, p.cols * p.rows);
      for (let i = 1; i < p.path.length; i += 1) {
        assert.ok(validate.isAdjacent(p.path[i - 1], p.path[i], p.cols), 'maze route is not contiguous');
      }
      const open = p.open ?? [];
      const walkable = new Set([...p.path, ...open]);
      assert.equal(walkable.size, p.path.length + open.length, 'maze corridor overlaps the route');
      // A corridor is a dead end: each of its cells touches the cell it grew
      // from and at most one more, and it never opens a second way through.
      for (const cell of open) {
        const around = [...walkable].filter((c) => validate.isAdjacent(cell, c, p.cols)).length;
        assert.ok(around >= 1 && around <= 2, `maze corridor cell ${cell} has ${around} walkable neighbours`);
      }
      if (p.divisor) {
        p.cells.forEach((value, cell) => {
          assert.equal(value % p.divisor === 0, walkable.has(cell), `maze cell ${cell} (${value}) breaks the rule ÷${p.divisor}`);
        });
      }
      break;
    }
    case 'UI_BUBBLE_POP': {
      assert.ok(p.bubbles.length >= 2 && p.bubbles.length <= 6, `bad bubble count ${p.bubbles.length}`);
      const all = [...p.bubbles, ...(p.extras ?? [])];
      unique(all.map((b) => b.id), 'bubbles');
      for (const b of all) assert.ok(b.label || b.emoji, 'bubble has no face');
      // A decoy must never look like a bubble that has to be popped.
      const faces = new Set(p.bubbles.map((b) => b.label ?? b.emoji));
      for (const x of p.extras ?? []) assert.ok(!faces.has(x.label ?? x.emoji), `decoy ${x.label} repeats a real bubble`);
      break;
    }
    case 'UI_DOT_TO_DOT': {
      assert.ok(p.stars.length >= 4 && p.stars.length <= 15, `bad star count ${p.stars.length}`);
      unique(p.stars.map((s) => s.label), 'star labels');
      for (const s of p.stars) assert.ok(s.label && s.x >= 8 && s.x <= 92 && s.y >= 8 && s.y <= 92, `star ${s.label} off the sky in ${p.figure.name}`);
      assert.ok(validate.minGap(p.stars) >= 12, `stars too close in ${p.figure.name}`);
      if (p.find) {
        assert.ok(p.find.ratio > 1.2, `the stars of ${p.figure.name} are no bigger than the rest`);
        assert.ok(p.find.decoys.length >= 6, `too few other stars around ${p.figure.name}`);
        // No other star so close to one of the figure that a finger could not tell them apart.
        for (const d of p.find.decoys) assert.ok(validate.minGap([d, ...p.stars]) >= 9, `a star of the sky sits on ${p.figure.name}`);
      }
      break;
    }
    case 'UI_COLOR_MIX': {
      const ids = p.paints.map((x) => x.id);
      unique(ids, 'paints');
      assert.ok(p.recipe.length === 2 && p.recipe[0] !== p.recipe[1], 'recipe needs two different paints');
      for (const id of p.recipe) assert.ok(ids.includes(id), `paint ${id} is not on the table`);
      assert.ok(p.paints.length >= 3 && p.paints.length <= 6, `bad paint count ${p.paints.length}`);
      break;
    }
    case 'UI_LETTER_GRID': {
      unique(p.cells.map((c) => c.id), 'letters');
      unique(p.cells.map((c) => c.label), 'letter faces');
      for (const c of p.cells) assert.ok(c.label, 'letter has no face');
      assert.ok(p.cols >= 2 && p.cols <= 7 && p.cells.length >= p.cols, `bad letter table ${p.cells.length} in ${p.cols} columns`);
      unique(p.gaps, 'gaps');
      for (const i of p.gaps) assert.ok(Number.isInteger(i) && i >= 0 && i < p.cells.length, `gap ${i} outside the table`);
      if (p.swapped) {
        const [a, b] = p.swapped;
        assert.ok(a !== b && [a, b].every((i) => Number.isInteger(i) && i >= 0 && i < p.cells.length), `bad swap ${p.swapped}`);
        assert.equal(p.gaps.length, 0, 'a table with swapped letters has no gaps');
      } else {
        assert.ok(p.gaps.length >= 1, 'letter table has nothing to do');
      }
      break;
    }
    default:
      assert.fail(`unknown template ${p.template}`);
  }
}

try {
  await server.ssrLoadModule('/src/games/index.ts');
  const { moduleRegistry } = await server.ssrLoadModule('/src/core/game/kernel/ModuleRegistry.ts');
  const { toGameConfig, tasksPerLevel } = await server.ssrLoadModule('/src/core/game/kernel/gameConfig.ts');
  const { LevelEngine } = await server.ssrLoadModule('/src/core/game/engine/LevelEngine.ts');
  // The same level builder the game uses (new + recalled tasks).
  const { drawCandidates } = await server.ssrLoadModule('/src/components/game/useGameSession.ts');
  const { regionsOf } = await server.ssrLoadModule('/src/core/game/templates/worldMap.ts');
  const { isAdjacent, minGap } = await server.ssrLoadModule('/src/core/game/templates/validate.ts');
  const validate = { regions: regionsOf, isAdjacent, minGap };

  const gameIds = new Set();
  const rows = [];
  for (const module of moduleRegistry.getAll()) {
    for (const sub of module.subCategories) {
      const config = toGameConfig(module, sub);
      assert.ok(!gameIds.has(config.game_id), `duplicate game_id ${config.game_id}`);
      gameIds.add(config.game_id);
      const size = tasksPerLevel(sub);
      // Each game sets its own level length: 5–10 on a path, 5–8 in free play.
      const [minSize, maxSize] = config.progression === 'free' ? [5, 8] : [5, 10];
      assert.ok(size >= minSize && size <= maxSize, `${config.game_id}: steps_count_default ${size} outside ${minSize}–${maxSize}`);

      const steps = config.progression === 'free' ? 1 : (sub.steps ?? 30);
      let minLevel = Infinity;
      for (let step = 1; step <= steps; step += 1) {
        const base = { subCategoryId: sub.id, step, choicesCount: 9 };
        // Three independent draws per step to shake out random edge cases.
        for (let round = 0; round < 3; round += 1) {
          const candidates = drawCandidates(module, base, size, config.progression !== 'free');
          const engine = new LevelEngine({ steps_count_default: size, tasks: candidates });
          minLevel = Math.min(minLevel, engine.total);
          if (engine.total < 3) problems.push(`${config.game_id} step ${step}: only ${engine.total} unique tasks`);
          for (const task of candidates) {
            tasksChecked += 1;
            try {
              assert.ok(task.id && task.prompt, 'task needs id and prompt');
              assert.ok(Number.isInteger(task.reward) && task.reward >= 1, `bad reward ${task.reward}`);
              if (task.payload?.template) checkPayload(task.payload, validate);
              if (module.getHintSpeech) assert.equal(typeof module.getHintSpeech(task), 'string');
              if (Array.isArray(task.outro)) {
                assert.ok(task.outro.length >= 1, 'outro pool is empty');
                assert.equal(new Set(task.outro).size, task.outro.length, 'outro pool repeats a text');
                for (const text of task.outro) assert.ok(!/undefined|null|NaN/.test(text), `broken fact text: ${text}`);
              }
            } catch (err) {
              problems.push(`${config.game_id} step ${step}: ${err.message}`);
            }
          }
        }
      }
      rows.push({ game: config.game_id, stars: `${config.difficulty}–${config.difficulty_max}`, levels: config.progression === 'free' ? '∞ free' : steps, tasks: size, minLevel, template: config.mechanics_type });
    }
  }
  console.table(rows);
} finally {
  await server.close();
}

const distinct = [...new Set(problems)];
console.log(`\n${tasksChecked} tasks checked, ${distinct.length} problem(s)`);
for (const p of distinct.slice(0, 40)) console.log(' ✖', p);
process.exit(distinct.length ? 1 : 0);
