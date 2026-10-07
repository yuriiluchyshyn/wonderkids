import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { TransformComponent, TransformWrapper, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { useSound } from '@/core/audio/useSound';
import { useVoiceSpeak } from '@/core/audio/useSpeech';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useShowText } from '@/core/app/ui/useUiPrefs';
import { cn } from '@/core/utils/cn';
import type { World } from '@/core/child/world/useWorld';
import { sellPrice, type ItemState } from '@/core/child/world/world';
import styles from './PlanetView.module.css';

/** Places around the planet's rim; buildings take the even ones, decor the odd. */
const SLOTS = 20;
const SLOT_DEG = 360 / SLOTS;
/** Planet radius inside the stage. */
const RADIUS = 168;
/** What has to be visible at rest: the planet plus the buildings on its rim. */
const SCENE = (RADIUS + 86) * 2;

/** Where on the rim an item stands. The dream build crowns the top. */
function slotOf({ item }: ItemState): number {
  const index = Number(item.id.slice(1));
  if (item.kind === 'decor') return 1 + index * 2;
  const isDream = index === 9;
  return isDream ? 0 : 2 + index * 2;
}

/** Shortest way to turn the planet so that `slot` ends up on top. */
function turnTo(current: number, slot: number): number {
  const target = -slot * SLOT_DEG;
  const delta = ((((target - current) % 360) + 540) % 360) - 180;
  return current + delta;
}

interface PlanetViewProps {
  world: World;
}

