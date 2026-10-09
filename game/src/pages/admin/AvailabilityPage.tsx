import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { adminApi, type AvailabilityRules, type Place } from '@/core/account/api/client';
import { GALAXIES, galaxyKey } from '@/core/game/galaxies';
import { moduleRegistry } from '@/core/game/kernel/ModuleRegistry';
import { LANG_CODES, language } from '@/core/language';
import { tApp } from '@/core/translator';
import { errorText } from './shared';
import { countryName } from './links';
import styles from './Admin.module.css';

type Item = AvailabilityRules['items'][string];
type Region = AvailabilityRules['regions'][number];
type LangRule = AvailabilityRules['langRules'][number];

const EMPTY: AvailabilityRules = { regions: [], langRules: [], items: {} };
const ON: Item = { status: 'on', scope: 'all', where: [] };

const STATUS_NAME: Record<Item['status'], string> = { on: '✅ Увімкнено', soon: '⏳ Незабаром', hidden: '🚫 Сховано' };
const SCOPE_NAME: Record<Item['scope'], string> = { all: 'Усюди', only: 'Тільки в…', except: 'Усюди, крім…' };

/** «us, ca; pl» → ['US', 'CA', 'PL'] — whatever is not two letters is dropped. */
const parseCountries = (text: string): string[] => [...new Set(text.toUpperCase().split(/[^A-Z]+/).filter((code) => code.length === 2))];

/** A region's id, made once from its name; it is what the rules refer to. */
function regionId(name: string, taken: string[]): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 24) || 'region';
  let id = base.length >= 2 ? base : `${base}-1`;
  for (let n = 2; taken.includes(id); n += 1) id = `${base}-${n}`;
  return id;
}

// ---------------------------------------------------------------------------
// Where: regions to tick, countries to type
// ---------------------------------------------------------------------------

/**
 * A text field that keeps what is being typed and reports the parsed list:
 * re-writing the text from the list on every key would eat a half-typed code.
 */
function CountriesInput({ value, onChange, label }: { value: string[]; onChange: (countries: string[]) => void; label: string }) {
  const [text, setText] = useState(value.join(', '));
  // Changed from outside (loaded, saved and cleaned): show what is kept.
  useEffect(() => {
    setText((now) => (parseCountries(now).join() === value.join() ? now : value.join(', ')));
  }, [value]);
  return (
    <label className={styles.field}>
      {label}
      <input
        value={text}
        placeholder="US, CA, GB"
        onChange={(e) => {
          setText(e.target.value);
          onChange(parseCountries(e.target.value));
        }}
      />
      {value.length > 0 && <span className={styles.meta}>{value.map(countryName).join(' · ')}</span>}
    </label>
  );
}

