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

const digitSum = (n) => String(Math.abs(n)).split('').reduce((sum, d) => sum + Number(d), 0);
/** Divisors whose rule has already been checked against the numbers themselves. */
const rulesChecked = new Set();

/** The holes a board fills its script with, by the kind of picture it is drawn on — and nothing else. */
const BOARD_HOLES = {
  divisible: ['n', 'times', 'left', 'mark', 'off', 'parted', 'whole'],
  alphabet: ['next', 'N', 'prev', 'P', 'nextId', 'started'],
};
/** What a help may make blink, by the start of its id. */
const FOCUS_KINDS = ['hand', 'slice', 'glyph', 'piece', 'bubble', 'abc', 'cmp', 'div'];
const STRIP_STAGES = ['first', 'second', 'cut', 'total', 'reduced'];
const TONES = ['hour', 'minute', 'day', 'sum'];

/** Every id a part of this task's board answers to, by kind — what a beat may name. */
function partsOf(p) {
  const pieces = [...(p.pieces ?? []), ...(p.stimulus?.pieces ?? [])].map((x) => x.id);
  const bubbles = [...(p.bubbles ?? []), ...(p.extras ?? [])].map((x) => x.id);
  return {
    slice: p.stimulus?.pie ? p.stimulus.pie.denom : 0,
    glyph: p.stimulus?.glyphs ? p.stimulus.glyphs.length : 0,
    piece: new Set(pieces),
    bubble: new Set(bubbles),
  };
}

