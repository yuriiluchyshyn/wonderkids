import { useEffect, useRef } from 'react';
import { voice } from '@/core/audio/voice';
import { useGameStore } from '@/core/child/store/useGameStore';
import { tellFact } from '@/core/game/content/outro';
import { toldOf } from '@/core/game/hints/script';
import { saidOf } from '@/core/game/kernel/types';
import type { LangCode } from '@/core/language';
import { spoken, written } from '@/core/language/uk';
import type { HintStage } from '@/components/hints/HintStage';
import type { GameSession } from './types';

/** Let the "correct!" sound land before the fact is said. */
const AFTER_SUCCESS_MS = 300;
/** A breath after the last word, before the next task. */
const AFTER_FACT_MS = 350;

/**
 * The short fact a correct answer may bring («Це прапор Японії!»), and the
 * wait for it: the next task starts only when it has been read to the end
 * (or, with the voice off, after time to read it).
 *
 * The fact is the next one from the task's pool, so a replay of the same task
 * — even its repeat within the level — tells a new story; the voice tells the
 * same one from its twin's pool. A task that says how its fact is read part by
 * part (`payload.told`) has it played on the stage, the parts of the board each
 * part names blinking as it is said.
 */
export function useOutro({ session, taskLang, stage }: { session: GameSession; taskLang: LangCode; stage: HintStage }) {
  const { task } = session;
  // Picked once per showing; the last one stays up while the level finishes.
  const pick = useRef<{ at: number; text?: string; said?: string; lang?: LangCode }>({ at: -1 });
  if (task && !session.finished && pick.current.at !== session.index) {
    // A story of the screen's language alone is not paired: it is read in that language.
    const told = tellFact(task.outro, task.voice ? (task.voice.outro ?? []) : undefined);
    const paired = told?.said !== undefined;
    pick.current = { at: session.index, text: told?.text, said: told?.said ?? told?.text, lang: paired ? taskLang : (task.lang ?? session.langs.shown) };
  }
  const picked = pick.current.text;
  const outro = picked ? written(picked) : undefined;
  const outroSpeech = picked ? spoken(pick.current.said ?? picked) : undefined;
  const outroLang = pick.current.lang ?? taskLang;
  const outroVoice = useGameStore((s) => s.settings.voiceOn && s.settings.voice.taskPrompt);

  useEffect(() => {
    if (!session.awaitingOutro) return;
    const { outroDone } = session;
    const next = () => window.setTimeout(outroDone, AFTER_FACT_MS);
    if (!outro) {
      outroDone();
      return;
    }
    const told = toldOf(task?.payload);
    if (told) {
      // Part by part; with the voice off, each part is given time to be read by its length.
      const start = window.setTimeout(
        () => stage.start({ shown: told, said: task ? toldOf(saidOf(task).payload) : undefined, lang: outroLang, kind: 'told', channel: 'taskPrompt', onDone: next }),
        AFTER_SUCCESS_MS,
      );
      return () => window.clearTimeout(start);
    }
    if (outroVoice && voice.supported) {
      const start = window.setTimeout(() => voice.speak(outroSpeech ?? outro, next, outroLang), AFTER_SUCCESS_MS);
      return () => window.clearTimeout(start);
    }
    const reading = window.setTimeout(outroDone, Math.max(2200, outro.length * 60));
    return () => window.clearTimeout(reading);
  }, [session.awaitingOutro]); // eslint-disable-line react-hooks/exhaustive-deps

  return outro;
}
