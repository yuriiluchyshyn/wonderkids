import { useEffect } from 'react';
import { useSayT } from '@/core/audio/useSpeech';
import { saidOf } from '@/core/game/kernel/types';
import { helpOf, toldOf } from '@/core/game/hints/script';
import type { LangCode } from '@/core/language';
import { prefetchScript, type HintStage } from '@/components/hints/HintStage';
import type { GameSession, Phase } from './types';

/**
 * When help is due, it is given — in one of two ways:
 *
 *  - a task whose help is a script (`payload.help`, `core/game/hints`) has it
 *    played on the stage, beat by beat — unless the board plays it itself
 *    (`by: 'board'`: it depends on what only the board knows);
 *  - any other has the module's spoken how-to read out (`getHintSpeech`).
 *
 * The stage is cleared with every new task and once a task is solved; and
 * whatever is read out over a solved board (`payload.told`) is fetched as soon
 * as the task appears, so it is said at once when the answer is right.
 */
export function useHelpFlow({ phase, session, taskLang, stage, bringIntoSight }: { phase: Phase; session: GameSession; taskLang: LangCode; stage: HintStage; bringIntoSight: () => void }) {
  const { module, task } = session;
  // A hint's «how» is a piece of the task: the whole phrase is said in the language the task is read in.
  const sayHint = useSayT('hint', taskLang);

  useEffect(() => {
    if (phase !== 'play' || !task) return;
    const help = helpOf(task.payload);
    if (session.hintActive && help && help.by !== 'board') {
      stage.start({ shown: help, said: helpOf(saidOf(task).payload), lang: taskLang, kind: 'help' });
    } else if (!session.hintActive && stage.play?.kind === 'help' && stage.play.shown.by !== 'board') {
      stage.clear();
    }
  }, [session.hintActive, session.index, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Whatever was on the stage belonged to the task before; what this one will read out when solved is fetched now.
  useEffect(() => {
    stage.clear();
    if (task) prefetchScript(toldOf(saidOf(task).payload), 'taskPrompt', taskLang);
  }, [session.index]); // eslint-disable-line react-hooks/exhaustive-deps

  // A solved task: its help, if still up, has done its job.
  useEffect(() => {
    if (session.justSolved && stage.play?.kind === 'help') stage.clear();
  }, [session.justSolved]); // eslint-disable-line react-hooks/exhaustive-deps

  // The help has come up — the shell's or the board's: into sight, once it has opened out.
  useEffect(() => {
    if (stage.play?.kind !== 'help') return;
    const t = window.setTimeout(bringIntoSight, 350);
    return () => window.clearTimeout(t);
  }, [stage.round, stage.play?.kind]); // eslint-disable-line react-hooks/exhaustive-deps

  // Help without a script: the module's how-to, read out.
  useEffect(() => {
    if (!session.hintActive || phase !== 'play' || !task) return;
    const t = window.setTimeout(() => {
      bringIntoSight();
      const how = module?.getHintSpeech?.(saidOf(task));
      // A help told as a script keeps the floor: whatever we said here would cut it off.
      if (how === undefined) return;
      if (how) sayHint('game.hint.with', { how });
      else sayHint('game.hint.plain');
    }, 120);
    return () => window.clearTimeout(t);
  }, [session.hintActive, session.index, phase]); // eslint-disable-line react-hooks/exhaustive-deps
}