/** Checks one script: well-formed, every hole filled (or filled by its board), every blinking part real. */
function checkScript(script, p, what, fillScript) {
  assert.ok(Array.isArray(script.beats) && script.beats.length >= 1, `${what}: no beats`);
  const board = script.by === 'board';
  const scene = script.scene;
  const allowed = board ? BOARD_HOLES[scene?.kind] : [];
  assert.ok(!board || allowed, `${what}: a board's script must be drawn on a picture the board knows how to fill`);
  const parts = partsOf(p);
  const letters = scene?.kind === 'alphabet' ? new Set(scene.letters) : null;

  for (const b of script.beats) {
    assert.ok(typeof b.text === 'string' && b.text.trim(), `${what}: an empty beat`);
    assert.ok(!/undefined|null|NaN|\[object/.test(b.text), `${what}: a broken beat «${b.text}»`);
    for (const hole of b.text.match(/\{(\w+)\}/g) ?? []) assert.ok(allowed.includes(hole.slice(1, -1)), `${what}: «${b.text}» has ${hole}, which nothing fills`);
    for (const cond of [b.if, b.unless].filter((c) => c !== undefined)) assert.ok(board && allowed.includes(cond), `${what}: a condition on «${cond}», which nothing fills`);
    if (b.tone !== undefined) assert.ok(TONES.includes(b.tone), `${what}: unknown tone ${b.tone}`);
    if (b.show !== undefined && scene?.kind === 'strips') assert.ok(STRIP_STAGES.includes(b.show), `${what}: the strips have no stage «${b.show}»`);
    for (const id of b.focus ?? []) {
      const [kind, ...rest] = id.split(':');
      const name = rest.join(':');
      assert.ok(FOCUS_KINDS.includes(kind) && name, `${what}: «${id}» names nothing a hint can light`);
      const templated = /\{\w+\}/.test(name);
      if (templated) {
        for (const hole of name.match(/\{(\w+)\}/g)) assert.ok(allowed.includes(hole.slice(1, -1)), `${what}: «${id}» has a hole nothing fills`);
        continue;
      }
      if (kind === 'slice') assert.ok(Number(name) >= 0 && Number(name) < parts.slice, `${what}: «${id}» — the pie has ${parts.slice} slices`);
      if (kind === 'glyph') assert.ok(Number(name) >= 0 && Number(name) < parts.glyph, `${what}: «${id}» — the line has ${parts.glyph} pieces`);
      if (kind === 'piece') assert.ok(parts.piece.has(name), `${what}: «${id}» is not a piece of the figure`);
      if (kind === 'bubble') assert.ok(parts.bubble.has(name), `${what}: «${id}» is not a bubble`);
      if (kind === 'abc') assert.ok(letters?.has(name), `${what}: «${id}» is not in the alphabet strip`);
      if (kind === 'hand') assert.ok(scene?.kind === 'clock' || p.stimulus?.clock, `${what}: «${id}», and there is no clock to blink`);
      if (kind === 'cmp') assert.ok(scene?.kind === 'compare', `${what}: «${id}» without the compare picture`);
      if (kind === 'div') assert.ok(scene?.kind === 'divisible', `${what}: «${id}» without the groups picture`);
    }
  }
  if (script.after?.mistakes !== undefined) assert.ok(Number.isInteger(script.after.mistakes) && script.after.mistakes >= 1, `${what}: help after ${script.after.mistakes} mistakes`);

  // A board's script, once filled in, says everything and keeps no condition.
  if (board) {
    const flags = ['off', 'parted', 'whole', 'started'];
    const sample = Object.fromEntries(allowed.map((h) => [h, flags.includes(h) ? 1 : h === 'N' || h === 'P' ? [...(letters ?? ['A'])][0] : '7']));
    const filled = fillScript(script, sample);
    assert.ok(filled.beats.length >= 1, `${what}: nothing left to say once filled`);
    for (const b of filled.beats) {
      assert.ok(!/\{\w+\}/.test(b.text + (b.focus ?? []).join(' ')), `${what}: «${b.text}» still has a hole once filled`);
      assert.ok(b.if === undefined && b.unless === undefined, `${what}: a filled script keeps its conditions`);
    }
  }
}

/**
 * The pictures a help is drawn on are read by a child as the truth, so each is
 * measured against the task's own answer and against arithmetic.
 */
function checkScene(scene, p, what) {
  switch (scene.kind) {
    case 'strips': {
      const [one, two] = scene.same ? [scene.same.a, scene.same.b] : [scene.a, scene.b];
      assert.equal(one.d, scene.total.d, `${what}: the first fraction is not on the common bottom`);
      assert.equal(two.d, scene.total.d, `${what}: the second fraction is not on the common bottom`);
      assert.equal(scene.op === '+' ? one.n + two.n : one.n - two.n, scene.total.n, `${what}: the coloured parts do not add up`);
      // More than a whole is drawn on a second strip, so only a total of nothing is wrong.
      assert.ok(scene.total.n >= 1, `${what}: ${scene.total.n}/${scene.total.d} colours nothing in`);
      // Re-cutting only cuts the same strip finer — the fraction it stands for does not change.
      if (scene.same) {
        assert.equal(scene.same.a.n * scene.a.d, scene.a.n * scene.same.a.d, `${what}: the first strip changed value when it was re-cut`);
        assert.equal(scene.same.b.n * scene.b.d, scene.b.n * scene.same.b.d, `${what}: the second strip changed value when it was re-cut`);
      }
      // The strips end on the answer the board asks for, and on no simpler one of their own.
      const end = scene.reduced ?? scene.total;
      assert.equal(`${end.n}/${end.d}`, p.correctId, `${what}: the strips end on ${end.n}/${end.d}, and the board wants ${p.correctId}`);
      const shows = p.help.beats.map((b) => b.show);
      assert.deepEqual(shows, STRIP_STAGES.filter((s) => (s !== 'cut' || scene.same) && (s !== 'reduced' || scene.reduced)), `${what}: a beat to every stage of the strips, in order`);
      break;
    }
    case 'divisible': {
      assert.equal(scene.by, p.divisor, `${what}: the help is about a different number than the maze`);
      if (rulesChecked.has(scene.by)) break;
      rulesChecked.add(scene.by);
      // The rule itself must be true of every number, not only of the maze's.
      const upTo = 300;
      switch (scene.how) {
        case 'ending':
          assert.ok(scene.marks.length >= 1 && scene.marks.every((m) => m >= 0 && m <= 9), `÷${scene.by}: ${scene.marks} are not digits`);
          for (let n = 1; n <= upTo; n += 1) assert.equal(n % scene.by === 0, scene.marks.includes(n % 10), `÷${scene.by}: «ends in ${scene.marks}» is wrong about ${n}`);
          break;
        case 'digits':
          for (let n = 1; n <= upTo; n += 1) assert.equal(n % scene.by === 0, digitSum(n) % scene.by === 0, `÷${scene.by}: the sum-of-digits rule is wrong about ${n}`);
          break;
        case 'pair':
          assert.equal(scene.marks.length, 2, `÷${scene.by}: a pair rule needs two numbers`);
          for (let n = 1; n <= upTo; n += 1) assert.equal(n % scene.by === 0, scene.marks.every((m) => n % m === 0), `÷${scene.by}: «divides by ${scene.marks}» is wrong about ${n}`);
          break;
        case 'twice':
          assert.equal(2 ** scene.marks.length, scene.by, `÷${scene.by}: ${scene.marks.length} halvings make ÷${2 ** scene.marks.length}`);
          break;
        case 'count':
          assert.equal(scene.marks.length, 0, `÷${scene.by}: a number counted out has nothing to mark`);
          break;
        default:
          assert.fail(`÷${scene.by}: unknown rule ${scene.how}`);
      }
      break;
    }
    case 'compare': {
      const { left, right, sign } = scene;
      const truth = left.value < right.value ? 'lt' : left.value > right.value ? 'gt' : 'eq';
      assert.equal(sign, truth, `${what}: the bars say ${truth}, the sign ${sign}`);
      assert.equal(sign, p.correctId, `${what}: the picture's sign is not the board's answer`);
      assert.ok(left.value > 0 && right.value > 0, `${what}: a bar of nothing`);
      break;
    }
    case 'alphabet': {
      assert.equal(new Set(scene.letters).size, scene.letters.length, `${what}: a letter twice in the alphabet strip`);
      if (scene.names) assert.equal(scene.names.length, scene.letters.length, `${what}: a name for every letter`);
      for (const b of p.bubbles ?? []) assert.ok(scene.letters.includes(b.label), `${what}: the bubble «${b.label}» is not in the alphabet strip`);
      break;
    }
    case 'clock': {
      const { h, m } = scene.time;
      assert.ok(h >= 1 && h <= 12 && m >= 0 && m < 60 && m % 5 === 0, `${what}: a clock at ${h}:${m}`);
      assert.equal(`${h}:${String(m).padStart(2, '0')}`, p.correctId, `${what}: the help's clock is not the answer's`);
      break;
    }
    default:
      assert.fail(`${what}: unknown scene ${scene.kind}`);
  }
}

/** A task's help and what is read out once it is solved, as scripts. */
function checkHelp(task, fillScript, written) {
  const p = task.payload ?? {};
  for (const old of ['explain', 'bars', 'divisible']) assert.ok(!(old in p), `the payload still carries «${old}» — a help is a script now (payload.help)`);
  if (p.help) {
    checkScript(p.help, p, 'help', fillScript);
    if (p.help.scene) checkScene(p.help.scene, p, `help/${p.help.scene.kind}`);
  }
  if (p.told) {
    assert.ok(p.told.by === undefined && !p.told.scene, 'told: read out over the board, it needs no picture and no board');
    checkScript(p.told, p, 'told', fillScript);
    // It is the outro, part by part — word for word.
    if (typeof task.outro === 'string') assert.equal(p.told.beats.map((b) => written(b.text)).join(' '), written(task.outro), 'told: the parts do not make up the outro');
  }
}

function checkPayload(p, validate) {
  switch (p.template) {
    case 'UI_GRID_CHOICE': {
      const ids = p.options.map((o) => o.id);
      unique(ids, 'options');
      assert.ok(ids.includes(p.correctId), `correctId ${p.correctId} not among options`);
      assert.ok(p.options.length >= 2 && p.options.length <= 9, `bad option count ${p.options.length}`);
      for (const o of p.options) assert.ok(o.emoji || o.label || o.glyphs || o.shape || o.clock || o.swatch, 'option has no face');
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
      assert.ok(p.recipe.length >= 2 && p.recipe.length <= 3 && new Set(p.recipe).size === p.recipe.length, 'recipe needs two or three different paints');
      for (const id of p.recipe) assert.ok(ids.includes(id), `paint ${id} is not on the table`);
      assert.ok(p.paints.length > p.recipe.length && p.paints.length <= 8, `bad paint count ${p.paints.length}`);
      break;
    }
    case 'UI_WORD_SEARCH': {
      const cells = p.cols * p.cols;
      assert.equal(p.letters.length, cells, 'the table is not square');
      assert.ok(p.cols >= 4 && p.cols <= 8, `bad table size ${p.cols}`);
      assert.ok(p.words.length >= 1, 'no words to find');
      unique(p.words.map((w) => w.id), 'words');
      for (const w of p.words) {
        assert.ok(w.emoji, `${w.word} has no picture`);
        assert.equal(w.cells.length, w.word.length, `${w.word} lies on a wrong number of cells`);
        assert.equal(w.cells.map((c) => p.letters[c]).join(''), w.word, `${w.word} is not where it is said to be`);
        // A straight line, one cell at a time.
        const at = (c) => [Math.floor(c / p.cols), c % p.cols];
        const [r0, c0] = at(w.cells[0]);
        const [r1, c1] = at(w.cells[1]);
        const [dr, dc] = [r1 - r0, c1 - c0];
        assert.ok(Math.abs(dr) <= 1 && Math.abs(dc) <= 1 && (dr || dc), `${w.word} does not run in a line`);
        w.cells.forEach((c, i) => assert.deepEqual(at(c), [r0 + dr * i, c0 + dc * i], `${w.word} bends`));
      }
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
  // Facts are paired with the voice's by place among those both languages tell (`tellFact`).
  const { common, written } = await server.ssrLoadModule('/src/core/language/marks.ts');
  const { fillScript } = await server.ssrLoadModule('/src/core/game/hints/script.ts');
  const told = (outro) => [outro ?? []].flat().map(common).filter(Boolean);

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
      // Every language the game is written in is played; the voice speaks the next one of them,
      // so each task is also made a second time — and must come out the same task (its twin).
      const langs = sub.langs ?? ['uk'];
      for (const [at, shown] of langs.entries()) {
      const said = langs[(at + 1) % langs.length];
      const game = `${config.game_id}${langs.length > 1 ? ` [${shown}]` : ''}`;
      let twinless = 0;
      for (let step = 1; step <= steps; step += 1) {
        const base = { subCategoryId: sub.id, step, choicesCount: 9 };
        // Three independent draws per step to shake out random edge cases.
        for (let round = 0; round < 3; round += 1) {
          const candidates = drawCandidates(module, base, size, config.progression !== 'free', { shown, said });
          const engine = new LevelEngine({ steps_count_default: size, tasks: candidates });
          minLevel = Math.min(minLevel, engine.total);
          if (engine.total < 3) problems.push(`${game} step ${step}: only ${engine.total} unique tasks`);
          for (const task of candidates) {
            tasksChecked += 1;
            try {
              assert.ok(task.id && task.prompt, 'task needs id and prompt');
              // A task of its language's own (`task.own`) has no twin by design.
              if (said !== shown && !task.voice && !task.own) twinless += 1;
              // The facts both languages tell must pair one to one; a story of one language alone is marked `own`.
              if (task.voice) {
                const ours = told(task.outro);
                const theirs = told(task.voice.outro);
                assert.equal(theirs.length, ours.length, `facts do not pair with «${said}» (${ours.length} vs ${theirs.length}; mark a story of one language \`own\`): ${String(ours[0] ?? theirs[0]).slice(0, 70)}`);
              }
              // A game in another language has no Ukrainian left in what it says.
              if (shown !== 'uk' && !sub.group) {
                const words = [task.prompt, task.speak, module.getHintSpeech?.(task), ...[task.outro ?? []].flat()].filter(Boolean).join(' ');
                assert.ok(!/[А-Яа-яІіЇїЄєҐґ]/.test(words), `Ukrainian left in a ${shown} task: ${words.slice(0, 90)}`);
              }
              assert.ok(Number.isInteger(task.reward) && task.reward >= 1, `bad reward ${task.reward}`);
              if (task.payload?.template) checkPayload(task.payload, validate);
              checkHelp(task, fillScript, written);
              // A spoken how-to — or nothing at all, because the help is a script the stage says beat by beat.
              if (module.getHintSpeech) {
                const how = module.getHintSpeech(task);
                assert.ok(how === undefined || typeof how === 'string', `bad hint speech ${typeof how}`);
                const scripted = Boolean(task.payload?.help);
                assert.equal(how === undefined, scripted, scripted ? 'a help told as a script must leave the shell quiet' : 'the shell has nothing to say about this task');
              }
              if (Array.isArray(task.outro)) {
                assert.ok(task.outro.length >= 1, 'outro pool is empty');
                assert.equal(new Set(task.outro).size, task.outro.length, 'outro pool repeats a text');
                for (const text of task.outro) assert.ok(!/undefined|null|NaN/.test(text), `broken fact text: ${text}`);
              }
            } catch (err) {
              problems.push(`${game} step ${step}: ${err.message}`);
            }
          }
        }
      }
      if (twinless > 0) problems.push(`${game}: ${twinless} task(s) came out differently in «${said}» — the voice cannot follow them`);
      }
      rows.push({ game: config.game_id, langs: langs.join(' '), stars: `${config.difficulty}–${config.difficulty_max}`, levels: config.progression === 'free' ? '∞ free' : steps, tasks: size, minLevel, template: config.mechanics_type });
    }
  }
  console.table(rows);
} finally {
  await server.close();
}

const distinct = [...new Set(problems)];
console.log(`\n${tasksChecked} tasks checked, ${distinct.length} problem(s)`);
for (const p of distinct.slice(0, Number(process.env.SHOW_PROBLEMS ?? 40))) console.log(' ✖', p);
process.exit(distinct.length ? 1 : 0);