function WherePicker({ value, regions, onChange }: { value: Place[]; regions: Region[]; onChange: (where: Place[]) => void }) {
  const picked = value.filter((place) => place.startsWith('@'));
  const countries = value.filter((place) => !place.startsWith('@'));
  return (
    <div className={styles.where}>
      {regions.length > 0 && (
        <div className={styles.dims}>
          {regions.map((region) => {
            const place = `@${region.id}`;
            return (
              <label key={region.id} className={styles.dim}>
                <input type="checkbox" checked={picked.includes(place)} onChange={(e) => onChange(e.target.checked ? [...value, place] : value.filter((p) => p !== place))} />
                {region.name}
              </label>
            );
          })}
        </div>
      )}
      <CountriesInput label="Країни (двобуквені коди через кому)" value={countries} onChange={(next) => onChange([...picked, ...next])} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// The three parts of the page
// ---------------------------------------------------------------------------

function Regions({ regions, onChange }: { regions: Region[]; onChange: (regions: Region[]) => void }) {
  const [name, setName] = useState('');
  const set = (id: string, patch: Partial<Region>) => onChange(regions.map((region) => (region.id === id ? { ...region, ...patch } : region)));
  const add = () => {
    if (!name.trim()) return;
    onChange([...regions, { id: regionId(name, regions.map((r) => r.id)), name: name.trim(), countries: [] }]);
    setName('');
  };
  return (
    <section className={styles.gamesSection}>
      <div className={styles.editor}>
        <h2>🗺️ Регіони</h2>
        <p className={styles.meta}>
          Регіон — це названа група країн, щоб не перелічувати їх у кожному правилі. Країна пишеться двобуквеним кодом:
          UA, PL, US, GB, DE. Правила нижче можна задавати і для регіону, і для окремих країн.
        </p>
        {regions.map((region) => (
          <div key={region.id} className={styles.ruleRow}>
            <div className={styles.fields}>
              <label className={styles.field}>
                Назва регіону
                <input value={region.name} maxLength={60} onChange={(e) => set(region.id, { name: e.target.value })} />
              </label>
              <CountriesInput label="Країни регіону" value={region.countries} onChange={(countries) => set(region.id, { countries })} />
            </div>
            <button type="button" className={styles.btnDanger} onClick={() => onChange(regions.filter((r) => r.id !== region.id))}>
              Видалити
            </button>
          </div>
        ))}
        <div className={styles.actions}>
          <input className={styles.inline} value={name} maxLength={60} placeholder="Назва нового регіону, напр. Європа" onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
          <button type="button" className={styles.btn} onClick={add} disabled={!name.trim()}>
            ➕ Додати регіон
          </button>
        </div>
      </div>
    </section>
  );
}

function LangBoxes({ label, value, onChange }: { label: string; value: string[]; onChange: (langs: string[]) => void }) {
  return (
    <div className={styles.field}>
      {label}
      <div className={styles.dims}>
        {LANG_CODES.map((code) => (
          <label key={code} className={styles.dim}>
            <input type="checkbox" checked={value.includes(code)} onChange={(e) => onChange(e.target.checked ? LANG_CODES.filter((c) => c === code || value.includes(c)) : value.filter((c) => c !== code))} />
            {language(code).flag} {language(code).name}
          </label>
        ))}
      </div>
      {value.length === 0 && <span className={styles.meta}>нічого не позначено — усі мови</span>}
    </div>
  );
}

function Languages({ rules, regions, onChange }: { rules: LangRule[]; regions: Region[]; onChange: (rules: LangRule[]) => void }) {
  const set = (index: number, patch: Partial<LangRule>) => onChange(rules.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)));
  return (
    <section className={styles.gamesSection}>
      <div className={styles.editor}>
        <h2>🌐 Мови за країнами</h2>
        <p className={styles.meta}>
          Які мови пропонувати відвідувачам із певних місць — окремо на сайті й окремо в грі (кабінет батьків, мова гри та
          озвучки). Де правила немає — доступні всі мови. Якщо місце підходить під кілька правил, діє перше зі списку.
          Мова, яку родина вже вибрала раніше, у неї залишається.
        </p>
        {rules.map((rule, index) => (
          <div key={index} className={styles.ruleRow}>
            <div className={styles.ruleBody}>
              <WherePicker value={rule.where} regions={regions} onChange={(where) => set(index, { where })} />
              <div className={styles.fields}>
                <LangBoxes label="Мови сайту" value={rule.site} onChange={(site) => set(index, { site })} />
                <LangBoxes label="Мови гри" value={rule.game} onChange={(game) => set(index, { game })} />
              </div>
            </div>
            <button type="button" className={styles.btnDanger} onClick={() => onChange(rules.filter((_, i) => i !== index))}>
              Видалити
            </button>
          </div>
        ))}
        <div className={styles.actions}>
          <button type="button" className={styles.btn} onClick={() => onChange([...rules, { where: [], site: [], game: [] }])}>
            ➕ Додати правило
          </button>
        </div>
      </div>
    </section>
  );
}

