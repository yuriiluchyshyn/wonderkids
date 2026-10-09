import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSound } from '@/core/audio/useSound';
import { useGameLang, useT, type T } from '@/core/i18n';
import { useTell } from './useTell';
import { useVoiceStopsOnLeave, voice } from '@/core/audio/voice';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useShowText } from '@/core/app/ui/useUiPrefs';
import { cn } from '@/core/utils/cn';
import type { World } from '@/core/child/world/useWorld';
import { DREAM_ID, PLANET_COUNT, SPACEPORT_ID, galaxyName, sellPrice, type ItemState, type Need } from '@/core/child/world/world';
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
/** A message with nothing to press fades out by itself after this long — long enough to be read out. */
const NOTICE_MS = 9000;

/** One thing a planet asks for before the child may fly on, with how to get it. */
interface NeedChip {
  id: string;
  icon: string;
  text: string;
  done: boolean;
  count?: string;
  /** How to get it — shown, and read out in the voice's own words (see `useTell`). */
  how: (t: T, said: World) => string;
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
  const t = useT();
  const gameLang = useGameLang();
  const { tell } = useTell(world.planet);
  /** A thing's name as the voice says it: the same thing in the voice's world. */
  const saidName = (said: World, state: ItemState) => said.items.find((other) => other.item.id === state.item.id)?.item.name ?? state.item.name;
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

