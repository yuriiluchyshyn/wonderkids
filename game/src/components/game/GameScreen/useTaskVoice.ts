import { useEffect } from 'react';
import { useVoiceSpeak } from '@/core/audio/useSpeech';
import { saidOf, spokenPrompt } from '@/core/game/kernel/types';
import type { LangCode } from '@/core/language';
import type { GameSession, Phase } from './types';

/**
 * Voice-First: the intro is read once when its screen opens, and every task
 * is read out when it appears — keyed by its place in the level, not its id,
 * so the repeat of a missed task is read again like any other. Nothing is
 * said while the rest screen covers the game (`blocked`).
 */
export function useTaskVoice({ phase, session, taskLang, introSpeech, blocked }: { phase: Phase; session: GameSession; taskLang: LangCode; introSpeech?: string; blocked: boolean }) {
  const speakPrompt = useVoiceSpeak('taskPrompt');
  const speakIntro = useVoiceSpeak('taskIntro');
  const { task } = session;

  useEffect(() => {
    if (phase === 'intro' && introSpeech && !blocked) speakIntro(introSpeech, session.langs.said);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase === 'play' && task && !session.finished && !blocked) speakPrompt(spokenPrompt(saidOf(task)), taskLang);
  }, [session.index, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  /** The task read out again (its speaker, a tap on its picture). */
  return () => {
    if (task) speakPrompt(spokenPrompt(saidOf(task)), taskLang);
  };
}