function ItemRow({ name, hint, item, regions, onChange, strong }: { name: string; hint?: string; item: Item; regions: Region[]; onChange: (item: Item) => void; strong?: boolean }) {
  return (
    <div className={strong ? `${styles.itemRow} ${styles.itemRowHead}` : styles.itemRow}>
      <div className={styles.itemName}>
        {strong ? <strong>{name}</strong> : name}
        {hint && <span className={styles.gamesId}>{hint}</span>}
      </div>
      <select className={styles.select} value={item.status} aria-label={`Статус: ${name}`} onChange={(e) => onChange({ ...item, status: e.target.value as Item['status'] })}>
        {(Object.keys(STATUS_NAME) as Item['status'][]).map((status) => (
          <option key={status} value={status}>
            {STATUS_NAME[status]}
          </option>
        ))}
      </select>
      <select
        className={styles.select}
        value={item.scope}
        aria-label={`Де доступно: ${name}`}
        disabled={item.status === 'hidden'}
        onChange={(e) => onChange({ ...item, scope: e.target.value as Item['scope'], where: e.target.value === 'all' ? [] : item.where })}
      >
        {(Object.keys(SCOPE_NAME) as Item['scope'][]).map((scope) => (
          <option key={scope} value={scope}>
            {SCOPE_NAME[scope]}
          </option>
        ))}
      </select>
      {item.scope !== 'all' && item.status !== 'hidden' && (
        <div className={styles.itemWhere}>
          <WherePicker value={item.where} regions={regions} onChange={(where) => onChange({ ...item, where })} />
        </div>
      )}
    </div>
  );
}

