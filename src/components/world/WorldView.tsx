import confetti from 'canvas-confetti';
import { useState } from 'react';
import { useShowText } from '@/core/app/ui/useUiPrefs';
import { KEY, KEY_COUNTED } from '@/core/child/world/stations';
import { PlanetView } from './PlanetView';
import { useWorld, type StationState, type World } from '@/core/child/world/useWorld';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useVoiceStopsOnLeave, voice } from '@/core/audio/voice';
import { counted } from '@/core/lang/uk';
import { cn } from '@/core/utils/cn';
import { useVoiceSpeak } from '@/core/audio/useSpeech';
import { useSound } from '@/core/audio/useSound';
import styles from './WorldView.module.css';

/** Tap a picture to hear what it is (the caption may be hidden or unreadable yet). */
function useSayOnTap() {
  const speak = useVoiceSpeak('selections');
  const { play } = useSound();
  return (text: string) => () => {
    play('tap');
    speak(text);
  };
}

/**
 * The stations of knowledge of the planet being looked at. Tapping one reads
 * out what it is and what it costs; one the child has keys for then shows the
 * button that opens it.
 */
function Stations({ world }: { world: World }) {
  const showText = useShowText();
  const announce = useVoiceSpeak('selections');
  const { play } = useSound();
  const open = useGameStore((s) => s.openStation);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { stations, keys, needs } = world;

  const describe = ({ station, cost, status, missing }: StationState): string => {
    if (status === 'open') return `${station.name}. Уже відчинено! ${station.about}`;
    if (!world.open) return `${station.name}. ${station.about} Ця планета ще закрита.`;
    const price = `Щоб відчинити, потрібно ${counted(cost, KEY_COUNTED)}.`;
    if (status === 'saving') return `${station.name}. ${station.about} ${price} Збери ще ${missing}: ключі дають за нові кроки в будь-якій грі.`;
    return `${station.name}. ${station.about} ${price} Можна відчиняти!`;
  };

  const select = (state: StationState) => {
    play('tap');
    setSelectedId(state.station.id);
    announce(describe(state));
  };

  const unlock = (state: StationState) => {
    if (!open(state.station.id, world.planet)) return;
    // Whatever was being said about the price is no longer true.
    voice.stop();
    setSelectedId(null);
    play('treasure');
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 }, scalar: 0.9 });
    window.setTimeout(() => announce(`${state.station.name}. Відчинено!`), 500);
  };

  return (
    <section className={styles.card} id="world-stations">
      <h2 className={styles.title}>
        <span className="emoji" aria-hidden>
          🛰️
        </span>{' '}
        Станції знань
        <span className={styles.count}>
          {needs.stations.have} / {needs.stations.need}
        </span>
        <button
          type="button"
          className={styles.keys}
          aria-label={`Ключі знань: ${keys}`}
          onClick={() => {
            play('tap');
            announce(`У тебе ${counted(keys, KEY_COUNTED)} знань. Ключ дають за кожен новий крок у будь-якій грі. Ключами відчиняють станції знань.`);
          }}
        >
          <span className="emoji" aria-hidden>
            {KEY}
          </span>{' '}
          {keys}
        </button>
      </h2>
      {showText && (
        <p className={styles.hint}>
          {world.open ? (
            <>
              Станції відчиняють ключами знань {KEY}. Ключ дають за кожну нову сходинку в будь-якій грі. Щоб летіти далі з планети «{world.planetName}»,
              відчини щонайменше {needs.stations.need}.
            </>
          ) : (
            // A planet not reached yet: its stations wait, and nothing here can be opened.
            <>Планета «{world.planetName}» ще закрита — її станції відчиняться, коли ти долетиш сюди. Зараз відчиняй станції на планеті «{world.system[world.frontier - 1].name}».</>
          )}
        </p>
      )}
      <ul className={styles.stations}>
        {stations.map((state) => {
          const { station, cost, status } = state;
          const ready = world.open && status === 'affordable';
          return (
            <li key={station.id} className={cn(styles.station, status === 'open' && styles.built, status !== 'open' && !ready && styles.locked, ready && styles.ready)}>
              <button type="button" className={styles.stationFace} aria-label={station.name} onClick={() => select(state)}>
                <span className={cn(styles.stationEmoji, 'emoji')} aria-hidden>
                  {station.emoji}
                </span>
                {showText && <span className={styles.stationName}>{station.name}</span>}
                <span className={styles.stationPrice}>{status === 'open' ? '✓' : !world.open ? '🔒' : `${cost} ${KEY}`}</span>
              </button>
              {ready && selectedId === station.id && (
                <button type="button" className={styles.stationOpen} onClick={() => unlock(state)}>
                  🔓 {showText ? 'Відчинити' : ''} {cost} {KEY}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * «Мій світ» — the world the child builds by learning: the theme's planet
 * (artifacts exchanged for buildings, ending in the dream build), the stations
 * of knowledge (opened with keys of knowledge, earned in any game) and the
 * residents that gifts bring.
 */
export function WorldView() {
  useVoiceStopsOnLeave();
  const showText = useShowText();
  // The planet being looked at; by default the furthest one reached.
  const [planet, setPlanet] = useState<number | undefined>(undefined);
  const world = useWorld(planet);
  const { def, residents } = world;
  const say = useSayOnTap();

  return (
    <div className="stack">
      {/* ---- The planet: exchange artifacts for buildings and decorations ---- */}
      <PlanetView world={world} onPlanet={setPlanet} />

      {/* ---- Stations of knowledge: exchange keys of knowledge ---- */}
      <Stations world={world} />

      {/* ---- Residents ---- */}
      <section className={styles.card}>
        <h2 className={styles.title}>
          <span className="emoji" aria-hidden>
            🎁
          </span>{' '}
          Мешканці
          <span className={styles.count}>{residents.length}</span>
        </h2>
        {/* Who comes next, when and how many there are is a surprise: only
            those who already moved in are shown, plus one mystery guest. */}
        <ul className={styles.residents}>
          {residents.map((r) => (
            <li key={r.id} className={styles.resident} aria-label={r.name} role="button" tabIndex={0} onClick={say(r.name)}>
              <span className={cn(styles.residentEmoji, 'emoji')} aria-hidden>
                {r.emoji}
              </span>
              {showText && <span className={styles.residentName}>{r.name}</span>}
            </li>
          ))}
          {residents.length < def.residents.length && (
            <li
              className={cn(styles.resident, styles.locked)}
              aria-label="Хтось іще в дорозі"
              role="button"
              tabIndex={0}
              onClick={say('Хтось іще в дорозі до тебе. Це сюрприз!')}
            >
              <span className={cn(styles.residentEmoji, 'emoji')} aria-hidden>
                ❔
              </span>
              {showText && <span className={styles.residentName}>…</span>}
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
