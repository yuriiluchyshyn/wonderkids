import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { SpeechLang } from '@/core/audio/SpeechEngine';
import { voice } from '@/core/audio/voice';
import type { VoiceChannel } from '@/core/audio/voiceChannels';
import { beatCeilingMs, readingMs } from '@/core/game/hints/script';
import type { HintScript } from '@/core/game/hints/types';
import { spoken, written } from '@/core/language/marks';

/** The pause between one beat's last word and the next beat. */
const BEAT_GAP_MS = 260;

/** What is being played, and for what. */
export interface HintPlay {
  /** The script as the screen shows it — its focus ids and its scene. */
  shown: HintScript;
  /** The same script in the voice's language (the task's twin); its words are what is said. */
  said?: HintScript;
  lang?: SpeechLang;
  /** `help` — shown in the help panel under the board, and holds the board still while it is said. `told` — read out over a solved board. */
  kind: 'help' | 'told';
  /** The voice switch it obeys. Default: the hint's. */
  channel?: VoiceChannel;
  /** Facts the scene draws with: the number stepped on, … (the same ones a board filled the beats with). */
  holes?: Record<string, string | number>;
  /** Called once, when the last beat has been said — not when it is stopped. */
  onDone?: () => void;
}

export interface HintStageState {
  play: HintPlay | null;
  /** The beat being said (or, once over, the last one said). */
  at: number;
  /** Beats are still being said. */
  playing: boolean;
  /** Bumped by `replay`, so what is drawn can start over. */
  round: number;
}

export interface HintStage extends HintStageState {
  start(play: HintPlay): void;
  /** Stops the voice and the blinking; what was shown stays (the child said «Зрозуміло!»). */
  stop(): void;
  /** The same script again, from its first beat. */
  replay(): void;
  /** Nothing on the stage any more (a new task, the help is no longer due). */
  clear(): void;
  /** The board is held still: a help script is being said and asks for it. */
  locked: boolean;
}

const IDLE: HintStageState = { play: null, at: 0, playing: false, round: 0 };

/**
 * The one player of hint scripts, owned by the game shell. It says a beat,
 * waits for the voice to reach its last word (`voice.speak`'s `onEnd`), and
 * only then moves on — so the picture and the voice never part. With the
 * voice off it gives each beat time to be read instead.
 *
 * Every beat it starts carries a ticket: a callback of an earlier beat — cut
 * off, timed out, or simply late — finds its ticket stale and does nothing.
 */
export function useHintStageState(): HintStage {
  const [state, setState] = useState<HintStageState>(IDLE);
  const ticket = useRef(0);
  // The state as it stands, for the controls (an updater must not have side effects).
  const live = useRef(state);
  live.current = state;

  const start = useCallback((play: HintPlay) => {
    ticket.current += 1;
    setState((s) => ({ play, at: 0, playing: play.shown.beats.length > 0, round: s.round + 1 }));
  }, []);

  const stop = useCallback(() => {
    ticket.current += 1;
    voice.stop();
    setState((s) => (s.playing ? { ...s, playing: false } : s));
  }, []);

  const replay = useCallback(() => {
    ticket.current += 1;
    setState((s) => (s.play ? { ...s, at: 0, playing: s.play.shown.beats.length > 0, round: s.round + 1 } : s));
  }, []);

  const clear = useCallback(() => {
    if (!live.current.play) return;
    ticket.current += 1;
    if (live.current.playing) voice.stop();
    setState((s) => ({ ...IDLE, round: s.round }));
  }, []);

  // Say the beat `at`, then go on — once, however the beat ends.
  const { play, at, playing, round } = state;
  useEffect(() => {
    if (!play || !playing) return;
    const mine = ++ticket.current;
    const shown = play.shown.beats[at];
    const said = (play.said ?? play.shown).beats[at] ?? shown;
    if (!shown) return;
    let over = false;
    const timers: number[] = [];
    const onward = () => {
      if (over || mine !== ticket.current) return;
      over = true;
      // A beat of its own after a short breath — never inside the callback of the one before.
      timers.push(
        window.setTimeout(() => {
          if (mine !== ticket.current) return;
          const last = at >= play.shown.beats.length - 1;
          setState((s) => (last ? { ...s, playing: false } : { ...s, at: s.at + 1 }));
          if (last) play.onDone?.();
        }, BEAT_GAP_MS),
      );
    };
    const channel = play.channel ?? 'hint';
    if (voice.allowed(channel) && voice.supported && !document.hidden) {
      voice.speak(spoken(said.text), onward, play.lang);
      timers.push(window.setTimeout(onward, beatCeilingMs(said.text)));
    } else {
      timers.push(window.setTimeout(onward, readingMs(written(shown.text))));
    }
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [play, at, playing, round]);

  // A locked phone or another app in front: the hint does not go on speaking into a dark screen.
  useEffect(() => {
    const away = () => document.hidden && stop();
    document.addEventListener('visibilitychange', away);
    return () => document.removeEventListener('visibilitychange', away);
  }, [stop]);

  // Whatever is being said stops with the screen.
  useEffect(
    () => () => {
      ticket.current += 1;
      if (live.current.playing) voice.stop();
    },
    [],
  );

  const locked = Boolean(playing && play?.kind === 'help' && play.shown.lock !== false);
  // One object per change of the stage: every part that asks whether it blinks re-reads it only then.
  return useMemo(() => ({ ...state, start, stop, replay, clear, locked }), [state, start, stop, replay, clear, locked]);
}

const StageContext = createContext<HintStage | null>(null);

export function HintStageProvider({ stage, children }: { stage: HintStage; children: ReactNode }) {
  return <StageContext.Provider value={stage}>{children}</StageContext.Provider>;
}

/** The shell's stage — for a board that plays a script of its own (`by: 'board'`). Null outside a game. */
export function useHintStage(): HintStage | null {
  return useContext(StageContext);
}

/**
 * Is this part of the screen named by the beat being said? Its place in the
 * beat's focus list (0, 1, 2…) — several parts light one after another — or
 * `null`. Nothing blinks once the beats are over.
 */
export function useHintFocus(id: string | undefined): number | null {
  const stage = useContext(StageContext);
  return useMemo(() => {
    if (!id || !stage?.playing || !stage.play) return null;
    const focus = stage.play.shown.beats[stage.at]?.focus;
    const at = focus ? focus.indexOf(id) : -1;
    return at >= 0 ? at : null;
  }, [id, stage?.playing, stage?.play, stage?.at]);
}

/** The props that make a part blink while it is named: its class and how long after the first one it lights. */
export function blinkProps(order: number | null): { className?: string; style?: CSSProperties } {
  if (order === null) return {};
  return { className: 'hint-blink', style: { '--blink-delay': `${order * 0.22}s` } as CSSProperties };
}
