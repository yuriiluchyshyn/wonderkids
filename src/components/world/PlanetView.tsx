import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSound } from '@/core/audio/useSound';
import { useVoiceSpeak } from '@/core/audio/useSpeech';
import { useVoiceStopsOnLeave, voice } from '@/core/audio/voice';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useShowText } from '@/core/app/ui/useUiPrefs';
import { cn } from '@/core/utils/cn';
import type { World } from '@/core/child/world/useWorld';
import { DREAM_ID, GALAXY_NAME, PLANET_COUNT, SPACEPORT_ID, sellPrice, type ItemState, type Need } from '@/core/child/world/world';
import { PlanetArt } from '@/components/templates/PlanetArt';
import { Globe } from './Globe';
import { SolarSystem } from './SolarSystem';
import { RAD, itemPlace, type Place } from './places';
import { useGestures } from './useGestures';
import styles from './PlanetView.module.css';

/** How far the planet can be tipped towards a pole. */
const MAX_PITCH = 70 * RAD;
const ZOOM_MIN = 0.7;
/** Far enough in for the smallest decoration to be looked at closely. */
const ZOOM_MAX = 4;
/** How the artifacts a thing costs are earned — said whenever there are not enough of them. */
const HOW_TO_EARN = 'Щоб зібрати, грай у будь-яку гру: за кожне виконане завдання дають нагороду.';
/** A message with nothing to press fades out by itself after this long — long enough to be read out. */
const NOTICE_MS = 9000;

/** One thing a planet asks for before the child may fly on, with how to get it. */
interface NeedChip {
  id: string;
  icon: string;
  text: string;
  done: boolean;
  count?: string;
  /** How to get it — shown and read out. */
  how: string;
  /** The button that leads there, and what it does. */
  go: string;
  act: () => void;
}

interface PlanetViewProps {
  world: World;
  /** The child chose another planet of the system to look at. */
  onPlanet: (planet: number) => void;
}

/**
 * The planet the child builds: a globe that turns under the finger in every
 * direction and zooms under two, with buildings, decorations and residents
 * spread evenly over its surface. Tapping a thing — on the planet or in the
 * list below it, built or not — turns the planet to its place, reads out what
 * it is and what it costs, and brings up a bar at the bottom of the screen
 * with the button to build or sell it when that is possible.
 * Tapping a planet of the system shows that planet — a closed one under a
 * lock — and what it asks for. ⛶ opens the whole solar system.
 */
