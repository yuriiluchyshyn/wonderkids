import { CATALOG_LANGS, agesOf, gameSlug, loadCatalog, type CatalogGalaxy, type CatalogGame, type CatalogSample } from '@pulsar/catalog';
import { createTranslator, type Params } from '@pulsar/i18n';
import { GAME_PARAM, TRIAL_PATH, VIA_PARAM, type PublicUrls, type VisitVia } from '@pulsar/platform';
import { DEFAULT_LANG, SITE_LANGS, sitePath, type SiteLang } from '../src/languages.ts';
import type { Dictionaries } from './pages.ts';

/**
 * A page for every game — and for every galaxy, and one that lists them all.
 *
 * A parent does not search for «learning games»: they search for «multiplication
 * game», «flags of the world for kids», «gry matematyczne klasa 1». Each game
 * gets an address of its own that answers such a search and opens THAT game
 * with no sign-up (`play.…/try?game=<id>&via=page`):
 *
 *   /games/                 every galaxy and its games
 *   /games/math/            the games of one galaxy
 *   /games/math/add/        one game
 *
 * and the same under `/en/` and `/pl/`. Nothing here is written by hand: the
 * games come from `@pulsar/catalog` — the game's own catalogue, with three
 * real tasks of every game (from the first, the middle and the last step), which is
 * what makes one page unlike another — and the words around them from the
 * site's dictionary (`catalog.*`). A game whose card says little may have a
 * paragraph of its own there, `catalog.about.<module>.<sub>`: what it teaches
 * and how it grows, told to a parent — every number in it must be the game's. `pages.ts` stands each page in the template
 * `games.html`; `seo.ts` lists them in `sitemap.xml` and `llms.txt`.
 *
 * A page exists in a language only when the game is written in it, and names
 * as its other languages only those that have it too.
 */
export const GAMES_SLUG = 'games/';

const BRAND = ' — Pulsar Kids';
const TITLE_ROOM = 64;
/** How many other games of its galaxy a game's page leads to. */
const NEIGHBOURS = 4;

export type GamesPageKind = 'index' | 'galaxy' | 'game';

export interface GamesPage {
  kind: GamesPageKind;
  /** Its address under a language's main page: `'games/math/add/'`. */
  slug: string;
  /** The languages this page exists in. */
  langs: SiteLang[];
  title: string;
  description: string;
  /** The page's own content, as HTML. */
  body: string;
  /** Its structured data: the nodes of a JSON-LD `@graph`. */
  ld: object[];
  /** The same content as Markdown, served beside the page as `index.md`. */
  markdown: string;
  /** What `llms.txt` says of it: a name and a line. */
  name: string;
  line: string;
  /**
   * Whether search engines are asked to list it. A game's page that says
   * mostly what the next one says too (`alike` above `ALIKE_LIMIT`) is built
   * and linked to, but marked `noindex` and kept out of `sitemap.xml`: a
   * search engine that meets look-alike pages thinks less of the whole site.
   * It comes back by itself once the game has more of its own to show — a
   * longer blurb, an intro, tasks that differ.
   */
  index: boolean;
  /** The share of what the page says that the next game's page says too: 0…1. */
  alike: number;
}

/** A game's page must be its own for more than this share of its text. */
export const ALIKE_LIMIT = 0.6;

/** What a reader reads on a page of games, piece by piece — without the ways on to other games, which are not what the page says. */
const said = (body: string): string[] =>
  body
    .replace(/<section class="more">[\s\S]*?<\/section>/g, '')
    .replace(/<[^>]+>/g, '\n')
    .split('\n')
    .map((piece) => piece.trim())
    .filter(Boolean);

/** The share of `page`'s text that `other` has too. */
export function alikeness(page: string, other: string): number {
  const theirs = new Set(said(other));
  const own = said(page);
  const length = (pieces: string[]): number => pieces.reduce((sum, piece) => sum + piece.length, 0);
  return length(own.filter((piece) => theirs.has(piece))) / Math.max(1, length(own));
}

export const galaxySlug = (galaxy: string): string => `${GAMES_SLUG}${gameSlug(galaxy)}/`;
export const gamePageSlug = (galaxy: string, sub: string): string => `${galaxySlug(galaxy)}${gameSlug(sub)}/`;