  /** What is read out about an item — made from the voice's own words (see `useTell`). */
  const describe = (state: ItemState) => (vt: T, said: World): string => {
    const name = saidName(said, state);
    const { cost } = state.item;
    const port = state.item.id === SPACEPORT_ID ? ` ${vt('world.item.portNote')}` : '';
    if (state.status === 'owned') return `${vt('world.item.owned', { name })}${port}`;
    if (state.status === 'locked') return vt('world.item.locked', { name });
    if (state.status === 'saving') return `${vt('world.item.saving', { name, cost, balance, missing: state.missing, how: vt('world.item.howToEarn') })}${port}`;
    return `${vt('world.item.affordable', { name, cost })}${port}`;
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
      tell((vt, said) => vt('world.item.closedPlanet', { name: saidName(said, state) }));
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
    tell(describe(state));
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
    tell((vt) => vt('world.item.sellWarn', { back, cost: state.item.cost }));
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
    window.setTimeout(() => tell((vt, said) => vt('world.item.built', { name: saidName(said, state) })), 700);
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

  const next = world.system[world.planet];
  const nextName = next?.name ?? t('world.sun.name');
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
  /** The planet whose list is shown, named in the language of the world it is told in. */
  const planetIn = (said: World) => said.system[gate.planet - 1]?.name ?? gate.name;
  /** The same text on the screen: the dictionary and the world of the game's own language. */
  const shown = (how: NeedChip['how']) => how(t, world);
  const needChips: NeedChip[] = [
    {
      id: 'port',
      icon: '🚀',
      text: t('world.need.port.text'),
      done: needs.spaceport,
      how: (vt, said) => vt('world.need.port.how', { planet: planetIn(said), cost: port?.item.cost ?? '', artifact: theme.artifact.emoji }),
      go: t('world.need.port.go'),
      // The spaceport is chosen once the planet it stands on is on the screen.
      act: () => {
        toGate();
        setPending(SPACEPORT_ID);
      },
    },
    {
      id: 'built',
      icon: '🏗️',
      text: t('world.need.built.text'),
      done: needs.built.done,
      count: count(needs.built),
      how: (vt, said) => vt('world.need.built.how', { planet: planetIn(said), have: needs.built.have, need: needs.built.need, artifact: theme.artifact.emoji }),
      go: t('world.need.built.go'),
      act: () => {
        toGate();
        scrollTo('world-buildings');
      },
    },
    {
      id: 'stations',
      icon: '🛰️',
      text: t('world.need.stations.text'),
      done: needs.stations.done,
      count: count(needs.stations),
      how: (vt, said) => vt('world.need.stations.how', { planet: planetIn(said), have: needs.stations.have, need: needs.stations.need }),
      go: t('world.need.stations.go'),
      act: () => {
        toGate();
        scrollTo('world-stations');
      },
    },
    {
      id: 'residents',
      icon: '🎁',
      text: t('world.need.residents.text'),
      done: needs.residents.done,
      count: count(needs.residents),
      how: (vt) => vt('world.need.residents.how', { have: needs.residents.have, need: needs.residents.need }),
      go: t('common.play'),
      act: play_,
    },
    {
      id: 'treasures',
      icon: '💎',
      text: t('world.need.treasures.text'),
      done: needs.treasures.done,
      count: count(needs.treasures),
      how: (vt) => vt('world.need.treasures.how', { have: needs.treasures.have, need: needs.treasures.need }),
      go: t('common.play'),
      act: play_,
    },
  ];
  const need = needChips.find((c) => c.id === needId) ?? null;
  const needsTitle = !world.open
    ? t('world.needs.first', { planet: gate.name })
    : needs.done
      ? t('world.needs.open')
      : next
        ? t('world.needs.to', { planet: next.name })
        : t('world.needs.toSun');

  /** The line under the planet: what can be done now — shown, and read out when tapped. */
  const hint = (vt: T, said: World): string =>
    !world.open ? vt('world.hint.closed') : suggestion ? vt('world.hint.canBuild', { name: saidName(said, suggestion) }) : vt('world.hint.tap');
  const hintText = hint(t, world);

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <h2 className={styles.title}>
          <span className="emoji" aria-hidden>
            {theme.icon}
          </span>{' '}
          {world.def.name}
          <small className={styles.where}>
            {t('world.where', { planet: world.planetName, galaxy: galaxyName(gameLang) })}
          </small>
        </h2>
        <span className={styles.purse} aria-label={t('world.purse', { balance })}>
          <span className="emoji" aria-hidden>
            {theme.artifact.emoji}
          </span>{' '}
          {balance}
        </span>
      </header>

      {/* The solar system: eight planets on the way to the Sun. */}
      <div className={styles.system} role="group" aria-label={t('world.system.label')}>
        {world.system.map((p) => (
          <button
            key={p.id}
            type="button"
            className={cn(styles.systemPlanet, p.planet === world.planet && styles.systemHere, !p.open && styles.systemClosed)}
            aria-label={t(p.done ? 'world.planet.ariaDone' : p.open ? 'world.planet.ariaOpen' : 'world.planet.ariaClosed', { name: p.name })}
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
                tell((vt, said) => vt('world.planet.notYet', { name: said.system[p.planet - 1].name, frontier: said.system[world.frontier - 1].name }));
                return;
              }
              tell((vt, said) => (p.done ? vt('world.planet.done', { name: said.system[p.planet - 1].name }) : vt('world.planet.number', { name: said.system[p.planet - 1].name, n: p.planet, total: PLANET_COUNT })));
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
          aria-label={t('world.sun.name')}
          onClick={() => {
            play('tap');
            tell((vt) => vt(world.sunReached ? 'world.sun.reachedNext' : 'world.sun.goal'));
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
        <button type="button" onClick={() => spin(1)} aria-label={t('world.planet.spinLeft')}>
          ↺
        </button>
        <button type="button" onClick={() => spin(-1)} aria-label={t('world.planet.spinRight')}>
          ↻
        </button>
        <button type="button" onClick={() => zoomBy(1.25)} aria-label={t('world.system.zoomIn')}>
          ＋
        </button>
        <button type="button" onClick={() => zoomBy(0.8)} aria-label={t('world.system.zoomOut')}>
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
          aria-label={t('world.system.showAll')}
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
          tell(hint);
        }}
      >
        {world.open && suggestion ? (
          <>
            {t('world.hint.canBuildLead')}{' '}
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
              aria-label={t('common.close')}
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
                      tell((vt, said) => `${row.how(vt, said)} ${vt(row.done ? 'world.need.done' : 'world.need.notDone')}`);
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
                {showText && <p>{need.done ? t('world.need.doneHow', { how: shown(need.how) }) : shown(need.how)}</p>}
                {!need.done && (
                  <button type="button" className={styles.buy} onClick={need.act}>
                    {need.go} →
                  </button>
                )}
              </div>
            ) : (
              showText && !needs.done && <p className={styles.needTip}>{t('world.need.tip')}</p>
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
                  tell((vt, said) => vt('world.fly.say', { planet: said.system[world.planet]?.name ?? vt('world.sun.name') }));
                }}
              >
                {t('world.fly.button', { planet: nextName })}
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
            onClick={() => tell(describe(selected))}
          >
            <span className={cn(styles.sheetEmoji, 'emoji')} aria-hidden>
              {selected.item.emoji}
            </span>
            <div className={styles.sheetText}>
              <strong>{selected.item.name}</strong>
              <span>
                {selected.status === 'owned' && t('world.bar.owned')}
                {selected.status === 'locked' && t('world.bar.locked')}
                {selected.status === 'saving' && t('world.bar.saving', { cost: selected.item.cost, artifact: theme.artifact.emoji, balance, missing: selected.missing })}
                {selected.status === 'affordable' && t('world.bar.affordable', { cost: selected.item.cost, artifact: theme.artifact.emoji })}
              </span>
              {/* Not enough yet: how the rest is earned — a price alone does not say. */}
              {selected.status === 'saving' && (
                <span className={styles.tradeoff}>
                  {t('world.bar.earn', { artifact: theme.artifact.emoji })}
                  {selected.item.id === SPACEPORT_ID && ` ${t('world.item.portNote')}`}
                </span>
              )}
              {/* The choice, spelled out: build now, or keep saving for a goal. */}
              {selected.status === 'affordable' && nextGoal && (
                <span className={styles.tradeoff}>
                  {t('world.bar.goal', { reward: nextGoal.reward })}{' '}
                  {balance >= nextGoal.amount
                    ? balance - selected.item.cost >= nextGoal.amount
                      ? t('world.bar.goalEnough')
                      : t('world.bar.goalShortAfter', { n: nextGoal.amount - (balance - selected.item.cost) })
                    : t('world.bar.goalShort', { now: nextGoal.amount - balance, after: nextGoal.amount - balance + selected.item.cost })}{' '}
                  {theme.artifact.emoji}
                </span>
              )}
              {selected.status === 'owned' && selling === selected.item.id && (
                <span className={styles.sellWarn}>
                  {t('world.bar.sellNote', { back: sellPrice(selected.item.id, world.planet), artifact: theme.artifact.emoji, cost: selected.item.cost })}
                </span>
              )}
            </div>
            <div className={styles.barActions} onClick={(e) => e.stopPropagation()}>
              {selected.status === 'affordable' && (
                <motion.button type="button" className={styles.buy} whileTap={{ scale: 0.93 }} onClick={() => build(selected)}>
                  🔨 {showText ? t('world.bar.build') : ''} {selected.item.cost} {theme.artifact.emoji}
                </motion.button>
              )}
              {selected.status === 'saving' && (
                <button type="button" className={styles.buy} onClick={() => navigate('/')}>
                  🎮 {showText ? t('world.bar.play') : ''} {theme.artifact.emoji}
                </button>
              )}
              {selected.status === 'owned' &&
                (selling === selected.item.id ? (
                  <>
                    <button type="button" className={styles.sellYes} onClick={() => confirmSell(selected)}>
                      {t('world.bar.sellYes')}
                    </button>
                    <button type="button" className={styles.sellNo} onClick={() => setSelling(null)}>
                      {t('world.bar.sellNo')}
                    </button>
                  </>
                ) : (
                  <button type="button" className={styles.sellAsk} onClick={() => askToSell(selected)}>
                    💱 {showText ? t('world.bar.sellFor') : ''} {sellPrice(selected.item.id, world.planet)} {theme.artifact.emoji}
                  </button>
                ))}
              <button
                type="button"
                className={styles.barClose}
                onClick={() => {
                  voice.stop();
                  deselect();
                }}
                aria-label={t('common.close')}
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
          <h3 className={styles.shelfTitle}>{kind === 'building' ? t('world.shelf.buildings') : t('world.shelf.decor')}</h3>
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