export function PlanetView({ world, onPlanet }: PlanetViewProps) {
  useVoiceStopsOnLeave();
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
  // The "what this planet asks for" sheet, raised by tapping a planet of the system.
  const [needsOpen, setNeedsOpen] = useState(false);
  // The need the child tapped in that sheet: how to get it, and the way there.
  const [needId, setNeedId] = useState<string | null>(null);
  // A thing to choose as soon as its planet is the one on the screen.
  const [pending, setPending] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const zoomBy = (factor: number) => setZoom((z) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z * factor)));
  const { handlers, wasDrag } = useGestures({
    onStart: () => cancelAnimationFrame(glide.current),
    onDrag: (dx, dy) => {
      if (radius === 0) return;
      setView((v) => ({ yaw: v.yaw + dx / radius, pitch: Math.max(-MAX_PITCH, Math.min(MAX_PITCH, v.pitch + dy / radius)) }));
    },
    onPinch: zoomBy,
  });

  const { items, balance } = world;
  const selected = items.find((s) => s.item.id === selectedId) ?? null;
  // Suggest something to do: the first thing the child can afford right now.
  const suggestion = items.find((s) => s.status === 'affordable');
  // The family goal the child is closest to: buying moves it further away.
  const nextGoal = [...milestones].sort((a, b) => a.amount - b.amount).find((m) => m.reward.trim());

  /** What the bar says about an item — also what is read aloud. */
  const describe = (state: ItemState): string => {
    const { name, cost } = state.item;
    const port = state.item.id === SPACEPORT_ID ? ' Космопорт відкриває шлях до наступної планети.' : '';
    if (state.status === 'owned') return `${name}. Уже стоїть на твоїй планеті.${port}`;
    if (state.status === 'locked') return `${name}. Це головна мрія! Спершу збудуй усі інші будівлі та космопорт.`;
    if (state.status === 'saving') return `${name}. Коштує ${cost}. У тебе є ${balance}. Збери ще ${state.missing} — і можна будувати. ${HOW_TO_EARN}${port}`;
    return `${name}. Коштує ${cost}. Можна будувати!${port}`;
  };

  const deselect = () => {
    setSelectedId(null);
    setSelling(null);
  };

  const placeOf = (state: ItemState): Place => itemPlace(items.findIndex((s) => s.item.id === state.item.id), items.length);

  const select = (state: ItemState) => {
    play('tap');
    setNeedsOpen(false);
    // A closed planet can only be looked at.
    if (!world.open) {
      turnTo(placeOf(state));
      announce(`${state.item.name}. Ця планета ще закрита.`);
      return;
    }
    // A second tap on the same thing puts it down again.
    if (selectedId === state.item.id) {
      voice.stop();
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
  // Still saving: the bar stays too — it tells how to earn the rest and leads to the games.
  const hasAction = selected?.status === 'affordable' || selected?.status === 'owned' || selected?.status === 'saving';
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
    const back = sellPrice(state.item.id, world.planet);
    announce(
      `Якщо продати, тобі повернуть ${back}, а не ${state.item.cost}. Це менше, ніж ти заплатив. Якщо часто купувати і продавати, скарбів ставатиме дедалі менше. Подумай добре!`,
    );
  };
  const confirmSell = (state: ItemState) => {
    if (sell(theme.id, state.item.id, world.planet) <= 0) return;
    voice.stop();
    play('pop');
    deselect();
  };

  const build = (state: ItemState) => {
    if (!buy(theme.id, state.item.id, world.planet)) return;
    // Whatever was being said about the price is no longer true.
    voice.stop();
    setJustBuilt(state.item.id);
    deselect();
    turnTo(placeOf(state));
    play('chestOpen');
    window.setTimeout(() => play(state.item.id === DREAM_ID || state.item.id === SPACEPORT_ID ? 'fanfare' : 'treasure'), 420);
    window.setTimeout(() => announce(`${state.item.name}. Збудовано!`), 700);
    confetti({ particleCount: 70, spread: 75, origin: { y: 0.42 }, scalar: 0.9 });
  };

  useEffect(() => {
    if (!justBuilt) return;
    const t = window.setTimeout(() => setJustBuilt(null), 2400);
    return () => window.clearTimeout(t);
  }, [justBuilt]);

  useEffect(() => {
    if (!pending) return;
    const state = items.find((i) => i.item.id === pending);
    if (!world.open || !state) return;
    setPending(null);
    select(state);
  }, [pending, world.planet, world.open]); // eslint-disable-line react-hooks/exhaustive-deps

  const spin = (direction: 1 | -1) => {
    play('tap');
    cancelAnimationFrame(glide.current);
    setView((v) => ({ ...v, yaw: v.yaw + direction * 40 * RAD }));
  };

  const cx = (size?.w ?? 0) / 2;
  const cy = (size?.h ?? 0) / 2;

  const nextName = world.system[world.planet]?.name ?? 'Сонце';
  // A closed planet opens when the one the child is building on is done, so
  // that is the planet whose list it shows.
  const gate = world.system[(world.open ? world.planet : world.frontier) - 1];
  const { needs } = gate;
  // What the planet asks for, as a row of pictures with numbers. Tapping one
  // says HOW to get it and offers the way there: a count alone left the child
  // (and the parent) wondering where a spaceport or a treasure comes from.
  const toGate = () => {
    voice.stop();
    setNeedsOpen(false);
    setNeedId(null);
    onPlanet(gate.planet);
  };
  const scrollTo = (id: string) => window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  const play_ = () => navigate('/');
  const port = gate.items.find((i) => i.item.id === SPACEPORT_ID);
  const count = (n: Need) => `${n.have}/${n.need}`;
  const needChips: NeedChip[] = [
    {
      id: 'port',
      icon: '🚀',
      text: 'Космопорт',
      done: needs.spaceport,
      how: `Космопорт — це будівля. Він є у списку «Будівлі» на планеті ${gate.name} і коштує ${port?.item.cost ?? ''} ${theme.artifact.emoji}. Їх дають за кожне виконане завдання в іграх.`,
      go: 'Показати космопорт',
      // The spaceport is chosen once the planet it stands on is on the screen.
      act: () => {
        toGate();
        setPending(SPACEPORT_ID);
      },
    },
    {
      id: 'built',
      icon: '🏗️',
      text: 'Будівлі та прикраси',
      done: needs.built.done,
      count: count(needs.built),
      how: `Збудуй усе зі списків «Будівлі» та «Прикраси» на планеті ${gate.name}: уже є ${needs.built.have} з ${needs.built.need}. Будують за ${theme.artifact.emoji} — їх дають за виконані завдання.`,
      go: 'До будівель і прикрас',
      act: () => {
        toGate();
        scrollTo('world-buildings');
      },
    },
    {
      id: 'stations',
      icon: '🛰️',
      text: 'Станції знань',
      done: needs.stations.done,
      count: count(needs.stations),
      how: `Відчини станції знань на планеті ${gate.name}: уже є ${needs.stations.have} з ${needs.stations.need}. Їх відчиняють ключами знань 🗝️ — ключ дають за кожну нову сходинку в будь-якій грі.`,
      go: 'До станцій',
      act: () => {
        toGate();
        scrollTo('world-stations');
      },
    },
    {
      id: 'residents',
      icon: '🎁',
      text: 'Мешканці',
      done: needs.residents.done,
      count: count(needs.residents),
      how: `Мешканці приходять із подарунками. Подарунок чекає на кожній п’ятій сходинці шляху в будь-якій грі. Уже є ${needs.residents.have} з ${needs.residents.need}.`,
      go: 'Грати',
      act: play_,
    },
    {
      id: 'treasures',
      icon: '💎',
      text: 'Скарби',
      done: needs.treasures.done,
      count: count(needs.treasures),
      how: `Скарби лежать у скринях на шляху: скриня чекає на кожній третій сходинці гри, і в кожній — новий скарб. Уже є ${needs.treasures.have} з ${needs.treasures.need}.`,
      go: 'Грати',
      act: play_,
    },
  ];
  const need = needChips.find((c) => c.id === needId) ?? null;
  const needsTitle = !world.open
    ? `🔒 Спершу — планета ${gate.name}`
    : needs.done
      ? '🚀 Шлях далі відкрито!'
      : `🚀 Щоб летіти ${nextName === 'Сонце' ? 'до Сонця' : `на ${nextName}`}`;

  const hintText = !world.open
    ? 'Ця планета ще закрита.'
    : suggestion
      ? `Уже можна збудувати: ${suggestion.item.name}!`
      : 'Торкнися будь-чого на планеті або у списку внизу.';

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <h2 className={styles.title}>
          <span className="emoji" aria-hidden>
            {theme.icon}
          </span>{' '}
          {world.def.name}
          <small className={styles.where}>
            {world.planetName} · галактика {GALAXY_NAME}
          </small>
        </h2>
        <span className={styles.purse} aria-label={`Можна витратити: ${balance}`}>
          <span className="emoji" aria-hidden>
            {theme.artifact.emoji}
          </span>{' '}
          {balance}
        </span>
      </header>

      {/* The solar system: eight planets on the way to the Sun. */}
      <div className={styles.system} role="group" aria-label="Сонячна система">
        {world.system.map((p) => (
          <button
            key={p.id}
            type="button"
            className={cn(styles.systemPlanet, p.planet === world.planet && styles.systemHere, !p.open && styles.systemClosed)}
            aria-label={`${p.name}: ${p.done ? 'усе збудовано' : p.open ? 'відкрито' : 'ще закрито'}`}
            aria-current={p.planet === world.planet}
            onClick={() => {
              play('tap');
              voice.stop();
              deselect();
              // A second tap on the planet being shown puts its list away.
              setNeedsOpen(p.planet !== world.planet || !needsOpen);
              setNeedId(null);
              onPlanet(p.planet);
              if (!p.open) {
                announce(`${p.name}. Сюди ще не можна. Спершу зроби все на планеті ${world.system[world.frontier - 1].name} і збудуй там космопорт.`);
                return;
              }
              announce(p.done ? `${p.name}. Тут уже все збудовано!` : `${p.name}. Планета номер ${p.planet} з ${PLANET_COUNT} на шляху до Сонця.`);
            }}
          >
            <PlanetArt id={p.id} turned={0} />
            {!p.open && (
              <span className={styles.systemLock} aria-hidden>
                🔒
              </span>
            )}
            {p.done && (
              <span className={styles.systemLock} aria-hidden>
                ✅
              </span>
            )}
          </button>
        ))}
        <button
          type="button"
          className={cn(styles.systemPlanet, styles.systemSun, !world.sunReached && styles.systemClosed)}
          aria-label="Сонце"
          onClick={() => {
            play('tap');
            announce(
              world.sunReached
                ? `Ти дістався Сонця! Уся Сонячна система твоя. Далі на тебе чекає нова галактика.`
                : 'Сонце — мета твоєї подорожі. Щоб дістатися до нього, пройди всі вісім планет.',
            );
          }}
        >
          <span className="emoji" aria-hidden>
            ☀️
          </span>
        </button>
      </div>

      <div className={styles.viewport} ref={viewport} {...handlers} onWheel={(e) => zoomBy(e.deltaY < 0 ? 1.08 : 0.93)}>
        {size && (
          <>
            <div className={styles.halo} style={{ left: cx, top: cy, width: radius * 2.5, height: radius * 2.5 }} aria-hidden />
            <Globe
              planetId={world.planetId}
              cx={cx}
              cy={cy}
              radius={radius}
              yaw={view.yaw}
              pitch={view.pitch}
              items={items}
              residents={world.open ? world.residents : []}
              level={world.planet}
              locked={!world.open}
              selectedId={selectedId}
              justBuilt={justBuilt}
              onTap={(state) => {
                if (wasDrag()) return;
                select(state);
              }}
            />
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
            voice.stop();
            deselect();
            setNeedsOpen(false);
            setFull(true);
          }}
          aria-label="Показати всю Сонячну систему"
        >
          ⛶
        </button>
      </div>

      {/* What to do next — tap to hear it; the name leads straight to the thing. */}
      <p
        className={styles.hint}
        role="button"
        tabIndex={0}
        onClick={() => {
          play('tap');
          if (!world.open) setNeedsOpen(true);
          announce(hintText);
        }}
      >
        {world.open && suggestion ? (
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

      {/* What the planet asks for — raised by tapping a planet of the system. */}
      <AnimatePresence>
        {needsOpen && !selected && (
          <motion.div
            key={`needs-${world.planet}`}
            className={cn(styles.bar, styles.needs)}
            role="status"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <h3 className={styles.needsTitle}>{needsTitle}</h3>
            <button
              type="button"
              className={styles.barClose}
              onClick={() => {
                voice.stop();
                setNeedsOpen(false);
              }}
              aria-label="Закрити"
            >
              ✕
            </button>
            <ul className={styles.needsList}>
              {needChips.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    className={cn(styles.needChip, row.done && styles.needDone, needId === row.id && styles.needChosen)}
                    aria-label={row.text}
                    aria-pressed={needId === row.id}
                    onClick={() => {
                      play('tap');
                      setNeedId(needId === row.id ? null : row.id);
                      announce(`${row.how} ${row.done ? 'Готово!' : 'Ще не готово.'}`);
                    }}
                  >
                    <span className={cn(styles.needIcon, 'emoji')} aria-hidden>
                      {row.icon}
                    </span>
                    <span className={styles.needCount}>{row.done ? '✅' : (row.count ?? '—')}</span>
                    {showText && <span className={styles.needText}>{row.text}</span>}
                  </button>
                </li>
              ))}
            </ul>
            {/* How to get the chosen thing, and the way there. */}
            {need ? (
              <div className={styles.needHow}>
                {showText && <p>{need.done ? `Готово! ${need.how}` : need.how}</p>}
                {!need.done && (
                  <button type="button" className={styles.buy} onClick={need.act}>
                    {need.go} →
                  </button>
                )}
              </div>
            ) : (
              showText && !needs.done && <p className={styles.needTip}>Торкнись картинки — розповім, як це отримати.</p>
            )}
            {world.open && needs.done && world.planet < PLANET_COUNT && (
              <button
                type="button"
                className={styles.buy}
                onClick={() => {
                  play('fanfare');
                  deselect();
                  setNeedsOpen(false);
                  onPlanet(world.planet + 1);
                  announce(`Летимо! Наступна планета — ${nextName}.`);
                }}
              >
                🚀 Летіти: {nextName}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
                {selected.status === 'locked' && 'Це головна мрія! Спершу збудуй усі інші будівлі та космопорт.'}
                {selected.status === 'saving' && (
                  <>
                    Коштує {selected.item.cost} {theme.artifact.emoji} · є {balance} · збери ще {selected.missing} {theme.artifact.emoji}
                  </>
                )}
                {selected.status === 'affordable' && (
                  <>
                    Обміняти {selected.item.cost} {theme.artifact.emoji}?
                  </>
                )}
              </span>
              {/* Not enough yet: how the rest is earned — a price alone does not say. */}
              {selected.status === 'saving' && (
                <span className={styles.tradeoff}>
                  {theme.artifact.emoji} дають за кожне виконане завдання в будь-якій грі.
                  {selected.item.id === SPACEPORT_ID && ' Космопорт відкриває шлях до наступної планети.'}
                </span>
              )}
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
                  Повернуть {sellPrice(selected.item.id, world.planet)} {theme.artifact.emoji}, а не {selected.item.cost} — це менше, ніж ти заплатив.
                </span>
              )}
            </div>
            <div className={styles.barActions} onClick={(e) => e.stopPropagation()}>
              {selected.status === 'affordable' && (
                <motion.button type="button" className={styles.buy} whileTap={{ scale: 0.93 }} onClick={() => build(selected)}>
                  🔨 {showText ? 'Збудувати' : ''} {selected.item.cost} {theme.artifact.emoji}
                </motion.button>
              )}
              {selected.status === 'saving' && (
                <button type="button" className={styles.buy} onClick={() => navigate('/')}>
                  🎮 {showText ? 'Грати й збирати' : ''} {theme.artifact.emoji}
                </button>
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
                    💱 {showText ? 'Продати за' : ''} {sellPrice(selected.item.id, world.planet)} {theme.artifact.emoji}
                  </button>
                ))}
              <button
                type="button"
                className={styles.barClose}
                onClick={() => {
                  voice.stop();
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
        <div key={kind} className={styles.shelf} id={kind === 'building' ? 'world-buildings' : undefined}>
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
                      world.open && state.status === 'affordable' && styles.itemReady,
                      (!world.open || state.status === 'saving' || state.status === 'locked') && styles.itemFar,
                      selectedId === state.item.id && styles.itemSelected,
                    )}
                    onClick={() => select(state)}
                  >
                    <span className={cn(styles.itemEmoji, 'emoji')} aria-hidden>
                      {state.item.emoji}
                    </span>
                    {showText && <span className={styles.itemName}>{state.item.name}</span>}
                    <span className={styles.itemPrice}>
                      {state.status === 'owned' ? '✓' : state.status === 'locked' || !world.open ? '🔒' : `${state.item.cost} ${theme.artifact.emoji}`}
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      ))}

      {full && <SolarSystem world={world} onClose={() => setFull(false)} />}
    </section>
  );
}