/**
 * The planet the child builds: a little world seen from space, with buildings
 * and decorations standing around its rim. Drag to move, pinch / buttons to
 * zoom, tap anything to turn the planet to it. Empty plots glow with a «+»;
 * tapping one shows what can be built there and for how many artifacts.
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

  const zoom = useRef<ReactZoomPanPinchRef | null>(null);
  const [rotation, setRotation] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [justBuilt, setJustBuilt] = useState<string | null>(null);

  // Scale at which the whole planet fits the window on this screen.
  const viewport = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<number | null>(null);
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const measure = () => setFit(Math.min(el.clientWidth, el.clientHeight) / SCENE);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { items, balance } = world;
  const selected = items.find((s) => s.item.id === selectedId) ?? null;
  // Suggest something to do: the first thing the child can afford right now.
  const suggestion = items.find((s) => s.status === 'affordable');
  // The family goal the child is closest to: buying moves it further away.
  const nextGoal = [...milestones].sort((a, b) => a.amount - b.amount).find((m) => m.reward.trim());

  /** What the info card says about an item — also what is read aloud. */
  const describe = (state: ItemState): string => {
    const { name, cost } = state.item;
    if (state.status === 'owned') return `${name}. Уже стоїть на твоїй планеті.`;
    if (state.status === 'locked') return `${name}. Це головна мрія! Спершу збудуй усі інші будівлі.`;
    if (state.status === 'saving') return `${name}. Коштує ${cost}. Збери ще ${state.missing} — і можна будувати.`;
    return `${name}. Коштує ${cost}. Можна будувати!`;
  };

  const select = (state: ItemState) => {
    play('tap');
    setSelectedId(state.item.id);
    setSelling(null);
    setRotation((r) => turnTo(r, slotOf(state)));
    announce(describe(state));
  };

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
    play('pop');
    setSelling(null);
  };

  const build = (state: ItemState) => {
    if (!buy(theme.id, state.item.id)) return;
    setJustBuilt(state.item.id);
    play('chestOpen');
    window.setTimeout(() => play(state.item.id === 'b9' ? 'fanfare' : 'treasure'), 420);
    confetti({ particleCount: 70, spread: 75, origin: { y: 0.42 }, scalar: 0.9 });
    // Fly the camera in to watch it go up, then pull back out.
    zoom.current?.zoomToElement(`wk-plot-${state.item.id}`, (fit ?? 1) * 2.4, 650);
    window.setTimeout(() => zoom.current?.resetTransform(700), 2200);
  };

  useEffect(() => {
    if (!justBuilt) return;
    const t = window.setTimeout(() => setJustBuilt(null), 2400);
    return () => window.clearTimeout(t);
  }, [justBuilt]);

  const step = (direction: 1 | -1) => {
    play('tap');
    setRotation((r) => r + direction * SLOT_DEG * 2);
  };

  return (
    <section className={styles.card}>
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

      <div className={styles.viewport} ref={viewport}>
        {fit !== null && (
        <TransformWrapper
          // Re-created when the window changes size, so "fit" stays true.
          key={fit.toFixed(3)}
          // The handle arrives via onInit (the component takes no `ref` on React 18).
          onInit={(handle) => {
            zoom.current = handle;
          }}
          initialScale={fit}
          minScale={fit * 0.8}
          maxScale={fit * 4}
          centerOnInit
          limitToBounds={false}
          doubleClick={{ mode: 'toggle', step: 1.2 }}
          wheel={{ step: 0.12 }}
          pinch={{ step: 6 }}
        >
          <TransformComponent wrapperClass={styles.zoomWrap} contentClass={styles.zoomContent}>
            <div className={styles.stage}>
              <div className={styles.glow} aria-hidden />
              <div className={styles.orbit} aria-hidden>
                <span className={cn(styles.moon, 'emoji')}>🌙</span>
              </div>

              {/* Everything on the planet turns with it. */}
              <motion.div
                className={styles.globe}
                animate={{ rotate: rotation }}
                transition={{ type: 'spring', stiffness: 60, damping: 14 }}
              >
                <div className={styles.surface} aria-hidden>
                  <span className={styles.land1} />
                  <span className={styles.land2} />
                  <span className={styles.land3} />
                </div>

                {items.map((state) => {
                  const { item, status } = state;
                  const building = item.kind === 'building';
                  const isSelected = selectedId === item.id;
                  return (
                    <div key={item.id} className={styles.spoke} style={{ transform: `rotate(${slotOf(state) * SLOT_DEG}deg)` }}>
                      <button
                        type="button"
                        id={`wk-plot-${item.id}`}
                        className={cn(
                          styles.plot,
                          building ? styles.plotBuilding : styles.plotDecor,
                          status !== 'owned' && styles.plotEmpty,
                          status === 'affordable' && styles.plotReady,
                          status === 'locked' && styles.plotLocked,
                          isSelected && styles.plotSelected,
                        )}
                        style={{ bottom: RADIUS - 6 }}
                        onClick={() => select(state)}
                        aria-label={`${item.name}: ${
                          status === 'owned' ? 'збудовано' : status === 'locked' ? 'закрито' : `коштує ${item.cost}`
                        }`}
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
                    </div>
                  );
                })}

                {/* Residents stroll along the surface. */}
                {world.residents.map((resident, i) => (
                  <div
                    key={resident.id}
                    className={styles.spoke}
                    style={{ transform: `rotate(${(i * 360) / Math.max(1, world.residents.length) + 9}deg)` }}
                    aria-hidden
                  >
                    <motion.span
                      className={cn(styles.resident, 'emoji')}
                      style={{ bottom: RADIUS - 30 }}
                      animate={{ x: [-6, 6, -6], y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 3.5 + (i % 3), ease: 'easeInOut' }}
                    >
                      {resident.emoji}
                    </motion.span>
                  </div>
                ))}
              </motion.div>
            </div>
          </TransformComponent>
        </TransformWrapper>
        )}

      </div>

      <div className={styles.controls}>
        <button type="button" onClick={() => step(1)} aria-label="Повернути планету ліворуч">
          ↺
        </button>
        <button type="button" onClick={() => step(-1)} aria-label="Повернути планету праворуч">
          ↻
        </button>
        <button type="button" onClick={() => zoom.current?.zoomIn(0.5)} aria-label="Наблизити">
          ＋
        </button>
        <button type="button" onClick={() => zoom.current?.zoomOut(0.5)} aria-label="Віддалити">
          －
        </button>
        <button type="button" onClick={() => zoom.current?.resetTransform()} aria-label="Показати всю планету">
          ⤢
        </button>
      </div>

      {/* What is selected — and the exchange itself. */}
      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key={selected.item.id}
            className={styles.sheet}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            // Tap the card to hear it again.
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
            </div>
            {selected.status === 'affordable' && (
              <motion.button
                type="button"
                className={styles.buy}
                whileTap={{ scale: 0.93 }}
                onClick={(e) => {
                  e.stopPropagation();
                  build(selected);
                }}
              >
                🔨 {showText ? 'Збудувати' : ''} {selected.item.cost} {theme.artifact.emoji}
              </motion.button>
            )}
            {selected.status === 'owned' && (
              <div className={styles.sellRow} onClick={(e) => e.stopPropagation()}>
                {selling === selected.item.id ? (
                  <>
                    <span className={styles.sellWarn}>
                      Повернуть {sellPrice(selected.item.id)} {theme.artifact.emoji}, а не {selected.item.cost} — це менше,
                      ніж ти заплатив.
                    </span>
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
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.p key="hint" className={styles.hint} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {suggestion
              ? `Торкнись «+» на планеті: уже можна збудувати — ${suggestion.item.name}!`
              : 'Торкнись «+» на планеті, щоб побачити, що там можна збудувати.'}
          </motion.p>
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