/** A folding group that opens by itself only once — when it has something set — and then obeys the hand. */
function Group({ title, startOpen, children }: { title: ReactNode; startOpen: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(startOpen);
  return (
    <details className={styles.itemGroup} open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>{title}</summary>
      {open && children}
    </details>
  );
}

function Games({ items, regions, onChange }: { items: AvailabilityRules['items']; regions: Region[]; onChange: (items: AvailabilityRules['items']) => void }) {
  // The catalogue as it is in the code: every galaxy with the games of its module.
  const galaxies = useMemo(
    () =>
      GALAXIES.map((galaxy) => ({
        galaxy,
        name: `${galaxy.icon} ${tApp('uk', galaxyKey(galaxy.id))}`,
        games: galaxy.moduleId ? (moduleRegistry.get(galaxy.moduleId)?.subCategories ?? []).map((sub) => ({ key: `game:${galaxy.moduleId}:${sub.id}`, name: `${sub.icon ?? ''} ${sub.label}`.trim(), id: sub.id })) : [],
      })),
    [],
  );
  const set = (key: string, item: Item) => onChange({ ...items, [key]: item });
  const changed = Object.values(items).filter((item) => item.status !== 'on' || item.scope !== 'all').length;

  return (
    <section className={styles.gamesSection}>
      <h2>
        🎮 Ігри й розділи
        <span className={styles.gamesCount}>змінено: {changed}</span>
      </h2>
      <p className={styles.meta}>
        Статус діє всюди: «Незабаром» — картка видна, але замкнена; «Сховано» — гри чи розділу немає зовсім. Другий
        список — де це взагалі доступно: всюди, тільки в певних країнах чи регіонах, або всюди, крім них. Сховати чи
        притримати розділ — означає сховати всі його ігри.
      </p>
      {galaxies.map(({ galaxy, name, games }) => {
        const own = items[`galaxy:${galaxy.id}`] ?? ON;
        return (
          <Group
            key={galaxy.id}
            startOpen={own !== ON || games.some((game) => items[game.key])}
            title={
              <>
                {name}
                <span className={styles.gamesCount}>
                  {galaxy.comingSoon ? 'ще не відкрито в коді' : `ігор: ${games.length}`}
                  {own.status !== 'on' || own.scope !== 'all' ? ` · ${STATUS_NAME[own.status]}${own.scope !== 'all' && own.status !== 'hidden' ? `, ${SCOPE_NAME[own.scope].toLowerCase()}` : ''}` : ''}
                </span>
              </>
            }
          >
            <ItemRow strong name="Увесь розділ" item={own} regions={regions} onChange={(item) => set(`galaxy:${galaxy.id}`, item)} />
            {games.map((game) => (
              <ItemRow key={game.key} name={game.name} hint={game.id} item={items[game.key] ?? ON} regions={regions} onChange={(item) => set(game.key, item)} />
            ))}
          </Group>
        );
      })}
    </section>
  );
}

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

/**
 * `/admin/availability` — what is offered where: the languages of the site and
 * of the game by country, and every game and galaxy — on, «soon» or put away,
 * everywhere or in some places only. One set of rules, saved whole
 * (`api/_lib/availability.js`); the server tells each visitor what applies in
 * their country.
 */
export function AvailabilityPage({ adminKey }: { adminKey: string }) {
  const [rules, setRules] = useState<AvailabilityRules>(EMPTY);
  const [kept, setKept] = useState<AvailabilityRules>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(true);

  const run = useCallback(async (call: () => Promise<{ availability: AvailabilityRules }>) => {
    setBusy(true);
    setError(null);
    try {
      const { availability } = await call();
      setRules(availability);
      setKept(availability);
      return true;
    } catch (err) {
      setError(errorText(err));
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void run(() => adminApi.getAvailability(adminKey));
  }, [run, adminKey]);

  const change = (patch: Partial<AvailabilityRules>) => {
    setRules((now) => ({ ...now, ...patch }));
    setSaved(false);
  };
  const dirty = JSON.stringify(rules) !== JSON.stringify(kept);
  // A rule that is not finished would be dropped on saving — say so before it is.
  const unfinished = rules.langRules.some((rule) => rule.where.length === 0 || (rule.site.length === 0 && rule.game.length === 0)) || Object.values(rules.items).some((item) => item.status !== 'hidden' && item.scope !== 'all' && item.where.length === 0);

  const save = async () => {
    if (await run(() => adminApi.saveAvailability(adminKey, rules))) setSaved(true);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>🌍 Доступність</h1>
        <div className={styles.totals}>
          <span>🗺️ Регіонів: {rules.regions.length}</span>
          <span>🌐 Правил мов: {rules.langRules.length}</span>
        </div>
        <button type="button" className={styles.btnPrimary} onClick={() => void save()} disabled={busy || !dirty}>
          {busy ? 'Зачекай…' : 'Зберегти'}
        </button>
      </header>

      {error && <p className={styles.noteErr}>{error}</p>}
      {saved && !dirty && <p className={styles.noteOk}>✓ Збережено. Відвідувачі побачать зміни протягом хвилини.</p>}
      {dirty && unfinished && (
        <p className={styles.warn}>
          Є незавершені правила: без місця або без жодної мови; гра «тільки в…» чи «крім…» без країн. Під час збереження
          такі правила не зберігаються.
        </p>
      )}
      <p className={styles.gamesNote}>
        Країну відвідувача визначає сервер за його адресою в мережі. Якщо країну визначити не вдалося, мовні правила до
        нього не застосовуються, а те, що доступне «тільки в…», йому не показується.
      </p>

      <Regions
        regions={rules.regions}
        onChange={(regions) => {
          // A region that is gone is gone from every rule that named it.
          const alive = new Set(regions.map((r) => `@${r.id}`));
          const keep = (where: Place[]) => where.filter((place) => !place.startsWith('@') || alive.has(place));
          change({
            regions,
            langRules: rules.langRules.map((rule) => ({ ...rule, where: keep(rule.where) })),
            items: Object.fromEntries(Object.entries(rules.items).map(([key, item]) => [key, { ...item, where: keep(item.where) }])),
          });
        }}
      />
      <Languages rules={rules.langRules} regions={rules.regions} onChange={(langRules) => change({ langRules })} />
      <Games items={rules.items} regions={rules.regions} onChange={(items) => change({ items })} />

      <div className={`${styles.actions} ${styles.gamesSection}`}>
        <button type="button" className={styles.btnPrimary} onClick={() => void save()} disabled={busy || !dirty}>
          Зберегти
        </button>
        {dirty && (
          <button type="button" className={styles.btn} onClick={() => setRules(kept)} disabled={busy}>
            Скасувати зміни
          </button>
        )}
      </div>
    </div>
  );
}
