import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useSound } from '@/core/audio/useSound';
import { useVoiceSpeak } from '@/core/audio/useSpeech';
import { speechEngine } from '@/core/audio/SpeechEngine';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useShowText } from '@/core/app/ui/useUiPrefs';
import { cn } from '@/core/utils/cn';
import type { World } from '@/core/child/world/useWorld';
import { sellPrice, type ItemState } from '@/core/child/world/world';
import styles from './PlanetView.module.css';

const RAD = Math.PI / 180;
/** How far the planet can be tipped towards a pole. */
const MAX_PITCH = 70 * RAD;
const ZOOM_MIN = 0.7;
const ZOOM_MAX = 2.2;
/** A message with nothing to press fades out by itself after this long. */
const NOTICE_MS = 5000;

/** A place on the globe, in degrees: latitude (north is up) and longitude. */
type Place = [lat: number, lon: number];

/**
 * Where things stand, by district — so the planet reads as a map, not a heap:
 * the town (buildings) faces the child at first, the dream build crowns the
 * north above it, the park (decorations) lies on the far side, and residents
 * stroll in the lands between.
 */
const TOWN: Place[] = [[38, -30], [38, 0], [38, 30], [12, -30], [12, 0], [12, 30], [-14, -30], [-14, 0], [-14, 30]];
const DREAM: Place = [66, 0];
const PARK: Place[] = [[28, 143], [28, 168], [28, 193], [28, 218], [-2, 143], [-2, 168], [-2, 193], [-2, 218]];
const residentPlace = (i: number): Place => [34 - (i % 4) * 22, (i % 2 === 0 ? 82 : 272) + (Math.floor(i / 2) % 3) * 13];
/** Continents painted on the surface — they only show which way the planet is turned. */
const LANDS: { at: Place; size: number; tone: 1 | 2 | 3 }[] = [
  { at: [24, 0], size: 1.25, tone: 1 }, { at: [-32, 34], size: 0.6, tone: 2 }, { at: [8, 86], size: 0.85, tone: 3 },
  { at: [48, 128], size: 0.55, tone: 2 }, { at: [10, 180], size: 1.15, tone: 1 }, { at: [-40, 214], size: 0.5, tone: 3 },
  { at: [30, 268], size: 0.9, tone: 2 }, { at: [-22, 304], size: 0.7, tone: 1 }, { at: [72, 200], size: 0.5, tone: 3 }, { at: [-66, 100], size: 0.6, tone: 2 },
];

function placeOf({ item }: ItemState): Place {
  const index = Number(item.id.slice(1));
  if (item.kind === 'decor') return PARK[index % PARK.length];
  return index === 9 ? DREAM : TOWN[index % TOWN.length];
}

/** A place as seen right now: screen offset from the centre (in radii) and depth (1 = nearest, < 0 = behind). */
function project([lat, lon]: Place, yaw: number, pitch: number) {
  const y = Math.sin(lat * RAD);
  const flat = Math.cos(lat * RAD);
  const x = flat * Math.sin(lon * RAD + yaw);
  const z = flat * Math.cos(lon * RAD + yaw);
  return { x, y: y * Math.cos(pitch) - z * Math.sin(pitch), depth: y * Math.sin(pitch) + z * Math.cos(pitch) };
}

interface PlanetViewProps {
  world: World;
}

/**
 * The planet the child builds: a globe that turns under the finger in every
 * direction, with a town, a park and residents on its surface. Empty plots
 * glow with a «+»; tapping anything turns the planet to it and brings up a bar
 * at the bottom of the screen saying what it is — with the button to build or
 * sell it there. ⛶ opens the planet on the whole screen.
 */
