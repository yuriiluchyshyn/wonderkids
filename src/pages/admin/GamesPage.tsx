import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GALAXIES } from '@/core/galaxies';
import { moduleRegistry } from '@/core/kernel/ModuleRegistry';
import { difficultyRange, gameStatus, isFreePlay, tasksPerLevel, toGameConfig } from '@/core/kernel/gameConfig';
import type { LearningModule, MechanicsType, SubCategory } from '@/core/kernel/types';
import { taskKey } from '@/core/engine/LevelEngine';
import { subSteps } from '@/core/progress/path';
import { formatDate } from './shared';
import styles from './Admin.module.css';

const MECHANICS: Record<MechanicsType, string> = {
  UI_GRID_CHOICE: 'Вибір відповіді',
  UI_DRAG_MATCH: 'Перетягування',
  UI_CHRONO_SEQUENCE: 'Розставити по порядку',
  UI_MAP_PUZZLE: 'Карта',
  UI_BALANCE_SCALE: 'Ваги',
  UI_SORTER_BINS: 'Сортування',
};

/** Draws per step when a game can only be counted by playing its generator. */
const SAMPLES_PER_STEP = 80;

interface GameRow {
  module: LearningModule;
  sub: SubCategory;
  gameId: string;
  free: boolean;
  steps: number;
  stars: string;
  perLevel: number;
  /** Different tasks in the whole game. */
  tasks: number;
  /** Fewest / most different tasks available on one step. */
  perStep: [number, number];
  /** Counted by sampling a random generator — a lower bound. */
  estimated: boolean;
}

/**
 * Everything here is read from the live module registry — the same objects
 * the hub and the game shell use — so a game added under `src/modules` shows
 * up by itself, with nothing to keep in sync.
 */
function describe(module: LearningModule, sub: SubCategory): GameRow {
  const free = isFreePlay(sub);
  const steps = subSteps(sub);
  const [min, max] = difficultyRange(sub);
  const counts: number[] = [];
  let tasks = 0;
  let estimated = false;

  if (module.tasksAt) {
    for (let step = 1; step <= steps; step += 1) counts.push(module.tasksAt(sub.id, step));
    // A content pool only grows, so the last step holds the whole game.
    tasks = Math.max(...counts);
  } else {
    estimated = true;
    const all = new Set<string>();
    for (let step = 1; step <= steps; step += 1) {
      const here = new Set<string>();
      for (let index = 0; index < SAMPLES_PER_STEP; index += 1) {
        const key = taskKey(module.generateTask({ subCategoryId: sub.id, step, index, choicesCount: 9 }));
        here.add(key);
        all.add(key);
      }
      counts.push(here.size);
    }
    tasks = all.size;
  }

  return {
    module,
    sub,
    gameId: toGameConfig(module, sub).game_id,
    free,
    steps,
    stars: min === max ? '★'.repeat(min) : `${'★'.repeat(min)}–${'★'.repeat(max)}`,
    perLevel: tasksPerLevel(sub),
    tasks,
    perStep: [Math.min(...counts), Math.max(...counts)],
    estimated,
  };
}

const mechanicsOf = (sub: SubCategory) =>
  (Array.isArray(sub.mechanics) ? sub.mechanics : sub.mechanics ? [sub.mechanics] : []).map((m) => MECHANICS[m]).join(', ') || '—';

/**
 * `/admin/games` — a live summary of every game: its kind, how long its path
 * is, its difficulty band and how many different tasks it can ask.
 */
export function GamesPage() {
  const galaxies = useMemo(
    () =>
      GALAXIES.map((galaxy) => {
        const module = galaxy.moduleId ? moduleRegistry.get(galaxy.moduleId) : undefined;
        return { galaxy, rows: module ? module.subCategories.map((sub) => describe(module, sub)) : [] };
      }),
    [],
  );
  const rows = galaxies.flatMap((g) => g.rows);
  const sum = (pick: (row: GameRow) => number) => rows.reduce((n, row) => n + pick(row), 0);
  const anyEstimated = rows.some((r) => r.estimated);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/admin" className={styles.btn}>
          ← Акаунти
        </Link>
        <h1>🎮 Ігри</h1>
        <div className={styles.totals}>
          <span>🌌 Галактик: {galaxies.filter((g) => g.rows.length > 0).length}</span>
          <span>🎮 Ігор: {rows.length}</span>
          <span>🪜 Сходинок: {sum((r) => (r.free ? 0 : r.steps))}</span>
          <span>
            🧩 Завдань: {sum((r) => r.tasks)}
            {anyEstimated && '+'}
          </span>
        </div>
      </header>

      <p className={styles.gamesNote}>
        Сторінка будується з реєстру ігрових модулів (<code>src/modules</code>) у момент відкриття — тут немає
        списку, який треба оновлювати вручну. «Завдань» — це кількість різних запитань у грі. Для ігор, де завдання
        створює генератор (позначені «≈»), число отримано пробними запусками, тому справжнє — не менше за показане.
      </p>

      {galaxies.map(({ galaxy, rows: games }) => (
        <section key={galaxy.id} className={styles.gamesSection}>
          <h2>
            {galaxy.icon} {galaxy.name}
            <span className={styles.gamesCount}>
              {games.length > 0 ? `ігор: ${games.length} · завдань: ${games.reduce((n, r) => n + r.tasks, 0)}` : 'незабаром'}
            </span>
          </h2>
          {games.length > 0 && (
            <div className={styles.gamesScroll}>
              <table className={styles.gamesTable}>
                <thead>
                  <tr>
                    <th>Гра</th>
                    <th>Тип</th>
                    <th>Механіка</th>
                    <th>Сходинок</th>
                    <th>Складність</th>
                    <th>Завдань у рівні</th>
                    <th>Різних завдань</th>
                    <th>На одній сходинці</th>
                    <th>Опубліковано</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((row) => (
                    <tr key={row.sub.id}>
                      <td>
                        <strong>
                          {row.sub.icon} {row.sub.label}
                        </strong>
                        <div className={styles.gamesId}>{row.gameId}</div>
                      </td>
                      <td>{row.free ? 'Вільна гра' : 'Шлях'}</td>
                      <td>{mechanicsOf(row.sub)}</td>
                      <td>{row.free ? '—' : row.steps}</td>
                      <td className={styles.gamesStars}>{row.stars}</td>
                      <td>{row.perLevel}</td>
                      <td>
                        {row.estimated && '≈ '}
                        {row.tasks}
                        {row.estimated && '+'}
                      </td>
                      <td>
                        {row.free || row.perStep[0] === row.perStep[1]
                          ? row.perStep[1]
                          : `${row.perStep[0]}–${row.perStep[1]}`}
                        {row.estimated && '+'}
                      </td>
                      <td>
                        {gameStatus(row.sub) === 'soon' ? '⏳ ' : ''}
                        {row.sub.publishDate ? formatDate(row.sub.publishDate) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
