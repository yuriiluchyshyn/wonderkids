// The list of galaxies and games, written into the two content skills.
//
// `.claude/skills/game-task-pack` (making a new game's content) and
// `.claude/skills/game-pack-import` (building the game from it) both carry the
// list of what Pulsar Kids already has, so the author can place a new game
// without repeating an old one. The list is GENERATED from the catalogue
// (`packages/catalog/src/uk.json`, made by `scripts/catalog.mjs`) and from the
// galaxies still to come (`src/core/game/galaxies.ts`), between the markers
// below — never edited by hand. `npm run catalog` runs this after the catalogue.
//
//   node scripts/skills-catalog.mjs           write the list into both skills
//   node scripts/skills-catalog.mjs --check   fail if either is stale
import { readFileSync, writeFileSync } from 'node:fs';

const START = '<!-- catalog:start -->';
const END = '<!-- catalog:end -->';
const SKILLS = ['game-task-pack', 'game-pack-import'].map((name) => new URL(`../../.claude/skills/${name}/SKILL.md`, import.meta.url));

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const catalog = JSON.parse(read('../../packages/catalog/src/uk.json'));
const common = JSON.parse(read('../src/locales/app/uk/common.json'));

/** Galaxies the hub shows as «coming soon»: no module, so the catalogue does not know them. */
function comingSoon() {
  const source = read('../src/core/game/galaxies.ts');
  const soon = [...source.matchAll(/\{ id: '([\w-]+)', icon: '([^']+)', comingSoon: true/g)];
  return soon.map(([, id, icon]) => `${icon} ${common.galaxy?.[id] ?? id} (\`${id}\`)`);
}

const stars = ([low, high]) => (low === high ? `${low}` : `${low}–${high}`);
const cell = (text) => String(text ?? '').replaceAll('|', '\\|');

function list() {
  const games = catalog.reduce((sum, galaxy) => sum + galaxy.games.length, 0);
  const lines = [`Розділів (галактик): ${catalog.length}, ігор: ${games}. Мова назв — українська.`];
  for (const galaxy of catalog) {
    lines.push('', `**${galaxy.icon} ${galaxy.title}** (\`${galaxy.id}\`, ігор: ${galaxy.games.length})`, '');
    lines.push('| Гра | id | Вид | Рівнів | ★ | Дошки | Про що |', '| --- | --- | --- | --- | --- | --- | --- |');
    for (const game of galaxy.games) {
      const path = game.kind === 'path';
      const boards = game.mechanics.map((m) => m.replace(/^UI_/, '')).join(', ');
      lines.push(`| ${game.icon} ${cell(game.title)} | \`${game.sub}\` | ${path ? 'шлях' : 'вільна'} | ${path ? game.steps : '—'} | ${stars(game.stars)} | ${boards} | ${cell(game.blurb)} |`);
    }
  }
  const soon = comingSoon();
  if (soon.length) lines.push('', `Ще без ігор («Скоро» в хабі): ${soon.join(', ')}.`);
  return lines.join('\n');
}

const block = `${START}\n${list()}\n${END}`;
const check = process.argv.includes('--check');
let stale = false;
for (const url of SKILLS) {
  const text = readFileSync(url, 'utf8');
  const at = text.indexOf(START);
  const end = text.indexOf(END);
  if (at < 0 || end < at) throw new Error(`${url.pathname}: no ${START} … ${END} block`);
  const next = text.slice(0, at) + block + text.slice(end + END.length);
  if (next === text) continue;
  stale = true;
  if (!check) writeFileSync(url, next);
}
if (check && stale) {
  console.error('The list of games in the skills is stale: run `node scripts/skills-catalog.mjs`.');
  process.exit(1);
}