const esc = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** A card's line ends like a sentence. */
const sentence = (text: string): string => (/[.!?…]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`);

/** Where the trial game opens in one game: the link a page's button carries (a visitor without scripts gets there too). */
export const trialOfGame = (play: string, id: string): string => `${play}${TRIAL_PATH}?${GAME_PARAM}=${encodeURIComponent(id)}&${VIA_PARAM}=${'page' satisfies VisitVia}`;

const CATALOGS = Object.fromEntries(CATALOG_LANGS.map((lang) => [lang, loadCatalog(lang)])) as Record<SiteLang, CatalogGalaxy[]>;

/** The languages a game — or a galaxy — is written in. */
const langsOf = (has: (galaxies: CatalogGalaxy[]) => boolean): SiteLang[] => SITE_LANGS.filter((lang) => has(CATALOGS[lang]));

/** How many games a language has — what the site's own numbers must agree with. */
export const catalogNumbers = (lang: SiteLang): { games: number; galaxies: number; steps: number; perGalaxy: Record<string, number> } => {
  const galaxies = CATALOGS[lang];
  const games = galaxies.flatMap((galaxy) => galaxy.games);
  return { games: games.length, galaxies: galaxies.length, steps: games.reduce((sum, game) => sum + game.steps, 0), perGalaxy: Object.fromEntries(galaxies.map((galaxy) => [galaxy.id, galaxy.games.length])) };
};

/** Every page of games in `lang`. */
export function gamesPages(lang: SiteLang, urls: PublicUrls, dictionaries: Dictionaries): GamesPage[] {
  const translate = createTranslator<string, SiteLang>(dictionaries, DEFAULT_LANG);
  const known = translate.keys();
  const t = (key: string, params?: Params): string => {
    if (!known.has(`catalog.${key}`)) throw new Error(`build/games.ts asks for «catalog.${key}», which the site's dictionary does not have`);
    return translate(lang, `catalog.${key}`, params);
  };
  const galaxies = CATALOGS[lang];
  const home = `/${sitePath(lang)}`;
  const at = (slug: string): string => `${home}${slug}`;
  const absolute = (slug: string): string => `${urls.site}${at(slug)}`;
  const website = { '@id': `${urls.site}/#website` };
  const organization = { '@id': `${urls.site}/#organization` };

  /** The way back up, on the page and in the structured data. */
  const crumbs = (trail: [name: string, slug: string | null][]): { html: string; ld: object } => {
    const steps: [string, string | null][] = [[t('home'), ''], ...trail];
    return {
      html: `<nav class="crumbs" aria-label="${esc(translate(lang, 'header.navLabel'))}">${steps.map(([name, slug]) => (slug === null ? `<span aria-current="page">${esc(name)}</span>` : `<a href="${at(slug)}"${slug === '' ? ' data-home' : ''}>${esc(name)}</a>`)).join(' › ')}</nav>`,
      ld: { '@type': 'BreadcrumbList', itemListElement: steps.map(([name, slug], i) => ({ '@type': 'ListItem', position: i + 1, name, ...(slug === null ? {} : { item: absolute(slug) }) })) },
    };
  };

  const ages = (games: CatalogGame[]): [number, number] => [Math.min(...games.map((game) => agesOf(game)[0])), Math.max(...games.map((game) => agesOf(game)[1]))];
  const size = (game: CatalogGame): string => (game.kind === 'path' ? t('sizePath', { steps: game.steps }) : game.tasks ? t('sizeFree', { tasks: game.tasks }) : t('sizeFreePlain'));
  /** A search result shows about sixty characters of a title: the name closes it while it fits, and gives way when it does not. */
  const titled = (title: string): string => (title.length + BRAND.length <= TITLE_ROOM ? title + BRAND : title);

  /**
   * A game as a card: where it is listed — on its galaxy's page, on the page of all games, beside
   * another game. The pictogram stands beside the words, not above them (`games.css`, `.card-game`),
   * so the card is a row shorter and a phone shows more of the list at once.
   */
  const card = (galaxy: CatalogGalaxy, game: CatalogGame, hidden = false): string => {
    const [from, to] = agesOf(game);
    return `<article class="card card-game"${hidden ? ' hidden' : ''}><div class="icon emoji" aria-hidden="true">${esc(game.icon)}</div><div class="card-body"><h3><a href="${at(gamePageSlug(galaxy.id, game.sub))}">${esc(game.title)}</a></h3><p>${esc(sentence(game.blurb))}</p><span class="tag">${esc(t('agesValue', { from, to }))}</span></div></article>`;
  };

  const tryButton = (id: string): string =>
    `<div class="try"><a class="btn btn-try" data-portal="play" data-trial href="${esc(trialOfGame(urls.play, id))}"><span class="emoji" aria-hidden="true">🚀</span> ${esc(t('try'))}</a><p class="try-note"><span class="emoji" aria-hidden="true">✅</span> ${esc(t('tryNote'))}</p></div>`;

  const sampleCard = (task: CatalogSample): string => {
    const answers = task.answers
      ? `<p class="task-label">${esc(t('answers'))}</p><ul class="answers">${task.answers.map((answer) => `<li${answer === task.right ? ' class="right"' : ''}>${esc(answer)}${answer === task.right ? ' ✓' : ''}</li>`).join('')}</ul>`
      : task.right
        ? `<p class="task-label">${esc(t('right'))}</p><ul class="answers"><li class="right">${esc(task.right)} ✓</li></ul>`
        : task.board
          ? `<p class="task-label">${esc(t('board'))}</p><ul class="answers">${task.board.map((thing) => `<li>${esc(thing)}</li>`).join('')}</ul>`
          : '';
    // Which step of the path a task came from is the game's own business — the card shows the task itself.
    return `<article class="card task"><p class="task-text">${esc(task.prompt)}</p>${answers}</article>`;
  };

  const gamePage = (galaxy: CatalogGalaxy, game: CatalogGame): GamesPage => {
    const [from, to] = agesOf(game);
    const slug = gamePageSlug(galaxy.id, game.sub);
    const langs = langsOf((all) => all.some((other) => other.games.some((candidate) => candidate.id === game.id)));
    const trail = crumbs([[t('all'), GAMES_SLUG], [galaxy.title, galaxySlug(galaxy.id)], [game.title, null]]);
    const stars = game.stars[0] === game.stars[1] ? t('difficultyValue', { stars: game.stars[0] }) : t('difficultyRange', { from: game.stars[0], to: game.stars[1] });
    // On the page the stars themselves, as the game's cards draw them; in words for a screen reader and in the Markdown.
    const starsHtml = `<span class="stars" role="img" aria-label="${esc(stars)}">${[1, 2, 3].map((n) => `<span class="${n <= game.stars[0] ? 'on' : n <= game.stars[1] ? 'half' : 'off'}" aria-hidden="true">★</span>`).join('')}</span>`;
    const shownAs: Record<string, string> = { [t('difficulty')]: starsHtml };
    const facts: [string, string][] = [
      [t('ages'), t('agesValue', { from, to })],
      [t('difficulty'), stars],
      [t('size'), size(game)],
      [t('level'), t('levelValue', { count: game.tasksPerLevel })],
      [t('how'), game.mechanics.map((id) => t(`mechanics.${id}`)).join('; ')],
      ...(game.set ? [[t('set'), game.set] as [string, string]] : []),
      [t('langs'), langs.map((code) => t(`langNames.${code}`)).join(', ')],
    ];
    // The games that follow it in its galaxy, round the ring: every page leads to others, and no two to the same four.
    const here = galaxy.games.indexOf(game);
    // Without a script these are the ones shown (no two pages lead to the same four); a script draws others at random.
    const others = Array.from({ length: galaxy.games.length - 1 }, (_, i) => galaxy.games[(here + 1 + i) % galaxy.games.length]);
    const blurb = game.blurb.replace(/[.!?…]$/, '');
    // What a parent is told about the game beyond its card — written for the site (`catalog.about.<module>.<sub>`), where a game has it.
    const aboutKey = `about.${game.id.replace(':', '.')}`;
    const about = known.has(`catalog.${aboutKey}`) ? t(aboutKey) : '';
    const description = t('gameDescription', { game: game.title, galaxy: galaxy.title, from, to, blurb: blurb.charAt(0).toLocaleLowerCase(lang) + blurb.slice(1) });
    const body = [
      trail.html,
      `<h1><small class="eyebrow">${esc(t('gameEyebrow', { galaxy: galaxy.title, from, to }))}</small> <span class="emoji" aria-hidden="true">${esc(game.icon)}</span> ${esc(game.title)}</h1>`,
      `<p class="lead">${esc(sentence(game.blurb))}</p>`,
      about ? `<p class="about">${esc(about)}</p>` : '',
      tryButton(game.id),
      `<section><h2>${esc(t('samples'))}</h2><p class="sub">${esc(t('samplesLead'))}</p><div class="grid">${game.samples.map((task) => sampleCard(task)).join('')}</div></section>`,
      game.intro ? `<section><h2>${esc(t('tells'))}</h2><blockquote class="tells">${esc(game.intro)}</blockquote></section>` : '',
      `<section><h2>${esc(t('facts'))}</h2><dl class="facts">${facts.map(([name, value]) => `<div><dt>${esc(name)}</dt><dd>${shownAs[name] ?? esc(value)}</dd></div>`).join('')}</dl></section>`,
      // Every other game of the galaxy is built into the page; a visitor's script shows a few of them, drawn anew each visit (`inner.ts`).
      others.length > 0 ? `<section class="more"><h2>${esc(t('more', { galaxy: galaxy.title }))}</h2><div class="grid" data-shuffle="${NEIGHBOURS}">${others.map((other, i) => card(galaxy, other, i >= NEIGHBOURS)).join('')}</div></section>` : '',
    ].join('\n');
    const markdown = [
      `# ${game.title}`,
      '',
      `> ${t('gameEyebrow', { galaxy: galaxy.title, from, to })}`,
      '',
      sentence(game.blurb),
      ...(about ? ['', about] : []),
      ...(game.intro ? ['', game.intro] : []),
      '',
      `## ${t('facts')}`,
      '',
      ...facts.map(([name, value]) => `- **${name}**: ${value}`),
      '',
      `## ${t('samples')}`,
      '',
      ...game.samples.map((task) => `- ${task.prompt}${task.right ? ` — ${t('right')}: ${task.right}` : task.board ? ` — ${t('board')}: ${task.board.join(', ')}` : ''}`),
      '',
      `[${t('try')}](${trialOfGame(urls.play, game.id)}) — ${t('tryNote')}`,
      '',
    ].join('\n');
    return {
      kind: 'game',
      slug,
      langs,
      title: titled(t('gameMetaTitle', { game: game.title, galaxy: galaxy.title, from, to })),
      description,
      body,
      markdown,
      name: game.title,
      line: sentence(game.blurb),
      index: true,
      alike: 0,
      ld: [
        {
          '@type': 'LearningResource',
          '@id': `${absolute(slug)}#game`,
          name: game.title,
          description: sentence(game.blurb),
          url: absolute(slug),
          inLanguage: lang,
          learningResourceType: 'Game',
          interactivityType: 'active',
          typicalAgeRange: `${from}-${to}`,
          teaches: galaxy.title,
          isFamilyFriendly: true,
          audience: { '@type': 'EducationalAudience', educationalRole: 'student' },
          image: `${urls.site}/og-image.png`,
          isPartOf: website,
          provider: organization,
        },
        trail.ld,
      ],
    };
  };

  const galaxyPage = (galaxy: CatalogGalaxy): GamesPage => {
    const [from, to] = ages(galaxy.games);
    const slug = galaxySlug(galaxy.id);
    const trail = crumbs([[t('all'), GAMES_SLUG], [galaxy.title, null]]);
    const others = galaxies.filter((other) => other.id !== galaxy.id);
    const lead = t('galaxyLead', { count: galaxy.games.length, galaxy: galaxy.title });
    const body = [
      trail.html,
      `<h1><span class="emoji" aria-hidden="true">${esc(galaxy.icon)}</span> ${esc(t('galaxyTitle', { galaxy: galaxy.title, from, to }))}</h1>`,
      `<p class="lead">${esc(lead)}</p>`,
      `<section><div class="grid">${galaxy.games.map((game) => card(galaxy, game)).join('')}</div></section>`,
      `<section class="more"><h2>${esc(t('otherGalaxies'))}</h2><p class="galaxies">${others.map((other) => `<a href="${at(galaxySlug(other.id))}"><span class="emoji" aria-hidden="true">${esc(other.icon)}</span> ${esc(other.title)}</a>`).join(' ')}</p></section>`,
    ].join('\n');
    return {
      kind: 'galaxy',
      slug,
      langs: langsOf((all) => all.some((other) => other.id === galaxy.id)),
      title: titled(t('galaxyMetaTitle', { galaxy: galaxy.title, from, to })),
      description: t('galaxyDescription', { galaxy: galaxy.title, from, to, games: galaxy.games.slice(0, 4).map((game) => game.title).join(', ') }),
      body,
      markdown: [`# ${t('galaxyTitle', { galaxy: galaxy.title, from, to })}`, '', lead, '', ...galaxy.games.map((game) => `- [${game.title}](${absolute(gamePageSlug(galaxy.id, game.sub))}): ${sentence(game.blurb)}`), ''].join('\n'),
      name: galaxy.title,
      line: t('gamesCount', { count: galaxy.games.length }),
      index: true,
      alike: 0,
      ld: [
        {
          '@type': 'CollectionPage',
          '@id': `${absolute(slug)}#webpage`,
          name: t('galaxyTitle', { galaxy: galaxy.title, from, to }),
          url: absolute(slug),
          inLanguage: lang,
          isPartOf: website,
          mainEntity: { '@type': 'ItemList', itemListElement: galaxy.games.map((game, i) => ({ '@type': 'ListItem', position: i + 1, name: game.title, url: absolute(gamePageSlug(galaxy.id, game.sub)) })) },
        },
        trail.ld,
      ],
    };
  };

  const indexPage = (): GamesPage => {
    const count = galaxies.reduce((sum, galaxy) => sum + galaxy.games.length, 0);
    const trail = crumbs([[t('all'), null]]);
    const lead = t('indexLead', { games: t('gamesCount', { count }) });
    const body = [
      trail.html,
      `<h1>${esc(t('indexTitle'))}</h1>`,
      `<p class="lead">${esc(lead)}</p>`,
      // A galaxy at a time; its heading stays under the bar while its games scroll by (`games.css`, `.galaxy > h2`).
      ...galaxies.map((galaxy) => `<section class="galaxy"><h2><span class="emoji" aria-hidden="true">${esc(galaxy.icon)}</span> <a href="${at(galaxySlug(galaxy.id))}">${esc(galaxy.title)}</a> <small>${esc(t('gamesCount', { count: galaxy.games.length }))}</small></h2><div class="grid">${galaxy.games.map((game) => card(galaxy, game)).join('')}</div></section>`),
    ].join('\n');
    return {
      kind: 'index',
      slug: GAMES_SLUG,
      langs: [...SITE_LANGS],
      title: titled(t('indexMetaTitle')),
      description: t('indexDescription'),
      body,
      markdown: [`# ${t('indexTitle')}`, '', lead, ...galaxies.flatMap((galaxy) => ['', `## ${galaxy.title}`, '', ...galaxy.games.map((game) => `- [${game.title}](${absolute(gamePageSlug(galaxy.id, game.sub))}): ${sentence(game.blurb)}`)]), ''].join('\n'),
      name: t('all'),
      line: t('gamesCount', { count }),
      index: true,
      alike: 0,
      ld: [
        {
          '@type': 'CollectionPage',
          '@id': `${absolute(GAMES_SLUG)}#webpage`,
          name: t('indexTitle'),
          url: absolute(GAMES_SLUG),
          inLanguage: lang,
          isPartOf: website,
          mainEntity: { '@type': 'ItemList', itemListElement: galaxies.map((galaxy, i) => ({ '@type': 'ListItem', position: i + 1, name: galaxy.title, url: absolute(galaxySlug(galaxy.id)) })) },
        },
        trail.ld,
      ],
    };
  };

  const pages = [indexPage(), ...galaxies.flatMap((galaxy) => [galaxyPage(galaxy), ...galaxy.games.map((game) => gamePage(galaxy, game))])];
  // Each game's page is measured against the next game's: what is mostly a copy is not offered to search engines.
  const games = pages.filter((page) => page.kind === 'game');
  for (const [at, page] of games.entries()) {
    page.alike = alikeness(page.body, games[(at + 1) % games.length].body);
    page.index = page.alike <= ALIKE_LIMIT;
  }
  return pages;
}