export function PlanetView({ world }: PlanetViewProps) {
  const theme = useActiveTheme();
  const showText = useShowText();
  const { play } = useSound();
  const announce = useVoiceSpeak('selections');
  const buy = useGameStore((s) => s.buyWorldItem);
  const sell = useGameStore((s) => s.sellWorldItem);
  // The item whose «Продати» was tapped once: the warning has been read out
  // and the next tap really sells.
  const [selling, setSelling] = useState<string | null>(null);
  const milestones = useGameStore((s) => s.milestones);

  const [view, setView] = useState({ yaw: 0, pitch: 12 * RAD });
  const [zoom, setZoom] = useState(1);
  const [full, setFull] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [justBuilt, setJustBuilt] = useState<string | null>(null);

  // The window the planet is drawn in.
  const viewport = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ---- Turning: drag with a finger, or glide to a chosen place ----
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const glide = useRef(0);
  const radius = size ? Math.min(size.w, size.h) * 0.34 * zoom : 0;

  const viewNow = useRef(view);
  viewNow.current = view;
  const turnTo = useCallback(([lat, lon]: Place) => {
    cancelAnimationFrame(glide.current);
    const started = performance.now();
    const from = viewNow.current;
    // The short way round.
    const targetYaw = from.yaw + Math.atan2(Math.sin(-lon * RAD - from.yaw), Math.cos(-lon * RAD - from.yaw));
    const targetPitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, lat * RAD * 0.75));
    const frame = (now: number) => {
      const t = Math.min(1, (now - started) / 450);
      const ease = 1 - (1 - t) ** 3;
      setView({ yaw: from.yaw + (targetYaw - from.yaw) * ease, pitch: from.pitch + (targetPitch - from.pitch) * ease });
      if (t < 1) glide.current = requestAnimationFrame(frame);
    };
    glide.current = requestAnimationFrame(frame);
  }, []);
  useEffect(() => () => cancelAnimationFrame(glide.current), []);

  const onPointerDown = (e: ReactPointerEvent) => {
    cancelAnimationFrame(glide.current);
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d || radius === 0) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 6) return;
    d.moved = true;
    d.x = e.clientX;
    d.y = e.clientY;
    setView((v) => ({ yaw: v.yaw + dx / radius, pitch: Math.max(-MAX_PITCH, Math.min(MAX_PITCH, v.pitch + dy / radius)) }));
  };
  /** True when the finger just turned the planet — that touch must not also press a plot. */
  const wasDrag = () => drag.current?.moved ?? false;
  const onPointerUp = () => window.setTimeout(() => (drag.current = null), 0);

  const { items, balance } = world;
  const selected = items.find((s) => s.item.id === selectedId) ?? null;
  // Suggest something to do: the first thing the child can afford right now.
  const suggestion = items.find((s) => s.status === 'affordable');
  // The family goal the child is closest to: buying moves it further away.
  const nextGoal = [...milestones].sort((a, b) => a.amount - b.amount).find((m) => m.reward.trim());

  /** What the bar says about an item — also what is read aloud. */
  const describe = (state: ItemState): string => {
    const { name, cost } = state.item;
    if (state.status === 'owned') return `${name}. Уже стоїть на твоїй планеті.`;
    if (state.status === 'locked') return `${name}. Це головна мрія! Спершу збудуй усі інші будівлі.`;
    if (state.status === 'saving') return `${name}. Коштує ${cost}. Збери ще ${state.missing} — і можна будувати.`;
    return `${name}. Коштує ${cost}. Можна будувати!`;
  };

  const deselect = () => {
    setSelectedId(null);
    setSelling(null);
  };

  const select = (state: ItemState) => {
    play('tap');
    // A second tap on the same thing puts it down again.
    if (selectedId === state.item.id) {
      speechEngine.cancel();
      deselect();
      return;
    }
    setSelectedId(state.item.id);
    setSelling(null);
    turnTo(placeOf(state));
    announce(describe(state));
  };

  // A message with nothing to press (still saving, locked) leaves by itself;
  // one with a button stays until the child chooses something else.
  const hasAction = selected?.status === 'affordable' || selected?.status === 'owned';
  useEffect(() => {
    if (!selected || hasAction) return;
    const t = window.setTimeout(deselect, NOTICE_MS);
    return () => window.clearTimeout(t);
  }, [selectedId, hasAction]); // eslint-disable-line react-hooks/exhaustive-deps

  // Selling takes two taps: the first explains, out loud, that less comes
  // back than was paid; the second does it.
  const askToSell = (state: ItemState) => {
    play('tap');
    setSelling(state.item.id);
    const back = sellPrice(state.item.id);
    announce(
      `Якщо продати, тобі повернуть ${back}, а не ${state.item.cost}. Це менше, ніж ти заплатив. Якщо часто купувати і продавати, скарбів ставатиме дедалі менше. Подумай добре!`,
    );
  };
  const confirmSell = (state: ItemState) => {
    if (sell(theme.id, state.item.id) <= 0) return;
    speechEngine.cancel();
    play('pop');
    deselect();
  };

  const build = (state: ItemState) => {
    if (!buy(theme.id, state.item.id)) return;
    // Whatever was being said about the price is no longer true.
    speechEngine.cancel();
    setJustBuilt(state.item.id);
    deselect();
    turnTo(placeOf(state));
    play('chestOpen');
    window.setTimeout(() => play(state.item.id === 'b9' ? 'fanfare' : 'treasure'), 420);
    window.setTimeout(() => announce(`${state.item.name}. Збудовано!`), 700);
    confetti({ particleCount: 70, spread: 75, origin: { y: 0.42 }, scalar: 0.9 });
  };

  useEffect(() => {
    if (!justBuilt) return;
    const t = window.setTimeout(() => setJustBuilt(null), 2400);
    return () => window.clearTimeout(t);
  }, [justBuilt]);

  const spin = (direction: 1 | -1) => {
    play('tap');
    cancelAnimationFrame(glide.current);
    setView((v) => ({ ...v, yaw: v.yaw + direction * 40 * RAD }));
  };
  const zoomBy = (factor: number) => setZoom((z) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z * factor)));

  const cx = (size?.w ?? 0) / 2;
  const cy = (size?.h ?? 0) / 2;
  /** Things on the far side are hidden; near the edge they shrink away. */
  const seen = (place: Place) => {
    const p = project(place, view.yaw, view.pitch);
    return { ...p, left: cx + p.x * radius, top: cy - p.y * radius, scale: 0.55 + 0.45 * Math.max(0, p.depth), visible: p.depth > 0.08 };
  };

  const hintText = suggestion
    ? `Уже можна збудувати: ${suggestion.item.name}!`
    : 'Торкнись плюсика на планеті, щоб побачити, що там можна збудувати.';

  return (
    <section className={cn(styles.card, full && styles.full)}>
      <header className={styles.head}>
        <h2 className={styles.title}>
          <span className="emoji" aria-hidden>
            {theme.icon}
          </span>{' '}
          {world.def.name}
        </h2>
        <span className={styles.purse} aria-label={`Можна витратити: ${balance}`}>
          <span className="emoji" aria-hidden>
            {theme.artifact.emoji}
          </span>{' '}
          {balance}
        </span>
      </header>

      <div
        className={styles.viewport}
        ref={viewport}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={(e) => zoomBy(e.deltaY < 0 ? 1.08 : 0.93)}
      >
        {size && (
          <>
            <div className={styles.halo} style={{ left: cx, top: cy, width: radius * 2.5, height: radius * 2.5 }} aria-hidden />
            <div className={styles.ball} style={{ left: cx, top: cy, width: radius * 2, height: radius * 2 }} aria-hidden>
              {LANDS.map((land, i) => {
                const p = project(land.at, view.yaw, view.pitch);
                if (p.depth < -0.25) return null;
                const d = radius * land.size * (0.5 + 0.5 * Math.max(0, p.depth));
                return (
                  <span
                    key={i}
                    className={cn(styles.patch, styles[`tone${land.tone}`])}
                    style={{ left: radius + p.x * radius, top: radius - p.y * radius, width: d, height: d, opacity: Math.min(1, 0.25 + p.depth) }}
                  />
                );
              })}
              <span className={styles.shade} />
            </div>

            {world.residents.map((resident, i) => {
              const p = seen(residentPlace(i));
              if (!p.visible) return null;
              return (
                <span
                  key={resident.id}
                  className={cn(styles.walker, 'emoji')}
                  style={{ left: p.left, top: p.top, transform: `translate(-50%, -85%) scale(${p.scale})`, zIndex: Math.round(p.depth * 100) }}
                  aria-hidden
                >
                  {resident.emoji}
                </span>
              );
            })}

            {items.map((state) => {
              const { item, status } = state;
              const p = seen(placeOf(state));
              if (!p.visible) return null;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    styles.pin,
                    item.kind === 'building' ? styles.plotBuilding : styles.plotDecor,
                    status !== 'owned' && styles.plotEmpty,
                    status === 'affordable' && styles.plotReady,
                    status === 'locked' && styles.plotLocked,
                    selectedId === item.id && styles.plotSelected,
                  )}
                  style={{ left: p.left, top: p.top, transform: `translate(-50%, -88%) scale(${p.scale})`, zIndex: 100 + Math.round(p.depth * 100) }}
                  onClick={() => !wasDrag() && select(state)}
                  aria-label={`${item.name}: ${status === 'owned' ? 'збудовано' : status === 'locked' ? 'закрито' : `коштує ${item.cost}`}`}
                >
                  {status === 'owned' ? (
                    <motion.span
                      className={cn(styles.thing, 'emoji')}
                      initial={justBuilt === item.id ? { scale: 0, y: -70, rotate: -25 } : false}
                      animate={{ scale: 1, y: 0, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 170, damping: 9 }}
                    >
                      {item.emoji}
                    </motion.span>
                  ) : (
                    <span className={styles.plus} aria-hidden>
                      {status === 'locked' ? '🔒' : '+'}
                    </span>
                  )}
                </button>
              );
            })}
          </>
        )}
      </div>

      <div className={styles.controls}>
        <button type="button" onClick={() => spin(1)} aria-label="Повернути планету ліворуч">
          ↺
        </button>
        <button type="button" onClick={() => spin(-1)} aria-label="Повернути планету праворуч">
          ↻
        </button>
        <button type="button" onClick={() => zoomBy(1.25)} aria-label="Наблизити">
          ＋
        </button>
        <button type="button" onClick={() => zoomBy(0.8)} aria-label="Віддалити">
          －
        </button>
        <button
          type="button"
          onClick={() => {
            play('tap');
            setFull((f) => !f);
          }}
          aria-label={full ? 'Згорнути планету' : 'Відкрити планету на весь екран'}
          aria-pressed={full}
        >
          {full ? '✕' : '⛶'}
        </button>
      </div>

      {/* What to do next — tap to hear it; the name leads straight to the thing. */}
      <p
        className={styles.hint}
        role="button"
        tabIndex={0}
        onClick={() => {
          play('tap');
          announce(hintText);
        }}
      >
        {suggestion ? (
          <>
            Уже можна збудувати:{' '}
            <button
              type="button"
              className={styles.hintLink}
              onClick={(e) => {
                e.stopPropagation();
                select(suggestion);
              }}
            >
              {suggestion.item.emoji} {suggestion.item.name}
            </button>
          </>
        ) : (
          hintText
        )}
      </p>

      {/* What is selected — at the bottom of the screen, wherever the child
          has scrolled to, with the exchange itself. */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.item.id}
            className={styles.bar}
            role="status"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20, transition: { duration: 0.6 } }}
            // Tap the bar to hear it again.
            onClick={() => announce(describe(selected))}
          >
            <span className={cn(styles.sheetEmoji, 'emoji')} aria-hidden>
              {selected.item.emoji}
            </span>
            <div className={styles.sheetText}>
              <strong>{selected.item.name}</strong>
              <span>
                {selected.status === 'owned' && 'Уже стоїть на твоїй планеті ✓'}
                {selected.status === 'locked' && 'Це головна мрія! Спершу збудуй усі інші будівлі.'}
                {selected.status === 'saving' && (
                  <>
                    Ще {selected.missing} {theme.artifact.emoji} — і можна будувати
                  </>
                )}
                {selected.status === 'affordable' && (
                  <>
                    Обміняти {selected.item.cost} {theme.artifact.emoji}?
                  </>
                )}
              </span>
              {/* The choice, spelled out: build now, or keep saving for a goal. */}
              {selected.status === 'affordable' && nextGoal && (
                <span className={styles.tradeoff}>
                  Або збирай далі на «{nextGoal.reward}»:{' '}
                  {balance >= nextGoal.amount
                    ? balance - selected.item.cost >= nextGoal.amount
                      ? 'на ціль вистачить і після покупки'
                      : `після покупки бракуватиме ${nextGoal.amount - (balance - selected.item.cost)}`
                    : `зараз бракує ${nextGoal.amount - balance}, після покупки — ${nextGoal.amount - balance + selected.item.cost}`}{' '}
                  {theme.artifact.emoji}
                </span>
              )}
              {selected.status === 'owned' && selling === selected.item.id && (
                <span className={styles.sellWarn}>
                  Повернуть {sellPrice(selected.item.id)} {theme.artifact.emoji}, а не {selected.item.cost} — це менше, ніж ти заплатив.
                </span>
              )}
            </div>
            <div className={styles.barActions} onClick={(e) => e.stopPropagation()}>
              {selected.status === 'affordable' && (
                <motion.button type="button" className={styles.buy} whileTap={{ scale: 0.93 }} onClick={() => build(selected)}>
                  🔨 {showText ? 'Збудувати' : ''} {selected.item.cost} {theme.artifact.emoji}
                </motion.button>
              )}
              {selected.status === 'owned' &&
                (selling === selected.item.id ? (
                  <>
                    <button type="button" className={styles.sellYes} onClick={() => confirmSell(selected)}>
                      Так, продати
                    </button>
                    <button type="button" className={styles.sellNo} onClick={() => setSelling(null)}>
                      Залишити
                    </button>
                  </>
                ) : (
                  <button type="button" className={styles.sellAsk} onClick={() => askToSell(selected)}>
                    💱 {showText ? 'Продати за' : ''} {sellPrice(selected.item.id)} {theme.artifact.emoji}
                  </button>
                ))}
              <button
                type="button"
                className={styles.barClose}
                onClick={() => {
                  speechEngine.cancel();
                  deselect();
                }}
                aria-label="Закрити"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The same things as a list: what is built, what can be added next. */}
      {(['building', 'decor'] as const).map((kind) => (
        <div key={kind} className={styles.shelf}>
          <h3 className={styles.shelfTitle}>{kind === 'building' ? '🏗️ Будівлі' : '🌷 Прикраси'}</h3>
          <ul className={styles.items}>
            {items
              .filter((s) => s.item.kind === kind)
              .map((state) => (
                <li key={state.item.id}>
                  <button
                    type="button"
                    className={cn(
                      styles.item,
                      state.status === 'owned' && styles.itemOwned,
                      state.status === 'affordable' && styles.itemReady,
                      (state.status === 'saving' || state.status === 'locked') && styles.itemFar,
                      selectedId === state.item.id && styles.itemSelected,
                    )}
                    onClick={() => select(state)}
                  >
                    <span className={cn(styles.itemEmoji, 'emoji')} aria-hidden>
                      {state.item.emoji}
                    </span>
                    {showText && <span className={styles.itemName}>{state.item.name}</span>}
                    <span className={styles.itemPrice}>
                      {state.status === 'owned' ? '✓' : state.status === 'locked' ? '🔒' : `${state.item.cost} ${theme.artifact.emoji}`}
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
