/**
 * What is offered where — the owner's rules, set on `/admin/availability` and
 * kept as one setting (`wk_settings`, key `availability`). Pure: no database
 * and no request here (tested in `tests/availability.test.js`).
 *
 *   regions    named groups of countries, to say «North America» once
 *   langRules  in these places only these languages are offered — on the site
 *              and in the game, each with a list of its own. The first rule
 *              that names the visitor's place decides; no rule — every language.
 *   items      a game (`game:<module>:<sub>`) or a whole galaxy (`galaxy:<id>`):
 *              its status everywhere (`on` / `soon` / `hidden`) and where it is
 *              there at all (`all`, `only` in the places listed, or everywhere
 *              `except` them).
 *
 * A place is a country (`US`, ISO 3166-1 alpha-2) or a region (`@north-america`).
 * A visitor whose country is not known is in no place: no language rule
 * applies to them, and what is offered `only` somewhere is not offered to them.
 */

export const STATUSES = ['on', 'soon', 'hidden'];
export const SCOPES = ['all', 'only', 'except'];

const COUNTRY = /^[A-Z]{2}$/;
const REGION_ID = /^[a-z0-9][a-z0-9_-]{1,29}$/;
const LANG = /^[a-z]{2}$/;
const ITEM = /^(game:[\w-]{1,40}:[\w-]{1,60}|galaxy:[\w-]{1,40})$/;

export const EMPTY = { regions: [], langRules: [], items: {} };

const unique = (list) => [...new Set(list)];

function countries(raw) {
  if (!Array.isArray(raw)) return [];
  return unique(raw.map((code) => String(code).trim().toUpperCase()).filter((code) => COUNTRY.test(code))).slice(0, 250);
}

function langs(raw) {
  if (!Array.isArray(raw)) return [];
  return unique(raw.map((code) => String(code).trim().toLowerCase()).filter((code) => LANG.test(code))).slice(0, 20);
}

/** Places as they are written in a rule: countries, and regions that exist. */
function places(raw, regionIds) {
  if (!Array.isArray(raw)) return [];
  const kept = raw
    .map((place) => String(place).trim())
    .map((place) => (place.startsWith('@') ? place.toLowerCase() : place.toUpperCase()))
    .filter((place) => (place.startsWith('@') ? regionIds.has(place.slice(1)) : COUNTRY.test(place)));
  return unique(kept).slice(0, 300);
}

/** The rules as the admin panel sends them, with everything odd dropped. Never throws. */
export function cleanAvailability(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};

  const regions = [];
  for (const region of Array.isArray(source.regions) ? source.regions.slice(0, 50) : []) {
    const id = typeof region?.id === 'string' ? region.id.trim().toLowerCase() : '';
    const name = typeof region?.name === 'string' ? region.name.trim().slice(0, 60) : '';
    if (!REGION_ID.test(id) || !name || regions.some((r) => r.id === id)) continue;
    regions.push({ id, name, countries: countries(region.countries) });
  }
  const regionIds = new Set(regions.map((r) => r.id));

  const langRules = [];
  for (const rule of Array.isArray(source.langRules) ? source.langRules.slice(0, 50) : []) {
    const where = places(rule?.where, regionIds);
    const site = langs(rule?.site);
    const game = langs(rule?.game);
    // A rule that names no place, or leaves no language anywhere, says nothing.
    if (where.length === 0 || (site.length === 0 && game.length === 0)) continue;
    langRules.push({ where, site, game });
  }

  const items = {};
  for (const [key, item] of Object.entries(source.items && typeof source.items === 'object' ? source.items : {}).slice(0, 500)) {
    if (!ITEM.test(key) || !item || typeof item !== 'object') continue;
    const status = STATUSES.includes(item.status) ? item.status : 'on';
    const where = places(item.where, regionIds);
    // «Only» or «except» with no place listed is «everywhere».
    const scope = SCOPES.includes(item.scope) && where.length > 0 ? item.scope : 'all';
    // What is as it would be without a rule is not written down.
    if (status === 'on' && scope === 'all') continue;
    items[key] = { status, scope, where: scope === 'all' ? [] : where };
  }

  return { regions, langRules, items };
}

/** Is `country` one of these places? */
function isIn(country, where, regions) {
  if (!country) return false;
  return where.some((place) => (place.startsWith('@') ? regions.get(place.slice(1))?.includes(country) : place === country));
}

/**
 * The rules as they stand for a visitor from `country` — what the site and the
 * game are told (`GET /api/health`):
 *
 *   langs.site / langs.game   the languages offered, or null — all of them
 *   games / galaxies          the keys that are `hidden`, and those that are `soon`
 */
export function availabilityFor(config, country) {
  const regions = new Map(config.regions.map((region) => [region.id, region.countries]));
  const rule = config.langRules.find((r) => isIn(country, r.where, regions));
  const out = {
    langs: { site: rule?.site.length ? rule.site : null, game: rule?.game.length ? rule.game : null },
    games: { hidden: [], soon: [] },
    galaxies: { hidden: [], soon: [] },
  };
  for (const [key, item] of Object.entries(config.items)) {
    const here = item.scope === 'all' || (item.scope === 'only' ? isIn(country, item.where, regions) : !isIn(country, item.where, regions));
    const state = !here || item.status === 'hidden' ? 'hidden' : item.status;
    if (state === 'on') continue;
    const [kind, ...rest] = key.split(':');
    out[kind === 'galaxy' ? 'galaxies' : 'games'][state].push(rest.join(':'));
  }
  return out;
}
